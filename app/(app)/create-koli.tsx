import { ShoppingCart } from 'lucide-react-native';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import colors from '@/constants/colors';



export default function CreateKoliScreen() {
  const router = useRouter();




  return (
    <>
      <Stack.Screen
        options={{
          title: 'Yeni Koli',
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
            <Text style={styles.title}>Malzeme Ekleme</Text>
            <Text style={styles.subtitle}>Malzeme ekleme şeklini seçiniz</Text>

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
                <Text style={styles.optionTitle}>Sipariş</Text>
                <Text style={styles.optionDescription}>
                  Siparişten malzeme ekleme
                </Text>
              </TouchableOpacity>
            </View>


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

});
