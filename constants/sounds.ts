export const SOUND_OPTIONS = [
  { id: "error_1", name: "Klasik Bip", file: require("@/assets/sounds/error_1.mp3") },
  // { id: "error_2", name: "Kalın Uyarı", file: require("@/assets/sounds/error_2.mp3") },
  // { id: "error_3", name: "Modern Klik", file: require("@/assets/sounds/error_3.mp3") },
  // { id: "error_4", name: "Hızlı İkaz", file: require("@/assets/sounds/error_4.mp3") },
  { id: "vibration", name: "Sadece Titreşim", file: null },
];

export const SOUND_FILES: Record<string, any> = SOUND_OPTIONS.reduce((acc, obj) => {
  acc[obj.id] = obj.file;
  return acc;
}, {} as Record<string, any>);