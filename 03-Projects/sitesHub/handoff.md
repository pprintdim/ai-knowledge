> [!note] Імпортовано з `/Users/pprintdim/Desktop/vs_projects/sitesHub/handoff.md` 2026-08-07 (DOCS-POLICY). Санітизовано секретів: 1. Оригінал: untracked, видалений.

# handoff — sitesHub (монорепо: prom + sites)

Об'єднана папка двох Laravel-додатків (2026-07-14, перенесені з `vs_projects/callManager` і `vs_projects/sitesParser` — старі папки видалені):
- **prom/** — Cold Call Manager (CRM promParser-лідів). Локально: аліас `crm` (artisan serve :8081), `crmbot`.
- **sites/** — sitesParser (пошук лідів по застарілих сайтах + розсилка). Локально: `./serve.sh` → :8000.
- **gate/gate.php** — копія TOTP-гейта, що стоїть на сервері (роби зміни тут і заливай у `sites_gate/`).

## Продакшн (sites.pprintdim.com) — МІГРОВАНО НА VPS 2026-07-27

Переїхали з shared-хостингу ukraine.com.ua на VPS hydrophob (46.224.100.254, CloudPanel, root SSH — доступи в `hydrophob-landing/handoff.md`, той самий сервер що й hydrophob.net.ua/hydrophob.net). Причина: користувач хотів консолідувати на своєму VPS замість shared-хостингу.

- SSH/SFTP до сайту: site user `sitespprintdim` (пароль — CloudPanel UI, скинути за потреби через `clpctl user:reset:password`), або root напряму.
- Структура (`/home/sitespprintdim/htdocs/`):
  - `sites.pprintdim.com/` — фіксований докорінь CloudPanel = стара `sites/` (index.php гейт-хаб, копія `gate/root-index.php`) + симлінки `prom`→`../sites_apps/prom/public`, `sites`→`../sites_apps/sites/public`
  - `sites_apps/prom`, `sites_apps/sites` — код додатків (той самий rsync-виключення список, що й раніше — див. нижче)
  - `sites_gate/gate.php` + `secret.txt`+`bound.flag`+`qr.png` (chmod 600) — TOTP-гейт, **секрет/bound.flag перенесені як є зі старого сервера** — Google Authenticator прив'язку НЕ зламано, нового сканування QR не треба
  - `promParser/` — сусід `sites_apps/` (той самий патерн, що й на старому хостингу), venv Python 3.12 (`requests`+`pymysql`)
- URL: https://sites.pprintdim.com/prom і https://sites.pprintdim.com/sites (nginx `location /prom`/`location /sites` з `try_files → index.php?$query_string`, налаштовано вручну в `/etc/nginx/sites-enabled/sites.pprintdim.com.conf`)
- PHP: сайт спочатку створений на 8.3, але composer.lock (symfony 8.1) вимагає **php>=8.4.1** — пул перенесено з `/etc/php/8.3/fpm/pool.d/` в `/etc/php/8.4/fpm/pool.d/sites.pprintdim.com.conf`, порт змінено на `127.0.0.1:19002` (узгоджено з nginx fastcgi_pass). CLI: `/usr/bin/php8.4`.
- SSL: Let's Encrypt через `clpctl lets-encrypt:install:certificate --domainName=sites.pprintdim.com` — валідний, перевірено.
- **Фонові процеси — systemd (не nohup+cron-watchdog, як було на shared-хостингу)**:
  - `sitespprintdim-bot.service` → `php8.4 artisan bot:start` (prom, working dir `sites_apps/prom`)
  - `sitespprintdim-queue.service` → `php8.4 artisan queue:work --tries=1 <REDACTED→secrets/ACCESS.md> --sleep=2` (sites)
  - обидва `Restart=always`, `enabled` (переживуть ребут сервера) — керування: `systemctl status/restart sitespprintdim-bot sitespprintdim-queue`, логи `journalctl -u sitespprintdim-bot`
  - ⚠️ Watchdog-скрипти (`bot-watchdog.sh`, `queue-watchdog.sh`) і крон з UI хостингу — БІЛЬШЕ НЕ ПОТРІБНІ, systemd сам перезапускає при падінні.
- Деплой (той самий rsync-патерн, тільки інший хост/шлях):

```bash
export SSHPASS='<root-пароль VPS>'
rsync -az --exclude .git --exclude node_modules --exclude tests --exclude .env \
  --exclude 'storage/*' --exclude 'bootstrap/cache/*' --exclude 'database/*.sqlite*' --exclude vendor \
  -e "sshpass -e ssh" \
  prom/ root@46.224.100.254:/home/sitespprintdim/htdocs/sites_apps/prom/
# далі на сервері: composer install --no-dev -o (від імені sitespprintdim), потім artisan config:clear
# systemctl restart sitespprintdim-bot sitespprintdim-queue — якщо змінювався код бота/воркера
```

### Старий хостинг (ukraine.com.ua) — DECOMMISSIONED, лишити як холодний бекап
- SSH/SFTP: `cc623309@cc623309.ftp.tools` (пароль у `/Applications/MAMP/htdocs/pprintdim/.vscode/sftp.json`; тільки password-auth, `<REDACTED — див. ~/AI-Workspace/secrets/ACCESS.md>`).
- Структура була: `/home/cc623309/pprintdim.com/{sites/, sites_apps/, sites_gate/, promParser/}`.
- **`bot:start`/`queue:work` там ЗУПИНЕНІ вручну 2026-07-27** (щоб не було двох живих Telegram-ботів після переїзду). Код і БД (`cc623309_prom`/`cc623309_sites` @ `cc623309.mysql.tools`) НЕ видалені — лишені як холодний бекап на випадок відкату. DNS `sites.pprintdim.com` більше на цей сервер НЕ вказує.

## Бази (тепер на VPS, локальний MySQL CloudPanel)
- **prom**: MySQL `promcrm` @ `127.0.0.1`, user/pass `promcrm`/(CloudPanel, скинути за потреби) — дамп зі старого `cc623309_prom` імпортовано 2026-07-27 (181 leads, 11 templates — рахунки збіглись з продом на момент міграції).
- **sites**: MySQL `sitescrm` @ `127.0.0.1` — дамп зі старого `cc623309_sites` імпортовано 2026-07-27 (39 leads, 19 statuses, 619 unpromising_leads — рахунки збіглись).
- Обидва `.env` на новому сервері мають ТОЙ САМИЙ `APP_KEY`/токени (TG_BOT_TOKEN тощо), що й старий прод — скопійовано з реального серверного `.env`, не з локального dev-`.env` (щоб не зламати шифрування сесій/даних).
- Локально prom/sites далі на sqlite — прод і локалка НЕ синхронізуються автоматично (як і раніше).
  - ⚠️ Нюанс (лишається актуальним): `ALTER TABLE ... AUTO_INCREMENT` всередині явної транзакції (`beginTransaction`) робить у MySQL/InnoDB **implicit commit** — транзакція обривається, і подальший `rollBack()` у catch падає з "There is no active transaction", маскуючи справжню помилку. Робити ALTER TABLE окремо, поза транзакцією.

## Макет редизайну — ЗНЕСЕНО (2026-07-21 → 2026-07-22)
- Фіча (генерація картинки-макету через htmlcsstoimage.com, вкладка «Макети», кнопка на картці ліда) прожила один день: користувач визнав ідею невдалою, картинка макету виглядала «стрьомно» — повністю видалено на його прохання, включно з продом.
- Видалено: `app/Services/RedesignMockupService.php`, `resources/views/leads/mockups.blade.php`, усі route/controller-методи (`generateMockup`, `destroyMockup`, `mockups`, `bulkDestroyMockups`), пункт меню «Макети», блок у картці ліда, вставка в email, `hcti_user_id`/`hcti_api_key` у Settings (і рядки з БД), `mockup_url` з `$fillable` та сама колонка (нова міграція `2026_07_22_000001_drop_mockup_url_from_leads_table`).
- ⚠️ Дорогою ще й ловили баг: `mockup_url` не зберігався, бо забув додати колонку в `$fillable` моделі `Lead` (mass-assignment мовчки ігнорував) — знайшлось тестуванням success-шляху з реальними ключами на проді (локально раніше тестував лише graceful-fail без ключів). Тепер уже неважливо — фічі нема, але сам патерн бага («додав колонку міграцією — не забути `$fillable`») варто памʼятати надалі.

## TOTP-гейт (Google Authenticator)
- **Прив'язка QR** (2026-07-14, аналогічно pprintdim/Filament MFA): доки нема `sites_gate/bound.flag`, на формі логіну є лінк «Сформувати QR для прив'язки» (`?bind=1` показує QR зі `sites_gate/qr.png` + поле коду). Перший успішний вхід створює `bound.flag` — QR ховається. Скинути прив'язку (новий телефон / видалив запис): `ssh … 'rm /home/cc623309/pprintdim.com/sites_gate/bound.flag'` — лінк з'явиться знову. Поки прив'язка не підтверджена, QR технічно видимий будь-кому — не лишати надовго нескинутим.
- Запис в аутентифікаторі: **pprintdimSitesParser**, секрет — на сервері `sites_gate/secret.txt`.
- Підключений через `public/index.php` обох додатків: `require ../../../sites_gate/gate.php` тільки якщо файл існує → локально гейт неактивний.
- Сесія: PHP-сесія `sitesgate`, cookie path=/ (одна авторизація на обидва додатки), TTL 12 год, анти-brute-force (5 фейлів → 60 с пауза), захист від повторного використання коду.
- Корінь сабдомена — `sites/index.php` (гейт + хаб-сторінка), стаб хостингу видалений 2026-07-14.
- Форма гейта віддає 200 (НЕ 401) — анти-бот хостингу серії 4xx рахує як атаку. Fix залитий на сервер 2026-07-14.
- gate.php примусово редіректить HTTP→HTTPS (301) — додано і залито 2026-07-14 (до того форма віддавалась і по нешифрованому HTTP).
- Security-аудит 2026-07-14: .env через веб НЕ доступний (перехоплює гейт), APP_DEBUG=false/production в обох, .git на сервері нема, secret.txt 600 поза docroot — ОК.
- Повна перевірка прода по SSH 2026-07-14: гейт, TOTP-логін, обидва додатки (prom «Cold Call Manager» 45 лідів, sites «SitesParser CRM»), хаб-сторінка — все ОК, лог Laravel чистий.

## Локальні фонові процеси
- TG-бот CRM: `cd prom && php artisan bot:start` (або аліас `crmbot`); queue-воркер sites: `cd sites && php artisan queue:work --tries=1 <REDACTED→secrets/ACCESS.md> --sleep=2`. Обидва перезапущені 2026-07-14 з нових шляхів (nohup, логи в `storage/logs/{bot,queue}.out`).
- ⚠️ Пастка: процес, запущений зі старого шляху, тримає старий base_path і ВІДТВОРЮЄ стару папку (`callManager/storage/logs`) — після переносу папок фонові artisan-процеси треба перезапускати.

## Прод: фонові процеси, TG-токен, watchdog (2026-07-21)
- **TG-бот токен змінено** (новий бот `@pprintdim_prom_parser_bot`, id 8925132647) — оновлено локально (`prom/.env`) і на проді (`sites_apps/prom/.env` через SSH `sed`, `config:clear` після). Старий процес бота (локально і на проді) перезапущений на новому токені.
- **⚠️ На проді `queue:work` (sites) стояв мертвий** — 13 задач висіли `pending`, у т.ч. пошуки з 07-17 і 07-20 взагалі не оброблялись. Запущено заново (nohup), почав розгрібати чергу.
- **⚠️ SSH crontab на хостингу зламаний** (баг хостингу, не наш): `crontab -l`/`crontab -` падають з `PermissionError` у CloudLinux-обгортці (`/usr/sbin/cloudlinux-user-cron`, читає файл без прав) — виправити з нашого акаунту неможливо. Тому cron можна додати ТІЛЬКИ вручну через UI хостингу (cPanel → Cron Jobs), SSH-командою не вийде.
- Замість cron через SSH — задеплоєні watchdog-скрипти (перезапускають процес, якщо він впав; не плодять дублікати, бо перевіряють `pgrep` перед стартом):
  - `sites_apps/prom/bot-watchdog.sh` → запускає `bot:start`, якщо не запущений
  - `sites_apps/sites/queue-watchdog.sh` → запускає `queue:work`, якщо не запущений
  - **TODO (потребує ручної дії користувача в cPanel UI):** додати cron `*/5 * * * * .../bot-watchdog.sh` і `*/5 * * * * .../queue-watchdog.sh`, щоб боти/черга дійсно жили постійно (зараз піднято тільки одноразовим nohup — переживе відключення SSH, але не переживе вбивство процесу хостингом чи ребут).
- `.vscode/sftp.json` заповнено (host/pass з `pprintdim/.vscode/sftp.json`), `uploadOnSave: true` для контекстів `prom`/`sites`/`gate`; `.env`, `storage`, `bootstrap/cache`, `database`, `vendor` в ignore — щоб не затирати прод.

## Email-шаблони: посилання на pprintdim.com (2026-07-21)
- **sites** (EmailComposer) вже мав `{my_site}`/`{my_site_line}` — нічого не міняли.
- **prom**: у 2 активних email-шаблонах (`templates` id 8 "Повна пропозиція — сайт під ключ", id 9 "Коротка пропозиція після дзвінка") посилання не було — додано рядок з `https://pprintdim.com` перед підписом, оновлено і локальну sqlite, і прод MySQL (`cc623309_prom`).

## Сторінка "Задачі" sitesParser — stop/delete/bulk (2026-07-21)
- `/settings/tasks` була суто read-only (тільки прогрес-бари). Додано:
  - `SearchController::bulkStop/bulkDestroy` (масові дії для пошуків; поодинокі `stop`/`destroy` вже існували, просто не були підключені до UI)
  - новий `QueueController` — `destroy`/`bulkDestroy` для `jobs` (черга), `retry`/`destroyFailed`/`bulkDestroyFailed` для `failed_jobs` (retry через `Artisan::call('queue:retry', ['id'=>[uuid]])`)
  - `resources/views/settings/tasks.blade.php` — чекбокси + панелі масових дій (Alpine.js, той самий патерн що в `leads/index.blade.php`) для всіх трьох секцій (Пошуки / Черга / Помилки)
- Протестовано наскрізно через реальні HTTP-запити (curl з CSRF-токеном) локально — всі 5 ендпоінтів підтверджено робочими; задеплоєно на прод (`rsync` + `route:clear`/`view:clear`/`config:clear`), схема БД на проді (sqlite) співпадає з локальною.
- ⚠️ Нюанс тестування в zsh: `for x in $var` НЕ ділить на слова за пробілом (на відміну від bash) — треба `${=var}`; символи `[]` у `-d 'ids[]=1'` унквотовані ловляться zsh-глобінгом. Раніше про це не було відомо — тепер враховувати при написанні тестових curl-скриптів.

## promParser переписаний з нуля (2026-07-22)
- **Виявлено**: старого `promParser` (Python-скрапер для prom CRM) не існує НІДЕ — ні на сервері, ні локально (видалений під час чистки 2026-07-14, лишився тільки слід у кеші Claude Code). Кнопка «Запустити» в prom CRM мовчки фейлила (`shell_exec` з порожнім `cd`), завжди повертаючи `success:true`.
- **Написав заново** — `/Users/pprintdim/Desktop/vs_projects/promParser/` (Python 3.9+/3.11, sibling до `sitesHub`), критерії від користувача: продавці на **Prom.ua**, "більш-менш живі" (активність ≤14 днів), середній дохід (бакет "доставлено замовлень" 50–2000), і — головне — **без власного сайту** (Prom не публікує таке поле у профілі, тому єдиний спосіб — Google-пошук через Serper, той самий ключ що й sitesParser).
- Дані продавця беруться з вбудованого Apollo-GraphQL JSON-блоку на сторінці компанії (`isOperating`, `lastActivityTime`, `deliveredOrdersCategoryText`, `phone`, `contactEmail`, `city` тощо) — сторінка містить ДЕСЯТКИ часткових об'єктів `"company":{...}`, треба брати саме той, що біля `deliveredOrdersCategoryText` (перший — порожній).
- **Перевірка "чи є свій сайт"** пройшла кілька ітерацій калібрування (реальні знахідки під час тестування):
  - Наївний варіант (перший неблокований домен = є сайт) хибно спрацьовував на бізнес-довідниках (`ua-region.com.ua`, `work.ua`, `biz-gid.ru`) і на Prom-магазинах з підключеним кастомним доменом (той самий шаблон "контакти, товари, послуги, ціни", просто не на `*.prom.ua`).
  - Звірка за словом ніші ("клінінг") в тексті знайденого сайту різала і хибні позитиви (короткі назви на кшталт "SPICY"/"DOMIX" збігаються з чужим бізнесом), і **гірше — хибні негативи** (реальний сайт "Кнопка" зі своїм доменом `knopka.shop` відкидався, бо їхній сайт про канцтовари, а не "клінінг" — ніша пошуку на Prom не завжди = реальна ніша бізнесу).
  - Фінал: підтвердження за **номером телефону** (той самий тел. з профілю Prom має зустрічатись на кандидат-сайті — майже неможливо збігається випадково) + слабший запасний сигнал (місто/ніша), якщо сайт не відповів (403 і т.п.). Це набагато надійніше, але не ідеальне — задокументована межа: боти-захист (403) іноді не дає перевірити напряму.
- Інтеграція з існуючим `LeadController.php` (не чіпав) — `parseStart`/`parseStatus`/`clearQueue` вже очікували точний контракт: `../../promParser/main.py --cli --fresh --limit=N --tg-chat=ID`, `.venv/bin/python`, `logs/parser.log`, `logs/progress.json`, `leads.db` (parse_queue). Пише напряму в Laravel `leads` (sqlite локально / MySQL `cc623309_prom` на проді) — `db_writer.py` сам визначає з`.env` яка БД.
- Перевірено наскрізно: локально (4 реальні ліди знайдено й записано в sqlite) і на проді через **сам метод контролера** (`LeadController::parseStart()`), не тільки напряму скриптом — процес реально стартував, знайшов 2 ліди, записав у MySQL, `parseStatus()` віддав коректний прогрес. Задеплоєно (`rsync` + окремий `python3.11 -m venv` на сервері, оскільки дефолтний `python3` там — застарілий 3.6.8).
- Ключі/налаштування: `SERPER_API_KEY` захардкожений в `config.py` як дефолт (спільний з sitesParser акаунт/квота — враховувати при витраті).

## Макет редизайну для email-пропозицій (2026-07-21)
- Ідея: показувати ліду картинку "як може виглядати оновлений сайт" прямо в email-пропозиції. Вирішили НЕ використовувати AI-генерацію картинок (галюцинує текст/кнопки) — робимо реальний HTML/CSS-макет і рендеримо через зовнішній API **htmlcsstoimage.com** (headless Chrome на їхньому боці, не наш сервер — прод це shared-хостинг з CageFS-обмеженнями, самим ставити Node+Chromium ризиковано).
- Нове: `RedesignMockupService` (генерує самодостатній HTML-макет — назва компанії/ніша/місто підставляються з ліда, чистить сміттєві символи з парсингу типу "≡"/"«" на початку назви), `leads.mockup_url` (міграція), кнопка «🖼 Сформувати макет» у картці ліда, авто-вставка картинки в `emails/lead.blade.php` якщо `mockup_url` заповнений.
- **Ключі HCTI (User ID + API Key) користувач додає сам через UI**: `/settings/general` → блок «🖼 Макети редизайну» (реєстрація на htmlcsstoimage.com, є безкоштовний тариф). Без ключів кнопка просто ввічливо повідомляє — не 500.
- Задеплоєно на прод (rsync + migrate + clear caches), перевірено зсередини сервера (curl ззовні ловить 429 анти-бот хостингу — це нормально, не помилка).
- Перевірку якості зробив сам: відрендерив локально через headless Chrome (`--headless --screenshot`) і подивився картинкою — чистий сучасний лендинг (hero + 3 фічі + footer), реальний текст без AI-артефактів.

## Фікс: пошук не набирав повний ліміт (2026-07-21)
- Баг: `RunSearchJob` брав лише один пул ~100 кандидатів на нішу (10 сторінок Serper); якщо після фільтрів/аудиту "хороших" лідів виходило менше ліміту — задача завершувалась як "done" з недобором (реальні приклади: search #48 ліміт 15 → знайшов 3; #50 ліміт 50 → знайшов 2).
- Фікс: `WebSearchService::search()` тепер приймає `$startPage` (наступна порція сторінок видачі); `RunSearchJob` робить до 4 раундів по всіх нішах, беручи додаткові сторінки для тих напрямків, що ще не вичерпані. Нова `NoSearchResultsException` (замість generic `RuntimeException`) сигналізує саме "видача для ніші скінчилась" — відрізняється від помилок конфігурації/API, які й далі валять задачу як `failed` з чіткою причиною (щоб не проковтнути мовчки, напр., відсутній Serper-ключ).
- Якщо навіть після 4 раундів ціль не набрано (Google справді видав усе, що міг) — статус лишається `done`, але в `error` пишеться прозоре пояснення "Знайдено X з Y — видача вичерпана", видно на сторінці "Задачі".
- Перевірено наживо (дешево, 2 виклики Serper): `<REDACTED→secrets/ACCESS.md>` реально повертає 54 НОВИХ URL без перетину з першою порцією — пагінація коректна. Повний дорогий прогін `RunSearchJob` не запускав (це реальні платні Serper-запити) — задеплоєно на прод, чекає перевірки на реальному пошуку.
- Файли: `app/Exceptions/NoSearchResultsException.php` (новий), `app/Services/WebSearchService.php`, `app/Jobs/RunSearchJob.php`.

## Автоматизація по крону (2026-07-24)
- Новий пункт меню «Автоматизація» в обох додатках (prom: top-nav, sites: ліва колонка). Один набір налаштувань на додаток (не список):
  - **prom** (`/prom/automation`): назва, кількість за раз (default 500), чекбокс автоемейлу. Кнопка «Перегенерувати токен».
  - **sites** (`/sites/automation`): назва, напрямки (ніші, textarea — обов'язково), місто, CMS, кількість (default 500), чекбокс автоемейлу.
  - Частоту (раз/день, раз/тиждень тощо) додаток НЕ знає — це налаштовується користувачем у Cron Jobs хостингу, посилання з токеном лише запускає один прогін.
- **Ендпоінт для крону**: `GET /automation/run?token=<секрет>` — без TOTP-сесії (bypass у `gate/gate.php` за патерном шляху `/automation/run`, перевірка токена — всередині Laravel `hash_equals`). Токен генерується автоматично, зберігається в `settings` (`AUTOMATION_TOKEN` / `automation_token`).
- **prom**: `AutomationController::run()` → `App\Services\ParserLauncher::launch()` (спільний з кнопкою старту сервіс — лок + запуск python). `--email` прокидається в `main.py`, який після кожного нового ліда сам шле email через `promscraper/email_sender.py` (SMTP напряму з Python, дублює рендер плейсхолдерів з Laravel `Template::render()` — синхронізувати вручну при зміні).
- **sites**: `AutomationController::run()` створює `Search` (з `auto_email` прапорцем) і диспатчить існуючий `RunSearchJob` — жодного нового subprocess, усе через штатну чергу (`queue:work`, вже запущена). Якщо `auto_email=true` — після `FinalizeLeadsJob` диспатчиться новий `AutoEmailSearchLeadsJob`, який ставить у чергу `SendLeadEmailJob` для кожного ліда пошуку з email. Захист від дублю — cooldown 5 хв через `automation_last_run_at` у settings (queue однoворкерна, тому true-паралелізму нема, але WAF/cron можуть ретраїти запит).
- **Важливий фікс під час розробки**: `shell_exec()` у PHP (через `popen()`) створює pipe, який успадковує фоновий `nohup ... &` процес — тому PHP чекає на його EOF (тобто на завершення python), ІГНОРУЮЧИ `&`. Проявилось як 25-53с зависання запиту замість миттєвої відповіді (спостерігалось і локально, і теоретично могло вплинути на прод). Виправлено в `ParserLauncher::launch()`: `proc_open()` з файловими дескрипторами (`['file','/dev/null','r'/'w']`) замість `shell_exec()` — це не створює pipe, тому `proc_close()` повертається за мілісекунди. Перевірено: 53с → 0.25с локально, 0.09с на проді.
- Перевірено живими запитами на проді (без TOTP-сесії, як реальний cron): невірний токен → 403 в обох; prom `?token=...` → 200, реально стартував фоновий парсинг (підтверджено логом `parser.log` і lock-файлом); sites `?token=...` (з налаштованим niche) → 200, реально створив `Search` і чергу підхопив `queue:work` (за 10с вже `status=running, found_count=1`). Збереження форм (`POST /automation`) теж перевірено на проді для обох.
- ⚠️ Нюанс тестування через SSH з двома додатками в одній cookie-jar: якщо в jar є XSRF-TOKEN одразу для `/prom` і `/sites` (обидва на домені sites.pprintdim.com), `awk '/XSRF-TOKEN/'` без фільтра по шляху зловить обидва рядки — конкатенація дає `\n` всередині HTTP-заголовка → nginx віддає голий `400 Bad Request` ще ДО Laravel. Фільтрувати за колонкою шляху (`$3=="/sites"`), не просто за словом XSRF-TOKEN.

## Нюанси
- Обидва додатки живуть у ПІДКАТАЛОЗІ — всі нові URL у blade/JS писати через `route()`/`url()`, НЕ хардкодити `'/path'` (масова заміна на `{{ url('/') }}/...` зроблена 2026-07-14).
- `redirect('/x')` у контролерах → `redirect(url('/x'))` (виправлено в prom LeadController::goto; sites root-редірект → `route('leads.index')`).
- promParser пише ліди в `../sitesHub/prom/database/database.sqlite` (шлях у `promParser/config.py`), CRM-кнопки парсера шукають `../../promParser` — на сервері парсера нема, кнопка «старт» там не працює.
- **promParser переписаний 2026-07-22** (нова архітектура `promscraper/`, деталі — `../promParser/handoff.md`): прибраний мертвий `--fresh`, доданий lock від подвійного запуску (409 через `pgrep`), заново спроєктований `--city`-фільтр (CLI + `parse:run --city=` + `LeadController::parseStart` приймає `city` з POST). UI-поле city в кнопці CRM поки НЕ додане.
- **⚠️ Виправлення попередньої заяви**: раніше в цьому файлі писалось «парсера на сервері нема» — це вже НЕ так, `promParser/` реально стоїть на проді (`/home/cc623309/pprintdim.com/promParser/`, встановлений і успішно запускався ще ДО цієї серії тестів — 2026-07-22 ~13:48). Також попередня заява «протестовано, помилок нема» була неповною: я перевіряв лише `laravel.log`, а не власний `promParser/logs/parser.log` — і пропустив, що lock від подвійного запуску РЕАЛЬНО НЕ спрацював на проді.
- **promParser стоїть на проді**: `/home/cc623309/pprintdim.com/promParser/` (venv Python 3.11, залежності `requests`+`pymysql`, без playwright — легкий HTTP-скрейпер). `config.py` автоматично резолвить `PROM_APP_DIR` на `sites_apps/prom`. Кнопка «старт» у CRM на проді реально парсить і пише ліди в MySQL.
- **Знайдено і виправлено 2026-07-22 (живе тестування двома паралельними запитами)**:
  1. **pgrep-lock не працював на проді** — CloudLinux CageFS ізолює процеси, PHP-FPM не бачить запущений `main.py` через `pgrep`. Наслідок: подвійні реальні запуски парсера (дублів у БД не було завдяки `UNIQUE`/`INSERT IGNORE` на `prom_url`, але зайві HTTP/SERP-запити витрачались). **Фікс**: атомарний файловий lock (`parser.lock`, `os.O_CREAT|O_EXCL`) — авторитетний власник — сам `main.py` (працює незалежно від видимості процесів), PHP робить лише швидку попередню перевірку для UX. Автозняття прострочених locks (>30 хв — процес впав).
  2. **Дублювання логів** (пункт зі старої архітектури, помилково вважався неактуальним без перевірки) — `main.py::log()` пише у файл напряму І одночасно `print()` в stdout; команда запуску з `LeadController` теж редіректила stdout у той самий файл (`>> logfile 2>&1`) → буферизований stdout вивалювався одним дубльованим блоком при виході процесу. **Фікс**: команда тепер редіректить лише stderr у logfile (`> /dev/null 2>> %s`), stdout більше не дублюється.
- Перевірено живим паралельним тестом (2 одночасні `curl -X POST /prom/parse/start &`): один процес виграв lock і відпрацював чисто (один запис на подію в лозі), другий одразу вийшов з `"Вже запущено"`. Всього лідів у проді: 52, дублів по `prom_url`: 0.
- Хостинг має anti-bot (429 «Protected section» з JS-челенджем) для підозрілих клієнтів — curl-тести можуть впиратись; у браузері прозоро. Тестувати можна curl-ом ЗСЕРЕДИНИ сервера.
- По SSH не чейнити `cd X && a; b` (b виконається в home).
- sites: AI-полірування, SMTP і ключі (Serper/PageSpeed) — у settings в БД (адмінка).
