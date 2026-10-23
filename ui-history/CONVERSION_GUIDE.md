# Kaynak koddan UI arşivine dönüşüm

Bu arşiv uygulamanın çalışan kaynak kodunun görsel kaydıdır. Yeniden tasarım değildir. Ekran görüntüsü kullanılmaz; ekranlar HTML/CSS ve gerçek SVG ikonlarıyla yeniden çizilir. Uygulama kaynakları yalnızca okunur. Tüm çıktılar `ui-history/` altında kalır.

## Sabit cihaz ve görünüm

- Viewport: **390 × 844 logical px**, portre; Android görsel profili, yazı ölçeği 1.
- Üst sistem alanı 24 px, alt hareket alanı 24 px, native stack başlığı 56 px. Bunlar gerçek bir cihaz ölçümü değil, tüm sürümlerde aynı kalacak arşiv profilidir.
- Dil Türkçe; ilk arşivin kayıtlı teması koyu. Viewer dış arayüzü koyu kalır; üstteki açık/koyu düğmesi yalnız telefon içeriklerini ve tam boy önizlemeyi değiştirir. Açık görünüm, kaynak kayıt üzerine yazılmadan `previews/` altında kendi tokenlarıyla türetilir; bu yeni bir uygulama sürümü sayılmaz. Logo ve Ayarlar tema seçimi de seçili temaya uyar.
- Saat 09:41, pil ve bağlantı işaretleri sabittir. Klavye kapalıdır. `autoFocus` klavye açmaz.
- Varsayılan, veri yüklenmiş durum çizilir. Boş, yükleniyor, hata, basılı, çoklu seçim ve geçici bildirim durumları ilk arşive dahil değildir. Modallar kapalıdır.
- Native stack başlığı ile ekranın kendi başlığı ayrı öğelerdir. Kaynakta ikisi de varsa ikisi de korunur; kaynak görünümü iyileştirme amacıyla sadeleştirilmez.

## Kaynak önceliği ve token'lar

1. İlgili ekranın JSX yapısı, koşulları, `makeStyles(theme)` sonucu ve inline stilleri.
2. `constants/theme.ts`, `contexts/ThemeContext.tsx`, layout dosyaları ve `locales/tr.json`.
3. `DESIGN-extreme.md` yalnızca yardımcı açıklamadır. Kodla çelişirse kod geçerlidir. Kullanılmayan `constants/colors.ts` aktarılmaz.

Her sürümün `tokens.css` dosyası kendi renk, spacing, radius, tipografi, boyut, gölge ve cihaz token'larını taşır. HTML içindeki stil kurallarında sabit renk veya spacing kullanılmaz. Kaynaktaki token dışı sabitler de kaynak değeri korunarak CSS değişkenine dönüştürülür. `0`, yüzde, flex oranı, SVG geometrisi ve birimsiz değerler renk/spacing sabiti sayılmaz. Kaynağın renk kontrastı veya dokunma hedefleri arşivleme sırasında değiştirilmez.

## RN → HTML/CSS

| RN öğesi / davranışı | HTML karşılığı |
| --- | --- |
| View | `div.rn-view`: `display:flex; flex-direction:column; flex-shrink:0; align-items:stretch` |
| Text | `span.rn-text` veya semantik metin öğesi; iç içe Text inline kalır; tarayıcı varsayılan margin'leri sıfırlanır |
| Image / expo-image | Yerel `img`; contain/cover → `object-fit`; kaynak ölçüleri korunur |
| ScrollView | Flex içinde `min-height:0; overflow-y:auto`; contentContainerStyle ayrı iç div'e uygulanır |
| FlatList | Aynı mock sırayla statik kartlar, kaydırılabilir liste; sanallaştırma ve sonsuz yükleme yok |
| Pressable / TouchableOpacity | Kaynak görünümünde statik düğme; işlem yapmaz, basılı durum çizilmez |
| TextInput | Salt okunur input/textarea; native padding/border/font özellikleri açıkça eşlenir; klavye ve caret kapalı |
| KeyboardAvoidingView | Klavye kapalı sabit flex kapsayıcı |
| LinearGradient | Kaynak durakları ve yönüyle CSS linear-gradient |
| absoluteFill / absolute | Uygun relative ebeveyn içinde absolute; kaynak kenar değerleri korunur |
| flex:1 | `flex-grow:1; flex-shrink:1; flex-basis:0%`; scroll zincirinde min-height:0 |
| numberOfLines | Tek satırda ellipsis; çok satırda line-clamp; kaynak satır sayısı korunur |

Tüm öğelerde `box-sizing:border-box`. RN'nin varsayılan column yönü ve `flexShrink:0` davranışı korunur. `paddingHorizontal/Vertical`, `marginHorizontal/Vertical` iki CSS kenarına açılır. RN lineHeight logical px olarak aktarılır. Tarayıcının heading/button/input varsayılan stilleri kullanılmaz.

## Fontlar ve ikonlar

- Kaynak şu anda özel font paketlemiyor: Android `sans-serif` / `monospace`, iOS `System` / `Menlo`. Dokümandaki Inter, Space Grotesk ve JetBrains Mono mevcut uygulama fontları değildir.
- Android arşiv profilinde yerel Roboto ve monospace karşılığı kullanılır. Font dosyaları `assets/fonts/` altındadır, `@font-face` sürümün tokens.css dosyasında tanımlanır. Kaynak, lisans ve kesin dosya kimliği assets/fonts/README.md içinde kaydedilir. Sistem metin rasterizasyonu ve monospace eşlemesi sapma olarak açıklanır.
- Lucide ikonları **kurulu 0.475.0 paketinin** gerçek path/line/circle/rect/polyline geometrilerinden inline SVG olarak aktarılır. Stroke width, boyut, renk ve opacity kaynaktan gelir. Emoji veya başka ikon ailesiyle değiştirilmez.
- Dashboard chevron'u kaynak SVG path'leriyle; marka logoları mevcut PNG dosyalarının değişmez kopyalarıyla aktarılır. Bunlar ekran görüntüsü değildir.

## Native karşılıklar

- Status bar ve alt hareket göstergesi sabit HTML/SVG karşılıktır. Stack başlığı Android profiline göre çizilir; otomatik native başlık hesaplaması çalıştırılmaz.
- Switch/picker/tab bar bu ilk kaynakta kullanılmıyor. Sonraki sürümlerde eklenirse sabit seçili durum, aynı cihaz profiline uygun HTML/CSS ile çizilir; tarayıcının platforma göre değişen kontrol görünümüne bırakılmaz.
- Modal ilk sürümde kapalıdır. İleride ayrı slug ile arşivlenirse sabit backdrop, konum ve kaynak içerik kullanılır; açılış animasyonu yoktur.
- Native shadow/elevation CSS box-shadow ile yaklaşık eşlenir. Native klavye, haptik, ses, gesture, toast animasyonu ve ağ işlemleri arşivde çalışmaz.

## Mock veri sözleşmesi

`fixtures.json` arşivin değişmez başlangıç veri setidir. Kullanıcı, koli, sipariş ve ürün kimlikleri ekranlar arasında tutarlıdır. Gerçek hesap/şifre veya üretim API verisi kullanılmaz. Yeni sürümlerde aynı fixture kullanılır; veri şeması zorunlu değişirse nedenini sürüm notuna yazın ve eski fixture'ı değiştirmeden yeni bir dosya ekleyin.

- login: örnek kullanıcı, maskeli parola, beni hatırla açık.
- settings: örnek API/şirket bilgileri; koyu/Türkçe, varsayılan seçenekler.
- dashboard: fixture kullanıcısı.
- koli-listesi / irskoli-listesi: dolu listeler, arama ve seçim kapalı.
- koli-detay: ilk listedeki açık koli, sipariş bağlantısı, dolu ürünler, ekleme modu; API görseli olmayan ürünlerin mevcut Package fallback'i.
- create-koli: `SHOW_EMPTY_BOX_OPTION=false`; yalnızca etkin sipariş seçeneği.
- order-receipts: normal mod, dolu siparişler ve bağımsız koli kartı.
- barcode-scanner: `create_from_order`, ilk sipariş, örnek barkod; klavye kapalı. Kaynak kamera kullanmıyor.

## Bağımsızlık ve sürümleme

- Her ekran yalnızca `../tokens.css` ve `../../../assets/...` kullanır. Ekran HTML'inde JS yoktur; CDN, fetch, API, dış font veya resim isteği yoktur.
- Paylaşılan asset dosyaları değişmezdir. Yeni logo/font için yeni dosya adı kullanın; eski dosyayı üzerine yazmayın.
- Sürüm klasörü `YYYY-MM-DD` formatındadır. Yayınlanmış tarih klasörü değiştirilmez. Aynı gün ikinci kayıt gerekiyorsa mevcut tarih formatı için önce açık bir sürüm kimliği politikası kararlaştırın; sessizce üzerine yazmayın.
- `meta.json`: date, gitCommit, appVersion, note, changedScreens. Ek `screenNotes` alanı ekran bazında değişiklik notu tutabilir.
- `manifest.js`, `window.UI_HISTORY = { screens, versions }` atamasıdır. `versions[].files` fiziksel olarak mevcut HTML slug'larını listeler; `changedScreens` değişiklik açıklamasıdır. Viewer dosya varlığını fetch ile tahmin etmez.
- Seçilen tarihte ekran yoksa **o tarihe eşit veya daha eski, dosyayı içeren en son sürüm** bulunur. HTML o sürüm klasöründen açılır; token'ları da o sürümden gelir. Gelecek tarihten dosya alınmaz. Önceki dosya yoksa açık bir bulunamadı durumu gösterilir.
- Tema/token değişikliği bir ekranın görünümünü etkiliyorsa o ekranın HTML'i yeni sürümde de yer almalıdır; aksi halde eski HTML kendi eski token'larını kullanmayı sürdürür.
- İlk sürüm tüm dokuz ekranı içerir. Sonraki sürümlerde yalnızca değişen ekranların HTML'leri eklenebilir. `note` genel, `screenNotes` ekran bazında değişiklikleri anlatır.

## Kontrol

Her sürümde yerel asset bağlantıları, token referansları, 390×844 ölçü, metinler ve kaynak koşulları kontrol edilir. Viewer aynı/farklı tarih, geçmiş sürüme fallback, hash geri yükleme, temizleme, tam boy önizleme, dar görünüm ve tema değişimiyle sınanır. Görsel sapmalar README'de ekran bazında dürüstçe tutulur. Gerçek cihaz karşılaştırması yapılmadıysa piksel eşitliği doğrulandığı iddia edilmez.
