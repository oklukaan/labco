# Ürün Bilgi Paneli (pip) — Kurulum

Ürün sayfasının sağ kolonuna, customizer'dan yönetilen sekme ve akordeon bileşenleri ekler.
Metafield ve metaobject tanımlarını mağazada siz kurarsınız; tema kodu bu verileri yalnızca okur.

## 1. Dosyalar

| Dosya | Görev |
|---|---|
| `snippets/pip-tabs.liquid` | Ardışık `pip_tab` bloklarını tek bir sekme bileşeni olarak çizer |
| `snippets/pip-accordion.liquid` | Tek bir akordeon öğesini çizer; grubun ilk öğesinde sarmalayıcıyı açar, son öğesinde kapatır |
| `snippets/pip-content.liquid` | `content_type` değerine göre içerik gövdesini çizer (sekme ve akordeon ortak kullanır) |
| `snippets/pip-icon.liquid` | `check`, `cross`, `chevron` SVG ikonları |
| `assets/pip.css` | Tüm stiller (`.pip-` ile izole) |
| `assets/pip.js` | Sekme davranışı, akordeon animasyonu, tema editörü entegrasyonu |
| `config/settings_schema.json` | "Ürün bilgi paneli" tema ayarları grubu (dosyanın sonuna eklenir) |
| `sections/main-product.liquid` | İki blok tanımı ve iki `when` dalı |

Snippet ve asset dosyalarını temanın aynı adlı klasörlerine yükleyin. CSS ve JS'yi ayrıca bağlamanız gerekmez:
bölümdeki ilk `pip_tab` veya `pip_accordion` bloğu ikisini de bir kez yükler.

## 2. `sections/main-product.liquid`

Mevcut kodu silmeyin veya yeniden biçimlendirmeyin. Yalnızca iki ekleme yapılır.

### 2a. Blok döngüsüne iki `when` dalı

Dawn'da ürün bilgi kolonu, `product__info-container` içindeki
`{%- for block in section.blocks -%}` / `{%- case block.type -%}` döngüsüdür.
Aşağıdaki dalları `{%- endcase -%}` satırından hemen önce ekleyin:

```liquid
              {%- when 'pip_tab' -%}
                {% render 'pip-tabs', block: block, blocks: section.blocks, index: forloop.index0, product: product %}
              {%- when 'pip_accordion' -%}
                {% render 'pip-accordion', block: block, blocks: section.blocks, index: forloop.index0, product: product %}
```

`forloop.index0`, `section.blocks` döngüsünün sayacı olmalıdır. Dalları başka bir iç döngünün içine koymayın.

### 2b. Schema'ya iki blok tanımı

`{% schema %}` içindeki `"blocks": [ ... ]` dizisinin sonuna, son bloktan sonra virgül koyarak ekleyin.
Dawn'da son blok `icon-with-text`'tir.

```json
{
  "type": "pip_tab",
  "name": "Bilgi paneli: Sekme",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Sekme başlığı"
    },
    {
      "type": "text",
      "id": "group_heading",
      "label": "Grup başlığı",
      "info": "Yalnızca gruptaki ilk sekmeden okunur. Örn: Tell me about:"
    },
    {
      "type": "select",
      "id": "content_type",
      "label": "İçerik tipi",
      "default": "richtext",
      "options": [
        {
          "value": "richtext",
          "label": "Zengin metin"
        },
        {
          "value": "icon_list",
          "label": "İkonlu liste"
        },
        {
          "value": "comparison",
          "label": "Karşılaştırma tablosu"
        },
        {
          "value": "quote",
          "label": "Alıntı"
        },
        {
          "value": "dosage",
          "label": "Dozaj tablosu"
        },
        {
          "value": "facts",
          "label": "Ürün bilgileri tablosu"
        }
      ]
    },
    {
      "type": "text",
      "id": "source_metafield",
      "label": "Kaynak metafield",
      "placeholder": "pip.features_info",
      "info": "namespace.key biçiminde. Beklenen metafield tipi içerik tipine göre değişir (INSTALL.md)."
    },
    {
      "type": "header",
      "content": "Giriş ve alt metin"
    },
    {
      "type": "richtext",
      "id": "intro",
      "label": "Giriş metni"
    },
    {
      "type": "text",
      "id": "intro_metafield",
      "label": "Giriş metni metafield",
      "info": "Üründe doluysa giriş metninin yerine kullanılır."
    },
    {
      "type": "text",
      "id": "footer_metafield",
      "label": "Alt metin metafield"
    },
    {
      "type": "header",
      "content": "Zengin metin"
    },
    {
      "type": "richtext",
      "id": "richtext",
      "label": "Varsayılan metin",
      "info": "İçerik tipi zengin metinse ve kaynak metafield boşsa gösterilir."
    },
    {
      "type": "header",
      "content": "Dozaj tablosu"
    },
    {
      "type": "text",
      "id": "dosage_col1_label",
      "label": "1. sütun başlığı"
    },
    {
      "type": "text",
      "id": "dosage_col2_label",
      "label": "2. sütun başlığı"
    },
    {
      "type": "header",
      "content": "Ürün bilgileri tablosu"
    },
    {
      "type": "text",
      "id": "facts_title",
      "label": "Tablo başlığı",
      "default": "Product Facts"
    },
    {
      "type": "text",
      "id": "facts_note_metafield",
      "label": "Porsiyon notu metafield"
    }
  ]
},
{
  "type": "pip_accordion",
  "name": "Bilgi paneli: Akordeon",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Akordeon başlığı"
    },
    {
      "type": "checkbox",
      "id": "open_by_default",
      "label": "Varsayılan olarak açık",
      "default": false
    },
    {
      "type": "select",
      "id": "content_type",
      "label": "İçerik tipi",
      "default": "richtext",
      "options": [
        {
          "value": "richtext",
          "label": "Zengin metin"
        },
        {
          "value": "icon_list",
          "label": "İkonlu liste"
        },
        {
          "value": "comparison",
          "label": "Karşılaştırma tablosu"
        },
        {
          "value": "quote",
          "label": "Alıntı"
        },
        {
          "value": "dosage",
          "label": "Dozaj tablosu"
        },
        {
          "value": "facts",
          "label": "Ürün bilgileri tablosu"
        }
      ]
    },
    {
      "type": "text",
      "id": "source_metafield",
      "label": "Kaynak metafield",
      "placeholder": "pip.features_info",
      "info": "namespace.key biçiminde. Beklenen metafield tipi içerik tipine göre değişir (INSTALL.md)."
    },
    {
      "type": "header",
      "content": "Giriş ve alt metin"
    },
    {
      "type": "richtext",
      "id": "intro",
      "label": "Giriş metni"
    },
    {
      "type": "text",
      "id": "intro_metafield",
      "label": "Giriş metni metafield",
      "info": "Üründe doluysa giriş metninin yerine kullanılır."
    },
    {
      "type": "text",
      "id": "footer_metafield",
      "label": "Alt metin metafield"
    },
    {
      "type": "header",
      "content": "Zengin metin"
    },
    {
      "type": "richtext",
      "id": "richtext",
      "label": "Varsayılan metin",
      "info": "İçerik tipi zengin metinse ve kaynak metafield boşsa gösterilir."
    },
    {
      "type": "header",
      "content": "Dozaj tablosu"
    },
    {
      "type": "text",
      "id": "dosage_col1_label",
      "label": "1. sütun başlığı"
    },
    {
      "type": "text",
      "id": "dosage_col2_label",
      "label": "2. sütun başlığı"
    },
    {
      "type": "header",
      "content": "Ürün bilgileri tablosu"
    },
    {
      "type": "text",
      "id": "facts_title",
      "label": "Tablo başlığı",
      "default": "Product Facts"
    },
    {
      "type": "text",
      "id": "facts_note_metafield",
      "label": "Porsiyon notu metafield"
    },
    {
      "type": "header",
      "content": "Promosyon kartı"
    },
    {
      "type": "text",
      "id": "promo_title",
      "label": "Kart başlığı",
      "info": "Boşsa kart gösterilmez."
    },
    {
      "type": "text",
      "id": "promo_subtitle",
      "label": "Kart alt metni"
    },
    {
      "type": "image_picker",
      "id": "promo_image",
      "label": "Kart görseli"
    },
    {
      "type": "color",
      "id": "promo_bg",
      "label": "Kart arka planı"
    }
  ]
}
```

### Diğer temalar

1. Ürün sayfasının ana section'ını bulun. `templates/product.json` içindeki `"type"` değeri genellikle
   `main-product` veya `product-template` olur.
2. O dosyada `section.blocks` üzerinde dönen ve blokları `case block.type` ile çizen döngüyü arayın
   (`for block in section.blocks`). Galerinin yanındaki bilgi kolonunu çizen döngü budur.
3. 2a'daki iki `when` dalını bu `case`'e ekleyin. Tema `case` yerine `if block.type == '...'` zinciri
   kullanıyorsa aynı `render` çağrılarını `elsif block.type == 'pip_tab'` ve
   `elsif block.type == 'pip_accordion'` dallarına koyun.
4. Tema ürünü `product` dışında bir değişkende tutuyorsa (örneğin `product_object`), `product:` parametresine
   o değişkeni verin.
5. 2b'deki blok tanımlarını section schema'sının `"blocks"` dizisine ekleyin.

## 3. Tema ayarları grubu

`config/settings_schema.json` dizisinin sonuna, son gruptan sonra virgül koyarak ekleyin:

```json
{
  "name": "Ürün bilgi paneli",
  "settings": [
    {
      "type": "header",
      "content": "Karşılaştırma tablosu"
    },
    {
      "type": "image_picker",
      "id": "pip_brand_logo",
      "label": "Marka logosu",
      "info": "Marka sütununun siyah başlık kutusunda gösterilir. Açık renkli logo önerilir."
    },
    {
      "type": "text",
      "id": "pip_brand_label",
      "label": "Marka etiketi",
      "info": "Logo yoksa gösterilir. Boşsa mağaza adı kullanılır."
    },
    {
      "type": "text",
      "id": "pip_others_label",
      "label": "Diğerleri etiketi",
      "default": "Others"
    },
    {
      "type": "header",
      "content": "Renkler"
    },
    {
      "type": "color",
      "id": "pip_color_check",
      "label": "Onay ikonu (✓)",
      "default": "#1a7f45"
    },
    {
      "type": "color",
      "id": "pip_color_cross",
      "label": "Çarpı ikonu (✕)",
      "default": "#c0392b"
    },
    {
      "type": "color",
      "id": "pip_color_brand_col_bg",
      "label": "Marka sütunu arka planı",
      "default": "#e8f1fc"
    },
    {
      "type": "color",
      "id": "pip_color_border",
      "label": "Kenarlık ve ayraçlar",
      "default": "#e2e2e2"
    },
    {
      "type": "color",
      "id": "pip_color_muted",
      "label": "İkincil metin",
      "default": "#666666"
    },
    {
      "type": "color",
      "id": "pip_color_tab_inactive_bg",
      "label": "Pasif sekme arka planı",
      "default": "#f3f3f3"
    },
    {
      "type": "range",
      "id": "pip_radius",
      "label": "Köşe yarıçapı",
      "min": 0,
      "max": 24,
      "step": 1,
      "unit": "px",
      "default": 14
    }
  ]
}
```

Renkler, grubun kök elemanına inline `style` ile CSS değişkeni olarak basılır:
`--pip-color-check`, `--pip-color-cross`, `--pip-color-brand-col-bg`, `--pip-color-border`,
`--pip-color-muted`, `--pip-color-tab-inactive-bg`, `--pip-radius`.

## 4. Kullanım

- Customizer → Ürün sayfası → ürün bilgisi bölümü → **Blok ekle** → "Bilgi paneli: Sekme" veya
  "Bilgi paneli: Akordeon". Bloklar sürüklenerek sıralanabilir.
- Art arda gelen sekme blokları tek bir sekme bileşeni olur. Araya başka tipte bir blok girerse yeni grup başlar.
  Akordeonlarda da aynı kural geçerlidir.
- Grup başlığı (örneğin "Tell me about:") gruptaki ilk sekme bloğunun **Grup başlığı** alanından okunur.
- Her blok verisini, **Kaynak metafield** alanına `namespace.key` biçiminde yazılan metafield'dan okur.
  Aynı metafield'ı hem bir sekmede hem bir akordeonda kullanabilirsiniz.
- Başlığı veya ana verisi boş olan sekme/akordeon görünmez. Giriş ve alt metin tek başına bir öğeyi
  görünür tutmaz. Hiç dolu sekme yoksa grup hiç çizilmez.
- Tekrar eden içerik (liste maddeleri, tablo satırları) blok olarak değil metafield/metaobject olarak girilir.
  20 satırlık bir facts tablosu da tek bloktur.

## 5. Veri sözleşmesi

### Metaobject tipleri

| Tip | Alanlar |
|---|---|
| `pip_comparison_row` | `icon` (file_reference, image), `title` (single_line_text_field), `description` (multi_line_text_field), `link_url` (url), `link_label` (single_line_text_field), `ours` (boolean), `others` (boolean) |
| `pip_feature` | `icon` (file_reference, image, opsiyonel), `title` (single_line_text_field), `description` (rich_text_field) |
| `pip_quote` | `quote` (multi_line_text_field), `author_name` (single_line_text_field), `author_title` (single_line_text_field), `photo` (file_reference, image) |

### İçerik tipi → metafield

| `content_type` | `source_metafield` tipi | Örnek `source_metafield` | Örnek veri |
|---|---|---|---|
| `richtext` | rich_text_field (multi_line_text_field de kabul edilir) | `pip.how_to_use` | Serbest zengin metin. Metafield boşsa bloktaki **Varsayılan metin** gösterilir |
| `icon_list` | list.metaobject_reference → `pip_feature` | `pip.features_info` | Madde: ikon + "Vegan" + "Hayvansal içerik yok." |
| `comparison` | list.metaobject_reference → `pip_comparison_row` | `pip.comparison` | Satır: "Clinically tested", `ours` = true, `others` = false |
| `quote` | metaobject_reference → `pip_quote` | `pip.expert_quote` | Alıntı + isim + unvan + fotoğraf |
| `dosage` | multi_line_text_field | `pip.dosage` | Aşağıdaki dozaj örneği |
| `facts` | multi_line_text_field | `pip.facts` | Aşağıdaki facts örneği |

Ek alanların tümü rich_text_field'dır. multi_line_text_field gelirse satır sonları korunarak gösterilir.

| Blok ayarı | Görev | Örnek |
|---|---|---|
| `intro_metafield` | İçeriğin üstündeki giriş metni (doluysa bloktaki **Giriş metni** yerine geçer) | `pip.features_intro` |
| `footer_metafield` | İçeriğin altındaki zengin metin | `pip.dosage_note` |
| `facts_note_metafield` | Facts başlık bandının altındaki kalın porsiyon notu | `pip.serving_note` |

### Satır bazlı tablo formatı

Her satır bir tablo satırıdır. Hücreler `|` ile ayrılır ve kenar boşlukları temizlenir. Boş satırlar atlanır.

**dosage**: `Boyut | Alt açıklama | Doz`

```text
Small | up to 10 kg | 1 scoop
Medium | 10–25 kg | 2 scoops
Large | 25+ kg | 3 scoops
```

Sol sütunda kalın boyut ve altında alt açıklama, sağ sütunda alt açıklamayla aynı hizada kalın doz yer alır.
Sütun başlıkları bloktaki **1. sütun başlığı** ve **2. sütun başlığı** alanlarından gelir.

**facts**: `İsim | değer1 | değer2 | ...` (değer sayısı serbest)

```text
Calories | 120 kcal
Protein | 20 g | 40% DV
Vitamin D | 5 µg | 25% DV
```

Solda isim, sağda değerler alt alta ve sağa yaslı gösterilir. Başlık bandındaki metin bloktaki **Tablo başlığı**
alanından gelir (varsayılan "Product Facts").

## 6. Davranış

- Sekmeler WAI-ARIA tabs desenini uygular ve ←/→/Home/End ile gezinilir. İlk dolu sekme varsayılan olarak aktiftir.
  JS yoksa tüm paneller başlıklarıyla alt alta görünür.
- Akordeonlar yerel `<details>/<summary>` olduğu için JS'siz çalışır. JS yalnızca yumuşak açılış ekler;
  `prefers-reduced-motion` açıksa animasyon yapılmaz.
- Tema editöründe bir blok seçildiğinde ilgili sekme aktif olur ya da akordeon açılır. Section yeniden
  yüklendiğinde bileşen kendiliğinden yeniden başlar.
- `shopify theme check`, `pip-accordion.liquid` için `UnclosedHTMLElement` uyarısı verir. Bu beklenen bir durumdur:
  grup sarmalayıcısı grubun ilk öğesinde açılır, son öğesinde kapanır.

## 7. Varsayımlar

- İçerik yüzeyi beyazdır (`--pip-surface: #ffffff`). Koyu renk şemalı bir bölümde kullanılacaksa bu değişken tema CSS'inde ezilebilir.
- Karşılaştırma satırında `link_label` boşsa "Learn more" yazılır. Ekran okuyucu etiketleri ("Feature", "Yes", "No") İngilizcedir.
- `ours` / `others` boş bırakılırsa ✕ gösterilir.
- İkonlu listede açıklama tek paragraftan oluşuyorsa (liste veya başlık içermiyorsa) başlıkla aynı satırda
  "Başlık - açıklama" biçiminde akar. Aksi halde başlığın altında küçük metin olarak gösterilir.
