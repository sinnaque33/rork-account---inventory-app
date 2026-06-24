import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  FileText,
  LogOut,
  Boxes,
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
  const router = useRouter();

  const handleNavigation = (route: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(route as any);
  };

  const handleLogout = async () => {
    if (Platform.OS !== "web") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await logout();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.surface1, theme.colors.canvas]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{t("dashboard.greeting")}</Text>
              <Text style={styles.userName}>
                {user?.firstName || user?.userName}
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.logoutButtonPressed,
              ]}
              onPress={handleLogout}
              testID="logout-button"
            >
              <LogOut size={20} color={theme.colors.ink} />
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.content}>
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
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDeep]}
                style={styles.cardGradient}
              >
                <View style={styles.cardIcon}>
                  <Boxes size={32} color="#fff" strokeWidth={2} />
                </View>
                <Text style={styles.cardTitle}>
                  {t("dashboard.boxListTitle")}
                </Text>
                <Text style={styles.cardSubtitle}>
                  {t("dashboard.boxListSubtitle")}
                </Text>
                <View style={styles.cardArrow}>
                  <FileText size={16} color="#fff" opacity={0.6} />
                </View>
              </LinearGradient>
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
              <LinearGradient
                colors={[theme.colors.info, theme.colors.infoDeep]}
                style={styles.cardGradient}
              >
                <View style={styles.cardIcon}>
                  <Truck size={32} color="#fff" strokeWidth={2} />
                </View>
                <Text style={styles.cardTitle}>
                  {t("dashboard.createWaybillTitle") || "İrsaliye Oluştur"}
                </Text>
                <Text style={styles.cardSubtitle}>
                  {t("dashboard.createWaybillSubtitle") ||
                    "Kolileri seçerek yeni irsaliye oluşturun"}
                </Text>
                <View style={styles.cardArrow}>
                  <FileText size={16} color="#fff" opacity={0.6} />
                </View>
              </LinearGradient>
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
    header: {
      paddingBottom: spacing.xxl,
    },
    headerContent: {
      paddingHorizontal: spacing.xl,
      paddingTop: 64,
    },
    headerTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    greeting: {
      ...type.body,
      color: colors.inkMuted,
      marginBottom: spacing.xxs,
    },
    userName: {
      ...type.displayLg,
      color: colors.ink,
    },
    logoutButton: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      backgroundColor: colors.surface2,
      borderWidth: 1,
      borderColor: colors.hairlineStrong,
      alignItems: "center",
      justifyContent: "center",
    },
    logoutButtonPressed: {
      backgroundColor: colors.surface3,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: spacing.xl,
    },
    content: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
    },
    sectionTitle: {
      ...type.screenTitle,
      color: colors.ink,
      marginBottom: spacing.md,
    },
    cardGrid: {
      gap: spacing.md,
    },
    card: {
      borderRadius: radius.lg,
      overflow: "hidden",
    },
    cardPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.98 }],
    },
    cardGradient: {
      padding: spacing.lg,
      minHeight: 120,
      justifyContent: "space-between",
    },
    cardIcon: {
      width: 48,
      height: 48,
      borderRadius: radius.md,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.sm,
    },
    cardTitle: {
      ...type.cardTitle,
      fontSize: 18,
      color: "#FFFFFF",
      marginBottom: spacing.xxs,
    },
    cardSubtitle: {
      ...type.bodySm,
      color: "#FFFFFF",
      opacity: 0.85,
    },
    cardArrow: {
      position: "absolute",
      bottom: spacing.lg,
      right: spacing.lg,
    },
  });
};
