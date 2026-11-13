# Безпека форм і публічних ендпоінтів — чек-лист (OpenCart 3, усі проєкти)

Створено 2026-11-03 на autochemicals.com.ua. Мета: жоден бот чи AI-агент не може зламати, заспамити
чи «покласти» сайт через форми, ajax-ендпоінти або залишки стокового коду. Проходити ПЕРЕД
зняттям noindex (гейт запуску) і після кожної нової форми.

## 1. Інвентар поверхні атаки
- `grep -rl "request->post\|request->get\[" catalog/controller` — список усіх контролерів, що читають ввід.
- Кожен роут доступний як `index.php?route=<папка>/<файл>[/<метод>]` — **мертві стокові контролери теж
  живі**: openbay/*, affiliate/*, credit_card/*, advertise/google, amazon_login, pp_login, divido, laybuy,
  recurring/*, api/* (перевірити IP-обмеження API), залишки модулів імпорту (напр. `feed/odmpro_*`).
  Невикористане — видаляти (controller + model + view + language), а не «просто не лінкувати».
- Не забувати ocmod-копії в `storage/modification/` — саме вони виконуються.

## 2. Кожна публічна форма / ajax-метод
- [ ] **Honeypot** — приховане поле `website` (позиція за екраном, `tabindex=-1`, `autocomplete=off`); заповнене → відмова.
- [ ] **Ліміт частоти на IP** і окремо **на ключ** (email/телефон) — у файлах/БД, НЕ в сесії
      (сесію бот міняє кожен запит). Еталон: `system/library/formguard.php` (autochemicals).
      Орієнтири: швидке замовлення 6/10 хв на IP + 4/год на телефон; надсилання OTP 5/15 хв на IP і 3/15 хв на email;
      перевірка OTP 10/15 хв на IP; контакти/відгук 5/год.
- [ ] **OTP**: 6 цифр, TTL ≤ 10 хв, ≤ 5 спроб на код, код привʼязаний до email у сесії І перевіряється
      саме для цього email; повторна відправка не частіше 45 с; лічильник спроб — також на IP (брутфорс новими сесіями).
- [ ] **Довжини й чистка**: обрізати керівні символи, `mb_substr` до ліміту колонки; імʼя без `<>{}[]\/=;` і URL.
- [ ] **Телефон**: лише цифри після нормалізації, 9–15 цифр, бекенд-нормалізація до `+380…` (startup/phone).
- [ ] **Товар/ціна/кількість**: ціна ЗАВЖДИ з БД, кількість clamp 1..99, тільки `status=1` і в наявності.
- [ ] **SQL**: усе через `(int)` / `$this->db->escape()`; жодних сирих GET/POST у `ORDER BY`/`LIMIT`/`IN()`.
- [ ] **XSS**: дані покупця у листах — `htmlspecialchars`; в адмінці (списки заявок/лідів/відгуків) — twig-ескейп,
      без `|raw`; у JS-попапах — вставка через textContent або ескейп.
- [ ] **Заголовки листа**: тема без `\r\n`; `setTo` лише на `config_email` або на перевірений email.
- [ ] **Відповідь**: тільки JSON без нотисів PHP (deprecation у тілі ламає JSON → вимикати логування deprecated).
- [ ] **Помилки**: дружній текст, без шляхів/SQL; винятки пошти — у лог, не в відповідь.

## 3. Краш-тести (руками/скриптом) — кожна форма
1. Порожні поля, 1 символ, 10 000 символів, emoji, `\0`, керівні символи.
2. `<script>alert(1)</script>`, `"><img src=x onerror=alert(1)>`, `{{7*7}}` (twig-ін'єкція), `' OR 1=1--`, `1;DROP`.
3. Масиви замість рядків (`name[]=x`), відʼємні/дробові/величезні числа (`quantity=-5`, `99999999999`).
4. Чужі ID (`product_id`, `order_id`, `address_id`) — IDOR.
5. Без кукі / з новою сесією на кожен запит — ліміти мають спрацювати.
6. 20 запитів поспіль — має бути «Забагато спроб», сайт не падає, у лозі тихо.
7. Заповнений honeypot — відмова.
Після — перевірити: лог помилок порожній, у БД не зʼявилось сміття, адмінка відображає ввід ескейпленим.

## 4. Інфраструктура
- `storage` поза веб-коренем; `/storage/`, `/system/`, `*.sql`, `*.tar`, `.git`, `.vscode`, `db.php` → 403/404.
- noindex-гейт `config_noindex`; на запуску прибрати nginx `X-Robots-Tag`.
- Security-заголовки: HSTS, X-Content-Type-Options, X-Frame-Options/`frame-ancestors`, Referrer-Policy, Permissions-Policy;
  кукі `Secure; HttpOnly; SameSite=Lax` (або None+Secure, якщо платіжка повертає POST-ом).
- Платіжки: підпис callback перевіряється ДО зміни статусу; сторінка повторної оплати — по підписаному токену.

## 5. Динамічний пентест — Strix
- Strix 1.7.0 (pipx, `/Volumes/Projects/_tools/pipx`), Docker через colima (`/Volumes/Projects/_tools/setup-colima-strix.sh`).
- Потребує LLM-ключ (`STRIX_LLM`, `LLM_API_KEY` або `~/.strix/cli-config.json`) і обмеження бюджету `--max-budget`.
- Запуск лише по СВОЄМУ домену, з інструкцією не робити DoS і не створювати масово реальні замовлення.

## 6. Гейт запуску індексації (разом із цим чек-листом)
Search Essentials Google, Core Web Vitals (PageSpeed/CrUX), HTTPS + заголовки, Safe Browsing чистий,
мікророзмітка валідна (Rich Results Test), sitemap/robots-live, hreflang/canonical, кукі-банер з Consent Mode v2
(до згоди — жодних аналітичних кук), читабельність 390px.

Як проходити (обкатано на autochemicals 2026-11-03, скрипти — `~/AI-Workspace/scripts/site-audit/`):
1. **Кукі-банер** — порт `common/cookie` (controller+twig+мови) з hydrophob/autochemicals; у `<head>` першим — `gtag('consent','default', denied…)`;
   перевірка puppeteer: до кліку в `dataLayer` лише denied, «Прийняти» → `consent update granted` + кука, після reload банера нема.
2. **Sitemap** — індекс `/sitemap.xml` + секції `/sitemap/<name>.xml`, товари чанками по 2500, кеш секцій 12 год у `DIR_CACHE/sitemap/`
   (без кешу тисячі товарів = 10+ с на запит = DoS). Роутинг у `startup/seo_url` (nginx не читає .htaccess). Перевірка: `xmllint --noout`, жодного `index.php?route=` у `<loc>`.
3. **Мобільна читабельність/overflow** — `node mobile-audit.js https://домен / /katalog /tovar /kontakty /koshyk` (ключові сторінки):
   scrollWidth має бути 390, текст ≥12px, абзаци ≥14px, тап-таргети ≥36px. Типові винуватці: `nowrap`-вкладки й пагінація,
   слайдер з `margin: 0 -15px` при gutter 12px, стікери/надзаголовки 10–11px, іконки шапки 18–24px.
4. **Lighthouse mobile** — `lh-summary.sh https://домен / /katalog /tovar` (з теки, де `npm i lighthouse@12`). Дивитись не на бал,
   а на список FAIL з елементами: `meta-description` (фолбек з опису в контролерах), `link-name` (іконки без aria-label),
   `crawlable-anchors` (`<a>` без href як кнопки), `heading-order` (h5 після h1), `label`/`select-name` (quantity, sort),
   `color-contrast` (білий на бренді #0096c7 = 3.5:1 → темніший токен для кнопок; muted #999 → #6b6b6b),
   `render-blocking` (Google Fonts через `media=print onload`, preconnect gstatic, дубль swiper у head і footer),
   `uses-responsive-images` (hero 1920px на телефон → srcset), `lcp-lazy-loaded` (перші картки без lazy), CLS (width/height на картках).
   `is-crawlable` падає, поки стоїть noindex-гейт — це норма до запуску.
5. **Мікророзмітка** — витягнути всі `application/ld+json` і `JSON.parse` кожен (скрипт у lh-summary не робить — окремим node-однорядником), далі Rich Results Test.
6. **/ru/-префікс** — працює лише коли ru-мова увімкнена в адмінці; поки вимкнена, `/ru/…` → 301 на uk. Перед увімкненням — переклад мовних файлів
   (`cmp` ru vs uk показує, скільки файлів — просто копії) і ru-контент у БД.

## 7. Типові діри, знайдені аудитом autochemicals (2026-11-03) — перевіряти на КОЖНОМУ проєкті
1. **Повернення з платіжки довіряє POST без підпису** (WayForPay `response()`): `orderReference=<id>` → сесія отримує чуже замовлення + валідний токен payment_retry → персональні дані будь-якого замовлення перебором id. Правило: order_id з POST — лише при валідному підписі, інакше тільки замовлення власної сесії; підпис — `hash_equals`, порожній секрет = відмова, звірка merchantAccount + суми + валюти.
2. **Кастомний чекаут без валідації**: довільний email + коментар → лист-підтвердження з нашого Brevo будь-кому (фішинг/спалення репутації). Валідація полів, whitelist увімкнених оплат (`payment_<code>_status`), `hasStock`, max qty, ліміти IP+email, `config_checkout_guest`.
3. **OTP-ліміти лише в сесії** → нова сесія = нові 5 спроб і нова відправка. Ліміти на IP і email у файлах/БД (Formguard).
4. **Стокові кроки чекауту живі** (`checkout/register|login|guest|confirm…`) — реєстрація з паролем без підтвердження пошти (pre-account-takeover) і брутфорс паролів. Видаляти, коли чекаут кастомний.
5. **ocmod-копії** (`storage/modification/...`) — фікс в оригіналі не діє, поки не продубльований у копії; storage поза веб-коренем заливати окремо.
6. **Мертві модулі** відповідають за прямим роутом: залишки імпорт-тулів (500 з шляхами), openbay `ebay/setup` (пише налаштування без авторизації), `tool/upload` (анонімний аплоад). Перед видаленням того, що прив'язано до `oc_event`/`oc_extension`/лейаутів — перевірити БД.
7. **`limit=100000`** у каталозі/пошуку/брендах (і SEO-шлях `limit-N`) → DoS ресайзом. Clamp централізовано в startup (`startup/input`).
8. **Відкриті проксі**: автокомпліт НП з нашим ключем (+ `SSL_VERIFYPEER=false`), живий пошук без ліміту — Formguard на IP, обрізати `q`.
9. **Кукі сесії** без `Secure/HttpOnly/SameSite`; при поверненні з платіжки POST-ом — `SameSite=None; Secure`, інакше нова сесія затре стару.
10. **Відкриті редиректи** в `common/language` / `common/currency` (`redirect` з POST) — лише на свій HTTPS_SERVER.
11. **Адмінка без ліміту входу** — Formguard 10/15 хв на IP і на логін.
12. Відповідь OC Request уже htmlspecialchars-кодує весь ввід — SQLi/XSS від анонімів зазвичай нема, але не покладатися: `(int)`, `escape`, `|e` в адмінці.
13. Після кожного тест-прогону перевіряти, чи тест не залишив сміття в БД (напр. відгук на неіснуючий товар до фіксу).

Повʼязане: [[functional-standard]], [[theme-launch]], [[standard-gap-matrix]].
