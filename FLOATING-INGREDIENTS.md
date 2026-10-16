# Floating Ingredients — Kurulum

Ürün sayfasında bölüm geçişlerine yerleşen, ekran kenarından taşan ve scroll'da farklı hızda kayıp
dönen 2D malzeme görselleri (referans: Shapes teması Fizz preset'indeki meyve dilimleri).
Görseller ürüne göre değişir (metafield). Saf JS + CSS; harici kütüphane, canvas veya WebGL yok.
Temanın çekirdek dosyalarına dokunulmaz.

## 1. Tema notu

Tema Dawn tabanlıdır (`labco/main`); Shapes'in sticker altyapısı yoktur. Efekt, Dawn'a özel yeni bir
bölümle yapılır. Konumlandırma Fizz'deki gibidir: obje kenara yapışık, yarısı ekran dışında, iki
bölümün birleşim çizgisinde.

## 2. Dosyalar

| Dosya | Görev |
|---|---|
| `sections/floating-ingredients.liquid` | Sıfır yükseklikli yerleştirme bölümü + şema (en fazla 6 obje bloğu) |
| `assets/floating-ingredients.css` | Konum, taşma, katman, süzülme, mobil, reduced-motion |
| `assets/floating-ingredients.js` | Scroll parallax + dönüş (~4 KB, tek init) |

CSS/JS'yi bölüm kendisi yükler. Sayfada birden fazla bölüm olsa da JS bir kez çalışır
(`window.__floatingIngredientsInit`). Hiç obje çizilemezse bölüm hiçbir şey basmaz.

## 3. Admin kurulumu (Ayarlar → Özel veriler)

### 3a. Metaobject: Malzeme

**Ayarlar → Özel veriler → Metaobject'ler → Tanım ekle**

- Ad: `Malzeme`, Tür (type): `ingredient`
- Alanlar:

| Ad | Anahtar | Tip |
|---|---|---|
| Ad | `name` | Tek satır metin |
| Görsel | `image` | Dosya → Görsel |
| Ek görseller | `alt_images` | Dosya → Görsel → **Liste** (opsiyonel) |
| Varsayılan boyut | `base_size` | Tam sayı (opsiyonel, px) |

- "Storefronts erişimi" açık olmalı.
- Kaydet → **İçerik → Metaobject'ler → Malzeme** altında her malzeme için kayıt oluştur
  (Antep Fıstığı, Fındık, Badem…).

### 3b. Ürün metafield'ı

**Ayarlar → Özel veriler → Ürünler → Tanım ekle**

- Ad: `Malzemeler`, Namespace ve anahtar: `custom.ingredients`
- Tip: **Metaobject** → `Malzeme` → **Liste**
- "Storefronts erişimi" açık olmalı.

Sonra her ürünün sayfasında **Metafield'lar → Malzemeler** alanından malzemeleri seç.

## 4. Bölümü ekleme

Tema editörü → Ürünler → şablon → **Bölüm ekle → Floating ingredients**.
Bölümü iki bölümün **arasına** sürükle (ör. ürün bilgisi ile "You may also like" arası).
Birden fazla kez eklenebilir.

### Bölüm ayarları

| Ayar | Açıklama |
|---|---|
| Görsel kaynağı | Ürünün malzemeleri (metafield) veya elle seçilen görseller |
| Katman | İçeriğin önünde (varsayılan) / arkasında. **Arkada** yalnızca arka planı şeffaf bölümlerde görünür. |
| Hafif süzülme | Scroll olmasa da 6 sn'lik yukarı-aşağı süzülme |
| Mobilde göster / Mobil boyut oranı | Mobilde tüm bölümü gizle; boyutu % olarak küçült (varsayılan %60) |

### Obje (blok) ayarları

| Ayar | Açıklama |
|---|---|
| Malzeme sırası | Metafield listesindeki kaçıncı malzeme (1'den). Liste kısaysa başa döner. |
| Özel görsel | Doluysa metafield yerine bu görsel kullanılır |
| Kenar | Sol / Sağ |
| Ekran dışına taşma | Objenin kendi genişliğine göre; negatif = dışarı (−30% ≈ üçte biri dışarıda) |
| Dikey konum | Bölüm çizgisine göre px; obje çizgiye ortalanır |
| Boyut | Masaüstü genişlik. Malzemenin `base_size`'ı doluysa o kullanılır. |
| Başlangıç açısı | Derece |
| Parallax hızı / Dönüş hızı | Scroll katsayıları; negatif = ters yön |
| Mobilde gizle | Bu objeyi mobilde gösterme |

**Ek görseller:** malzemenin `alt_images`'ı doluysa bloklar sırayla ana görsel / ek görselleri kullanır
(bloğun konumuna göre). Aynı malzemeyi iki blokta seçersen farklı açılar görünür.

## 5. Fizz'e yakın başlangıç ayarları

Bölüm eklendiğinde bu iki obje hazır gelir:

| | Kenar | Taşma | Dikey | Boyut | Açı | Parallax | Dönüş |
|---|---|---|---|---|---|---|---|
| Obje 1 (malzeme 1) | Sol | −35% | −80px | 200px | −20° | 35 | 25 |
| Obje 2 (malzeme 2) | Sağ | −30% | 60px | 160px | 30° | −25 | −20 |

Önerilen yerleşim: 2 bölüm × 2 obje. Biri ürün bilgisi ile açıklama/yorumlar arasına, diğeri
"You may also like" öncesine. İkinci bölümde kenarları ve hız işaretlerini ters çevir.

## 6. Teknik notlar

- **Katman:** z-index Shopify'ın bölüm sarmalayıcısına verilir (`.shopify-section.fi-section`).
  İçteki elemana verilseydi sonraki bölüm objeyi örterdi. Önde: z-index 3 — Dawn'ın yapışkan ürün
  sütununun (2) üstünde, header grubunun (3/4) ve çapa menüsünün (5) altında.
- **Tıklama:** tüm katmanlar `pointer-events: none`; Sepete ekle, varyant seçici ve galeri etkilenmez.
- **Yatay taşma:** obje ekran dışına taşar ama yatay scroll oluşmaz. Kapsayıcı yalnızca yatayda
  kırpılır (`overflow-x: clip; overflow-y: visible`); global `html/body` değişikliği yok.
  Safari 15 ve öncesinde (`clip` desteği yok) yedek olarak `body { overflow-x: hidden }` uygulanır.
- **CLS:** bölüm 0 px yüksekliğinde, objeler `position: absolute`; sayfa akışı değişmez.
- **Performans:** `IntersectionObserver` (200 px pay) yalnızca ekrana yakın objeleri hesaplar; tek
  pasif scroll dinleyicisi + `requestAnimationFrame`; okuma/yazma ayrı. Bölüm konumları önbelleklenir,
  sayfa yüksekliği değişince (`ResizeObserver` — akordeon, sekme, geç yüklenen görseller) yenilenir.
  Hareket yumuşatılır (lerp 0.12).
- **Reduced motion:** `prefers-reduced-motion` açıkken scroll ve süzülme animasyonu kapalı; ayar
  değişikliği dinlenir.
- **Tema editörü:** bölüm/blok eklenince, silinince, sıralanınca veya seçilince yeniden kurulur;
  ayar değişikliği sayfa yenilemeden görünür.
- **Şablon dışı:** ürün şablonu dışında `product` yoktur; "metafield" kaynağı boş çıkar, "elle seçilen"
  kullanılmalı.
- **Bölüm kotası:** her yerleştirme bir bölümdür; Shopify şablon başına 25 bölüm sınırı vardır.

## 7. Görsel hazırlığı

- WebP (alfa kanallı), yedek PNG; arka plan tamamen şeffaf, kenarda beyaz hale olmasın.
- Uzun kenar 600–800 px yeterli (gösterim en fazla 400 px; `srcset` 2x'e kadar ister); hedef < 120 KB.
- Gerçek fotoğraf kesimleri (kabuklu fıstık, yarım fındık) en iyi sonucu verir; 2–3 açı tekrar hissini azaltır.

## 8. Test durumu

Yerel test (Dawn `base.css` + gerçek dosyalar, Chrome): yatay scroll yok, objelerin altındaki buton
tıklanıyor, objeler sonraki bölümün önünde, scroll'da translate/rotate değişiyor, reduced-motion'da
statik, theme check temiz. Safari (iOS dahil), Firefox ve Edge'de mağazada ayrıca test edilmeli.
