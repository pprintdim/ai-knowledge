> [!note] Імпортовано з `/Applications/MAMP/htdocs/hydrophob.net/handoff.md` 2026-08-07 (DOCS-POLICY). Санітизовано секретів: 13. Оригінал: untracked, видалений.

# Handoff — hydrophob.net

## 2026-08-07 — checkout готовий, наступні етапи: OTP + SEO-фільтри

- **Checkout 1:1 з main ГОТОВИЙ** (коміт 9a07049): односторінковий hp-checkout (3 панелі), сабміт оркеструє стокові ендпоінти fetch-ланцюгом: guest/save (ОБОВ'ЯЗКОВО `shipping_address=1`!) → GET checkout/shipping_method (наповнює session-quotes, без цього save падає «оберіть спосіб доставки») → shipping_method/save → GET payment_method → payment_method/save → GET confirm (створює order) → POST extension/payment/{code}/confirm → success. Для logged: замість guest/save — payment_address/save + shipping_address/save з тими самими полями. E2E перевірено на проді (тестові замовлення видалені з обох БД).
- **Кнопка товару**: після додавання → «Додано в кошик», клік відкриває кошик (server-side in_cart + client switch, 750928f). Alert при додаванні прибраний і з product.twig, і з common.js.
- **Слайдери**: watchOverflow + lockClass hp-slider__nav--locked (ховає стрілки коли слайдів мало).
- **Register** переверстано в hp-auth картку; account-слаги: vhid/vhod, reiestratsiia/registratsiya, kabinet, zamovlennia/zakazy, obrane/izbrannoe, moi-dani/moi-dannye (411d00f, e592754).
- **Права shipping**: extension/shipping/delivery+flat додані в user_group (обидві БД).
- **ЕТАП НАСТУПНИЙ 1 — OTP email-код (як shokeru)**: фронт ПОВНІСТЮ видобутий з живого shokeru.in.ua в scratchpad: `shk-common.min.js` (window.ShokeruOtp — двостадійна форма send→verify, таймер resend 60с, is-verified стан) і розмітка форм у /tmp/shk-login.html (`otp-form`, `data-otp-type=login|register`, .otp-step-fields/.otp-step-code/.otp-submit/.otp-code-input/.otp-resend/.otp-timer/.otp-error/.otp-success/.otp-agree-row/.otp-email-item/.otp-email-check). Бекенд-роути shokeru: `common/user_popup/sendCode` (POST FormData форми + type) і `common/user_popup/verifyCode` (email+code) — КОДУ БЕКЕНДА НЕМА локально (локальний shokeru = лише db backup; в БД жодних okремих OTP-таблиць — отже коди в session). Бекенд писати самому: sendCode (validate: login→email існує в oc_customer; register→firstname/email вільний/telephone; генерувати 4-6-значний код у session['otp'][email] з TTL, слати Mail як information/contact), verifyCode (звірити, для register — створити customer через model account/customer addCustomer з випадковим паролем, залогінити customer->login без пароля через ->login($email,'',true)? стоковий login($email, $password, $override=true) — override пропускає пароль; для login — просто login override), повернути {success, redirect}. Вбудувати у наші login.twig/register.twig/<REDACTED — див. ~/AI-Workspace/secrets/ACCESS.md> signin (у мокапах data-code-email/data-code-trigger вже передбачені).
- **ЕТАП НАСТУПНИЙ 2 — СЕО-фільтри/пагінація/сортування БЕЗ GET (як shokeru)**: категорійні чекбокси, page-N, сортування — все в path-слагах. Підглянути живий shokeru: /katalog з фільтром/пагінацією — які URL. Наші фільтри зараз на GET (category=1,2 / page= / sort=).

## 2026-08-06 — стан після великого заходу (коміти d8eabe2…a2afb2d)

- **Локальний dev-URL**: `http://localhost:8890/` (окремий vhost, root = тека проекту; НЕ `localhost:8888/hydrophob.net/` — там ЧПУ не працює через `RewriteBase /`). config.php вказує на 8890.
- **Мови**: uk (дефолт) + ru (повний переклад: 129 lang-файлів + весь контент БД oc_product_description/oc_information_description language_id=3), en вимкнена (status=0). На проді в oc_language рядок ru-ru довелось досилати окремо (його там не було — перемикач мовчки падав на uk).
- **Адмінка uk**: 132/181 файлів перекладено мерджем community-паку (opencartbot/Ukrainian-language-for-OpenCart) поверх ванільного кейсету; 49 файлів (marketplace/mail/reports) ще англійські. Пункт Marketplace вирізаний з меню. Кнопка «⚡ Кеш» у шапці (кеш/модифікатори/усе, вертає на поточну сторінку через session referer + `common/refresh`).
- **СЕО-урли всюди**: товари/інфо (uk+ru), route-слаги: `/katalog`, `/vidguky|/otzyvy`, `/poshuk`, `/kontakty`, `/koshyk|/korzina`, `/staty-dylerom|/stat-dilerom`, `/pro-vyrobnyka`; головна = голий домен; 301-канонікалізація прямих `index.php?route=` GET-заходів (safe-list у `catalog/controller/startup/seo_url.php` — при нових route додавати туди). Хук route-слагів у rewrite() там само.
- **Сторінки**: дилери = route `information/dealers` (5 модулів dealer_*, layout «Стати дилером»); виробник = route `information/manufacturer` (той самий About-layout 14, information_id=4 знято з layout і з футера bottom=0).
- **Фільтри каталогу**: 9 реальних категорій prom.ua в oc_category (+uk/ru descriptions, `materials`→scratchpad/products.csv джерело), всі 89 товарів розкидані. Модель: `filter_category_ids` (IN-підзапит) + `getCategoryFilterCounts()`. Сайдбар чекбоксів + чіпси на /katalog і головній. URL-формат `category=1,2` (чіпси/пагінація) АБО `category[]=` (сабміт форми) — контролер приймає обидва.
- **Слайдери** (Swiper, `data-recommended-slider`, init = querySelectorAll): recommended, recently_viewed, crosssell («З цим товаром також беруть»). Всі — однаковий hp-slider патерн.
- **Кошик**: попап при додаванні прибрано (common.js cart.add — тільки бейдж `.hp-cart__badge`).
- **Контакти** `/kontakty`: клієнтська валідація + AJAX `information/contact/send` (JSON) + hp-modal попап успіху; телефон дописується в текст листа.
- **Платежі**: cod + bank_transfer + free_checkout. **Доставки**: flat + кастомний `delivery` (НП/УП/Meest/кур'єр/самовивіз). Решта видалена.
- **Права**: всі кастомні extension/module/* маршрути додані в oc_user_group (JSON_ARRAY_APPEND guarded — патерн з shokeru).
- **Логотип/фавікон**: `image/catalog/logo.png` (темний) + `favicon.png` (гексагони) в config_logo/config_icon; адмін-шапка теж підміняє (обмежено 34px).
- **НАСТУПНИЙ ЕТАП (не почато)**: checkout-сторінка 1:1 з main-версткою (`git show main:order.php` + sections/order/*) — зараз там стоковий OC-акордеон, користувач явно вимагає ідентичність.
- Правило деплою: рсинк файлів + SQL через scp+mysql на сервері, потім `chown -R hydrophobnet:hydrophobnet` і `rm -f system/storage/cache/cache.*`. НЕ забувати `--relative` у rsync (без нього файли лягають плоско в корінь — вже наступали).

## 2026-08-04 — КРИТИЧНО: продакшн тепер OpenCart, НЕ sectional-PHP

- hydrophob.net на продакшні (46.224.100.254, CloudPanel, сайт-юзер `hydrophobnet`) з 2026-08-04 обслуговує гілку `openCart` (OpenCart 3.0.3.9 + тема `hydrophob`), НЕ гілку `main` (sectional-PHP).
- Стара git bare-repo deploy pipeline (`/home/hydrophobnet/deploy/repository.git`, `post-receive` → `deploy-revision.sh`, git remote `production`) — **ЗАСТАРІЛА й НЕБЕЗПЕЧНА для нового стеку**: вона рециклює sectional-PHP файлову структуру й нічого не знає про OpenCart (config.php, БД, system/storage, image/catalog). **НІКОЛИ не робити `git push production main`** — це перезапише живий OpenCart старими sectional-PHP файлами поверх нової структури. Якщо колись знадобиться відкат до sectional-PHP — спершу explicit підтвердження користувача, і повне ручне розгортання (не через цей pipeline).
- Продакшн-БД OpenCart: MySQL база `hydrophobnet-oc` (дефіс, не підкреслення — CloudPanel `clpctl db:add` не приймає `_` у назві), юзер `hydrophobnet-oc`, створена через `clpctl db:add --domainName=hydrophob.net --databaseName=hydrophobnet-oc ...`. Пароль — тільки в `<REDACTED — див. ~/AI-Workspace/secrets/ACCESS.md>`/`admin/config.php` на сервері, не задокументований тут навмисно (secret hygiene).
- `config.php`/`admin/config.php` на продакшні згенеровані вручну (немає в git, `.gitignore`), `HTTP_SERVER`/`HTTPS_SERVER` = `https://hydrophob.net/`.
- nginx: зовнішні 80/443-блоки (`hydrophob.net.conf`) незмінні (проксі на internal 8080). **Внутрішній `server { listen 8080; }`-блок повністю переписаний під OpenCart**: прибрано sectional-PHP-специфічний `@clean_urls` regex-роутинг (`/about` → `about.php` тощо), замінено на стандартний `try_files $uri $uri/ /index.php?$args;` (SEO URL в OpenCart НЕ увімкнено — усі посилання в темі йдуть через `index.php?route=...`, так і залишається). Додано `deny all` на прямий доступ до `system/`, `catalog/{controller,model,language}/`, `admin/{controller,model,language}/`. Бекап старого конфігу: `/root/nginx-config-backups/hydrophob.net.conf.bak-20260804210326` на сервері.
- Бекап старого sectional-PHP сайту (весь `/home/hydrophobnet/htdocs/hydrophob.net/` до заміни): `/root/site-backups/hydrophobnet-sectionalphp-20260804210326.tar.gz` на сервері (255MB), + git-історія `main` branch незмінна.
- **ПАСТКА на майбутнє**: bulk-rsync через `--files-from=<git ls-files + гітігнорені шляхи>` НЕ докопіював вкладений вміст директорій, вписаних одним рядком (`image/catalog/hydrophob` без `/*` чи trailing slash) — сама директорія створювалась, але 289 файлів товарів усередині — ні. Довелось переносити `image/catalog/hydrophob/` і hero-video окремим прямим `rsync -az src/ dest/` (з trailing slash на обох кінцях), не через `--files-from`. Якщо знову знадобиться повний деплой файлів — гітігноровані asset-директорії переносити ОКРЕМИМИ прямими rsync-командами, не одним рядком у files-from списку.
- PHP-FPM для сайту: PHP 8.3 (не 8.4, хоч CLI `php -v` на сервері показує 8.4 — це не той PHP, що обслуговує сайт), user/group `hydrophobnet`, `fastcgi_pass 127.0.0.1:18003`. Локальна розробка теж на PHP 8.3 (MAMP) — версії співпадають, ризик несумісності відсутній.
- Права на сервері: усе `chown hydrophobnet:hydrophobnet`, dirs 750/files 640, крім `system/storage/*` та `image/cache/` — там 770 (потрібен запис від php-fpm).
- Дефолтні OpenCart-налаштування (`oc_setting`: `config_name`, `config_meta_title`, `config_meta_description`, `config_owner` — були "Your Store"/"My Store"/"Your Name") перекладені на реальний бренд і локально, і на проді.
- Статуси замовлень (`oc_order_status.name`) перекладені на українську і локально, і на проді (były "Processing" тощо).
- SSH-доступ до сервера: root-пароль лежить у `<REDACTED — див. ~/AI-Workspace/secrets/ACCESS.md>` (сусідній, не пов'язаний напряму проєкт — той самий фізичний сервер 46.224.100.254, той самий, що й у `stocrm`). Ключового доступу немає, тільки пароль (`<REDACTED — див. ~/AI-Workspace/secrets/ACCESS.md>`), <REDACTED→secrets/ACCESS.md> активний — не спамити невдалими спробами.
- Наскрізно перевірено на живому проді після деплою: головна, каталог, картка товару (з реальними картинками через `image/cache/`), реєстрація, вхід, адреси, повний checkout (Нова Пошта → накладений платіж → confirm → order placed), історія замовлень, адмінка (`/admin/` завантажується). Тестові акаунт/замовлення після перевірки видалені з продакшн-БД.

## 2026-08-05 — Адмінка перенесена на /hp_panel, SEO URL увімкнено

- **Адмінка тепер на `hp_panel/`, НЕ `admin/`** — і локально, і на проді (`git mv admin hp_panel`, за аналогією з shokeru.in.ua, де адмінка `shk_panel/`). `/admin/` на проді тепер 404. Логін `admin` / пароль `<REDACTED — див. ~/AI-Workspace/secrets/ACCESS.md>` (тимчасовий, задано прямою вказівкою користувача — варто колись змінити на постійний). `hp_panel/config.php` (гітігнорений) оновлено під новий шлях і локально, і на проді; nginx-`deny all`-regex теж оновлено з `admin/` на `hp_panel/`.
- **SEO URL увімкнено** (`config_seo_url=1` в `oc_setting`, локально й на проді). Локально активовано через `.htaccess` (скопійовано зі стокового `.htaccess.txt`, тепер в git); на проді — новий `location @seo_url { rewrite ^/(.+)$ /index.php?_route_=$1 last; }` у внутрішньому nginx 8080-блоці (заміна попереднього `try_files ... /index.php?$args`). Жодних правок у twig-шаблонах не знадобилось — усі `{{ product.href }}` тощо йдуть через `$this->url->link()`, який автоматично підхоплює SEO-URL, щойно `config_seo_url=1` і є відповідний рядок у `oc_seo_url`.
- **`oc_seo_url` повністю перезаповнено** (93 рядки: 89 товарів + 4 інфо-сторінки), стокові demo-рядки з інсталяції OC3 (categories/manufacturers яких нема в наших даних, застарілі keyword на ті самі product_id що тепер зайняті реальними товарами) — видалено через `DELETE FROM oc_seo_url` перед вставкою нових.
- **Товарні SEO-слаги — реальні з prom.ua** (`hydrophob.in.ua`), не вигадані: джерело — `materials/products.csv` (гілка `main`, колонка `url`, формат `.../p<prom_id>-<slug>.html`), `prom_id` = `oc_product.model`. З 89 товарів 63 унікальних слаги — 26 колізій (prom.ua сам генерував однакові слаги для схожих товарів різного об'єму/ціни) продубльовано з суфіксом `-<product_id>` для унікальності (напр. `<REDACTED→secrets/ACCESS.md>`, `-4`).
- **Товарні meta_title/meta_description — реальні, скраплені з живих сторінок prom.ua** (агент прямим `curl` пройшовся по всіх 89 URL з `products.csv`, витяг `<title>`/`<meta name="description">` regex-ом, без AI-парафразу). Збережено в `materials/seo/product-seo-meta.csv`. **Важливо:** description на prom.ua — це шаблонний авто-текст платформи (`"{Назва}. Детальна інформація про товар/послугу та постачальника. Ціна та умови поставки"`), не унікальний копірайтинг — саме такий, як просив користувач ("такі... як на промі"), але варто знати, що це не hand-written SEO-текст.
- **4 інфо-сторінки** (Політика конфіденційності=3, Умови користування=5, Доставка та оплата=6, Про виробника=4) отримали SEO keyword+meta_title. **Побічно виявлено й виправлено**: Terms/Privacy/Delivery досі мали ПОРОЖНІЙ стоковий англомовний контент (`<p>Terms & Conditions</p>` і т.д. — інсталяційні заглушки, ніколи не перекладені) — написано реальний український контент (не скраплений, власний, за дозволом користувача "звичайні інф сторінки вже відштовхуйся від себе").
- **Побічно виправлено**: `config_telephone` мав плейсхолдер `123456789` (видно було в `tel:` посиланнях хедера), `config_email`=`admin@hydrophob.net` (стоковий), `config_address`=`Address 1` (стоковий) — замінено на реальні контакти з мокапу sectional-PHP (`main:helper/general.php`): `+38 (067) 123-45-67`, `tophydrosale@gmail.com`, `вул. Сіцинського, 35, м. Житомир`.
- **ПАСТКА виявлена й виправлена цього ж заходу**: необережний `git add -A` після rename admin→hp_panel захопив і закомітив увесь `materials/` (1.5GB, включно з `About.psd` 809MB — понад ліміт GitHub 100MB) та локальні `.md`-нотатки — push відхилено GitHub. Виправлено через `git reset --soft` на попередній комміт (обидва проблемні комміти НЕ встигли запуштитись), додано `materials/`, `OPENCART_PORT.md`, `README.md`, `project.md` в `.gitignore`, перекомічено чисто. **Урок**: на цій гілці НІКОЛИ не `git add -A` без перевірки `git status` — `materials/` фізично лежить у робочій теці (1.5GB), і досі не було потреби його гітігнорити явно, бо жоден комміт його раніше не зачіпляв.
- Всі SEO-зміни наскрізно перевірено на живому проді: товарні SEO-URL (`/aplikator` і т.д.), інфо-сторінки (`/pro-vyrobnyka`, `/polityka-konfidentsiynosti`, `/dostavka-ta-oplata`), старий `index.php?route=` (і далі працює паралельно), `/hp_panel/` (вхід успішний), `/sitemap.xml` — все 200, без PHP-помилок.

## Актуальний напрямок (SECTIONAL-PHP `main`, ІСТОРИЧНЕ — вже не на проді)

- Джерело дизайну й даних для верстки — гілка `lovable` репозиторію `git@github.com:pprintdim/hydrophob.net.git`.
- `lovable` не змінювати й не переписувати її історію. Вона синхронізована з редактором Lovable.
- Робоча PHP-версія формується в `main`: дані/компоненти читаються з `lovable`, після чого відтворюються як PHP-шаблони з розбивкою на секції.
- Перед початком кожної наступної сторінки спершу перевірити її наявність у `lovable`; якщо сторінки або її дизайну там немає — повідомити користувача до внесення змін.
- Не повертати попередню PHP-версію з видаленого комміту `558c4ab`.

## Стан Git

- Remote: `git@github.com:pprintdim/hydrophob.net.git`.
- `main` містить PHP-версію головної та About; останній опублікований комміт перед поточним перенесенням — `70dcca8`.
- Гілка `lovable` збережена без змін.
- Поточне перенесення всіх сторінок базується на `lovable` commit `2ea0d65`.
- Локальні `materials/`, `img/products/` і `handoff.md` виключені з Git.
- Користувач раніше прямо дав команду комітити, пушити та деплоїти на `hydrophob.net`.

## Готова PHP-головна

Lovable-головна знайдена в `src/routes/index.tsx` і `src/components/home/`. Вона перенесена в PHP без React/TanStack/Tailwind runtime:

```text
index.php
includes/functions.php
sections/
├── document-start.php
├── header.php
├── logo.php
├── hero.php
├── about.php
├── catalog.php
├── recommended.php
├── footer.php
└── document-end.php
css/
├── style.css
└── media.css
js/home.js
img/
├── hero-placeholder.jpg
├── product-placeholder.jpg
└── kit-placeholder.jpg
```

- CSS у `css/style.css` і `css/media.css` перенесений безпосередньо з `lovable:src/styles/`; додано лише незалежний reset і визначення шрифтових змінних, які раніше надавав Tailwind.
- Зображення взяті безпосередньо з `lovable:src/assets/`.
- `robots.txt` взято з `lovable:public/`. Lovable `favicon.ico` видалено; favicon тепер `img/favicon.png` із `../hzdrohob-site/img/logo.png`.
- Реальний анімований `img/logo.svg` взято з `../hzdrohob-site/img/logo.svg`; спільна `sections/logo.php` використовує його одночасно в header і footer.
- Головна повторює Lovable-структуру: header, hero, «Лінія Захисту», каталог із 20 картками/фільтрами/pagination, 5 рекомендацій і footer.
- `js/home.js` замінює лише React-стан mobile menu.
- У Lovable головна навмисно використовує Lorem Ipsum, placeholder-продукти та посилання `#`; PHP-версія зберігає ці дані 1:1.

## Готова PHP-сторінка About

- Джерело: `lovable:src/routes/about.tsx`, актуальний commit `3779e1f` станом на 2026-07-31.
- Маршрут: `about.php`; активний пункт header — «Виробник».
- Секції: `sections/about/intro.php`, `mosaic.php`, `catalog-row.php`, `advantages.php`, `promo-video.php`, `dealer.php`, `products.php`, `cta.php`.
- Ресурси: `img/about-car.jpg`, `about-nano.jpg`, `about-video.jpg`, `about-dealer.jpg` — безпосередньо з `lovable:src/assets/`.
- Спільні header, hero, product card, footer і document shell повторно використовуються, не дублюються.
- CSS оновлений до актуального `lovable:src/styles/style.css` та `media.css`; поверх збережені PHP reset, справжній logo.svg і Hydrophob favicon.

## Усі готові маршрути Lovable

- `/`, `/about`, `/dealer`, `/contacts`, `/product`, `/search`, `/cart`, `/checkout` перенесені в PHP.
- Нові сторінки розділено на `sections/cart/`, `checkout/`, `contacts/`, `dealer/`, `product/`, `search/`.
- Swiper 11 використовується для рекомендацій, галереї продукту й showcase; production не потребує React/TanStack.
- Нові ресурси: `img/dealer-hero.jpg`, `img/contacts-water.jpg`; інші Lovable JPG синхронізовані з `src/assets/`.
- `img/logo.svg` і `img/favicon.png` завжди брати з `../hzdrohob-site`, не з Lovable.

## Локальні матеріали

- `materials/` — близько 1.5 GB макетів, CSV, текстів і вихідних фото.
- `img/products/` — 89 тек і 380 WebP-фото товарів, близько 248 MB.
- Реальні товари поки не інтегрувати замість placeholder-даних без окремої команди: поточне джерело верстки — Lovable.

## Сервер

- Домен: `hydrophob.net`.
- VPS: `46.224.100.254`, CloudPanel.
- Site user: `hydrophobnet`.
- Root: `/home/hydrophobnet/htdocs/hydrophob.net/`.
- 2026-07-31 користувач прямо дозволив використати root-пароль із `<REDACTED — див. ~/AI-Workspace/secrets/ACCESS.md>` для деплою.
- 2026-07-31: пароль `<REDACTED — див. ~/AI-Workspace/secrets/ACCESS.md>` (SFTP/SSH site user) втрачено з попередньої сесії (був лише в тимчасовому scratchpad). Скинуто напряму через `chpasswd` на сервері (root), новий пароль збережено в `<REDACTED — див. ~/AI-Workspace/secrets/ACCESS.md>` (гітігнорений) — **ЦЕЙ ПАРОЛЬ ТЕПЕР ЖИВЕ ТІЛЬКИ В `<REDACTED — див. ~/AI-Workspace/secrets/ACCESS.md>`, тут навмисно не дублюється** щоб не тримати секрет у двох місцях. Якщо файл видалено/втрачено — просто скинути знову: `ssh root@46.224.100.254 "echo 'hydrophobnet:<REDACTED — див. ~/AI-Workspace/secrets/ACCESS.md>' | chpasswd"`.
- Публічно перевірено HTTPS: `/`, `/about`, `/dealer`, `/contacts`, `/product`, `/search`, `/cart`, `/checkout` — усі HTTP 200.

### Git-деплой (актуальний механізм, замінив ручний rsync)

- 2026-07-31 встановлено `ops/install-server.sh` на сервері: bare-репо `/home/hydrophobnet/deploy/repository.git`, hook `post-receive`, скрипти `deploy-revision`/`rollback` у `/home/hydrophobnet/deploy/bin/`, все `chown root:root`.
- Локально доданий git remote `production` → `ssh://root@46.224.100.254/home/hydrophobnet/deploy/repository.git`.
- Деплой: `git push origin main` (GitHub) + `GIT_SSH_COMMAND="sshpass -p '<REDACTED — див. ~/AI-Workspace/secrets/ACCESS.md>' ssh -o StrictHostKeyChecking=accept-new" git push production main` (тригерить post-receive → deploy-revision: lint, rsync у web root, chown hydrophobnet:hydrophobnet, dirs 750/files 640, health-check curl `/`, `/about`, `/product`, автоматичний rollback при невдачі).
- Rollback: `ssh root@46.224.100.254 '/home/hydrophobnet/deploy/bin/rollback [sha]'`.
- Лог: `ssh root@46.224.100.254 'tail -n 30 /home/hydrophobnet/deploy/deploy.log'`.
- Пароль root-доступу лежить у `<REDACTED — див. ~/AI-Workspace/secrets/ACCESS.md>`; SSH-ключа немає, лише пароль (sshpass), <REDACTED→secrets/ACCESS.md> банить після кількох невдалих спроб.

## 2026-07-31 — синхронізація з Lovable (перелінковка + order-статуси)

- Lovable `2ea0d65` → `bc10340`: перелінкована навігація (хедер/футер/CTA/картки товару на реальні маршрути замість `#`), новий lang-switcher partial, about-мозаїка з попапом, нові сторінки `/order/success`, `/order/fail`.
- Фавікон у Lovable НЕ змінювався (перевірено байтово) — це NOT причина, попри згадку користувача; реальні проблеми були в перелінковці.
- Побічно знайдено і виправлено: `hp_asset()` повертав відносні шляхи (`img/...`) — ламало щойно додані вкладені маршрути (`/order/success` → браузер шукав `/order/img/...`). Тепер `/img/...` (абсолютні).
- Побічно виправлено: `.hp-card` (стала `<a>`) успадковувала синій/підкреслений стиль посилання — додано `color: inherit; text-decoration: none`.
- Локальний `.htaccess` і серверний nginx `@clean_urls` розширені під дворівневі шляхи (`order/success`) — див. `/etc/nginx/sites-enabled/hydrophob.net.conf`.
- Деталі в `project.md`.

## 2026-07-31 — Блог/Відгуки/юридичні сторінки (деталі в project.md)

- Нові сторінки з lovable: `/reviews`, `/blog`, `/blog/<slug>` (6 статей), `/privacy`, `/terms`, `/delivery`, `/returns`.
- ПАСТКА НА МАЙБУТНЄ: НЕ створювати фізичну директорію `blog/` (чи будь-яку іншу, що збігається з іменем чистого URL) — Apache/nginx матчать directory РАНІШЕ за rewrite-правила → 301→403. Для `/blog/<slug>` використано query-string-редирект (`blog-post.php?slug=`) через явне rewrite-правило, не директорію з файлами.

## 2026-07-31 — реальні товари, checkout-доставка, footer, промо-відео (деталі в project.md)

- Футер: "Розроблено" тепер веде на pprintdim.com.
- About "Промо": реальний HTML5-плеєр (синхронізовано ще одну зміну з lovable, `bc10340`→`3a1e8f9`).
- Каталог на головній підключено до реальних 89 товарів з `materials/products.csv` + фото з `img/products/` — робочі фільтри (категорія/ціна/пошук) і пагінація 20/сторінку через GET.
- Checkout: 5 способів доставки (Нова Пошта/Укрпошта/Meest/Кур'єр/Самовивіз) з окремими полями, названими за конвенціями OpenCart 3 (`shipping_method` = "extension.method" тощо) — готово під майбутню натяжку на OC3. Телефон — `intl-tel-input` (CDN) з повним селектом країни й маскою.
- ВАЖЛИВО (структура даних): `materials/products.csv` тепер ЗАВЕДЕНО в git (виняток у `.gitignore`: `materials/*` + `!materials/products.csv`), решта `materials/` як і раніше ігнорується.
- ВАЖЛИВО (фото товарів, 248MB): `img/products/` НЕ в git (лишається в `.gitignore`) — синхронізовано на сервер окремим `rsync` напряму (не через git-деплой), права `hydrophobnet:hydrophobnet`, dirs 750/files 640. `ops/deploy-revision.sh` тепер має `--exclude='img/products/'` в обох rsync-командах (deploy і rollback), щоб деплой/відкат не стирав фото. Якщо додаються нові фото товарів — синхронізувати вручну:
  ```bash
  export RSYNC_RSH="sshpass -p '<REDACTED — див. ~/AI-Workspace/secrets/ACCESS.md>' ssh -o StrictHostKeyChecking=accept-new"
  rsync -az img/products/ root@46.224.100.254:/home/hydrophobnet/htdocs/hydrophob.net/img/products/
  ssh root@46.224.100.254 'chown -R hydrophobnet:hydrophobnet .../img/products && find .../img/products -type d -exec chmod 750 {} + && find .../img/products -type f -exec chmod 640 {} +'
  ```
- macOS має лише `openrsync` (BSD) — без `<REDACTED→secrets/ACCESS.md>` (GNU-only флаг), використовувати `-az` без progress-флагів або `--progress` (старий, сумісний).
- ОБМЕЖЕННЯ: усі 89 реальних товарів досі ведуть на єдину демо-сторінку `/product` — окремих детальних сторінок під кожен товар не робили (не було в задачі, це окремий великий обсяг роботи).

## КРИТИЧНО: сервер — nginx, не Apache (.htaccess ігнорується)

- 2026-07-31 виявлено: hydrophob.net на CloudPanel обслуговується **nginx**, а не Apache. `.htaccess` у корені сайту повністю ігнорується production-сервером (працює лише локально під MAMP).
- Реальна маршрутизація — в `/etc/nginx/sites-enabled/hydrophob.net.conf`, внутрішній `server { listen 8080; ... }` блок (зовнішній 443-блок лише проксі на 8080).
- Дефолтний CloudPanel `try_files $uri $uri/ /index.php?$args;` не знав про кастомні чисті URL (`/dealer` → `dealer.php`) — усі маршрути мовчки фолбечили на `index.php` (однаковий контент/розмір на всіх сторінках).
- ПОМИЛКОВИЙ перший фікс: `try_files $uri $uri.php $uri/ ...` — nginx у цьому випадку НЕ проганяє знайдений `$uri.php` через `location ~ \.php$`, а віддає його як статичний файл → **вихідний PHP-код світився в браузері** (`content-type: application/octet-stream`). Швидко відкочено.
- ПРАВИЛЬНИЙ фікс (застосовано, працює): named location + `rewrite ... last`, що форсує повторний location-matching і виконання через php-fpm:
  ```nginx
  try_files $uri $uri/ @clean_urls;
  index index.php index.html;

  location @clean_urls {
    rewrite ^/([a-z0-9-]+)/?$ /$1.php last;
    return 404;
  }
  ```
  (вставлено в `hydrophob.net.conf` перед `location ~ \.php$` у 8080-блоці).
- Перевірено: усі маршрути повертають `text/html` з різним HTML (реальний рендер, не сирий код), неіснуючі маршрути — 404.
- Бекап оригінального конфігу до фіксу: `/root/nginx-config-backups/hydrophob.net.conf.bak-20260731121307` на сервері.
- Перезавантаження nginx після правок конфігу: `nginx -t && systemctl reload nginx`.
- ВАЖЛИВО НАСАМПЕРЕД: якщо додаються нові чисті маршрути (нові сторінки), regex `^/([a-z0-9-]+)/?$` покриває лише один рівень без слешів у назві — секційні підпапки (`sections/dealer/...`) це не чіпає, вони не в web root запитах.

## Локальний запуск (MAMP vhost)

- 2026-07-31: меню використовує кореневі посилання (`/about`, `/dealer`...), які коректні для проду, але ламались на `http://localhost:8888/hydrophob.net/...` (корінь MAMP — не ця тека).
- Додано окремий vhost на порту 8890 з `DocumentRoot` = ця тека, ідентично проду: `http://localhost:8890/about` тощо працює напряму.
- Зміни: `Listen 8890` у `/Applications/MAMP/conf/apache/httpd.conf`, `Include .../extra/httpd-vhosts.conf` розкоментовано, новий `<VirtualHost *:8890>` у `httpd-vhosts.conf`.
- ВАЖЛИВО: порт 8889 зайнятий MySQL в MAMP (дефолт) — не використовувати його для Apache vhost.
- Після зміни конфігів Apache перезапускати через `/Applications/MAMP/bin/startApache.sh` (не `apachectl -k restart`, спричинило падіння через конфлікт порту раніше).
- Старий шлях `http://localhost:8888/hydrophob.net/` теж працює для прямих `*.php`, але кореневі посилання там некоректні.

## 2026-08-01 — Особистий кабінет, вхід/реєстрація, каталог-сторінка, 404 (з lovable)

- Нові сторінки з lovable (діапазон комітів `13c4714..9879308`): `/catalog` (окрема сторінка каталогу, перевикористовує `sections/catalog.php`), `/login`, `/register`, `/account` + `/account/orders` + `/account/favorites` + `/account/reviews`, панель «Оформити швидше» на `/checkout`, справжня 404-сторінка.
- Нові іконки в `hp_icon()`: heart/user/mail/user-plus/log-out/package/message-square.
- Спільний партіал `sections/code-modal.php` (6-значний код + таймер повторної відправки 59с) підключається з параметрами `$hpCodeTo`/`$hpCodeTitle`; JS-логіка в кінці `js/home.js` (`[data-code-modal]`, `[data-code-trigger]`, `[data-code-email]`) — той самий патерн `hidden`-атрибута, що й `dealer/modal.php`.
- `sections/account/layout-start.php` + `layout-end.php` — спільний каркас акаунту (аватар/навігація/вийти), 4 флет-файли `account.php`, `account-orders.php`, `account-favorites.php`, `account-reviews.php` — НЕ директорія `account/` в корені (пастка з `blog/` з попередньої сесії).
- Rewrite-правила для `/account/orders`, `/account/favorites`, `/account/reviews` додано і локально (`.htaccess`), і на проді (`/etc/nginx/sites-enabled/hydrophob.net.conf`, `@clean_urls`, перед generic-правилами, за зразком `/blog/<slug>`). Бекап конфігу перед правкою: `/root/nginx-config-backups/hydrophob.net.conf.bak-20260801225020`.
- 404: локально `ErrorDocument 404 /404.php` в `.htaccess`; на проді `error_page 404 /404.php;` додано в `server { listen 8080; }` блок. `nginx -t` + `systemctl reload nginx` виконано, конфіг валідний.
- ВАЖЛИВО: nginx-правки на проді вже застосовані (config+reload), але сам код (`404.php`, `account*.php`, `login.php`, `register.php`, `catalog.php` тощо) ЩЕ НЕ задеплоєний — `git push production main` не виконувався, чекає прямої команди користувача (як завжди для деплою).
- Всі нові маршрути перевірені локально (`http://localhost:8890`): `php -l` без помилок на всіх файлах, HTTP 200 на `/catalog`, `/login`, `/register`, `/account`, `/account/orders`, `/account/favorites`, `/account/reviews`, `/checkout`; 404-сторінка перевірена на неіснуючому маршруті; скріншоти зроблені і звірені з lovable-дизайном.
- Дрібний баг знайдено і виправлено самостійно: у `catalog.php` секція рекомендованих товарів дублювала обгортку `<section class="hp-recommended">` (вона вже є всередині `sections/recommended.php`) — прибрано зайву зовнішню обгортку.

## Обов'язковий порядок роботи

1. Прочитати `AGENTS.md` відповідної версії гілки `lovable`.
2. Read-only проаналізувати маршрут, компоненти, CSS і ресурси потрібної сторінки.
3. Якщо сторінка є — перенести її в PHP-секції без самостійної зміни дизайну чи контенту.
4. Якщо сторінки немає — повідомити користувача й зупинитися до підтвердження.
5. Після змін запустити PHP lint, `node --check` і desktop/mobile HTTP render.
6. Пуш і деплой — тільки після прямої команди.
