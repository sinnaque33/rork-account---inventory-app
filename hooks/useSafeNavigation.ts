import { useCallback, useRef } from "react";
import { useFocusEffect, useRouter } from "expo-router";

/**
 * Çift dokunma / hızlı ardışık dokunmada aynı sayfanın iki kez açılmasını
 * engelleyen güvenli navigasyon hook'u.
 *
 * İlk push/replace çağrısı kilidi kapatır; sonraki çağrılar ekran tekrar
 * odağa gelene (geri dönülene) kadar yok sayılır. `useFocusEffect` kilidi
 * otomatik sıfırladığı için sabit bir bekleme süresine (setTimeout) gerek yoktur.
 *
 * Kullanım:
 *   const { push, replace } = useSafeNavigation();
 *   push({ pathname: "/(app)/sevk-islemleri", params: { type: "giris" } });
 *   push("/(app)/urun-sorgulama");
 */
export function useSafeNavigation() {
  const router = useRouter();
  const isNavigating = useRef(false);

  // Ekran tekrar odağa geldiğinde (geri dönüş) kilidi sıfırla.
  useFocusEffect(
    useCallback(() => {
      isNavigating.current = false;
    }, []),
  );

  const push = useCallback(
    (target: Parameters<typeof router.push>[0]) => {
      if (isNavigating.current) return;
      isNavigating.current = true;
      router.push(target);
    },
    [router],
  );

  const replace = useCallback(
    (target: Parameters<typeof router.replace>[0]) => {
      if (isNavigating.current) return;
      isNavigating.current = true;
      router.replace(target);
    },
    [router],
  );

  return { push, replace };
}
