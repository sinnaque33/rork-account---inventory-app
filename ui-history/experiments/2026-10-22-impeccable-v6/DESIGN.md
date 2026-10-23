# Öneri 06 · Kritik sonrası küçük düzeltmeler

**Onay bekliyor. Ana koda uygulanmadı.** Kullanıcının isteği: görüntüleyicide AI iyileştirmesi gösterilen ekranlar Impeccable'a göre tek tek eleştirilsin, küçük düzeltmeler yapılsın.

Bu revizyon, görüntüleyicinin gösterdiği dokuz ekranı tek klasörde toplar. Kaynak öneriler değişmedi:

| Ekran | Kaynak öneri | Kritik puanı |
| --- | --- | --- |
| Giriş | v2 | 24/40 |
| Ayarlar | v2 | 22/40 |
| Ana Sayfa | v2 | 23/40 |
| Yeni Koli | v2 | 20/36 (9. ilke uygulanmaz) |
| Koli Listesi | v4 | 24/40 |
| Koli Detayı | v4 | 24/40 |
| İrsaliye Oluştur | v4 | 21/40 |
| Barkod Okutma | v5 | 28/40 |
| Sipariş Seçimi | v5 | 26/40 |

Kritik iki bağımsız değerlendirmeyle yapıldı:
- **Tasarım incelemesi:** Nielsen puanları, bilişsel yük ve personalar.
- **Ölçüm:** Impeccable dedektörü ile tarayıcıda kontrast, dokunma alanı ve yazı boyutu ölçümü.

Kayıt: `.impeccable/critique/2026-10-22T15-10-30Z__ui-history-viewer-index-html.md`. Puanlar düzeltmelerden öncesine aittir.

Kural: yalnız küçük düzeltmeler. Düzen, metinler ve akışlar kaynak önerilerdeki gibi kalır. Karar isteyen konular aşağıda ayrıca listelendi.

## Ortak düzeltmeler

Stil dosyası v5'inkidir; sonuna “Revision 06” bloğu eklenir. v2 ekranları sonraki önerilerin sınıflarını kullanmadığı için bu dosyayla birebir aynı görünür; ekran görüntüleriyle doğrulandı.

| Önce | Sonra | Neden |
| --- | --- | --- |
| Kırmızı #cc2434 (koyu) / #c62132 (açık), gradyan ucu #8e1016 | Tema değerleri #DA2128 ve #9E1318 | Öneriler temaya yakın ama farklı kırmızılar kullanıyordu. Tema kırmızısında beyaz yazı zaten ≈5:1. Port sırasında yeni renk gerekmez. |
| Çivit #5250e0 / #4b48d4 | Tema değerleri #5B5BF0 / #3E3EC4 | Aynı neden. |
| Hata kırmızısı #ff8791 / #b51f30 | Tema değerleri #FF3340 / #D32030 | Silme, koli karolarının pembe tonundan ayrışır. |
| Koli karosu ikonları pembe (#ff8f98) | Marka kırmızısı (koyu #F23643, açık #DA2128) | Kırmızı tek aile; Barkod ekranındaki ikonla aynı. |
| Başlık ikon düğmeleri, segmentler ve “Yeni Koli” hapı 44 px | 48 px | Android 48 dp dokunma hedefi. |
| v2 ekranlarında 12–13 px yardımcı metin | 14 px | v3'ten beri geçerli okunabilirlik tabanı. |
| Açık temada kartlarda gölge | Gölge yok, ince çerçeve kalır | Marka kuralı: tek gölge kırmızı FAB ışıması. |
| Kontroller ekran okuyucuda “resim” | Doğru roller: düğme, anahtar, onay kutusu, radyo grubu; barkod alanı etiketine bağlı | İşaretleme, port için spesifikasyon da sayılır. |

Yeşil #15834e değişmedi: temanın yeşili (#23C277 / #159C5B) üzerinde beyaz yazı 4,5:1'i geçmiyor.

## Ekran ekran

| Ekran | Önce | Sonra |
| --- | --- | --- |
| Giriş | “Beni hatırla” işareti ve güvenlik kilidi yeşil | İşaret orijinaldeki gibi marka kırmızısı, kilit nötr; yeşil yalnız tamamlama anlamında kalır |
| Giriş | Şifre gözünün dokunma alanı yok | 48 px “Şifreyi göster” düğmesi |
| Ayarlar | API URL açıklaması şifre alanından sonra; Şirket kodu ile Depo ID yan yana | Orijinal sıra: API URL ve hemen altında açıklaması, Şirket kodu ile Şirket şifresi yan yana, en son Depo ID |
| Ayarlar | Bölüm başlığı 15 px, alan etiketi 14 px; aynı görünüyorlardı | Bölüm başlıkları markanın büyük harfli etiket stilinde (14 px, aralıklı, ikincil renk) |
| Ayarlar | Anahtarlar “Kapalı, resim” diye okunuyor | Anahtar rolü, ayarın adıyla |
| Ana Sayfa | İrsaliye karosu yeşil, sonraki ekranlar çivit | Çivit karo; Koli Listesi karosu marka kırmızısı |
| Ana Sayfa | ↗ (dış bağlantı gibi okunuyor) | › (uygulamanın geri kalanı gibi) |
| Ana Sayfa | Kullanıcı adı 30 px, eylemlerden baskın | 24 px; “Hızlı erişim” başlık değil etiket (başlık sırası düzeldi) |
| Yeni Koli | Sepet ikonu; seçenek başlığı 15 px | Fiş ikonu (Sipariş Seçimi ile aynı); başlık 16 px kalın, Sipariş Seçimi'ndeki siparişsiz koli seçeneğiyle aynı ölçü |
| Koli Listesi | Kartlar arası ~193 px, ekranda üçten az koli | Kart iç boşlukları sıkılaştırıldı (~173 px) |
| Koli Listesi | Barkod düğmesinin ikonu kırmızı, Yeni Koli ile yarışıyor | Nötr ikon; tek kırmızı Yeni Koli |
| Koli Detayı | Miktar yeşil zeminli karoda | Nötr zeminde yeşil sayı (orijinaldeki gibi) |
| Koli Detayı | “Koli sil” bordo zeminli; ürün karolarıyla aynı nesne gibi | Zeminsiz, tema hata kırmızısı (orijinaldeki gibi) |
| Koli Detayı | Sipariş bağlantısının dokunma alanı 26 px | 48 px (görünüm aynı) |
| Koli Detayı | Ekranda ~1,8 ürün | Kart ve alt çubuk boşlukları sıkılaştırıldı; ikinci ürün tam görünür |
| İrsaliye Oluştur | Onay kutusu köşesi 7 px; karo gibi | 4 px; satırlar onay kutusu olarak okunur |
| Barkod Okutma | Kırmızı tonlu tarama dairesi; dokunulacak bir düğme gibi | Orijinaldeki gibi nötr gri daire, kırmızı ikon |
| Barkod Okutma | “İlk ürünü okutun” 14 px, ikincil renk | 16 px ana renk; alanın etiketi |
| Sipariş Seçimi | Siparişsiz koli seçeneği kırmızı tonlu kart ve dolu kırmızı karo; açık temada uyarı şeridi gibi | Sıradan kart, tonlu karo; koli ekleme ikonu ve alt satırıyla ayrışır |
| Sipariş Seçimi | “En fazla iki satır” notu vardı ama sınır yoktu | Cari adı iki satırda kesilir |

Bilerek yapılmayan: Koli Detayı'ndaki ürün karosu nötrleştirilmedi. Yayındaki uygulama da ürün görseli yokken kırmızı paket ikonunu gösteriyor (`koli-detay.tsx`).

## Kullanıcı kararına kalanlar

Bunlar metin, akış ya da yön değiştirdiği için yapılmadı:

- **Tarama sonucu ve diğer durumlar:**
  - başarılı ve hatalı okutma (marka dokümanındaki tam ekran geri bildirim ve ses);
  - Gönder'den sonraki bekleme;
  - boş, eşleşmeyen ve hatalı listeler;
  - giriş ve ayar hataları;
  - Koli Listesi'nde uzun basmayla çoklu seçim;
  - Koli Detayı'nda silme modu.
- **İrsaliye Oluştur:**
  - satırlarda sipariş no ve cari yok; farklı müşterilerin kolileri tek irsaliyede birleşebiliyor;
  - açık kolilerin seçilip seçilemeyeceği bir iş kuralı.
- **Koli Detayı:**
  - kolinin açık/kapalı durumu görünmüyor; Koli Açma ve Koli Kapatma ikisi birden aktif;
  - en baskın blok sipariş kartı, oysa ekrandaki asıl iş okutma;
  - seçili ekleme modunun yeşil olması.
- **Ana Sayfa:**
  - orijinaldeki gradyan kartlara ve şevron filigranına dönüş. v4 bu kartı imza olarak kullanıyor, ama Ana Sayfa'nın kendisinde yok;
  - günlük işlere kısayol.
- **v2 ekranlarını v4 diline getirmek:**
  - açık temada zemin ve kart mantığı (v2: beyaz zemin, gri kart; v4: gri zemin, beyaz kart);
  - kenar boşlukları: 32, 20 ve 16 px.
- **Metinler:**
  - “Sipariş bağlantısı yapılmayacak” → örneğin “Siparişsiz koli oluştur”;
  - Ayarlar'daki çift olumsuzlar (“Kapatırken ağırlık sorma”, “Stok kontrolü yapılmasın”);
  - “7 koli” aslında yüklenen ilk sayfa;
  - Koli Listesi'ndeki “Depo” etiketi: veri alanı serbest metin `Explanation`.
- **Akış:**
  - Yeni Koli ekranı `SHOW_EMPTY_BOX_OPTION` kapalıyken tek seçenek gösteriyor;
  - Ayarlar'da Kaydet en sonda ve kaydedilmemiş değişiklik göstergesi yok.

### Kullanıcının kararları (22 Ekim 2026)

- **Sıradaki iş:** okutma sonuçları ve durumlar:
  - başarılı ve hatalı okutma;
  - Gönder'den sonraki bekleme;
  - boş, eşleşmeyen ve hatalı listeler;
  - giriş ve bağlantı hataları.
- **Açık koliler irsaliyeye eklenemez.** İrsaliye Oluştur'da pasif görünürler, nedeni satırda yazar.
- **“Depo” etiketi doğru:** `Explanation` alanı depo/şube bilgisini tutuyor. Etiket kalır.
- **Siparişsiz koli seçeneği:** başlık “Siparişsiz koli oluştur”, alt satır “Koli bir siparişe bağlanmaz”. Sonraki revizyonda uygulanacak.

## Port notları

- **Roller:**
  - kartlar ve satırlar `accessibilityRole="button"`; etiketlerinde KL ya da SIP numarası bulunsun;
  - anahtarlar `switch`, irsaliye satırları `checkbox`, mod seçici `radio`; durumları `accessibilityState` ile verilsin.
- **48 dp:** görünür boyut küçük kalırsa `hitSlop` kullanılsın.
- **Odak:** el terminallerindeki yön tuşları için görünür bir odak halkası gerekir. Kırmızı olmasın; hata durumuyla karışır.
- **Barkod ekranı:** `autoFocus` ve `showSoftInputOnFocus` açık, bu yüzden klavye Gönder'i örtebilir. İçerik ScrollView içinde olduğu için kaydırılabilir; Enter tuşu gönderir.
- **Sipariş Seçimi:** cari adı için `numberOfLines={2}`.

## Doğrulama

- `node ui-history/tools/verify.cjs`: geçti. v6'da 9 ekran, toplam 35 açık tema önizlemesi.
- `node ui-history/tools/check-themes.cjs --critique --screens-only`: 18/18 geçti. Düzeltmeler ayrıca denetlenir:
  - tema kırmızısı ve çivit;
  - 48 px kontroller ve 14 px yazı tabanı;
  - roller;
  - Ayarlar alan sırası;
  - açık temada gölgesiz kartlar.
- `node ui-history/tools/check-themes.cjs`: 31/31 geçti. Görüntüleyici dokuz ekranın hepsinde v6'yı gösterir.
- **Impeccable taraması:**
  - Yeni Koli'de başlık boyları birbirine çok yakın çıktı (20/20/24 px). Seçenek başlığı 16 px yapılınca giderildi.
  - Kalan 19 `dark-glow` bulgusu aynı stil kuralından geliyor. Gerçek olanı Koli Listesi'ndeki Yeni Koli ışıması: marka kuralının izin verdiği tek gölge, bilinçli olarak tutuluyor. Koyu temada iki kez raporlanıyor. Diğerleri yanlış pozitif; dokuz ekran artık aynı stil dosyasını kullandığı için her dosyada raporlanıyor.

HTML'ler scriptsiz tasarım önerileridir. Ekran görüntüleri yalnız inceleme için geçici olarak alındı. Native cihazda doğrulanmadı.
