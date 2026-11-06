import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, TextInput } from "react-native";

/**
 * El terminali okutma alanı: alan hep odakta kalır, yazılım klavyesi yalnızca
 * kullanıcı alana dokununca açılır. Klavye kapanınca başa döner; böylece
 * okutma sonrası `focus()` çağrıları klavyeyi yeniden açmaz.
 *
 * Dönen değerler TextInput'a yayılır.
 */
export function useManualKeyboard(inputRef: RefObject<TextInput | null>) {
  const [keyboardAllowed, setKeyboardAllowed] = useState(false);
  const focusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardAllowed(false),
    );
    return () => {
      hide.remove();
      if (focusTimer.current) clearTimeout(focusTimer.current);
    };
  }, []);

  const onPressIn = useCallback(() => {
    if (keyboardAllowed) return;
    setKeyboardAllowed(true);
    // Alan zaten odakta olduğu için dokunuş tek başına klavyeyi açmayabilir;
    // ayar native tarafa geçtikten sonra odağı yenilemek klavyeyi gösterir.
    focusTimer.current = setTimeout(() => {
      inputRef.current?.blur();
      inputRef.current?.focus();
    }, 50);
  }, [keyboardAllowed, inputRef]);

  return { showSoftInputOnFocus: keyboardAllowed, onPressIn };
}
