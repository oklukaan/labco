# Çapa Menüsü (anchor-nav) — Kurulum

Header'ın altına yapışan, sayfa bölümlerine kayarak geçiş yapan ve kaydırırken aktif bölümü
vurgulayan navigasyon çubuğu (referans: thepetlabco.com ürün sayfası).
Temanın header'ına veya mevcut section'larına dokunulmaz; tüm kod kendi dosyalarındadır.

## 1. Dosyalar

| Dosya | Görev |
|---|---|
| `sections/anchor-nav.liquid` | "Çapa menüsü" section'ı. Bloklar = linkler. CSS/JS'yi kendisi yükler. |
| `sections/anchor-marker.liquid` | "Çapa işaretçisi" section'ı. Görünmez, sıfır yükseklikte hedef. |
| `assets/anchor-nav.css` | Stiller (`.anv-` ile izole, `!important` yok). |
| `assets/anchor-nav.js` | Yapışma, kaydırma, scroll-spy, editör entegrasyonu. |

Dört dosyayı temanın aynı adlı klasörlerine yükleyin. Başka bir ayar gerekmez.
Online Store 2.0 temalarının hepsinde çalışır; Dawn'a özgü bir bağımlılık yoktur.

## 2. Kurulum (customizer)

### 2a. Çubuğu ekle

Customizer → ilgili sayfa (ör. ürün sayfası) → **Add section** → **Çapa menüsü**.

Nereye koyacağınız iki seçenek:

| Konum | Sonuç |
|---|---|
| **Template** grubu, ilk section olarak | Yalnızca o şablonda görünür. Önerilen. |
| **Header** grubu, Header'ın altına | Tüm sayfalarda görünür. Hedefi olmayan sayfalarda JS çubuğu tamamen gizler. |

Preset üç linkle gelir (Product Info, Vet Reviewed, Key Ingredients). Linkleri **Add Link** ile
çoğaltın, sürükleyerek sıralayın. En fazla 12 link.

### 2b. Hedefleri tanımla

Her link bloğunda iki alan vardır: **Etiket** (çubukta görünen yazı) ve **Hedef**.
Hedef üç biçimde yazılabilir; JS sırayla dener, ilk bulunanı kullanır:

| Yöntem | Hedef alanına yazılan | Ne zaman |
|---|---|---|
| **A. Section id'sini yapıştır** | `shopify-section-template--28388479861035__related-products` | En kolayı. Mevcut bir section'ın başına gitmek yeterliyse. |
| **B. Çapa işaretçisi** | işaretçinin çapa adı, ör. `vet-reviewed` | Hedef bir section'ın başı değilse, ya da aynı kurulumu başka şablon/temaya taşıyacaksanız. |
| **C. Section anahtarı** | `related-products`, `main` | A'nın kısa hali: id'nin `__` sonrası. Şablon numarası değişse de çalışır. |

**Yöntem A — id yapıştır:** mağazada F12 → Elements → hedef bölümün üstündeki
`<section id="shopify-section-…">` veya `<div id="shopify-section-…">` satırındaki id'yi kopyalayıp
Hedef alanına yapıştırın. Baştaki `#` olsa da olur. Not: bu id şablona özeldir; şablon kopyalanır
veya tema değişirse numara değişir, linki güncellemeniz gerekir. Taşınabilirlik önemliyse B veya C.

**Yöntem B — işaretçi:** Customizer → **Add section** → **Çapa işaretçisi** → çapa adını yazın →
section'ı, hedeflenecek section'ın **hemen üstüne** sürükleyin. Sayfada görünmez. İstediğiniz kadar
ekleyebilirsiniz; "Not" alanı yalnızca editörde, hangi bölümün üstünde durduğunu hatırlamak içindir.
Çapa adı küçük harf ve tire olmalıdır (`vet-reviewed`).

**Yöntem C — section anahtarı:** Shopify her section'ı `id="shopify-section-template--<şablon>__<anahtar>"`
ile sarar; anahtar `__` sonrasıdır (`templates/<şablon>.json` içindeki section adı). Dawn ürün
şablonunda `main` (ürün bilgisi) ve `related-products` (You may also like) sabittir; customizer'dan
eklenen section'ların anahtarı rastgeledir (`multirow_AbCdEf`).

### 2c. Kaydet ve mağazada test et

Tema editörünün önizlemesinde linke tıklamak linki çalıştırmaz, bloğu seçer. Testi mağazada yapın.
Editörde sol listeden bir Link bloğunu seçince önizleme o linkin hedefine kayar.

## 3. Section ayarları

| Ayar | Açıklama | Varsayılan |
|---|---|---|
| Header'ın altına yapışsın | Kaydırınca çubuk header'ın altında sabit kalır. Header yapışkan değilse çubuk ekranın üstüne yapışır. | açık |
| Tıklayınca URL'yi güncelle | Adres çubuğuna linkin etiketinden türeyen kısa hash yazılır (`#vet-reviewed`); bu adresle açılan sayfa aynı bölüme kaydırılır. | açık |
| Mobilde göster | Kapalıysa 750px altında gizlenir. | açık |
| Hizalama | Linkler sola veya ortaya. | ortaya |
| Yazı boyutu | 12–20px | 16px |
| Aktif bölüm eşiği | Bölümün üst kenarı çubuğun bu kadar altına gelince o bölüm aktif sayılır. | 40px |
| Arka plan / Yazı / Aktif link / Alt çizgi | Renkler | beyaz / `#1E1F24` / `#076D08` / `#D8DADF` |
| Erişilebilirlik etiketi | `<nav aria-label>` | Sayfa bölümleri |

## 4. Davranış

- **Yapışma:** çubuk doğal yerinde başlar; kaydırınca üst kenarı header'ın görünür alt kenarına değdiği
  anda `position: fixed` olur (akıştaki boşluğu bir yer tutucu korur), geri kaydırınca akışa döner.
  Header'ın alt kenarı her kaydırma karesinde okunur: Dawn'ın "yalnızca yukarı kaydırınca göster"
  modunda header gizlenince çubuk ekranın tepesine, header dönünce altına kayar. Header yoksa veya
  gizliyse çubuk tepeye yapışır. Sticky yerine fixed kullanıldığı için çubuğun hangi section
  grubunda olduğu (header grubu dâhil) ve Dawn'ın header kuralları sonucu etkilemez.
- **Kaydırma:** hedefin üst kenarı header + çubuğun hemen altına gelir. `prefers-reduced-motion`
  açıksa anında, değilse yumuşak. URL hash'i `history.replaceState` ile linkin etiketine göre güncellenir
  (`#vet-reviewed`); hash ile açılan sayfa doğru ofsetle konumlanır.
- **Scroll-spy:** eşiği geçen son hedef aktif olur (`is-active`, `aria-current="location"`). Hiçbir
  hedefe gelinmediyse ilk link, sayfa sonunda son link aktiftir.
- **Mobil:** çubuk yatay kaydırılır, aktif link görünür alana getirilir.
- **Eksik hedef:** hedefi sayfada bulunmayan link gizlenir. Hiç hedef yoksa çubuk tamamen gizlenir
  (header grubunda kullanım için).
- **Editör:** section ekleme/silme/sıralama olaylarında hedefler yeniden çözümlenir; Link bloğu
  seçilince önizleme hedefe kayar.

## 5. Bilinen noktalar

- **Dawn `div:empty`:** Dawn'ın `base.css`'i boş `div`'leri gizler. İşaretçi boş bir `div` olduğu için
  `anchor-nav.css` bunu `.anv-marker:empty` ile ezer. İşaretçiyi değiştirirken bu kuralı koruyun.
- **Theme check:** `anchor-marker.liquid` ve `anchor-nav.liquid` uyarısız geçer.
- **Header grubu:** çubuk header grubundaysa header ölçümünde kendi section'ı sayılmaz; fixed konumlandırma sayesinde header gizli olsa da çalışır.
- **Hedef alanı olduğu gibi okunur:** Liquid tarafında `handleize` uygulanmaz; aksi halde id'lerdeki `__` bozulurdu. Baştaki `#` ve boşluklar JS'te temizlenir.
- **Bilgi paneli sekmeleri:** çubuktaki bir linkin ürün bilgi panelindeki sekmeyi açması (referansta
  "Vet Reviewed" → sekme) henüz yok; işaretçiyi panelin üstüne koyarak panele kaydırabilirsiniz.

## 6. Başka temaya taşıma

1. Dört dosyayı kopyalayın.
2. Customizer'dan çubuğu ve işaretçileri ekleyin (bölüm 2).
3. Çubuk header'ın altına değil ekranın tepesine yapışıyorsa temanın header'ı `.shopify-section-header`,
   `.section-header`, `.shopify-section-group-header-group` veya `header` seçicilerinden biriyle
   bulunamıyordur; `anchor-nav.js` içindeki `headerBottom` listesine temanın header seçicisini ekleyin.
