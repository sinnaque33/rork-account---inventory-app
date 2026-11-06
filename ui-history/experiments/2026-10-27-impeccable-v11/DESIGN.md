# Öneri 11 · Koli Detayı ürün kartı

**Onay bekliyor. Ana koda uygulanmadı.** Yalnız Koli Detayı ve üç okutma durumu. Koli Listesi ve İrsaliye v9'da, diğer ekranlar v8'de kalır.

Kullanıcı v10'un tablosunu beğenmedi: “kart görünümü daha iyiydi, kartın iyileştirilmesini istemiştim.” v10 reddedildi. Bu öneri v9'un kartını korur ve iyileştirir. Veri aynı: test sunucusunun `koliDetay` yanıtı (id 8).

## v9 kartındaki sorunlar

- Ürün başına ~170 px: karo ve başlık, ayrı bir alt bölüm, “Renk / Lot adeti” etiketleri ve ayrı bir “Miktar” kutusu.
- Miktar kartın alt köşesinde; kartın yüksekliği değiştikçe yeri de değişiyor.
- Etiketler değerlerden fazla yer kaplıyor.

## Kart

- **Korunanlar:** kart, kırmızı paket karosu, renkler, ürün kodu (20 px, sabit genişlikli).
- **Miktar sağ üstte:** “Miktar” etiketi ve büyük yeşil sayı. Bütün kartlarda aynı yerde; okutma sırasında göz tek dikey çizgide iner.
- **Barkod** ürün kodunun hemen altında, soluk.
- **Renk** küçük bir etiket, yanında “2 lot”. Ayrı etiket satırları kaldırıldı.
- **Sonuç:** kart ~110 px; ekranda daha çok ürün görünür.
- Birim yanıtta yok, yazılmaz. Sunucunun ekleyeceği yeni `sh_` alanları etiket satırına “Etiket değer” olarak düşer.

## Durumlar

- **Okutma başarılı:** eklenen ürünün kartı yeşil zeminli ve çerçeveli, miktar 10 → 11; altta “Ürün eklendi” bildirimi.
- **Okutma hatalı:** liste değişmez; okutma alanı kırmızı çerçeveli, altta kırmızı bildirim.
- **Miktar aşımı:** alttan açılan pencere, T4121'in gerçek barkoduyla.

## Uygulamaya aktarılırsa

`KoliDetailRow` aynı kart kalır, düzeni değişir: miktar `sh_Miktar`'dan sağ üste, `h2` alanı ürün kodunun altına, renk ve lot adeti tek satıra. Servis değişikliği gerekmez.

## Doğrulama

- `node ui-history/tools/verify.cjs`: geçti.
- `node ui-history/tools/check-themes.cjs`: geçti. Görüntüleyici Koli Detayı'nda v11'i ve durumlarını gösterir; v10 reddedildiği için gösterilmez.
- Impeccable taraması: yalnız bilinen `dark-glow` (ortak stil dosyasındaki Yeni Koli ışıması).
- İki temada ekran ve başarılı okutma durumu ekran görüntüsüyle kontrol edildi.

Yeniden üretim: `node ui-history/tools/build-detail-cards-revision.cjs --replace`.
