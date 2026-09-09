# hydrophob.net.ua — MEMORY

Оновлено: 2026-09-01

## Факти
- OpenCart 3.0.3.9, адмінка `hp_panel/`, тема `default` (натяжка з `html/` worktree).
- Мови: 2=uk-ua (основна), 3=ru-ru; en-gb вимкнена.
- Прод: root@46.224.100.254, сайт `/home/hydrophobnetua/htdocs/hydrophob.net.ua`,
  деплой `./deploy.sh` (без --delete; `--full` = з --delete).
- Локалка MAMP: порт **8893** (vhost додано 2026-09-01), БД спільна з продом
  через разовий ssh-тунель `-L 33066:127.0.0.1:3306`.
- `session_engine = db` — сесії в `oc_session`, не у файлах.
- Пошта Brevo HTTP API; OTP-логін/реєстрація через `common/user_popup`.

## Чекаут (2026-09-01)
- Односторінковий: вигляд з верстки, функціонал ланцюгом стокових ендпоінтів
  (див. 02-Knowledge/OpenCart3/checkout.md, розділ «Досвід hydrophob.net.ua»).
- Гостьовий чекаут вимкнено: примусова OTP-авторизація (тип `checkout`).
- Перевізники: НП (відділення/поштомат/кур'єр), УП і Meest (відділення/кур'єр),
  кур'єр, самовивіз. Одне поле призначення, підказки з `catalog/data/warehouses.json`.
- «З цими товарами також купують» в aside — той самий `hp_cart_related`,
  метод `aside()` (сітка 2 кол., «Показати ще» після 6).
- WayForPay — ТЕСТОВИЙ мерчант `test_merch_n1`, перед запуском замінити ключі.

## Незакрите
- Favicon з кольорів лого (юзер перервав «а стоп» — за запитом).
- WayForPay: досі тестовий мерчант.

## Кнопки кошика і сповіщення (2026-09-02)
- Кнопка доданого товару («В кошику»/«Додано») тепер ПРОСТО ВІДКРИВАЄ кошик:
  markButton підмінює onclick на hpOpenCart() (оригінал у data-orig-onclick,
  unmark повертає). ГРАБЛІ: document-click хендлер закривав щойно відкриту
  шухляду — виняток e.target.closest('.is-added').
- window.hpOpenCart() — публічне відкриття шухляди (панель + оверлей).
- refreshDrawer(true) вмикає оверлей у парі з панеллю (раніше після
  «додати в кошик» шухляда виїжджала без затемнення).
- ВСІ повідомлення про додавання — єдині тости: inline-AJAX з bootstrap-алертом
  на сторінці товару вирізано (addToCart → window.cart.add), compare теж тост.
- Стікери ХІТ (топ-8 бестселерів) + АКЦІЯ на сторінці товару поверх галереї;
  сердечко wishlist біля назви (було біле на білому — тепер #161616).
- Єдині чекбокси/радіо глобально (appearance:none, зелений checked з білою
  галочкою); виняток :not(.hpf__check) — у фільтрів свій малюнок.
- ГРАБЛІ ДЕПЛОЮ: тимчасові скрипти, вставлені sed-ом у footer.twig НА ПРОДІ,
  зникають після кожного deploy.sh (локальна версія їх не має) — вставляти
  повторно після деплою або тримати вставку локально.

## Статуси, SEO-модуль, wishlist (2026-09-02)
- Статуси замовлень перекладені uk (як .net) + ru; бекап у backups/.
- SEO-модуль seo_meta перенесено з .net і УВІМКНЕНО (на .net він сплячий):
  event `catalog/controller/common/header/before` → `apply` (applyOutput на
  .net порожній і з event `*/after` все одно не працює б — header рендериться
  раніше). apply: description лише якщо порожній; title — якщо порожній/без
  бренду. Налаштування в oc_setting code=module_seo_meta, JSON-ключі МАЮТЬ
  serialized=1 (без цього foreach по рядку → Warning line 447). Мова шаблонів
  перемаплена: .net uk=1 → наш uk=2. Потрібні таблиці oc_seo_meta_robots і
  oc_seo_meta_canonical (створені; без них Warning на кожній сторінці).
  Адмінка: Дизайн → «СЕО-мета (шаблони)».
- Мета актуалізовано: privacy/terms meta_title uk/ru, категорія 33 «Каталог
  засобів Hydrophob…», config_meta_title/description магазину.
- Каталог-корінь: дубль «Каталог/Каталог» прибрано (twig-умова в category.twig).
- Wishlist переписано: toggle/ids ендпоінти, сердечка червоні (is-active),
  без скролу вгору, бейдж на header__wishlist, тости; сторінка обраного
  використовує product-розмір мініатюр + placeholder. Гість — сесія, юзер — БД.

## ГРАБЛІ: розлогін після оплати WayForPay (2026-09-02)
- Причина: платіжка повертає покупця крос-сайтовим POST; сесійна кука без
  SameSite → браузер трактує Lax і НЕ шле її → нова порожня сесія
  перезаписує стару куку → «розлогінило».
- Фікс у catalog/controller/startup/session.php: Set-Cookie пишеться РУЧНИМ
  header() з `Secure; SameSite=None` (setcookie() там чомусь випльовував
  Lax попри правильні аргументи — не розгадано, вручну залізно).
- Детект https — по константі HTTPS_SERVER з config.php: настройки магазину
  на етапі startup/session ще НЕ завантажені (config_url пустий), а
  $_SERVER['HTTPS'] за проксі ненадійний.
- Кука OCSESSID ставиться у startup/session.php (роут), НЕ у framework.php
  (session_autostart=false для catalog). Після правок PHP-файлів стартапу —
  `systemctl reload php8.4-fpm` (opcache).
- Перевірка: крос-сайтовий POST на wayforpay/response зберігає session_id.

## ГРАБЛІ чистки: voucher у моделі замовлення (2026-09-02)
- Видалення extension/total/voucher зламало ВСІ замовлення: model/checkout/order
  addOrder/edit/delete вантажили цю модель — Fatal → checkout/confirm 500.
  Виправлено: всі load/виклики voucher вирізані з модели (сертифікати не
  продаються). При чистці стокових модулів ЗАВЖДИ grep-ити залежності в
  catalog/model, не лише controller.
- «З цими товарами також купують» у чекауті: 6 карток + «Завантажити ще»
  ajax-ом (aside?offset=N віддає partial), кнопка компактна (текст-лінк).

## Доставки окремими картками + чистка (2026-09-01/02)
- Адмінка: 4 окремі модулі доставки (extension/shipping/novaposhta|meest|courier|
  pickup) зі спільним twig hp_carrier.twig — статус (…_enabled) + вартість
  пишуться в СПІЛЬНИЙ setting code 'shipping_delivery'. Кнопки синку довідника —
  у картках НП і Meest (syncNp/syncMeest перенесені туди). Зведений admin
  delivery.php ВИДАЛЕНО; catalog model delivery (двигун) лишився, oc_extension
  'delivery' НЕ чіпати. Порожні catalog-моделі 4 перевізників — заглушки, щоб
  oc_extension-коди не клали checkout/shipping_method.
- Swiper self-host у vendor/ (CDN не встигав → «Swiper is not defined», слайдер
  товару мертвий); guard у product.js.
- Видалено мертве: api/voucher, total/voucher (+ з oc_extension/oc_setting),
  recurring/paypal|squareup, credit_card/*, mail/forgotten, mail/voucher.twig.
- Модуль hp_question_cta: CTA «Залишились питання?» + модалка питання одним
  модулем через лейаути (11 information, 14 faq); hardcoded CTA з faq/information/
  shipping.twig прибрано.
- Опис категорії: секція .seo-desc--category ПІСЛЯ товарів з «Показати більше»
  (сайдбарний блок і попап прибрано). Корінь /katalog (category 33) — окремий
  лейаут «Каталог (корінь)» з hp_about.35 через oc_category_to_layout.

## ГРАБЛІ: MutationObserver на body (2026-09-01)
- Два MutationObserver-и (subtree body, attributeFilter class/hidden/style)
  ПІДВІШУВАЛИ БРАУЗЕР: свайпер мутує інлайн-стилі щокадру анімації, кожна
  мутація ганяла querySelector-и. НЕ вішати обсервери на весь body.
  Заміна: скрол-синхронізатор — перевірка після click/Escape через rAF;
  філер форм — fill на DOMContentLoaded (попапи вже в DOM) + подія reset + focusin.

## Автозаповнення форм (2026-09-01)
- `window.hpCustomer` (footer.php → footer.twig) + філер у script.js: порожні
  поля name/firstname/lastname/email/telephone/contact у ВСІХ формах і попапах
  заповнюються даними залогіненого. Попапи ловляться MutationObserver-ом на
  відкриття (hidden/class). Введене руками не перетирається; телефон іде через
  intl-tel-input setNumber(). Заявки в sale/lead: форми quick/question/contact
  (дилерську з .net прибрано).

## Сповіщення й адмінка (2026-09-01)
- ЄДИНА система сповіщень: тости `.hp-toast` знизу, 3 с, хрестик, пауза при
  наведенні, стопка при кількох. API `window.hpNotify(text, 'ok'|'error')`
  у script.js; серверні — розміткою `[data-toast]`. Усі `.account__notice`
  і `alert()` переведені (8 шаблонів + otp.js).
- **Граблі**: у lead-моделі з .net був битий SQL `ENGINE=InnoDB DEFAULT COLLATE=...`
  (без CHARSET) — CREATE TABLE мовчки падав, форми віддавали Warning про
  відсутню oc_lead. Виправлено на `DEFAULT CHARSET=utf8mb4 COLLATE=...`.
- Прибрано: маркетплейс OpenCart із меню адмінки, сміттєвий модуль
  `s_shipping` (контролер+мова без моделі — ламав список розширень).

## Заявки з форм (2026-09-01)
- Перенесено lead-систему з .net: `catalog/model/tool/lead.php` (send+store),
  адмінка `hp_panel/controller|model/sale/lead.php` + lead_list/lead_info.twig,
  пункт меню «Заявки з форм», право sale/lead додано в oc_user_group (JSON_ARRAY_APPEND).
- Швидке замовлення і форма питання тепер дублюють заявку в `oc_lead`
  (форми 'quick' і 'question') — лист може не дійти, список лишається.

## НЕЗАКРИТЕ (черга)
- Попап-форми до єдиного вигляду (about_us і всі інші) — НЕ зроблено.
- Кнопки синхронізації довідників перенести на hydrophob.net / hydrophob.ua —
  інші проєкти, робити в їхніх сесіях.
- Meest: адреси відділень добираються ліниво, поки Cloudflare тримає 429.

## Кабінет і листи (2026-09-01)
- Замовлення: окремої сторінки НЕМАЄ — `account/order/info` редіректить на список,
  деталі вантажаться ajax-ом у самому рядку (`account/order/details` →
  order_details.twig), як на .net. Листи ведуть на `account/order#order-N`.
- **УВАГА (граблі)**: `git checkout -- <file>` у цьому репо відкочує до СТАРОЇ
  версії з коміту і знищує зміни сесії (product.twig: 812 → 271 рядок).
  Відновлювати з прода: `scp root@46.224.100.254:<шлях> .`
- Глобально: `input[type=radio|checkbox]` тепер не підпадають під стилі текстових
  полів (були 56px висоти й 100% ширини — ламало «Основну адресу» і фільтри).
- Адреси більше не дублюються після кожного замовлення: payment_address/save і
  shipping_address/save шукають наявну за city+address_1 перед addAddress.
- Чекаут підставляє з адреси покупця місто, поле призначення І спосіб отримання
  (branch/postomat/courier визначається за текстом адреси).
- Сповіщення сторінки адрес — тости (.hp-toast): зникають за 3 с, є хрестик.

## Довідники перевізників (2026-09-01)
- **Укрпошту прибрано з проєкту**: address-classifier-ws вимагає Bearer-токен
  (401 без нього, видається за заявкою), на data.gov.ua лише реєстр одного міста.
  Видалено з checkout.php, model/shipping/delivery, JS DEST_TYPES, адмінки
  (twig+controller+мова) і з oc_setting (shipping_delivery_ukrposhta_cost).
- **Кнопки синхронізації** в модулі Доставка (hp_panel/extension/shipping/delivery):
  `syncNp` (порційно по 500, page=N) і `syncMeest` (по 15 міст, offset=N).
  Тягнуть порційно з фронту, щоб не впертись у max_execution_time; перша порція
  чистить свій carrier. Показують лічильник точок у help-block.
- **Ключі не потрібні**: і НП (`AddressGeneral/getWarehouses`, apiKey:''), і Meest
  (`publicapi.meest.com/branches`) віддають довідники БЕЗ авторизації. Поле
  «API-ключ НП» прибране з модуля delivery (twig+controller+мова) і з oc_setting.
- Meest: 5 162 точки (3 029 відділень + 2 133 поштомати) по 400 найбільших містах.
  Списковий виклик НЕ віддає адресу — лише номер і тип; адреса приходить окремим
  запитом `/branches/{br_id}`, який Cloudflare ріже 429 (error 1015) на серіях.
  Тому добір адрес ЛІНИВИЙ: warehouse_suggest добирає до 12 адрес для міста,
  яке реально запитали, і зберігає в БД. Масовий скрипт — /root/meest-addr.php
  (лишити на потім, коли ліміт відпустить).
- Таблиця `oc_np_warehouse` має колонку `carrier` (novaposhta|meest); фронт шле
  `carrier` з коду методу доставки.

## Довідник Нової Пошти (2026-09-01)
- **Довідкові методи API НП працюють БЕЗ ключа** (`AddressGeneral/getWarehouses`,
  apiKey: ''). Ні на .net, ні у well ключа не знайшлось — він і не потрібен.
  ВАЖЛИВО: з локальної машини запит не проходить (мережа), з сервера — 200.
- Довідник імпортовано в `oc_np_warehouse`: 54 322 точки (14 940 відділень +
  39 382 поштомати), 9 689 міст. Скрипт імпорту — `/root/np-warehouse-import.php`
  на сервері (TRUNCATE + постранично 500/запит, ~109 сторінок). Перезапускати
  раз на кілька місяців.
- `tool/city` і `extension/module/warehouse_suggest` читають з цієї таблиці
  (ru-версії з `city_ru`/`description_ru`), файли cities.json/warehouses.json
  лишились запасним варіантом.
- Файл cities.json був побитий: назви з апострофом розвалені на уламки
  («Кам», «янськ», ", "). Перегенеровано на 243 міста.

## Закрито 2026-09-01 (третя частина)
- Сайдбар каталогу: акордеон лише на «Розділах каталогу»; популярні товари й
  опис категорії завжди відкриті. «Читати більше» в описі відкриває попап (.cdm).
- Пошук: ЧПУ повністю — /poshuk/<запит>/<фільтр>/sort-x/page-N, 301 з ?search=.
  Фільтри на пошуку раніше клеїлись до ?search= і ламали URL — виправлено
  через filter_seo_base.
- FAQ-сторінка: акордеони не мали JS взагалі; додано + модалка «Поставити
  питання» з бекендом information/question/send (honeypot + пауза 30с, Brevo).
- Чекаут: перемикач «Новий покупець / Я вже маю акаунт» (вхід — OTP тип login,
  після коду reload з підставленими контактами), sticky-підсумок, маргіни.
- hp_cart_related: додано джерело «купували разом» з oc_order_product
  (order_status_id > 0), далі related, далі сусіди по категорії.
- Телефон: countryOrder з 'ua' першою — інакше Enter у пошуку країн обирав
  Afghanistan (перший у списку); порожнє поле на blur повертається до UA.
- Відступ до футера 104px уніфіковано (.main > section/div/.container:last-child
  + .hm-sec:last-child).

## Закрито 2026-09-01 (друга частина)
- Сторінки статусу: `checkout/success` + `checkout/failure` + `checkout/payment_retry`
  у власній верстці (.status), GA4 purchase на success.
- ВАЖЛИВО: наш wayforpay.php викликав `isPaymentPaid`/`markPaymentPaid`, яких НЕ БУЛО
  в моделі checkout/order — оплата карткою впала б фаталом. Методи перенесені
  (+ таблиця oc_order_payment_status створюється автоматично).
- Прибрано битий лінк account/forgotten (вхід через OTP).
- OG/Twitter теги + canonical-фолбек у common/header; schema.org Organization+WebSite
  (common/schema.php, рендер із футера); robots.txt переписаний.
- privacy/terms наповнені (uk/ru/en), «Доставка та оплата» перекладена на ru.
  Згортання тексту лишилось лише на id 4 і 6 (юридичні читаються цілком).

## Закрито 2026-09-01
- Тестові замовлення №12, №13 і тест-клієнта видалено (бекап рядків —
  backups/backup-testorders-*.sql, локально).
- У oc_customer лишились 6 спам-реєстрацій сканера (lxbfYeaa / testing@example.com,
  2026-07-04) — не мої, чекають рішення юзера.
- Сайдбар каталогу: блоки-акордеони згорнуті (популярні товари — завжди відкриті),
  сайдбар більше не sticky і не обмежений висотою.
- Мінікошик винесено в body (був під оверлеєм через stacking context хедера),
  пустий стан: вужча панель 430px, стан по центру, темні кольори.
- Пошук: 301 з index.php?route=product/search на /poshuk, sort/page сегментами
  (/poshuk/sort-price_desc?search=…, /poshuk/page-2?search=…), форма шле на ЧПУ.
- E2E чекаут пройдено повністю (OTP checkout-тип → адреси → доставка → оплата →
  confirm → cod/confirm → success; замовлення №13 в БД коректне).
- Дубль «також купують» знизу чекауту знято (DELETE oc_layout_module id=97,
  на лейауті кошика модуль лишився).
- Поле призначення зʼявляється лише після вводу міста; самовивіз — без полів.
- Плейсхолдери глобально сірі/400 (стоковий reset фарбував їх у жирний чорний).
- Затемнення поверх меню для всіх попапів (side-overlay z105; пошук — подвійний
  шар ::after в хедері).
- Відступи вирівняно: секції 64/104 (search-page, faq-page підтягнуті), глобальний
  бекстоп .main > .container:last-child{padding-bottom:104px} замість подвійного 72.

## 2026-09-09 — html-сабдомен верстки знято
- Верстка = гілка `html` репо **pprintdim/hydrophob.net.ua** (знімок `ee2f57d`, css розлінковано з теми — файли, не симлінки). УВАГА: локальний origin раніше вказував на `hydrophob.com.ua.git` (це перейменований hydrohub-landing) — виправлено на `hydrophob.net.ua.git`. OpenCart-робота (950 файлів) закомічена `c69c828` у main.
- Сайт `html.hydrophob.net.ua` видалено з CloudPanel (site user теж), A-запис `html` у зоні Hetzner видалено. Локальний worktree верстки прибрано; deploy.sh верстки більше нема.
- Верстку дивитись через git: `git show <гілка>:<файл>` або тимчасовий `git worktree add /tmp/wt <гілка>` (прибрати після).

## 2026-09-09 — СЕО зведено до спільного стандарту
- **Гейт індексації ожив**: ключа `config_noindex` не було в `oc_setting` взагалі, тому селект у Дизайн → СЕО-мета робив UPDATE «в нікуди», а `catalog/controller/common/header.php` його не читав. Тепер ключ є (INSERT), header віддає meta robots + `X-Robots-Tag`, а перемикач продубльовано в Налаштування → Сервер. `robots-live.txt` створено (копія бойового robots.txt).
- **Canonical-політика фільтрів** (як у hydrophob.ua): 0 фільтрів — self-canonical; 1 — self-canonical + власні title/description від назви фільтра (`meta_title_filter`/`meta_description_filter` в обох мовах); 2+ — `X-Robots-Tag: noindex, follow` + canonical на `/katalog`. Перевірено живим curl обома мовами.
- `seo_meta::apply` більше не перетирає строгіше правило контролера: якщо в реєстрі вже стоїть noindex, шаблонне «index» його не замінює.
- 404 віддає явний `noindex, follow` (і в meta, і в заголовку).
- **Sitemap**: у секцію pages додано 9 сторінок одиночних фільтрів. hreflang для ru у карті вже був (`xhtml:link` на кожному URL) — тривога про «ru поза картою» не підтвердилась.
- **Мовні файли**: додано 6 ключів, яких не було в ЖОДНІЙ мові, хоча контролери їх запитують (`information/contact` text_message, `product/product` + `extension/total/shipping` error_product, `common/header` text_logged, `account/address` text_login, `account/account` error_login_required).
- `tools/unify-seo-20260909.sql` — ідемпотентний (ключ config_noindex, таблиці seo_meta_robots/canonical, право design/seo_meta). Застосовано на проді.
- Бекап БД перед роботою: `backups/backup-db-hydrophobnetua-20260909*.sql.gz` (локально, md5 звірено, з сервера прибрано).
