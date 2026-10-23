# Aşama 2 · AI tasarım önerileri

Dokuz ekranın güncel önerisi: [2026-10-23-impeccable-v8](2026-10-23-impeccable-v8/DESIGN.md). v7'yi taşır; seri okutma için başarı ve hata tam ekran yerine aynı alt bildirimde gösterilir. [v7](2026-10-22-impeccable-v7/DESIGN.md), [v6](2026-10-22-impeccable-v6/DESIGN.md)'yı taşıyıp Barkod Okutma ve Koli Detayı'na okutma sonucu durumlarını eklemişti (`states/<ekran>--<durum>.html`, meta.json `states` alanı; görüntüleyicide **Durum** düğmeleri). v6, Impeccable kritiğinden sonra küçük düzeltmelerle önceki önerileri tek klasörde toplamıştı:
- Giriş, Ayarlar, Ana Sayfa ve Yeni Koli [ikinci öneriden](2026-10-16-impeccable-v2/DESIGN.md);
- koli ve irsaliye ekranları [dördüncü öneriden](2026-10-22-impeccable-v4/DESIGN.md): ana temanın akış renkleri (koli kırmızı, irsaliye çivit, tamamlama yeşil, açık koli amber);
- Barkod Okutma ve Sipariş Seçimi [beşinci öneriden](2026-10-22-impeccable-v5/DESIGN.md).

Yazı ölçüleri [üçüncü öneriden](2026-10-16-impeccable-v3/DESIGN.md) korunur. Kritikte karar isteyen konular v6'nın DESIGN.md dosyasında listelenir. Açık/koyu tema korunur; **kullanıcı onayı bekleniyor**. Önceki öneriler, uygulama kaynakları ve `versions/` kayıtları korunur.

`../viewer/index.html` üçüncü slotta seçili ekranın en yeni, reddedilmemiş önerisini gösterir. **Kaynakla karşılaştır**, önerinin dayandığı arşivi A slotuna getirir. Büyüt ile 390×844 ölçüde inceleyin. Notlar ekranın altındadır.

Yeni revizyon için ayrı bir `YYYY-MM-DD-impeccable-vN/` klasörü oluşturun: `meta.json`, `tokens.css`, `screens/<slug>.html` ve karar notları. Meta alanları: `id` (klasör adı), `date`, `label`, `status` (`pending_approval`, `approved`, `rejected`), `basedOn` (arşiv tarihi), `note`, `screenNotes` (slug başına metin dizisi). Aynı fixture verisini kullanın. `node ui-history/tools/update-manifest.cjs` fiziksel dosya envanterini ekler. Aynı günün revizyonları id'nin azalan sözlük sırasıyla seçilir; çok basamaklı revizyonlarda sıfırla doldurulmuş numara kullanın.

Öneri dosyası bulunmayan ekranda boş durum gösterilir. Herhangi bir eski öneride aynı ekran varsa en yeni mevcut öneri seçilir ve kendi tarihi/notlarıyla gösterilir. Reddedilmiş öneriler gösterilmez. Bu aşamada öneriler arasında seçim arayüzü yoktur; A/B arşiv seçimi URL hash'inde saklanır.

Onay bilgisi yalnızca kullanıcının açık kararından sonra güncellenmelidir. Onay veya manifest güncellemesi uygulama kodunu değiştirmez; uygulamaya aktarım ayrı bir çalışmadır.
