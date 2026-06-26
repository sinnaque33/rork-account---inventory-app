export function redirectSystemPath({
  path,
}: {
  path: string;
  initial: boolean;
}) {
  // Gelen derin bağlantıyı (deep link) olduğu gibi koru; Expo Router'ın
  // varsayılan davranışı budur. Bilinmeyen yollar +not-found ekranına düşer.
  return path;
}
