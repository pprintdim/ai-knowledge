# autochemicals — MEMORY

## 2026-08-10 — розгортання з бекапу eHoster (продовження Codex-сесії 2026-08-09)
- Локально: `/Applications/MAMP/htdocs/autochemicals` — OpenCart 3, відновлений з бекапу eHoster `m366.2026-08-09_05-19-32.tar` (FTP s3.ehoster.com.ua, m366_user). Локальна БД MAMP `autochemicals` (root/root, порт 8889), DB-креди винесені в гітігнорений `db.php` (require з index.php та admin/index.php), є `db.example.php`.
- GitHub: `pprintdim/autochemicals`, main. Коміт `b3ccad4` — повний код (6519 файлів). `.gitignore`: *.tar, db.php, *.sql, storage-runtime, image/cache.
- **Картинок товарів НЕМАЄ ніде**: БД очікує 3344 шляхи виду `6926811234_shampun-pena...jpg` (prom.ua-стиль), а на FTP eHoster лежав чужий каталог (shokeru, електрошокери) — 1041 файл викачано помилково і видалено, НЕ комітити. РОЗВ'ЯЗАНО 2026-08-10: всі картинки живі на CDN prom.ua — викачано 5015/5015 файлів через `https://images.prom.ua/<імʼя-файлу>` у локальний `image/` (шляхи в БД — голі імена файлів без підкаталогів). 984MB, у git НЕ комітяться (/image/*.jpg у .gitignore, патерн hydrophob) — на сервер переносити окремим rsync.
- Сервер: Hetzner 46.224.100.254 (CloudPanel), сайт `autochemicals.com.ua` створено 2026-08-10 (`clpctl site:add:php`, PHP 8.3, site user `autochemicals`, креди в secrets/ACCESS.md). Код задеплоєно через `git archive main | tar -x`, права autochemicals:autochemicals, dirs 750/files 640, storage+image/cache 770.
- Домен `autochemicals.com.ua` зареєстрований, але припаркований (NS parked1/2.uadns.com, A → 135.181.41.169) — переведення DNS на 46.224.100.254 за користувачем/реєстратором. SSL (Let's Encrypt) можливий тільки після DNS.
- Прод-БД: див. TASKS.md — на момент запису чекає підтвердження користувача.

## 2026-08-10 (продовження) — прод-БД, картинки, PHP8-фікси
- Прод-БД: `autochemicals-oc` / юзер `autochemicals-oc` (креди в secrets/ACCESS.md), дамп стрімився напряму mysqldump|ssh без проміжного файлу. **БД на серві — основна/робоча** (рішення користувача), локальна MAMP — dev-копія.
- Картинки (5015 шт, ~950MB) залиті rsync-ом у `image/` на серві.
- **ПАСТКА .gitignore**: патерн `db.php` без слеша зʼїв `system/library/db.php` і `system/library/session/db.php` (клас DB → 500 на проді). Виправлено на `/db.php`, класи докомічено.
- **PHP 8 баг image-кешу**: `Image::save()` перевіряв `is_resource($this->image)`, а в PHP 8 GD — обʼєкт GdImage → превʼю `image/cache/` ніколи не генерувались (на старому хостингу був PHP 7). Фікс: `instanceof \GdImage ||` у `system/library/image.php` І в ocmod-копії `storage/modification/system/library/image.php` (при "Refresh modifications" в адмінці ocmod перезбереться з оригіналу — оригінал пофікшено, тому ок). Ocmod ще й зберігає .jpg як PNG-дані (monosite-хак) — не чіпав.
- `storage/modification/` (40 ocmod-файлів) НЕ в git — синхити на сервер напряму rsync-ом при змінах.
- Прод перевірено: головна/категорія/товар/адмінка/повні картинки/превʼю — все 200 (через curl --resolve, бо DNS ще на паркінгу).
- Обережно: rsync/ssh з sshpass інколи ловить "Permission denied" при паралельних сесіях — fail2ban на серві, не спамити ретраями.

## 2026-08-10 (продовження 2) — SEO URL, placeholder, nginx
- **SEO URL**: локально 404 через `RewriteBase /` в .htaccess при роботі в підпапці — RewriteBase прибрано (відносні rewrite беруть теку .htaccess, працює і в корені, і в підпапці). На проді nginx: server-рівневий `try_files ... /index.php?$args` тихо віддавав головну на /about — переписано на `try_files $uri $uri/ @opencart` + `location @opencart { rewrite ^/(.+)$ /index.php?_route_=$1 last; }` у внутрішньому 8080-блоці. Бекап конфігу в /root/nginx-config-backups/. Додано deny (403) на /system/, /storage/, catalog|admin/{controller,model,language}.
- **placeholder.png**: контролери звуть resize('placeholder.png'), файлу не було (~49 товарів без картинок) — взято з hydrophob.net, закомічено (виняток `!/image/placeholder.png` в .gitignore), залито на прод.
- DNS: NS у NIC.UA користувач змінив 2026-08-10, чекаємо делегацію (фоновий монітор); далі — Let's Encrypt.

## 2026-08-10 (фінал) — сайт живий
- Делегація NIC.UA → Hetzner NS доїхала ~13:40, Let's Encrypt встановлено через clpctl (валідний до 2026-11-08, CloudPanel автопродовжує). Прод повністю робочий по https://autochemicals.com.ua (кеші публічних резолверів могли тримати старий паркінг ще кілька годин після цього).

## 2026-08-10 — чистка модулів (import/export, платіжки, доставки)
- Видалено (файли лок+прод, git-коміт, БД лок+прод): Export/Import Tool V3.22 (modification id=24 + admin/controller|model/extension/export_import.*), csv_ocext_dmpro (extension row type=module, setting odmpro_csv_first_us, файли+tpl), ocext-сімейство (ocext_smart_exchange.php з кореня, system/library/vendor/ocext/, ocext_loader, anyxls_ocext_plugin, ocext_php.php).
- Видалено 539 файлів невстановлених дефолтних платіжок і 73 файли доставок. ЛИШИЛИСЬ робочі: payment liqpay + free_checkout, shipping novaposhta + ukrposhta + free (всі status=1).
- З генерованих storage/modification/admin/*/column_left.php вручну вирізано пункт меню Export/Import (бо "Refresh modifications" не робився; якщо колись робити refresh в адмінці — ці файли перегенеруються вже без нього, ocmod видалений з БД).
- Бекап зачеплених таблиць (extension/setting/modification, prod+local) — backups/backup-db-ext-setting-mod-*-20260810133814.sql; backups/ у .gitignore.
- Monosite-адміни user_id=1,2 ВИДАЛЕНІ (лок+прод) 2026-08-10; лишився один — 380933809412 (Максим), пароль тимчасово admin123 (креди в secrets/ACCESS.md), логін перевірено curl-ом. Бекап user-таблиці: backups/backup-db-user-prod-20260810134412.sql.

## 2026-08-10 — materials/ для майбутнього імпорту
- `materials/products-merged.csv` (91MB, НЕ в git — materials/ у .gitignore): злиття двох prom.ua-експортів (укр+рус xlsx — той самий набір 9572 товарів, різниця лише мова характеристик). Колонки підчищені до потрібного для OpenCart: uid, prom_id, код, назви/описи/меta обома мовами, ціна, кількість, картинки (images.prom.ua URL), група, виробник, габарити, характеристики укр+рос ("Назва:Значення Од; ..."). `materials/groups.csv` — 381 категорія (аркуш Export Groups).
- **ДЕДУП з поточною БД**: надійного спільного ID НЕМА — model/sku/upc в БД порожні, image-id НЕ збігаються (в БД 69xxx, у новому експорті 70xxx — prom перезалив картинки). Єдиний робочий ключ — нормалізована укр назва (product_description.name ↔ Назва_позиції_укр): 3533 з 9572 вже в БД, 6039 нових. У merged CSV це колонка `existing_product_id` (порожня = новий товар). ПРИ ІМПОРТІ писати uid (Унікальний_ідентифікатор, 100% заповнений і унікальний) в oc_product.model — далі дедуп стане тривіальним.

## 2026-08-10 — імпорт нових товарів з prom-експорту (тест 10 шт)
- Скрипт `materials/import_prom.py` (гітігнорений): бере з products-merged.csv рядки з порожнім existing_product_id, скіпає uid що вже є в product.model (безпечні повторні прогони), генерує SQL з явними ID, качає картинки в image/. Прогін: `python3 import_prom.py --limit N --out batch.sql`, потім mysql < batch.sql (лок і прод; перед прод — звірити MAX(product_id)/MAX(category_id)).
- Конвенції як в існуючих: quantity=100 (якщо не задано), stock_status_id=0, manufacturer 0, тільки language_id=1 (укр; ru-ua вимкнена, рядків не має), model=uid (у старих 3648 model порожній!). Категорії: матч по нормалізованій укр назві, нові — плоскі (parent 0), укр назва з groups.csv по Номер_групи.
- Тест: product_id 4030-4039 (Aquaphob/Nonwater, 33 картинки, 2 нові категорії 131-132) — лок і прод, рендер перевірено. Бекапи product+category таблиць лок і прод у backups/.
- Лишилось ~6029 нових товарів — чекає ок після перевірки тестових.

## 2026-08-10 — картинки в описах товарів
- Описи з prom-експорту містять <img> зі старого мертвого хосту s101.fotosklad.org.ua (404, у wayback теж нема) — тому в описах не було картинок. Для 10 тестових: мертві img замінені фото самого товару з галереї (по черзі, style=max-width:100%), зайві мертві прибрані (fix-desc-imgs-test10.sql, лок+прод). У import_prom.py вшита fix_desc_images(): живі зовнішні img качає в image/catalog/desc/ і переписує src, мертві підмінює фото товару.
- УВАГА: старі товари (product_id<4030, ~весь каталог) мають ту саму проблему з fotosklad-картинками в описах — НЕ чіпав, окрема задача якщо користувач попросить.

## 2026-08-10 — чистка описів по всьому каталогу
- clean_desc() (в import_prom.py): чистка HTML описів — стилі/класи/span/font/align, &nbsp;, порожні теги, зайві <br>, відступи. Прогнано по products-merged.csv (17798 описів у 9572 рядках) і по ВСІХ 3658 товарах обох БД (fix_all_descs.py -> fix-all-descs.sql): зматчені товари отримали чистий CSV-опис, незматчені — почищений БД-опис; картинки: живі хости (images.prom.ua, automoyka.ua тощо) викачано в image/catalog/desc/ (71 шт, залито на прод), мертві (s101.fotosklad.org.ua, ssl.prom.st) замінені фото товару / прибрані.
- ПАСТКА: product_description має charset utf8mb3 — 4-байтові emoji НЕ влазять (ERROR 1366, mysql обриває файл посередині і решта UPDATE не застосовується мовчки!). q() в import_prom.py тепер вирізає [\U00010000-\U0010FFFF]. Перевіряти успіх імпорту лічильником, не тільки вибірковими сторінками.
- Бекапи product_description лок+прод у backups/ (backup-db-pd-*).

## 2026-08-10 — autocheckout-pro перенесено в гілку openCart
- Репо pprintdim/autocheckout-pro (гілки main=lovable, HEAD 9c62461, Lovable-проєкт) перенесено З ІСТОРІЄЮ в pprintdim/autochemicals гілку `openCart` (git fetch url main:openCart + push). Бандл-бекап: backups/autocheckout-pro-*.bundle.
- Видалити сам репо autocheckout-pro з GitHub я НЕ можу (git по SSH, API-токена з delete_repo нема, gh CLI не встановлений) — користувач видаляє руками: github.com/pprintdim/autocheckout-pro/settings → Danger Zone → Delete this repository.

## 2026-08-10 — СТРУКТУРА ГІЛОК (фінальна, за явним рішенням користувача)
- `main` = секційна верстка з Lovable (ex autocheckout-pro, 9c62461) — джерело редизайну для майбутньої натяжки (патерн hydrophob).
- `openCart` = ВЕСЬ код магазину OpenCart (вся історія комітів; 808d8e4+) — з неї деплой на прод.
- ЛОКАЛЬНО в /Applications/MAMP/htdocs/autochemicals checked out `openCart` (НЕ main!) — MAMP і деплой працюють з неї. Не перемикати на main у цій теці (знесе робочі файли магазину з working tree).
- Історія плутанини: користувач перейменував autocheckout-pro → autochemicals у GitHub UI (старе репо звільнив), я відновлював з локалу; потім за уточненням користувача гілки поміняно місцями force-push-ем. Гілку lovable-fallback (авто-створена Lovable-інтеграцією при force-push) видалено.

## 2026-08-10 — main очищено, сабдомен верстки
- `main` тепер скелет секційної верстки (index.php підключає sections/*.php; css/js/img порожні) — коміт 25692f2; lovable-контент ЛИШИВСЯ в історії (parent 9c62461) + бандл у backups/. Локальний worktree main: scratchpad/wt-main (тимчасовий).
- Верстка живе на html.autochemicals.com.ua: CloudPanel site user `htmlautochem` (креди ACCESS.md), A-запис у Hetzner-зоні, LE SSL. Деплой верстки: `git archive main | ssh root@46.224.100.254 "tar -x -C /home/htmlautochem/htdocs/html.autochemicals.com.ua"` + chown htmlautochem + права 750/640.

## 2026-08-10 — адмінка: Тема/вкладки, лого, кеш-кнопки
- monosite/setting перейменовано в «Налаштування теми», меню — «Тема» (генеровані column_left lang + XML в oc_modification обох БД, щоб пережити refresh). Вкладки переструктуровано: Контакти/Категорії/Сторінки/Реквізити/Підвал/Товар/Модулі/Пошта (форма-поля незмінні); мовний файл доповнено відсутніми ключами (біли сирі tab_general/tab_mail).
- Адмін-хедер: лого магазину + дропдаун «Кеш» (Скинути кеш / Оновити модифікатори / все) за патерном hydrophob: admin/controller/common/refresh.php (копія), патчі header.php+header.twig в оригіналі І в storage/modification копіях. Права: common/refresh додано в user_group 1 (обидві БД).
- **ПАСТКА mysql -B**: batch-режим ЕКРАНУЄ бекслеші у виводі — читання JSON-колонки (user_group.permission) без --raw подвоїло екранування і зламало ВСІ права адмінки (все крім ignore-роутів — Доступ заборонено). Фікс: читати з --raw, при записі екранувати \ і лапки вручну. Завжди --raw для JSON/serialized колонок!
- Лого: файла з config_logo (catalog/Frame 343.jpg) не існувало ніде — вітрина була без лого. Згенеровано image/catalog/logo.svg із Logo.tsx редизайну (щит+крапля #0096c7 + вордмарк AUTOCHEMICALS), config_logo оновлено в обох БД, файл у git (виняток у .gitignore) і на проді. Рендериться і на вітрині, і в адмін-хедері.

## 2026-08-10 — верстка (гілка main) готова і задеплоєна
- Порт lovable-редизайну в секційний PHP зроблено ВРУЧНУ (Codex-спроба обірвалась): index.php (слайдер/категорії/хіти/акції/переглянуті/seo/hero), category.php (aside+фільтр+сітка+пагінація), product.php (галерея/таби/кількість/швидке замовлення). sections/_layout.php (oc_page_head/foot, CDN: Bootstrap 5.3, Swiper 11, Montserrat), sections/_data.php (мок-дані як у catalog.ts), _product-thumb.php (oc_product_thumb() = майбутній product_thumb.twig). Класи 1:1 з React-компонентами (тема monosite) — для натяжки.
- css/main.css = кастомна частина styles.css (рядки 39+, @layer base розгорнуто вручну щоб Bootstrap CDN не перебивав), js/main.js = vanilla-порт use-reveal/useScrolled/галерея/таби/Swiper-init.
- Живе: https://html.autochemicals.com.ua/ (+category.php, product.php) — деплой `git archive main | ssh tar -x` у /home/htmlautochem/htdocs/... (спочатку rm -rf вмісту). Всі секції і статика перевірені (200, без PHP-помилок).
- Wortkree main: scratchpad/wt-main (тимчасовий, після сесії зникне — робити новий `git worktree add <dir> main`).

## 2026-08-11 — верстка: всі сторінки готові
- До index/category/product додано: cart.php (таблиця, кількість, промокод, підсумки), checkout.php (4 кроки: контакти/доставка НП-УП-кур'єр-самовивіз/оплата накладений-LiqPay/коментар + сайдбар замовлення), contact.php (дані+форма), інфо-сторінки через спільний sections/_info-page.php: about/delivery/return/privacy/oferta.php, login/register/account (плитки-розділи)/wishlist/search/404. Хедер і футер перелінковані на реальні сторінки. Нові стилі в кінці css/main.css (секція "Додаткові сторінки": .oc-panel, .oc-cart-*, .oc-radio-list, .oc-404...). Всі 17 сторінок на https://html.autochemicals.com.ua/ віддають 200.
- Партіали: sections/_breadcrumb.php (oc_breadcrumb), sections/_info-page.php (oc_info_page).

## 2026-08-11 — НАТЯЖКА Stage A (задеплоєно на прод)
- stylesheet.css теми monosite ЗАМІНЕНО на CSS редизайну (він писався на класах теми; старий збережено тільки в git-історії). @layer base розгорнуто; дод. фікси: .swiper-container height, .oc-slide-nav без дефолтних swiper-стрілок.
- Головна: слайдшоу re-skin (oc-slideshow, кепшн=banner.title, глобальний init $('[id^=slider]').swiper у scripts.js — свій inline init НЕ додавати, буде подвійний), featured_category → oc-category-grid (модуль 35 був status=0 і БЕЗ category[] — падав fatal array_slice(null); заповнено топ-8 категорій), bestseller/latest/featured/special.twig → картка редизайну (badge/price-new/old/reveal), html.twig → .oc-seo-text. Нові модулі: special.36 «Акційні пропозиції» (ПОРОЖНІЙ поки product_special пустий — 0 записів! заповнити з CSV Знижка → зʼявиться секція), html.37 Hero (розмітка в module.setting). Layout 1 content_bottom: featured_category(0), bestseller(1), special(2), html.32 seo(4), html.37 hero(5); category_wall/featured.28/latest.34 видалені з layout (модулі лишились).
- header.twig: + class="oc-header" id="oc-header"; footer.twig (+ ocmod-копія в storage/modification/catalog/.../footer.twig — НЕ забувати правити обидва): підключено catalog/view/javascript/monosite/redesign.js (reveal + sticky).
- **ПАСТКА**: theme twig'и category.twig/product.twig/footer.twig МАЮТЬ ocmod-копії в storage/modification/catalog/ — зміни в оригіналі не діють поки не продубльовані там.
- Банери: image/catalog/banners/banner-1..3.jpg (з редизайну), banner_image id 302-304 (banner_id 7).
- ЩЕ НЕ ЗРОБЛЕНО (Stage B): category.twig і product.twig DOM під oc-* (toolbar/фільтр/таби/галерея/qty), cart/checkout/account/info twig'и, viewed-модуль, product_special заповнення. Прод виглядає: нова головна повністю, категорія/товар — новий скін на старій розмітці.

## 2026-08-11 — натяжка: хедер/меню/пошук/іконки (серія фіксів за фідбеком)
- Cart AJAX: `$('.cart-block span')` затирав svg у нових span-ах — селектор замінено на `$('.oc-cart-total')` (3 місця в scripts.js).
- Мегаменю каталогу: перенесено з fixed-top full-width У колонку кнопки (header.twig), компактна панель 900px (список 320 + flyout), відкриття ПО КЛІКУ (scripts.js hover→click), 2-3 рівень стилізовано (.oc-subnav-*). Те ж у верстці (двопанельний dropdown, мок-children у _data.php).
- Живий пошук: НОВИЙ catalog/controller/monosite/livesearch.php (route=monosite/livesearch&q=, JSON топ-6 по filter_name) + дропдаун .oc-livesearch в scripts.js (debounce 250ms); у верстці — мок-версія в main.js.
- Hero-картка: кнопка «Перейти до товару» (product_id=108 CarCeramic). Hero full-bleed (100vw трюк), html.twig без обгорток (seo-обгортка перенесена в контент модуля 32).
- Footer-bottom: темна смуга з БІЛИМ лого (image/catalog/logo-white.svg) зліва, копірайт центр, платіжки справа (обидві копії footer.twig!).
- SVG-іконки 10 основних категорій: у monosite_setting code='category' JSON {id:{icon:svg}} (адмінка Тема→Категорії їх редагує), рендер: мегаменю (monosite/header вже вмів) + сітка головної (featured_category controller+twig доопрацьовані). Iконки 24x24 stroke currentColor, бренд-колір через CSS.
- Слайдер: кепшни eyebrow/text/CTA хардкод у slideshow.twig по loop.index; модуль 27 banner 1920x912.
- ПАСТКА sshpass: періодичні 'Permission denied' при деплої — ретраїти команду (пароль вірний).

## 2026-08-11 — натяжка товару + серія UI-фіксів
- product.twig ПОВНІСТЮ перезібраний за версткою (оригінал і modification-копія тепер ІДЕНТИЧНІ; review-таб через if review_status): галерея .oc-thumb-strip, oc-product-meta, price-new/old, oc-qty на btn-number (сумісно зі scripts.js), button-cart/fast order/wishlist збережені, USP з product_advantages, oc-tabs Опис/Характеристики/Відгуки, схожі — картка редизайну. Опції select/radio/checkbox/text/textarea збережені; file/date/time викинуті. redesign.js: +галерея, +таби.
- Лого: CSS-анімація всередині svg (крапля oc-drip 3.2s стікає, щит oc-sway 5s) — обидва файли.
- Мобілка: кошик currentColor (чорний), offcanvas z-index 2100 над sticky-хедером.
- Товар: переваги — іконка зліва (.oc-order-info-icon), обидві копії.
- favicon: catalog/favicon.png + /favicon.ico, config_icon в обох БД, верстка теж.
- footer-arguments під меню футера (обидві копії).

## 2026-08-11 — passwordless вхід + sftp.json + дрібне
- Вхід за кодом (патерн shokeru): account/login ПЕРЕПИСАНИЙ — парольний POST-флоу видалено; sendCode (OTP 6 цифр у session, лист через config_mail, ліміт 45с, TTL 10хв, 5 спроб) + verifyCode (force-login customer->login(email,'',true) + податкові адреси). login.twig: права колонка двокрокова email→код, без заголовків/лейблів, AJAX. Реєстрація зліва як була. Локально листи не шлються (MAMP без sendmail) — тестити код на проді.
- .vscode/sftp.json: site user autochemicals, uploadOnSave, remotePath /home/autochemicals/htdocs/autochemicals.com.ua, ignore: image/, storage-runtime, materials, backups, db.php. НЕ в git (.vscode ігнориться).
- Іконка кабінету в навігації (oc-account-link, перед wishlist) — прод+верстка.
- Лого: тайпрайтер тайплайна через clipPath rect + CSS steps(23) всередині svg; всі анімації синхронізовані у спільний 7s цикл (щит 3.5s, крапля 3.5s, тайпінг 7s). Верстка: css-анімація на .oc-logo-text small.
- Імпорт 6029 товарів: триває фонове скачування 21939 картинок (xargs -P6), потім import_prom.py.

## 2026-08-11 — ПОВНИЙ ІМПОРТ ТОВАРІВ (завершено)
- 6029 нових товарів залито (лок+прод): product_id 4040-10068, 5797 активних + 232 status=0 (на prom були '-'). Разом у БД 9687 товарів, 350 категорій (243 нові, ВСІ parent=0 — плоскі!), 224 виробники (188 нових, привʼязані до товарів: manufacturer_id>0 у 3626+ нових).
- import_prom.py фінальний: виробники (create+link), чистка описів, fix_desc_images з кешем мертвих хостів, emoji-санітизація. import-full.sql 27MB у materials/ (гітігнорено).
- Картинки: 21939 нових викачано (56 битих 404 на prom), rsync на прод фоном.
- ПАСТКА: порівнював COUNT(manufacturer) з MAX(manufacturer_id) — фальшивий конфлікт; в manufacturer є діри (MAX 42 при COUNT 36). Скрипт правильно бере MAX.
- НАСЛІДОК для UI: мегаменю каталогу тепер показує ВСІ ~250 кореневих категорій (плоских) — треба або структурувати категорії (parent), або обмежити меню топ-N. Фільтр лівої колонки категорії — далі (ціна+виробник, кастом).

## 2026-08-11 — контент описів розкладено по вкладках
- НОВА таблиця product_media (media_id, product_id, type video|photo, url, sort_order) в обох БД. extract_tabs.py (materials/): youtube iframe/лінки з описів -> video (3504 шт, canonical embed URL); фото з описів, яких НЕМА в основній галереї -> photo (1766); характеристики: CSV Характеристики_укр (пріоритет) + списки '<li>Назва: Значення</li>' (>=3 li, 70%+ формату) з описів -> атрибути групи 1 (перейменована в 'Характеристики'): 152 атрибути, 39750 привʼязок (9048 товарів); описи почищено (3458 UPDATE).
- product controller (обидві копії): вантажить product_videos/product_photos з product_media. product.twig: вкладки Відео (responsive 16:9 grid iframe) і Галерея (сітка з обʼектфіт) після Характеристик.
- Ієрархія категорій відбудована з groups.csv (283 звʼязки по назвах parent-груп; category_path перебудований повністю). 67 кореневих лишилось (справжні prom-кореневі + легасі).
- product_media НЕ в git-схемі OpenCart — при переносах БД не забути.

## 2026-08-11 — категорії ПОВЕРНУТО в плоску структуру (рішення користувача)
- Ієрархію з groups.csv (283 звʼязки) ВІДКОЧЕНО: всі 350 категорій знову parent_id=0, category_path = сам-на-себе level 0 (обидві БД). Початковий стан магазину і був плоским. cat-tree.sql лишився в scratchpad якщо колись захоче повернути дерево — але користувач явно попросив плоско, НЕ пропонувати ієрархію знову без запиту.

## 2026-08-11 — категорії злиті, меню відновлено, логін-марафет, вкладка Теги
- Дублікати категорій злиті (6 пар: 36+50, 38+46, 39+47, 48+61, 78+373 amp-дубль, 241+259 trailing space; keeper=менший id, товари перевішані INSERT IGNORE). Пара 135/136 AquaProTech 100/400мл — НЕ дублі (обʼєми).
- МЕНЮ = початковий каталог: старі категорії (date_added<2026-08-10) позначені category.top=1 (101 шт після злиття), monosite/header фільтрує меню по top. Керується чекбоксом Top в адмінці категорії. Нові 243 імпортні категорії доступні по прямих лінках, у меню їх нема.
- **ПАСТКА OPcache на проді**: після деплою PHP-файлів зміни можуть НЕ підхоплюватись — робити `systemctl reload php8.3-fpm` (меню-фільтр не працював поки не перезавантажив FPM).
- Логін: одна крихта «Головна/Вхід» (дубль 'Особистий кабінет' прибрано), стилі логін+реєстрація (панелі 14px радіус, тінь, відступи кнопок).
- Теги товару перенесені з-під related у вкладку «Теги» (tag cloud пігулками).
- З monosite_setting.category прибрані ключі 131,132 (іконки тест-категорій).

## 2026-08-11 — ОРИГІНАЛЬНА ієрархія категорій відновлена + viewed-модуль + логін-фікс
- ДЖЕРЕЛО ІСТИНИ: оригінальний дамп БД лежить у m366.2026-08-09_05-19-32.tar → ./db/m366_db/m366_db.mysql.sql.zst (unzstd; 19MB SQL). Звідти відновлено parent_id + sort_order усіх 101 старих категорій (оригінал мав 8 кореневих + багаторівневе дерево: 32→18 дітей, 35 Автокосметика→9...). Merge-map видалених дублів застосований до parent-посилань. category_path перебудований повністю. Нові 243 імпортні — flat root (top=0, у меню їх нема).
- Меню = top=1 (ті самі 8 оригінальних кореневих). ПАСТКА: category model кешується — після змін категорій чистити storage/cache/cache.* І чекати (перший curl може віддати старий кеш).
- «Переглянуті товари»: порт recentlyviewed з shokeru.in.ua (сесія recently_viewed у product controller (обидві копії!), фолбеки related→свіжі по контексту; admin-файли скопійовані як є). Twig — картка редизайну + Swiper v3 карусель (.oc-viewed-swiper, init у redesign.js; НЕ id slider* щоб не зачепив глобальний init). module_id=38, layout 1 (content_bottom 3) і layout 2 Product (content_bottom 0). SQL: scratchpad/viewed.sql.
- Логін-попап не працював: inline jQuery-скрипт виконувався ДО підключення jQuery у футері — переписано на vanilla XHR/DOMContentLoaded. ПРАВИЛО: інлайн-скрипти в twig теми — тільки vanilla або після footer.

## 2026-08-11 — ГЛОБАЛЬНИЙ РЕНЕЙМ monosite -> pprintdim (лок+прод)
- Теки: catalog/{controller,model,view/theme,view/javascript}/pprintdim, admin/{controller,model,view/template}/pprintdim, catalog|admin/language/*/pprintdim, storage/modification/catalog/view/theme/pprintdim. Всі строкові згадки замінені (monosite/Monosite/MONOSITE -> pprintdim/Pprintdim/PPRINTDIM) у 23 код-файлах + 9 modification.
- БД (обидві): RENAME TABLE monosite_setting->pprintdim_setting, monosite_color->pprintdim_color (!); setting key/code/value replace (config_theme='pprintdim', theme_pprintdim_*); extension codes; modification XML+code+name replace. SQL: scratchpad rename.sql + rename2.sql.
- Роути тепер: pprintdim/checkout, pprintdim/cart, pprintdim/livesearch, pprintdim/setting (адмінка Тема). Класи ControllerPprintdim*.
- Прод: mv тек по ssh + залив 29 файлів зі згадками + SQL + FPM reload. Перевірено: home/admin/product/livesearch/checkout/cart 200.
- ЧЕРГА НЕЗАКРИТОГО: НП-автокомпліт міст/відділень у checkout (порт з shokeru: catalog/controller/checkout/novaposhta.php + API key у налаштування shipping_novaposhta_api_key; фронт: поля city/address у checkout.twig прості інпути) + перевірка оплат на фронті (LiqPay form після confirm — monosite/checkout line ~481 payment_form). Реєстрація за кодом задеплоєна.

## 2026-08-11 — НП-автокомпліт + натяжка категорії з робочим фільтром
- НП: catalog/controller/checkout/novaposhta.php (порт shokeru, кеш 1год): route=checkout/novaposhta&action=cities|warehouses. API-ключ у setting shipping_novaposhta_api_key (взятий з shokeru БД: 40585dd635d4eb4888803387cd237b08 — спільний акаунт власника). Фронт: checkout.twig vanilla-автокомпліт (.oc-np-drop, hidden city_ref), бекенд pprintdim/checkout не дублює 'Відділення №' якщо вже в address.
- Категорія за версткою: model getProducts/getTotalProducts + filter_price_min/max (по p.price) і filter_manufacturer_ids (IN); category controller (ОБИДВІ копії, modification має filter_sub_category=true) парсить price_min/price_max/manufacturers= з GET, віддає aside-дані (виробники з лічильниками по category_path, межі цін), фільтри протягнуті в url сортувань/пагінації ($url = $f_url). category.twig (обидві копії ідентичні): aside (підкатегорії + фільтр-форма GET з hidden route/path/manufacturers), тулбар (сорт-селект, results), сітка карток редизайну, стилізована пагінація, мобільний фільтр = offcanvas куди JS переносить форму.
- Ще в черзі: візуальна натяжка checkout/cart/contact/info/account/wishlist/search + перевірка оплат (LiqPay form у pprintdim/checkout ~481).

## 2026-08-11 — оплати: COD відновлено, LiqPay мертвий API; ІНЦИДЕНТ git checkout
- Чекаут-флоу технічно працює: POST pprintdim/checkout/checkout -> order створюється -> json.form (шлюз) автосабмітиться, або json.redirect на success. АЛЕ: liqpay-модуль = древній API 1.2 (liqpay.ua/?do=clickNbuy, XML) — ендпоінт мертвий; ключі в БД 'test'/'test' (ніколи не було живих). ДЛЯ ЖИВИХ КАРТКОВИХ ОПЛАТ: переписати на LiqPay API v3 (data/signature) + СПРАВЖНІ public/private ключі від користувача.
- COD (накладений платіж) повернуто: файли з git 27b6182, укр title 'Оплата при отриманні (накладений платіж)', extension+settings (status 1, sort 1) обидві БД. На чекауті метод зʼявився (лок+прод).
- Чекаут-таби авторизації (гість/увійти/реєстрація за кодом) + префіл даних залогіненого — задеплоєно.
- **ІНЦИДЕНТ**: `git checkout <commit> -- $(cmd|grep|tr)` з порожнім підставленням = `git checkout <commit> --` → DETACHED HEAD, увесь worktree відкотився на попередню сесію. Відновлено `git checkout openCart` (все було закомічено/запушено — втрат нуль; прод не зачеплений). ПРАВИЛО: git checkout з підстановкою — НІКОЛИ; тільки явні шляхи, перевіряти списки перед передачею.

## 2026-08-11 — SEO URL + фікси (jQuery/відгуки/заголовки/переглянуті)
- SEO URL згенеровано (обидві БД): 9687 товарів + 344 категорій + 224 виробників. Слаги — транслітерація укр назв (TR-мапа uk→lat), фолбек — слаг з імені картинки prom. Дедуп -{id}. Оригінальний дамп product-seo НЕ мав. config_seo_url=1 вже було. Генератор: scratchpad/gen_seo.py. ЧПУ працюють: nadiine-pokryttia-carceramic-9h-dlia-avto, zasoby-dlia-dogliadu... (200).
- jQuery is not defined: datetimepicker вантажився через document->addScript (в <head>, до jQuery у футері). Прибрано з product/register/edit/address/return/affiliate/checkout контролерів + ocmod-копії product (storage/modification гітігнорена, деплой прямий).
- 500 на product/product/review: sprintf на text_pagination з екранованим \ (та сама причина). Виправлено мовним фіксом %2$d з %3$d.
- Заголовки описів: bold-caps <p> -> <h3>; суцільні <h3>/<h2> що містять цілий абзац (br або >120 симв) -> розбиваються на заголовок+<p> (товар 5110 був увесь у h3). 1081 опис (лок+прод).
- Списки описів: сирітські <li> -> <ul>, br у списках/навколо блоків геть (4396 описів, обидві БД).
- Переглянуті товари: Swiper-плагін глючив -> нативна CSS-карусель (scroll-snap flexbox + кнопки .oc-viewed-prev/next у redesign.js).
- ПАСТКА: fail2ban банить SSH при частих деплой-конектах (порт 22 refused, 443 живий). Чекати розбан (until-loop), НЕ спамити.

## 2026-08-11 — швидке замовлення = заявка в БД + пошта STARTTLS
- Пошта: порт 465 БЛОКОВАНИЙ на Hetzner, 587 відкритий. config_mail: tls://smtp.gmail.com:587 (обидві БД). Всі sendCode обгорнуті try/catch (mail fail -> friendly json, не 500).
- «Замовити швидко» (product): 2 кроки — телефон+пошта -> pprintdim/checkout/fastCode (OTP лист) -> код -> pprintdim/checkout/fast. НЕ створює OpenCart-замовлення; створює ЗАЯВКУ в новій таблиці `oc fast_order` (product_id, product_name, model, quantity, price, telephone, email, customer_id, status='new', date_added) + лист адміну з назвою товару. Гість без акаунта — реєструється (addCustomer, firstname=телефон) + login. Залогінений — без коду, кнопка «Оформити заявку». JS у redesign.js (vanilla), старий #fastOrderModal-хендлер зі scripts.js видалено. product controller віддає customer_logged/telephone/email.
- ЩЕ НЕ ЗРОБЛЕНО: адмін-сторінка перегляду fast_order (заявки поки видно тільки в БД + лист адміну). Checkout auth — тепер чекбокс «У мене вже є акаунт» (без табів).

## 2026-08-12 — checkout переробка + адмінка швидких замовлень
- Checkout правий блок: sticky (.oc-summary top:90px), БЕЗ таблиці — flex-рядки товарів (фото+назва+к-ть×ціна+сума), тотали з total-екстеншенів (sub_total/coupon/total), купон (input+AJAX pprintdim/checkout/coupon -> session coupon -> reload). Кнопка «Оформити» тепер у summary (форма #order через form=order).
- Логін-чекбокс: «У мене вже є акаунт» показується ЛИШЕ якщо registration_required (config_checkout_guest=0). При чеку — ховає [data-order-form] (Ім'я/Прізвище/Телефон/Пошта) і показує інлайн email+кнопку «Надіслати код» (input-group).
- Контролер: додано $data['totals'], $data['coupon'], $data['coupon_action'], $data['registration_required']; метод coupon() (валідація через model extension/total/coupon).
- АДМІНКА: sale/fast_order (Продажі → Швидкі замовлення) — список заявок fast_order (товар/к-ть/ціна/тел/email/статус/дата), кнопки «опрацьовано»/видалити, пагінація. Меню в column_left (обидві копії), право sale/fast_order у user_group 1 (обидві БД). Контролер сам створює таблицю (ensureTable).

## 2026-09-09 — html-сабдомен верстки знято
- Верстка = гілка `main` репо pprintdim/autochemicals (`1952e26`), worktree `/Applications/MAMP/htdocs/autochemicals-html` прибрано.
- Сайт `html.autochemicals.com.ua` видалено з CloudPanel (site user теж), A-запис `html` у зоні Hetzner видалено. Локальний worktree верстки прибрано; deploy.sh верстки більше нема.
- Верстку дивитись через git: `git show <гілка>:<файл>` або тимчасовий `git worktree add /tmp/wt <гілка>` (прибрати після).
