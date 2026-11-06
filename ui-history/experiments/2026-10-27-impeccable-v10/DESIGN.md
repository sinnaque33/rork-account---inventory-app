# Öneri 10 · Koli Detayı ürün tablosu

**Reddedildi (2026-10-27).** Kullanıcı: “kart görünümü daha iyiydi, kartın iyileştirilmesini istemiştim.” Yerine [v11](../2026-10-27-impeccable-v11/DESIGN.md): iyileştirilmiş kart. Kayıt olarak saklanır; görüntüleyici reddedilen öneriyi göstermez.

~~Onay bekliyor.~~ Yalnız Koli Detayı ve üç okutma durumu. Koli Listesi ve İrsaliye v9'da, diğer ekranlar v8'de kalır. v9'un kart görünümü korunur; görüntüleyici Koli Detayı'nda en yeni öneri olarak bunu gösterir.

Kullanıcı, Koli Detayı'ndaki ürünler için başka bir görünüm istedi. Veri v9 ile aynı: test sunucusunun `koliDetay` yanıtı (id 8), başlık listedeki ilk koliden.

## Neden tablo

Gerçek ürün satırı az ve sabit alan taşıyor: ürün kodu, renk, barkod, lot adeti, miktar. Görsel yok. v9'un kartı ürün başına bir ikon karosu, ayrı bir alt bölüm ve kendi “Miktar” kutusunu harcıyordu; etiketler her üründe tekrar yazılıyordu.

Depoda bu ekranın işi: okut, miktarın arttığını gör, sonrakini okut. Bunun için miktarlar alt alta, aynı sütunda durmalı.

## Tablo

- **Başlık satırı bir kez:** Ürün · Lot · Miktar.
- **Satır:** solda ürün kodu (20 px), altında renk, en altta barkod (sabit genişlikli, soluk). Sağda lot (soluk) ve miktar (24 px, yeşil, sağa hizalı).
- **Toplam satırı:** toplam lot ve toplam miktar. Üstteki özet de “2 ürün kalemi · toplam miktar 14” der.
- **Birim:** yanıtta yok, yazılmaz.
- **Yeni alanlar:** sunucu başka bir `sh_` alanı eklerse renk satırına “Etiket değer” olarak düşer; tablo bozulmaz.
- **Kaldırılanlar:** ikon karosu (görsel gelirse aynı yere küçük resim olarak dönebilir), ürün başına “Miktar” kutusu, tekrarlanan etiketler.

## Durumlar

- **Okutma başarılı:** eklenen satır yeşil zeminli, miktar 10 → 11, toplam 14 → 15; altta “Ürün eklendi” bildirimi (v8 dili).
- **Okutma hatalı:** tablo değişmez; okutma alanı kırmızı çerçeveli, altta kırmızı bildirim.
- **Miktar aşımı:** v8/v9 ile aynı alttan açılan pencere, T4121'in gerçek barkoduyla.

## Uygulamaya aktarılırsa

`KoliDetailRow` kart yerine tablo satırı olur. Miktar `sh_Miktar`'dan, lot `sh_Lot Adeti`'nden okunur; toplamlar liste üstünden hesaplanır. Servis değişikliği gerekmez.

## Görüntüleyici düzeltmesi

Aynı günün önerileri adlarına göre metin olarak sıralanıyordu; bu sırada “v10”, “v9”dan önce geliyordu. Sıralama artık içindeki sayıları sayı olarak karşılaştırıyor (`viewer/index.html`).

## Doğrulama

- `node ui-history/tools/verify.cjs`: geçti.
- `node ui-history/tools/check-themes.cjs`: geçti. Görüntüleyici Koli Detayı'nda v10'u gösterir, durum düğmeleri v10'un durumlarını açar.
- Impeccable taraması: yalnız bilinen `dark-glow` (ortak stil dosyasındaki Yeni Koli ışıması).
- İki temada ekran ve başarılı okutma durumu ekran görüntüsüyle kontrol edildi.

Yeniden üretim: `node ui-history/tools/build-detail-table-revision.cjs --replace`.
