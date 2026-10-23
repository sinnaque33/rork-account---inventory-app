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
