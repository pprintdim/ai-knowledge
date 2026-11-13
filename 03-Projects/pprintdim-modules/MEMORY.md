# PPrintdim Modules — стан і рішення

Домен: `modules.pprintdim.com`. Окремий продукт, з pricelistsync і pprintdim.com бізнес-логіку не змішувати.

## Рішення (2026-10-31, погоджено з користувачем)
- Репо `pprintdim/modules`: `main` — Claude (Laravel), `lovable` — Lovable (тільки frontend, поетапно з погодженням). Мерж lovable → main лише після «ок».
- Стек: Laravel 13 + Inertia + React (як stocrm), SSR для SEO; адмінка — Filament (як pprintdim.com).
- Мови: uk + en.
- Сервер: Hetzner 46.224.100.254, CloudPanel, PHP 8.4, окрема БД.
- БД: categories, modules, module_oc_versions (2.x/3.x/4.x), module_screenshots, module_features, module_versions (архів, sha256, changelog, сумісність, is_current), docs.
- Монетизація (змінено 2026-10-31, скасовує пункт ТЗ «платіжку не інтегрувати»): **all-access підписка** 1/6/12 міс, відкриває всі модулі; після закінчення вже скачані версії працюють, нові не качаються. **Ліцензійних ключів/привʼязки до домену НЕМА** — лише доступ до завантажень. Платіжка: **спершу WayForPay** (регулярні платежі), Stripe пізніше. Завантаження тільки через контролер з перевіркою доступу.
- Модулі OCMOD для OC 3.0.3.9 пишуться з нуля (не копії комерційних), тест install/uninstall, PHP 8.1–8.4, uk/en. Групи першої хвилі (усі 4):
  1. Доставка/оплата UA: Нова Пошта (відділення/поштомати/ТТН), Укрпошта, Meest; Monobank, LiqPay, WayForPay.
  2. Конверсія: купити в 1 клік, OTP-попап входу, AJAX-пошук, маска телефону intl-tel-input, Telegram-сповіщення, покинутий кошик.
  3. SEO/швидкість: SEO-URL+мета генератор, hreflang, sitemap, webp, lazy-load, schema Product/Breadcrumb.
  4. Фіди/аналітика: XML Rozetka/Prom/Hotline/Google Merchant, GA4/GTM ecommerce + Consent Mode v2, масова зміна цін.
- Конектор для PriceListSync — теж у каталозі.

## Стан (2026-10-31) — етап 0 готовий
- Локально: `/Volumes/Projects/MAMP/htdocs/other/own/pprintdim-modules` (laravel/react-starter-kit dev-main → Laravel 13.39, Inertia 3, React 19, Tailwind 4, Fortify, Filament 5.11). composer `platform.php = 8.4.17` (як на сервері; локально PHP 8.5).
- Репо `git@github.com:pprintdim/modules.git`, гілки `main` + `lovable` (lovable поки = main).
- Сервер: site user `ppmodules`, `/home/ppmodules/htdocs/modules.pprintdim.com`, vhost Laravel 13, LE, БД `ppmodules`, замок `site-auth` (креди в ACCESS.md), robots Disallow. Адмінка Filament — шлях з `ADMIN_PATH` (`config('app.admin_path')`), прод-значення в ACCESS.md.
- Деплой: `./deploy.sh` (npm build локально → tar через `hetzner-ssh.sh` → composer install / migrate / optimize від site user). `--no-build` пропускає збірку.
- Адмін Filament створено на проді (креди в ACCESS.md).

## Етап 1 (2026-10-31) — задеплоєно
- Каталог: моделі Category/Module/ModuleVersion/ModuleScreenshot/Doc + Plan/Subscription/Payment, тексти — JSON `{uk,en}` (трейт `Translatable::t()`). Публічні маршрути двічі: корінь = uk, `/en` = en (`SetLocaleFromUrl`). Inertia-сторінки `resources/js/pages/catalog/*` — ТИМЧАСОВІ заглушки до дизайну Lovable.
- Архіви на приватному диску `local` (`storage/app/private/modules/<code>/`), віддає тільки `DownloadController` (free — всім, paid — `User::canDownload` = активна підписка/адмін).
- Білінг: `App\Services\Billing\WayForPay` + `SubscriptionBilling`; checkout → blade автосабміт форми; approve ТІЛЬКИ з підписаного serviceUrl (`/billing/wayforpay/callback`, CSRF-виняток), регулярні списання = `<ref>_WFPREG-n`; refund віднімає період. Дефолтні креди — публічна пісочниця `test_merch_n1`. Ціни планів у сідері — стартові (349/1690/2890 ₴), користувач ще не підтвердив.
- OCMOD: джерела в `ocmod/<code>/` (upload/ + meta.json, install.xml ніде не треба — усе через події). `php artisan modules:import-ocmod [code] [--publish] [--overwrite]` пакує `<code>-<ver>.ocmod.zip` і апсертить модуль/версію (тексти з адмінки не перетирає без --overwrite). Хвиля 1: pp_novaposhta, pp_ukrposhta, pp_meest, pp_monobank, pp_liqpay, pp_wayforpay — ЖОДЕН не тестований на живому OC і пісочницях.
- Прод: MAIL_MAILER=sendmail від no-reply@pprintdim.com (потрібно для email verification перед checkout).
- Замок site-auth на modules ЗНЯТО 2026-10-31 (рішення користувача), індексацію досі закриває robots Disallow. На sync замок лишається.
- WayForPay на проді — тестовий мерчант `test_merch_n1` (як у shoker/hydrophob), явно в `.env`. За нотатками shoker тестовий шлюз WFP відхиляє тестові карти (1105/1122) — успішну гілку перевіряти підписаним callback `Approved`.
- deploy.sh виключає `storage/app/*` (щоб не перетерти прод-архіви локальними).

## Етап 2 (2026-11-01) — 24 модулі на проді
- Хвилі 2–4 додані: pp_quick_order, pp_otp_login, pp_ajax_search, pp_phone_mask (intl-tel-input 29.5.4 вшитий), pp_telegram_notify, pp_abandoned_cart; pp_seo_generator, pp_hreflang, pp_sitemap, pp_webp, pp_lazyload, pp_schema; pp_feed_rozetka/prom/hotline/google, pp_ga4, pp_price_editor (категорія `tools`). Усі 24 опубліковані на проді (`modules:import-ocmod --publish --overwrite`).
- Перевірка: `tools/oc-smoke/install.php` (install/uninstall/reinstall, збереження налаштувань, сторінки вітрини, error.log) + `tools/oc-smoke/checkout.php` (гостьовий checkout) на чистому OC 3.0.3.9 / PHP 8.4 (MAMP php8.4.17, MAMP MySQL порт 8889, тестова БД `pptest_oc3` — залишена, стенд-файли видалені). Усі 24 — без PHP-помилок; фіди валідний XML; NP-віджет, OTP, quick order, ajax search, schema/lazy/webp/sitemap працюють. НЕ перевірено: живі API перевізників/платіжок, реальна пошта/Telegram, сторонні теми й one-page чекаути.
- Граблі OC 3.0.3.9 на PHP 8.1+: бандлений Twig сипле deprecation у відповідь, якщо в магазині увімкнено «Показувати помилки» — ламає AJAX JSON. Примітка додана в install-тексти всіх модулів.
- E2E оплати на проді (2026-11-01): підписаний Approved → підписка active на місяць, повтор не продовжує, підміна суми → 400; тестові рядки прибрані.
- Аналітика (рішення користувача): на modules GA4-тег НЕ ставити, окремої property не треба; Search Console — достатньо `sc-domain:pprintdim.com`. Service account `pprintdim-analytics@pprintdim.iam.gserviceaccount.com` (GCP project `pprintdim`), ID у `secrets/google-pprintdim.txt`, ключ `secrets/google-pprintdim-sa.json` — користувач перевипускає (старий світився в чаті).

## Блокери
- Ключі мерчанта WayForPay (account, secret) → ACCESS.md.

## Дизайн (2026-11-03)
Lovable-верстки не буде (рішення користувача) — фронт у стилі pprintdim.com: палітра/шрифти Manrope+Space Grotesk/glass/куб-лого в `resources/css/app.css` (класи `pp-*`), `components/brand-logo.tsx`, градієнтна основна кнопка в `ui/button.tsx`. Обидві теми (світла/темна).
