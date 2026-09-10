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
- **Гілка `openCart` знову пушиться** (2026-09-04). Стояла з 24 серпня: коміт 7a6b0b7 приніс `instruction-01/02/03.mp4` по 108-123 МБ — понад ліміт файлу GitHub. Вичистив `git filter-repo --partial --refs openCart --invert-paths --path <3 файли>`; коміти до 24.08 зберегли SHA, тому пішло звичайним fast-forward без force. Файли лишились на диску і на проді, у `.gitignore` додано `catalog/view/theme/hydrophob/image/video/instruction-*.mp4`. Страхувальний ref `refs/backups/openCart-pre-rewrite` → 1d5a9f5. Решта кліпів у git (porsche-04, twerk-05 ~52 МБ) — GitHub лише попереджає, не блокує.

## Швидке замовлення, форми з підстановкою, фід Merchant (2026-09-07)
- **«Купити в один клік»** на сторінці товару — це ЗАЯВКА, не замовлення: запис у спільну таблицю `oc_lead` (form=`fast_order`), лист адміну, видно в адмінці Продажі → Заявки. Одна заявка на товар за сесію, далі кнопка «Заявку надіслано» (`fast_order_done` у сесії). Контролер `catalog/controller/common/fast_order.php`. Кошик на неї не впливає — свідоме рішення користувача.
- **Спільний патерн ідентифікації**: `catalog/model/tool/identity.php` + `.hp-lockfield` (CSS) + `hpIdentity` (home.js). Залогіненому поля підставляються й блокуються, олівець розблоковує на одну відправку; гість — `hpIdentity.ensure()` шле код і реєструє/логінить. Застосовано: відгук, форма дилера, контакти, попап швидкого замовлення. Гейт на формі вмикається атрибутом `data-lead-auth` + `'auth' => true` у реєстрі `common/lead.php` — знімається одним рядком.
- **OTP-двигун** `common/user_popup` дістав тип **`fast`**: реєстрація АБО логін залежно від того, чи є пошта в базі, без редіректу (віддає `identity`). Телефон для `fast` необовʼязковий (відгуку він не потрібен).
- `$mail->send()` в OTP тепер у try/catch — усі форми сайту тепер стоять на цьому листі, і незловлений виняток віддавав би HTML замість JSON.
- **Фід Merchant**: стоковий `feed/google_base` переписаний (гривня замість жорсткого USD, усі активні товари замість тільки змаплених категорій, бренд із налаштування `feed_google_base_brand` бо виробники не заповнені, дефолтна категорія `feed_google_base_category`, мова параметром `&language=ru-ru`). Ідентифікатори: **brand + mpn (артикул)**, не `identifier_exists=no` — Hydrophob сам собі виробник. Таблиць мапінгу в БД НЕМА (модуль не встановлювали) — фід це переживає через try/catch.
- **Пастка з картинками (виправлено 2026-09-07)**: у каталозі лежали 9 джерел по 8–26 МБ і до 9504×6336 (товари `2524820247`, `2524537265`) — GD на них вигрібав памʼять і фід падав. Зменшено до 2400px по довгій стороні (`magick -resize '2400x2400>' -quality 85`): 141 МБ → 1 МБ, візуально без втрат (фон рівний, webp його зʼїдає). Оригінали — `backups/oversized-images-*`. У фіді запобіжник лишається (`SOURCE_LIMIT` 4 МБ: якщо кеш ще не згенеровано, а джерело завелике — картинка пропускається, замість падіння всього фіда). Картинки каталогу **гітігноровані** — деплой окремим прямим rsync + чистка `image/cache/`.
- **Автокомпліт по товарах у проєкті ВЖЕ Є**: `catalog/controller/product/search_suggest.php` (title/price/image/href, ліміт 6) + фронт у home.js із дебаунсом 250 мс і розміткою `.hp-suggest`. Для форм із вибором товару переносити нізвідки не треба — лише додати `product_id` у відповідь.
- **Рішення по Merchant (5849192445)**: фід не подавати, поки ціни неактуальні — розбіжність ціни фід/сторінка дає `Mismatched value (price)`, а системна — ризик блокування за misrepresentation. Порядок: код + верифікація домену зараз, подача фіда потім. Доступ мені — через сервісний акаунт Google Cloud (Content API for Shopping), доданий користувачем у Merchant; ключ у `~/AI-Workspace/secrets/`.
- Дрібне: у `vendor/intlTelInput.css` шлях до прапорців був відносним і подвоювався (`vendor/catalog/view/.../vendor/img/`) — прапорці в телефонному полі не вантажились ніколи. Виправлено на `img/`.

## 2026-09-09 — html-сабдомен верстки знято
- Верстка = гілка `main` цього репо (pprintdim/hydrophob.net), останній знімок `22fbfb3` (+ hero-video.mp4 тепер у git).
- Сайт `html.hydrophob.net` видалено з CloudPanel (site user теж), A-запис `html` у зоні Hetzner видалено. Локальний worktree верстки прибрано; deploy.sh верстки більше нема.
- Верстку дивитись через git: `git show <гілка>:<файл>` або тимчасовий `git worktree add /tmp/wt <гілка>` (прибрати після).

## 2026-09-09 — СЕО зведено до спільного стандарту (24/24 інваріанти)
- seo_meta ожив: подія `catalog/controller/common/header/before → extension/module/seo_meta/apply`, вирізано well-специфіку (ocfilter/components ~310 рядків), таблиці `oc_seo_meta_robots/canonical` створено, `module_seo_meta_status=1`, стандартні шаблони, право `design/seo_meta`. SQL — `tools/unify-seo-20260909.sql` (ідемпотентний, застосовано).
- header.php: одне рішення про robots — гейт `config_noindex` → реєстр seo_meta → прямий виклик модуля; meta і X-Robots-Tag узгоджені. Перемикач індексації продубльовано в Налаштування → Сервер (без нього ключ зникав при збереженні налаштувань).
- shop.php: 1 фільтр = self-canonical, 2+/пошук/ціновий діапазон = noindex,follow + canonical на чистий каталог; пагінація в категорії більше не веде на весь каталог.
- seo_url.php: 301 з `?language=ru-ru` на `/ru/…` (ajax з `route=` не чіпає), ЧПУ `/poshuk/<запит>`. 404 з noindex. Мета головної — `catalog/language/*/common/home.php`.
- Каталог: у ua з net синхронізовано назви (65 рядків uk/ru), 2 ціни, 6 meta_title; у net з ua — 100 prom-шаблонних meta_description і 9 порожніх описів категорій.
- **Деплой**: `deploy.sh` у корені (gitignored, пароль site user береться з `.vscode/sftp.json`), rsync як `hydrophobnet`. Пастка: модуль читає таблиці seo_meta — при перенесенні на інший магазин спершу CREATE TABLE, потім файли, інакше 500 на каталозі.
