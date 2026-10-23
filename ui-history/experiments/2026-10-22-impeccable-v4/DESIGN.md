# Öneri 04 · Ana temanın akış renkleri

**Onay bekliyor. Ana koda uygulanmadı.** Kullanıcı koli listesi, koli detayı, irsaliye oluşturma ve barkod okutma ekranlarını “iç karartıcı” buldu ve ana temadan ayrılmadan iyileştirilmesini istedi. Bu revizyon yalnız bu dört ekranı içerir. Diğer ekranlar önceki önerilerden gösterilir. Önceki öneriler, `versions/` arşivi ve uygulama kaynakları değişmedi.

## Bulgu

Koyu zemin sorun değildi. Sorun, önceki önerilerde (v1–v3) uygulamanın kendi temasında renk taşıyan öğelerin de kaldırılmasıydı:
- Ana Sayfa'nın kırmızı ve çivit gradyan kartları,
- koli kartlarındaki kırmızı ikon zemini,
- irsaliye düğmesinin çivit rengi,
- barkod ekranının kırmızı odak öğesi.

Geriye neredeyse tamamen gri yüzeyler ve tek bir vurgu kaldı. Satırlar zemine çizgiyle ayrıldığı için ekran tek parça koyu bir alan gibi okunuyordu.

## Yön

Impeccable `colorize` + `bolder`, Operate modu. Yeni renk icat edilmedi. `constants/theme.ts`, Ana Sayfa ve kaynak ekranlarda zaten bulunan renk görevleri geri getirildi ve tutarlı hale getirildi:

| Renk | Görev | Nerede |
| --- | --- | --- |
| Extreme kırmızısı | Koli akışı ve marka | Koli ikon kutuları, sipariş bağlam kartı, Yeni Koli |
| Çivit (`info`) | İrsaliye akışı | Seçili koliler, onay kutuları, irsaliye düğmesi, İrsaliye Oluştur ikonu |
| Yeşil | Ekleme ve tamamlama | Malzeme Ekle, hazır barkod alanı, miktarlar, Kapalı, Gönder, Koli Kapatma |
| Amber | Açık koli | Açık rozeti, Koli Açma ikonu |
| Hata kırmızısı | Silme | Koli sil, Malzeme Sil ikonu |

**İmza öğe: Ana Sayfa'daki gradyan kart.**
- Barkod ekranında ve koli detayında sipariş bağlamı, Ana Sayfa'daki Koli Listesi kartıyla aynı kırmızı gradyan karta taşındı.
- Barkod kartında, Ana Sayfa filigranındaki Extreme şevronu kullanıldı. Koli detayındaki kartta şevron yoktur; dokunulabilir kartta ileri oku gibi okunuyordu.
- Kırmızı gölge yalnız Yeni Koli'de bulunur. Bu, kaynak uygulamadaki ana FAB'ın gölgesidir (`0 6px 24px`, `#DA2128` %35).
- Diğer kartlar gölgesiz yüzey basamaklarıyla ayrılır. Açık temada hafif nötr gölge kullanılır.

Kullanıcının daha önce istediği gibi koliler ayrı kartlardadır. v3'ün okunabilirlik ölçüleri korunur:
- koli no 20 px,
- müşteri 16 px,
- ürün adı 20 px,
- miktar 24 px,
- yardımcı bilgiler 14 px.

Açık temada gri sayfa üzerinde beyaz kartlar kullanılır. Koyu temada kartlar zeminden bir basamak yüksek yüzey ve belirgin kenarlıkla ayrılır.

## Ekran kararları

| Ekran | Karar |
| --- | --- |
| Koli Listesi | Kartın üst kısmında kırmızı koli kutusu, koli no, müşteri ve sevkiyat notu yer alır. Alt şeritte ikonlu Sipariş ve Depo bilgileri bulunur. Sipariş no nötr renkte; kırmızı metin hata gibi okunabildiği için kullanılmadı. Gezinme oku nötr. |
| Koli Detayı | Sipariş kartı kırmızı gradyan; Yeni Koli beyaz hap düğme ve sipariş açıklaması kart genişliğinde. Malzeme Ekle seçiliyken düğme dolu yeşil, barkod alanı yeşil çerçeveli. Ürünler kartlarda, miktar yeşil alanda. Alt işlemlerde Yazdır nötr, İrsaliye ikonu çivit, Koli Açma ikonu amber, Koli Kapatma yeşil. |
| İrsaliye Oluştur | Ekran seçim modunda çizildi: iki kapalı koli seçili. Başlık kaynak koddaki gibi “2 Koli Seçildi” ve temizle (X). Seçili kartta çivit zemin ve çerçeve, onay kutusu dolu çivit. Durum rozetlerinde nokta ve metin birlikte. Alt düğme kaynak metniyle: “Seçilenleri İrsaliye Yap (2)”. |
| Barkod Okutma | Kırmızı gradyan kartta başlık, talimat, sipariş no ve cari yer alır. Barkod alanı 22 px sabit genişlikli yazı ve yeşil “hazır” çerçeve kullanır. Gönder yeşil. |

## Bilinçli sınırlar

- **Koli listesinde Açık/Kapalı rozeti yok.** `KoliItem` tipinde durum alanı bulunmuyor. Fixture'da olsa da liste API'si için bu bilgi iddia edilmedi.
- **Yeni özellik eklenmedi.** Renk adına göre renk örneği, toplam adet gibi yeni hesaplar veya yeni özellikler yoktur.
- **İrsaliye seçim rengi değişti.** Seçili kart kaynakta kırmızıydı; irsaliye düğmesiyle aynı akış rengi olsun diye çivit önerildi.
- **Gönder ve Koli Kapatma yeşil.** Kaynakta kırmızıydılar; yeşil, ikinci önerinin onay rengi rolünden gelir.
- **Barkod ekranının alt boşluğu bırakıldı.** Bu alan gerçek kullanımda açılan klavyenin yeridir.
- **`SipExp` bölünür.** Değer listede fixture'daki ayraçtan müşteri ve not olarak bölünür (v3 ile aynı).

## Doğrulama

`node ui-history/tools/check-themes.cjs --vibrance --screens-only` dört ekranı iki temada denetler:
- viewport, tema zemini, yerel font ve yatay taşma,
- kayıt sayıları (7 koli, 4 ürün, 2 seçili, fixture'daki durumlar),
- yazı ölçüleri ve metnin sığması,
- 44 px dokunma hedefleri ve kaydırma sonu,
- normal metin için 4,5:1 kontrast.

Görüntüleyici testleri v4'ün bu dört ekranda, önceki önerilerin diğer ekranlarda seçildiğini doğrular. Sonuçlar `validation.json` içindedir.

Impeccable mekanik taraması çalıştırıldı:
- Çivit gölge ve düğme iç boşluğu uyarıları giderildi.
- Kırmızı gölge uyarısı ana temanın FAB gölgesi olduğu için bilinçli olarak kabul edildi.

HTML'ler scriptsiz tasarım önerileridir. Ekran görüntüleri yalnız tasarım incelemesi için geçici olarak alındı; arşive eklenmedi. Native cihazda piksel eşitliği doğrulanmadı.
