# Öneri 12 · Okunabilirlik ve gruplama

**Onay bekliyor. Ana koda uygulanmadı.** Kapsam: Ana Sayfa, Koli Listesi, Koli Detayı (3 durum), Sipariş Seçimi, Barkod Okutma (3 durum). İrsaliye Oluştur v9'da kalır (kullanıcı: “iyi”); Giriş, Ayarlar ve Koli Oluştur v8'de.

Kullanıcı geri bildirimi (2026-10-27): ana sayfa kartları farklı boyda; koli listesinin yazı tipi beğenilmedi, liste “çok düz”, sipariş numarası görünmüyor, kolileri gruplamak önerildi; koli detayında üst kısım iyi, ürün kartı eskisi (v9) gibi olsun ama miktar şimdiki (v11) gibi kalsın; sipariş seçiminde yazı tipi beğenilmedi ve orada depo gösterilmiyor; barkod okutmanın yazı tipi düzeltilsin.

## Yazı tipi

Beğenilmeyen yazı tipi, kodlarda ve sayılarda kullanılan sabit genişlikli Roboto Mono'ydu. Bu öneride bütün kodlar uygulamanın Roboto'suyla, eşit genişlikli rakamlarla (`tnum`) yazılır. Barkod alanlarındaki harf aralığı .06–.08em'den .02em'e indi. Değişiklik tek bir token'la yapılır (`--font-mono`); uygulamaya aktarılırsa `fontFamily: monospace` olan stiller kaldırılır, `fontVariant: ['tabular-nums']` eklenir.

## Ana Sayfa

İki kart aynı yükseklikte (`grid-auto-rows: 1fr`). İrsaliye kartının alt metni iki satıra indiği için Koli Listesi kartı da o boya çekilir. Metin ve renkler aynı.

## Koli Listesi

- **Siparişe göre gruplar:** her sipariş bir kart. Başlık bandında “Sipariş No 00000151”, siparişin açıklaması (en fazla iki satır, boşsa çizilmez) ve sağda “2 koli”. Sipariş numarası artık etiketiyle yazıyor; v9'da koli numarasının soluk ön eki olarak kayboluyordu.
- **Satır = koli:** paket karosu, “Koli **022**” büyük, altında tam koli no (`00000151-022`, etiketteki gibi aranabilsin diye). Satır 64 px, ok işaretiyle.
- İrsaliye ekranının (v9) grup diliyle aynı: kullanıcının beğendiği ekranla tutarlı.
- **Sıra:** servisin sırası (en yeni önce); bir sipariş ilk göründüğü yerde toplanır. Sayfalama ile gelen sonraki koliler aynı siparişin grubuna eklenir.

## Koli Detayı

Üst kısım v11 ile aynı. Kart v9 düzeninde: karo, ürün kodu, altında “Barkod 9870000273251”, ince çizginin altında etiketli **Renk** ve **Lot adeti**. **Miktar** v11'deki gibi sağ üstte, kutusuz, büyük ve yeşil; bütün kartlarda aynı dikey hizada. Durumlar v11 ile aynı (başarılıda 10 → 11).

## Sipariş Seçimi

Kullanıcı `orderReceipts` yanıtını logdan aktardı (yaklaşık 350 kayıt, tek sayfa; ilk 24'ü `fixtures-api.json`'da). Kartın ikinci satırındaki `CurrentAccountName` **depo değil, cari** (müşteri): “BEBETTO TEKSTİL A.Ş”, “EBEBEK MAĞAZACILIK A.Ş”… Depo bilgisi bu yanıtta da yok.

- Servis siparişleri cariye göre sıralı döndürüyor ve çoğu carinin birden çok siparişi var (EBEBEK'in onlarca). Bu yüzden **cariye göre gruplar**: her cari bir kart, başlıkta cari adı (en fazla iki satır) ve “4 sipariş”; satırlarda “Sipariş No **00000151**”, 56 px. Koli Listesi ile aynı grup dili.
- Cari adı her siparişte tekrar yazılmaz; uzun listede aranan cari başlıktan bulunur.
- Arama (sipariş no veya cari), siparişsiz koli seçeneği v8 ile aynı.
- Uygulamadaki önek “Fiş: ”; öneride “Sipariş No” (aktarımda karar verilecek).
- Aktarılırsa: `CurrentAccountName` boşluklar sadeleştirilerek gruplanır (yanıtta “CİVİL MAĞAZACILIK  A.Ş” gibi çift boşluklar var); servis sırası korunur.

## Barkod Okutma

Sipariş çipi ve barkod alanı yeni yazı tipinde. Çip ve altındaki cari gerçek veriyle: 00000151, BEBETTO TEKSTİL A.Ş. Okutma başarılı durumu yeni kolinin detayını gösterir: `00000151-023`, T4121 miktar 1.

## Doğrulama

- `node ui-history/tools/verify.cjs`: geçti.
- `node ui-history/tools/check-themes.cjs`: geçti; görüntüleyici beş ekranda v12'yi, İrsaliye'de v9'u, diğerlerinde v8'i gösterir.
- Impeccable taraması: bilinen `dark-glow` (Yeni Koli ışıması) ve v8'den gelen `cramped-padding` (hata bildirimindeki 48 px kapatma düğmesi; ikon kutunun ortasında, görsel boşluk var).
- Beş ekran koyu temada, Koli Listesi ve Koli Detayı açık temada, iki başarılı durum ekran görüntüsüyle kontrol edildi.

Yeniden üretim: `node ui-history/tools/build-readability-v12-revision.cjs --replace`.
