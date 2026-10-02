# pip_ Metaobject Tanımları – Hedef Mağaza Kurulum Listesi

Kaynak: myteststoreqqwee (Sidekick ile okunan şema)
Amaç: Hedef mağazada **sadece tanımları** kurmak, içerik (entry) taşımamak.

## Genel kurallar

- **Type ve alan key'leri birebir aynı olmalı.** Tema verilere bunlarla erişiyor; görünen adlar önemli değil.
- Tüm tanımlarda **Storefronts API access** açık (PUBLIC_READ) ve **Translations** açık olmalı.
- Diğer seçenekler (Active-draft status, Publish entries as web pages, Customer Account API access) kaynakta kapalı.
- **Oluşturma sırası:** `pip_panel` diğer beş tanıma referans verdiği için en son kurulmalı.

| Sıra | Type | Görünen ad |
|---|---|---|
| 1 | `pip_benefit` | (yok) |
| 2 | `pip_why_subscribe` | (yok) |
| 3 | `pip_feature` | Özellik Maddesi |
| 4 | `pip_quote` | Uzman Görüşü |
| 5 | `pip_comparison_row` | Karşılaştırma Satırı |
| 6 | `pip_panel` | (yok) |

## Kurulumdan önce teyit edilecekler

- [ ] Dosya alanları (`icon`, `photo`) **sadece görsel** ile sınırlı mı? (`pip_why_subscribe.icon` kaynakta "Image (File)" görünüyordu.)
- [ ] `pip_why_subscribe` alanları zorunlu mu, opsiyonel mi? (Sidekick opsiyonel dedi, admin ekranında yıldız işareti vardı.)
- [ ] `pip_panel` referans alanlarının hangi tanıma bağlı olduğu (aşağıdaki eşleşmeler tahmin, kaynakta kontrol et).
- [ ] Temada hâlâ `directions_footer` geçiyor mu? (Kaynak şemadan kalkmış, yerine `pip_why_subscribe` liste alanı gelmiş.)

---

## 1. pip_benefit

| Key | Ad | Tip | Zorunlu | Tekil/Liste |
|---|---|---|---|---|
| `title` | – | Tek satır metin | Hayır | Tekil |
| `icon` | – | Dosya (görsel?) | Hayır | Tekil |

## 2. pip_why_subscribe

| Key | Ad | Tip | Zorunlu | Tekil/Liste |
|---|---|---|---|---|
| `title` | – | Tek satır metin | Hayır (teyit et) | Tekil |
| `description` | – | Tek satır metin | Hayır (teyit et) | Tekil |
| `icon` | – | Dosya (Image) | Hayır (teyit et) | Tekil |

## 3. pip_feature – "Özellik Maddesi"

| Key | Ad | Tip | Zorunlu | Tekil/Liste |
|---|---|---|---|---|
| `title` | Başlık | Tek satır metin | **Evet** | Tekil |
| `description` | Açıklama | Zengin metin | Hayır | Tekil |
| `icon` | İkon | Dosya (görsel?) | Hayır | Tekil |

## 4. pip_quote – "Uzman Görüşü"

| Key | Ad | Tip | Zorunlu | Tekil/Liste |
|---|---|---|---|---|
| `author_name` | Uzman adı | Tek satır metin | **Evet** | Tekil |
| `quote` | Alıntı | Çok satırlı metin | **Evet** | Tekil |
| `author_title` | Unvan | Tek satır metin | Hayır | Tekil |
| `photo` | Fotoğraf | Dosya (görsel?) | Hayır | Tekil |

## 5. pip_comparison_row – "Karşılaştırma Satırı"

| Key | Ad | Tip | Zorunlu | Tekil/Liste |
|---|---|---|---|---|
| `title` | – | Tek satır metin | **Evet** | Tekil |
| `description` | – | Çok satırlı metin | Hayır | Tekil |
| `icon` | İkon | Dosya (görsel?) | Hayır | Tekil |
| `link_url` | Link | URL | Hayır | Tekil |
| `link_label` | Link yazısı | Tek satır metin | Hayır | Tekil |
| `ours` | Bizde var | Boolean (True/false) | Hayır | Tekil |
| `others` | Rakiplerde var | Boolean (True/false) | Hayır | Tekil |

## 6. pip_panel (en son kurulacak)

| Key | Ad | Tip | Referans verdiği tanım | Zorunlu | Tekil/Liste |
|---|---|---|---|---|---|
| `name` | Panel adı | Tek satır metin | – | Hayır | Tekil |
| `comparison` | Karşılaştırma satırları | Metaobject referansı | `pip_comparison_row` (teyit et) | Hayır | **Liste** |
| `features_info` | – | Metaobject referansı | `pip_feature` (teyit et) | Hayır | **Liste** |
| `quote` | – | Metaobject referansı | `pip_quote` (teyit et) | Hayır | Tekil |
| `features_benefits` | Fayda Listesi | Metaobject referansı | `pip_benefit` (teyit et) | Hayır | **Liste** |
| `pip_why_subscribe` | – | Metaobject referansı | `pip_why_subscribe` (teyit et) | Hayır | **Liste** |
| `intro_info` | – | Zengin metin | – | Hayır | Tekil |
| `dosage` | – | Çok satırlı metin | – | Hayır | Tekil |
| `facts` | – | Çok satırlı metin | – | Hayır | Tekil |
| `facts_note` | – | Zengin metin | – | Hayır | Tekil |
| `facts_footer` | – | Zengin metin | – | Hayır | Tekil |

---

## Sonraki adım: Ürün metafield'ı

`pip_panel` büyük ihtimalle ürünlere bir **product metafield** ile bağlanıyor. Metaobject'leri kurduktan sonra:

- [ ] Kaynak mağazada ürün metafield tanımlarını listele (namespace, key, tip).
- [ ] Hedef mağazada aynı namespace/key ile, `pip_panel`'e referans veren metafield tanımını oluştur.

---

## Sidekick ile denemek için (hedef mağazada, yeni sohbette, tek tek)

Örnek ilk istek:

```
pip_benefit adında bir metaobject tanımı oluştur. Alanlar:
- title: tek satır metin, opsiyonel
- icon: dosya (sadece görsel), opsiyonel
Storefront erişimi ve çeviriler açık olsun. İçerik ekleme.
```

Çalışırsa diğerlerini yukarıdaki sırayla aynı formatta iste. `pip_panel` için her referans alanının hangi tanıma bağlanacağını açıkça yaz.

## Alternatifler

- **Elle:** Settings → Metafields and metaobjects → Add definition (yaklaşık 20–30 dakika).
- **Script:** Hedef mağazada Dev Dashboard'dan app oluştur, `read_metaobject_definitions` + `write_metaobject_definitions` Admin API yetkisi ver. Storefront token bu iş için **kullanılamaz**.
