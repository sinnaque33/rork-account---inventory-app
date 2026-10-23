# Öneri 02 · Tema ve anlamsal renkler

**Onay bekliyor; ana uygulamaya uygulanmadı.** Önceki taslak `2026-10-16-impeccable-v1` korunur. Yerleşim ve örnek veri aynıdır.

Kullanıcı yönlendirmesi: görüntüleyici koyu kalsın; tema düğmesi telefonları değiştirsin. AI önerisinde kırmızı ve yeşil daha etkili kullanılsın.

- Kırmızı: Extreme marka rengi, Giriş / Yeni Koli ana işlemleri ve sipariş yönlendirmeleri. Silme, ayrıca kırmızı tonlu zemin ve çöp kutusu ikonu ile ayrılır.
- Yeşil: Malzeme Ekle, Kaydet, Gönder ve Koli Kapatma. Kayıtlı miktarlar ve Kapalı rozeti yeşille desteklenir. Ana sayfada irsaliye erişimi de yeşil aileyi kullanır.
- Açık koli amber kalır; açık bir koliyi hata gibi göstermek için kırmızı kullanılmaz. Sıfır seçili irsaliye düğmesi pasiftir. Renkler bir işlemin gerçekten tamamlandığı iddiasını eklemez.
- Açık tema: beyaz zemin, yumuşak gri yüzeyler, koyu metin, daha koyu kırmızı/yeşil vurgu. Beyaz düğme etiketleri için yeşil dolgu ayrı token'dır. Logo ve Ayarlar tema segmenti de açık temaya geçer.

Öneri koyu HTML'leri `screens/`, iki palet `tokens.css` içindedir. Açık HTML önizlemeleri `../../previews/2026-10-16-impeccable-v2-light/` altında, kendi token kopyasıyla tutulur. Hepsi yerel ve scriptsizdir. İlk arşivin açık önizlemesi arşivde zaten kayıtlı `lightColors` tokenlarını kullanır; uygulama sürümü sayılmaz ve kaynak arşiv dosyalarını değiştirmez.

Formlar, anahtarlar ve uygulama düğmeleri hâlâ statik tasarım önerileridir. İşlevsel kontroller görüntüleyicidedir. Native cihazla piksel eşitliği doğrulanmamıştır.
