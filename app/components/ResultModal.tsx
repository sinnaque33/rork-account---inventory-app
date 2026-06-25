import React, { useMemo } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CheckCircle2, AlertCircle } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import type { Theme } from "@/constants/theme";

interface ResultModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: "success" | "error" | "warning";
}

export default function ResultModal({
  visible,
  onClose,
  title,
  message,
  type,
}: ResultModalProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const themeColor =
    type === "success"
      ? theme.colors.success
      : type === "warning"
        ? theme.colors.warning
        : theme.colors.error;

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.resultModalOverlay}>
        <View style={[styles.resultModalContent, { borderTopColor: themeColor }]}>
          <View
            style={[
              styles.resultIconContainer,
              { backgroundColor: `${themeColor}1A` },
            ]}
          >
            {type === "success" ? (
              <CheckCircle2 size={52} color={themeColor} />
            ) : (
              <AlertCircle size={52} color={themeColor} />
            )}
          </View>

          <Text style={styles.resultTitle}>{title}</Text>

          <Text style={styles.resultMessage}>{message}</Text>

          <TouchableOpacity
            style={[styles.resultCancelButton, { backgroundColor: themeColor }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.resultCancelText}>
              {t("koliDetay.ok") || "Tamam"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (theme: Theme) => {
  const { colors, spacing, radius, type } = theme;
  return StyleSheet.create({
    resultModalOverlay: {
      flex: 1,
      backgroundColor: colors.scrim,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.xl,
    },
    resultModalContent: {
      backgroundColor: colors.surface1,
      borderRadius: radius.xxl,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xxl,
      paddingBottom: spacing.xl,
      width: "100%",
      maxWidth: 360,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.hairline,
      borderTopWidth: 4,
    },
    resultIconContainer: {
      width: 72,
      height: 72,
      borderRadius: radius.pill,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.lg,
    },
    resultTitle: {
      ...type.headline,
      color: colors.ink,
      textAlign: "center",
      marginBottom: spacing.sm,
    },
    resultMessage: {
      ...type.body,
      color: colors.inkMuted,
      textAlign: "center",
      marginBottom: spacing.xl,
    },
    resultCancelButton: {
      borderRadius: radius.md,
      paddingVertical: 14,
      paddingHorizontal: spacing.xxl,
      alignItems: "center",
      width: "100%",
      minHeight: 48,
      justifyContent: "center",
    },
    resultCancelText: {
      ...type.button,
      color: "#ffffff",
    },
  });
};
