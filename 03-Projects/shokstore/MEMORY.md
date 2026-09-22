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
