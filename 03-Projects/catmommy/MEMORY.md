# catmommy.co.uk — MEMORY

## Стан (2026-09-30)
- WP (en_GB) + WooCommerce 11.1 на Hetzner 46.224.100.254, CloudPanel, site user `catmommy`, PHP 8.4, vhost-шаблон WooCommerce. Креди — ACCESS.md.
- Донор натяжки: https://piddlepatch.com (WP + Woo + Divi, підписки). У `/Applications/MAMP/htdocs/catmommy/materials/` — лише загальне: 49 сторінок (pages/<slug>/text.md, content.html, meta.json, images/), common/ (шапка, футер, меню, лого), README.md з індексом. Товарку донора прибрано — товари користувач дасть посиланнями, парсити в materials.
- LE-сертифікат (catmommy.co.uk + www) встановлено 2026-09-30.
- БД лише на сервері, локально тільки materials і майбутня тема.
- Плагіни (усі безкоштовні): WooCommerce, Stripe Gateway, Subscriptions for WooCommerce (WP Swings), ACF, Rank Math, Redis Object Cache (увімкнено, prefix catmommy_), Converter for Media (webp), WP Mail SMTP (Brevo ще НЕ налаштовано).
- Woo: GB, GBP, ціни з VAT 20% (tax rate додано), гостьовий чекаут, сторінки shop/cart/checkout/my-account створено; відправник листів owner@catmommy.co.uk.
- Гейт: blog_public=0 (noindex). Basic-auth ЗНЯТО 2026-09-30 за командою — сайт і /html/ відкриті.
- DNS зона Hetzner id 1565103; NS у реєстратора міняє користувач. LE-сертифікат — після делегування: `clpctl lets-encrypt:install:certificate --domainName=catmommy.co.uk --subjectAlternativeName=www.catmommy.co.uk`.

## Репо і верстка (2026-09-30)
- GitHub `pprintdim/cat-mom-s-hub` (з 2026-10-01): `lovable` — джерело Lovable (НЕ чіпати); `html` — секційний PHP-верстка (worktree `html/`, запушено); `main` — WordPress-натяжка (корінь `/Applications/MAMP/htdocs/catmommy`, поки лише .gitignore поверх історії Lovable, без force-push). Гілку `wordpress` видалено.
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
