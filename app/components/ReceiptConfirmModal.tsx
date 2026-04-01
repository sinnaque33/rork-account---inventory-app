import React from "react";
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
            <FileText size={48} color="#DC143C" />
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
                <ActivityIndicator size="small" color="#fff" />
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

const styles = StyleSheet.create({
  receiptModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  receiptModalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 28,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DC143C",
  },
  receiptIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(220, 20, 60, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  receiptModalTitle: {
    fontSize: 22,
    fontFamily: "Segoe UI",
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  receiptModalSubtitle: {
    fontSize: 15,
    fontFamily: "Segoe UI",
    color: "#aaa",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  receiptModalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  receiptCancelButton: {
    flex: 1,
    backgroundColor: "#333",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#444",
  },
  receiptCancelText: {
    fontSize: 16,
    fontFamily: "Segoe UI",
    fontWeight: "600",
    color: "#fff",
  },
  receiptConfirmButton: {
    flex: 1,
    backgroundColor: "#DC143C",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  receiptConfirmText: {
    fontSize: 16,
    fontFamily: "Segoe UI",
    fontWeight: "600",
    color: "#fff",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
