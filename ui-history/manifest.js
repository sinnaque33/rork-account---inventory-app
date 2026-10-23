/* Dosya envanteri tools/update-manifest.cjs ile güncellenir; fetch kullanılmaz. */
window.UI_HISTORY = {
  "screens": [
    {
      "slug": "login",
      "name": "Giriş",
      "source": "app/login.tsx"
    },
    {
      "slug": "settings",
      "name": "Ayarlar",
      "source": "app/settings.tsx"
    },
    {
      "slug": "dashboard",
      "name": "Ana Sayfa",
      "source": "app/(app)/dashboard.tsx"
    },
    {
      "slug": "koli-listesi",
      "name": "Koli Listesi",
      "source": "app/(app)/koli-listesi.tsx"
    },
    {
      "slug": "koli-detay",
      "name": "Koli Detayı",
      "source": "app/(app)/koli-detay.tsx"
    },
    {
      "slug": "create-koli",
      "name": "Yeni Koli",
      "source": "app/(app)/create-koli.tsx"
    },
    {
      "slug": "order-receipts",
      "name": "Sipariş Seçimi",
      "source": "app/(app)/order-receipts.tsx"
    },
    {
      "slug": "irskoli-listesi",
      "name": "İrsaliye Oluştur",
      "source": "app/(app)/irskoli-listesi.tsx"
    },
    {
      "slug": "barcode-scanner",
      "name": "Barkod Okutma",
      "source": "app/(app)/barcode-scanner.tsx"
    }
  ],
  "versions": [
    {
      "date": "2026-10-15",
      "gitCommit": "36edf726f073ca38f03fda1da9e476966f4bd083",
      "appVersion": "1.0.0",
      "note": "İlk tasarım arşivi. Mevcut uygulamanın 9 ekranı kaynak koddan HTML/CSS olarak kaydedildi.",
      "changedScreens": [
        "login",
        "settings",
        "dashboard",
        "koli-listesi",
        "koli-detay",
        "create-koli",
        "order-receipts",
        "irskoli-listesi",
        "barcode-scanner"
      ],
      "screenNotes": {
        "login": "İlk kayıt — mevcut tasarım.",
        "settings": "İlk kayıt — mevcut tasarım.",
        "dashboard": "İlk kayıt — mevcut tasarım.",
        "koli-listesi": "İlk kayıt — mevcut tasarım.",
        "koli-detay": "İlk kayıt — mevcut tasarım.",
        "create-koli": "İlk kayıt — mevcut tasarım.",
        "order-receipts": "İlk kayıt — mevcut tasarım.",
        "irskoli-listesi": "İlk kayıt — mevcut tasarım.",
        "barcode-scanner": "İlk kayıt — mevcut tasarım."
      },
      "profile": {
        "width": 390,
        "height": 844,
        "platform": "android",
        "theme": "dark",
        "language": "tr",
        "keyboard": "hidden"
      },
      "fixture": "../../fixtures.json",
      "files": [
        "barcode-scanner",
        "create-koli",
        "dashboard",
        "irskoli-listesi",
        "koli-detay",
        "koli-listesi",
        "login",
        "order-receipts",
        "settings"
      ],
      "lightPreview": {
        "id": "archive-2026-10-15-light",
        "files": [
          "barcode-scanner",
          "create-koli",
          "dashboard",
          "irskoli-listesi",
          "koli-detay",
          "koli-listesi",
          "login",
          "order-receipts",
          "settings"
        ]
      }
    }
  ],
  "experiments": [
    {
      "id": "2026-10-16-impeccable-v1",
      "date": "2026-10-16",
      "label": "Impeccable · Okunabilirlik ve işlem akışı",
      "status": "pending_approval",
      "basedOn": "2026-10-15",
      "note": "İlk AI tasarım önerisi. Ana uygulamaya uygulanmadı; kullanıcı onayı bekleniyor.",
      "skill": "impeccable / polish / operate",
      "profile": {
        "width": 390,
        "height": 844,
        "platform": "android",
        "theme": "dark",
        "language": "tr",
        "keyboard": "hidden"
      },
      "screenNotes": {
        "login": [
          "Form, logo ve karşılama metni tek bir okuma akışında hizalandı.",
          "Etiketler ve hatırlatma metni daha okunaklı; ana giriş eylemi belirginleştirildi."
        ],
        "settings": [
          "Ayarlar görünüm, bağlantı/depo ve çalışma tercihleri olarak gruplandı.",
          "İkili tercihler anahtar olarak önerildi; mevcut kapalı durumlar ve değerler korundu.",
          "Kaydet / sıfırla öncelikleri ayrıştırıldı; açıklamalar sadeleştirildi."
        ],
        "dashboard": [
          "Büyük dekoratif başlık ve filigran kaldırıldı; kullanıcı adı öne alındı.",
          "İki erişim alanında daha sakin yüzeyler ve açıklayıcı işlem hiyerarşisi kullanıldı."
        ],
        "koli-listesi": [
          "Koli ve sipariş numaraları taraması kolay satırlara taşındı.",
          "Yüzen ikonların yerine etiketli Barkod / Yeni Koli alt işlem alanı önerildi.",
          "Mevcut yedi kayıt üzerinden koli sayısı gösterildi."
        ],
        "koli-detay": [
          "Sipariş bağlamı, barkod girişi ve ürünler ayrı okunabilir alanlara yerleştirildi.",
          "Ürün miktarı belirginleştirildi; renk, beden, stok ve birim bilgileri korundu.",
          "Dört alt eylem 2 × 2 düzene alındı; koli kapatma ana eylem oldu."
        ],
        "create-koli": [
          "Başlık tekrarı azaltıldı; sipariş seçeneği daha kompakt yatay satır olarak düzenlendi.",
          "Mevcut tek seçenek korundu; yeni işlev eklenmedi."
        ],
        "order-receipts": [
          "Bağımsız koli seçeneği sipariş listesinden görsel olarak ayrıldı.",
          "Sipariş numarası ve müşteri adı hiyerarşisi netleştirildi; altı kayıt korundu."
        ],
        "irskoli-listesi": [
          "Seçim kutuları sola taşındı; açık/kapalı durumları metinli rozetlerle ayrıldı.",
          "Seçim yapılmadan da sonraki adımı anlatan pasif işlem alanı önerildi (0 seçili)."
        ],
        "barcode-scanner": [
          "Sipariş bağlamı ve barkod formu üstten başlayan daha kısa bir akışa alındı.",
          "Barkod alanına görünür etiket eklendi; sayısal veri sabit genişlikli fontla gösterildi."
        ]
      },
      "files": [
        "barcode-scanner",
        "create-koli",
        "dashboard",
        "irskoli-listesi",
        "koli-detay",
        "koli-listesi",
        "login",
        "order-receipts",
        "settings"
      ]
    },
    {
      "id": "2026-10-16-impeccable-v2",
      "date": "2026-10-16",
      "label": "Impeccable · Açık/koyu tema ve renk dengesi",
      "status": "pending_approval",
      "basedOn": "2026-10-15",
      "note": "İkinci AI önerisi: açık/koyu tema, kırmızı marka işlemleri ve yeşil ekleme/kaydetme/tamamlama vurguları. Ana koda uygulanmadı.",
      "skill": "impeccable / polish / operate",
      "profile": {
        "width": 390,
        "height": 844,
        "platform": "android",
        "theme": "dark",
        "language": "tr",
        "keyboard": "hidden",
        "themes": [
          "dark",
          "light"
        ]
      },
      "screenNotes": {
        "login": [
          "Hatırla seçimi ve güvenlik ikonu yeşil; giriş düğmesi marka kırmızısı.",
          "Açık ve koyu tema için ayrı, okunabilir renk paletleri hazırlandı.",
          "Form, logo ve karşılama metni tek bir okuma akışında hizalandı.",
          "Etiketler ve hatırlatma metni daha okunaklı; ana giriş eylemi belirginleştirildi."
        ],
        "settings": [
          "Kaydet yeşil onay eylemi olarak ayrıldı; açık tema seçimi önizlemeyle eşleşir.",
          "Açık ve koyu tema için ayrı, okunabilir renk paletleri hazırlandı.",
          "Ayarlar görünüm, bağlantı/depo ve çalışma tercihleri olarak gruplandı.",
          "İkili tercihler anahtar olarak önerildi; mevcut kapalı durumlar ve değerler korundu.",
          "Kaydet / sıfırla öncelikleri ayrıştırıldı; açıklamalar sadeleştirildi."
        ],
        "dashboard": [
          "Koli erişimi kırmızı, irsaliye oluşturma erişimi yeşil vurgu taşır.",
          "Açık ve koyu tema için ayrı, okunabilir renk paletleri hazırlandı.",
          "Büyük dekoratif başlık ve filigran kaldırıldı; kullanıcı adı öne alındı.",
          "İki erişim alanında daha sakin yüzeyler ve açıklayıcı işlem hiyerarşisi kullanıldı."
        ],
        "koli-listesi": [
          "Yeni Koli kırmızı ana eylem; barkod işlemi nötr kaldı.",
          "Açık ve koyu tema için ayrı, okunabilir renk paletleri hazırlandı.",
          "Koli ve sipariş numaraları taraması kolay satırlara taşındı.",
          "Yüzen ikonların yerine etiketli Barkod / Yeni Koli alt işlem alanı önerildi.",
          "Mevcut yedi kayıt üzerinden koli sayısı gösterildi."
        ],
        "koli-detay": [
          "Ekleme modu ve miktarlar yeşil; silme kırmızı; koli kapatma yeşil tamamlanma eylemi.",
          "Açık ve koyu tema için ayrı, okunabilir renk paletleri hazırlandı.",
          "Sipariş bağlamı, barkod girişi ve ürünler ayrı okunabilir alanlara yerleştirildi.",
          "Ürün miktarı belirginleştirildi; renk, beden, stok ve birim bilgileri korundu."
        ],
        "create-koli": [
          "Sipariş seçeneği yumuşak kırmızı ikon zeminiyle belirginleştirildi.",
          "Açık ve koyu tema için ayrı, okunabilir renk paletleri hazırlandı.",
          "Başlık tekrarı azaltıldı; sipariş seçeneği daha kompakt yatay satır olarak düzenlendi.",
          "Mevcut tek seçenek korundu; yeni işlev eklenmedi."
        ],
        "order-receipts": [
          "Sipariş satırı yönlendirmeleri marka kırmızısıyla vurgulandı.",
          "Açık ve koyu tema için ayrı, okunabilir renk paletleri hazırlandı.",
          "Bağımsız koli seçeneği sipariş listesinden görsel olarak ayrıldı.",
          "Sipariş numarası ve müşteri adı hiyerarşisi netleştirildi; altı kayıt korundu."
        ],
        "irskoli-listesi": [
          "Kapalı durumun yeşil rozeti netleştirildi; seçimsiz işlem pasif kaldı.",
          "Açık ve koyu tema için ayrı, okunabilir renk paletleri hazırlandı.",
          "Seçim kutuları sola taşındı; açık/kapalı durumları metinli rozetlerle ayrıldı.",
          "Seçim yapılmadan da sonraki adımı anlatan pasif işlem alanı önerildi (0 seçili)."
        ],
        "barcode-scanner": [
          "Gönder yeşil işlem düğmesi; sipariş bağlamında kırmızı vurgu korundu.",
          "Açık ve koyu tema için ayrı, okunabilir renk paletleri hazırlandı.",
          "Sipariş bağlamı ve barkod formu üstten başlayan daha kısa bir akışa alındı.",
          "Barkod alanına görünür etiket eklendi; sayısal veri sabit genişlikli fontla gösterildi."
        ]
      },
      "revision": 2,
      "previous": "2026-10-16-impeccable-v1",
      "files": [
        "barcode-scanner",
        "create-koli",
        "dashboard",
        "irskoli-listesi",
        "koli-detay",
        "koli-listesi",
        "login",
        "order-receipts",
        "settings"
      ],
      "lightPreview": {
        "id": "2026-10-16-impeccable-v2-light",
        "files": [
          "barcode-scanner",
          "create-koli",
          "dashboard",
          "irskoli-listesi",
          "koli-detay",
          "koli-listesi",
          "login",
          "order-receipts",
          "settings"
        ]
      }
    },
    {
      "id": "2026-10-16-impeccable-v3",
      "date": "2026-10-16",
      "label": "Impeccable · Koli ekranlarında okunabilirlik",
      "status": "pending_approval",
      "basedOn": "2026-10-15",
      "note": "Üçüncü öneri: yalnız koli listesi ve koli detayında daha büyük yazılar, belirgin satırlar ve ayrı miktar alanı. Ana koda uygulanmadı.",
      "skill": "impeccable / typeset / operate",
      "profile": {
        "width": 390,
        "height": 844,
        "platform": "android",
        "theme": "dark",
        "language": "tr",
        "keyboard": "hidden",
        "themes": [
          "dark",
          "light"
        ]
      },
      "screenNotes": {
        "koli-listesi": [
          "Koli numarası 15 → 20 px, müşteri adı 14 → 16 px, sipariş/depo bilgileri 12–13 → 14 px oldu.",
          "Müşteri, sevkiyat notu, sipariş ve depo ayrı satırlarda; dönüşümlü yüzeyler kayıt sınırını belirginleştiriyor.",
          "Aynı yedi kayıt korunuyor; daha rahat okuma için ekranda daha az kayıt görünüyor."
        ],
        "koli-detay": [
          "Ürün adı 15 → 20 px ve tam satır; miktar 20 → 24 px, ayrı yeşil alanda.",
          "Renk ve beden değerleri 16 px; etiketler ve stok kodu 14 px.",
          "Sipariş başlığı kısaltıldı; ürünlere daha fazla dikey alan ayrıldı. Dört alt işlem korundu."
        ]
      },
      "revision": 3,
      "previous": "2026-10-16-impeccable-v2",
      "files": [
        "koli-detay",
        "koli-listesi"
      ],
      "lightPreview": {
        "id": "2026-10-16-impeccable-v3-light",
        "files": [
          "koli-detay",
          "koli-listesi"
        ]
      }
    },
    {
      "id": "2026-10-22-impeccable-v4",
      "date": "2026-10-22",
      "label": "Impeccable · Ana temanın akış renkleri",
      "status": "pending_approval",
      "basedOn": "2026-10-15",
      "note": "Dördüncü öneri: koli listesi, koli detayı, irsaliye oluşturma ve barkod okutma ekranlarında ana temanın kırmızı (koli), çivit (irsaliye), yeşil (tamamlama) ve amber (açık koli) renkleri anlamlı yerlere geri getirildi. Ana koda uygulanmadı.",
      "skill": "impeccable / colorize + bolder / operate",
      "profile": {
        "width": 390,
        "height": 844,
        "platform": "android",
        "theme": "dark",
        "language": "tr",
        "keyboard": "hidden",
        "themes": [
          "dark",
          "light"
        ]
      },
      "screenNotes": {
        "koli-listesi": [
          "Her koli ayrı bir kart: kırmızı koli ikonu, büyük koli numarası, müşteri ve sevkiyat notu.",
          "Sipariş ve depo kartın alt şeridinde; sipariş numarası koli akışının kırmızısıyla vurgulanır.",
          "Yeni Koli, ana temadaki tarama düğmesinin kırmızı ışımasını taşır; Barkod sakin ikincil düğme."
        ],
        "koli-detay": [
          "Sipariş bağlamı Ana Sayfa kartlarıyla aynı kırmızı gradyan kartta; Extreme şevronu filigran olarak içinde.",
          "Malzeme Ekle seçiliyken düğme ve barkod alanı yeşil; okutma alanı hazır göründüğü için ilk bakışta bulunur.",
          "Ürünler ayrı kartlarda; miktar yeşil alanda. İrsaliye ikonu çivit, Koli Açma amber, Koli Kapatma yeşil."
        ],
        "irskoli-listesi": [
          "İrsaliye akışı ana temadaki çivit rengini taşır: seçili koliler, onay kutuları ve alt işlem düğmesi.",
          "Önizleme seçim modunda çizildi: iki kapalı koli seçili, başlık kaynak koddaki gibi “2 Koli Seçildi”. Kaynak arşiv seçimsizdir.",
          "Açık/Kapalı durumu nokta ve metinli renkli rozetle; renk tek başına anlam taşımaz."
        ],
        "barcode-scanner": [
          "Sipariş bağlamı, Ana Sayfa’daki Koli Listesi kartıyla aynı kırmızı gradyan kartta.",
          "Sipariş no ve cari ayrı satırlarda; barkod alanı büyük sabit genişlikli yazı ve yeşil hazır çerçeveyle.",
          "Gönder yeşil tamamlama düğmesi; Extreme şevronu kartın köşesinde marka filigranı."
        ]
      },
      "revision": 4,
      "previous": "2026-10-16-impeccable-v3",
      "files": [
        "barcode-scanner",
        "irskoli-listesi",
        "koli-detay",
        "koli-listesi"
      ],
      "lightPreview": {
        "id": "2026-10-22-impeccable-v4-light",
        "files": [
          "barcode-scanner",
          "irskoli-listesi",
          "koli-detay",
          "koli-listesi"
        ]
      }
    },
    {
      "id": "2026-10-22-impeccable-v5",
      "date": "2026-10-22",
      "label": "Impeccable · Barkod ve sipariş seçiminde hafif iyileştirme",
      "status": "pending_approval",
      "basedOn": "2026-10-15",
      "note": "Beşinci öneri: barkod okutma kaynak uygulamadaki ortalanmış düzene döndü ve yalnız hafif iyileştirildi; sipariş seçimi koli kartlarıyla aynı dile getirildi. Ana koda uygulanmadı.",
      "skill": "impeccable / polish / operate",
      "profile": {
        "width": 390,
        "height": 844,
        "platform": "android",
        "theme": "dark",
        "language": "tr",
        "keyboard": "hidden",
        "themes": [
          "dark",
          "light"
        ]
      },
      "screenNotes": {
        "barcode-scanner": [
          "Kaynak düzen korundu: ortadaki tarama dairesi, başlık, ortalanmış barkod alanı ve kırmızı Gönder.",
          "Sipariş no fiş etiketinde, cari adı ayrı satırda; “İlk ürünü okutun” talimatı barkod alanının hemen üstünde.",
          "Barkod büyük ve sabit genişlikli yazıyla; alan orijinaldeki gibi sade. Tarama dairesi kırmızı tonlu; ana sayfa düğmesi tonlu, böylece tek dolu kırmızı düğme Gönder."
        ],
        "order-receipts": [
          "Kaynak yapı korundu: arama, siparişsiz koli seçeneği ve sipariş kartları.",
          "Sipariş no 17 → 20 px sabit genişlikli, cari adı 13 → 16 px ana renkte; kartlar koli listesiyle aynı dilde.",
          "Siparişsiz koli seçeneği kırmızı tonlu kartta ve koli ikonuyla; sipariş listesinden “6 sipariş” sayacıyla ayrılır."
        ]
      },
      "revision": 5,
      "previous": "2026-10-22-impeccable-v4",
      "files": [
        "barcode-scanner",
        "order-receipts"
      ],
      "lightPreview": {
        "id": "2026-10-22-impeccable-v5-light",
        "files": [
          "barcode-scanner",
          "order-receipts"
        ]
      }
    },
    {
      "id": "2026-10-22-impeccable-v6",
      "date": "2026-10-22",
      "label": "Impeccable · Kritik sonrası küçük düzeltmeler",
      "status": "pending_approval",
      "basedOn": "2026-10-15",
      "note": "Altıncı öneri: görüntüleyicideki dokuz ekran Impeccable kritiğinden geçti ve yalnız küçük düzeltmeler yapıldı; kaynak önerilerin düzeni ve metinleri korundu. Kırmızı ve çivit tema değerlerinde. Ana koda uygulanmadı.",
      "skill": "impeccable / critique + polish / operate",
      "profile": {
        "width": 390,
        "height": 844,
        "platform": "android",
        "theme": "dark",
        "language": "tr",
        "keyboard": "hidden",
        "themes": [
          "dark",
          "light"
        ]
      },
      "screenNotes": {
        "login": [
          "Kaynak: v2 girişi; düzen ve metinler korundu.",
          "“Beni hatırla” işareti orijinaldeki gibi marka kırmızısı, güvenlik kilidi nötr: yeşil yalnız tamamlama anlamında kalır.",
          "Ayarlar ve şifre göster düğmeleri 48 px dokunma alanında; açıklama ve alt bilgi 14 px."
        ],
        "settings": [
          "Kaynak: v2 ayarları; bölümler, anahtarlar ve değerler korundu.",
          "Bağlantı alanları orijinal sırada: API URL ve hemen altında açıklaması, Şirket kodu ile Şirket şifresi yan yana, en son Depo ID.",
          "Bölüm başlıkları markanın büyük harfli etiket stilinde; segmentler 48 px, anahtarlar ayarın adıyla okunur."
        ],
        "dashboard": [
          "Kaynak: v2 Ana Sayfa; iki kartlı yapı korundu.",
          "İrsaliye karosu çivit, Koli Listesi karosu kırmızı: sonraki ekranlardaki akış renkleriyle aynı.",
          "Kartlarda › kullanıldı (↗ dış bağlantı gibi okunuyordu); kullanıcı adı 30 → 24 px. Gradyan kartlara dönüş kullanıcı kararına bırakıldı."
        ],
        "create-koli": [
          "Kaynak: v2 Yeni Koli; tek seçenek korundu.",
          "Sipariş seçeneği fiş ikonuyla, Sipariş Seçimi’ndeki gibi; karo koli kırmızısında.",
          "Seçenek başlığı 16 px kalın, açıklaması 13 → 14 px: Sipariş Seçimi’ndeki siparişsiz koli seçeneğiyle aynı ölçüde."
        ],
        "koli-listesi": [
          "Kaynak: v4 koli kartları; sipariş no nötr renkte, sipariş ve depo kartın alt şeridinde.",
          "Kart iç boşlukları sıkılaştırıldı: ekranda daha çok koli görünür.",
          "Yeni Koli tek kırmızı, ışımalı düğme; Barkod düğmesinin ikonu nötr."
        ],
        "koli-detay": [
          "Kaynak: v4; sipariş bağlamı marka kırmızısı gradyan kartta, filigransız.",
          "Miktar nötr zeminde yeşil sayıyla (orijinaldeki gibi); Koli sil ikonu zeminsiz ve tema hata kırmızısında, ürün karolarıyla karışmaz.",
          "Kart ve alt çubuk boşlukları sıkılaştırıldı; sipariş bağlantısı, Yeni Koli ve mod düğmeleri 48 px."
        ],
        "irskoli-listesi": [
          "Kaynak: v4; seçim modunda iki kapalı koli seçili, başlık kaynak koddaki gibi “2 Koli Seçildi”.",
          "Çivit tema değerinde; onay kutusunun köşesi 4 px, satırlar onay kutusu olarak okunur.",
          "Açık/Kapalı rozetleri renk, nokta ve kelimeyle; renk tek başına anlam taşımaz."
        ],
        "barcode-scanner": [
          "Kaynak: v5; orijinal ortalanmış düzen korundu.",
          "Tarama dairesi orijinaldeki gibi nötr gri, ikon kırmızı: dokunulacak bir düğme gibi durmaz.",
          "“İlk ürünü okutun” 16 px ana renkte ve alanın etiketi; başlık düğmeleri 48 px."
        ],
        "order-receipts": [
          "Kaynak: v5; arama, siparişsiz koli seçeneği ve sipariş kartları korundu.",
          "Siparişsiz koli seçeneği sıradan kart görünümünde; uyarı şeridi gibi durmaz, koli ekleme ikonu ve alt satırıyla ayrışır.",
          "Cari adı en fazla iki satır; kırmızı ikon tonu barkod ekranıyla aynı."
        ]
      },
      "revision": 6,
      "previous": "2026-10-22-impeccable-v5",
      "files": [
        "barcode-scanner",
        "create-koli",
        "dashboard",
        "irskoli-listesi",
        "koli-detay",
        "koli-listesi",
        "login",
        "order-receipts",
        "settings"
      ],
      "lightPreview": {
        "id": "2026-10-22-impeccable-v6-light",
        "files": [
          "barcode-scanner",
          "create-koli",
          "dashboard",
          "irskoli-listesi",
          "koli-detay",
          "koli-listesi",
          "login",
          "order-receipts",
          "settings"
        ]
      }
    },
    {
      "id": "2026-10-22-impeccable-v7",
      "date": "2026-10-22",
      "label": "Impeccable · Okutma sonuçları ve durumlar",
      "status": "pending_approval",
      "basedOn": "2026-10-15",
      "note": "Yedinci öneri: okutmadan sonra olanlar (yeşil başarı parlaması, tam ekran hata, miktar aşımı onayı, gönderim) Barkod Okutma ve Koli Detayı’nın durumları olarak çizildi. Açık koliler irsaliyeye eklenemez; siparişsiz seçenek “Siparişsiz koli oluştur” oldu. Ana koda uygulanmadı.",
      "skill": "impeccable / harden / operate",
      "profile": {
        "width": 390,
        "height": 844,
        "platform": "android",
        "theme": "dark",
        "language": "tr",
        "keyboard": "hidden",
        "themes": [
          "dark",
          "light"
        ]
      },
      "screenNotes": {
        "login": [
          "Kaynak: v2 girişi; düzen ve metinler korundu.",
          "“Beni hatırla” işareti orijinaldeki gibi marka kırmızısı, güvenlik kilidi nötr: yeşil yalnız tamamlama anlamında kalır.",
          "Ayarlar ve şifre göster düğmeleri 48 px dokunma alanında; açıklama ve alt bilgi 14 px."
        ],
        "settings": [
          "Kaynak: v2 ayarları; bölümler, anahtarlar ve değerler korundu.",
          "Bağlantı alanları orijinal sırada: API URL ve hemen altında açıklaması, Şirket kodu ile Şirket şifresi yan yana, en son Depo ID.",
          "Bölüm başlıkları markanın büyük harfli etiket stilinde; segmentler 48 px, anahtarlar ayarın adıyla okunur."
        ],
        "dashboard": [
          "Kaynak: v2 Ana Sayfa; iki kartlı yapı korundu.",
          "İrsaliye karosu çivit, Koli Listesi karosu kırmızı: sonraki ekranlardaki akış renkleriyle aynı.",
          "Kartlarda › kullanıldı (↗ dış bağlantı gibi okunuyordu); kullanıcı adı 30 → 24 px. Gradyan kartlara dönüş kullanıcı kararına bırakıldı."
        ],
        "create-koli": [
          "Kaynak: v2 Yeni Koli; tek seçenek korundu.",
          "Sipariş seçeneği fiş ikonuyla, Sipariş Seçimi’ndeki gibi; karo koli kırmızısında.",
          "Seçenek başlığı 16 px kalın, açıklaması 13 → 14 px: Sipariş Seçimi’ndeki siparişsiz koli seçeneğiyle aynı ölçüde."
        ],
        "koli-listesi": [
          "Kaynak: v4 koli kartları; sipariş no nötr renkte, sipariş ve depo kartın alt şeridinde.",
          "Kart iç boşlukları sıkılaştırıldı: ekranda daha çok koli görünür.",
          "Yeni Koli tek kırmızı, ışımalı düğme; Barkod düğmesinin ikonu nötr."
        ],
        "koli-detay": [
          "Kaynak: v4; sipariş bağlamı marka kırmızısı gradyan kartta, filigransız.",
          "Miktar nötr zeminde yeşil sayıyla (orijinaldeki gibi); Koli sil ikonu zeminsiz ve tema hata kırmızısında, ürün karolarıyla karışmaz.",
          "Kart ve alt çubuk boşlukları sıkılaştırıldı; sipariş bağlantısı, Yeni Koli ve mod düğmeleri 48 px.",
          "Durum seçicide: Okutma başarılı (yeşil parlama), Başarılı okutmadan sonra, Okutma hatalı ve Miktar aşımı."
        ],
        "irskoli-listesi": [
          "Kaynak: v6; seçim modunda iki kapalı koli seçili.",
          "Açık koliler irsaliyeye eklenemez (kullanıcı kararı): kesik çizgili satır, pasif onay kutusu ve satırda “Kapatılmadan eklenemez”.",
          "Açık/Kapalı rozetleri renk, nokta ve kelimeyle; seçili satırlar çivit."
        ],
        "barcode-scanner": [
          "Kaynak: v5; orijinal ortalanmış düzen korundu.",
          "Tarama dairesi orijinaldeki gibi nötr gri, ikon kırmızı: dokunulacak bir düğme gibi durmaz.",
          "“İlk ürünü okutun” 16 px ana renkte ve alanın etiketi; başlık düğmeleri 48 px.",
          "Durum seçicide: Gönderiliyor, Okutma başarılı (yeni kolinin detayı) ve Okutma hatalı."
        ],
        "order-receipts": [
          "Kaynak: v6; arama, siparişsiz koli seçeneği ve sipariş kartları korundu.",
          "Siparişsiz seçenek “Siparişsiz koli oluştur / Koli bir siparişe bağlanmaz” (kullanıcı kararı): eylemi söyler, uyarı gibi okunmaz.",
          "Cari adı en fazla iki satır; kırmızı ikon tonu barkod ekranıyla aynı."
        ]
      },
      "revision": 7,
      "previous": "2026-10-22-impeccable-v6",
      "states": {
        "barcode-scanner": [
          {
            "id": "gonderiliyor",
            "name": "Gönderiliyor",
            "notes": [
              "Gönder’e basılınca düğmede yükleniyor işareti döner ve düğme pasifleşir; çift gönderim olmaz. Uygulamadaki davranış.",
              "Barkod alanı yanıt gelene kadar kilitli ve soluk; ses ve titreşim yok."
            ]
          },
          {
            "id": "okutma-basarili",
            "name": "Okutma başarılı",
            "notes": [
              "Okutma başarılıysa koli açılır ve doğrudan yeni kolinin detayına geçilir: KL-001255, ilk ürün 1 adet. Uygulamadaki davranış.",
              "Altta 2 sn kalan bildirim “Başarılı” ve sunucunun açıklamasını gösterir; buradaki açıklama metni örnektir.",
              "Okutma alanı yeniden odaklanır; sonraki ürün hemen okutulabilir."
            ]
          },
          {
            "id": "okutma-hatali",
            "name": "Okutma hatalı",
            "notes": [
              "Tam ekran hata kırmızısı, 500 ms titreşim ve Ayarlar’daki hata sesi (Klasik Bip ya da yalnız titreşim). Marka kırmızısı düğmelerden ölçekle ve daha sıcak tonla (#FF3340) ayrışır.",
              "Neden sunucunun açıklamasıdır; yoksa uygulamanın kendi metni “Koli oluşturulurken hata meydana geldi.” gösterilir. Okutulan barkod altta yazılır.",
              "Tamam başparmak bölgesinde; kapanınca alan temizlenir ve yeniden odaklanır."
            ]
          }
        ],
        "koli-detay": [
          {
            "id": "okutma-basarili",
            "name": "Okutma başarılı",
            "notes": [
              "Ürün eklenince ~350 ms tam ekran yeşil parlama: onay işareti, “Eklendi” ve ürünün yeni miktarı. Ses yok; marka dokümanında başarı sessizdir.",
              "Parlama okutmayı durdurmaz; biter bitmez sonraki barkod okutulabilir.",
              "Eklenen ürün, liste yenilenince miktarı artan satırdan bulunur; servis değişikliği gerekmez."
            ]
          },
          {
            "id": "okutma-sonrasi",
            "name": "Başarılı okutmadan sonra",
            "notes": [
              "Parlamadan sonra liste yenilenir; miktarı artan ürün yeşil çerçeveyle işaretlenir.",
              "Altta 2 sn kalan bildirim hangi ürünün eklendiğini ve yeni miktarı söyler; uygulamadaki “Başarılı / Ürün eklendi” yerine.",
              "Silme modunda aynı akış “Ürün silindi” ile çalışır."
            ]
          },
          {
            "id": "okutma-hatali",
            "name": "Okutma hatalı",
            "notes": [
              "Tam ekran hata kırmızısı, 500 ms titreşim ve hata sesi; liste ve okutma alanı arkada değişmeden kalır.",
              "Neden sunucunun açıklamasıdır (buradaki metin örnektir); yoksa “Bir hata oluştu”. Okutulan barkod altta yazılır.",
              "Tamam başparmak bölgesinde; kapanınca okutma alanı yeniden odaklanır."
            ]
          },
          {
            "id": "miktar-asimi",
            "name": "Miktar aşımı",
            "notes": [
              "Sipariş miktarı aşılırsa hata sesi ve titreşimle onay penceresi açılır; metin ve “Hayır / Evet” uygulamadakiyle aynı.",
              "Pencere alttan açılır, düğmeler başparmak bölgesinde; okutulan barkod gösterilir. Evet, ürünü sınırı yok sayarak ekler.",
              "Siparişte olmayan ürün okutulursa aynı pencere “Sipariş Dışı Ürün” başlığıyla açılır."
            ]
          }
        ]
      },
      "files": [
        "barcode-scanner",
        "create-koli",
        "dashboard",
        "irskoli-listesi",
        "koli-detay",
        "koli-listesi",
        "login",
        "order-receipts",
        "settings"
      ],
      "lightPreview": {
        "id": "2026-10-22-impeccable-v7-light",
        "files": [
          "barcode-scanner",
          "create-koli",
          "dashboard",
          "irskoli-listesi",
          "koli-detay",
          "koli-listesi",
          "login",
          "order-receipts",
          "settings"
        ]
      }
    },
    {
      "id": "2026-10-23-impeccable-v8",
      "date": "2026-10-23",
      "label": "Impeccable · Seri okutma bildirimi",
      "status": "pending_approval",
      "basedOn": "2026-10-15",
      "note": "Sekizinci öneri: seri okutma için tam ekran yeşil ve kırmızı kaldırıldı. Başarı ve hata aynı alt bildirimde; başarı 2 sn kalır, hata sonraki okutmaya kadar kalır ve okutma alanını kırmızı çerçeveler. Ana koda uygulanmadı.",
      "skill": "impeccable / harden / operate",
      "profile": {
        "width": 390,
        "height": 844,
        "platform": "android",
        "theme": "dark",
        "language": "tr",
        "keyboard": "hidden",
        "themes": [
          "dark",
          "light"
        ]
      },
      "screenNotes": {
        "login": [
          "Kaynak: v2 girişi; düzen ve metinler korundu.",
          "“Beni hatırla” işareti orijinaldeki gibi marka kırmızısı, güvenlik kilidi nötr: yeşil yalnız tamamlama anlamında kalır.",
          "Ayarlar ve şifre göster düğmeleri 48 px dokunma alanında; açıklama ve alt bilgi 14 px."
        ],
        "settings": [
          "Kaynak: v2 ayarları; bölümler, anahtarlar ve değerler korundu.",
          "Bağlantı alanları orijinal sırada: API URL ve hemen altında açıklaması, Şirket kodu ile Şirket şifresi yan yana, en son Depo ID.",
          "Bölüm başlıkları markanın büyük harfli etiket stilinde; segmentler 48 px, anahtarlar ayarın adıyla okunur."
        ],
        "dashboard": [
          "Kaynak: v2 Ana Sayfa; iki kartlı yapı korundu.",
          "İrsaliye karosu çivit, Koli Listesi karosu kırmızı: sonraki ekranlardaki akış renkleriyle aynı.",
          "Kartlarda › kullanıldı (↗ dış bağlantı gibi okunuyordu); kullanıcı adı 30 → 24 px. Gradyan kartlara dönüş kullanıcı kararına bırakıldı."
        ],
        "create-koli": [
          "Kaynak: v2 Yeni Koli; tek seçenek korundu.",
          "Sipariş seçeneği fiş ikonuyla, Sipariş Seçimi’ndeki gibi; karo koli kırmızısında.",
          "Seçenek başlığı 16 px kalın, açıklaması 13 → 14 px: Sipariş Seçimi’ndeki siparişsiz koli seçeneğiyle aynı ölçüde."
        ],
        "koli-listesi": [
          "Kaynak: v4 koli kartları; sipariş no nötr renkte, sipariş ve depo kartın alt şeridinde.",
          "Kart iç boşlukları sıkılaştırıldı: ekranda daha çok koli görünür.",
          "Yeni Koli tek kırmızı, ışımalı düğme; Barkod düğmesinin ikonu nötr."
        ],
        "koli-detay": [
          "Kaynak: v4; sipariş bağlamı marka kırmızısı gradyan kartta, filigransız.",
          "Miktar nötr zeminde yeşil sayıyla (orijinaldeki gibi); Koli sil ikonu zeminsiz ve tema hata kırmızısında, ürün karolarıyla karışmaz.",
          "Kart ve alt çubuk boşlukları sıkılaştırıldı; sipariş bağlantısı, Yeni Koli ve mod düğmeleri 48 px.",
          "Durum seçicide: Okutma başarılı, Okutma hatalı (ikisi de alttaki bildirim) ve Miktar aşımı."
        ],
        "irskoli-listesi": [
          "Kaynak: v6; seçim modunda iki kapalı koli seçili.",
          "Açık koliler irsaliyeye eklenemez (kullanıcı kararı): kesik çizgili satır, pasif onay kutusu ve satırda “Kapatılmadan eklenemez”.",
          "Açık/Kapalı rozetleri renk, nokta ve kelimeyle; seçili satırlar çivit."
        ],
        "barcode-scanner": [
          "Kaynak: v5; orijinal ortalanmış düzen korundu.",
          "Tarama dairesi orijinaldeki gibi nötr gri, ikon kırmızı: dokunulacak bir düğme gibi durmaz.",
          "“İlk ürünü okutun” 16 px ana renkte ve alanın etiketi; başlık düğmeleri 48 px.",
          "Durum seçicide: Gönderiliyor, Okutma başarılı (yeni kolinin detayı) ve Okutma hatalı (alttaki bildirim)."
        ],
        "order-receipts": [
          "Kaynak: v6; arama, siparişsiz koli seçeneği ve sipariş kartları korundu.",
          "Siparişsiz seçenek “Siparişsiz koli oluştur / Koli bir siparişe bağlanmaz” (kullanıcı kararı): eylemi söyler, uyarı gibi okunmaz.",
          "Cari adı en fazla iki satır; kırmızı ikon tonu barkod ekranıyla aynı."
        ]
      },
      "revision": 8,
      "previous": "2026-10-22-impeccable-v7",
      "states": {
        "barcode-scanner": [
          {
            "id": "gonderiliyor",
            "name": "Gönderiliyor",
            "notes": [
              "Gönder’e basılınca düğmede yükleniyor işareti döner ve düğme pasifleşir; çift gönderim olmaz. Uygulamadaki davranış.",
              "Barkod alanı yanıt gelene kadar kilitli ve soluk; ses ve titreşim yok."
            ]
          },
          {
            "id": "okutma-basarili",
            "name": "Okutma başarılı",
            "notes": [
              "Okutma başarılıysa koli açılır ve doğrudan yeni kolinin detayına geçilir: KL-001255, ilk ürün 1 adet. Uygulamadaki davranış; araya tam ekran parlama girmez.",
              "Altta 2 sn kalan bildirim “Başarılı” ve sunucunun açıklamasını gösterir; buradaki açıklama metni örnektir.",
              "Okutma alanı yeniden odaklanır; sonraki ürün hemen okutulabilir."
            ]
          },
          {
            "id": "okutma-hatali",
            "name": "Okutma hatalı",
            "notes": [
              "Ekran kırmızıya boyanmaz: hata, başarı bildirimiyle aynı yerde ve biçimde çıkar; kırmızı ikon, kırmızı çerçeve, 500 ms titreşim ve Ayarlar’daki hata sesi.",
              "Okutma alanı kırmızı çerçeveli, okutulan barkod alanda kalır; yeniden okutunca yerine yazılır.",
              "Bildirim kendiliğinden kapanmaz: sonraki okutmada ya da × ile kapanır. Neden sunucunun açıklamasıdır; yoksa uygulamanın metni."
            ]
          }
        ],
        "koli-detay": [
          {
            "id": "okutma-basarili",
            "name": "Okutma başarılı",
            "notes": [
              "Seri okutma için tam ekran parlama yok: liste yenilenir, miktarı artan ürün yeşil çerçeveyle işaretlenir, altta bildirim çıkar. Ses yok.",
              "Bildirim 2 sn kalır ve hangi ürünün eklendiğini, yeni miktarı söyler; uygulamadaki “Başarılı / Ürün eklendi” yerine. Yeni okutma eskisinin yerine geçer.",
              "Okutma alanı odakta kalır; dokunmadan sonraki barkod okutulur. Silme modunda aynı bildirim “Ürün silindi” der."
            ]
          },
          {
            "id": "okutma-hatali",
            "name": "Okutma hatalı",
            "notes": [
              "Başarı bildirimiyle aynı yer ve biçim; kırmızı ikon ve çerçeve, 500 ms titreşim ve hata sesi. Liste değişmez.",
              "Okutma alanı kırmızı çerçeveli ve okutulan barkodu gösterir; bildirimde neden ve barkod yazar (neden metni örnektir, yoksa “Bir hata oluştu”).",
              "Bildirim sonraki okutmaya kadar kalır, × ile de kapanır; Tamam’a basmak gerekmez, okutma alanı odakta kalır."
            ]
          },
          {
            "id": "miktar-asimi",
            "name": "Miktar aşımı",
            "notes": [
              "v7’deki gibi: karar gerektiği için okutma durur ve alttan pencere açılır; metin ve “Hayır / Evet” uygulamadakiyle aynı.",
              "Düğmeler başparmak bölgesinde; okutulan barkod gösterilir. Evet, ürünü sınırı yok sayarak ekler.",
              "Siparişte olmayan ürün okutulursa aynı pencere “Sipariş Dışı Ürün” başlığıyla açılır."
            ]
          }
        ]
      },
      "files": [
        "barcode-scanner",
        "create-koli",
        "dashboard",
        "irskoli-listesi",
        "koli-detay",
        "koli-listesi",
        "login",
        "order-receipts",
        "settings"
      ],
      "lightPreview": {
        "id": "2026-10-23-impeccable-v8-light",
        "files": [
          "barcode-scanner",
          "create-koli",
          "dashboard",
          "irskoli-listesi",
          "koli-detay",
          "koli-listesi",
          "login",
          "order-receipts",
          "settings"
        ]
      }
    }
  ]
};
