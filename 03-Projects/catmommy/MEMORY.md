# catmommy.co.uk — MEMORY

## Стан (2026-09-30)
- WP (en_GB) + WooCommerce 11.1 на Hetzner 46.224.100.254, CloudPanel, site user `catmommy`, PHP 8.4, vhost-шаблон WooCommerce. Креди — ACCESS.md.
- Донор натяжки: https://piddlepatch.com (WP + Woo + Divi, підписки). У `/Volumes/Projects/materials/other/clients/catmommy/` — лише загальне: 49 сторінок (pages/<slug>/text.md, content.html, meta.json, images/), common/ (шапка, футер, меню, лого), README.md з індексом. Товарку донора прибрано — товари користувач дасть посиланнями, парсити в materials.
- LE-сертифікат (catmommy.co.uk + www) встановлено 2026-09-30.
- БД лише на сервері, локально тільки materials і майбутня тема.
- Плагіни (усі безкоштовні): WooCommerce, Stripe Gateway, Subscriptions for WooCommerce (WP Swings), ACF, Rank Math, Redis Object Cache (увімкнено, prefix catmommy_), Converter for Media (webp), WP Mail SMTP (Brevo ще НЕ налаштовано).
- Woo: GB, GBP, ціни з VAT 20% (tax rate додано), гостьовий чекаут, сторінки shop/cart/checkout/my-account створено; відправник листів owner@catmommy.co.uk.
- Гейт: blog_public=0 (noindex). Basic-auth ЗНЯТО 2026-09-30 за командою — сайт і /html/ відкриті.
- DNS зона Hetzner id 1565103; NS у реєстратора міняє користувач. LE-сертифікат — після делегування: `clpctl lets-encrypt:install:certificate --domainName=catmommy.co.uk --subjectAlternativeName=www.catmommy.co.uk`.

## Репо і верстка (2026-09-30)
- GitHub `pprintdim/cat-mom-s-hub` (з 2026-10-01): `lovable` — джерело Lovable (НЕ чіпати); `html` — секційний PHP-верстка (worktree `html/`, запушено); `main` — WordPress-натяжка (корінь `/Applications/MAMP/htdocs/other/clients/catmommy`, поки лише .gitignore поверх історії Lovable, без force-push). Гілку `wordpress` видалено.
- `html/` = worktree `html`. Живе на https://catmommy.co.uk/html/ (підтека в докорені WP). Welcome-відео лише при першому візиті (cookie `catmommy_welcome_seen`), `?welcome=1` форсує, `?welcome=0` пропускає. 15 сторінок (*.php у корені), кошик js/cart.js (localStorage `catmommy_cart`), пошук js/search.js. Деплой `html/deploy.sh [--full]` (гітігнорований, пароль site user з Keychain `catmommy.siteuser`). CSS: `html/build-css.sh` (Tailwind CLI v4 у scratchpad `tw/node_modules`, після нової сесії ставити знову).
- Звірка з оригіналом (локальний vite dev гілки lovable, скріни 1440/390) — 1:1; Swiper замінено власним слайдером, крапки стоять як реально рендерить Swiper (left 0, bottom 8px).

## План натяжки
- Своя легка класична тема (PHP-шаблони, vanilla CSS/JS, блоки через ACF, точкові Woo-override), без білдерів; кеш — Redis + page cache.

## TODO
- Brevo (домен-верифікація SPF/DKIM у зоні + API-ключ у WP Mail SMTP); тема; імпорт товарів з materials; Stripe-ключі.

## Майбутній переїзд на сервер «playground» (2026-09-30, доступів ще нема)
- Не в поточному проєкті Hetzner (токен бачить лише 46.224.100.254). Коли будуть доступи, потрібні: SSH (IP, порт, root/sudo; краще мій ключ), яка панель (CloudPanel → вистачить root), чи той самий акаунт Hetzner (інакше токен).
- План: WP+Woo файли + дамп БД (відновлення — лише після «так»), /html/, site user і БД з новими паролями, PHP 8.4 + redis/imagick, Redis, vhost, catmommy-manager, потім A-записи в зоні 1565103 → новий IP, LE-сертифікат, перевірка; старий сервер не чіпати до підтвердження.

## WP-тема (2026-10-02, гілка main, коміт 93f6641)
- Тема `wp-content/themes/catmommy` (своя, легка): Carbon Fields (composer, vendor у .gitignore, CI ставить), хелпери верстки `cm_*` (inc/helpers.php), автопідключення всіх `inc/*.php`, CSS = Tailwind v4 (`assets/css/tailwind.css` + `parts/*.css` → `style.css`, `bin/build-css.sh`), шрифт Nunito Sans self-hosted. Деталі — README теми.
- Деплой: GitHub Actions `.github/workflows/deploy.yml` (push у main → composer + Tailwind + rsync site user-ом). Потрібен секрет репо `DEPLOY_SSH_KEY` (ключ у Keychain `catmommy.deploy-key`, base64; публічний — у /home/catmommy/.ssh/authorized_keys). Запасний ручний — `bin/deploy.sh`.
- Сід: `seed/seed.php` (категорії, 6 товарів: three-pot-bundle + single-pot variable Mix/Rye/Barley/Oats/Wheat з Amazon-фото + 4 заглушки; сторінки, блог, зона доставки UK free≥£30 / Tracked48 £3.95 / Next-day £5.95 incl VAT) і `seed/seed-content.php` (CF7 «Contact»). Ідемпотентні. На ПРОД ще НЕ запущені — чекають «так» на БД; разом із перемиканням cart/checkout на шорткоди і вимкненням WP Swings.
- Підписки: свій рушій на Stripe Billing (inc/subscriptions.php): картка зберігається gateway-ом (force save), після оплати — Stripe subscription з trial_end = наступна доставка; вебхук `/wp-json/catmommy/v1/stripe-webhook` створює renewal-замовлення; кабінет — пауза/відновлення/скасування/оновлення картки (portal). Налаштування: `CM_STRIPE_PK=… CM_STRIPE_SK=… wp catmommy stripe-setup --mode=test`. Ключів Stripe ще НЕМАЄ.
- Локальний WP для тестів: SQLite у scratchpad сесії (`scratchpad/wp`, `bin/wpl`), тема симлінкнута.
- Не зроблено: розсилка (newsletter) — заглушка; Brevo-пошта не налаштована.

## Прод (2026-10-02)
- Тема catmommy активна на проді; сіди seed.php + seed-content.php + seed-fields.php запущені (усі Carbon Fields заповнені, медіа в бібліотеці). Бекап БД перед цим — backups/backup-db-20261002123045.sql (локально).
- Classic Editor — основний для всіх. Зайві теми видалені. Customizer: custom-logo (шапка), cm_footer_logo, Site Icon (з оригінального лого 512).
- Пошта: WP Mail SMTP → Brevo API, домен автентифіковано, листи замовлень доходять (перевірено замовленням #63).
- Тестова оплата: Woo «Check payments» = «Test payment (no charge)» увімкнена (дозволена й для підписок). ВИМКНУТИ перед запуском. Stripe-ключів ще нема.
- Ціни товарів — чекають підтвердження (пропозиція: Single £9.99/£8.99 тощо, підписка −10%).
- Деплой поки вручну `wp-content/themes/catmommy/bin/deploy.sh` (секрету DEPLOY_SSH_KEY у GitHub нема — Actions лише білдять).

## Переїзд на SiteGround (2026-10-02)
- Сайт перенесено на SiteGround: SSH gukm1084.siteground.biz:18765 u205-vf526mjajxah (ключ ~/.ssh/siteground_catmommy), докорінь ~/www/catmommy.co.uk/public_html, IP 35.214.43.162, PHP веб 8.2 (просили 8.4 у PHP Manager). БД SG (dbhcjlykgc1leq), наші таблиці з префіксом wp_ (SG-івські kys_ лишились поруч, не використовуються). Redis прибрано, кеш — SG Speed Optimizer (+ SG Security).
- NS домену → ns1/ns2.siteground.net (зона тепер у SiteGround, правиться лише в Site Tools → Domain → DNS Zone Editor; Hetzner-зона 1565103 більше не діє). Brevo-записи (DKIM brevo1/2, brevo-code, SPF include:spf.brevo.com, DMARC) треба додати в SG-зону вручну.
- SSL на SG: Let's Encrypt через Site Tools → Security → SSL Manager (вручну).
- Деплой теми: `wp-content/themes/catmommy/bin/deploy.sh` і GitHub Actions → SiteGround (секрет DEPLOY_SSH_KEY = приватний ключ SG, ще не доданий).
- Hetzner (46.224.100.254, site user catmommy) лишено робочим як резерв до підтвердження; потім можна прибрати сайт з CloudPanel.

## Стан 2026-10-11 (commit 0436657)
- Велком-оверлей = hydrophob-флоу: прелоадер (статичне лого + прогрес) → інтро з кукі-банером (z-130 над велкомом) → відео лише після згоди (`cm:consent`) → показ раз (cookie catmommy_welcome_seen; `?welcome=1` форсує).
- Вхід/реєстрація — OTP-попап; для НОВОГО email у кроці коду показується телефон (intl-tel-input, обовʼязковий, зберігається як billing_phone). `send` віддає `isNew`, `verify` приймає `phone` і перевіряє його ДО коду. Поле Phone (обовʼязкове) є і в Account details (хуки в inc/phone.php).
- На проді не було `assets/vendor/intl-tel-input` (маска ніде не вантажилась, cm_asset давав v=1.0.0) — залито rsync-ом; при деплої перевіряти, що вендор на місці.
- Stripe Payment Element: явний appearance через `wc_stripe_upe_params` (inc/checkout.php → cm_stripe_appearance), шрифт у iframe — `assets/js/stripe-theme.js` обгортає window.Stripe і додає `assets/css/stripe-fonts.css` (Nunito Sans data-URI). Плагін реєструє скрипти у wp_footer(10), тому наш хук — wp_footer(15).
- inc/account-email.php: WC «New account» вимкнено, замість нього власний велком-лист (woocommerce_created_customer); зміна email в Account details застосовується лише після 6-значного коду на нову адресу (transient cm_email_change_<uid>, блок підтвердження над формою).
- SiteGround fail2ban банить SSH після ~5+ швидких конектів на ~15–20 хв (Connection refused) — обʼєднувати команди в один ssh/rsync, між ними пауза.
- Тестовий товар £0.50 (ID 82, /product/test-payment-check-0-50/) для живої оплати — ще не оплачений; після тесту зробити refund і сховати товар.

- 2026-10-12: «Buy in one click» ВИДАЛЕНО повністю за рішенням клієнта (inc/quick-order.php, popups/quick-order.php, js/quick-order.js) — не повертати; глобальний мінімум натяжки тут не діє.

- 2026-10-12: «Buy in one click» ВИДАЛЕНО повністю за рішенням клієнта (inc/quick-order.php, popups/quick-order.php, js/quick-order.js) — не повертати; цей пункт глобального мінімуму натяжки тут не діє.
- 2026-10-12: велком — звук після consent-кліку (muted-фолбек), автозакриття через 3 с (AUTO_CLOSE в ui.js); webm/mp4 у uploads/2026/10 і в assets/video перекодовані з нормалізованим аудіо (loudnorm). Чекаут: Order notes вимкнено (woocommerce_enable_order_notes_field=false), тогл іншої адреси доставки — картка .cm-ship-toggle. Тестовий товар 82 — virtual, тому на ньому блоку доставки нема; тестувати чекаут з ID 17.
- 2026-10-13: частота підписки — селект .cm-select на міні-картках (name=cm_interval), у кошику (data-cart-interval → op interval:<key>:<n>) і в чекауті (data-checkout-interval, cmCheckout.cartNonce); сторінка товару — чіпи. Кнопка картки mt-auto. Мережа без VPN блокує порти 22/18765 — GitHub пушити через ssh.github.com:443; SiteGround тільки з іншої мережі (телефон). Планер у seed/data.json + seed/images/grow-kit-*.webp залиті на сервер, seed НЕ запущений (чекає ок).
- 2026-10-13: планер опубліковано: товар #86 self-watering-grow-kit (£12.99, one-off, категорія Grow kits term 24, бейдж New, 5 фото). Seed на проді запускав обрізаним (лише products — head -n 132 seed.php), бо повний seed.php чіпає shipping-зону/сторінки; seed-файли з сервера прибрано. Домашня мережа 80.153.19.143 блокує 22/18765/UDP53 — SSH лише з телефонної мережі.
- 2026-10-14: автовибір перевізника — inc/shipping.php (правила cm_carrier_for: індекси + вікно пт16–сб12 Europe/London), ставка будується в inc/cart.php (woocommerce_package_rates @100, id free_shipping:evri|royal_mail, instance id зони: Evri #4, Royal Mail #5). Renewal — cm_renewal_shipping_item. Клієнтка хоче ОКРЕМИЙ бізнес-Stripe (Sontara Ltd) — поточні live-ключі особисті, замінити ключі + webhook, коли дасть. Тест-товар 82 тепер підписний (£0.50/доставка).
- 2026-10-16: ПОВТОРНЕ СПИСАННЯ ПІДПИСКИ ПЕРЕВІРЕНО live: #93 (тест £0.50, sub 2 тижні) → trial_end=now через API → інвойс paid (billing_reason subscription_update — обробник приймає) → webhook → renewal #94 з листами й перевізником. Обидва £0.50 повернуто (wc_create_refund → Stripe), підписку скасовано. Тест-інтервал «Every hour» відкочено (revert b9464fa), sub price з #82 знято. УВАГА: #92 — реальна підписка клієнтки (Wheat, every week, через Link, cus_VQD8…, trial до 21.10) — списання піде 21.10 на поточний Stripe.
- 2026-10-16: адмінка: inc/admin-guide.php (меню «Инструкция», рос.), inc/admin-menu.php (ховання пунктів за підписами, ?cm_full_menu=1 показує все), notices плагінів dismissed під catadmin. Трекінг-номер (варіант 1) — чернетка в scratchpad tracking.php.draft, НЕ в темі, клієнт ще не підтвердив. Payment methods в My Account застилені. Admin_email і WC-отримувачі = catmommy.uk@gmail.com. ECE лише на чекауті (фільтри + payment_request_button_locations=[checkout]).
- 2026-10-16: КЛІЄНТ ВІДМОВИВСЯ ВІД ROYAL MAIL (Evri-only; збір посилок RM платний). CM_CARRIER_RULES_ENABLED=false в inc/shipping.php, метод зони #5 is_enabled=0 (таблиця wp_woocommerce_shipping_zone_methods). Правила лишились у коді на майбутнє.
- 2026-10-16: трекінг (inc/tracking.php): мета _cm_tracking/_cm_tracking_carrier/_cm_tracking_sent, бокс на замовленні (HPOS screen), колонка, order action cm_send_tracking, блок у листах (priority 15) і в My Account. Тест: #94 має демо-номер H0123456789012345 (лист надіслано на dim.mack.o).
