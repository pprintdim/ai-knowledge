> [!note] Імпортовано з `/Applications/MAMP/htdocs/stores.crm/CURRENT_STATE.md` 2026-08-07 (DOCS-POLICY). Санітизовано секретів: 2. Оригінал: untracked, видалений.

# Поточний стан CRM

- У CloudPanel додано вкладку **CRM** за адресою `/crm` без окремого домену.
- Вкладку бачить лише суперадміністратор CloudPanel (`ROLE_ADMIN`); прямий доступ інших користувачів також заборонений.
- Зараз це тимчасова Symfony/PHP-заглушка, а не Laravel.
- Standalone CRM для менеджерів розгорнута за адресою `https://46.224.100.254:8442/crm/`. Вхід: `admin` / `<REDACTED→secrets/ACCESS.md>` (тимчасовий пароль, потрібно замінити перед реальним використанням).
- Це Laravel 13 API + TanStack Start SSR frontend із репозиторію `pprintdim/opencart-hub`, гілка `lovable`.
- Frontend працює через окремий systemd-сервіс `storescrm` на `127.0.0.1:3012`, API — через окремий PHP 8.4 FPM pool, зовні обидва маршрути об'єднані nginx під `/crm`.
- Laravel має власну БД `stores_crm`. Параметри підключення сайтів зберігаються зашифрованими через Laravel encrypted cast.
- Підключено `shokeru.in.ua`: OpenCart `3.0.5.0`, 2 замовлення, 164 товари та 5 клієнтів.
- Для `shokeru` створено окремого локального MySQL-користувача `shokeru_crm_reader@localhost`, який має тільки `SELECT` на `shokeru.*`. TCP-доступ для нього відсутній; CRM підключається через Unix socket.
- Реальні сторінки, що вже працюють через Laravel API: авторизація, реєстр сайтів і read-only API товарів, замовлень та клієнтів.
- Зовнішній smoke-test: сторінка входу `200`, API без токена `401`, login/sites/products/<REDACTED — див. ~/AI-Workspace/secrets/ACCESS.md> з токеном `200`; CloudPanel і магазин після деплою працюють.
- DNS API Hetzner і резервний SSH-доступ збережені глобально в macOS Keychain, не у файлах проєкту.

Наступний етап — під'єднати сторінки товарів, замовлень і клієнтів у Lovable frontend до вже готових read-only API замість mock-даних, а потім додавати інші OpenCart-сайти. Редагування залишається окремим майбутнім етапом.

## Деплой 5 серпня 2026

- Задеплоєно комміт `aecdb47` (Use real OpenCart catalog and CSV sources): сторінки товарів і категорій підключені до реального Laravel API замість mock-даних; додано CSV-джерела (import), export товарів/категорій у CSV.
- Виявлено і виправлено баг деплою: фронтенд-білд (TanStack Start SSR через Nitro) вимагає ОБИДВІ змінні середовища одночасно — `VITE_BASE_PATH=/crm` (Vite `base`, впливає на `import.meta.env.BASE_URL` і посилання на асети) і `NITRO_APP_BASE_URL=/crm` (Nitro-роутинг на сервері). Без другої змінної сервер обслуговує маршрути з кореня `/`, і всі сторінки під `/crm/*` повертають 404 через nginx-проксі. `NITRO_APP_BASE_URL=/crm` додано в `deploy/storescrm.service` (комміт `7f277cf`) і застосовано на сервері.
- Команда локального білда: `VITE_BASE_PATH=/crm NITRO_APP_BASE_URL=/crm npx vite build` (bun на цій машині не встановлено, використано локальний `node_modules/.bin/vite`).
- Backend-конфіг (`config/crm.php`) синхронізовано; значення `language_id=2` для shokeru вже було виправлено раніше напряму в БД `stores_crm.open_cart_sites`, збігається з новим дефолтом.
- Перевірено на проді (`https://46.224.100.254:8442/crm/`): логін, `/crm/login`, `/crm/products`, `/crm/categories` — 200; API `/crm/api/sites`, `/products`, `/categories`, `/orders`, `/customers`, `/csv-sources` з токеном — 200 з реальними українськими даними; без токена — 401 (як і задокументовано раніше).
- Кеші Laravel (`config:cache`, `route:cache`) на сервері перезібрано, інакше нові маршрути й змінений `config/crm.php` не підхоплювались.
- Деплой виконано вручну (сервер не є git-репозиторієм — файли копіюються напряму SSH/tar, не через `git pull`).

## Деплой 5 серпня 2026 (продовження): прибрано Import, реальні Orders/Customers

- Комміт `61abd24`: вкладку "Імпорт" видалено повністю (route, sidebar, dashboard-посилання, компоненти ImportWizard/SupplierForm/CategoryMapping/FieldMappingTable).
- "Постачальники" тепер показують реальний список CSV-файлів з Git (те, що раніше було на сторінці Import) — без фейкового CRUD постачальників.
- Замовлення і Клієнти підключені до реального API замість mock-даних (той самий патерн, що й Товари/Категорії). У картці клієнта — реальні останні замовлення саме цього клієнта (новий `customer_id` фільтр у `GET /sites/{site}/orders`).
- Бекенд: `orders()` тепер також повертає реальні `payment_method`/`shipping_method` (колонки вже існували в `oc_order`).
- Dashboard (`/`) переписано на реальні агреговані дані з `/sites` (сума товарів/замовлень/клієнтів, статус сайтів) замість хардкоджених чисел.
- **Досі мок-дані** (свідомо не займались, окремий великий шматок): сторінка `/sites/$siteId` (картка сайту), `/logs` (журнал), `Topbar` (сповіщення) — усі досі на `src/lib/mock-data.ts`.
## Деплой 6 серпня 2026: авто-виявлення нових сайтів, картка сайту, дрібні правки

- Комміт `008a7ad`. `crm-scan-opencart.php` (root cron у CloudPanel, кожні 5 хв) вже сканує `/home/*/htdocs/*/config.php` і бачить усі OpenCart-магазини на сервері, але Laravel (`storescrm`) фізично не має прав читати чужі htdocs (770, різні Linux-групи) — тому пряме сканування з Laravel неможливе без широкого MySQL `GRANT SELECT ON *.*` (від такого підходу свідомо відмовились, зачепив би й чужі проєкти на сервері).
- Рішення: скрипт тепер додатково копіює свій JSON-снепшот у `/home/storescrm/app/backend/storage/app/discovery/opencart-sites.json` (chown storescrm). Нова Laravel-команда `sites:sync-discovered` (заплановано кожні 5 хв через `bootstrap/app.php withSchedule`, cron `* * * * * php artisan schedule:run` додано в crontab користувача `storescrm`) читає цей файл і апсертить у таблицю `discovered_opencart_databases`.
- `GET /api/discovered-sites` (адмін) віддає лише бази, яких ще нема в `open_cart_sites`. На сторінці Сайтів — блок "Знайдені нові магазини" з кнопками "Підключити" (форма реєстрації, `POST /sites`) і "Ігнорувати" (`POST /discovered-sites/{id}/dismiss`).
- Перевірено на проді: сканер знайшов реальний новий магазин `hydrophob.net` (89 товарів, ще не підключений) — саме той кейс, який користувач повідомив як "не побачила автоматично".
- `/sites/$siteId` (картка сайту) досі була 100% на mock-даних і видавала 404 для реального id — переписано на реальний API (огляд/товари/замовлення/клієнти) + кнопка "Перевірити підключення" (реальний виклик `POST /sites/{site}/test`).
- Прибрано підпис "Окремий вхід для менеджерів CRM" на сторінці логіну; замінено дефолтний Lovable-favicon на іконку в стилі бренду CRM (той самий бокс/куб, колір `--primary`).

## Деплой 6 серпня 2026 (вечір): реальні логи перевірок, зачистка всіх mock

- Комміт `13f17e0`. Нова таблиця `connection_checks`: пишеться при кожній ручній перевірці (`POST /sites/{site}/test`, з ім'ям користувача) і автоматичній — нова команда `sites:check-connections` у планувальнику кожні 15 хв (оновлює `last_checked_at`/`last_error_at` сайтів).
- `GET /api/connection-checks` (пагінація, фільтри site/result/type) — всім авторизованим; `DELETE /api/connection-checks` (повне очищення журналу) — тільки `administrator`. Це перший крок узгодженої моделі "суперадмін може видаляти, менеджер — ні".
- `/logs` показує реальний журнал + кнопка "Очистити журнал" лише для адміна (роль з `/auth/me`).
- Topbar: реальний користувач з `/auth/me`, робочий вихід; фейкові дзвіночок-сповіщення, глобальний пошук і селектор сайтів видалені. Settings — реальний профіль облікового запису замість фейкових перемикачів. Sidebar-footer тепер "Режим лише читання".
- `src/lib/mock-data.ts` видалено повністю; тип `Status` переїхав у `StatusBadge`. У фронтенді не лишилось жодних mock-даних.
- Smoke на проді: всі сторінки 200, автоперевірка й ручна перевірка пишуть лог (перевірено записи обох типів через API).

## Деплой 6 серпня 2026 (ніч): hydrophob.net підключено + масове видалення для суперадміна

- Комміт `0533b25`. Обидві SQL-операції виконані з підтвердженням користувача.
- **hydrophob.net підключено як другий сайт** (site_id=2, 89 товарів): MySQL-користувач `hydronet_crm_reader@localhost` (лише SELECT на `hydrophobnet-oc`.*), реєстрація через `POST /sites`. Увага: у hydrophob.net українська = `language_id=1` (у shokeru — 2).
- **Масове видалення (Phase 1 read-only офіційно розширено):** окремі write-користувачі `shokeru_crm_writer` / `hydronet_crm_writer` — ТІЛЬКИ `SELECT, DELETE` (без INSERT/UPDATE/DDL, структуру знести неможливо). Креди зашифровані в нових колонках `db_write_username`/`db_write_password`<REDACTED — див. ~/AI-Workspace/secrets/ACCESS.md>`open_cart_sites`.
- `OpenCartWriteGateway` + `DatabaseOpenCartWriteGateway`: транзакційне видалення по whitelist пов'язаних таблиць (product_description/to_category/option/image/review/seo_url; order_product/option/total/history/voucher/recurring; address/customer_activity/history/transaction/wishlist тощо), tableExists-перевірки, ліміт 1–1000 id за запит.
- `POST /sites/{site}/{products|orders|customers}/delete` — тільки `role:administrator`. Кожне успішне видалення пишеться в нову таблицю `deletion_logs` (сайт, entity, кількість, список id, JSON-знімок видалених головних рядків, хто, коли).
- UI: на Товарах/Замовленнях/Клієнтах чекбокси вибору і червона кнопка "Видалити вибрані (N)" видимі лише адміну, з ConfirmDialog; запити групуються по сайтах. Менеджер цього не бачить, а бекенд йому поверне 403.
- Smoke на проді: всі 6 delete-ендпоінтів обох сайтів відпрацювали по неіснуючому id (`deleted: 0`) — write-підключення й транзакційний шлях перевірені без чіпання реальних даних. Реальне видалення користувач ще не проганяв.
- MySQL root-доступ на сервері: `clpctl db:show:master-credentials` (не зберігати пароль у файлах).

## Можливі наступні кроки (не підтверджені)

- UI для перегляду `deletion_logs` (наразі audit пишеться, але окремої вкладки нема; можна додати таб на сторінку Логів).
- Створення користувача-менеджера (зараз є лише admin/password123 — суперадмін; пароль досі тимчасовий, треба замінити).
- Views/деталі замовлення (позиції, адреси) і редагування даних — окремий етап.
