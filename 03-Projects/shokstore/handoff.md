> [!note] Імпортовано з `/Applications/MAMP/htdocs/shokstore/handoff.md` 2026-08-07 (DOCS-POLICY). Санітизовано секретів: 1. Оригінал: untracked, видалений.

# shokstore — handoff

## Стан на 12.07.2026

Проєкт — аналіз живого сайту **http://shokstore.com.ua** (інтернет-магазин електрошокерів, OpenCart 1.5.x, PHP 5.6, nginx, без HTTPS, мова RU) + **новий шаблон головної в `site/`** (працює на MAMP: http://localhost:8888/shokstore/site/).

## Новий шаблон (site/) — 12.07
- Зібраний з `html-templates/home-new.html` (наш дизайн, scoped `ss-*`) та `html-templates/home-old.html` (референс-прототип "shokeru.ua", React/Tailwind).
- Структура: `index.php` → інклюди `blocks/{header,hero-video,offers,editorial,recommended,video,footer}.php`; стилі окремо в `css/style.css`, JS окремо в `js/index.js`.
- Рішення користувача: слайдер зі старими JPG-банерами ВИДАЛЕНО; першою секцією йде hero з mp4-відео з home-old (`video/hero.mp4`, витягнутий з base64, 7.2 МБ; постер `images/hero-poster.webp` з shokeru S3).
- Лого: відтворене за лого ЖИВОГО сайту (PNG 217×125, `catalog/view/theme/default/image/logo.png` — червона блискавка + "SHOKSTORE.com.ua / ИНТЕРНЕТ МАГАЗИН") як SVG-блискавка (лайм-градієнт `--ss-primary`) + HTML-текст. У футері та сама розмітка, менша (id градієнта `ssBoltGradF`).
- Картинки товарів: у `site/images/` — 14 шт **webp (q95) з вирізаним фоном і ЗАТЕРТИМИ вотермарками**. Пайплайн: оригінали 700×467 з `/image/data/...` → WatermarkRemover-AI з проєкту shokeru (`/Applications/MAMP/htdocs/shokeru/shokeruParser/tools/WatermarkRemover-AI`, venv готовий, PYTHONPATH на папку) — але НЕ дефолтний промпт "watermark" (він майже нічого не знаходить), а мій скрипт: Florence-2 `<OCR_WITH_REGION>` → фільтр текстів-вотермарок (shok/store/телефони/оператори) → тайтові маски + фіксовані прямокутники для графіки (блискавка, life/мтс, київстар) → LaMa inpaint (CPU) → Vision subject lift → cwebp q95. Скрипти в scratchpad сесії (`wm_ocr.py`, `cutout.swift`) — тимчасові.
- Нюанси: LaMa лишає легкий "туман" де вотермарка лежала на корпусі (прийнятно в розмірі картки); для krait-928 (IMG_3856) туман був критичний — взято альтернативне фото комплекту IMG_3847 з тієї ж сторінки товару. Великі маски-прямокутники = сильний туман (не робити), Telea — ще гірше.
- В картках додано короткі описи (`.ss-card__desc`, line-clamp 3 рядки) — тексти з analysis/04-products.md.
- **Деплой: html.pprintdim.com** → сервер pprintdim (`cc623309@cc623309.ftp.tools`, пароль в `/Applications/MAMP/htdocs/pprintdim/.vscode/sftp.json`, тільки password-auth), папка `<REDACTED — див. ~/AI-Workspace/secrets/ACCESS.md>`. Заливка: `sshpass -e rsync -av site/ cc623309@...:/home/.../html/`. Плейсхолдер index.html хостингу видалено. Хостинг показує JS-челендж «Protected section» для curl — у браузері проходить сам; PHP на сервері рендерить сторінку коректно (перевірено CLI php84).
- Секції "Специальные предложения" (8 карток) і "Хиты продаж" (6) — горизонтальні слайдери `.ss-carousel` (scroll-snap + стрілки в шапці секції, 2/3/4 картки за брейкпоінтами, свайп на мобілці). Grid-стилі `.ss-grid*` видалені з CSS як зайві.
- YouTube внизу: замінено на `youtube-nocookie.com/embed/` + referrerpolicy, без loading="lazy" (раніше не вантажилось).
- У футері VK замінено на Facebook (VK заблокований в Україні — див. аудит).
- `html-templates/` лишились як джерела, не чіпати.

## Аудит (11.07)
- Повний обхід сайту: 143 сторінки (головна, 6 сторінок каталогу `/shop/*`, 16 інфо-сторінок, 120 товарів). sitemap.xml порожній — обхід робився по меню/лінках.
- Згенеровано звіти в `analysis/`:
  - `01-overview.md` — стек, структура, SEO-аудит з пріоритезованими проблемами
  - `02-structure.md` — дерево сайту + таблиця всіх 120 товарів
  - `03-seo-pages.md` — мета + повні тексти головної/категорій/інфо
  - `04-products.md` — мета + повні тексти всіх 120 товарів
  - `_stats.json` — сирі списки проблемних URL (дублі, довжини)

## Ключові знахідки (деталі в 01-overview.md)
- Критично: немає HTTPS, немає мобільної версії (без viewport), немає укр. версії, PHP 5.6 EOL, мертва аналітика (UA + Яндекс.Метрика).
- 51 пара товарів Standart/Platinum з однаковими description; 3 дублі title; canonical лише на товарах (нема на категоріях/головній); немає schema.org/OG; sitemap-фід вимкнено.

## Технічні нюанси
- Сервер нестабільний: періодично рве з'єднання (потрібні ретраї), robots.txt: Crawl-delay 5.
- Товарні ЧПУ — у корені (`/storm`), категорії — `/shop/*`, інфо — `/info/*`; дублі `index.php?route=…` редіректять на ЧПУ (302).
- Сирі дані обходу (HTML всіх сторінок + crawl_results.json + скрипти crawl.py/report.py/retry.py) — у scratchpad сесії `/private/tmp/claude-501/-Applications-MAMP-htdocs-shokstore/*/scratchpad/` — тимчасові, при потребі перегенерувати обхід заново.

## Незакрите / можливі наступні кроки
- Власник не ставив задач з правок — лише аналіз. Якщо буде продовження: пріоритети №1–4 з overview (HTTPS, адаптивність, укр. версія, оновлення платформи).
