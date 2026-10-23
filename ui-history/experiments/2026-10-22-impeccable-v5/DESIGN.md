# Öneri 05 · Barkod okutma ve sipariş seçiminde hafif iyileştirme

**Onay bekliyor. Ana koda uygulanmadı.** Kullanıcının iki isteği var:
- Barkod okutma ekranı orijinal uygulamadakine benzesin, yalnız hafif iyileştirilsin.
- Sipariş seçimi biraz iyileştirilsin.

Bu revizyon yalnız bu iki ekranı içerir. Barkod ekranının v4 önerisi (kırmızı gradyan kart) silinmedi ama artık gösterilmez. Koli listesi, koli detayı ve irsaliye ekranları v4'te kalır.

Impeccable `polish`, Operate modu. Tokenlar v4'ten devralınır.

## Barkod Okutma

Kaynak düzen korunur:
- üst bant (kapat, başlık, ana sayfa),
- ortadaki tarama dairesi,
- “Siparişten Koli Aç” başlığı,
- ortalanmış barkod alanı,
- kırmızı Gönder.

İçerik orijinaldeki gibi dikeyde ortalanır.

| Önce | Sonra | Neden |
| --- | --- | --- |
| Cari ve fiş tek satırda: “Marmara Tekstil A.Ş. - (Fiş: SIP-2026-0148)” | Fiş numarası ikonlu etikette, sabit genişlikli yazıyla; cari adı ayrı satırda | İki bilgi ayrı okunur. Numara makine verisi olduğu için sabit genişlikli. |
| “İlk ürünü okutun” alt başlıkta | Barkod alanının hemen üstünde, alanın etiketi | Talimat eylemin yanında durur. |
| Barkod 18 px orantılı yazı | 22 px sabit genişlikli, harf aralıklı | Ürün etiketindeki numarayla karşılaştırmak kolaylaşır. |
| Tarama dairesi gri | Kırmızı tonlu zemin ve ince kırmızı halka | Marka sıcaklığı eklenir; ikon ve ölçü aynı kalır. |
| Ana sayfa düğmesi dolu kırmızı | Tonlu kırmızı | Ekrandaki tek dolu kırmızı düğme Gönder olur. |
| Üst bant, durum çubuğunun altında fazladan boşlukla | Bant durum çubuğuyla birleşir, düğmeler 8 px aşağıda | Cihazdaki görünümle aynı. |

**Kırmızı odak çerçevesi denendi ve kaldırıldı.** Bu temada hata durumu da kırmızı. Bu yüzden okutulmuş geçerli bir barkod “hatalı” gibi okunuyordu. Alan orijinaldeki gibi sade bırakıldı.

## Sipariş Seçimi

Kaynak yapı korunur: arama, sipariş bağlantısız koli seçeneği ve sipariş kartları. Kart, arama ve renk dili v4 koli listesiyle aynıdır.

| Önce | Sonra |
| --- | --- |
| “Fiş: SIP-2026-0148”, 17 px | “SIP-2026-0148”, 20 px sabit genişlikli (koli listesindeki koli numarasıyla aynı rol). Fiş bilgisini kutudaki fiş ikonu taşır. |
| Cari adı 13 px, soluk | 16 px, ana metin renginde, en fazla iki satır |
| Siparişsiz koli kartı: 2 px kırmızı çerçeve, iki satıra kırılan başlık, fiş ikonu | Kırmızı tonlu kart, koli ekleme ikonu, tek satır başlık. Listenin en baskın öğesi değil. |
| Seçenek ile sipariş listesi arasında ayrım yok | “6 sipariş” sayacı ikisini ayırır |

Siparişsiz koli seçeneğinde fiş ikonu yerine koli ekleme ikonu kullanıldı. Bu seçenek bir fişi değil, yeni bir koliyi temsil eder. Metinler kaynaktaki çeviri anahtarlarıyla aynıdır. Yalnız “Fiş:” ön eki kaldırıldı; istenirse geri eklenir.

## Doğrulama

`node ui-history/tools/check-themes.cjs --scan-order --screens-only` iki ekranı iki temada denetler:
- ortalanmış düzen, fixture barkodu ve 22 px barkod,
- fiş etiketi, 6 sipariş ve siparişsiz seçenek,
- 20/16 px yazılar, 64 px satırlar ve 44 px dokunma hedefleri,
- taşma, kaydırma ve 4,5:1 kontrast.

Görüntüleyici testi hangi ekranda hangi önerinin seçildiğini doğrular:
- bu iki ekranda v5,
- koli ve irsaliye ekranlarında v4,
- Yeni Koli ekranında v2.

Impeccable taraması:
- Durum çubuğu iç boşluğu uyarısı giderildi.
- Kalan kırmızı gölge uyarısı, v4'ten devralınan token dosyasındaki FAB gölgesidir; bu iki ekranda kullanılmaz.

HTML'ler scriptsiz tasarım önerileridir. Ekran görüntüleri yalnız inceleme için geçici olarak alındı. Native cihazda doğrulanmadı.
