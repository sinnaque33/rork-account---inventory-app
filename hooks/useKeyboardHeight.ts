import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

/**
 * Açık yazılım klavyesinin yüksekliği; kapalıyken 0.
 *
 * Mutlak konumlu bildirimleri KeyboardAvoidingView taşımaz: iOS'taki padding
 * mutlak çocukları etkilemez, Android'de edge-to-edge pencereyi küçültmez.
 */
export function useKeyboardHeight() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (event) =>
      setHeight(event.endCoordinates.height),
    );
    const hide = Keyboard.addListener("keyboardDidHide", () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return height;
}
