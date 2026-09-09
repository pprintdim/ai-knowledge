# Матриця відповідності стандарту — 8 OpenCart-проєктів (2026-09-09)

Аудит по коду на диску (не по БД) за [[functional-standard]]. Колонки: **net** = hydrophob.net (openCart), **ua** = hydrophob.ua (openCart, «еталон» UX), **netua** = hydrophob.net.ua (main), **comua** = hydrophob.com.ua (main, лендінг 3.0.3.8), **auto** = autochemicals (openCart, 3.0.3.1), **shk** = shoker.in.ua (openCart, чистий 3.0.3.9 після нульового етапу), **rc** = realChem/site (openCart-скелет з hydrophob.ua), **shokeru** = shokeru.in.ua (донор, 3.0.5.0).

Легенда: ✅ є · ⚠️ частково/інакше · ❌ нема · – n/a

| # | Пункт | net | ua | netua | comua | auto | shk | rc | shokeru |
|---|---|---|---|---|---|---|---|---|---|
| 1.1 | OTP-логін/реєстрація попапом | ✅ | ✅ | ✅ | ⚠️ | ⚠️ сторінки | ❌ | ⚠️ | ⚠️ пароль+OTP |
| 1.2 | Нема login/register-сторінок, `?auth=` | ❌ | ✅ | ⚠️ 404 | ✅ | ❌ | ❌ | ❌ | ❌ |
| 1.3 | Стокові account/* → 302 у кабінет | ⚠️ | ⚠️ address | ⚠️ 404 | ❌ | ❌ | ❌ | ⚠️ | ❌ |
| 1.4 | Зміна email лише кодом | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ⚠️ | ❌ |
| 2.1 | intl-tel-input (vendor) | ✅ | ✅ | ✅ | ❌ | ❌ inputmask | ❌ | ⚠️ CDN | ❌ маска |
| 2.2 | normalizePhone() бекенд | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ |
| 3.1 | Ajax-мінікошик-шухляда | ❌ | ✅ | ✅ | ❌ localStorage | ⚠️ JS-рендер | ❌ | ❌ | ⚠️ |
| 3.2 | Бейджі `[data-cart-total]`/wishlist | ✅ | ✅ | ⚠️ | ❌ | ⚠️ | ❌ | ❌ | ⚠️ |
| 3.3 | Порожній мінікошик + «може зацікавити» | – | ✅ | ⚠️ | ❌ | ⚠️ | ❌ | ❌ | ❌ |
| 3.4/6.4 | «Безкоштовна доставка від N» + override | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 3.5 | Вішліст ajax, гість → тост+auth | ⚠️ | ✅ | ⚠️ | ❌ | ⚠️ | ❌ | ❌ | ⚠️ |
| 4.1 | Єдина плитка скрізь | ✅ | ✅ | ✅ | – | ✅ | ❌ | ⚠️ | ✅ |
| 4.2 | Кнопка «Додати» + is-added/is-out | ❌ | ✅ | ⚠️ | ⚠️ | ⚠️ | ❌ | ❌ | ⚠️ |
| 4.3 | webp-рендери + srcset | ⚠️ srcset | ⚠️ webp | ❌ | ⚠️ | ⚠️ | ❌ | ❌ | ⚠️ |
| 5.1 | Вкладка «Відгуки» завжди | ✅ | ✅ | ✅ | – | ⚠️ | ⚠️ | ✅ | ❌ |
| 5.2 | Модуль category_reviews | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 5.3 | Модалка відгуку email+тел+OTP | ⚠️ | ✅ | ⚠️ | ❌ | ⚠️ | ❌ | ❌ | ❌ |
| 5.4 | oc_review email/telephone | ⚠️ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 5.5 | Лінк «на prom.ua» | ✅ | ✅ | ⚠️ | ❌ | ❌ | ❌ | ⚠️ | ❌ |
| 6.1 | Односторінковий чекаут | ✅ | ✅ | ✅ | ✅ api/*.php | ✅ | ❌ | ⚠️ | ✅ |
| 6.2 | НП/Meest/УП + довідник + синк | ⚠️ json | ⚠️ live API | ✅ таблиця+синк | ⚠️ live API | ⚠️ синк Meest | ❌ | ⚠️ | ⚠️ лише НП |
| 6.3 | cod / wayforpay / bank_transfer | ✅ | ✅ | ✅ | ⚠️ свій flow | ✅ +liqpay | ⚠️ без w4p | ⚠️ | ⚠️ liqpay |
| 6.5 | success / failure / payment_retry | ✅ | ✅ | ✅ | ⚠️ | ⚠️ **retry 404** | ⚠️ | ✅ | ⚠️ |
| 6.6 | Сесія SameSite=None | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 6.7 | Гостьовий чекаут | гість | гість | OTP примусово | OTP примусово | гість | сток | гість | гість |
| 6.8 | Quick order | ✅ lead | ⚠️ лист | ✅ +замовлення | ❌ | ✅ fast_order | ❌ | ❌ | ❌ |
| 7.1 | seo_url: safe-list роутів + слаги | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ сток | ✅ | ✅ |
| 7.2 | СЕО-фільтри + canonical-політика | ⚠️ | ✅ | ⚠️ | – | ⚠️ | ❌ | ⚠️ | ⚠️ |
| 7.3 | Мовний префікс /ru/ + 301 | ⚠️ без 301 | ❌ сесія | ✅ | ⚠️ nginx hl | ❌ сесія | ❌ | ❌ сесія | ❌ сесія |
| 7.4 | hreflang | ✅ | ❌ | ✅ | ⚠️ | ❌ | ❌ | ❌ | ⚠️ той самий URL |
| 7.5 | canonical-фолбек | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ |
| 7.6 | OG/Twitter | ✅ | ⚠️ | ✅ | ✅ | ❌ | ❌ | ⚠️ | ❌ |
| 7.7 | schema.org (Org/WebSite/Product/FAQ/Breadcrumb) | ✅ | ⚠️ без Org/WebSite | ✅ | ⚠️ | ✅ | ❌ | ❌ | ⚠️ |
| 7.8 | Sitemap індекс+секції+xsl | ✅ +gallery | ✅ | ✅ | ⚠️ **не працює на nginx** | ❌ сток, 404 | ❌ видалено | ❌ сток | ⚠️ свій |
| 7.9 | noindex-гейт + robots-live | ⚠️ гейт у seo_meta | ⚠️ без чекбокса | ⚠️ **гейт не читається** | ⚠️ | ❌ (noindex у nginx!) | ✅ | ❌ robots битий | ❌ |
| 7.10 | Модуль seo_meta | ⚠️ сплячий | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 7.11 | Мета головної по мовах | ❌ | ⚠️ | ⚠️ нема uk | ⚠️ seo.json | ❌ | ❌ | ❌ | ❌ |
| 7.12 | Пошук ЧПУ /poshuk | ❌ | ❌ | ✅ | – | ❌ | ❌ | ❌ | ❌ |
| 7.13 | Пагінація canonical/prev-next/noindex sort | ⚠️ | ⚠️ | ✅ | – | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| 7.14 | 404 + noindex | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| 7.16 | Хлібні крихти скрізь | ✅ | ❌ | ⚠️ | ❌ | ✅ | ⚠️ | ⚠️ | ⚠️ |
| 8.1 | Єдиний рушій попапів hp-form-modal | ❌ | ⚠️ | ✅ | ❌ | ⚠️ ocOtp | ❌ | ❌ | ❌ |
| 8.2 | Тости hpNotify/hpToast | ❌ | ⚠️ hpToast | ✅ | ❌ | ⚠️ ocToast | ❌ | ❌ | ❌ alert() |
| 8.3 | Esc + бекдроп на всіх попапах | ⚠️ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ |
| 8.4 | window.hpCustomer автозаповнення | ⚠️ identity | ⚠️ | ✅ | ⚠️ | ⚠️ | ❌ | ❌ | ⚠️ |
| 8.5 | Форма питання + honeypot | ⚠️ | ❌ | ✅ | ❌ | ❌ | ❌ | ⚠️ | ⚠️ |
| 9.1 | Brevo HTTP API | ⚠️ | ✅ | ⚠️ | ⚠️ два стеки | ⚠️ | ❌ | ⚠️ mail.php не знає | ❌ |
| 9.2 | Лід-система oc_lead + sale/lead | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ⚠️ | ❌ |
| 9.3 | GA4 події + Consent Mode | ⚠️ | ⚠️ view_item | ⚠️ | ⚠️ consent ✅ | ⚠️ | ⚠️ | ❌ | ⚠️ 9 подій |
| 9.4 | Листи статусів uk/ru | ✅ | ❌ англ | ✅ | ❌ нема mail/ | ✅ | ✅ | ⚠️ uk англ | ⚠️ |
| 10.1 | Адмінка hp_panel | ✅ | ✅ | ✅ | ✅ | ❌ admin | ❌ admin | ✅ | ⚠️ shk_panel на проді |
| 10.2 | Дропдаун «Кеш» | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ devtools |
| 10.3 | Drag&drop лейауту | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| 10.4 | Стандарт адмін-форм | ✅ | ⚠️ | ✅ | ⚠️ | ⚠️ | ❌ | ⚠️ | ⚠️ |
| 10.5 | Marketplace/сміття прибрано з меню | ❌ | ⚠️ | ❌ | ❌ | ❌ | ⚠️ | ❌ | ❌ |
| 10.6 | Доставки картками + синк | ❌ | ❌ | ✅ | ❌ | ⚠️ | ❌ | ❌ | ⚠️ |
| 11.1 | Мовні файли uk/ru повні | ✅ | ✅ | ⚠️ | ❌ ru 15 файлів | ⚠️ | ✅ | ✅ | ⚠️ |
| 12.1 | Swiper self-host | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ CDN | ❌ CDN |
| 12.2 | Шрифти self-host woff2 + inline @font-face | ✅ | ⚠️ ttf | ⚠️ | ❌ Google | ❌ Google | ❌ | ⚠️ ttf | ❌ Google |
| 12.3 | Hero-відео data-hero-main | ✅ | ❌ preload=auto | ⚠️ | ⚠️ | ❌ | ❌ | ❌ | ⚠️ |
| 12.4 | Без bootstrap/jquery/FA | ⚠️ jq | ⚠️ jq | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| 12.5 | Мініфікація + ?v= | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ | ⚠️ | ✅ |
| 13.1 | Динамічний config + db.php | ❌ | ⚠️ | ❌ | ❌ | ✅ | ✅ | ❌ | ⚠️ **пароль у git** |
| 13.2 | deploy.sh | ❌ | ❌ | ✅ | ❌ | ❌ sftp-on-save | ✅ | ❌ | ❌ |
| 13.3 | .gitignore анкорований | ❌ | ✅ | ❌ | ⚠️ | ✅ | ✅ | ✅ | ❌ |
| 13.6 | ocmod-копії | – | – | – | – | ⚠️ 33, 2 stale | – | – | ⚠️ 6 |
| 13.7 | Блог | ⚠️ information/blog | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ extension/blog |

## Хто в чому еталон (звідки портувати)

- **hydrophob.ua** — UX-ядро: OTP без сторінок + `?auth=`, 302 стокових account/*, normalizePhone, мінікошик з порожнім станом і пропозиціями, «безкоштовно від N» + override тарифів, плитки з кнопкою і станами, category_reviews, модалка відгуку з email/тел/OTP(type=review), СЕО-фільтри з canonical-політикою (1 = index, 2+ = noindex), wayforpay `/pay`-обгортка, гостьовий вішліст → тост+auth.
- **hydrophob.net.ua** — СЕО/інфра: префікс `/ru/` + 301 зі старих `?language=`, hreflang, seo_meta (шаблони, noindex sort/limit), `/poshuk/<запит>`, canonical+prev/next, SameSite=None, hp-form-modal.js + hpNotify + `[data-toast]`, window.hpCustomer, question-форма з honeypot, лід-система, доставки окремими картками + синк НП/Meest у `oc_np_warehouse`, deploy.sh.
- **hydrophob.net** — продуктивність і дані: sitemap з gallery/video + XSL, schema Organization/WebSite/FAQPage, gtag-черга, HpMinify, woff2+inline @font-face, hero data-hero-main, oc_redirect, Merchant-фід, llms.txt/WebMCP, lead+fast_order, admin drag&drop. **Каталог (товари, ціни, скорочені назви) — еталон для ua / net.ua.**
- **autochemicals** — quick order з OTP-автореєстрацією і адмінкою fast_order, картки доставок на спільному twig, cart_related, live-search, динамічний config.php+db.php.
- **shokeru.in.ua** (донор) — ga4.js з 9 подіями, custom_scripts, extension/blog, мініфікатор з mtime, webp-конвертер, SEO-сорт слагами; але паролі в git.

## СЕО-URL і переклади — прогалини (прохід 2026-09-09)

### Мова в URL
- `/ru/`-префікс з 301: лише **netua** повністю; **net** має префікс, але без 301 зі старих `?language=`; **ua, auto, rc, shokeru** — мова в сесії (один URL на дві мови, ru не індексується, hreflang у shokeru показує один і той самий href); **comua** — `/ru`,`/en` живуть тільки як nginx-правило `hl=`, у репо його нема.
- hreflang: є на net, netua, comua; нема на ua, auto, rc, shk.

### seo_url.php
- Safe-list 301 з `index.php?route=`: net (27), ua (23), rc (23); netua/auto/shokeru — слаги роутів з `oc_seo_url`, без safe-list; shk/comua — стоковий.
- Фільтри в path: ua (`/katalog/<slug>[/<slug2>]`, повна canonical-політика), net/netua/rc (`/katalog/<slug>/sort-x/page-N`, canonical на чистий каталог/повну комбінацію, без noindex на 2+), auto (`brand-1_2`/`price-100-500`, без політики), shokeru (`filter=N` у path).
- Пошук ЧПУ `/poshuk/<запит>` + 301: лише netua.
- Пагінація: netua ✅ (canonical + prev/next + noindex sort/limit через seo_meta); решта — canonical з page без noindex на sort.
- Sitemap: net/ua/netua — індекс+секції+xsl (живі: net 5 секцій, ua 4, netua 4); **comua** — `/sitemap.xml` віддає HTML головної (rewrite з .htaccess не працює на nginx); **auto** — 404; **shk** — фід видалено, свого нема; **rc** — стоковий.
- noindex-гейт: **netua** — `config_noindex` існує тільки в адмінці, catalog його не читає, robots.txt бойовий; **net/ua** — гейт у коді, але robots.txt == robots-live.txt; **auto** — noindex стоїть у nginx (`add_header X-Robots-Tag`) з 2026-08-10 — магазин з 9687 товарами не індексується; **rc** — robots.txt без User-agent; **shk** — ✅.
- Мета головної по мовах: ніде за стандартом (`catalog/language/<code>/common/home.php`): netua має лише ru, uk-файла нема → фолбек на config_meta_title.

### Мовні файли (uk vs ru, по файлах і ключах)
| Проєкт | catalog | admin |
|---|---|---|
| net | 125/125 симетрично; 6 ru-файлів = копія uk (about_cta, about_intro, dealer_*, home_about — не перекладені) | hp_panel ru-ru: **2 файли** (адмінка ru нема) |
| ua | 119/119; 4 ru = копія uk (dealer_*) | hp_panel ru-ru: **3 файли** |
| netua | 96/94; uk без `common/home.php`, `common/global.php`; ru без `mail/order.php`; 12 файлів з розбіжністю ключів (register 14, checkout 4, mail/affiliate 6) | ru 150/248 uk: бракує 99 файлів, 40 з розбіжністю ключів (column_left 29, header 12) |
| comua | ru-ru **15 файлів** зі 144 (усі стокові роути на ru впадуть у ключі) | ru нема |
| auto | ru-ua 120/122 (нема faq, recentlyviewed); **69 ru = копія uk**, 55 ru англійською; 6 файлів з розбіжністю ключів (address 7, cart 3) | ru-ua: **0 файлів** |
| shk | 94/94/94; 10 ru = копія uk (voucher/forgotten/password — мертві) | ru-ru: **156 зі 158 англійською** |
| rc | 120/120; 13 ru = копія uk (about_*, dealer_*) | ru нема |
| shokeru | ru 106/122 (без blog/*, mail/order.php, shipping/novaposhta) | ru є |
- Скрізь 37–87 uk-файлів адмінки/каталогу — англійські стокові (affiliate, recurring, marketplace, openbay…) — мертві роути, кандидати на видалення, а не на переклад.
- Листи статусів замовлення: ua і rc шлють англійський стоковий `mail/order_add.php` (uk теж англ у rc); comua взагалі не має `catalog/controller/mail/`.

### Що перевірити в БД (окремо, за підтвердженням)
1. `oc_seo_url`: покриття по language_id (2 uk / 3 ru) для product/category/information/route у net, ua, netua; дублі keyword; слаги без ru-версії.
2. Паритет каталогу net (еталон) ↔ ua ↔ netua по `oc_product.model`: name/скорочена назва, price, meta_title/description, description по мовах, seo keyword, наявність ru-рядків у product_description/category_description.
3. `oc_review` — чи є колонки email/telephone (ALTER не в репо).

## Знайдені баги (живі)
1. **realchem.com.ua = HTTP 500** з 2026-08-14: у прод-корені лежить OpenCart-скелет, `config.php` → БД `realchem-oc`, в якій нема таблиць (`oc_translation doesn't exist`). Верстки на домені більше нема. Рішення за користувачем: повернути верстку з `main` або залити БД.
2. **autochemicals**: `wayforpay.php` редіректить на неіснуючий `checkout/payment_retry` → 404 після відхиленої оплати (перевірено живим curl). Плюс noindex на рівні nginx — уточнити, чи свідомо.
3. **hydrophob.com.ua**: `/sitemap.xml` віддавав HTML — ВИПРАВЛЕНО 2026-09-09 (nginx `location = /sitemap.xml { rewrite ^ /sitemap.php last; }` у 8080-блоці, бекап у /root/vhost-backups/); у робочому дереві незакомічений `TEST_MARKER_12345` у `hydrophob_product.php:29`.
4. **hydrophob.net.ua**: `config_noindex` не читається в catalog (гейт мертвий), `uk-ua/common/home.php` нема.
5. **shokeru.in.ua**: прод-пароль БД у `app_config.php` в git, `cookie.txt`, zip 29 МБ.
6. **hydrophob.ua**: `origin/main` (171 коміт «Changes») без спільної історії з локальним `main` (=verstka-legacy) — чужа лінія у тому ж репо.

## Що зроблено 2026-09-09
- Знято 7 html.* сабдоменів (CloudPanel-сайти + DNS), локальні worktree прибрано, знімки верстки закомічені (див. MEMORY кожного проєкту). `html.pprintdim.com` лишено (портфоліо-кейси pprintdim.com).
- hydrophob.ua: тема більше не тягне асети з html.* (коміт 329460a, задеплоєно); стрей `html-v2/` у прод-корені видалено.
- hydrophob.net.ua: origin виправлено на `pprintdim/hydrophob.net.ua`, 950 файлів OC-натяжки закомічено (c69c828).
- Сервер: бекапи vhost знятих сайтів видалено, 392 маківські `._*`/.DS_Store у прод-коренях netua/autochemicals прибрано.
