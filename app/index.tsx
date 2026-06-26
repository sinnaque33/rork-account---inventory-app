import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  // Oturum kontrolü (token + kullanıcı geri yükleme) bitene kadar bekle.
  // Bu sırada splash ekranı görünür durumda kalır (bkz. app/_layout.tsx).
  if (isLoading) {
    return null;
  }

  // Geçerli oturum varsa doğrudan panele, yoksa girişe yönlendir.
  return <Redirect href={isAuthenticated ? '/(app)/dashboard' : '/login'} />;
}
