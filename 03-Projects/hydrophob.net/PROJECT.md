> [!note] Імпортовано з `/Applications/MAMP/htdocs/hydrophob.net/project.md` 2026-08-07 (DOCS-POLICY). Санітизовано секретів: 0. Оригінал: untracked, видалений.

# Hydrophob.net — журнал перенесення з Lovable

## Джерело

- Git branch: `lovable`.
- Головна: `src/routes/index.tsx`.
- Компоненти: `src/components/home/`.
- Desktop CSS: `src/styles/style.css`.
- Responsive CSS: `src/styles/media.css`.
- Ресурси: `src/assets/hero-placeholder.jpg`, `product-placeholder.jpg`, `kit-placeholder.jpg`.
- Public: `robots.txt` із Lovable; favicon замінено на `../hzdrohob-site/img/logo.png` → `img/favicon.png`.
- Logo: `../hzdrohob-site/img/logo.svg` (спільний для header/footer).

## 2026-07-31 — головна

- підтверджено, що готова головна існує у `lovable`;
- перенесено header, hero, about, catalog, recommended і footer у самостійні PHP-секції;
- збережено Lorem Ipsum, placeholder-зображення, 20 позицій каталогу, wide kit-card, 5 рекомендацій, фільтри та пагінацію;
- React state mobile menu замінено невеликим vanilla JS;
- CSS скопійовано з Lovable, додано reset і font variables замість Tailwind base;
- TanStack, React, Tailwind і npm-залежності PHP-версії не потрібні.

## Правило наступних сторінок

Спершу read-only перевіряти сторінку в `lovable`. Переносити тільки наявний дизайн і дані. Якщо сторінки немає — не вигадувати її самостійно, а повідомити користувача.

## 2026-07-31 — About

- знайдено готовий маршрут `src/routes/about.tsx` у Lovable;
- створено `about.php` і 8 окремих секцій у `sections/about/`;
- перенесено intro, mosaic, catalog row, advantages/stats, promo UI, dealer CTA, products row і support CTA;
- додано чотири Lovable-ресурси About;
- спільний hero параметризовано, header підтримує активний пункт і реальні переходи між `index.php`/`about.php`;
- спільний CSS оновлено до Lovable commit `3779e1f`.
- головну й About задеплоєно на `https://hydrophob.net/`; обидва маршрути та всі перевірені ресурси повертають HTTP 200.

## 2026-08-01 — reviews.json замість CSV, лінки на товар і prom.ua

- `materials/reviews-prom.csv` конвертовано в `materials/reviews.json` (113 записів, нормалізовані поля `id/author/date/rating/product/product_id/product_url/text`) і видалено — структуровані дані ближче до того, як це виглядатиме в OpenCart 3 (`oc_review`: product_id, author, text, rating, date_added).
- Кожен відгук тепер має: назву товару як лінк на `/product?id=<product_id>` (якщо товар є серед 89 у каталозі — 131/132 співпадають), і окреме посилання "prom.ua" на оригінальний відгук на `product_url` (target=_blank).
- `.gitignore`: виняток замінено з `!materials/reviews-prom.csv` на `!materials/reviews.json`.

## 2026-08-01 — реальний опис з абзацами/підзаголовками/списками замість суцільного тексту

- `description_materials` (довгий текст з CSV, раніше не використовувався) розбирається новою `hp_parse_description_blocks()` в `includes/products.php` на параграфи/підзаголовки/списки за евристикою на голих переносах рядків: короткий рядок без крапки в кінці — підзаголовок; рядок, що закінчується на ":" — вступ до списку; наступні рядки з ";" (і фінальний з ".") — пункти списку; перший рядок пропускається, якщо збігається (повністю чи частково) з назвою товару; будь-який голий URL (посилання на text.ru/antiplagiat) прибирається.
- `materials/products.json` отримав поле `descriptionLong` для кожного товару.
- Таб «Опис» на `/product` тепер рендерить реальну структуру замість одного суцільного `<p>`.

## 2026-08-01 — реальні характеристики товарів з prom.ua, /product тепер справжні таби

- Перевірив реальну структуру сторінки товару на prom.ua (headless-рендер): там рівно 3 таби — «Опис», «Характеристики» (таблиця атрибутів: Виробник/Стан/Призначення тощо, згруповані), «Інформація для замовлення». Інструкції як типу контенту там немає взагалі.
- `/product`: таб «Інструкція» прибрано остаточно (нема що туди класти — підтверджено на джерелі). Таби тепер справді перемикаються (окремі `data-product-panel`, JS у `home.js` ховає/показує), а не один спільний панель як раніше.
- Скрапнув характеристики всіх 89 товарів headless Chrome (з watchdog-таймаутом на кожен запит, бо `--dump-dom` іноді зависає довше virtual-time-budget) — 86/89 успішно, 3 без даних (1 сторінка на prom.ua реально недоступна/висить навіть через curl, 1 товар без характеристик по факту, 1 не вдалось стабільно достукатись) — для них показується fallback (категорія/об'єм/ціна).
- `materials/products.csv` отримав нову колонку `characteristics` (JSON per рядок). Створено `materials/products.json` — повний структурований експорт (id/title/category/volume/price/currency/availability/description/characteristics), тепер це основне джерело для `includes/products.php::hp_products_all()` (CSV лишається як редагована сировина, JSON — рантайм-джерело, той самий підхід, що й з відгуками).
- `.gitignore`: додано виняток `!materials/products.json`.
- Нова `hp_product_characteristics($id)` в `includes/products.php`.

## 2026-08-01 — реальні відгуки + пагінація, робочий промо-плеєр з локальним відео

- `/reviews` тепер на реальних даних з `materials/reviews-prom.csv` (132 відгуки з prom.ua, 19 без тексту відфільтровано → 113 реальних), сортування за датою (нові згори), пагінація 12/сторінку (`HP_REVIEWS_PER_PAGE`) через `?page=N#reviews`. Поле "місто" прибрано з картки — його немає в реальних даних (було тільки в Lovable-заглушці).
- `.gitignore`: додано виняток `!materials/reviews-prom.csv` (за тим самим патерном, що і products.csv) — інакше на проді відгуки були б порожні.
- Синхронізовано ще одну зміну з lovable (`3d01656` → `13c4714`, "Протестував промо-відео"): плеєр "Промо" тепер грає РЕАЛЬНЕ локальне відео (`img/promo-placeholder.mp4`/`.webm`, з fallback між форматами) замість зовнішнього Google sample URL; таймер показує час "що лишився" (`-MM:SS`); з'явився видимий стан помилки відео (`data-video-error`). Виніс спільну розмітку плеєра в `sections/promo-video.php`, обидва місця (About, Product) тепер її перевикористовують — на Product-сторінці "Промо" теж стало робочим плеєром (раніше був старий статичний макет).

## 2026-07-31 — Блог, Відгуки, юридичні сторінки (Lovable `3a1e8f9` → `3d01656`)

- Нові сторінки з Lovable: `/reviews` (відгуки з рейтингом і формою), `/blog` (список статей, featured + сітка), `/blog/<slug>` (6 статей), `/privacy`, `/terms`, `/delivery`, `/returns` (спільний шаблон юридичних сторінок із сайдбар-навігацією).
- Дані: `includes/content.php` (REVIEWS + POSTS, мірор `src/lib/content.ts`), `includes/legal.php` (LEGAL_DOCS, мірор `src/lib/legal.ts`).
- Шаблони: `sections/reviews/content.php`, `sections/blog/index-content.php`, `sections/blog/post-content.php`, `sections/legal/page.php`.
- Нова іконка `star` + хелпер `hp_stars()` в `includes/functions.php`.
- Header/footer оновлені: додано пункти «Блог»/«Відгуки» в навігацію, footer отримав блок юридичних лінків.
- Нові ресурси: `img/blog-cover-1.jpg`, `img/blog-cover-2.jpg`. Решта постів перевикористовують наявні фото (about-car, about-nano, hero-placeholder, contacts-water).
- КРИТИЧНИЙ БАГ, знайдений і виправлений: фізична директорія `blog/` конфліктувала з чистим URL `/blog` — Apache/nginx спершу матчили directory `$uri/`, віддаючи 301→403 замість `blog.php`. Рішення: прибрано директорію, `/blog/<slug>` тепер явне rewrite-правило `^blog/([a-z0-9-]+)/?$` → `blog-post.php?slug=$1` (і локально в `.htaccess`, і на проді в nginx `@clean_urls`), доданий ПЕРЕД загальним дворівневим правилом. Неіснуючий slug → справжній 404 (`http_response_code(404)` + `noindex`), а не підміна випадковим постом.

## 2026-07-31 — реальні товари в каталозі, checkout-доставка, footer, промо-відео

- Футер: кредит розробника замінено з "projectnine" (Lovable-заглушка) на pprintdim.com.
- Синхронізовано ще одну зміну з lovable (`bc10340` → `3a1e8f9`): About "Промо" тепер справжній HTML5-відеоплеєр (play/pause, перемотка ±10с, seek-бар, час, звук, повний екран) замість статичного макета — `sections/about/promo-video.php`, додано іконки `maximize`/`volume-2`/`volume-x` в `hp_icon()`.
- Каталог на головній (`sections/catalog.php`) тепер працює на реальних даних: `includes/products.php` парсить `materials/products.csv` (89 товарів, 9 категорій, ціни 25–3750 грн, локальні фото з `img/products/<id>/main.webp`), 20/сторінку, робочі фільтри за категорією (з лічильниками), ціною (min/max) і пошуком за назвою — все через GET-параметри на `/`, без JS-залежності (JS лише auto-submit на чекбоксах/сортуванні для зручності). `hp_product_card()` вміє рендерити і реальний товар, і старий placeholder.
  - ВАЖЛИВО: усі картки товару (реальні й ні) досі ведуть на єдину демо-сторінку `/product` — окремих сторінок під кожен із 89 товарів не робили (не просили, це окрема велика задача).
  - `sections/search/content.php`, `sections/recommended.php` та інші місця з `hp_product_card()` НЕ чіпали — там лишився Lorem Ipsum placeholder, як і було.
- Checkout (`sections/checkout/content.php`): 5 способів доставки (Нова Пошта, Укрпошта, Meest, Кур'єр, Самовивіз) з окремими полями під кожен (місто + відділення/поштомат для перевізників; вулиця/будинок/квартира/коментар для кур'єра; статичний блок адреси для самовивозу), перемикаються JS на основі радіо `name="shipping_method"`. Функціонал — UI-рівня (без реального API Нової Пошти чи каскадних міста→відділення списків), як і узгоджено.
  - Поля названо за конвенціями OpenCart 3 checkout (коментар у файлі): `shipping_method` у форматі `extension.method` (`novaposhta.novaposhta` тощо), `shipping_<extension>_city`/`_warehouse`, стандартні `city`/`address_1`/`address_2`/`comment` для кур'єра, `payment_method` зі значеннями `card`/`cod`.
  - Телефон: підключено `intl-tel-input@23` через CDN (jsdelivr) — повний міжнародний селект країни (прапор+код) з автоматичною маскою/валідацією номера, дефолтна країна — Україна.
- ВАЖЛИВО: 5 нових/змінених продакшн-залежностей CDN — `intl-tel-input` CSS+JS (build через jsdelivr), додано в `sections/document-start.php`/`document-end.php` за тим самим патерном, що вже є для Swiper і Google Fonts.

## 2026-07-31 — синхронізація з Lovable `2ea0d65` → `bc10340`

- перелінковка: хедер (дзвінок на реальний `tel:`, кошик і Логотип як справжні лінки), футер (Каталог → `/search`, соцмережі → реальні Instagram/Telegram, автор → projectnine.com.ua), головна/about CTA-кнопки (`/about`, `/dealer`, `/contacts`), картки товару (`hp_product_card()` тепер `<a href="/product">`), checkout ("Сплатити" → лінк на `/order/success`, breadcrumb "Оформлення");
- новий спільний `sections/lang-switcher.php` (перемикач мов, чисто візуальний JS-toggle, як у Lovable — без реального i18n);
- about-мозаїка: плитки стали клікабельними (`hp-tile--action`), відкривають повноекранний попап `hp-tilepop` з тим самим текстом, що в Lovable;
- нові сторінки `/order/success` і `/order/fail` (`order/success.php`, `order/fail.php`, `sections/order/status.php`, ресурс `img/status-bg.jpg`), `noindex` через новий `$pageNoindex` прапорець у `document-start.php`;
- фавікон у Lovable **не змінювався** (перевірено побайтово, `2ea0d65` і `bc10340` ідентичні) — сайт продовжує використовувати власний `img/favicon.png`/`img/logo.svg` з `../hzdrohob-site`, як і раніше;
- побічний фікс: `hp_asset()` повертав відносні шляхи (`img/...`, `css/...`) — працювало випадково для однорівневих `/about` тощо, але ламало щойно додані вкладені `/order/success`. Тепер повертає абсолютні (`/img/...`).
- побічний фікс: `.hp-card` (стала `<a>`) успадковувала синій колір/підкреслення посилання — додано `color: inherit; text-decoration: none`.
- локальний `.htaccess` і серверний nginx (`@clean_urls`) розширені під дворівневі чисті URL (`order/success`).

## 2026-07-31 — усі готові маршрути Lovable

- джерело оновлено до `lovable` commit `2ea0d65`;
- додано PHP-сторінки `/dealer`, `/contacts`, `/product`, `/search`, `/cart`, `/checkout`;
- кожну сторінку розбито на секції у відповідній теці `sections/`;
- перенесено актуальні стилі та ресурси `dealer-hero.jpg`, `contacts-water.jpg`;
- реалізовано Swiper 11 для рекомендованих товарів, галереї продукту та showcase-слайдера;
- додано інтерактивність меню, вкладок продукту, кошика, radio-полів і дилерської modal-форми без React runtime;
- справжні logo/favicon повторно взято з `../hzdrohob-site`, Lovable favicon не використовується.
