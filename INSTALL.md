# Ürün Bilgi Paneli (pip) — Kurulum

Ürün sayfasının sağ kolonuna, customizer'dan yönetilen sekme ve akordeon bileşenleri ekler.
Metafield ve metaobject tanımlarını mağazada siz kurarsınız; tema kodu bu verileri yalnızca okur.

## 1. Dosyalar

| Dosya | Görev |
|---|---|
| `snippets/pip-tabs.liquid` | Ardışık `pip_tab` bloklarını tek bir sekme bileşeni olarak çizer |
| `snippets/pip-accordion.liquid` | Tek bir akordeon öğesini çizer; grubun ilk öğesinde sarmalayıcıyı açar, son öğesinde kapatır |
| `snippets/pip-content.liquid` | `content_type` değerine göre ürünün `pip.panel` verisinden içerik gövdesini çizer (sekme ve akordeon ortak kullanır) |
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
      "info": "Veri, ürünün pip.panel metaobject’inden içerik tipine göre okunur.",
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
      "type": "select",
      "id": "list_source",
      "label": "Liste kaynağı",
      "default": "features_info",
      "options": [
        {
          "value": "features_info",
          "label": "Ürün bilgisi maddeleri"
        },
        {
          "value": "features_benefits",
          "label": "Fayda maddeleri"
        }
      ],
      "visible_if": "{{ block.settings.content_type == 'icon_list' }}"
    },
    {
      "type": "richtext",
      "id": "intro",
      "label": "Giriş metni",
      "info": "Doluysa panelden gelen girişin üstüne eklenir."
    },
    {
      "type": "richtext",
      "id": "richtext",
      "label": "Metin",
      "visible_if": "{{ block.settings.content_type == 'richtext' }}"
    },
    {
      "type": "text",
      "id": "dosage_col1_label",
      "label": "1. sütun başlığı",
      "visible_if": "{{ block.settings.content_type == 'dosage' }}"
    },
    {
      "type": "text",
      "id": "dosage_col2_label",
      "label": "2. sütun başlığı",
      "visible_if": "{{ block.settings.content_type == 'dosage' }}"
    },
    {
      "type": "text",
      "id": "facts_title",
      "label": "Tablo başlığı",
      "default": "Product Facts",
      "visible_if": "{{ block.settings.content_type == 'facts' }}"
    },
    {
      "type": "header",
      "content": "Özel kaynak (isteğe bağlı)",
      "visible_if": "{{ block.settings.content_type == 'comparison' or block.settings.content_type == 'icon_list' or block.settings.content_type == 'quote' or block.settings.content_type == 'dosage' or block.settings.content_type == 'facts' }}"
    },
    {
      "type": "metaobject_list",
      "id": "override_comparison",
      "metaobject_type": "pip_comparison_row",
      "label": "Karşılaştırma satırları (karşılaştırma tablosu)",
      "info": "Boş bırakılırsa ürünün panelinden okunur. Yalnızca ilgili içerik tipinde kullanılır."
    },
    {
      "type": "metaobject_list",
      "id": "override_features",
      "metaobject_type": "pip_feature",
      "label": "Liste maddeleri (ikonlu liste)",
      "info": "Boş bırakılırsa ürünün panelinden okunur. Yalnızca ilgili içerik tipinde kullanılır."
    },
    {
      "type": "metaobject",
      "id": "override_quote",
      "metaobject_type": "pip_quote",
      "label": "Alıntı (alıntı)",
      "info": "Boş bırakılırsa ürünün panelinden okunur. Yalnızca ilgili içerik tipinde kullanılır."
    },
    {
      "type": "textarea",
      "id": "override_rows",
      "label": "Tablo satırları",
      "info": "Boş bırakılırsa ürünün panelinden okunur. Her satır bir tablo satırıdır, hücreler | ile ayrılır.",
      "visible_if": "{{ block.settings.content_type == 'dosage' or block.settings.content_type == 'facts' }}"
    },
    {
      "type": "richtext",
      "id": "override_footer",
      "label": "Alt metin",
      "info": "Boş bırakılırsa ürünün panelinden okunur.",
      "visible_if": "{{ block.settings.content_type == 'dosage' or block.settings.content_type == 'facts' }}"
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
      "info": "Veri, ürünün pip.panel metaobject’inden içerik tipine göre okunur.",
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
      "type": "select",
      "id": "list_source",
      "label": "Liste kaynağı",
      "default": "features_info",
      "options": [
        {
          "value": "features_info",
          "label": "Ürün bilgisi maddeleri"
        },
        {
          "value": "features_benefits",
          "label": "Fayda maddeleri"
        }
      ],
      "visible_if": "{{ block.settings.content_type == 'icon_list' }}"
    },
    {
      "type": "richtext",
      "id": "intro",
      "label": "Giriş metni",
      "info": "Doluysa panelden gelen girişin üstüne eklenir."
    },
    {
      "type": "richtext",
      "id": "richtext",
      "label": "Metin",
      "visible_if": "{{ block.settings.content_type == 'richtext' }}"
    },
    {
      "type": "text",
      "id": "dosage_col1_label",
      "label": "1. sütun başlığı",
      "visible_if": "{{ block.settings.content_type == 'dosage' }}"
    },
    {
      "type": "text",
      "id": "dosage_col2_label",
      "label": "2. sütun başlığı",
      "visible_if": "{{ block.settings.content_type == 'dosage' }}"
    },
    {
      "type": "text",
      "id": "facts_title",
      "label": "Tablo başlığı",
      "default": "Product Facts",
      "visible_if": "{{ block.settings.content_type == 'facts' }}"
    },
    {
      "type": "header",
      "content": "Özel kaynak (isteğe bağlı)",
      "visible_if": "{{ block.settings.content_type == 'comparison' or block.settings.content_type == 'icon_list' or block.settings.content_type == 'quote' or block.settings.content_type == 'dosage' or block.settings.content_type == 'facts' }}"
    },
    {
      "type": "metaobject_list",
      "id": "override_comparison",
      "metaobject_type": "pip_comparison_row",
      "label": "Karşılaştırma satırları (karşılaştırma tablosu)",
      "info": "Boş bırakılırsa ürünün panelinden okunur. Yalnızca ilgili içerik tipinde kullanılır."
    },
    {
      "type": "metaobject_list",
      "id": "override_features",
      "metaobject_type": "pip_feature",
      "label": "Liste maddeleri (ikonlu liste)",
      "info": "Boş bırakılırsa ürünün panelinden okunur. Yalnızca ilgili içerik tipinde kullanılır."
    },
    {
      "type": "metaobject",
      "id": "override_quote",
      "metaobject_type": "pip_quote",
      "label": "Alıntı (alıntı)",
      "info": "Boş bırakılırsa ürünün panelinden okunur. Yalnızca ilgili içerik tipinde kullanılır."
    },
    {
      "type": "textarea",
      "id": "override_rows",
      "label": "Tablo satırları",
      "info": "Boş bırakılırsa ürünün panelinden okunur. Her satır bir tablo satırıdır, hücreler | ile ayrılır.",
      "visible_if": "{{ block.settings.content_type == 'dosage' or block.settings.content_type == 'facts' }}"
    },
    {
      "type": "richtext",
      "id": "override_footer",
      "label": "Alt metin",
      "info": "Boş bırakılırsa ürünün panelinden okunur.",
      "visible_if": "{{ block.settings.content_type == 'dosage' or block.settings.content_type == 'facts' }}"
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
- Blokta yalnızca **İçerik tipi** seçilir; veri ürünün panelinden (`pip.panel`) sabit alanlardan okunur (bölüm 5).
  Aynı panel alanı hem bir sekmede hem bir akordeonda gösterilebilir.
- İçerik tipine özel ayarlar (sütun başlıkları, tablo başlığı, liste kaynağı vb.) yalnızca ilgili tip seçiliyken görünür.
- Başlığı veya ana verisi boş olan sekme/akordeon görünmez. Giriş ve alt metin tek başına bir öğeyi
  görünür tutmaz. Hiç dolu sekme yoksa grup hiç çizilmez. Ürünün paneli yoksa panelden okuyan bloklar görünmez.
- Tekrar eden içerik (liste maddeleri, tablo satırları) blok olarak değil metaobject alanı olarak girilir.
  20 satırlık bir facts tablosu da tek bloktur.

## 5. Veri modeli

### Ürün metafield'ı

| Namespace ve key | Tip |
|---|---|
| `pip.panel` | Metaobject reference → `pip_panel` |

### `pip_panel` alanları

| Alan | Tip | Kullanan içerik tipi |
|---|---|---|
| `quote` | Metaobject reference → `pip_quote` | `quote` |
| `comparison` | List of metaobject references → `pip_comparison_row` | `comparison` |
| `features_info` | List of metaobject references → `pip_feature` | `icon_list` (Liste kaynağı: Ürün bilgisi maddeleri) |
| `intro_info` | Rich text | `icon_list` girişi (yalnızca `features_info` seçiliyken) |
| `features_benefits` | List of metaobject references → `pip_feature` | `icon_list` (Liste kaynağı: Fayda maddeleri) |
| `dosage` | Multi-line text | `dosage` satırları |
| `directions_footer` | Rich text | `dosage` alt metni |
| `facts` | Multi-line text | `facts` satırları |
| `facts_note` | Rich text | `facts` porsiyon notu (başlık bandının altında, kalın) |
| `facts_footer` | Rich text | `facts` alt metni |

Rich text alanları multi-line text olarak tanımlanırsa da çalışır; satır sonları korunarak gösterilir.
`richtext` içerik tipi panelden okumaz, bloktaki **Metin** ayarını gösterir.

### İçerik tipi → okunan veri

| `content_type` | Ana veri | Giriş | Alt metin |
|---|---|---|---|
| `quote` | `quote` | — | — |
| `comparison` | `comparison` | — | — |
| `icon_list` | **Liste kaynağı**na göre `features_info` veya `features_benefits` | `features_info` seçiliyse `intro_info` | — |
| `dosage` | `dosage` | — | `directions_footer` |
| `facts` | `facts` | `facts_note` (porsiyon notu) | `facts_footer` |
| `richtext` | Blok ayarı **Metin** | — | — |

Bloğun **Giriş metni** ayarı doluysa, panelden gelen girişin üstüne eklenir. Bu ayar tüm tiplerde geçerlidir.

### Metaobject tipleri

| Tip | Alanlar |
|---|---|
| `pip_comparison_row` | `icon` (file_reference, image), `title` (single_line_text_field), `description` (multi_line_text_field), `link_url` (url), `link_label` (single_line_text_field), `ours` (boolean), `others` (boolean) |
| `pip_feature` | `icon` (file_reference, image, opsiyonel), `title` (single_line_text_field), `description` (rich_text_field) |
| `pip_quote` | `quote` (multi_line_text_field), `author_name` (single_line_text_field), `author_title` (single_line_text_field), `photo` (file_reference, image) |

### Özel kaynak (override)

Her blokta "Özel kaynak (isteğe bağlı)" başlığı altında, panel yerine kullanılacak veriyi seçebileceğiniz ayarlar vardır.
Doluysa panel yerine bu veri kullanılır; boşsa ürünün panelinden okunur. Ayarların hepsi dinamik kaynak destekler:
ayarın yanındaki **Dinamik kaynak bağla** ikonundan bir metafield seçebilir ya da doğrudan bir metaobject seçebilirsiniz.

| Ayar | Tip | İçerik tipi |
|---|---|---|
| `override_comparison` | metaobject_list (`pip_comparison_row`) | `comparison` |
| `override_features` | metaobject_list (`pip_feature`) | `icon_list` (liste kaynağı ayarının yerine geçer) |
| `override_quote` | metaobject (`pip_quote`) | `quote` |
| `override_rows` | textarea | `dosage`, `facts` |
| `override_footer` | richtext | `dosage`, `facts` |

`override_comparison`, `override_features` ve `override_quote` her içerik tipinde görünür, çünkü Shopify şeması
metaobject ayarlarında `visible_if` kabul etmiyor. Bu ayarlar yalnızca etiketlerinde yazan içerik tipinde okunur.
Diğer override ayarları yalnızca ilgili tip seçiliyken görünür.

### Satır bazlı tablo formatı

`dosage` ve `facts` alanları ile `override_rows` ayarı aynı formatı kullanır. Her satır bir tablo satırıdır.
Hücreler `|` ile ayrılır ve kenar boşlukları temizlenir. Boş satırlar atlanır.

**dosage**: `Boyut | Alt açıklama | Doz`

```text
Small | Under 25 lbs | 1 soft chew/Small
Medium | 25 - 75 lbs | 1 soft chew/Medium
Large | Over 75 lbs | 1 soft chew/Large
```

Sol sütunda kalın boyut ve altında alt açıklama yer alır. Sağ sütunda küçük dolu bir daire (●) ve altında kalın doz bulunur.
Sütun başlıkları bloktaki **1. sütun başlığı** ve **2. sütun başlığı** alanlarından gelir.

**facts**: `İsim | değer1 | değer2 | ...` (değer sayısı serbest)

```text
A Proprietary Blend of Probiotics | 1 Billion CFU | 2 Billion CFU | 3 Billion CFU
Colostrum (Bovine) | 350 mg | 700 mg | 1050 mg
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
