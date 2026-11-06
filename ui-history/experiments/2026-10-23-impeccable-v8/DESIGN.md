# Öneri 08 · Seri okutma bildirimi

**Onay bekliyor. Ana koda uygulanmadı.** Kullanıcı v7'yi 2026-10-23'te inceledi:
- “Başarılı okutmadan sonra” durumu iyi.
- Tam ekran yeşil “Okutma başarılı” olmamalı; depoda barkodlar art arda okutulur.
- Hata da aynı biçimde gösterilmeli, tüm ekran kırmızı olmamalı.

Bu revizyon v7'nin dokuz ekranını ve stil dosyasını taşır; v7 değişmedi. Değişen yalnız okutma sonucu durumlarıdır.

## Yeni kural

Başarı ve hata **aynı bildirimde** çıkar: alt çubuğun hemen üstünde, başparmak bölgesinde, aynı yer ve aynı biçimde. Ekranı hiçbir şey kaplamaz. Okutma alanı odakta kalır; bir sonraki barkod için dokunmak gerekmez.

| | Başarı | Hata |
| --- | --- | --- |
| İkon | yeşil ✓ | kırmızı × |
| Çerçeve | nötr | hata kırmızısı |
| Ses / titreşim | yok | hata sesi, 500 ms titreşim |
| Süre | 2 sn; yeni okutma eskisinin yerine geçer | sonraki okutmaya kadar kalır, × ile kapanır |
| Okutma alanı | normal | kırmızı çerçeve, okutulan barkod alanda |
| Liste | eklenen ürün yeşil çerçeveli, yeni miktarla | değişmez |

Hata bildirimi kendiliğinden kapanmaz, çünkü ses kaçırılırsa hata görsel olarak durmalıdır. Yine de okutmayı engellemez: Tamam'a basmak gerekmez.

## Durumlar

| Ekran | Durum | Ne olur |
| --- | --- | --- |
| Barkod Okutma | Gönderiliyor | v7 ile aynı: düğmede yükleniyor işareti, alan kilitli. |
| Barkod Okutma | Okutma başarılı | Doğrudan yeni kolinin (KL-001255) detayı açılır, altta “Başarılı” bildirimi. Araya parlama girmez. |
| Barkod Okutma | Okutma hatalı | Okutma alanı kırmızı çerçeveli; ekranın altında “Okutma başarısız”, neden ve barkod. |
| Koli Detayı | Okutma başarılı | v7'deki “Başarılı okutmadan sonra”; yeşil parlama kaldırıldı. |
| Koli Detayı | Okutma hatalı | Başarıyla aynı yerde kırmızı bildirim; okutma alanı kırmızı çerçeveli ve barkodu gösterir. |
| Koli Detayı | Miktar aşımı | v7 ile aynı alttan açılan pencere. Kullanıcının kararı gerektiği için okutmayı durduran tek durum budur. |

Metinler: “Okutma başarısız” uygulamadaki “İşlem Başarısız” yerine öneridir; okutma bağlamını söyler. Neden metinleri sunucudan gelir, buradakiler örnektir.

## Uygulamaya aktarılırsa

`ResultModal` okutma hatalarında kullanılmaz. Bildirim, koli-detay'daki mevcut 2 sn'lik başarı bildiriminin genişletilmiş hâlidir. Hata hâli için ayrı bir tür, kapat düğmesi ve “sonraki okutmada temizle” kuralı gerekir. Servis değişikliği gerekmez.

## Doğrulama

- `node ui-history/tools/verify.cjs`: geçti. v8: 9 ekran, 6 durum.
- `node ui-history/tools/check-themes.cjs --states --screens-only`: geçti. `--states` kipi artık v8'i denetler:
  - tam ekran sonuç katmanı yok;
  - bildirim başparmak bölgesinde ve alt çubuğa binmiyor;
  - hata bildirimi `role="alert"`, okutulan barkodu yazıyor, okutma alanı işaretli, tek düğmesi kapat (48 px);
  - başarı dokunma istemiyor, eklenen ürün işaretli.
- `node ui-history/tools/check-themes.cjs`: geçti. Görüntüleyici dokuz ekranda v8'i ve Koli Detayı'nda dört durum düğmesini gösterir.
- Koyu ve açık temada ekran görüntüleriyle göz kontrolü yapıldı; görüntüler arşive eklenmedi.

Statik, scriptsiz öneri; ses ve süreler notlarda tarif edilir. Native cihazda doğrulanmadı.

## Uygulamaya aktarım (26 Ekim 2026)

Kullanıcının isteğiyle **Giriş** ve **Ayarlar** uygulamaya aktarıldı, yalnız tasarım olarak. Diğer yedi ekran öneri olarak kalır; bu revizyonun durumu `pending_approval` kalır.

- **Kaynak:** bu revizyondaki `login.html` ve `settings.html` (v6 düzeltmeleriyle v2 tasarımı).
- **Dosyalar:** `app/login.tsx`, `app/settings.tsx`, `constants/theme.ts`, `locales/tr.json`, `locales/en.json`.
- **Değişmeyenler:** giriş ve kaydetme akışı, doğrulamalar, ses önizlemesi, sıfırlama onayı, testID'ler.
- **Yeni token'lar:**
  - `controlLine` (#797380 / #85808D);
  - `confirm` (#15834E / #147B48), basılı hâli ve `onConfirm`;
  - `radius.control` 12;
  - yazı ölçeği: `heroTitle` 30, `pageTitle` 24, `labelMd` / `labelStrong` / `hint` 14.
- **Metinler önerideki gibi:**
  - “Hoş geldiniz”, “Hesap girişi”, “Kullanıcı adı”;
  - Ayarlar başlığı “API Ayarları” yerine “Ayarlar”, sayfa başlığı “Uygulama ayarları”;
  - bölüm başlıkları ve kısaltılmış açıklamalar; İngilizce karşılıkları da güncellendi.
  - Yarım genişlikteki iki alanın yer tutucusu “Opsiyonel” oldu; eski metin bu genişliğe sığmıyordu.
- **Önerinin çizmediği durumlar:**
  - giriş hatası, sunucu mesajı dahil, Giriş düğmesinin üstünde tek kutuda; sol şerit yerine ince kırmızı çerçeve ve ikon;
  - odak çerçevesi nötr (koyu temada açık, açık temada koyu), hata kırmızısıyla karışmaz;
  - açık anahtar marka kırmızısı, beyaz top;
  - kayıt bildirimi bu revizyondaki bildirim biçiminde, gölgesiz;
  - Giriş yüklenirken düğme kırmızı kalır. Eskiden açık temada beyaz yükleniyor işareti zeminde kayboluyordu.
- **Doğrulama:** `npx tsc --noEmit` ve `npx eslint` temiz. Expo web önizlemesinde iki tema, alan hataları, odak, açık anahtar ve kayıt bildirimi ekran görüntüleriyle kontrol edildi. Native cihazda denenmedi.
