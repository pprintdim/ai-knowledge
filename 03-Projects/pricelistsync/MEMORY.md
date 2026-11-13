# PriceListSync — стан і рішення

Домен: `sync.pprintdim.com`. Окремий продукт, репо `pprintdim/pricelistsync` (`main` — Claude, `lovable` — Lovable UI).

## Стан (2026-10-31) — етап 0 готовий
- Локально `/Volumes/Projects/MAMP/htdocs/other/own/pricelistsync` (той самий старт-кіт, Laravel 13.39 + Inertia 3 + React 19, composer platform PHP 8.4.17). Репо `git@github.com:pprintdim/pricelistsync.git`, `main` + `lovable`.
- Публічну реєстрацію вимкнено (`Features::registration()` прибрано з config/fortify.php) — акаунт власника створюється з консолі.
- Сервер: site user `ppsync`, `/home/ppsync/htdocs/sync.pprintdim.com`, LE, БД `ppsync`, замок `site-auth`, robots Disallow. Деплой `./deploy.sh`. Supervisor на сервері активний (знадобиться для черг).

## MVP задеплоєно (2026-11-01)
- Код: схема `database/migrations/2026_11_01_100000_create_pricelist_tables.php`; імпорт `app/Services/Import` (FormatDetector, readers CSV/XLSX/XLS/XML-YML стрімінгом, StructureAnalyzer, Mapping/RowMapper+Transformer+KeyNormalizer, Fetching/SourceFetcher з SSRF-guard, SourceImporter); злиття `app/Services/Merge/CatalogMerger`; `app/Services/Export` (PriceCalculator, FeedBuilder + публічний `/feed/{token}.{ext}`); синк `app/Services/Sync` (ConnectorClient HMAC, SyncPlanner → pending_changes, SyncApplier). UI — тимчасові Inertia-сторінки `resources/js/pages/pls/*` (Lovable потім рестайлить).
- Імпорт сам диспатчить MergeCatalogJob (тому окреме злиття після імпорту показує unchanged — це норм).
- Запобіжник: `products.missing` не шлеться при порожньому keep або коли zero/disable > 30% привʼязаних (`missing_max_ratio`), обхід — `sync:apply {run} --confirm-missing`.
- Конектор OC3 = безкоштовний модуль `pp_pricelistsync` у репо modules (контракт v1: HMAC-SHA256(secret, ts\nnonce\naction\nbody), заголовки X-PLS-*). Кастомні таблиці/колонки — тільки з білого списку в адмінці конектора, ключ product_id. Опублікований на modules.pprintdim.com.
- E2E на локальному OC 3.0.3.9 пройшов (create, повтор без змін, оновлення ціни, обнулення зниклого, кастомна колонка + кастомна таблиця). Знайдений і виправлений баг: meta_title у хеші текстів (4299fb6). Граблі тестового стенду: OC 3.0.3.9 VERSION = 3.0.3.8; ALTER TABLE на oc_product у строгому sql_mode падає на нульових датах.
- Прод: supervisor `ppsync-queue` (queue:work database, timeout 3600, лог /home/ppsync/logs/queue.log), `.env` DB_QUEUE_RETRY_AFTER=3700, crontab ppsync → schedule:run щохвилини (sources:run-due + dispatch-due-exports). Ліміти завантаження 210M: nginx `client_max_body_size` в ОБОХ server-блоках vhost (443 і 8080) + php_admin_value у FPM-пулі; бекапи в /root/vhost-backups і /root/sync-fpm-pool.conf.bak-*. ⚠️ Перевидача LE сертифіката перегенерує vhost — ліміт тіла (і замок site-auth) треба накласти знову.
- sync досі під замком site-auth (для конектора це не важливо — запити йдуть із sync у магазини).

## Суть (уточнено користувачем 2026-10-31)
Сервіс для власного використання (без акаунтів клієнтів): кілька фідів (CSV/XML/XLS/XLSX/посилання) від одного або кількох постачальників **зводяться в один каталог за артикулом/ID** для вивантаження в OpenCart 3 — стандартні поля, або через власний модуль-конектор, що на 100% працює з кастомними таблицями й полями.

## Рішення
- Стек: Laravel 13 + Inertia + React, черги (database driver), потокові парсери XMLReader / league/csv / OpenSpout. Мови uk + en.
- Потік: sources → нормалізація → злиття за ключем → master_products → export.
- БД: suppliers, sources, source_files, field_mappings, sku_aliases, supplier_products, master_products, master_product_sources, merge_rules, markup_rules, stores, export_profiles, category_map, product_links, import_runs, sync_runs, run_errors, pending_changes (preview diff перед записом).
- **Злиття за замовчуванням: пріоритет фіду + сума залишків** (ціна/назва/опис — з першого за пріоритетом фіду, де товар у наявності; залишки сумуються; правило перевизначається по полю).
- Вивантаження: (1) зведений фід-файл за URL зі стандартними полями OC; (2) OCMOD-конектор (HMAC-підпис, читає схему БД магазину, мапінг поле каталогу → будь-яка таблиця.колонка, запис у транзакції). Штатний OC3 API не годиться (лише кошик/замовлення), прямий MySQL — відкинуто.
- MVP: усі формати, маппінг, злиття+аліаси, націнка, зведений фід, конектор зі стандартними полями + кастомні колонки oc_product/oc_product_description, preview, журнал, розклад. Довільні кастомні таблиці — наступний етап.
- Заборонено ТЗ: CRM, клієнти, замовлення, аналітика.

## Дизайн (2026-11-03)
Lovable-верстки не буде (рішення користувача) — фронт у стилі pprintdim.com: палітра/шрифти Manrope+Space Grotesk/glass/куб-лого в `resources/css/app.css` (класи `pp-*`), `components/brand-logo.tsx`, градієнтна основна кнопка в `ui/button.tsx`. Обидві теми (світла/темна).
