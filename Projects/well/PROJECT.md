# well — PROJECT

- **Repo**: локально `/Users/pprintdim/Desktop/vs_projects/well` (симлінк `/Applications/MAMP/htdocs/well`); origin `pprintdim/wellua`; серверний дзеркальний repo `shcherbaks/well-opencart` (**синк ТІЛЬКИ сервер→git щогодини; push туди НЕ деплоїть**)
- **Stack**: OpenCart 3.0.4.1, тема `well`, Lightning (кеш сторінок), Cloudflare-проксі
- **Прод**: well.ua за Cloudflare — назовні лише 80/443; SFTP `well.ua:2222` мертвий, MySQL ззовні закритий (блокер: чекаємо доступ від Stan — прямий IP/SSH або DNS-only субдомен)
- **Кастомні модулі**: система `up_search_*` (~40 файлів), ai_translate, seo_meta, pilibaba, cartlink, crmbridge, OCFilter, rozetka_delivery_cron, блог-модулі (blogcategory/blogsearch/...); `ocmod/pprintdim_ai_reviews/` — не трекається, не чіпати при синках
- **Локальний стенд**: MAMP підготовлений (config.php локальні, серверні в `*.server.php.bak`), БД `well_ua` порожня — чекає дамп від користувача через FastPanel
- **Deploy-нюанси**: після заливки PHP — OPcache reset (тимчасовий файл з `opcache_reset()`); twig — чистити кеш Lightning в адмінці; Cloudflare purge — токен просити в користувача
- **НЕ чіпати без Stan**: верх `catalog/index.php` (анти-бот), `robots.txt` (Merchant Center), налаштування Lightning/Cloudflare
- **Майбутній флоу**: clone → гілка → PR → review → merge → деплой, тест на dev.well.ua

Актуальний стан — `handoff.md` в корені repo.
