import * as Haptics from "expo-haptics";
import { Stack } from "expo-router";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { useTranslation } from "react-i18next";
import {
  Boxes,
  ChevronRight,
  LogOut,
  Truck,
} from "lucide-react-native";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import type { Theme } from "@/constants/theme";
import { useMemo } from "react";

export default function DashboardScreen() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { push } = useSafeNavigation();

  const handleNavigation = (route: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    push(route as any);
  };

  const handleLogout = async () => {
    if (Platform.OS !== "web") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await logout();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.logoutButtonPressed,
              ]}
              onPress={handleLogout}
              accessibilityRole="button"
              accessibilityLabel={t("dashboard.logout")}
              testID="logout-button"
            >
              <LogOut size={24} color={theme.colors.ink} />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.content}>
          <View style={styles.greetingBlock}>
            <Text style={styles.greeting} numberOfLines={1}>
              {t("dashboard.greeting")}
            </Text>
            <Text style={styles.userName} numberOfLines={2}>
              {user?.firstName || user?.userName}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>{t("dashboard.quickAccess")}</Text>

          <View style={styles.cardGrid}>
            {/* 1. KART: Koli Listesi */}
            <Pressable
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
              onPress={() => handleNavigation("/(app)/koli-listesi")}
              testID="koli-listesi-card"
            >
              <View style={[styles.cardIcon, styles.cardIconKoli]}>
                <Boxes size={24} color={theme.colors.koliInk} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>
                  {t("dashboard.boxListTitle")}
                </Text>
                <Text style={styles.cardSubtitle}>
                  {t("dashboard.boxListSubtitle")}
                </Text>
              </View>
              <ChevronRight size={20} color={theme.colors.inkSubtle} />
            </Pressable>

            {/* 2. KART: İrsaliye Oluştur */}
            <Pressable
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
              onPress={() => handleNavigation("/(app)/irskoli-listesi")}
              testID="irsaliye-olustur-card"
            >
              <View style={[styles.cardIcon, styles.cardIconIrs]}>
                <Truck size={24} color={theme.colors.irsInk} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>
                  {t("dashboard.createWaybillTitle") || "İrsaliye Oluştur"}
                </Text>
                <Text style={styles.cardSubtitle}>
                  {t("dashboard.createWaybillSubtitle") ||
                    "Kolileri seçerek yeni irsaliye oluşturun"}
                </Text>
              </View>
              <ChevronRight size={20} color={theme.colors.inkSubtle} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (theme: Theme) => {
  const { colors, spacing, radius, type } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    logoutButton: {
      width: 48,
      height: 48,
      borderRadius: radius.pill,
      alignItems: "center",
      justifyContent: "center",
    },
    logoutButtonPressed: {
      backgroundColor: colors.surface2,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: spacing.xl,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
    },
    greetingBlock: {
      paddingTop: spacing.md,
      paddingBottom: spacing.xxl,
    },
    greeting: {
      ...type.body,
      color: colors.inkMuted,
      marginBottom: spacing.xxs,
    },
    userName: {
      ...type.pageTitle,
      color: colors.ink,
    },
    sectionTitle: {
      ...type.labelStrong,
      color: colors.inkMuted,
      marginBottom: spacing.md,
    },
    cardGrid: {
      gap: spacing.md,
    },
    // Sabit minHeight iki kartı aynı boyda tutar: alt metni iki satıra inen
    // kart da bu yüksekliğe sığar.
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      minHeight: 112,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.cardLine,
      borderRadius: 16,
      ...theme.cardShadow,
    },
    cardPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.98 }],
    },
    cardIcon: {
      width: 48,
      height: 48,
      borderRadius: radius.control,
      alignItems: "center",
      justifyContent: "center",
    },
    cardIconKoli: {
      backgroundColor: colors.koliTile,
    },
    cardIconIrs: {
      backgroundColor: colors.irsTile,
    },
    cardText: {
      flex: 1,
      minWidth: 0,
    },
    cardTitle: {
      ...type.screenTitle,
      color: colors.ink,
      marginBottom: spacing.xs,
    },
    cardSubtitle: {
      ...type.bodySm,
      color: colors.inkMuted,
      lineHeight: 20,
    },
  });
};
