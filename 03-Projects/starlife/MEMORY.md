# MEMORY — starlife (WordPress)

## Репозиторій (з 2026-10-09)
- GitHub: `pprintdim/startlife` — `main` = WordPress-сайт, `lovable` = Lovable React-джерело дизайну (не чіпати). Старий репо `pprintdim/starlife` підлягає видаленню користувачем (з сесії неможливо — gh не авторизований).
- Локально: `/Applications/MAMP/htdocs/starlife`; lovable-гілка розгорнута як гітігнорений worktree `lovable-app/` (dev: `bun run dev --port 5181`).
- Локальний рантайм: БД `starlife` у MAMP MySQL (root/root, сокет), гітігнорений `wp-config-local.php` (wp-config.php підхоплює його, інакше — старі проді-креди np588371, той хостинг мертвий/locked). Сайт: http://localhost:8888/starlife

## Редизайн 2026-10-09 (commit a588963)
- Тема `starlife` переведена на Lovable-дизайн: односторінковий лендинг — hero-слайдер (Swiper fade, 5 слайдів, 3 з фоновим відео), партнери, про нас, напрями (snap-скрол), 4 кроки, навчання (велком-відео), блог (6 карток з акордеонами), контакти+FAQ, футер з Leaflet-картою офісу (Чернівці). Legal-шаблон `page-legal.php` (зміст з h2).
- Контент: пост-мета `sl_hero/sl_partners/sl_about/sl_products/sl_steps/sl_learning/sl_blog/sl_contacts` + `get_option('sl_company')` (сторінка «Реквізити STARLIFE» в адмінці). Дефолти = точний контент дизайну (`inc/helpers/Defaults.php`, `sl_section()`), порожні поля в БД не пишуться — сторінка 1:1 без записів у БД.
- Метабокси: `inc/metaboxes.php` + SL_* класи в `inc/helpers/Fields.php` (репітери з drag/згортанням, wp.media-пікери, селект іконок, плейсхолдери = тексти дизайну, UA-лейбли). Видно лише на page_on_front.
- Нові ассети: `assets/css/redesign.css`, `assets/js/redesign.js` (префікс `sl-`), `assets/lovable/` (відео/фото/лого з Lovable CDN), `assets/fonts/` (Inter/Poppins woff2), `assets/vendor/leaflet/` 1.9.4. Старі style.css/js.js живі — на них кабінет/OTP/модалки входу (збережені).

## Прод
- starlife.net.ua на 46.224.100.254 (CloudPanel, site user `starlifenet`, БД `starlifenet`) — див. handoff.md. Редизайн на прод ЩЕ НЕ деплоївся.
