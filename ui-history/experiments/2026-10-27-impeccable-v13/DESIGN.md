# Öneri 13 · Açık tema renkleri

**Onay bekliyor. Ana koda uygulanmadı.** Yalnız açık temanın renkleri. Koyu tema değişmedi (kullanıcı: “siyah tema için iyileştirmeler fena değil”).

Görüntüleyicinin bütün ekranlarda v13'ü göstermesi için ekranlar güncel önerilerinden taşındı: Ana Sayfa, Koli Listesi, Koli Detayı, Sipariş Seçimi, Barkod Okutma ve altı durum v12'den; İrsaliye Oluştur v9'dan; Giriş, Ayarlar, Koli Oluştur v8'den. Hepsi v12'nin tokenlarını kullanır. Bu yüzden v12'nin yazı tipi kararı (kodlar sabit genişlikli yazı tipinden çıktı) İrsaliye'ye ve v8 ekranlarına da geçti. Giriş'teki “Güvenli kurumsal kimlik doğrulama” satırı uygulamadaki gibi kaldırıldı.

## Açık temada ne bozuktu

- **Sayfa ve kart ters:** Ana Sayfa, Ayarlar ve Koli Oluştur'da beyaz sayfada gri kartlar; koli ekranlarında gri sayfada beyaz kartlar.
- **Kartlar sayfadan ayrılmıyordu:** kart gölgesi bir önceki revizyonda kapatılmıştı (`--v4-card-shadow: none`). #f2f1f4 sayfada beyaz kartı yalnız #e2dfe6'lık soluk bir çizgi ayırıyordu.
- **Yazılar morumsu griydi:** #5e5768, #554d60; koyu ile soluk yazı arasındaki fark zayıftı.
- **Başarı bildirimi:** #e2e2e5'lik düz gri bir blok; ne kart ne uyarı gibi okunuyordu.
- **Grup başlıkları:** (#f7f6f9) satırlardan zor ayrılıyordu.

## Düzeltme

| Rol | Önce | Şimdi |
| --- | --- | --- |
| Sayfa | #ffffff / #f2f1f4 (ekrana göre) | #eef0f3, her ekranda |
| Kart, alan, başlık çubuğu | #f5f5f7 / #ffffff | #ffffff |
| Kart çizgisi | #e2dfe6 | #d3d7de |
| Kart gölgesi | yok | 1–2 px ve 6 px yumuşak, %5–6 |
| Ana yazı | #1c1921 | #14161b |
| İkincil yazı | #5e5768 / #554d60 | #474d57 (beyazda ~8.6:1) |
| Soluk yazı, yer tutucu | #686170 | #5a606b (~6.3:1) |
| Alan çerçevesi | #85808d | #7a808b (≥3:1) |
| Grup başlığı bandı | #f7f6f9 | #f5f6f8, alt çizgi #e2e5ea |
| Yeşil miktar | #11663e | #0b6337 |
| Bildirim | gri #e2e2e5 | beyaz kart, çizgi ve gölge |

- **Ayarlar'daki seçim kutusu:** gri yuva içinde seçili seçenek beyaz ve hafif gölgeli. Önceden seçili olan daha koyu griydi.
- **Durum çubuğu** başlık çubuğuyla aynı beyaz; gri sayfa başlığın altından başlar.
- **Giriş ekranı** beyaz sayfada kalır: logonun zemini beyaz, gri sayfada kutu gibi duruyordu. Giriş alanları açık gri zeminli.
- **Değişmeyenler:** kırmızı, çivit ve yeşil marka renkleri, sipariş kartının kırmızı geçişi, karolar.

## Uygulamaya aktarılırsa

`constants/theme.ts` içindeki açık tema değerleri bu tabloya göre değişir. Ekran düzenleri değişmez.

## Doğrulama

- `node ui-history/tools/verify.cjs`: geçti.
- `node ui-history/tools/check-themes.cjs`: geçti; görüntüleyici dokuz ekranın hepsinde v13'ü gösterir.
- Impeccable taraması: bilinen `dark-glow` (Yeni Koli ışıması) ve v8'den gelen hata bildirimi `cramped-padding`.
- Açık temada Ana Sayfa, Giriş, Ayarlar, Koli Listesi, Koli Detayı (başarılı durum dahil), Sipariş Seçimi ve İrsaliye ekran görüntüsüyle kontrol edildi; koyu Koli Listesi değişmedi.

Yeniden üretim: `node ui-history/tools/build-light-theme-revision.cjs --replace`.
