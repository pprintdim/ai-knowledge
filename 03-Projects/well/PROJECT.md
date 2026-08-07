> [!note] Імпортовано з `/Users/pprintdim/Desktop/vs_projects/well/.claude/project.md` 2026-08-07 (DOCS-POLICY). Санітизовано секретів: 0. Оригінал: untracked, видалений.

# Проект: Well — OpenCart 3

## Загальна інформація

| Параметр | Значення |
|---|---|
| Платформа | **OpenCart 3** |
| Кастомна тема | `well` (author: Pprintdim, v1.0) |
| Мови | `uk-ua` (основна), `ru-ru`, `en-gb` |
| Структура | Стандартна OC3: `admin/`, `catalog/`, `system/`, `image/` |

---

## Кастомні модулі (admin/controller/extension/module/)

| Модуль | Призначення |
|---|---|
| `components` | Сторінка "Компоненти" — віртуальна категорія товарів (ID 999999), фільтрується через OCFilter |
| `third_level` | Третій рівень меню — зберігається в `oc_module` (code=`third_level`), JSON-налаштування з repeater |
| `home_banner` | Головний банер на головній сторінці |
| `featured_blog` | Блок вибраних статей блогу |
| `latest_blog` | Блок останніх статей блогу |
| `bestseller` | Блок бестселерів |
| `latest` | Блок новинок |
| `category` | Кастомний блок категорій |
| `brands` | Брендова вітрина |
| `flexible_banners` | Гнучкі банери |
| `ocfilter` | OCFilter — зовнішній модуль фільтрації товарів |

---

## Меню (catalog/controller/common/menu.php)

### Принцип побудови

Меню будується рекурсивно через `collectLevelsByParent()` і формує масив `$levels`:

```
$levels[1] → перший рівень (головні категорії)
$levels[2] → другий рівень (підкатегорії)
$levels[3] → третій рівень (генерується з модуля third_level)
```

### Компоненти у меню

- До `$levels[1][0]['categories']` додається віртуальний пункт **Компоненти** (`category_id = 999999`)
- До `$levels[2]` додається блок підменю компонентів з `module_components_items`
- Перший пункт підменю — "Всі компоненти" (посилання на `product/components`)

### Третій рівень

- Береться з таблиці `oc_module` (code=`third_level`) через модель `ModelExtensionModuleThirdLevel`
- Кожен модуль має `category_id` та `repeater` з елементами
- Елемент repeater може бути: фільтром (`filter_name` починається з `F`) або `ocfilter_page`

---

## Сторінка Компоненти (catalog/controller/product/components.php)

- URL: `product/components`
- Фільтрація через `config_components_filter` (ID фільтра в OCFilter)
- Якщо в URL є `?ocf=...` — використовується переданий фільтр замість дефолтного
- Підтримує сортування, пагінацію, ліміти

---

## Конфіги компонентів

### `module_components_menu`
```php
[
  'name' => [language_id => 'Назва'],  // мультимовна назва пункту меню
  'icon' => ['image' => 'path/to/icon.svg']
]
```

### `module_components_items`
Масив підпунктів меню компонентів:
```php
[
  'icon'   => 'path/to/icon.svg',
  'name'   => [language_id => 'Назва'],
  'filter' => '...'  // див. нижче
]
```

Поле `filter` підтримує три варіанти:
- **OCFilter рядок** (наприклад `F125S2V4283173379`) → генерується `product/components?ocf=...`
- **Абсолютний URL** (`https://...`) → використовується напряму
- **SEO URL** (починається з `/`) → використовується напряму
- **Порожнє** → елемент пропускається

---

## OCFilter

- Зовнішній модуль (папка `admin/controller/extension/module/ocfilter/`)
- Таблиці: `oc_ocfilter_filter`, `oc_ocfilter_filter_value`, `oc_ocfilter_page`, `oc_ocfilter_page_description`
- Формат фільтра в URL: `ocf=F{filter_id}S{...}V{value_id,...}`
- Формат сторінок: `ocfilter_page_id={page_id}` разом з `path={category_id}`

---

## Модель продуктів (catalog/model/catalog/product.php)

- Розширена — підтримує кастомні поля: `variation`, `variation_type`, `stickers`, `in_cart`, `in_wishlist`, `reviews`
- `getVariations()` — отримує варіації товару
- Інтеграція з OCFilter через `filter_ocfilter`

---

## Кастомні контролери (catalog/controller/common/)

| Контролер | Призначення |
|---|---|
| `header.php` | Кастомний хедер |
| `footer.php` | Кастомний футер |
| `burger_menu.php` | Мобільне меню (бургер) |
| `ajax_search.php` | AJAX-пошук |
| `sprite.php` | SVG-спрайти |
| `menu.php` | Головне меню (багаторівневе) |

---

## Зміни в цій сесії

### catalog/controller/common/menu.php

**Що змінено:** Додано перевірку поля `filter` у підпунктах меню компонентів.

**Було:**
```php
'href' => $this->url->link('product/components', 'ocf=' . $item['filter'], true)
```

**Стало:**
```php
$filter_val = $item['filter'] ?? '';
if (preg_match('#^https?://#i', $filter_val) || strncmp($filter_val, '/', 1) === 0) {
    $href = $filter_val;           // прямий абс. або SEO URL
} elseif ($filter_val !== '') {
    $href = $this->url->link('product/components', 'ocf=' . $filter_val, true);  // OCFilter
} else {
    continue;                       // порожній — пропускаємо
}
```

**Навіщо:** Підтримка прямих посилань (абсолютних або SEO-URL) як пунктів підменю компонентів — без прив'язки до OCFilter фільтра.

---

## Важливі константи / конфіги

| Ключ | Опис |
|---|---|
| `config_language_id` | ID поточної мови |
| `config_all_products_icon` | Іконка "Всі товари" у підменю |
| `config_components_filter` | ID OCFilter-фільтра для сторінки компонентів |
| `module_components_menu` | Конфіг пункту меню "Компоненти" |
| `module_components_items` | Масив підпунктів меню компонентів |
| `module_components_status` | Статус модуля компонентів |
