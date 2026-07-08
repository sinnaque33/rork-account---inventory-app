import { useCallback, useEffect, useRef } from "react";
import { Vibration } from "react-native";
import { Audio } from "expo-av";
import { useApiConfig } from "@/contexts/ApiConfigContext";
import { SOUND_FILES } from "@/constants/sounds";

/**
 * Hata sinyali (titreşim + ayarlardaki hata sesi).
 *
 * Sesi bir kez yükler ve tekrar tekrar çalar; her hatada yeni bir
 * Audio.Sound instance'ı yaratıp `didJustFinish`'e bel bağlamaz. Ekran
 * kapanırken veya ses ayarı değişirken native ses kaynağı serbest bırakılır
 * (önceki kullanımda ses bitmeden unmount olunca instance sızıyordu).
 *
 * Kullanım:
 *   const playErrorSignal = useErrorSignal();
 *   ...
 *   playErrorSignal();
 */
export function useErrorSignal() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const { errorSound } = useApiConfig();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (errorSound === "vibration" || !SOUND_FILES[errorSound]) {
        return;
      }
      try {
        const { sound } = await Audio.Sound.createAsync(
          SOUND_FILES[errorSound],
        );
        if (cancelled) {
          // Yükleme bitmeden ekran kapandıysa hemen bırak.
          sound.unloadAsync();
          return;
        }
        soundRef.current = sound;
      } catch (e) {
        console.log("useErrorSignal: Ses yüklenemedi:", e);
      }
    })();

    return () => {
      cancelled = true;
      soundRef.current?.unloadAsync();
      soundRef.current = null;
    };
  }, [errorSound]);

  return useCallback(() => {
    Vibration.vibrate(500);
    soundRef.current?.replayAsync().catch((e) => {
      console.log("useErrorSignal: Ses çalma hatası:", e);
    });
  }, []);
}
