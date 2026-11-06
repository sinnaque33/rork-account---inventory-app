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
    },
    {
      "date": "2026-11-06",
      "gitCommit": "e49528dd1dd92d9b21928b0ba39638ae677803e7",
      "appVersion": "1.0.0",
      "note": "İkinci arşiv: dokuz ekranın yeni tasarımı uygulamada.",
      "changedScreens": [
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
      "screenNotes": {
        "login": "Hoş geldiniz ekranı; açık temada beyaz sayfa.",
        "settings": "Uygulama ayarları; açık temada seçili seçenek beyaz.",
        "dashboard": "İki kart aynı boyda, çıkış düğmesi başlıkta.",
        "koli-listesi": "Düz liste; her kolide sipariş no. Altta eşit boyda Koli Ara ve Yeni Koli. Yazılar bir boy küçük.",
        "koli-detay": "Kırmızı sipariş kartı, miktar sağ üstte, okutma hatası altta bildirim. Klavye yalnız alana dokununca açılır.",
        "create-koli": "Sipariş seçeneği tek satırlık kart.",
        "order-receipts": "Düz liste, kartta sipariş no ve cari. Yazılar bir boy küçük.",
        "irskoli-listesi": "Siparişe göre gruplu seçim, Tümünü seç, satırın sağındaki okla koli detayı. Yazılar bir boy küçük.",
        "barcode-scanner": "Okutma alanı 18 px, diğer yazılar bir boy küçük. Hata altta bildirim. Klavye yalnız alana dokununca açılır."
      },
      "profile": {
        "width": 390,
        "height": 844,
        "platform": "android",
        "theme": "dark",
        "language": "tr",
        "keyboard": "hidden"
      },
      "fixture": "../../fixtures-api.json",
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
        "id": "archive-2026-11-06-light",
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
    },
    {
      "id": "2026-10-27-impeccable-v10",
      "date": "2026-10-27",
      "revision": 10,
      "previous": "2026-10-27-impeccable-v9",
      "status": "rejected",
      "basedOn": "2026-10-15",
      "label": "Impeccable · Koli Detayı ürün tablosu",
      "note": "Onuncu öneri: Koli Detayı’nda ürünler kart yerine tek tabloda. Sütun başlıkları bir kez, miktarlar tek sütunda, en altta toplam. Veri test sunucusunun koliDetay yanıtı. Ana koda uygulanmadı.",
      "skill": "impeccable / layout",
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
        "koli-detay": [
          "Ürünler tek tabloda: Ürün · Lot · Miktar başlıkları bir kez yazılır. Yanıtta görsel olmadığı için ikon karosu kaldırıldı; satır başına üç blok yerine tek satır.",
          "Solda ürün kodu, altında renk, en altta barkod (sabit genişlikli, soluk). Miktarlar sağda, alt alta hizalı ve yeşil: okutma sırasında göz tek sütunda iner.",
          "Tablonun sonunda toplam lot ve toplam miktar; özet satırında da “toplam miktar”. Birim yanıtta olmadığı için yazılmaz. Sunucunun ekleyeceği yeni sh_ alanları renk satırına düşer."
        ]
      },
      "states": {
        "koli-detay": [
          {
            "id": "okutma-basarili",
            "name": "Okutma başarılı",
            "notes": [
              "Bildirim altta, 2 sn. Eklenen satır yeşil zeminli, miktarı yeşil ve yeni değeriyle (10 → 11); toplam da güncellenir.",
              "Ses yok, dokunma gerekmez; yeni okutma eskisinin yerine geçer.",
              "Silme modunda aynı bildirim “Ürün silindi” der."
            ]
          },
          {
            "id": "okutma-hatali",
            "name": "Okutma hatalı",
            "notes": [
              "Başarı bildirimiyle aynı yer ve biçim; kırmızı ikon ve çerçeve, 500 ms titreşim ve hata sesi. Tablo değişmez.",
              "Okutma alanı kırmızı çerçeveli ve okutulan barkodu gösterir; neden metni örnektir.",
              "Bildirim sonraki okutmaya kadar kalır, × ile de kapanır."
            ]
          },
          {
            "id": "miktar-asimi",
            "name": "Miktar aşımı",
            "notes": [
              "Karar gerektiği için okutmayı durduran tek durum: alttan pencere, uygulamadaki metin ve “Hayır / Evet”.",
              "Okutulan barkod, tablodaki T4121’in gerçek barkodu.",
              "Siparişte olmayan ürün okutulursa aynı pencere “Sipariş Dışı Ürün” başlığıyla açılır."
            ]
          }
        ]
      },
      "rejectedNote": "Kullanıcı (2026-10-27): kart görünümü daha iyiydi; istenen kartın iyileştirilmesiydi. Yerine v11.",
      "files": [
        "koli-detay"
      ],
      "lightPreview": {
        "id": "2026-10-27-impeccable-v10-light",
        "files": [
          "koli-detay"
        ]
      }
    },
    {
      "id": "2026-10-27-impeccable-v11",
      "date": "2026-10-27",
      "revision": 11,
      "previous": "2026-10-27-impeccable-v9",
      "status": "pending_approval",
      "basedOn": "2026-10-15",
      "label": "Impeccable · Koli Detayı ürün kartı",
      "note": "On birinci öneri: Koli Detayı’nın v9 ürün kartı iyileştirildi (kullanıcı tabloyu değil kartı tercih etti). Miktar sağ üstte, kartlar yarı yükseklikte. Veri test sunucusunun koliDetay yanıtı. Ana koda uygulanmadı.",
      "skill": "impeccable / layout",
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
        "koli-detay": [
          "v9 kartı korunur: karo, kart dili, renkler. Etiketli alt bölüm kaldırıldı; kart ~170 px’ten ~110 px’e indi, ekranda daha çok ürün görünür.",
          "Miktar kartın sağ üst köşesinde, büyük ve yeşil: kartlar arasında hep aynı dikey hizada, okutma sırasında göz tek çizgide iner.",
          "Barkod ürün kodunun altında; renk küçük bir etiket, yanında “2 lot”. Birim yanıtta yok, yazılmaz; sunucunun ekleyeceği yeni alanlar aynı satıra düşer."
        ]
      },
      "states": {
        "koli-detay": [
          {
            "id": "okutma-basarili",
            "name": "Okutma başarılı",
            "notes": [
              "Bildirim altta, 2 sn. Eklenen ürünün kartı yeşil çerçeveli, miktarı yeni değeriyle (10 → 11).",
              "Ses yok, dokunma gerekmez; yeni okutma eskisinin yerine geçer.",
              "Silme modunda aynı bildirim “Ürün silindi” der."
            ]
          },
          {
            "id": "okutma-hatali",
            "name": "Okutma hatalı",
            "notes": [
              "Başarı bildirimiyle aynı yer ve biçim; kırmızı ikon ve çerçeve, 500 ms titreşim ve hata sesi. Liste değişmez.",
              "Okutma alanı kırmızı çerçeveli ve okutulan barkodu gösterir; neden metni örnektir.",
              "Bildirim sonraki okutmaya kadar kalır, × ile de kapanır."
            ]
          },
          {
            "id": "miktar-asimi",
            "name": "Miktar aşımı",
            "notes": [
              "Karar gerektiği için okutmayı durduran tek durum: alttan pencere, uygulamadaki metin ve “Hayır / Evet”.",
              "Okutulan barkod, listedeki T4121’in gerçek barkodu.",
              "Siparişte olmayan ürün okutulursa aynı pencere “Sipariş Dışı Ürün” başlığıyla açılır."
            ]
          }
        ]
      },
      "files": [
        "koli-detay"
      ],
      "lightPreview": {
        "id": "2026-10-27-impeccable-v11-light",
        "files": [
          "koli-detay"
        ]
      }
    },
    {
      "id": "2026-10-27-impeccable-v12",
      "date": "2026-10-27",
      "revision": 12,
      "previous": "2026-10-27-impeccable-v11",
      "status": "pending_approval",
      "basedOn": "2026-10-15",
      "label": "Impeccable · Okunabilirlik ve gruplama",
      "note": "On ikinci öneri: kullanıcı geri bildirimi. Kodlar sabit genişlikli yazı tipinden çıktı; Ana Sayfa kartları eşit boy; Koli Listesi siparişe göre gruplu; Koli Detayı kartı v9 düzeninde, miktar v11’deki gibi; Sipariş Seçimi cariye göre gruplu. İrsaliye v9’da kalır. Ana koda uygulanmadı.",
      "skill": "impeccable / typeset + layout",
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
        "dashboard": [
          "İki kart aynı yükseklikte: alt metni iki satıra inen İrsaliye kartı Koli Listesi’ni de kendi boyuna çeker.",
          "Metinler, renkler ve düzen v8 ile aynı."
        ],
        "koli-listesi": [
          "Koliler siparişe göre gruplu: başlıkta “Sipariş No 00000151”, siparişin açıklaması ve koli sayısı. Sipariş numarası artık açıkça yazıyor.",
          "Her satır bir koli: “Koli 022” büyük, altında tam koli no. Satır 64 px, dokunma alanı satırın tamamı.",
          "Sıra servisin sırası (en yeni önce); bir sipariş ilk göründüğü yerde toplanır. Sayfalama gelirse aynı siparişin sonraki kolileri aynı gruba eklenir.",
          "Kodlar sabit genişlikli yazı tipinden çıktı: aynı yazı tipi, rakamlar eşit genişlikte."
        ],
        "koli-detay": [
          "Üst kısım v11 ile aynı.",
          "Kart v9 düzeninde: ürün kodu, altında “Barkod …”, ince çizginin altında etiketli Renk ve Lot adeti.",
          "Miktar v11’deki gibi sağ üstte, büyük ve yeşil; bütün kartlarda aynı hizada."
        ],
        "order-receipts": [
          "Veri test sunucusunun orderReceipts yanıtından (ilk 24 kayıt). Kartın ikinci satırı depo değil cari (CurrentAccountName); depo yok.",
          "Servis siparişleri cariye göre sıralı döndürüyor ve çoğu carinin birden çok siparişi var: her cari bir kart, başlıkta cari adı (en fazla iki satır) ve sipariş sayısı, satırlarda “Sipariş No 00000151”, 56 px.",
          "Koli Listesi ile aynı grup dili. Uygulamadaki önek “Fiş:”; öneride “Sipariş No”.",
          "Siparişsiz koli seçeneği ve arama (sipariş no veya cari) v8 ile aynı."
        ],
        "barcode-scanner": [
          "Sipariş ve barkod sabit genişlikli yazı tipinden çıktı; barkod aralığı daraldı.",
          "Sipariş çipi ve altındaki cari gerçek veriyle: 00000151, BEBETTO TEKSTİL A.Ş.",
          "Düzen ve durumlar v8 ile aynı."
        ]
      },
      "states": {
        "koli-detay": [
          {
            "id": "okutma-basarili",
            "name": "Okutma başarılı",
            "notes": [
              "Bildirim altta, 2 sn. Eklenen ürünün kartı yeşil çerçeveli, miktarı yeni değeriyle (10 → 11).",
              "Ses yok, dokunma gerekmez; yeni okutma eskisinin yerine geçer.",
              "Silme modunda aynı bildirim “Ürün silindi” der."
            ]
          },
          {
            "id": "okutma-hatali",
            "name": "Okutma hatalı",
            "notes": [
              "Başarı bildirimiyle aynı yer ve biçim; kırmızı ikon ve çerçeve, 500 ms titreşim ve hata sesi. Liste değişmez.",
              "Okutma alanı kırmızı çerçeveli ve okutulan barkodu gösterir; neden metni örnektir.",
              "Bildirim sonraki okutmaya kadar kalır, × ile de kapanır."
            ]
          },
          {
            "id": "miktar-asimi",
            "name": "Miktar aşımı",
            "notes": [
              "Karar gerektiği için okutmayı durduran tek durum: alttan pencere, uygulamadaki metin ve “Hayır / Evet”.",
              "Okutulan barkod, listedeki T4121’in gerçek barkodu.",
              "Siparişte olmayan ürün okutulursa aynı pencere “Sipariş Dışı Ürün” başlığıyla açılır."
            ]
          }
        ],
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
              "Okutma başarılıysa koli açılır ve doğrudan yeni kolinin detayına geçilir: 00000151-023, ilk ürün 1 adet. Uygulamadaki davranış; araya tam ekran parlama girmez.",
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
        ]
      },
      "files": [
        "barcode-scanner",
        "dashboard",
        "koli-detay",
        "koli-listesi",
        "order-receipts"
      ],
      "lightPreview": {
        "id": "2026-10-27-impeccable-v12-light",
        "files": [
          "barcode-scanner",
          "dashboard",
          "koli-detay",
          "koli-listesi",
          "order-receipts"
        ]
      }
    },
    {
      "id": "2026-10-27-impeccable-v13",
      "date": "2026-10-27",
      "revision": 13,
      "previous": "2026-10-27-impeccable-v12",
      "status": "pending_approval",
      "basedOn": "2026-10-15",
      "label": "Impeccable · Açık tema renkleri",
      "note": "On üçüncü öneri: yalnız açık tema renkleri (kullanıcı: koyu tema iyi, açık temada okunabilirlik zayıf). Ekranlar güncel önerilerinden (v12, İrsaliye v9, Giriş/Ayarlar/Koli Oluştur v8) taşındı. Ana koda uygulanmadı.",
      "skill": "impeccable / colorize",
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
          "Açık tema: bütün ekranlarda aynı nötr gri sayfa ve üstünde beyaz kartlar, gerçek kart gölgesi; yazılar morumsu griden nötr koyu griye. Koyu tema değişmedi.",
          "Kaynak: v2 girişi; düzen ve metinler korundu.",
          "“Beni hatırla” işareti orijinaldeki gibi marka kırmızısı, güvenlik kilidi nötr: yeşil yalnız tamamlama anlamında kalır.",
          "Ayarlar ve şifre göster düğmeleri 48 px dokunma alanında; açıklama ve alt bilgi 14 px."
        ],
        "settings": [
          "Açık tema: bütün ekranlarda aynı nötr gri sayfa ve üstünde beyaz kartlar, gerçek kart gölgesi; yazılar morumsu griden nötr koyu griye. Koyu tema değişmedi.",
          "Kaynak: v2 ayarları; bölümler, anahtarlar ve değerler korundu.",
          "Bağlantı alanları orijinal sırada: API URL ve hemen altında açıklaması, Şirket kodu ile Şirket şifresi yan yana, en son Depo ID.",
          "Bölüm başlıkları markanın büyük harfli etiket stilinde; segmentler 48 px, anahtarlar ayarın adıyla okunur."
        ],
        "create-koli": [
          "Açık tema: bütün ekranlarda aynı nötr gri sayfa ve üstünde beyaz kartlar, gerçek kart gölgesi; yazılar morumsu griden nötr koyu griye. Koyu tema değişmedi.",
          "Kaynak: v2 Yeni Koli; tek seçenek korundu.",
          "Sipariş seçeneği fiş ikonuyla, Sipariş Seçimi’ndeki gibi; karo koli kırmızısında.",
          "Seçenek başlığı 16 px kalın, açıklaması 13 → 14 px: Sipariş Seçimi’ndeki siparişsiz koli seçeneğiyle aynı ölçüde."
        ],
        "irskoli-listesi": [
          "Açık tema: bütün ekranlarda aynı nötr gri sayfa ve üstünde beyaz kartlar, gerçek kart gölgesi; yazılar morumsu griden nötr koyu griye. Koyu tema değişmedi.",
          "Veri: test sunucusunun irsKoliListesi yanıtı (ilk sayfa, 15 koli, 6 sipariş). Durum (açık/kapalı) yanıtta yok: rozetler ve pasif satırlar kaldırıldı.",
          "Koliler siparişe göre gruplu: başlıkta sipariş no, açıklama ve “5 koli · 2 seçili”. Sipariş sırası servisin sırası (en yeni önce). Farklı siparişlerin kolileri tek irsaliyede birleşirse bu artık görünür.",
          "Grup başlığında “Tümünü seç” (yeni davranış önerisi): bir siparişin bütün kolileri tek dokunuşla. Açık koli kuralı için servisin durum alanı göndermesi gerekir."
        ],
        "dashboard": [
          "Açık tema: bütün ekranlarda aynı nötr gri sayfa ve üstünde beyaz kartlar, gerçek kart gölgesi; yazılar morumsu griden nötr koyu griye. Koyu tema değişmedi.",
          "İki kart aynı yükseklikte: alt metni iki satıra inen İrsaliye kartı Koli Listesi’ni de kendi boyuna çeker.",
          "Metinler, renkler ve düzen v8 ile aynı."
        ],
        "koli-listesi": [
          "Açık tema: bütün ekranlarda aynı nötr gri sayfa ve üstünde beyaz kartlar, gerçek kart gölgesi; yazılar morumsu griden nötr koyu griye. Koyu tema değişmedi.",
          "Koliler siparişe göre gruplu: başlıkta “Sipariş No 00000151”, siparişin açıklaması ve koli sayısı. Sipariş numarası artık açıkça yazıyor.",
          "Her satır bir koli: “Koli 022” büyük, altında tam koli no. Satır 64 px, dokunma alanı satırın tamamı.",
          "Sıra servisin sırası (en yeni önce); bir sipariş ilk göründüğü yerde toplanır. Sayfalama gelirse aynı siparişin sonraki kolileri aynı gruba eklenir.",
          "Kodlar sabit genişlikli yazı tipinden çıktı: aynı yazı tipi, rakamlar eşit genişlikte."
        ],
        "koli-detay": [
          "Açık tema: bütün ekranlarda aynı nötr gri sayfa ve üstünde beyaz kartlar, gerçek kart gölgesi; yazılar morumsu griden nötr koyu griye. Koyu tema değişmedi.",
          "Üst kısım v11 ile aynı.",
          "Kart v9 düzeninde: ürün kodu, altında “Barkod …”, ince çizginin altında etiketli Renk ve Lot adeti.",
          "Miktar v11’deki gibi sağ üstte, büyük ve yeşil; bütün kartlarda aynı hizada."
        ],
        "order-receipts": [
          "Açık tema: bütün ekranlarda aynı nötr gri sayfa ve üstünde beyaz kartlar, gerçek kart gölgesi; yazılar morumsu griden nötr koyu griye. Koyu tema değişmedi.",
          "Veri test sunucusunun orderReceipts yanıtından (ilk 24 kayıt). Kartın ikinci satırı depo değil cari (CurrentAccountName); depo yok.",
          "Servis siparişleri cariye göre sıralı döndürüyor ve çoğu carinin birden çok siparişi var: her cari bir kart, başlıkta cari adı (en fazla iki satır) ve sipariş sayısı, satırlarda “Sipariş No 00000151”, 56 px.",
          "Koli Listesi ile aynı grup dili. Uygulamadaki önek “Fiş:”; öneride “Sipariş No”.",
          "Siparişsiz koli seçeneği ve arama (sipariş no veya cari) v8 ile aynı."
        ],
        "barcode-scanner": [
          "Açık tema: bütün ekranlarda aynı nötr gri sayfa ve üstünde beyaz kartlar, gerçek kart gölgesi; yazılar morumsu griden nötr koyu griye. Koyu tema değişmedi.",
          "Sipariş ve barkod sabit genişlikli yazı tipinden çıktı; barkod aralığı daraldı.",
          "Sipariş çipi ve altındaki cari gerçek veriyle: 00000151, BEBETTO TEKSTİL A.Ş.",
          "Düzen ve durumlar v8 ile aynı."
        ]
      },
      "states": {
        "koli-detay": [
          {
            "id": "okutma-basarili",
            "name": "Okutma başarılı",
            "notes": [
              "Bildirim altta, 2 sn. Eklenen ürünün kartı yeşil çerçeveli, miktarı yeni değeriyle (10 → 11).",
              "Ses yok, dokunma gerekmez; yeni okutma eskisinin yerine geçer.",
              "Silme modunda aynı bildirim “Ürün silindi” der."
            ]
          },
          {
            "id": "okutma-hatali",
            "name": "Okutma hatalı",
            "notes": [
              "Başarı bildirimiyle aynı yer ve biçim; kırmızı ikon ve çerçeve, 500 ms titreşim ve hata sesi. Liste değişmez.",
              "Okutma alanı kırmızı çerçeveli ve okutulan barkodu gösterir; neden metni örnektir.",
              "Bildirim sonraki okutmaya kadar kalır, × ile de kapanır."
            ]
          },
          {
            "id": "miktar-asimi",
            "name": "Miktar aşımı",
            "notes": [
              "Karar gerektiği için okutmayı durduran tek durum: alttan pencere, uygulamadaki metin ve “Hayır / Evet”.",
              "Okutulan barkod, listedeki T4121’in gerçek barkodu.",
              "Siparişte olmayan ürün okutulursa aynı pencere “Sipariş Dışı Ürün” başlığıyla açılır."
            ]
          }
        ],
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
              "Okutma başarılıysa koli açılır ve doğrudan yeni kolinin detayına geçilir: 00000151-023, ilk ürün 1 adet. Uygulamadaki davranış; araya tam ekran parlama girmez.",
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
        "id": "2026-10-27-impeccable-v13-light",
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
      "id": "2026-10-27-impeccable-v9",
      "date": "2026-10-27",
      "revision": 9,
      "previous": "2026-10-23-impeccable-v8",
      "status": "pending_approval",
      "basedOn": "2026-10-15",
      "label": "Impeccable · Koli ekranları gerçek veriyle",
      "note": "Dokuzuncu öneri: Koli Listesi, Koli Detayı ve İrsaliye Oluştur test sunucusunun gerçek yanıtlarıyla. Listede depo ve durum yok; SipExp siparişin açıklamasıdır. Detayda miktar, barkod ve lot adeti gerçek alanlardan. Diğer ekranlar v8’de. Ana koda uygulanmadı.",
      "skill": "impeccable / refine",
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
          "Veri: test sunucusunun koliListesi yanıtı (ilk sayfa, 7 koli). Depo (Explanation) ve açık/kapalı durumu bu yanıtta yok; kartlardan kaldırıldı.",
          "Koli no siparişin numarasıyla başlar (00000151-022): sipariş kısmı soluk, kolinin sırası koyu. Ayrı Sipariş No satırı ve alt şerit kaldırıldı; aynı numarayı tekrar ediyordu. Ekranda 7 kolinin 6’sı görünür.",
          "SipExp müşteri adı değil, siparişin açıklaması: en fazla iki satır. Boş gelen kolide satır hiç çizilmez, kart kısalır."
        ],
        "koli-detay": [
          "Veri: test sunucusunun koliDetay yanıtı (id 8, iki ürün); başlık listedeki ilk koliden (00000151-022). Görsel, beden ve birim yanıtta yok.",
          "Asıl miktar (sh_Miktar) miktar kutusunda; uygulamada küçük yeşil satırdaydı, kutuda barkod duruyordu. Barkod ürün kodunun altında.",
          "Renk ve Lot adeti alt satırda; etiketler alan adlarından gelir. Durum seçicide: Okutma başarılı, Okutma hatalı, Miktar aşımı."
        ],
        "irskoli-listesi": [
          "Veri: test sunucusunun irsKoliListesi yanıtı (ilk sayfa, 15 koli, 6 sipariş). Durum (açık/kapalı) yanıtta yok: rozetler ve pasif satırlar kaldırıldı.",
          "Koliler siparişe göre gruplu: başlıkta sipariş no, açıklama ve “5 koli · 2 seçili”. Sipariş sırası servisin sırası (en yeni önce). Farklı siparişlerin kolileri tek irsaliyede birleşirse bu artık görünür.",
          "Grup başlığında “Tümünü seç” (yeni davranış önerisi): bir siparişin bütün kolileri tek dokunuşla. Açık koli kuralı için servisin durum alanı göndermesi gerekir."
        ]
      },
      "states": {
        "koli-detay": [
          {
            "id": "okutma-basarili",
            "name": "Okutma başarılı",
            "notes": [
              "Bildirim altta, 2 sn; eklenen satır yeşil çerçeveli ve yeni miktarıyla (10 → 11). Ses yok, dokunma gerekmez.",
              "Bildirim ürün kodunu, rengi ve yeni miktarı söyler; yanıtta birim olmadığı için birim yazılmaz.",
              "Yeni okutma eskisinin yerine geçer; silme modunda “Ürün silindi”."
            ]
          },
          {
            "id": "okutma-hatali",
            "name": "Okutma hatalı",
            "notes": [
              "Başarı bildirimiyle aynı yer ve biçim; kırmızı ikon ve çerçeve, 500 ms titreşim ve hata sesi. Liste değişmez.",
              "Okutma alanı kırmızı çerçeveli ve okutulan barkodu gösterir; neden metni örnektir.",
              "Bildirim sonraki okutmaya kadar kalır, × ile de kapanır."
            ]
          },
          {
            "id": "miktar-asimi",
            "name": "Miktar aşımı",
            "notes": [
              "Karar gerektiği için okutmayı durduran tek durum: alttan pencere, uygulamadaki metin ve “Hayır / Evet”.",
              "Okutulan barkod, kolideki T4121’in gerçek barkodu.",
              "Siparişte olmayan ürün okutulursa aynı pencere “Sipariş Dışı Ürün” başlığıyla açılır."
            ]
          }
        ]
      },
      "files": [
        "irskoli-listesi",
        "koli-detay",
        "koli-listesi"
      ],
      "lightPreview": {
        "id": "2026-10-27-impeccable-v9-light",
        "files": [
          "irskoli-listesi",
          "koli-detay",
          "koli-listesi"
        ]
      }
    },
    {
      "id": "2026-11-04-impeccable-v14",
      "date": "2026-11-04",
      "revision": 14,
      "previous": "2026-10-27-impeccable-v13",
      "status": "pending_approval",
      "basedOn": "2026-10-15",
      "label": "Impeccable · Düz listeler",
      "note": "On dördüncü öneri: sorumlu arkadaşın geri bildirimi. Koli Listesi ve Sipariş Seçimi’ndeki gruplama kaldırıldı, listeler eskisi gibi kayıt başına bir kart. Diğer ekranlar v13 ile aynı. Ana koda uygulanmadı.",
      "skill": "impeccable / layout",
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
          "Açık tema: bütün ekranlarda aynı nötr gri sayfa ve üstünde beyaz kartlar, gerçek kart gölgesi; yazılar morumsu griden nötr koyu griye. Koyu tema değişmedi.",
          "Kaynak: v2 girişi; düzen ve metinler korundu.",
          "“Beni hatırla” işareti orijinaldeki gibi marka kırmızısı, güvenlik kilidi nötr: yeşil yalnız tamamlama anlamında kalır.",
          "Ayarlar ve şifre göster düğmeleri 48 px dokunma alanında; açıklama ve alt bilgi 14 px."
        ],
        "settings": [
          "Açık tema: bütün ekranlarda aynı nötr gri sayfa ve üstünde beyaz kartlar, gerçek kart gölgesi; yazılar morumsu griden nötr koyu griye. Koyu tema değişmedi.",
          "Kaynak: v2 ayarları; bölümler, anahtarlar ve değerler korundu.",
          "Bağlantı alanları orijinal sırada: API URL ve hemen altında açıklaması, Şirket kodu ile Şirket şifresi yan yana, en son Depo ID.",
          "Bölüm başlıkları markanın büyük harfli etiket stilinde; segmentler 48 px, anahtarlar ayarın adıyla okunur."
        ],
        "create-koli": [
          "Açık tema: bütün ekranlarda aynı nötr gri sayfa ve üstünde beyaz kartlar, gerçek kart gölgesi; yazılar morumsu griden nötr koyu griye. Koyu tema değişmedi.",
          "Kaynak: v2 Yeni Koli; tek seçenek korundu.",
          "Sipariş seçeneği fiş ikonuyla, Sipariş Seçimi’ndeki gibi; karo koli kırmızısında.",
          "Seçenek başlığı 16 px kalın, açıklaması 13 → 14 px: Sipariş Seçimi’ndeki siparişsiz koli seçeneğiyle aynı ölçüde."
        ],
        "irskoli-listesi": [
          "Açık tema: bütün ekranlarda aynı nötr gri sayfa ve üstünde beyaz kartlar, gerçek kart gölgesi; yazılar morumsu griden nötr koyu griye. Koyu tema değişmedi.",
          "Veri: test sunucusunun irsKoliListesi yanıtı (ilk sayfa, 15 koli, 6 sipariş). Durum (açık/kapalı) yanıtta yok: rozetler ve pasif satırlar kaldırıldı.",
          "Koliler siparişe göre gruplu: başlıkta sipariş no, açıklama ve “5 koli · 2 seçili”. Sipariş sırası servisin sırası (en yeni önce). Farklı siparişlerin kolileri tek irsaliyede birleşirse bu artık görünür.",
          "Grup başlığında “Tümünü seç” (yeni davranış önerisi): bir siparişin bütün kolileri tek dokunuşla. Açık koli kuralı için servisin durum alanı göndermesi gerekir."
        ],
        "dashboard": [
          "Açık tema: bütün ekranlarda aynı nötr gri sayfa ve üstünde beyaz kartlar, gerçek kart gölgesi; yazılar morumsu griden nötr koyu griye. Koyu tema değişmedi.",
          "İki kart aynı yükseklikte: alt metni iki satıra inen İrsaliye kartı Koli Listesi’ni de kendi boyuna çeker.",
          "Metinler, renkler ve düzen v8 ile aynı."
        ],
        "koli-listesi": [
          "Gruplama kaldırıldı: her koli bir kart, servisin sırasıyla (en yeni önce).",
          "Kartta koli no, altında “Sipariş No 00000151” ve siparişin açıklaması (en fazla iki satır, boşsa çizilmez).",
          "Listenin sonundaki “Tüm koliler yüklendi” satırı geri geldi."
        ],
        "koli-detay": [
          "Açık tema: bütün ekranlarda aynı nötr gri sayfa ve üstünde beyaz kartlar, gerçek kart gölgesi; yazılar morumsu griden nötr koyu griye. Koyu tema değişmedi.",
          "Üst kısım v11 ile aynı.",
          "Kart v9 düzeninde: ürün kodu, altında “Barkod …”, ince çizginin altında etiketli Renk ve Lot adeti.",
          "Miktar v11’deki gibi sağ üstte, büyük ve yeşil; bütün kartlarda aynı hizada."
        ],
        "order-receipts": [
          "Gruplama kaldırıldı: her sipariş bir kart, servisin sırasıyla.",
          "Kartta “Sipariş No 00000151”, altında cari (CurrentAccountName, en fazla iki satır). Uygulamadaki önek “Fiş:”; öneride “Sipariş No”.",
          "Siparişsiz koli seçeneği ve arama (sipariş no veya cari) aynı."
        ],
        "barcode-scanner": [
          "Açık tema: bütün ekranlarda aynı nötr gri sayfa ve üstünde beyaz kartlar, gerçek kart gölgesi; yazılar morumsu griden nötr koyu griye. Koyu tema değişmedi.",
          "Sipariş ve barkod sabit genişlikli yazı tipinden çıktı; barkod aralığı daraldı.",
          "Sipariş çipi ve altındaki cari gerçek veriyle: 00000151, BEBETTO TEKSTİL A.Ş.",
          "Düzen ve durumlar v8 ile aynı."
        ]
      },
      "states": {
        "koli-detay": [
          {
            "id": "okutma-basarili",
            "name": "Okutma başarılı",
            "notes": [
              "Bildirim altta, 2 sn. Eklenen ürünün kartı yeşil çerçeveli, miktarı yeni değeriyle (10 → 11).",
              "Ses yok, dokunma gerekmez; yeni okutma eskisinin yerine geçer.",
              "Silme modunda aynı bildirim “Ürün silindi” der."
            ]
          },
          {
            "id": "okutma-hatali",
            "name": "Okutma hatalı",
            "notes": [
              "Başarı bildirimiyle aynı yer ve biçim; kırmızı ikon ve çerçeve, 500 ms titreşim ve hata sesi. Liste değişmez.",
              "Okutma alanı kırmızı çerçeveli ve okutulan barkodu gösterir; neden metni örnektir.",
              "Bildirim sonraki okutmaya kadar kalır, × ile de kapanır."
            ]
          },
          {
            "id": "miktar-asimi",
            "name": "Miktar aşımı",
            "notes": [
              "Karar gerektiği için okutmayı durduran tek durum: alttan pencere, uygulamadaki metin ve “Hayır / Evet”.",
              "Okutulan barkod, listedeki T4121’in gerçek barkodu.",
              "Siparişte olmayan ürün okutulursa aynı pencere “Sipariş Dışı Ürün” başlığıyla açılır."
            ]
          }
        ],
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
              "Okutma başarılıysa koli açılır ve doğrudan yeni kolinin detayına geçilir: 00000151-023, ilk ürün 1 adet. Uygulamadaki davranış; araya tam ekran parlama girmez.",
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
        "id": "2026-11-04-impeccable-v14-light",
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
      "id": "2026-11-05-impeccable-v15",
      "date": "2026-11-05",
      "revision": 15,
      "previous": "2026-11-04-impeccable-v14",
      "status": "approved",
      "basedOn": "2026-10-15",
      "label": "Impeccable · İrsaliyeden koliye git",
      "note": "On beşinci öneri: İrsaliye Oluştur’da her satırın sağında koliyi açan ok. Seçim satırın solunda aynı kalır. Diğer ekranlar v14 ile aynı. Uygulamaya aktarıldı (2026-11-06).",
      "skill": "impeccable / layout",
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
          "Açık tema: bütün ekranlarda aynı nötr gri sayfa ve üstünde beyaz kartlar, gerçek kart gölgesi; yazılar morumsu griden nötr koyu griye. Koyu tema değişmedi.",
          "Kaynak: v2 girişi; düzen ve metinler korundu.",
          "“Beni hatırla” işareti orijinaldeki gibi marka kırmızısı, güvenlik kilidi nötr: yeşil yalnız tamamlama anlamında kalır.",
          "Ayarlar ve şifre göster düğmeleri 48 px dokunma alanında; açıklama ve alt bilgi 14 px."
        ],
        "settings": [
          "Açık tema: bütün ekranlarda aynı nötr gri sayfa ve üstünde beyaz kartlar, gerçek kart gölgesi; yazılar morumsu griden nötr koyu griye. Koyu tema değişmedi.",
          "Kaynak: v2 ayarları; bölümler, anahtarlar ve değerler korundu.",
          "Bağlantı alanları orijinal sırada: API URL ve hemen altında açıklaması, Şirket kodu ile Şirket şifresi yan yana, en son Depo ID.",
          "Bölüm başlıkları markanın büyük harfli etiket stilinde; segmentler 48 px, anahtarlar ayarın adıyla okunur."
        ],
        "create-koli": [
          "Açık tema: bütün ekranlarda aynı nötr gri sayfa ve üstünde beyaz kartlar, gerçek kart gölgesi; yazılar morumsu griden nötr koyu griye. Koyu tema değişmedi.",
          "Kaynak: v2 Yeni Koli; tek seçenek korundu.",
          "Sipariş seçeneği fiş ikonuyla, Sipariş Seçimi’ndeki gibi; karo koli kırmızısında.",
          "Seçenek başlığı 16 px kalın, açıklaması 13 → 14 px: Sipariş Seçimi’ndeki siparişsiz koli seçeneğiyle aynı ölçüde."
        ],
        "irskoli-listesi": [
          "Her satır iki hedefli: sol taraf seçer (eskisi gibi), sağdaki ok koli detayını açar. Ok, Koli Listesi’ndeki okla aynı anlamda.",
          "Ok alanı 56 px genişliğinde, satır boyunca; ince bir çizgi iki hedefi ayırır, yanlış dokunma seçimi bozmaz.",
          "Detaydan geri dönünce seçimler, arama ve kaydırma yeri korunur.",
          "Veri: test sunucusunun irsKoliListesi yanıtı (ilk sayfa, 15 koli, 6 sipariş). Durum (açık/kapalı) yanıtta yok: rozetler ve pasif satırlar kaldırıldı.",
          "Koliler siparişe göre gruplu: başlıkta sipariş no, açıklama ve “5 koli · 2 seçili”. Sipariş sırası servisin sırası (en yeni önce). Farklı siparişlerin kolileri tek irsaliyede birleşirse bu artık görünür.",
          "Grup başlığında “Tümünü seç” (yeni davranış önerisi): bir siparişin bütün kolileri tek dokunuşla. Açık koli kuralı için servisin durum alanı göndermesi gerekir."
        ],
        "dashboard": [
          "Açık tema: bütün ekranlarda aynı nötr gri sayfa ve üstünde beyaz kartlar, gerçek kart gölgesi; yazılar morumsu griden nötr koyu griye. Koyu tema değişmedi.",
          "İki kart aynı yükseklikte: alt metni iki satıra inen İrsaliye kartı Koli Listesi’ni de kendi boyuna çeker.",
          "Metinler, renkler ve düzen v8 ile aynı."
        ],
        "koli-listesi": [
          "Gruplama kaldırıldı: her koli bir kart, servisin sırasıyla (en yeni önce).",
          "Kartta koli no, altında “Sipariş No 00000151” ve siparişin açıklaması (en fazla iki satır, boşsa çizilmez).",
          "Listenin sonundaki “Tüm koliler yüklendi” satırı geri geldi."
        ],
        "koli-detay": [
          "Açık tema: bütün ekranlarda aynı nötr gri sayfa ve üstünde beyaz kartlar, gerçek kart gölgesi; yazılar morumsu griden nötr koyu griye. Koyu tema değişmedi.",
          "Üst kısım v11 ile aynı.",
          "Kart v9 düzeninde: ürün kodu, altında “Barkod …”, ince çizginin altında etiketli Renk ve Lot adeti.",
          "Miktar v11’deki gibi sağ üstte, büyük ve yeşil; bütün kartlarda aynı hizada."
        ],
        "order-receipts": [
          "Gruplama kaldırıldı: her sipariş bir kart, servisin sırasıyla.",
          "Kartta “Sipariş No 00000151”, altında cari (CurrentAccountName, en fazla iki satır). Uygulamadaki önek “Fiş:”; öneride “Sipariş No”.",
          "Siparişsiz koli seçeneği ve arama (sipariş no veya cari) aynı."
        ],
        "barcode-scanner": [
          "Açık tema: bütün ekranlarda aynı nötr gri sayfa ve üstünde beyaz kartlar, gerçek kart gölgesi; yazılar morumsu griden nötr koyu griye. Koyu tema değişmedi.",
          "Sipariş ve barkod sabit genişlikli yazı tipinden çıktı; barkod aralığı daraldı.",
          "Sipariş çipi ve altındaki cari gerçek veriyle: 00000151, BEBETTO TEKSTİL A.Ş.",
          "Düzen ve durumlar v8 ile aynı."
        ]
      },
      "states": {
        "koli-detay": [
          {
            "id": "okutma-basarili",
            "name": "Okutma başarılı",
            "notes": [
              "Bildirim altta, 2 sn. Eklenen ürünün kartı yeşil çerçeveli, miktarı yeni değeriyle (10 → 11).",
              "Ses yok, dokunma gerekmez; yeni okutma eskisinin yerine geçer.",
              "Silme modunda aynı bildirim “Ürün silindi” der."
            ]
          },
          {
            "id": "okutma-hatali",
            "name": "Okutma hatalı",
            "notes": [
              "Başarı bildirimiyle aynı yer ve biçim; kırmızı ikon ve çerçeve, 500 ms titreşim ve hata sesi. Liste değişmez.",
              "Okutma alanı kırmızı çerçeveli ve okutulan barkodu gösterir; neden metni örnektir.",
              "Bildirim sonraki okutmaya kadar kalır, × ile de kapanır."
            ]
          },
          {
            "id": "miktar-asimi",
            "name": "Miktar aşımı",
            "notes": [
              "Karar gerektiği için okutmayı durduran tek durum: alttan pencere, uygulamadaki metin ve “Hayır / Evet”.",
              "Okutulan barkod, listedeki T4121’in gerçek barkodu.",
              "Siparişte olmayan ürün okutulursa aynı pencere “Sipariş Dışı Ürün” başlığıyla açılır."
            ]
          }
        ],
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
              "Okutma başarılıysa koli açılır ve doğrudan yeni kolinin detayına geçilir: 00000151-023, ilk ürün 1 adet. Uygulamadaki davranış; araya tam ekran parlama girmez.",
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
        "id": "2026-11-05-impeccable-v15-light",
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
