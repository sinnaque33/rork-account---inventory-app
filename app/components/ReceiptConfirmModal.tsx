import React, { useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { FileText } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import type { Theme } from "@/constants/theme";

interface ReceiptConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  itemCount?: number;
}

export default function ReceiptConfirmModal({
  visible,
  onClose,
  onConfirm,
  isLoading,
  itemCount = 1,
}: ReceiptConfirmModalProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.receiptModalOverlay}>
        <View style={styles.receiptModalContent}>
          <View style={styles.receiptIconContainer}>
            <FileText size={48} color={theme.colors.primary} />
          </View>
          <Text style={styles.receiptModalTitle}>
            {t("koliDetay.modals.receiptTitle")}
          </Text>

          {/* Adet bilgisine göre dinamik alt başlık */}
          <Text style={styles.receiptModalSubtitle}>
            {itemCount > 1
              ? `${itemCount} adet koli için irsaliye oluşturulacak. Onaylıyor musunuz?`
              : t("koliDetay.modals.receiptSubtitle")}
          </Text>

          <View style={styles.receiptModalButtons}>
            <TouchableOpacity
              style={styles.receiptCancelButton}
              onPress={onClose}
            >
              <Text style={styles.receiptCancelText}>
                {t("koliDetay.cancel")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.receiptConfirmButton,
                isLoading && styles.disabledButton,
              ]}
              onPress={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.colors.onPrimary} />
              ) : (
                <Text style={styles.receiptConfirmText}>
                  {t("koliDetay.create")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (theme: Theme) => {
  const { colors, spacing, radius, type } = theme;
  return StyleSheet.create({
    receiptModalOverlay: {
      flex: 1,
      backgroundColor: colors.scrim,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.xl,
    },
    receiptModalContent: {
      backgroundColor: colors.surface1,
      borderRadius: radius.xxl,
      padding: spacing.xl,
      width: "100%",
      maxWidth: 340,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.hairline,
    },
    receiptIconContainer: {
      width: 80,
      height: 80,
      borderRadius: radius.pill,
      backgroundColor: colors.primaryTint,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.lg,
    },
    receiptModalTitle: {
      ...type.headline,
      color: colors.ink,
      textAlign: "center",
      marginBottom: spacing.sm,
    },
    receiptModalSubtitle: {
      ...type.body,
      color: colors.inkMuted,
      textAlign: "center",
      marginBottom: spacing.xl,
    },
    receiptModalButtons: {
      flexDirection: "row",
      gap: spacing.sm,
      width: "100%",
    },
    receiptCancelButton: {
      flex: 1,
      backgroundColor: colors.surface2,
      borderRadius: radius.md,
      padding: 14,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.hairlineStrong,
    },
    receiptCancelText: {
      ...type.button,
      color: colors.ink,
    },
    receiptConfirmButton: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      padding: 14,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    receiptConfirmText: {
      ...type.button,
      color: colors.onPrimary,
    },
    disabledButton: {
      opacity: 0.6,
    },
  });
};
