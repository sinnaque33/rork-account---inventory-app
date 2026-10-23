# Tema önizlemeleri

Eski kayıtları değiştirmeden telefonlarda farklı temayı göstermek için türetilmiş HTML'ler. Bunlar yeni uygulama sürümü değildir. Aynı ekran, mock veri ve ölçüler korunur; renk paleti, logo, native kontrol renk şeması ve Ayarlar tema seçimi değiştirilir.

Her klasör `meta.json` ile kaynağını belirtir. `tokens.css` kaynak sürümün bağımsız kopyasıdır. `tools/update-manifest.cjs`, arşivler için `archive-<date>-light`, öneriler için `<id>-light` klasörlerinin envanterini `lightPreview` alanına ekler. Viewer önce seçili tarihte geçerli kaynak sürümü çözer, sonra o kaynağın açık önizlemesini seçer. Böylece eski HTML ile yeni tokenlar yanlışlıkla eşleşmez.

Yeni sürüm/öneri eklerken açık önizlemeyi de aynı kaynaktan üretin; önceki klasörlerin üzerine yazmayın. `tools/build-color-revision.cjs` yalnız ikinci öneriye özel üretim kaydıdır; genel dönüştürücü değildir.
