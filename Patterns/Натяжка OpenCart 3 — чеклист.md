# Натяжка OpenCart 3 — чеклист

Повний хід порту верстки на OC 3.0.3.x (відпрацьовано на hydrophob.net, звірено з shokeru). Джерело верстки — окрема гілка (`main`) або статичний макет.

## 0. Фундамент
- [ ] Ванільний OC 3.0.3.9 комітом-базою; тема `<project>` копією default.
- [ ] Адмінку перейменувати (`git mv admin <xx>_panel` + config.php обидва + nginx deny-regex).
- [ ] Локальний vhost на окремому порту (root = тека проекту) — інакше `.htaccess RewriteBase /` не працює і ЧПУ локально мертві.
- [ ] `.gitignore` одразу: config.php, обидва config, system/storage/*, image/cache, materials/, handoff.md, .vscode/ (там sftp.json з паролями!).
- [ ] `handoff.md` завести з першого дня.

## 1. Тема: глобальні частини
- [ ] CSS/JS верстки → `catalog/view/theme/<t>/stylesheet|javascript`; підключення в header.twig/footer.twig; Swiper CDN.
- [ ] header/footer twig 1:1; лінки через контролерні `$data` + `url->link` (НЕ хардкод `index.php?route=`).
- [ ] Партіали = окремі контролери (`{% include %}` НЕ працює — ArrayLoader).

## 2. Мови/валюта
- [ ] `git mv catalog/language/en-gb uk-ua` + свіжий en-gb з ванілі; глобальний файл ПЕРЕЙМЕНУВАТИ `uk-ua/uk-ua.php` (bootstrap шукає `<code>.php` — інакше «600decimal_point00 грн»).
- [ ] `$_['code']` в глобальних файлах = uk/ru/en (не всі 'en').
- [ ] oc_language: uk(1) дефолт, ru(3) активна, en вимкнена; **на прод рядок ru не забути** (перемикач мовчки відкочується).
- [ ] Перемикач: POST `common/language/language` (code+redirect).
- [ ] Переклад: [[content-translator]] (129 файлів + контент БД).
- [ ] Кеш `cache.catalog.language.*` чистити після будь-яких змін мов.
- [ ] Адмінка укр: merge community-паку поверх ванільного кейсету (ключ відсутній → лишається англійський текст, не сирий ключ).

## 3. Каталог
- [ ] Дані: [[db-content-loader]] (категорії, привʼязки, структуровані описи).
- [ ] Модель: `filter_category_ids` (IN-підзапит), `getPriceBounds()`, `getCategoryFilterCounts()`.
- [ ] Shop/home: тулбар (сорт/ціна/пошук), сайдбар фільтрів з каунтами, чіпси, hp-пагінація (НЕ стоковий render()).
- [ ] Живий пошук: `product/search_suggest` JSON + сторінка search.
- [ ] `getProducts()` не віддає reviews-count — per-item `getProduct()` або ModelCatalogReview.

## 4. Сторінки як модулі
- [ ] Кожна контент-сторінка (про виробника, дилери…): route-контролер + модулі через Design→Layout — [[layout-porter]].
- [ ] `module_<code>_status=1` в oc_setting — без цього content_top не вантажить.
- [ ] Права на кастомні маршрути: guarded JSON_ARRAY_APPEND (див. [[common-bugs|Пастки OC3]]).

## 5. СЕО
- [ ] `config_seo_url=1`; nginx `location @seo_url` (прод) / .htaccess (локал, НЕ лити на прод).
- [ ] Слаги: [[seo-filler]]; **дубль на кожну мову**.
- [ ] Хук route-слагів у `startup/seo_url.php` (parse + rewrite) + common/home → `/` + 301-канонікалізація `index.php?route=` (safe-list!).
- [ ] Фільтри/сорт/пагінація в path: `/katalog/<cat-slug>/sort-x/page-N` (плейсхолдер `{page}` пропускати в path).

## 6. E-commerce
- [ ] Платежі: лишити cod/bank_transfer/free_checkout, решту видалити (файли; oc_extension звірити).
- [ ] Доставки: flat + кастомний `delivery` (НП/УП/Meest/курʼєр/самовивіз getQuote).
- [ ] Checkout односторінковий: оркестрація стокових ендпоінтів (guest/save з `shipping_address=1` → GET shipping_method (!) → save → GET payment_method → save → GET confirm → payment/<code>/confirm).
- [ ] Кошик: hp-qty степер на стокових cart.update/remove; без попапів — тільки бейдж.
- [ ] Кнопка товару: стан «Додано в кошик» → клік відкриває кошик.

## 7. Акаунт/форми
- [ ] login/register/account — hp-auth/hp-account верстка; account-слаги.
- [ ] OTP-реєстрація: `common/user_popup` sendCode/verifyCode + двокрокова форма (порт shokeru).
- [ ] Контакт-форма: AJAX send + hp-modal успіху.

## 8. Адмінка QoL
- [ ] Логотип/фавікон у config_logo/config_icon (+підміна в шапці адмінки).
- [ ] Файлменеджер: svg+відео у whitelist + SVG-санітизація.
- [ ] Кнопка «⚡ Кеш» (кеш/модифікатори, повернення на поточну сторінку).
- [ ] Marketplace з меню геть; зайві модулі-розширення видалити.

## 9. Деплой (щоразу!)
- [ ] `rsync -az --relative --files-from=` → chown site-user → `rm -f system/storage/cache/cache.*`.
- [ ] SQL на прод: scp + mysql з креденшелами з серверного config.php; файл видалити.
- [ ] Тест курлом живих URL після КОЖНОГО батча (користувач дивиться прод).
- [ ] Коміт після кожного логічного шматка; handoff.md наприкінці етапу.
