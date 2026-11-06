# Öneri 09 · Koli ekranları gerçek veriyle

**Onay bekliyor. Ana koda uygulanmadı.** Koli Listesi, Koli Detayı (okutma durumlarıyla) ve İrsaliye Oluştur; diğer altı ekran v8'de kalır.

Kullanıcı, test sunucusunun `koliListesi` yanıtını uygulama logundan aktardı (2026-10-27). Bu sunucudaki veri müşteri verisi değildir. Yanıt `fixtures-api.json` dosyasında. Önceki öneriler `fixtures.json`'daki uydurma kolileri kullanıyordu ve gerçek veriyle üç yerde çelişiyordu:

| Önceki varsayım | Gerçek yanıt |
| --- | --- |
| Her kolide depo (`Explanation`) | Alan yok. Kullanıcı: uygulamada depo bilgisi gösterilmiyor. |
| Açık/kapalı durumu | Liste yanıtında durum yok. |
| `SipExp` = müşteri adı ve not | `SipExp` siparişin açıklaması (“24 KIŞ STOK SİPARİŞİ”), büyük harf, bazen boş. |
| Koli no `KL-001248` | Koli no siparişin numarası ve kolinin sırası: `00000151-022`. |

## Kart

- **Koli no:** sipariş kısmı soluk ve ince, kolinin sırası (`-022`) koyu. Aynı siparişin kolileri sırasıyla ayırt edilir, sipariş numarası ayrıca tekrarlanmaz.
- **Açıklama:** en fazla iki satır, ikincil renkte. Boş gelen kolide satır çizilmez, kart kısalır.
- **Kaldırılanlar:** depo satırı, “Sipariş” ve “Depo” şeridi, müşteri adı satırı. Şerit yalnız koli numarasının iki yarısını tekrar ediyordu.
- **Sonuç:** ekranda 7 kolinin 6'sı görünüyor (v8'de üçten az).
- Arama, Barkod ve Yeni Koli düğmeleri, kart dili ve renkler v8 ile aynı.

## Koli Detayı

Kullanıcı üç kolinin `koliDetay` yanıtını aktardı (id 6, 7, 8). Ekran id 8'in iki ürününü kullanır. Logda bu kolilerin koli numarası olmadığı için başlık listedeki ilk koliden alındı (`00000151-022`).

Gerçek satır: `h1_Malzeme Adı`, `h2_Barkod`, `sh_Renk`, `sh_Miktar` (metin), `sh_Lot Adeti`. Görsel, beden, birim ve stok kodu yok.

Uygulama bu satırı şöyle çiziyor (arşiv de artık böyle):
- başlık `h1` değeri (T4121);
- miktar yerinde **barkod** durur (`h2` alanı o yere kendi adıyla yazılır);
- asıl miktar, renk ve lot adeti küçük yeşil satırlarda.

Öneri:
- **Miktar** kutusunda asıl miktar (`sh_Miktar`), büyük ve sabit genişlikli. Birim yanıtta olmadığı için yazılmaz.
- **Barkod** ürün kodunun altında, “Stok kodu” satırının yerinde.
- **Renk** ve **Lot adeti** alt satırda. Etiketler alan adlarından gelir (`sh_` öneki atılır, cümle düzeni); sunucu başka alan eklerse aynı satıra düşer.
- Okutma durumları gerçek ürünle: başarıda T4121 10 → 11, miktar aşımında T4121'in gerçek barkodu.

Uygulamaya aktarılırsa `KoliDetailRow`'da miktar `sh_Miktar`'dan okunur, `h2` alanı ürün kodunun altına iner. Servis değişikliği gerekmez.

## İrsaliye Oluştur

Kullanıcı `irsKoliListesi` yanıtının ilk sayfasını aktardı: 15 koli, 6 sipariş. Her kolide `id`, `PackageNo`, `ReceiptNo`, `SipExp` var; **durum (`Status`) yok**.

Uygulama satırda yalnız koli numarasını çiziyor; durum satırı `Status` gelirse çıkıyor, yani bugün hiç çıkmıyor. Sipariş no ve açıklama geliyor ama gösterilmiyor. Arşiv artık böyle.

Öneri:
- **Siparişe göre gruplar:** her sipariş bir kart; başlıkta sipariş no, açıklama (tek satır) ve “5 koli · 2 seçili”. Sipariş sırası servisin sırası (en yeni önce). İrsaliye bir sipariş için kesilir; farklı siparişlerin kolileri karışırsa bu artık görünür.
- **Satırlar:** onay kutusu ve koli no (sipariş kısmı soluk, sıra koyu), 56 px. Seçili satır çivit zeminli.
- **Tümünü seç:** grup başlığında; bir siparişin bütün kolileri tek dokunuşla. Bu yeni bir davranış önerisidir.
- **Kaldırılanlar:** Açık/Kapalı rozetleri ve pasif (“Kapatılmadan eklenemez”) satırlar. Veri durumu söylemiyor. Kullanıcının “açık koliler eklenemez” kararı için servisin `Status` göndermesi ya da yalnız kapalı kolileri döndürmesi gerekir.

## Arşiv düzeltmesi

Kullanıcının isteğiyle 15 Ekim arşivinin Koli Listesi, Koli Detayı ve İrsaliye Oluştur ekranlarındaki örnek veri gerçek yanıtla değiştirildi (koyu ve açık önizleme). Detayda kartlar `KoliDetailRow`'un mantığıyla çizilir. Kart, uygulamadaki gibi çizilir: koli no, “Sipariş No: …” ve varsa açıklama; depo satırı yok. Arşivin düzeni ve stilleri değişmedi.

## Uygulamaya aktarılırsa

`PackageNo` son `-` işaretinden bölünür; işaret yoksa numara tek parça, koyu yazılır. `SipExp` boşsa satır çizilmez. Servis değişikliği gerekmez.

## Doğrulama

- `node ui-history/tools/verify.cjs`: geçti.
- `node ui-history/tools/check-themes.cjs`: geçti; görüntüleyici Koli Listesi, Koli Detayı ve İrsaliye Oluştur'da v9'u, diğer ekranlarda v8'i gösterir.
- Impeccable taraması: yalnız bilinen `dark-glow` (Yeni Koli ışıması, marka kuralının izin verdiği tek gölge).
- Arşiv ve öneri, iki temada ekran görüntüsüyle kontrol edildi.

Yeniden üretim: `node ui-history/tools/build-api-list-revision.cjs --replace`.
