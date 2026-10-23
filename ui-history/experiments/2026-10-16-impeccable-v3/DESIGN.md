# Öneri 03 · Koli ekranlarında okunabilirlik

**Onay bekliyor. Ana koda uygulanmadı.** Kullanıcı koli listesi ve koli detayını okumakta zorlandığını belirtti. Bu revizyon yalnız bu iki ekranı içerir; diğer yedi ekran ikinci öneriden gösterilir. Önceki öneriler korunur.

## Bulgular ve yön

Impeccable `typeset`, Operate modu. Yerleşik Roboto korunur; Roboto Mono yalnız kodlar ve miktar için kullanılır. Önceki CSS'te `.box-row h2` ve `.item-main h2` 15 px, `.receipt` ve ürün alan etiketleri 12 px, depo ve diğer yardımcı alanlar 13 px idi. Yaklaşık 0,79 ölçekli viewer'da bunlar daha küçük algılanıyordu. İlk mekanik tipografi taraması bulgu vermedi; sorun kaynak ölçüleri ve bilgi yerleşiminin birlikte değerlendirilmesiyle belirlendi.

Öncelik sırası: koli/ürün kimliği → müşteri veya miktar → sipariş, varyant ve stok/depo bilgileri. Yeni başlık ve miktar rolleri boyutla; ikincil roller boşluk, ağırlık ve tonla ayrılır. Dar telefon ölçüsünde uzun metinler kesilmeden satır kırar. Veri değişmez; rahat okuma için ekranda aynı anda daha az kayıt görünmesi bilinçli tercihtir.

| Rol | Önce | Yeni |
| --- | --- | --- |
| Koli numarası | 15 px | 20 px, 650 ağırlık |
| Müşteri adı | 14 px | 16 px, 550 ağırlık |
| Sipariş / depo | 12–13 px | 14 px, açık etiketli satırlar |
| Ürün adı | 15 px; miktarla daralan satır | 20 px, 650 ağırlık; tam satır |
| Miktar | 20 px | 24 px; ayrı yeşil alan |
| Renk / beden değeri | 13 px | 16 px |
| Ürün etiketleri / stok | 12–13 px | 14 px |

Koli satırlarında müşteri ile sevkiyat açıklaması ayrı gösterilir; fixture'daki `SipExp` değeri mevcut ayıracından bölünür. Sipariş ve depo açıkça etiketlenir. Kayıt sınırları ince ayraç ve dönüşümlü yüzeylerle belirtilir. Ürünlerde tam başlığın altında renk/beden ve miktar, son satırda stok kodu yer alır. Üst sipariş bağlamındaki iki yüksek satır birleştirilerek ürünlere daha fazla alan ayrılır. Yeni Koli ve siparişin kolilerine erişim korunur. Dört alt eylem aynı anlam ve renklerle kalır.

Yeni metin rolleri `--read-*` tokenlarıyla tanımlıdır. İki temada da yardımcı metinler daha kuvvetli ton kullanır; satır aralığı çoğu bilgi alanında 1,55, ürün adlarında 1,5'tir. İşlem ve durum renkleri önceki önerideki kırmızı/yeşil rollerini korur. Yeni veri, durum veya işlev eklenmedi.

## Doğrulama ve sınırlar

`node ui-history/tools/check-themes.cjs --readability`: iki ekran × iki tema; metin ölçüleri, kontrast, yatay taşma, tüm kayıtlar, kaydırma sonu ve ürün okuma alanı. Viewer'da bu iki ekranın üçüncü öneriyi, diğerlerinin ikinci öneriyi seçmesi; tema/fallback, tam boy görünüm, dar ekran ve tercih saklama kontrol edilir. Sonuçlar `validation.json` içindedir. Statik envanter `tools/verify.cjs` ile denetlenir.

HTML'ler scriptsiz tasarım önerileridir. Ekran görüntüsü alınmaz; kontroller DOM/yerleşim ölçümüne dayanır. Native cihazda piksel eşitliği veya dinamik yazı ölçekleme doğrulanmamıştır. Kullanıcı tam boy okumak için viewer'daki Büyüt düğmesini kullanabilir.
