export function byteArrayToBase64(
  byteArray: number[] | Uint8Array | string | null | undefined,
): string | null {
  if (!byteArray) return null;

  if (typeof byteArray === "string") {
    return byteArray.trim().length > 0 ? byteArray : null;
  }

  if (Array.isArray(byteArray) || byteArray instanceof Uint8Array) {
    try {
      const bytes = Array.isArray(byteArray)
        ? new Uint8Array(byteArray)
        : byteArray;
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    } catch (e) {
      console.log("byteArrayToBase64: Error converting byte array", e);
      return null;
    }
  }

  return null;
}