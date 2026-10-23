---
target: ui-history görüntüleyicisindeki AI iyileştirme ekranları (9 ekran)
total_score: 212
max_score: 356
na_heuristics: 9
p0_count: 0
p1_count: 6
target_identity: "file:/mnt/c/Users/ACER/Desktop/koliapp/ui-history/viewer/index.html"
target_fingerprint: "sha256:344856e209c890bb7fa5aa68e2995332c3d5914a8bc8674f964b62b5c2816c6b"
target_path: /mnt/c/Users/ACER/Desktop/koliapp/ui-history/viewer/index.html
timestamp: 2026-10-22T15-10-30Z
slug: ui-history-viewer-index-html
---
# Kritik · görüntüleyicideki 9 AI ekranı (2026-10-22)

Yöntem: dual-agent (A: bağımsız tasarım incelemesi · B: Impeccable dedektörü + headless tarayıcı ölçümü). Kaynaklar: login/settings/dashboard/create-koli = v2; koli-listesi/koli-detay/irskoli-listesi = v4; barcode-scanner/order-receipts = v5.

## Nielsen puanları (1 durum · 2 gerçek dünya · 3 kontrol · 4 tutarlılık · 5 önleme · 6 tanıma · 7 esneklik · 8 sadelik · 9 kurtulma · 10 yardım)

| Ekran | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | Toplam |
|---|---|---|---|---|---|---|---|---|---|---|---|
| login | 2 | 3 | 3 | 2 | 3 | 3 | 2 | 3 | 1 | 2 | 24/40 |
| settings | 2 | 2 | 2 | 2 | 2 | 3 | 2 | 3 | 1 | 3 | 22/40 |
| dashboard | 2 | 3 | 3 | 1 | 3 | 3 | 1 | 3 | 2 | 2 | 23/40 |
| create-koli | 2 | 2 | 3 | 2 | 3 | 3 | 1 | 2 | n/a | 2 | 20/36 |
| koli-listesi | 2 | 2 | 3 | 3 | 3 | 3 | 2 | 2 | 2 | 2 | 24/40 |
| koli-detay | 2 | 3 | 3 | 2 | 2 | 3 | 3 | 2 | 2 | 2 | 24/40 |
| irskoli-listesi | 3 | 3 | 2 | 2 | 1 | 1 | 2 | 3 | 2 | 2 | 21/40 |
| barcode-scanner | 2 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 2 | 3 | 28/40 |
| order-receipts | 3 | 2 | 3 | 3 | 2 | 3 | 3 | 3 | 2 | 2 | 26/40 |

Toplam 212/356 (%60). create-koli için 9 n/a (başarısız olabilecek işlem yok).

## Özgüllük
LLM: kısmen özgün (mono makine kodları, v4 akış renkleri, barkod alanı çapa, nokta+kelime rozetleri), çoğunlukla jenerik (6 ekranda aynı ikon karosu+başlık+alt satır+chevron kartı; marka şevronu hiçbir öneride yok).
Dedektör: CLI 11 dark-glow; 1 gerçek (koli-listesi koyu "Yeni Koli" ışıması = izinli FAB ışıması, iki kez raporlanıyor), 9 paylaşılan stil dosyası yanlış pozitifi. Sayfa içi: aynı ışıma + barcode icon-tile-stack (120px daire, orijinalden). Kontrast hatası yok (en düşük 4,68). 34 hedef <48dp. v2'de 12–13px metin. Ölçümün ek bulguları: koli-detay sipariş bağlantısı 26px; ayar anahtarları "Kapalı" adlı; irsaliye işaretli kutu/satır 2,55:1. Overlay: yok (headless).

## Ekranlar arası
- X1 [P1] Renk anlamı aşırı yüklü (yeşil ~7 anlam, kırmızı marka+koli+süs+silme; Koli sil = ürün karosu). Küçük: silme zeminsiz tema hata kırmızısı, karo ikonları marka kırmızısı, miktar nötr zemin+yeşil sayı, giriş onay/kilit yeşil değil. Karar: Kaydet/Gönder/Malzeme Ekle renk kuralı.
- X2 [P1] Ana Sayfa akışlarla çelişiyor (irsaliye yeşil vs çivit; v4 imzası gradyan kartlar Ana Sayfa'da yok). Küçük: çivit karo, ›. Karar: gradyan kartlar.
- X3 [P1] Okutma sonucu, bekleme, boş/eşleşmeyen/hata, giriş/ayar hataları, çoklu seçim, silme modu, pasif düğmeler çizilmemiş. Karar (harden).
- X4 [P2] v2 ayrışması: açık tema yüzey mantığı ters, 12–13px metin, 32/20/16px kenar. Küçük: 14px. Karar: yüzey/kenar birleştirme.
- X5 [P2] Kırmızı #cc2434/#c62132 ≠ tema #DA2128; çivit #5250e0 ≠ #5B5BF0. Küçük: tema değerleri.
- X6 [P2] 44px hedefler, 26px sipariş bağlantısı, yanlış roller, odak yok. Küçük: 48px + roller. Port notu: odak.
- X7 [P3] Eskimiş notlar (kırmızı sipariş no, şevron filigranı, iki satır sınırı). Küçük: notlar + satır sınırı.

## Ekran ekran öncelikli sorunlar
login: [P2] hata durumları yok (Karar); [P2] yeşil onay/kilit (Küçük); [P3] 44px dişli, göz hedefi yok (Küçük); [P3] 12–13px (Küçük). Persona: Casey klavye Giriş'i örter; Sam "Beni hatırla" onay kutusu değil.
settings: [P2] Kaydet en sonda, kaydedilmedi durumu yok (Karar); [P2] alan gruplaması (Küçük: orijinal sıra); [P2] çift olumsuz (Karar); [P3] bölüm başlığı=etiket (Küçük); [P3] anahtar adları (Küçük). Persona: Riley çift olumsuz; Casey çıkışta uyarı yok.
dashboard: [P1] irsaliye yeşil (Küçük); [P1] v4 yönü yok (Karar); [P2] ↗ (Küçük); [P2] kısayol yok (Karar); [P3] selamlama baskın (Küçük). Persona: Jordan renk; Sam başlık sırası.
create-koli: [P2] tek seçenekli ara ekran (Karar); [P2] tek eylem en zayıf öğe (Küçük); [P3] sepet vs fiş (Küçük); [P3] alt başlık çelişkisi (Karar). Persona: Alex zorunlu adım.
koli-listesi: [P2] yoğunluk ~193px (Küçük); [P2] "7 koli" sayfa sayısı (Karar); [P2] "Depo" iddiası (Karar); [P2] çoklu seçim/siparişsiz koli durumları (Karar); [P3] kırmızı Barkod ikonu (Küçük). Persona: Casey uzun basma keşfedilemez.
koli-detay: [P1] açık/kapalı durumu yok, iki kilit eylemi aktif (Karar); [P1] yeşil yükü (Küçük: miktar; Karar: mod); [P2] hiyerarşi ters (Karar); [P2] listeye yer yok (Küçük); [P3] Koli sil = ürün karosu (Küçük); ölçüm: sipariş bağlantısı 26px (Küçük). Bilişsel yük yüksek: 10 eylem tek karar noktasında. Persona: Riley yanlış dokunuş.
irskoli-listesi: [P1] satırda sipariş/cari yok (Karar); [P2] açık koli seçilebilir (Karar); [P2] iki çıkış (Karar); [P2] seçim rengi farkı (Karar); [P3] kutu yarıçapı (Küçük). Persona: Riley karışık seçim.
barcode-scanner: [P2] daire kamera düğmesi gibi (Küçük: nötr); [P2] klavye Gönder'i örter (port notu); [P2] sonuç durumları (Karar); [P3] talimat zayıf (Küçük); [P3] 44px (Küçük). Persona: Jordan daireyi kamera sanır.
order-receipts: [P2] siparişsiz seçenek uyarı gibi (Küçük); [P2] olumsuz başlık (Karar); [P3] istisna başta (Karar); [P3] durumlar yok (Karar); [P3] kırmızı tonu (Küçük). Persona: Casey yanlış dokunuş.

## Sorular
- Bir okutmadan 300 ms sonra ekran neye benziyor?
- Ana Sayfa'da tek düğme olsaydı "koli okut" olmaz mıydı?
- Bir irsaliye tek müşteri ise liste siparişe göre gruplanmalı mı?
