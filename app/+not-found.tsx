import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AlertCircle } from "lucide-react-native";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import type { Theme } from "@/constants/theme";

export default function NotFoundScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <>
      <Stack.Screen options={{ title: t("notFound.headerTitle") }} />
      <View style={styles.container}>
        <AlertCircle size={64} color={theme.colors.inkSubtle} />
        <Text style={styles.title}>{t("notFound.title")}</Text>
        <Text style={styles.subtitle}>{t("notFound.subtitle")}</Text>

        <Link href="/login" style={styles.link}>
          <Text style={styles.linkText}>{t("notFound.goToLogin")}</Text>
        </Link>
      </View>
    </>
  );
}

const makeStyles = (theme: Theme) => {
  const { colors, spacing, radius, type } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.lg,
      backgroundColor: colors.canvas,
      gap: spacing.sm,
    },
    title: {
      ...type.headline,
      color: colors.ink,
      marginTop: spacing.md,
    },
    subtitle: {
      ...type.body,
      color: colors.inkMuted,
      textAlign: "center",
    },
    link: {
      marginTop: spacing.xl,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xl,
      backgroundColor: colors.primary,
      borderRadius: radius.lg,
    },
    linkText: {
      ...type.button,
      color: colors.onPrimary,
    },
  });
};
