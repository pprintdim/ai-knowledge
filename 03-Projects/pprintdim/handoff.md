> [!note] Імпортовано з `/Applications/MAMP/htdocs/pprintdim/handoff.md` 2026-08-07 (DOCS-POLICY). Санітизовано секретів: 4. Оригінал: untracked, видалений.

# Handoff — pprintdim.com

Оновлено: 2026-07-08

## Стан: сайт ЗАДЕПЛОЄНО і працює
- Прод: **https://pprintdim.com** (ukraine.com.ua shared). Усі сторінки/мови 200, SSL, форма з email-кодом працює.
- **Адмінка: https://pprintdim.com/cab-x7k2m9** (`/admin` = 404; шлях у `.env` → `ADMIN_PATH`).
  Логін `admin` / пароль `<REDACTED — див. ~/AI-Workspace/secrets/ACCESS.md>` — ⚠️ **користувач ще НЕ змінив** (віджет «Доступ адміністратора» в Дашборді).
  MFA Google Authenticator **обовʼязковий**: перший вхід примусово покаже QR-налаштування.

## Архітектура (ключове)
- Laravel 13 + Filament 5.6. Локалка: `/Applications/MAMP/htdocs/pprintdim` (MAMP, serve на :8123).
- **Одна спільна MySQL** для локалки і проду: `cc623309_pprintdim` @ `cc623309.mysql.tools` (креди в `.env`). Локальні правки контенту = одразу на проді!
- Контент: `site_pages` (content_html з blade через сидер) + `site_content_fields` (тексти, по секціях) + `site_blocks` (репітери: картки/ціни/FAQ) + `site_cases` (портфоліо) + `site_reviews` (відгуки) + `site_settings` (key-value).
- Джерело правди — blade у `resources/views/pages/`. Після зміни blade → пайплайн (порядок у README.md) → залити blade на сервер.

## Сервер
- SSH/FTP: `cc623309@cc623309.ftp.tools` (пароль в `<REDACTED — див. ~/AI-Workspace/secrets/ACCESS.md>`; тільки password-auth, `<REDACTED — див. ~/AI-Workspace/secrets/ACCESS.md>`).
- Код: `/home/cc623309/pprintdim.com/app`, docroot `www → app/public` (симлінк).
- PHP CLI: **тільки** `/usr/local/php84/bin/php` (дефолтний = 8.2, vendor зібраний під 8.4).
- Сервер почищено до runtime (без міграцій/tools/tests) — все керується з локалки.
- ⚠️ Пастка: битий `bootstrap/cache/config.php` валить САМ artisan → `rm -f bootstrap/cache/config.php && php84 artisan config:cache`. По ssh не чейнити `cd X && a; b` (b виконається в home).

## Інтеграції
- Freelancehunt API: токен у `.env` (`FREELANCEHUNT_TOKEN`). Імпорт відгуків (40) і портфоліо (7) — кнопки в адмінці (Відгуки / Кейси) або сервіси `FreelancehuntReviews`/`FreelancehuntPortfolio`.
- Telegram-сповіщення заявок: токен + chat_id (Select із getUpdates) в Дашборд → Налаштування. Токен шифрується в БД. З .env прибрано.
- GA4 + Google Ads: поля `ga_id` і `ads_id` (gtag `AW-18283243270`) в Налаштуваннях. Конверсія generate_lead шле і в GA4, і в Ads.
- Пошта: **повністю з БД** (секція «Пошта (SMTP)» в Налаштуваннях: host/port/encryption/username/password/from + кнопка «Тест пошти» всередині секції). Пароль шифрується (`<REDACTED — див. ~/AI-Workspace/secrets/ACCESS.md>`). `AppServiceProvider::configureMailFromDb()` перекриває mail.* конфіг у boot. У `.env` локально `MAIL_MAILER=log`, на проді MAIL_* нема. SMTP юзера: `mail.adm.tools`, 465 = SSL. ⚠️ sendmail на сервері — CageFS-заглушка, НЕ доставляє.
- Форма контактів: телефон **обовʼязковий** — select з 30 країн (прапор+код), маска/валідація довжини по країні, автовизначення країни з мови браузера, hidden `phone` шле `+код цифри` (бекенд: `regex:/^\+\d{8,17}$/`). Успіх — попап `.ppd-ok`; текст у налаштуванні `contact_success_text` (в БД заповнено). Помилки форми червоні (#f87171).
- Prefill з прайсу/калькулятора (`?source=&service=&estimate=…`) йде ТІЛЬКИ в hidden-поля (cfLeadSource тощо), видиму textarea не чіпає; бекенд `messageWithLeadContext()` сам додає «Контекст заявки» в message (лист/Telegram/адмінка).

## Ціни /services — адмін-сторінка «Ціни та калькулятор» (2026-07-06)
- `app/Filament/Pages/ServicesPricing.php` + view `filament/pages/services-pricing.blade.php`: керує JSON у `site_settings` → ключі `services_pricing_plans` (5 карток, title/text ×uk/ru/en, price, suffix, badge) і `services_calc` (page_price 40, seo_add 200, integr_add 300, types з base/min_pages/max_pages: Landing 450/1/1, Корп 900/3/20, Магазин 1500/5/50, Редизайн 600/1/30, cms-надбавки).
- services.blade.php читає через статики `ServicesPricing::plans()/calc()` (локаль-тернарники, щоб тексти НЕ ставали content fields). Блок `pricing_plans` із site_blocks видалено (build_blocks.php, SiteBlock.php почищені).
- ⚠️ ServicesPricing.php мусить бути на сервері ДО сидінгу content_html (інакше 500). Нові Filament Pages → на сервері `route:clear && route:cache`.
- Калькулятор: слайдер min/max з data-min/data-max типу, клемп + disabled якщо min===max (лендінг). Перемикач валют (USD/EUR/UAH) і перед pricing-grid (`.pricing-cur`), синхронізовані між собою, конвертують ціни карток по живих курсах.

## Freelancehunt-шилд у футері (2026-07-06)
- `resources/views/partials/fh-shield.blade.php` — бейдж `type/reviews?style=for-the-badge` (profile id 1235341), локалізований lang. Включено в footer усіх 10 blade (9 сторінок + case.blade.php по центру над footer-bottom).
- Cloudflare 403-ить curl до freelancehunt.com/shields, але `<img>` у браузері працює — перевіряти очима, не curl.

## GTM — рішення користувача (2026-07-07)
- Користувач обрав варіант (а): у GTM тегів НЕ створюємо, контейнер лежить порожній про запас. Вся аналітика йде напряму через gtag (щоб не було дублю pageview). Ads-конверсія — імпортом GA4 generate_lead.

## Контактна форма — код через попап (2026-07-07)
- contact.blade.php перероблено: з форми прибрано кнопку «Отримати код» та інлайн-поле коду. Сабміт: preventDefault → POST на route('contact.code') → попап `#ppdCodeModal` (стилі .ppdm, під .ppd-ok) з 6 інпутами-клітинками (перший має autocomplete="one-time-code" для iOS), автоперехід/backspace/paste, resend з кулдауном 60с. Після 6 цифр — hidden `#cfCode` заповнюється і `form.submit()`. Помилка коду з сервера (`$errors->has('email_code')`) знову відкриває попап з текстом помилки.
- Переклади попапа додані в tools/apply_site_translations.php (ru+en), застосовані.
- Задеплоєно і перевірено на проді.

## GA4 / Ads (2026-07-06..07)
- GTM `GTM-T5GHM6HV`, GA4 `G-C9RQRZT06T`, Ads `AW-18283243270`. `window.ppdTrack()` в analytics.blade.php. 17 подій (generate_lead, conversion, calculator_update, select_service, contact_click тощо).
- Всі події «прострілено» напряму в GA4 (скрипт `ga4_events.sh` у скретчпаді сесії; POST /g/collect → 204) — видно в DebugView/Realtime.
- Ads-конверсію рекомендовано імпортом GA4 `generate_lead` (код шле send_to без label).
- ⚠️ **SiteSetting кешується Cache::rememberForever** — після зміни site_settings з локалки на сервері треба `php84 artisan cache:clear`, інакше прод віддає старі значення (так було з data-max калькулятора).

## Портфоліо → webp + описи + галерея (2026-07-07, ГОТОВО)
- Всі 13 кейсів: `site_cases.image/thumb` → локальні `assets/cases/{slug}.webp` (1600px) + `{slug}-thumb.webp` (640px); файли на сервері. thum.io/FH-CDN більше не використовуються.
- Описи 6 fh-кейсів (garage-door, wellua, optiapply, pet-store, aff-community, forsageua) оновлені з FH API comment: uk = base, ru/en у translations JSON. Комент optiapply у FH містив зайвий діалог — взято тільки фінальну версію; хештеги pet-store прибрані. ritualangels пропущено (кейс видалений).
- **Галерея**: колонка `site_cases.gallery` (JSON, міграція 2026_07_07), cast в SiteCase, блок «Скріншоти проєкту» з лайтбоксом у case.blade.php. Заповнено: forsage/forsageua (2), garage-door (2), pet-store (2), gorizont-septic (1 моб). Файли: `public/assets/cases/gallery/*.webp`.
- Скріни: headless Chrome; моб. в'юпорт 390×844 як другий кадр. shariki-911 (2) і puidavision (1) дозняті вранці 2026-07-08, галереї в БД. НЕ вдалось: well.ua (не відповідає з цієї мережі), alliesofskin (CF-челендж), affcommunity (403), **dev.optiapply.com — 403 для всіх, лінк кейсу мертвий — сказано користувачу, чекаємо живий домен**.
- **freelance.ua** (`freelance.ua/user/pprintdim`, без CF, curl ок): 3 роботи. Картинка 243678 = elidance (школа танців) → додана в галерею elidance (на проді). 243679 = «Smart Green» → **створено новий кейс id=15, slug `smart-green`** (source freelance.ua, uk/ru/en описи, image з верхньої половини колажу через crop+180°). 243680 (лендинг+Telegram) — без картинки.
- **FH додаткові картинки неможливі технічно**: API = 1 image/снипет (у pet-store взагалі нема), snippet-ендпоінти 404, веб за CF навіть для headless Chrome.
- Виправлено баг case.blade.php: CTA-заголовок «Потрібен схожий проєкт?» рендерився з екранованим span ({{ }} → {!! !!}).
- FH portfolio JSON: скретчпад `fh_portfolio.json`; скрипт апдейту `update_cases.php` (скретчпад).

## Моб. верстка — скарга користувача (2026-07-08, НЕ ВІДТВОРЕНО)
- Користувач: «слайдери в моб трохи здвинуті, відступ зліва». Діагностика через CDP (`$SP/overflow_check.mjs`, `$SP/mob_shot.mjs`, Node 24 + headless Chrome, Emulation 390×844 mobile): **scrollWidth = 390, overflow нема**, всі .container вирівняні по 16px (home, reviews, services, case). Єдині елементи за межами в'юпорта — навмисні (орби в .bg-orbs overflow:hidden, off-canvas .mobile-nav з visibility-гардом, marquee).
- Превентивний фікс залито: `overflow-x: clip` фолбеком після hidden на html і body (style.css:53,62) — на iOS Safari `hidden` не завжди блокує гориз. пан від transform-елементів. Чекаємо скрін/уточнення від користувача, яка саме сторінка/слайдер.
- ⚠️ Скріни headless Chrome БЕЗ Emulation.setDeviceMetricsOverride (просто <REDACTED→secrets/ACCESS.md>) дають фейкові «обрізання» — не вірити, знімати через mob_shot.mjs.

## SEO-просування
- `docs/link-building.md` — гайд по закупівлі посилальної маси (безкоштовна база, Collaborator/PRPosting/WhitePress, анкор-стратегія 60/30/10, темп, бюджет, план 90 днів).

## Кейси (site_cases) — 13 шт.
- **Видалено**: ritualangels-premium-turnkey-store; дублі `forsageua` + `wellua` (2026-07-17, автоімпорт FH створив копії ручних `forsage`/`well-ua`; бекап рядків був у scratchpad сесії). Їхні URL тепер 404 — 301-редиректи на канонічні кейси НЕ налаштовані, обидва були в сайтмапі.
- **Переклади**: `translations` JSON колонка — uk (основні поля) + ru + en
- **Маршрути**: `/portfolio/{slug}` (uk), `/ru/portfolio/{slug}`, `/en/portfolio/{slug}`
- **case.blade.php**: повністю локалізований (hreflang, lang attr, nav, CTA, schema inLanguage)
- **sitemap.xml** — динамічний (routes/web.php:21-25 тягне published-слаги з БД), руками правити не треба.

### Картинки кейсів (2026-07-17)
- Формат-еталон: `assets/cases/{slug}.webp` 1600x900 + `{slug}-thumb.webp` 640x360, cwebp -q 82/80.
- **Хотлінків на thum.io більше НЕМАЄ** (`image like 'http%'` = 0). nadelgmp жив на `image.thum.io` і той почав віддавати порожню 4.5КБ заглушку → біла картка. Не використовувати thum.io.
- Перезняті живі сайти замість мокапів ноутбука з біржі: nadelgmp, aff-community, garage-door, pet-store-on-woocommerce, optiapply.
- **Мокапи з FH ще лишились** (квадратні ~1:1, сайт дрібний): їх більше нема серед published, але новий імпорт з біржі знову притягне `image.large.url` — після кожного імпорту перевіряти пропорції (ручні = 1.78/1.6/1.44:1, мокап = ~1:1).
- Скрипт зйомки (puppeteer-core + системний Chrome, глушить куки-банери/спінери/фікс-бари, морозить анімації) — у scratchpad сесії, не в репо. Пастки: nadelgmp — слайдер, годиться лише темний слайд (клікати `.swiper-button-next` ~2 рази); fluffyfavpets.shop — у клієнта живцем висить плашка `.line-banner` з «new text test!!»; bestgaragedoorrepairandservice.com — вічний спінер, глушити ДО заморозки анімацій.
- `alliesofskin.com.ua` віддає 403 на curl — це Cloudflare-челендж, сайт живий. Перевіряти браузером.

## Незакриті задачі
1. Користувач: змінити пароль адміна + налаштувати MFA + зберегти recovery-коди.
2. Користувач: заповнити в адмінці telegram_url (нік), contact_email, Telegram-бот токени, GA4 ID.
3. Фото сторінки дизайну: `public/assets/team-portrait.jpg` — зараз плейсхолдер, користувач мав замінити своїм.
4. 3 EN-рядки лишились неперекладені в tools/apply_site_translations.php (дрібниця).
5. Git: репо https://github.com/pprintdim/pprintdim — перевірити, що ПРИВАТНЕ. Останні зміни ще не закомічені.
6. Для Google Ads усе готово технічно; теми пошуку (50) — у README.md.
7. Sitemap.xml поки що включає тільки `/portfolio/{slug}` URL (без `/ru/` та `/en/` версій кейсів) — можна додати.
8. Кейс **elidance** — досі нема URL у БД. Живий сайт знайдено і перевірено: **https://elidance.com.ua** (OpenCart, «EliDance — танцевальный интернет-бутик»). UPDATE НЕ виконано — користувач не підтвердив.
9. RU-переклад `portfolio:text_028_vidkriti_sait` («Відкрити сайт ↗») — дрібниця з пайплайна.
10. **Галерея кейсів (`gallery`)**: користувач просив затерти у всіх кейсах (сам додасть свої) + видалити файли з `public/assets/cases/gallery/`. UPDATE НЕ виконано — не підтвердив. Зараз заповнена у 6 кейсів. ⚠️ `gallery/forsage-1,-2.webp` спільні з видаленим дублем — зараз їх тримає тільки `forsage`.
11. Дублі `forsageua`/`wellua` видалені (2026-07-17). Якщо треба SEO — повісити 301 з `/portfolio/forsageua` → `/portfolio/forsage` і `/portfolio/wellua` → `/portfolio/well-ua`.

## Тести
`php artisan test` — 18/18 (in-memory sqlite, прод-БД не чіпають). Тест-юзерам треба `app_authentication_secret` (MFA required).
