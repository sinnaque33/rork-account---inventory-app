import { ChevronRight, FileText, PackagePlus } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Stack } from "expo-router";
import { useMemo } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import type { Theme } from "@/constants/theme";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";

// "Boş Koli" (barkodsuz koli oluşturma) seçeneği şimdilik gizli; kod ileride
// lazım olabileceği için duruyor. Geri getirmek için true yapmak yeterli.
// Aynı akış koli listesindeki (+) FAB'ına basılı tutunca hâlâ erişilebilir.
const SHOW_EMPTY_BOX_OPTION: boolean = false;

export default function CreateKoliScreen() {
  const { push } = useSafeNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <>
      <Stack.Screen
        options={{
          title: t("createKoli.headerTitle"),
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.title}>{t("createKoli.title")}</Text>
            <Text style={styles.subtitle}>
              {SHOW_EMPTY_BOX_OPTION
                ? t("createKoli.subtitle")
                : t("createKoli.subtitleSingle")}
            </Text>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => {
                  console.log("CreateKoli: Navigating to order-receipts");
                  push("/(app)/order-receipts");
                }}
                activeOpacity={0.7}
                testID="receipt-barcode-button"
              >
                <View style={styles.iconTile}>
                  <FileText size={24} color={theme.colors.koliInk} />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>
                    {t("createKoli.orderOptionTitle")}
                  </Text>
                  <Text style={styles.optionDescription}>
                    {t("createKoli.orderOptionDesc")}
                  </Text>
                </View>
                <ChevronRight size={20} color={theme.colors.inkSubtle} />
              </TouchableOpacity>

              {SHOW_EMPTY_BOX_OPTION && (
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => {
                    console.log(
                      "CreateKoli: Navigating to order-receipts (empty box)",
                    );
                    push({
                      pathname: "/(app)/order-receipts",
                      params: { mode: "create_empty" },
                    });
                  }}
                  activeOpacity={0.7}
                  testID="empty-koli-button"
                >
                  <View style={styles.iconTile}>
                    <PackagePlus size={24} color={theme.colors.koliInk} />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>
                      {t("createKoli.emptyOptionTitle")}
                    </Text>
                    <Text style={styles.optionDescription}>
                      {t("createKoli.emptyOptionDesc")}
                    </Text>
                  </View>
                  <ChevronRight size={20} color={theme.colors.inkSubtle} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const makeStyles = (theme: Theme) => {
  const { colors, spacing, radius, type } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      padding: spacing.lg,
    },
    title: {
      ...type.pageTitle,
      color: colors.ink,
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...type.body,
      color: colors.inkMuted,
      marginBottom: spacing.xl,
    },
    buttonsContainer: {
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    optionButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      backgroundColor: colors.card,
      borderRadius: radius.control,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.cardLine,
      ...theme.cardShadow,
    },
    iconTile: {
      width: 48,
      height: 48,
      borderRadius: radius.control,
      backgroundColor: colors.koliTile,
      alignItems: "center",
      justifyContent: "center",
    },
    optionText: {
      flex: 1,
      minWidth: 0,
    },
    optionTitle: {
      ...type.bodyLg,
      fontWeight: "700",
      color: colors.ink,
    },
    optionDescription: {
      ...type.hint,
      color: colors.inkMuted,
      marginTop: spacing.xxs,
    },
  });
};
