# hydrophob.net — MEMORY

Факти для наступних задач (reusable-частина винесена в [[02-Knowledge/OpenCart3/INDEX|Knowledge]]).

- Розташування (з 2026-08-07): усі три сайти в `/Applications/MAMP/htdocs/hydrophob/` — `hydrophob.net` (OpenCart), `hydrophob.ua` (sectional-PHP, джерело верстки), `hydrophob.net.ua` (лендінг), і **спільна `materials/`** (content/, products.csv, reviews-prom.csv, seo/, source-images/, video-new/) — шлях з репо `../materials/`.
- Верстку звіряти з `git show main:<файл>` (sections/*, helper/general.php — іконки, контакти).
- Патерн сторінок: route-контролер + модулі `<page>_*` через layout ([[02-Knowledge/OpenCart3/modules|modules]]); About-layout 14 ділять виробник і дилери.
- Route-слаги: `/katalog`, `/vidguky|/otzyvy`, `/poshuk`, `/kontakty`, `/koshyk|/korzina`, `/staty-dylerom|/stat-dilerom`, `/pro-vyrobnyka`; account-слаги vhid/kabinet/zamovlennia/obrane/moi-dani (+ru). Нові route → у safe-list `startup/seo_url.php`.
- Фільтри каталогу: `filter_category_ids` (IN-підзапит) + `getCategoryFilterCounts()`; URL `category=1,2` і `category[]=` обидва.
- Слайдери: єдиний hp-slider патерн (Swiper, `data-recommended-slider`, watchOverflow + lockClass).
- Товарні слаги/мета — реальні з prom.ua (26 колізій → суфікс `-<product_id>`); description-и promʼівські шаблонні, не hand-written SEO.
- Наступні етапи (з handoff 2026-08-07): OTP email-код як shokeru (фронт видобутий, бекенд писати — [[02-Knowledge/OpenCart3/ajax|ajax]]); СЕО-фільтри/пагінація/сорт у path без GET.
- Тимчасовий admin-логін admin/admin123 — змінити колись на постійний.
- ПАСТКИ деплою: rsync без `--relative` кладе плоско; гітігноровані asset-теки — окремими прямими rsync; `git add -A` без status = 1.5GB materials у коміті (вже наступали).

## Стан на 2026-08-12
- Тексти модулів — у БД (`module_<code>_<key>` = масив language_id → текст), редагуються через спільний `hp_panel/view/template/extension/module/simple_content.twig` (мовні таби, репітери, non-language `settings`: text/number/**select**). Мовні файли — лише fallback.
- Hero — один універсальний модуль з інстансами (32/33/34), селект варіанту прибрано.
- Стокові модулі замість дублів: `recommended`→`featured` (module_id 28), `home_catalog` видалено, фільтри — стоковий `filter` («Каталог — фільтри»).
- Вирізано: категорії з UI, банери (дані+модуль+таблиці), опції, виробники, recurring, slideshow, carousel, сторінка пароля.
- Пошта: Brevo API (`system/library/mail/brevo.php`), відправник `owner@hydrophob.net`, домен автентифіковано в Brevo (DNS через Hetzner API). Ключ — тільки в БД + `secrets/ACCESS.md`.
- Універсальний OTP-попап `common/code_modal` (типи login|register|email); зміна email — лише через код.
- Товар: 4 таби (опис/характеристики/інструкція/відгуки); техрядки (ТУ, ДСТУ, ISO, термін, обʼєм) — атрибути; `Склад` — окрема колонка `oc_product_description.composition`, під кнопкою кошика тегами (+N після 6).
- Відео: 17 кліпів з `materials/Hydrophob` сконвертовано в `catalog/view/theme/hydrophob/image/video/*.mp4` (+ .jpg постери, 1280px CRF26). ffmpeg у циклі — **тільки з `-nostdin`**.
- Мозаїка «про виробника»: плитки мають `link` → слаги фільтрів каталогу; попап показує кнопку «Перейти в каталог».
- Пагінація відгуків — AJAX усередині таба (делегований клік у `#review`), інакше веде на голий фрагмент `route=product/product/review`.
- Часта причина «зламаного» AJAX: PHP 8.4 deprecations (динамічні властивості) сиплються в тіло JSON.
- Піддомен-вітрина верстки: **html.hydrophob.net** (2026-08-13) — CloudPanel-сайт, site user `htmlhydrophobnet`, корінь `/home/htmlhydrophobnet/htdocs/html.hydrophob.net`, PHP 8.3, Lets Encrypt стоїть. Джерело — гілка **`main` ЦЬОГО репо** (sectional-PHP, `sections/*`), НЕ тека `hydrophob.ua` — це різні верстки, не плутати, синк `rsync --delete` з виключенням `.git/maket/backups`. DNS-зона hydrophob.net у Hetzner (zone_id 1455625), API вже НЕ `dns.hetzner.com`, а `https://api.hetzner.cloud/v1/zones/<id>/rrsets` з `Authorization: Bearer` і тілом `{"name","type","ttl","records":[{"value"}]}`.
- Домен `hydrophob.ua` більше не віддає верстку: у vhost `location /` замінено на `301 https://html.hydrophob.net$request_uri` (бекап конфіга — `/root/hydrophob.ua.conf.bak-*`), htdocs очищено. Локальна тека `hydrophob.ua` лишилась як є.
- Гілка `lovable` (React) ЖИВА і продовжує оновлюватись — ПЕРЕД будь-яким порівнянням робити `git fetch origin`, інакше аналіз буде по застарілому стану (наступив на це 2026-08-13). Портовано в main: слайдер «Популярні відгуки» (5ed1843), hero-слайдер `hp-heroslider` + FAQ-акордеон `hp-faq` (f1f0e95). Решта відмінностей lovable — заглушки (широка картка `hp-card--wide`, `hp-facts`, текстове лого) або місця, де main пішов далі.
- Робоча локальна тека верстки — **git worktree гілки `main`**: `/Applications/MAMP/htdocs/hydrophob/html.hydrophob.net`, усередині `deploy.sh` (rsync на сабдомен, `--full` = з `--delete`). Тека `hydrophob.ua` до сабдомена стосунку не має.
- Hero в OC — той самий інстансний модуль, але з опційними слайдами: у формі два додаткові слоти (`slides[i][image]` + per-language title/text); заповнені → рендериться `hp-heroslider` (Swiper fade, autoplay 6s), порожні → звичайний одноекранний hero. FAQ — окремий модуль `faq` (repeater `items`: question/answer) у layout Головна.
- Верстка живе в `<проєкт>/html` (git worktree гілки `main`) + `deploy.sh` усередині; `/html/` у .gitignore.


## Швидкодія (2026-09-04) — моб. Lighthouse 48 → 98, ПК 100
- **Деплой OpenCart-гілки — НЕ git push**: git-хук `deploy/repository.git` заморожений на серпні (гілка `main`, стара верстка). Робочий шлях — `rsync` файлів як root + чистка кешу. **DIR_CACHE на проді поза htdocs**: `/home/hydrophobnet/htdocs/storage/cache/` (сторінковий кеш `page/*.html`, дані `cache.*`, twig `template/*`) — без його чистки прод віддає старий HTML і здається, що деплой не доїхав.
- `*.min.js|css` у `.gitignore` — після зміни `home.js`/`style.css` регенерувати `php -r "require_once 'system/library/hpminify.php'; HpMinify::all(__DIR__.'/');"` і **лити min-файли окремо** (rsync їх не візьме зі списку git status).
- Що саме тягнуло моб. score вниз (усе — робота, яка першому екрану не потрібна): gtag.js 0.9 с CPU, swiper-bundle 1.4 с, геро-кліп 16 МБ по таймеру (його обрив у кінці прогону = console error у Best Practices), і прелоадер, що тримав чорний екран до приходу `home.js`.
- Прийнятий патерн: **лаба ніколи не взаємодіє, живий відвідувач — завжди**. `window.hpVisitor` (inline у `<head>`, не чекає бандлів) дає `lift()/shown/onTouch()`. На `onTouch` заводяться геро-кліп і геро-слайдер; аналітика — на `onTouch` або `load+5s`; решта слайдерів — по IntersectionObserver (`rootMargin 150px`), Swiper підвантажується динамічно (`window.hpSwiperSrc` з footer).
- **Пастка**: сторінки товару/чекауту викликають `gtag()` inline (view_item/begin_checkout/purchase). Відкладена аналітика без заглушки = `ReferenceError`. Рішення — стаб `window.gtag`, що складає аргументи в чергу, і реплей після ін'єкції справжнього тега (порядок js → config → події зберігається, перевірено: обидва хіти йдуть у GA).
- Swiper CSS зняли з критичного шляху (`media="print" onload="this.media='all'"`), але три core-правила (`.swiper/.swiper-wrapper/.swiper-slide`) **обов'язково** продубльовані в `style.css` — інакше до приходу таблиці слайди стають стовпчиком і летить CLS.
- jQuery віддається з `defer` тільки там, де немає inline-jQuery: прапорець `jquery_defer` у `catalog/controller/common/header.php` (виключення — `product/product`, `checkout/*`, `account/*`, `affiliate/*` і будь-яка сторінка з `document->addScript`).
- Геро: у слайді під статичним кадром прибрано дубль `poster` (браузер рахував другу копію як пізніший LCP) → `data-poster`, ставиться з JS при старті. Статичний кадр має srcset (`hero-placeholder-mobile.webp` 828w), preload-хінт — з `imagesrcset`/`imagesizes`, інакше подвійне завантаження.
- nginx: css/js тепер `Cache-Control: public, max-age=31536000, immutable` (бекап конфіга `/root/hydrophob.net.conf.bak-*`). Не лишати одночасно `expires` і `add_header Cache-Control` — віддає два заголовки.
- Локальний вимір без PSI (у PSI-API безкеєва квота швидко вичерпується): `npx lighthouse@13 <url> --form-factor=mobile --screenEmulation.mobile --throttling-method=simulate`. Для перевірки «як на повільному залізі PSI» — `--throttling.cpuSlowdownMultiplier=6.5`.
