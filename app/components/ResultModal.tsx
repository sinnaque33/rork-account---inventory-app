import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CheckCircle2, AlertCircle } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import colors from "@/constants/colors";

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

  const getThemeColor = () => {
    if (type === "success") return "#4CAF50";
    if (type === "warning") return "#FF9800";
    return "#F44336";
  };

  const themeColor = getThemeColor();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.resultModalOverlay}>
        <View style={styles.resultModalContent}>
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

const styles = StyleSheet.create({
  resultModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.90)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  resultModalContent: {
    backgroundColor: colors.background.card,
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 28,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.default,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  resultIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontFamily: "Segoe UI",
    fontWeight: "700",
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 12,
  },
  resultMessage: {
    fontSize: 15,
    fontFamily: "Segoe UI",
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  resultCancelButton: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    width: "100%",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  resultCancelText: {
    fontSize: 16,
    fontFamily: "Segoe UI",
    fontWeight: "700",
    color: "#ffffff",
  },
});
