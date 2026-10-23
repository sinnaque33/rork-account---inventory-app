# Impeccable önerisi 01 · 16 Ekim 2026

**Durum: Kullanıcı onayı bekleniyor.** Uygulama koduna uygulanmadı.
Kaynak arşiv: `versions/2026-10-15`. Profil: 390×844, Android, Türkçe, koyu tema, klavye kapalı. Aynı `fixtures.json` verileri kullanılır.

## Yön

Impeccable `polish` ve `operate` yaklaşımı: depo operasyonlarında hızlı tarama ve açık eylemler. Extreme logosu, koyu yüzeyler, kırmızı ana eylem, Roboto ve Lucide korunur. Yardımcı metinler daha açık; düğme kırmızısı beyaz etiketin okunabilirliği için koyulaştırıldı. Renk yalnızca eylem veya durum açıklarken kullanılır. Dekoratif gradyanlar ve filigran azaltıldı. Boş alanı doldurmak için yeni istatistik ya da özellik eklenmedi.

Tokenlar bu klasörün `tokens.css` dosyasındadır. Ekran HTML'lerinde sabit renk/spacing ve script yoktur. Ortak stil kuralları da bu CSS'te tutulur; yerel fontlar ve logo değişmez arşiv varlıklarına referans verir.

## Ekran kararları

| Ekran | Öneri ve onay konusu |
| --- | --- |
| Giriş | Logo, başlık, etiketli alanlar ve giriş düğmesi aynı hizaya alındı. Hatırlatma açıklaması okunabilir hale getirildi. Mevcut kimlik doğrulama metni ve örnek kullanıcı korundu. |
| Ayarlar | Görünüm, bağlantı/depo ve çalışma tercihleri gruplandı. API Ayarları başlığı daha geniş içeriği karşılayan Ayarlar oldu. Checkbox'lar kapalı anahtar görünümünde; ayarlar hâlâ Kaydet ile uygulanacak şekilde tasarlandı. Açıklamaların anlamı korunarak metinler kısaltıldı. |
| Ana Sayfa | Tek başlık, kullanıcı selamlaması ve iki hızlı erişim. Doygun büyük paneller ve dekoratif filigran yerine nötr yüzeyler; çıkış eylemi sağ üstte. |
| Koli Listesi | Koli numarası birincil, sipariş numarası ve müşteri/depo ikincil. Tüm kayıtlar aynı. Kaydırma üzerindeki ikon FAB'ları etiketli alt işlem alanına taşındı. Sayaç yalnızca sabit fixture'daki yedi kaydı ifade eder; canlı toplam API iddiası yoktur. |
| Koli Detayı | Sipariş bağlamı ve yeni koli eylemi korunur. Ürün miktarı, renk, beden, stok ve birim görünür. 2×2 alt eylem düzeni; Koli Kapatma kırmızı birincil düğme. Koli silme üstte ayrıdır. |
| Yeni Koli | Tek etkin sipariş seçeneği yatay, kompakt satır. Gizli Boş Koli seçeneği eklenmedi. |
| Sipariş Seçimi | Siparişten bağımsız seçenek ayrı, daha sakin bir alan. Altı sipariş numarası ve müşteri bilgisi aynı sırada. |
| İrsaliye Oluştur | Seçim kutuları solda; Açık/Kapalı rozetleri renk yanında metin içerir. Mevcut seçimsiz durumda sonraki adımı anlatan pasif alt eylem önerildi. Kaynaktaki seçimsiz ekran bu paneli göstermiyordu; bu bilinçli bir UX önerisidir. |
| Barkod Okutma | Sipariş özeti, etiketli barkod ve Gönder düğmesi kısa bir akışta. Büyük dekoratif merkez ikon kaldırıldı; barkod alanındaki işlevsel ikon korundu. Kamera eklenmedi. |

## İnceleme sınırı

Bunlar etkileşimsiz tasarım taslaklarıdır; form, arama, anahtar ve uygulama düğmeleri işlem yapmaz. Kaydırma ve viewer kontrolleri çalışır. Onay, uygulamaya otomatik aktarım başlatmaz. Native font metrikleri, klavye, gerçek veri uzunlukları, dokunma davranışı ve modal/hata durumları uygulama aşamasında ayrıca değerlendirilir. Sistem çubukları ve başlık yüksekliği ilk arşivin sabit profilini izler. Native cihazla piksel eşitliği iddia edilmez.

Ekran başına kısa notlar `meta.json → screenNotes` içinde tutulur ve viewer'ın üçüncü slotunda gösterilir. Sonraki denemeyi yeni bir klasörle kaydedin; bu öneriyi veya eski arşivi üzerine yazmayın.
