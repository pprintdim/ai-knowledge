> [!note] Імпортовано з `/Applications/MAMP/htdocs/hydrophob.net/OPENCART_PORT.md` 2026-08-07 (DOCS-POLICY). Санітизовано секретів: 0. Оригінал: untracked, видалений.

# Мапінг hydrophob.net → OpenCart 3

Знімок стану на момент підготовки (сектональна PHP-версія, `main` branch). Ціль
документа — дати прямий "рецепт" перенесення кожного файлу/масиву даних у
відповідний controller/model/view OC3, без повторного продумування
архітектури під час самого порту.

## Що вже зроблено для полегшення порту

- **`model/`** — дані винесені в `model/catalog/product.php`,
  `model/catalog/review.php`, `model/content/blog.php`,
  `model/content/legal.php`, названі й згруповані так само, як їх
  розташує OC3 (`catalog/model/catalog/*.php`, `catalog/model/content/*.php`)
  — при порту це просто копіювання файлів у відповідні OC3-директорії з
  заміною тіла функцій на SQL-запити (сигнатури/ключі масивів вже збігаються
  з колонками OC3).
- **`helper/general.php`** — view-хелпери (asset, icon, stars, product card,
  strings), не БД-дані. У OC3 частина ляже в `system/helper/`, частина — у
  twig-шаблони напряму.
- **Ключі масивів у `data/products.json` і `data/reviews.json` перейменовані
  1:1 під колонки `oc_product` / `oc_review`** (див. таблиці нижче) — це
  прибирає найбільший ризик порту: мовчазні розбіжності імен полів між
  дата-моделлю і рендером.

## Мапінг даних → таблиці OC3

### `data/products.json` → `oc_product` + `oc_product_description`

| Поле в JSON зараз | Колонка OC3 | Таблиця |
|---|---|---|
| `product_id` | `product_id` | `oc_product` |
| `name` | `name` | `oc_product_description` |
| `excerpt` | — (короткий опис, немає прямого аналога) | зберегти як custom-поле або в `meta_description` |
| `description` | `description` | `oc_product_description` |
| `price` | `price` | `oc_product` |
| `currency_code` | — (в OC3 валюта глобальна/через `oc_currency`, не per-product) | видалити, покластись на конфіг магазину |
| `stock_status` | `stock_status_id` (FK → `oc_stock_status`) | `oc_product` |
| `category` | зв'язок через `oc_product_to_category` → `oc_category_description.name` | `oc_product_to_category` |
| `volume` | option/variant (`oc_product_option_value`) або custom-поле | `oc_product_option*` |
| `image` / `images[]` | `image` (головне) + `oc_product_image` (додаткові) | `oc_product`, `oc_product_image` |
| `characteristics` | `oc_product_attribute` (+ `oc_attribute`, `oc_attribute_group`) | `oc_product_attribute` |

### `data/reviews.json` → `oc_review`

| Поле в JSON зараз | Колонка OC3 |
|---|---|
| `review_id` | `review_id` |
| `product_id` | `product_id` |
| `author` | `author` |
| `text` | `text` |
| `rating` | `rating` |
| `date_added` | `date_added` |
| `date` (форматована для показу) | обчислюється у view з `date_added`, не зберігати окремо |
| `product`, `product_href`, `source_url` | нема колонки в `oc_review` — це похідні поля (join на продукт + власна бізнес-логіка джерела з prom.ua); зберегти як окрему таблицю-розширення або обчислювати в моделі, як зараз |

### `data/warehouses.json` → Nova Poshta / Meest API або `oc_zone`/кастомна таблиця відділень

Зараз — статичний JSON-довідник по містах, віддається через
`warehouse-suggest.php` (JSON-ендпоінт з `?city=&q=` фільтром). В OC3-версії
це або пряма інтеграція з API служб доставки (Нова Пошта Internet Document
API), або власна таблиця `hp_warehouse` (місто, адреса) з такою ж моделлю
пошуку — `warehouse-suggest.php` вже написаний як чистий JSON API, легко
переноситься на `catalog/controller/extension/shipping/*.php` без зміни
контракту (`{items:[...]}`).

### `data/strings.json` → мовні файли OC3

Уже структуровано як `section.key` — вкладені масиви, що напряму
відповідають синтаксису `$this->language->get('section_key')` в OC3.
Порт = розкласти вкладені ключі в `catalog/language/uk-ua/*.php` як
`$_['section_key'] = '...';`.

### `sections/about/mosaic.php`, `blog.php` (hardcoded масив у `model/content/blog.php`)

Блог — не з JSON, а хардкод-масив у коді. В OC3 це або власний модуль
"News/Blog" (немає з коробки — потрібне розширення), або проста таблиця
`hp_blog_post` + `hp_blog_post_description` за зразком `oc_information`.

## Мапінг файлів → OC3 controller/model/view

| Поточний файл (root, роут) | OC3 controller | OC3 model | Twig view |
|---|---|---|---|
| `index.php` | `catalog/controller/common/home.php` | `catalog/model/catalog/product.php` (featured), `model/catalog/review.php` | `common/home.twig` |
| `catalog.php` + `sections/catalog.php` | `catalog/controller/product/category.php` (або `product/search.php`, каталог тут без категорій-URL) | `model/catalog/product.php` | `product/category.twig` |
| `product.php` + `sections/product/*.php` | `catalog/controller/product/product.php` | `model/catalog/product.php`, `model/catalog/review.php` | `product/product.twig` |
| `search.php` + `sections/search/content.php` | `catalog/controller/product/search.php` | `model/catalog/product.php` | `product/search.twig` |
| `search-suggest.php` | `catalog/controller/product/search.php` (ajax-екшн) або окремий `autocomplete` контролер | `model/catalog/product.php` | JSON, без view |
| `reviews.php` + `sections/reviews/content.php` | кастомний контролер (в OC3 з коробки відгуки лише в межах продукту, немає окремої сторінки "всі відгуки") | `model/catalog/review.php` | кастомний twig |
| `cart.php` + `sections/cart/content.php` | `checkout/controller/cart/cart.php` | `checkout/model/cart` | `checkout/cart.twig` |
| `checkout.php` + `sections/checkout/content.php` | `checkout/controller/checkout/checkout.php` (+ shipping extension для відділень) | `checkout/model/checkout/*` | `checkout/checkout.twig` |
| `warehouse-suggest.php` | `catalog/controller/extension/shipping/{novaposhta,ukrposhta,meest}.php` (ajax) | нова кастомна модель або пряма інтеграція API служб | JSON |
| `account.php`, `account-orders.php`, `account-favorites.php`, `account-reviews.php` | `account/controller/account/*.php` | `account/model/account/*.php`, `model/catalog/product.php` (для лінків товарів у замовленнях) | `account/*.twig` |
| `login.php`, `register.php` | `account/controller/account/login.php`, `account/controller/account/register.php` | `account/model/account/customer.php` | `account/login.twig`, `account/register.twig` |
| `blog.php`, `blog-post.php` + `sections/blog/*.php` | немає стандартного аналога — кастомний модуль/розширення | `model/content/blog.php` → таблиці `hp_blog_post*` | кастомний twig |
| `dealer.php` + `sections/dealer/*.php` | кастомна сторінка (форма заявки → `mail()` або `oc_contact`-подібна таблиця) | немає стандартної моделі | кастомний twig |
| `contacts.php` + `sections/contacts/*.php` | `catalog/controller/information/contact.php` | `catalog/model/catalog/information.php` | `information/contact.twig` |
| `about.php` + `sections/about/*.php` | `catalog/controller/information/information.php` (стаття) | `catalog/model/catalog/information.php` | `information/information.twig` |
| `terms.php`, `privacy.php`, `delivery.php`, `returns.php` + `model/content/legal.php` | `catalog/controller/information/information.php` (кожен — окремий `information_id`) | `catalog/model/catalog/information.php` | `information/information.twig` |
| `404.php` | `error/controller/error/not_found.php` | — | `error/not_found.twig` |

## Мапінг view-шарів

- `sections/document-start.php` / `sections/document-end.php` →
  `catalog/view/theme/*/template/common/header.twig` +
  `common/footer.twig` (обгортка сторінки).
- `sections/header.php`, `sections/footer.php`, `sections/logo.php`,
  `sections/lang-switcher.php` → відповідні блоки `common/header.twig`.
- `includes/functions.php::hp_product_card()` (тепер
  `helper/general.php`) → `catalog/view/theme/*/template/product/thumb.twig`
  (partial для картки товару, викликається в циклі з контролера, а не
  функцією PHP).
- `hp_icon()`, `hp_stars()` → inline SVG в twig-partial'ах або
  `system/helper/` функції, підключені як Twig-функції через
  `$this->config`.

## Що НЕ переноситься автоматично (потребує ручної роботи при порту)

1. **Кошик/чекаут** — зараз статичний демо (`data-demo-form`, немає реальної
   сесії кошика чи оплати). У OC3 це `checkout/model/cart` + реальні
   payment/shipping extensions — писати з нуля, а не порт.
2. **Акаунт/замовлення** — `account-orders.php` зараз має хардкод-масив
   замовлень для демонстрації UI. У OC3 — реальні `oc_order`/`oc_order_product`
   з customer_id з сесії.
3. **Форма "Залишити відгук"** — зараз ніде не зберігає дані (`data-demo-form`).
   OC3: `catalog/model/catalog/product.php::addReview()`.
4. **Warehouse-пошук** — зараз статичний `data/warehouses.json` по 5 містах.
   Реальний порт потребує підключення до Nova Poshta API (або аналогічного)
   для довільного міста/відділення.
5. **Blog** — немає стандартного OC3-модуля, знадобиться або стороннє
   розширення, або власні таблиці + контролер/модель/view з нуля.

## Порядок дій при реальному порті (рекомендований)

1. Підняти чистий OC3 (або форк, якщо вже є тема) з таблицями каталогу.
2. Імпортувати `data/products.json` → `oc_product`/`oc_product_description`
   скриптом (ключі вже збігаються — мапінг тривіальний).
3. Імпортувати `data/reviews.json` → `oc_review` аналогічно.
4. Перенести тему: взяти CSS/JS з `css/`, `js/` без змін логіки (це чистий
   фронтенд, не залежить від PHP-моделі) і розкласти по twig-шаблонах згідно
   таблиці вище.
5. Переписати `model/catalog/product.php` / `model/catalog/review.php` з
   JSON-читання на `$this->db->query(...)` — сигнатури функцій і ключі
   результату лишити як є, щоб view-шар (twig) не довелось міняти повторно.
6. Кошик/чекаут/акаунт — окрема фаза, будувати на стандартних OC3-моделях
   (`checkout/model/*`, `account/model/*`), а не порт поточного демо-коду.
