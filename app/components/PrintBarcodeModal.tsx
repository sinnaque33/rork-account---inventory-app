import React, { useEffect, useState, useMemo } from "react";
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
import { useTheme } from "@/contexts/ThemeContext";
import type { Theme } from "@/constants/theme";
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
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

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
            <Printer size={28} color={theme.colors.primary} />
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
                placeholderTextColor={theme.colors.inkSubtle}
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
                  <ActivityIndicator size="small" color={theme.colors.onPrimary} />
                ) : (
                  <Save
                    size={20}
                    color={isModified ? theme.colors.onPrimary : theme.colors.inkSubtle}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.formListTitle}>{t("printModal.selectForm")}</Text>

          {formsQuery.isLoading ? (
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
              style={{ marginVertical: 20 }}
            />
          ) : formsQuery.isError ? (
            <Text
              style={{
                color: theme.colors.error,
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
                        ? theme.colors.onPrimary
                        : theme.colors.inkSubtle
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
                    <CheckCircle size={20} color={theme.colors.onPrimary} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text
                  style={{ textAlign: "center", color: theme.colors.inkSubtle }}
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
                <ActivityIndicator size="small" color={theme.colors.onPrimary} />
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

const makeStyles = (theme: Theme) => {
  const { colors, spacing, radius, type } = theme;
  return StyleSheet.create({
    printModalOverlay: {
      flex: 1,
      backgroundColor: colors.scrim,
      justifyContent: "flex-end",
    },
    printModalContent: {
      backgroundColor: colors.surface1,
      borderTopLeftRadius: radius.xxl,
      borderTopRightRadius: radius.xxl,
      padding: spacing.xl,
      maxHeight: "80%",
      borderTopWidth: 1,
      borderColor: colors.hairline,
    },
    printModalHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    printModalTitle: {
      ...type.headline,
      color: colors.ink,
    },
    printerInputContainer: { marginBottom: spacing.md },
    printerInputLabel: {
      ...type.bodySm,
      color: colors.inkMuted,
      marginBottom: spacing.xxs,
    },
    printerInputRow: {
      flexDirection: "row",
      gap: spacing.xs,
    },
    printerInput: {
      ...type.body,
      flex: 1,
      backgroundColor: colors.surface2,
      borderWidth: 1,
      borderColor: colors.hairlineStrong,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      color: colors.ink,
    },
    savePrinterButton: {
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      width: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    savePrinterButtonDisabled: {
      backgroundColor: colors.surface2,
      borderWidth: 1,
      borderColor: colors.hairlineStrong,
    },
    formListTitle: {
      ...type.cardTitle,
      color: colors.ink,
      marginBottom: spacing.sm,
    },
    formList: { marginBottom: spacing.lg },
    formListItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface2,
      padding: spacing.md,
      borderRadius: radius.md,
      marginBottom: spacing.xs,
      borderWidth: 1,
      borderColor: colors.hairline,
      gap: spacing.sm,
    },
    formListItemSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    formListItemText: {
      ...type.body,
      flex: 1,
      color: colors.ink,
      fontWeight: "500",
    },
    formListItemTextSelected: { color: colors.onPrimary, fontWeight: "700" },
    receiptModalButtons: { flexDirection: "row", gap: spacing.sm, width: "100%" },
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
  });
};
