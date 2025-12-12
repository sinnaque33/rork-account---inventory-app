import { ShoppingCart, Package } from 'lucide-react-native';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import colors from '@/constants/colors';

type BarcodeType = 'item' | null;

export default function CreateKoliScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<BarcodeType>(null);
  const [barcode, setBarcode] = useState<string>('');

  const handleTypeSelect = (type: BarcodeType) => {
    setSelectedType(type);
    setBarcode('');
  };

  const handleBarcodeSubmit = () => {
    if (barcode.trim()) {
      console.log('CreateKoli: Barcode submitted:', barcode, 'Type:', selectedType);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Create New Koli',
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.title}>Add Item to Koli</Text>
            <Text style={styles.subtitle}>Choose how you want to add items</Text>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => {
                  console.log('CreateKoli: Navigating to order-receipts');
                  router.push('/(app)/order-receipts');
                }}
                activeOpacity={0.7}
                testID="receipt-barcode-button"
              >
                <View style={styles.iconCircle}>
                  <ShoppingCart size={32} color={colors.text.primary} />
                </View>
                <Text style={styles.optionTitle}>Order Receipt</Text>
                <Text style={styles.optionDescription}>
                  Add item from order receipt list
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  selectedType === 'item' && styles.optionButtonSelected,
                ]}
                onPress={() => handleTypeSelect('item')}
                activeOpacity={0.7}
                testID="item-barcode-button"
              >
                <View style={styles.iconCircle}>
                  <Package size={32} color={colors.text.primary} />
                </View>
                <Text style={styles.optionTitle}>Item Barcode</Text>
                <Text style={styles.optionDescription}>
                  Add item by scanning item barcode
                </Text>
              </TouchableOpacity>
            </View>

            {selectedType && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Item Barcode</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter or scan barcode"
                  placeholderTextColor={colors.text.secondary}
                  value={barcode}
                  onChangeText={setBarcode}
                  onSubmitEditing={handleBarcodeSubmit}
                  returnKeyType="done"
                  autoCapitalize="none"
                  autoCorrect={false}
                  testID="barcode-input"
                />
                <Text style={styles.inputHint}>
                  Type the barcode or use a connected barcode scanner
                </Text>

                {barcode.trim() && (
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleBarcodeSubmit}
                    activeOpacity={0.8}
                    testID="submit-barcode-button"
                  >
                    <Text style={styles.submitButtonText}>Add Item</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 32,
  },
  buttonsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border.default,
  },
  optionButtonSelected: {
    borderColor: colors.button.primary,
    backgroundColor: 'rgba(220, 20, 60, 0.05)',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.darker,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text.primary,
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputContainer: {
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text.primary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.background.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  inputHint: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 8,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: colors.button.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
