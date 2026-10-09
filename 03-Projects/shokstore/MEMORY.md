# shokstore — MEMORY

## Репозиторій і гілки (2026-09-22)
- Репо `pprintdim/radiant-redesign` (тека `/Applications/MAMP/htdocs/shokeru/shokstore`, всередині контейнера shokeru).
- `main` — попереднє покоління верстки (`site/` — секційний PHP з блоками, `analysis/` — аудит живого shokstore.com.ua від 11.07.2026).
- `html` — **нова верстка від Lovable**: 24 самодостатні макети `html/shokstore-*.html` (дублюються в `public/html/`), 6 старих без префікса — попереднє покоління; плюс обгортка TanStack Start (`src/`, `.lovable/`), `roadmap.md` зі статусом сторінок.
- `lovable` — знімок гілки `html` станом на 2026-09-22 (`a06d651`), зроблений перед портом, щоб джерело Lovable не загубилось.
- `html-port` — робоча гілка порту: 24 макети → секційний PHP (helper/sections/data/css/js), патерн як у ` shoker.in.ua/html` і `secured.in.ua/html`.
- Локальні worktree: `html-src/` (джерело, гілка `html`), `html-port/` (порт).

## Верстка
- Кожен макет самодостатній: 3 інлайн `<style>` (21–35 КБ, частина спільна), ~5 інлайн `<script>`, Google Fonts (Unbounded + Inter), класи з префіксом `ss-`, скоуп `.ss-scope` з CSS-змінними (тема темна: `--ss-bg:#090b0d`, акцент `--ss-lime:#c8ff2e`).
- `roadmap.md`: головна, інфо-сторінки й кабінет готові; каталог/товар/акції/кошик/checkout лишались на старій шапці — при порті шапку й підвал уніфіковано під новий стиль головної.

## Сабдомен верстки
- **https://html.shokstore.com.ua** — CloudPanel site user `htmlshokstore` (PHP 8.3, root `/home/htmlshokstore/htdocs/html.shokstore.com.ua`), DNS A `html` → 46.224.100.254 у зоні shokstore.com.ua (id 1472600), LE SSL з 2026-09-22. Креди — ACCESS.md.
- Деплой: `~/AI-Workspace/scripts/shokstore-html-deploy.sh sync [--full]` (пароль із `html-port/.vscode/sftp.json`, гітігнорований).

## Живий сайт
- `shokstore.com.ua` — старий OpenCart 1.5.3.1, PHP 7.1, site user `shokstorecom`, БД `shokstore` (перенесений на Hetzner 2026-08-11). **Домен не чіпати без окремої вказівки** — натяжка нової верстки планується окремо.

## Порт у секційний PHP (2026-09-22)
- Гілка `html-port` (коміт `b42fee1`, запушена): 24 сторінки, 32 теки секцій, 12 JSON у `data/`, `css/style.css` (352 КБ, спільні + сторінкові блоки під коментарями-роздільниками), `js/` (index + сторінкові), `img/` (9 файлів).
- Шапка й підвал уніфіковані під новий стиль головної. Старі класи мобільного меню (`ss-icon-btn`, `ss-mobile__close`) лишились тільки в 5 старіших макетах (cart/product/catalog/checkout/akcii) — у порті своє меню `ss-mobile__*`, це очікувана різниця, не втрата.
- Медіа були зовнішні (9 файлів з shokeru.in.ua) — скачані в `img/`, посилання переписані; зовнішніх посилань на медіа не лишилось.
- Аудит-скрипт порівняння порту з макетами (секції/заголовки/класи `ss-*`/обсяг тексту/класи без CSS) — `/tmp/audit.py` зі сесії; метрика «обсяг тексту» завищує макет, бо там інлайн-скрипти рахуються як текст.
- **Виконавці**: порт зробив Codex (уперся в квоту наприкінці — доробляв сам: README, локальні медіа, фолбек порожнього `?slug=`), звірку `page-auditor` не вдалося (ліміт Fable 429) — звірено власним скриптом.

## 2026-10-04 — переїзд: старий 1.5 → old, новий OC3 на домені
- **old.shokstore.com.ua** — повна копія живого 1.5.3.1: site user `oldshokstore`, PHP 7.1, БД `oldshokstore` (копія `shokstore`, 122 товари), basic-auth, robots Disallow. У vhost додано `@opencart` (`_route_`) — на живому його не було, ЧПУ віддавали головну.
- **shokstore.com.ua** перестворено: CloudPanel-сайт видалено й додано заново (PHP 8.3, site user `shokstorecom`), НОВА БД `shokstorecom` = копія БД shoker.in.ua (спільна товарка групи, 167 товарів), storage `/home/shokstorecom/storage/`, `@opencart` у vhost, LE (з www), basic-auth, robots Disallow. Креди — ACCESS.md.
- Бекапи старого домену (локально, md5 звірено): `shokstore/backups/backup-db-domain-20261004224614.sql.gz`, `backup-files-domain-20261004224614.tar.gz`.
- Код: гілка `oc` (orphan) у репо radiant-redesign, worktree `shokstore/oc/`, база — знімок shoker.in.ua `oc` 738b2ba, ребренд shoker→shokstore (тема `shokstore`, адмінка `shk_panel`).
- Деплой: `~/AI-Workspace/scripts/shokstore-deploy.sh sync|full|put|run` (git archive HEAD worktree oc; пароль з `oc/.vscode/sftp.json`).
- **Порт верстки (2026-10-05, ea64693 + фікси до c8d0b1f):** тема `shokstore` переписана на `ss-*` розмітку html-port; стилі — `layout/css/style.css` (з верстки, не правити) + `shell.css`/`catalog.css`/`account.css`/`content.css` (по зонах); Tailwind-стилі shoker більше не підключаються. `body data-page` — у `common/header.php` з маршруту (інфо — за SEO-слагом; override `config ss_page`). Картка товару має `card_variant` ('home' для слайдерів головної). Нові: модуль `shokstore_block` (відео/сценарії/консультація/кроки/переглянуте/розсилка), `common/quick_order/consult|subscribe`, `information/promo/subscribe` (листи менеджеру). Шрифти Unbounded+Inter самохостом у `theme/fonts`. Layout `js/index.js` НЕ підключати (демо-кошик на localStorage конфліктує зі store.js).
- Засіяно на сервері: `rebrand_shokstore.sql`, `seo_launch.sql`, `home_content.sql`, `info_content.sql` (бекапи БД перед кожним — `shokstore/backups/`).
- **2026-10-05 після аудитів (page-auditor + oc-launch), bda5316:** en-слаги товарів/категорій/брендів засіяно копією uk (177 рядків), обкладинки блогу `image/catalog/blog/*.jpg` (з theme img), nginx: deny php.ini/*.sql/REVISION/*.md + `/index.php`→301 `/`. Фікси, що були і в shoker/secured (виправлено на всіх трьох): форма товару мала `data-cart-add` → делегат кліків слав URL як product_id (тепер `data-cart-endpoint`); міні-кошик показував «3 ₴» — `$total` перезаписувався в циклі товарів (тепер `$grand_total`); en `text_home` = 'Home'. GA4 e-commerce готовий, але `config_ga4_id` порожній — вписати ID в адмінці.
- Лишилось: WayForPay merchant/secret, GA4 ID, переклад адреси для ru/en (`text_shop_address`), гостьовий перегляд списку обраного, SEO-мета брендів/довжини description (seo-filler), запуск (зняти noindex/замок, robots-live).

## 2026-10-06 — спільне з групою
Велком `shokstore-hero-city.mp4`, hero: +evening/+inspection перед банером, кнопка звуку завжди видна, стан товару на кнопках (див. shoker.in.ua/MEMORY.md, розділ 2026-10-06). Деплой `shokstore-deploy.sh sync` вимагає чистого дерева — комітити перед деплоєм.
