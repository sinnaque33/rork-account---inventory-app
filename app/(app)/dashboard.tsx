import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { BookUser, FileText, LogOut, Package, Boxes } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import colors from '@/constants/colors';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleNavigation = (route: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(route as any);
  };

  const handleLogout = async () => {
    console.log('DashboardScreen: Logout pressed');
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await logout();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.darker, colors.background.dark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.firstName || user?.userName}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.logoutButtonPressed,
              ]}
              onPress={handleLogout}
              testID="logout-button"
            >
              <LogOut size={20} color="#fff" />
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
          <Text style={styles.sectionTitle}>Quick Access</Text>

          <View style={styles.cardGrid}>
          <Pressable
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            onPress={() => handleNavigation('/(app)/koli-listesi')}
            testID="koli-listesi-card"
          >
            <LinearGradient
              colors={['#B71C1C', '#8B0000']}
              style={styles.cardGradient}
            >
              <View style={styles.cardIcon}>
                <Boxes size={32} color="#fff" strokeWidth={2} />
              </View>
              <Text style={styles.cardTitle}>Koli Listesi</Text>
              <Text style={styles.cardSubtitle}>View package list</Text>
              <View style={styles.cardArrow}>
                <FileText size={16} color="#fff" opacity={0.6} />
              </View>
            </LinearGradient>
          </Pressable>

          {/* Hidden menu items - kept for future use
          <Pressable
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            onPress={() => handleNavigation('/(app)/accounts')}
            testID="accounts-card"
          >
            <LinearGradient
              colors={[colors.button.primary, '#B71C1C']}
              style={styles.cardGradient}
            >
              <View style={styles.cardIcon}>
                <BookUser size={32} color="#fff" strokeWidth={2} />
              </View>
              <Text style={styles.cardTitle}>Current Account</Text>
              <Text style={styles.cardSubtitle}>View all accounts</Text>
              <View style={styles.cardArrow}>
                <FileText size={16} color="#fff" opacity={0.6} />
              </View>
            </LinearGradient>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            onPress={() => handleNavigation('/(app)/inventory')}
            testID="inventory-card"
          >
            <LinearGradient
              colors={['#DC143C', '#8B0000']}
              style={styles.cardGradient}
            >
              <View style={styles.cardIcon}>
                <Package size={32} color="#fff" strokeWidth={2} />
              </View>
              <Text style={styles.cardTitle}>Inventory</Text>
              <Text style={styles.cardSubtitle}>Manage stock items</Text>
              <View style={styles.cardArrow}>
                <FileText size={16} color="#fff" opacity={0.6} />
              </View>
            </LinearGradient>
          </Pressable>
          */}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  header: {
    paddingBottom: 32,
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text.primary,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.button.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonPressed: {
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text.primary,
    marginBottom: 16,
  },
  cardGrid: {
    gap: 16,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cardGradient: {
    padding: 20,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text.primary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.text.primary,
    opacity: 0.8,
  },
  cardArrow: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
});
