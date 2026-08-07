> [!note] Імпортовано з `/Users/pprintdim/Desktop/vs_projects/well/handoff.md` 2026-08-07 (DOCS-POLICY). Санітизовано секретів: 1. Оригінал: untracked, видалений.

# Handoff — well.ua

_Останнє оновлення: 2026-07-25_

## 🔥 Активна задача: SEO-сторінки OCFilter не відображаються

**Симптом:** в адмінці OCFilter → Сторінки заповнюються дані (name, heading_title, meta title/description), але на фронті показуються загальні тайтли/теги категорії + автоприклеєні назви значень фільтра.

**Аналіз зроблено (по коду, без БД):**
- Механізм: `Seo::startup()` (`system/library/ocfilter/seo.php:88-126`) шукає збережену сторінку за `ocfilter_page_id` або за комбінацією категорія+параметри (`getPageByParams` у `catalog/model/extension/module/ocfilter.php:1828`). Якщо знайдено — H1/meta підміняються в `system/library/ocfilter/api.php:171-203`.
- Якщо НЕ знайдено — фолбек `getMetaText()` (`seo.php:499`): генеричний тайтл категорії + назви обраних фільтрів. **Це і є симптом.**
- Ключова умова: `placement->isCategory()` = `getCategoryId() && isModuleInLayout()` (`placement.php:21`). `isModuleInLayout()` перевіряє `oc_layout_module` на `code='ocfilter'` для layout цієї категорії. Якщо модуль не в layout — вся підміна пропускається.

**Ранжовані гіпотези:**
1. Модуль ocfilter не прив'язаний до layout категорії (найімовірніше).
2. Сторінка `status=0` або опис не для тієї мови (`language_id` вітрини не збігається).
3. Параметри на фронті не збігаються зі збереженими (`params_key` mismatch).
4. Сторінка не прив'язана до магазину (`ocfilter_page_to_store`).

**Діагностика готова, але заблокована доступом:** read-only SELECT-скрипт лежить у корені проекту — `ocf_diag_9f3a1c.php` (вивід: config мови/SEO, всі ocfilter_page з status/dynamic/params/мовами, page_to_store, layout_id категорій, layout_module з code='ocfilter'). Треба виконати на сервері або на локалці з копією бази. Користувач дав добро на SELECT-и.

**Знахідка:** на сервері в корені є `ocfilter_seo_import.php` — хтось (Stan?) вже займався донабиванням SEO keyword'ів для ocfilter_page у `oc_seo_url`.

## 🚧 Блокер доступу до сервера (з 23.07.2026)

`well.ua` за Cloudflare-проксі (IP `172.67.144.67`/`104.21.28.53`) — назовні працюють ТІЛЬКИ 80/443:
- **SFTP well.ua:2222 мертвий** (no route to host) — перевірено багаторазово, справа не в паролі.
- **MySQL 3306 недоступний** ззовні (+ на сервері він слухає localhost).
- **git push у `shcherbaks/well-opencart` НЕ деплоїть** — синк тільки сервер→git (щогодини авто-коміт), перевірено практично (пуш у гілку → файл на сайті 404).

**Потрібно від Stan (будь-що з цього):**
- пряма IP origin-сервера + SSH/SFTP доступ (тоді можливий і тунель до MySQL), або
- не проксируваний (DNS-only) субдомен типу `sftp.well.ua`.

## 🖥 Локальний стенд MAMP (підготовлений, чекає дамп БД)

Зроблено:
- Симлінк `/Applications/MAMP/htdocs/well` → `/Users/pprintdim/Desktop/vs_projects/well`.
- MAMP: Apache `localhost:8888`, MySQL 8.0 `127.0.0.1:8889` (root/root), PHP 8.3 (як буде ламатись OC3 — переключити на 7.4, встановлений).
- Локальні `config.php` + `admin/config.php` під MAMP написані (URL `http://localhost:8888/well/`, БД `well_ua@127.0.0.1:8889`).
- Серверні конфіги збережені: `config.server.php.bak`, `admin/config.server.php.bak` (в .gitignore).
- Порожня БД `well_ua` створена локально.
- Ізоляція конфігів: `config.php`/`admin/config.php`/`*.server.php.bak`/`handoff.md` додані в ignore і в `.gitignore`, і в `.vscode/sftp.json` — локальні конфіги ніколи не поїдуть на сервер/у git.

**Єдиний відсутній крок:** дамп БД з сервера. Користувач робить сам через FastPanel у браузері (єдиний працюючий канал): Бази даних → `well_ua` → експорт → віддати мені шлях до .sql/.sql.gz. Далі: імпорт → запуск локалки → виконати `ocf_diag_9f3a1c.php` → фікс.

**Варіант "одна база на сервері"** (файли локально, БД серверна) — обговорено, зараз неможливо: MySQL ззовні закритий, потрібен SSH-тунель = знову впирається в доступ від Stan.

## Стан синхронізації коду (24.07.2026)

Локальна директорія синхронізована з `shcherbaks/well-opencart` (git clone по SSH працює, доступ на push Є — перевірено):
- 134 файли підтягнуто з сервера (вкл. нову систему `up_search_*` ~40 файлів, модулі ai_translate, seo_meta, pilibaba, cartlink, crmbridge; оновлені index.php, system/startup.php, robots.txt, lightning.access, шаблони теми well).
- 19 файлів, яких нема на сервері, видалені локально (amazon/paypal/sagepay/custom_scripts/remarketing тощо) — видалення застейджено, НЕ закомічено в pprintdim/wellua.
- `ocmod/pprintdim_ai_reviews/` — окремий маркетплейс-модуль відгуків, не трекається, не чіпати при синках.

## Як деплоїти (коли SFTP оживе)

- **PHP** → після заливки скинути OPcache: тимчасовий файл з `opcache_reset()` в корінь → відкрити в браузері → видалити. Без цього зміни НЕ застосуються.
- **Twig-шаблони** → очистити кеш Lightning в адмінці (кеш сторінок до 24 год).
- **Статика під тим самим іменем** → purge Cloudflare (HTML не кешується, purge потрібен рідко):
```
curl -X POST "https://api.cloudflare.com/client/v4/zones/<REDACTED — див. ~/AI-Workspace/secrets/ACCESS.md>/purge_cache" \
  -H "Authorization: Bearer ТОКЕН" -H "Content-Type: application/json" \
  --data '{"files":["https://well.ua/шлях/до/файлу.jpg"]}'
```
Токен purge отримано (лише purge-права), у файли не писати — просити в користувача при потребі.

## ⛔ НЕ чіпати без узгодження зі Stan
- верх `catalog/index.php` — анти-бот код (тимчасовий, приберуть самі)
- `robots.txt` — обов'язкові групи для Googlebot (вимога Merchant Center)
- налаштування Lightning і Cloudflare

## Що далі (скоро, від Stan)
Нормальний флоу: clone → гілка → PR → рев'ю → merge → деплой. Тест перед продом на `dev.well.ua`. FTP закриють.

## pprintdim/wellua — статус
Історію очищено: `main` = 2 останні коміти, `config.php` з паролем БД прибраний з git-історії, зайві гілки видалені. Backup-теги старої історії — тільки локально.
**Пароль БД, що був у витоку, ще не змінений** — рекомендовано змінити.

## Незакриті задачі користувача
- [ ] Підтвердити Stan'у, що правила прочитані.
- [ ] Попросити у Stan прямий IP/SSH або DNS-only субдомен для SFTP (див. блокер).
- [ ] Зробити дамп БД через FastPanel для локалки (якщо йдемо цим шляхом).
- [ ] (Рекомендовано) поміняти пароль БД з витоку.
