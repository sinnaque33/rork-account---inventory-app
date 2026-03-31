import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Printer, FileText, CheckCircle, Save } from "lucide-react-native";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import colors from "@/constants/colors";
import { useApiConfig } from "@/contexts/ApiConfigContext";

interface PrintBarcodeModalProps {
  visible: boolean;
  onClose: () => void;
  koliId: string;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export default function PrintBarcodeModal({
  visible,
  onClose,
  koliId,
  onSuccess,
  onError,
}: PrintBarcodeModalProps) {
  const { printerName, updatePrinterName } = useApiConfig();
  const { t } = useTranslation();
  const { credentials } = useAuth();

  const [localPrinter, setLocalPrinter] = useState(printerName);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [isSavingPrinter, setIsSavingPrinter] = useState(false);

  const isModified = localPrinter.trim() !== printerName;

  useEffect(() => {
    setLocalPrinter(printerName);
  }, [printerName, visible]);

  // --- SADECE YAZICIYI KAYDETME FONKSİYONU ---
  const handleSavePrinter = async () => {
    if (!localPrinter.trim()) {
      onError(t("printModal.emptyPrinterError"));
      return;
    }
    setIsSavingPrinter(true);
    await updatePrinterName(localPrinter.trim());
    setIsSavingPrinter(false);
    onSuccess(t("printModal.printerSavedSuccess"));
  };

  // 1. Form Listesini Getiren Query
  const formsQuery = useQuery({
    queryKey: ["barcode-forms"],
    queryFn: async () => {
      if (!credentials) throw new Error("Giriş bilgileri eksik");
      return api.koliListesi.getBarcodeForms(
        credentials.userCode,
        credentials.password,
      );
    },
    enabled: !!credentials && visible,
  });

  // 2. Yazdırma İsteği Atan Mutation
  const printMutation = useMutation({
    mutationFn: async () => {
      if (!credentials || !koliId)
        throw new Error(t("printModal.missingInfoError"));
      if (!selectedForm) throw new Error(t("printModal.formNotSelectedError"));

      await updatePrinterName(localPrinter);

      return api.koliListesi.printBarcode(
        credentials.userCode,
        credentials.password,
        parseInt(koliId, 10),
        selectedForm,
        localPrinter,
      );
    },
    onSuccess: (data) => {
      onSuccess(data.msg || t("printModal.printStartedSuccess"));
      handleClose();
    },
    onError: (error) => {
      onError(
        error instanceof Error ? error.message : t("printModal.printError"),
      );
    },
  });

  const handleClose = () => {
    setSelectedForm(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.printModalOverlay}>
        <View style={styles.printModalContent}>
          <View style={styles.printModalHeader}>
            <Printer size={28} color={colors.button.primary} />
            <Text style={styles.printModalTitle}>{t("printModal.title")}</Text>
          </View>

          {/* --- MODERNİZE EDİLMİŞ INPUT VE BUTON SATIRI --- */}
          <View style={styles.printerInputContainer}>
            <Text style={styles.printerInputLabel}>
              {t("printModal.targetPrinter")}
            </Text>
            <View style={styles.printerInputRow}>
              <TextInput
                style={styles.printerInput}
                value={localPrinter}
                onChangeText={setLocalPrinter}
                placeholder={t("printModal.printerPlaceholder")}
                placeholderTextColor={colors.text.secondary}
              />
              <TouchableOpacity
                style={[
                  styles.savePrinterButton,
                  !isModified && styles.savePrinterButtonDisabled,
                ]}
                onPress={handleSavePrinter}
                disabled={!isModified || isSavingPrinter}
              >
                {isSavingPrinter ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Save
                    size={20}
                    color={isModified ? "#fff" : colors.text.secondary}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.formListTitle}>{t("printModal.selectForm")}</Text>

          {formsQuery.isLoading ? (
            <ActivityIndicator
              size="large"
              color={colors.button.primary}
              style={{ marginVertical: 20 }}
            />
          ) : formsQuery.isError ? (
            <Text
              style={{
                color: "#F44336",
                textAlign: "center",
                marginVertical: 10,
              }}
            >
              {t("printModal.formsLoadError")}
            </Text>
          ) : (
            <FlatList
              data={formsQuery.data}
              keyExtractor={(item, index) => item.Name || index.toString()}
              style={styles.formList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.formListItem,
                    selectedForm === item.Name && styles.formListItemSelected,
                  ]}
                  onPress={() => setSelectedForm(item.Name)}
                >
                  <FileText
                    size={20}
                    color={
                      selectedForm === item.Name
                        ? "#fff"
                        : colors.text.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.formListItemText,
                      selectedForm === item.Name &&
                        styles.formListItemTextSelected,
                    ]}
                  >
                    {item.Name}
                  </Text>
                  {selectedForm === item.Name && (
                    <CheckCircle size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text
                  style={{ textAlign: "center", color: colors.text.secondary }}
                >
                  {t("printModal.noActiveFormError")}
                </Text>
              }
            />
          )}

          <View style={styles.receiptModalButtons}>
            <TouchableOpacity
              style={styles.receiptCancelButton}
              onPress={handleClose}
            >
              <Text style={styles.receiptCancelText}>
                {t("printModal.cancelButton")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.receiptConfirmButton,
                (!selectedForm || printMutation.isPending) && { opacity: 0.6 },
              ]}
              onPress={() => printMutation.mutate()}
              disabled={!selectedForm || printMutation.isPending}
            >
              {printMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.receiptConfirmText}>
                  {t("printModal.printButton")}
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
  printModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  printModalContent: {
    backgroundColor: colors.background.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
    borderTopWidth: 1,
    borderColor: colors.border.default,
  },
  printModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  printModalTitle: {
    fontSize: 20,
    fontFamily: "Segoe UI",
    fontWeight: "700",
    color: colors.text.primary,
  },
  printerInputContainer: { marginBottom: 16 },
  printerInputLabel: {
    fontSize: 13,
    fontFamily: "Segoe UI",
    color: colors.text.secondary,
    marginBottom: 6,
  },
  printerInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  printerInput: {
    flex: 1,
    backgroundColor: colors.background.darker,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text.primary,
    fontFamily: "Segoe UI",
    fontSize: 15,
  },
  savePrinterButton: {
    backgroundColor: colors.button.primary,
    borderRadius: 10,
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  savePrinterButtonDisabled: {
    backgroundColor: colors.background.darker,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  formListTitle: {
    fontSize: 15,
    fontFamily: "Segoe UI",
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 10,
  },
  formList: { marginBottom: 20 },
  formListItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.darker,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: 12,
  },
  formListItemSelected: {
    backgroundColor: colors.button.primary,
    borderColor: colors.button.primary,
  },
  formListItemText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Segoe UI",
    color: colors.text.primary,
    fontWeight: "500",
  },
  formListItemTextSelected: { color: "#fff", fontWeight: "700" },
  receiptModalButtons: { flexDirection: "row", gap: 12, width: "100%" },
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
    backgroundColor: colors.button.primary,
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
});
