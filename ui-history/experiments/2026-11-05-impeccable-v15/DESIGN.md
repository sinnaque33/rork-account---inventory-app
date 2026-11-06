# Öneri 15 · İrsaliyeden koliye git

**Uygulamaya aktarıldı; son hâl [6 Kasım arşivinde](../../versions/2026-11-06/meta.json).** Kapsam: İrsaliye Oluştur. Diğer sekiz ekran ve altı durum v14 ile aynı.

Kullanıcı isteği (2026-11-05): irsaliye ekranından o koliye hızlıca gidilebilsin.

## Karar

Satıra dokunmak bugün koliyi seçiyor; bu değişmez, çünkü ekranın asıl işi seçim. Uzun basma da seçime bağlı. Bu yüzden satır iki hedefe ayrıldı:

- **Sol taraf (kutu ve koli no):** seçer, eskisi gibi.
- **Sağdaki ok:** koli detayını açar. Koli Listesi'ndeki okla aynı işaret, aynı anlam.
- Ok alanı 56 px genişliğinde ve satır yüksekliğinde; ince çizgi iki hedefi ayırır.
- Seçili satırda ok çivit renge döner, zemin satır boyunca kesintisiz kalır.

## Uygulamaya aktarılırsa

- Ok, Koli Listesi'nin kullandığı parametrelerle `koli-detay`'ı açar (`id`, `packageNo`, `receiptNo`, `sipExp`). `push` kullanılır; irsaliye ekranı yığında kaldığı için geri dönünce seçimler, arama ve kaydırma yeri korunur.
- Koli detayında koli kapatılır, açılır ya da silinirse irsaliye listesi yenilenmelidir. Silinen koli seçiliyse seçimden düşmelidir; aksi halde irsaliyeye gönderilir. Aktarımda ele alınacak.
- Servis değişikliği gerekmez.

## Doğrulama

- `node ui-history/tools/verify.cjs` ve `node ui-history/tools/check-themes.cjs`: geçti; görüntüleyici dokuz ekranda v15'i gösterir.
- Impeccable taraması: yeni bulgu yok.
- İrsaliye Oluştur koyu ve açık temada ekran görüntüsüyle kontrol edildi.

Statik öneri; dokunma davranışı cihazda denenmedi.

Yeniden üretim: `node ui-history/tools/build-box-link-revision.cjs --replace`.

## Uygulamaya aktarım (6 Kasım 2026)

Dokuz ekran bu öneriyle uygulamada. Aktarımdan sonra doğrudan uygulamada yapılanlar yalnız arşivde görünür, bu öneride değil: “Koli Ara” etiketi, eşit alt düğmeler, Koli Listesi, İrsaliye, Sipariş Seçimi ve Barkod Okutma’da küçülen yazılar, klavyenin yalnız dokununca açılması.
