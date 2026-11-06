# Öneri 14 · Düz listeler

**Onay bekliyor. Ana koda uygulanmadı.** Kapsam: Koli Listesi ve Sipariş Seçimi. Diğer yedi ekran ve altı durum v13 ile aynı.

Sorumlu arkadaşın geri bildirimi (2026-11-04): “eline sağlık süper olmuş sadece sipariş ve koli listelerinde cari hesap bazında gruplama olmuş o biraz kafaları karıştırır onu biraz eskisi gibi yapabilirsin gerisi süper”.

## Koli Listesi

- **Gruplama kaldırıldı:** her koli bir kart (v9 kartı), servisin sırasıyla, en yeni önce. Aynı siparişin kolileri artık yan yana toplanmaz.
- **Kart:** paket karosu, koli no (`00000151-022`), altında “Sipariş No 00000151”, altında siparişin açıklaması (en fazla iki satır, boşsa çizilmez).
- **Korunan v12 kararı:** sipariş numarası etiketiyle açıkça yazıyor; v9'daki gibi soluk ön eke dönmedi. Kodlar yine sabit genişlikli yazı tipinde değil.
- v12'de düşen “Tüm koliler yüklendi” satırı geri geldi.

Koli yanıtında cari yok (`PackageNo`, `ReceiptNo`, `SipExp`); v12'deki gruplar siparişe göreydi. Geri bildirim iki listeyi de andığı için bu da kaldırıldı.

## Sipariş Seçimi

- **Gruplama kaldırıldı:** her sipariş bir kart (v8 kartı), servisin sırasıyla.
- **Kart:** karo, “Sipariş No 00000151”, altında cari (en fazla iki satır).
- Servis siparişleri cariye göre sıralı döndürdüğü için aynı cari art arda görünür; uygulamadaki liste de böyle.
- Arama ve siparişsiz koli seçeneği aynı. Uygulamadaki önek “Fiş: ”; öneride “Sipariş No” (aktarımda karar verilecek).

## Doğrulama

- `node ui-history/tools/verify.cjs`: geçti.
- `node ui-history/tools/check-themes.cjs`: geçti; görüntüleyici dokuz ekranın hepsinde v14'ü gösterir.
- Impeccable taraması: iki ekranda v13 ile aynı bulgular (`dark-glow`, Yeni Koli ışıması); yeni bulgu yok.
- İki ekran koyu ve açık temada ekran görüntüsüyle kontrol edildi.

Yeniden üretim: `node ui-history/tools/build-flat-lists-revision.cjs --replace`.
