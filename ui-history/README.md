# Extreme · Tasarım arşivi

İlk kayıt: **15 Ekim 2026** · uygulama **1.0.0** · 9 ekran.
Bu klasör React Native uygulamasının kaynak koddan yeniden çizilmiş HTML/CSS arşividir. Ekran görüntüsü veya çalışan uygulama kopyası değildir. Uygulama kaynaklarına, bağımlılıklarına ve package.json'a değişiklik yapılmadı.

## Açma

`viewer/index.html` dosyasına çift tıklayın. Chrome veya Edge gibi güncel bir tarayıcıda açılır; sunucu, npm komutu ve internet gerekmez. Dosyayı tek başına taşımayın; **ui-history klasörünün tamamını** birlikte taşıyın.

1. Üstte ekranı seçin.
2. A ve B telefonlarında **+** düğmesine basıp tarih seçin. İki slota aynı tarih de seçilebilir.
3. Ekran seçimi üç slotu birlikte günceller. Değiştir ve Temizle düğmeleri arşiv slotları içindir. AI slotundaki **Kaynakla karşılaştır**, önerinin dayandığı arşivi A slotuna getirir.
4. Telefonun dış çerçevesine tıklayın, klavyeyle çerçeveyi seçip Enter'a basın veya **Büyüt** kullanın. Tam boy önizleme 390×844 ve %100'dür; dar pencerede kaydırılabilir. İframe içi kaydırma önizlemeyi açmaz.
5. Üst sağdaki **Açık tema / Koyu tema** düğmesi yalnızca üç telefonun içeriğini değiştirir; görüntüleyici daima koyu kalır. Tam boy önizleme de seçili temayı kullanır. Logo ve Ayarlar'daki tema seçimi içerikle birlikte değişir.

Seçimler `#screen=koli-detay&a=2026-10-15&b=2026-10-15` biçiminde URL'de tutulur; yenileme ve tarayıcı geri/ileri düğmeleri desteklenir. Telefon teması tarayıcı izin verirse `ui-history-phone-theme` localStorage anahtarında tutulur; depolama engellenirse koyu temadan başlar ve düğme yine çalışır. Eski görüntüleyici tema tercihi artık kullanılmaz.

İlk arşivde tek gerçek tarih vardır. İkinci arşiv tarihi ancak uygulamadaki yeni bir tasarım kaydedildiğinde görünür. **AI İyileştirme** alanında 16 Ekim 2026 tarihli ikinci Impeccable önerisi yer alır: dokuz ekran, açık/koyu tema, kırmızı/yeşil işlem vurguları, aynı mock veri ve ekran başına notlar. **Onay bekliyor; ana koda uygulanmadı.** İlk öneri korunur. [İkinci önerinin kararları](experiments/2026-10-16-impeccable-v2/DESIGN.md), [ilk önerinin ekran farkları](experiments/2026-10-16-impeccable-v1/DESIGN.md).

Koli Listesi ve Koli Detayı için hazırlanan **üçüncü öneri** büyük koli/ürün başlıkları, ayrı miktar alanı ve daha okunabilir yardımcı bilgiler getirdi. [Okunabilirlik kararları ve ölçüler](experiments/2026-10-16-impeccable-v3/DESIGN.md). Kontrol komutu: `node ui-history/tools/check-themes.cjs --readability`.

Koli Listesi, Koli Detayı ve İrsaliye Oluştur için **dördüncü öneri** (22 Ekim 2026) hazırlandı. Önceki önerilerin gri görünümü yerine ana temanın akış renklerini kullanır: koli kırmızı, irsaliye çivit, tamamlama yeşil, açık koli amber. Koliler ve ürünler ayrı kartlarda; sipariş bağlamı Ana Sayfa'daki gradyan kart dilinde. Üçüncü önerinin yazı ölçüleri korunur. İrsaliye ekranı iki koli seçili durumda çizilmiştir. [Akış rengi kararları](experiments/2026-10-22-impeccable-v4/DESIGN.md). Yeniden üretim: `node ui-history/tools/build-vibrance-revision.cjs --replace` (yalnız onay bekleyen bu öneriyi yeniler). Kontrol: `node ui-history/tools/check-themes.cjs --vibrance`.

Barkod Okutma ve Sipariş Seçimi için **beşinci öneri** (22 Ekim 2026) hazırlandı. Barkod ekranı orijinal uygulamadaki ortalanmış düzene döner ve yalnız hafif iyileştirilir:
- fiş numarası ve cari ayrı satırlarda,
- talimat barkod alanının üstünde,
- barkod büyük ve sabit genişlikli yazıyla,
- tarama dairesi kırmızı tonlu.

Sipariş Seçimi koli listesiyle aynı kart dilinde: daha büyük sipariş no ve cari adı, daha sakin siparişsiz koli seçeneği. Barkod ekranının v4 hali korunur ama gösterilmez. [Kararlar](experiments/2026-10-22-impeccable-v5/DESIGN.md). Yeniden üretim: `node ui-history/tools/build-scan-order-revision.cjs --replace`. Kontrol: `node ui-history/tools/check-themes.cjs --scan-order`.

Dokuz ekranı tek klasörde toplayan **altıncı öneri** (22 Ekim 2026) hazırlandı. Bu öneri, o güne kadar gösterilen ekranları Impeccable kritiğinden sonra küçük düzeltmelerle tek klasörde toplar:
- Giriş, Ayarlar, Ana Sayfa ve Yeni Koli v2'den,
- Koli Listesi, Koli Detayı ve İrsaliye Oluştur v4'ten,
- Barkod Okutma ve Sipariş Seçimi v5'ten gelir.

Düzen ve metinler korunur. Kırmızı ve çivit tema değerlerine çekilir, dokunma hedefleri 48 px'e, küçük metinler 14 px'e çıkar. Kaynak öneriler değişmez. Karar isteyen konular ayrıca listelenir. [Kritik, düzeltmeler ve açık kararlar](experiments/2026-10-22-impeccable-v6/DESIGN.md). Yeniden üretim: `node ui-history/tools/build-critique-revision.cjs --replace`. Kontrol: `node ui-history/tools/check-themes.cjs --critique`.

Yedinci öneri okutmadan sonra olanları Barkod Okutma ve Koli Detayı'nın **durumları** olarak çizdi (tam ekran yeşil başarı, tam ekran kırmızı hata). Açık koliler irsaliyeye eklenemez, siparişsiz seçenek “Siparişsiz koli oluştur” oldu. [v7 durumları](experiments/2026-10-22-impeccable-v7/DESIGN.md). Yeniden üretim: `node ui-history/tools/build-scan-states-revision.cjs --replace`.

Görüntüleyici artık dokuz ekranın hepsinde **sekizinci öneriyi** gösterir. Kullanıcı kararıyla seri okutma için tam ekran yeşil ve kırmızı kaldırıldı: başarı da hata da alt çubuğun üstündeki aynı bildirimde çıkar. AI telefonunun üstündeki **Durum** düğmeleri:
- Barkod Okutma: Gönderiliyor, Okutma başarılı (yeni kolinin detayı), Okutma hatalı.
- Koli Detayı: Okutma başarılı, Okutma hatalı, Miktar aşımı.

Seçili durum adreste `durum=` olarak tutulur; A slotu orijinal ekranı gösterir. [Seri okutma bildirimi](experiments/2026-10-23-impeccable-v8/DESIGN.md). Yeniden üretim: `node ui-history/tools/build-inline-feedback-revision.cjs --replace`. Kontrol: `node ui-history/tools/check-themes.cjs --states` (v8'i denetler).

## İçerik

| Slug | Ekran | Kaynak |
| --- | --- | --- |
| login | Giriş | app/login.tsx |
| settings | Ayarlar | app/settings.tsx |
| dashboard | Ana Sayfa | app/(app)/dashboard.tsx |
| koli-listesi | Koli Listesi | app/(app)/koli-listesi.tsx |
| koli-detay | Koli Detayı | app/(app)/koli-detay.tsx |
| create-koli | Yeni Koli | app/(app)/create-koli.tsx |
| order-receipts | Sipariş Seçimi | app/(app)/order-receipts.tsx |
| irskoli-listesi | İrsaliye Oluştur | app/(app)/irskoli-listesi.tsx |
| barcode-scanner | Barkod Okutma | app/(app)/barcode-scanner.tsx |

Onaylanan profil: 390×844 logical px, Android, Türkçe, koyu tema, yazı ölçeği 1, klavye kapalı. Listeler doludur; modallar, çoklu seçim, boş/yükleniyor/hata durumları kapsam dışıdır. Barkod ekranı siparişten koli açma modundadır. Bulunamadı ekranı ve yönlendirme dosyaları arşivlenmedi.

- `CONVERSION_GUIDE.md`: tüm sürümlerin dönüşüm sözleşmesi.
- `fixtures.json`: sürümler arasında değişmeyecek örnek veri.
- `manifest.js`: ekran kataloğu, sürüm notları ve fiziksel HTML dosya envanteri; fetch kullanılmaz.
- `versions/2026-10-15/`: meta.json, tokens.css ve dokuz bağımsız HTML.
- `source-map.json`: ilk kayıt oluşturulurken okunan kaynak dosyalarının SHA-256 kimlikleri ve çıkarılan RN stil değerleri. İlk kayıt dondurulmuştur; uygulamada daha sonra yapılan değişiklikler bu kaynak kaydını veya arşiv ekranlarını yeniden yazmaz.
- `assets/`: mevcut marka logolarının değişmez kopyaları, yerel fontlar ve lisanslar.
- `experiments/`: kendi tokenları ve ekranlarıyla bağımsız AI önerileri; [revizyon ekleme kuralları](experiments/README.md).
- `previews/`: kaynak arşiv/öneriyi değiştirmeden üretilmiş açık tema HTML'leri; [tema önizleme kuralları](previews/README.md). İlk arşivin açık görünümü, o arşivin kayıtlı açık paletinden türetilir; yeni bir uygulama sürümü değildir.

## Yeni tasarım sürümü ekleme

Eski tarih klasörlerini veya eski asset dosyalarını değiştirmeyin. Uygulamadaki yeni görünümü kaydetmek için agent'a şu talimatı verebilirsiniz:

> Mevcut tasarımı ui-history altında yeni tarihli sürüm olarak arşivle. CONVERSION_GUIDE.md'yi ve önceki sürümü oku. Aynı fixtures.json verisini kullan. Kaynak koddan değişen ekranları belirle, yalnızca onların HTML'lerini yeniden çiz; mevcut tema token'larını yeni tokens.css'e çıkar. Genel ve ekran bazında değişiklik notlarını yaz. Eski sürümlere ve uygulama kaynaklarına dokunma. Manifest'i güncelle ve doğrula.

Uygulama adımları:

1. `versions/YYYY-MM-DD/screens/` oluşturun. Tarih mevcutsa üzerine yazmayın. Bu aşamada gün başına tek kayıt vardır.
2. Güncel `constants/theme.ts` ve ilgili ekran stillerinden **yeni sürüme ait** `tokens.css` hazırlayın.
3. Değişen ekranları kaynak JSX ve stillerden yeniden çizip `<slug>.html` olarak ekleyin. Eski HTML'in yalnızca kopyalanması yeni tasarımı belgelemez. Yeni ekran varsa `manifest.js` içindeki `screens` kataloğuna slug, ad ve kaynak yolunu ekleyin.
4. Görsel değişiklik yapan token değişmişse etkilenen **tüm** ekranları yeni sürüme ekleyin. Eski HTML her zaman kendi eski tokens.css dosyasını yükler.
5. Aşağıdaki meta yapısını yazın. `gitCommit` için `git rev-parse HEAD`, `appVersion` için `app.json → expo.version` okuyun. Commitlenmemiş tasarım değişikliği varsa `note` içinde belirtin; commit tek başına çalışma ağacını temsil etmez.
6. Proje kökünden `node ui-history/tools/update-manifest.cjs` çalıştırın. Script tarih klasörlerini okur, fiziksel dosyaları `files` alanına yazar ve eksik değişmiş ekranları reddeder. Yalnızca manifest.js güncellenir.
7. `node ui-history/tools/verify.cjs` çalıştırın; viewer'da önceki ve yeni tarihi yan yana inceleyin. Gerçek cihazdan bilinen sapmaları bu README'ye yeni tarih başlığı altında ekleyin.

Örnek meta.json (yer tutucuları gerçek değerlerle değiştirin):

```json
{
  "date": "YYYY-MM-DD",
  "gitCommit": "GERCEK_COMMIT_SHA",
  "appVersion": "GERCEK_APP_VERSION",
  "note": "Koli listesi ve detay ekranındaki görsel değişiklikler.",
  "changedScreens": ["koli-listesi", "koli-detay"],
  "screenNotes": {
    "koli-listesi": "Örnek: Arama alanı düzenlendi; kart iç boşlukları artırıldı.",
    "koli-detay": "Örnek: Sipariş kartı ve alt işlem düğmeleri güncellendi."
  }
}
```

`screenNotes` isteğe bağlıdır ancak tasarım kararlarının izini tutmak için önerilir. Notlar hem tarih seçiminde hem telefonun altında gösterilir. HTML eklenmeyen ekranlar için `changedScreens` kaydı eklemeyin.

### Değişmeyen ekranın bulunması

Viewer seçilen tarihte ekranın HTML'ini arar; yoksa o tarihten önceki en son dosyayı bulur. Örneğin yeni bir sürüm yalnızca `settings` içeriyorsa, aynı tarihte `login` seçildiğinde 2026-10-15 kaydı kendi CSS'iyle gösterilir ve “15.10.2026 tarihinden beri değişmedi” etiketi çıkar. Telefon altındaki ana tarih/not seçilen sürüme aittir; etiket kaynak ekranın tarihini açıklar. Gelecek tarihli dosyalar kullanılmaz. Henüz hiç kaydedilmemiş ekran açık bir bulunamadı durumu gösterir.

### Araçların kapsamı

`tools/build-initial.cjs` ilk kayda özel, agent tarafından yazılmış HTML eşlemeleridir; genel amaçlı otomatik RN dönüştürücüsü değildir. Kaynak stil değerlerini TypeScript AST üzerinden okur; HTML yapısı elle eşlenmiştir. Var olan ilk sürümün üzerine yazmayı reddeder. Yeni tasarımlarda bu scripti çalıştırmayın; güncel ekran kodunu yeniden okuyup HTML'i yeniden dönüştürün. Görüntüleyici ve hazır HTML'ler Node veya node_modules gerektirmez. Manifest güncelleme ve doğrulama yalnızca Node'un yerleşik modüllerini kullanır.

## Tamamlanan kontroller

İkinci önerinin tema kontrolleri `node ui-history/tools/check-themes.cjs` ile çalışır: 9 koyu AI, 9 açık AI, 9 açık arşiv ekranı; masaüstü/dar viewer, üç slota tema uygulama, tema tercihini yeniden yükleme, eski kaynak sürümün açık önizlemesini seçme ve tam boy görünüm. Sonuçlar `experiments/2026-10-16-impeccable-v2/validation.json` içindedir. İlk arşivin renkleri aynen korunur; yeni AI paletlerinde normal metin için 4.5:1 kontrast kontrol edilir.

AI önerisinin kontrolleri `experiments/2026-10-16-impeccable-v1/validation.json` içindedir. Dokuz öneride yerel font/görsel, 390×844 profil, kaydırma, yatay taşma ve metin kontrastı; viewer'da üç slotun ekran değişimi, kaynakla karşılaştırma, AI tam boy önizleme, klavye/odak dönüşü ve dar görünüm kontrol edildi. `node ui-history/tools/browser-check.cjs --viewer-only --with-experiments` ile yeniden çalıştırılır. Metin kontrastı kontrolü işlenmiş DOM renklerini ölçer; native cihaz/piksel doğrulaması değildir. Impeccable taramasının barkod ekranında bulduğu dekoratif ikon kutusu kaldırıldı. Ekran görüntüsü üretilmedi.

İlk sürümün sonuçları `versions/2026-10-15/validation.json` içindedir. Statik doğrulama ve Chrome headless ile `file://` üzerinden yapılan 13 kontrol grubu hatasız tamamlandı; ekran görüntüsü alınmadı.

- Dokuz ekran: 390×844 viewport, yerel fontlar ve görseller, koyu tema, kaydırma alanları ve yatay taşma.
- Viewer etkileşimleri: ekran/tarih seçimi, iki slot, hash geri yükleme, temizleme ve odak, tam boy önizleme ve tema bağımsızlığı.
- Geçmiş sürüme fallback ve dar görünüm: önceki dosyanın seçimi ve etiketi, sürüm bilgileri, alt alta yerleşim ve yatay taşma.
- Gerçek dosya gömme: üretim viewer'ının `file://` adresinden iki iframe'i açması ve yerel CSS/font yüklemesinin engellenmemesi.

Kontrolleri proje kökünden `node ui-history/tools/verify.cjs` ve `node ui-history/tools/browser-check.cjs` ile yeniden çalıştırabilirsiniz. Chrome farklı konumdaysa `UI_HISTORY_CHROME` ortam değişkenine çalıştırılabilir dosyanın yolunu verin. Tarayıcı kontrolü geçici dosyaları ve yeni sonuçları `ui-history/.qa/` altında tutar; sürümün `validation.json` kaydını otomatik güncellemez. Ekran kontrolleri geçici, ölçüm kodu eklenmiş HTML kopyalarını kullanır; gerçek viewer dosyasının gömme kontrolü ayrıca yapılır.

Viewer iframe'lerinde `sandbox="allow-same-origin"` yerel CSS/font yüklemesini destekler; iframe içindeki scriptler kapalı kalır. Bu kontroller native cihazla piksel eşitliğini doğrulamaz; bilinen farklar aşağıdadır.

## İlk sürümün bilinen görsel farkları

Gerçek cihazla piksel karşılaştırması yapılmadı. Aşağıdakiler kaynak kod incelemesinden bilinen/sabitlenen farklardır; HTML'nin gerçek cihazla birebir doğrulandığı anlamına gelmez.

Tüm ekranlarda sistem alanları 24/24 px ve native başlık 56 px sabitlendi. Gerçek cihazın inset değerleri, status bar ikonları, native geri oku, başlık ayraçları ve font rasterizasyonu değişebilir. Roboto dosyası cihazın sistem Roboto sürümüyle aynı olmayabilir; Roboto Mono cihazın `monospace` alias'ına yaklaşık karşılıktır. Android `includeFontPadding`, native input metin konumu ve tarayıcı satır kırılması birkaç piksel farklılaşabilir. HTML arşivi işletim sistemi yazı ölçeğini ve klavyeyi taklit etmez.

| Ekran | Sabitlenen veya farklı kalabilecek noktalar |
| --- | --- |
| Giriş | Gerçek kullanıcı/şifre yerine sabit mock; şifre görünümü nokta metnidir. Klavye ve odak halkası kapalı. Safe-area ve font metrikleri nedeniyle dikey merkezleme farklılaşabilir. Logo orijinal PNG'dir. |
| Ayarlar | Şirket/API değerleri örnek, kaydetme/toast/uyarı yok. Çok satırlı URL alanının native ölçümü ile textarea satır ölçümü farklılaşabilir. Sistem klavyesi kapalı; sayfanın tamamı kaydırılabilir. |
| Ana Sayfa | Kullanıcı adı örnek. Expo LinearGradient yerine CSS gradient; renk karışımı/render küçük fark gösterebilir. Native stack başlığı ve ekranın kendi header'ı birlikte korunur; kaynak safe-area eklemesi arşiv profilinde sabittir. |
| Koli Listesi | Mock sırası ve liste sonu sabit; sanallaştırma/sonsuz yükleme yok. FAB elevation ve kırmızı native gölgesi CSS yaklaşımıdır. Menü ve çoklu seçim kapalı. |
| Koli Detayı | `h1_*`, `h2_*`, `sh_*` alanları sabit mock şemasıdır; gerçek API başka alanlar/metin uzunlukları döndürebilir. Ürün görselleri yerine kodun mevcut Package fallback'i kullanılır. Ekleme modu ve klavye kapalıdır; baskı/ağırlık/sipariş modalları çizilmez. |
| Yeni Koli | Kodda gizli Boş Koli seçeneği çizilmedi. Native başlık/font farkları dışında etkin tek kart yapısı ve boş alan korunur. |
| Sipariş Seçimi | Normal mod; boş koli akışındaki alternatif başlık/hint dahil değildir. Sabit siparişler kullanılır; native liste/yenileme davranışı yoktur. |
| İrsaliye Oluştur | Dolu ancak seçimsiz liste; seçim sonrası alt işlem paneli görünmez. Native kaydırma göstergeleri taklit edilmez. |
| Barkod Okutma | Siparişten oluşturma modu ve örnek barkod sabit. Kaynak `autoFocus` ile yazılım klavyesi açabilir; arşivde kapalıdır. Kamera görünümü yoktur çünkü kaynak ekran da kamera kullanmaz. |

Görsel arşiv sayfalarındaki uygulama düğmeleri statiktir; yalnızca kaydırma çalışır. İşlevsel kontroller viewer'a aittir. Kaynağın mevcut küçük metinleri, renkleri ve ölçüleri iyileştirilmeden korunmuştur.

Font kaynakları ve SHA-256 kimlikleri `assets/fonts/README.md`, Lucide lisansı `assets/LUCIDE-LICENSE.txt` içindedir. Paylaşılan font/logo dosyalarını değiştirmek eski arşivleri de değiştirir; yeni dosya adı kullanın.
