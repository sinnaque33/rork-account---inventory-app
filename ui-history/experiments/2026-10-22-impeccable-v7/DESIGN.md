# Öneri 07 · Okutma sonuçları ve durumlar

**Onay bekliyor. Ana koda uygulanmadı.** Kullanıcı, okutmadan sonra başarılı ve hatalı durumda ne olduğunu göremediğini söyledi. Kritikte de bu anlar eksik olarak öncelik seçilmişti.

Bu revizyon v6'nın dokuz ekranını taşır; v6 değişmedi. Barkod Okutma ve Koli Detayı'na **durumlar** eklendi. Görüntüleyicide AI telefonunun altındaki **Durum** düğmeleriyle seçilirler; A slotu orijinal ekranı göstermeye devam eder. Durum dosyaları `states/<ekran>--<durum>.html` adıyla durur.

## Davranışın kaynağı

Çizimler uygulamanın bugünkü davranışına dayanır:
- `barcode-scanner.tsx`: başarılı okutmada yeni kolinin detayına geçiş, hatada `ResultModal`, gönderimde yükleniyor işareti.
- `koli-detay.tsx`: başarıda 2 sn'lik bildirim, hatada `ResultModal`, miktar aşımı ve sipariş dışı ürün penceresi.
- `useErrorSignal`: 500 ms titreşim ve Ayarlar'daki hata sesi.

Görsel dil marka dokümanının “Scan Feedback” bölümünden gelir:
- başarı ~350 ms tam ekran yeşil parlamadır ve sessizdir;
- hata tam ekran sıcak kırmızıdır (#FF3340), ses ve büyük ikonla gelir. Marka kırmızısı düğmelerden ölçek ve tonla ayrışır.

Metinler uygulamanın çeviri dosyalarındakilerdir: “İşlem Başarısız”, “Koli oluşturulurken hata meydana geldi.”, “Ürün eklendi”, “Başarılı”, “Miktar Aşımı”, “Hayır / Evet”. Sunucu açıklaması gereken iki yerde örnek metin kullanıldı ve notlarda belirtildi.

## Durumlar

| Ekran | Durum | Ne olur |
| --- | --- | --- |
| Barkod Okutma | Gönderiliyor | Gönder'de yükleniyor işareti, düğme pasif, alan kilitli ve soluk. |
| Barkod Okutma | Okutma başarılı | Yeni kolinin (KL-001255) detayı açılır; ilk ürün 1 adet; altta “Başarılı” bildirimi. |
| Barkod Okutma | Okutma hatalı | Tam ekran hata kırmızısı, X ikonu, “İşlem Başarısız”, neden ve okutulan barkod koyu panelde; Tamam en altta. |
| Koli Detayı | Okutma başarılı | ~350 ms tam ekran yeşil: onay işareti, “Eklendi”, yeni miktar (25 Adet), ürün ve varyant. Dokunma gerekmez. |
| Koli Detayı | Başarılı okutmadan sonra | Eklenen ürün yeşil çerçeveli ve 25.00; alttaki bildirim ürünü ve yeni miktarı söyler. |
| Koli Detayı | Okutma hatalı | Barkod Okutma'daki hata ekranıyla aynı dil; neden sunucunun açıklaması. |
| Koli Detayı | Miktar aşımı | Alttan açılan pencere: amber uyarı, uygulamadaki metin, okutulan barkod, “Hayır / Evet” başparmak bölgesinde. |

Uygulamadan farklar, hepsi öneri:
- **Başarı:** uygulama yalnız küçük bir bildirim gösteriyor. Öneri marka dokümanındaki yeşil parlamayı ekliyor ve bildirimde hangi ürünün eklendiğini yazıyor. Ürün, liste yenilenince miktarı artan satırdan bulunur; servis değişikliği gerekmez.
- **Hata:** ortalanmış pencere yerine tam ekran. Tamam ekranın en altında, tek elle basılır.
- **Miktar aşımı:** pencere ortadan değil alttan açılıyor.
- **Bildirimin görünümü:** marka dokümanı 4 px renkli sol kenar tanımlıyor. Önerideki bildirim bunun yerine yuvarlak, renkli ikon karosu kullanıyor; bu, öneri ekranlarının karo diliyle aynı.

## Kararların uygulanması

- **İrsaliye Oluştur:** açık koliler seçilemez. Satır kesik çizgili ve soluk, onay kutusu pasif, satırda “Kapatılmadan eklenemez” yazar. “Kapatılmadan irsaliyeye eklenemez” iki satıra kırıldığı için kısaltıldı; ekran zaten irsaliye bağlamında.
- **Sipariş Seçimi:** “Siparişsiz koli oluştur / Koli bir siparişe bağlanmaz”.

## Henüz çizilmeyenler

- boş, eşleşmeyen ve hatalı listeler;
- giriş ve bağlantı hataları;
- Koli Detayı'nın silme modu;
- sipariş dışı ürün penceresi: aynı pencere, “Sipariş Dışı Ürün” başlığıyla.

## Doğrulama

- `node ui-history/tools/verify.cjs`: geçti. v7: 9 ekran, 7 durum; 44 açık tema önizlemesi. Durum dosyaları da scriptsiz ve yerel varlıklarla denetlenir.
- `node ui-history/tools/check-themes.cjs --states --screens-only`: 32/32 geçti. Ayrıca denetlenenler:
  - kaplamaların tüm ekranı örtmesi;
  - hata ve onay düğmelerinin başparmak bölgesinde olması;
  - okutulan barkodun yazılması;
  - toast'ın alt çubuğa binmemesi;
  - açık kolilerin pasif olması.
- `node ui-history/tools/check-themes.cjs`: 31/31 geçti. Görüntüleyici dokuz ekranda v7'yi gösterir; durum seçici, adres çubuğunda `durum=`, büyük önizleme ve ekran değişince sıfırlanma test edildi.
- **Impeccable taraması:**
  - Kalan iki `low-contrast` bulgusu telefonun sahte durum çubuğundaki 12 px saat. Koyu temada #FF3340 üzerinde 3,6:1; cihazda bu çubuğu işletim sistemi çizer. Uygulama metinleri en az 4,5:1, 24 px ve üstü başlıklar en az 3:1.
  - `dark-glow` bulguları ortak stil dosyasındaki Yeni Koli ışımasıdır, v6'daki gibi.

Statik, scriptsiz öneri; animasyonlar ve sesler notlarda tarif edilir. Native cihazda doğrulanmadı.
