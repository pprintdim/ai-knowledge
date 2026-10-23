# brosse — контракти теми (фундамент: шапка/підвал/оверлеї/JS)

Тема `catalog/view/theme/brosse/` (зареєстрована як `config_theme=default`, `theme_default_directory=brosse`).
Верстка-джерело: `html/.output/public/*.html` (пререндер Lovable) + `html/src/**`. Класи беруться 1:1 звідти.

## 1. Карта файлів

| Що | Файл |
|---|---|
| CSS збірки (Tailwind з верстки, шрифт Seenonim → `../fonts/`) | `stylesheet/brosse.css` — НЕ правити руками |
| Доповнення / відсутні утиліти | `stylesheet/brosse-custom.css` |
| Шрифт | `fonts/seenonim-v1.otf` (+ Google Unbounded через `<link>` у шапці) |
| Уся поведінка (IIFE, vanilla, `defer`) | `javascript/brosse.js` |
| intl-tel-input | `vendor/intlTelInput.min.js`, `vendor/intlTelInputUtils.js`, `vendor/intlTelInput.min.css`, `vendor/img/*.webp` |
| Картинки верстки (читабельні імена) | `image/*.webp` (з 2026-10-18 лише webp, оригінали png/jpg прибрано): `brush-{premium,suede,crepe,classic,dauber,horse,light,mixed,dark}`, `brush`, `sneaker`, `sneaker-320`, `boot`, `box`, `box-{front2,back2,side2}`, `brushes-real`, `sneakers`. Постерів-файлів більше НЕ використовуємо (2026-10-20): постер = кадр із ролика, див. «Постери й мобільні фото» нижче; старі `*-poster.webp` лишились на диску як кандидати на видалення. `BrosseHome::media()`/`webp()` і `ControllerCommonWelcome::asset()` самі віддають webp-двійник для старих значень `….jpg/.png` у БД. Нова картинка теми — одразу webp (`cwebp -q 82 -m 6 -alpha_q 90`) |
| Зображення каталогу | `model_tool_image->resize()` кладе кеш у `.webp` (GD, альфа png зберігається); БД-шляхи на webp — `scripts/webp-migrate.php <root> --dry-run|--apply` (оригінали лишаються на диску) |
| Відео верстки | `image/catalog/video/{intro-block,hero-block-care,hero-boot,hero-coat,brosse}.mp4` (у шаблоні: `image/catalog/video/x.mp4` відносно `<base>`) |
| Лого / favicon | `image/catalog/logo.svg`, `image/catalog/favicon.png`, `favicon.svg`, `apple-touch-icon.png`; у розмітці — SVG-символ `#brosse-logo` (див. нижче) |
| Шапка | `controller/common/header.php` + `template/common/header.twig` + `language/*/common/header.php` |
| Підвал (+ рендер оверлеїв, brosse.js) | `controller/common/footer.php` + `footer.twig` + `language/*/common/footer.php` |
| Головна (лише слоти) | `controller/common/home.php` (+ рішення про вітальний тизер) + `home.twig` |
| Вітальний тизер (порт накладки hydrophob.net 1:1, класи `wl-*`) | `system/library/brosse/welcome.php` (`BrosseWelcome`, кука `brosse_welcome=shows|last|first`, налаштування `welcome_*`), `controller/common/welcome.php` + `template/common/welcome.twig` (інлайн-сценарій) + `stylesheet/welcome.css` (підключається лише при показі) + `language/*/common/welcome.php`; адмінка Дизайн → Вітальний тизер (`admin/controller/design/welcome.php`), посадка — `scripts/welcome-setup.php` |
| Мінікошик | `controller/common/cart.php` (`index/info/update/remove`) + `cart.twig` + `language/*/common/cart.php` |
| OTP-попап | `controller/common/user_popup.php` (`index/sendCode/verifyCode`) + `user_popup.twig` + `language/*/common/user_popup.php` |
| Купити в один клік | `controller/common/quick_order.php` (`index/order`) + `quick_order.twig` + `language/*/common/quick_order.php` |
| Серверні повідомлення → тост | `controller/common/alert.php` + `alert.twig` |
| Гарди роутів | `controller/account/{login,register,forgotten,reset}.php` → 301 на `common/home&auth=login|register` (ajax отримує `{redirect}`) |
| Прибрані роути кабінету | `controller/account/{wishlist,voucher,…}.php` → 302 на `account/account` (кабінет = профіль + замовлення) |
| Телефон на бекенді | `system/library/phone.php` (`Phone::normalize/valid/href`) + `controller/startup/phone.php` (POST `telephone`/`phone` → `+380…`, зареєстровано в `system/config/catalog.php`) |
| Гроші в текстах (`{uah:N}` → вибрана валюта) | `system/library/brosse/money.php` (`BrosseMoney`) + подія `controller/event/money.php` на `view/*/after`; міграція вмісту БД — `scripts/money-tokens.php` (див. §15) |
| `catalog/view/javascript/common.js` | стоковий, з гардами `if ($.fn.tooltip)` / `if ($.fn.button)` (bootstrap не підключений) |

Шлях до теми в шаблонах: `{{ theme }}` = `catalog/view/theme/brosse/` (віддають header і footer; у модулях ставити самому як рядок або через свій контролер).

## 2. `<head>` і скрипти

- Bootstrap, `stylesheet.css`, font-awesome — НЕ підключаються. Є `brosse.css` → `vendor/intlTelInput.min.css` → `brosse-custom.css`, cache-buster `?v=` = mtime файлів теми.
- **jQuery + `common.js` поки лишаються в `<head>` БЕЗ `defer`** — стокові сторінки (`product/*`, `checkout/*`, `account/*`, `information/*`) звертаються до `$` інлайн при парсингу. Коли всі стокові twig замінено — прибрати два рядки з `header.twig`. Нові шаблони теми на jQuery НЕ спиратись.
- Зберігаються `{{ styles }}`, `{{ scripts }}` (header/footer), `{{ links }}`, `{{ analytics }}`; гейт індексації `config_noindex` (meta robots + `X-Robots-Tag`) не чіпати.
- OG/Twitter (`common/header` → `og`): title/description документа, `og:type` = product на товарі, `og:url` = canonical (інакше поточна), `og:image` = реєстр `brosse_og_image` (товар кладе головне фото — png/jpg-оригінал поряд із webp), інакше `image/catalog/og-brosse.jpg` 1200×630. `<title>` отримує « — Brosse», якщо назви магазину в ньому нема.
- Активний пункт меню: `nav_active` (`products` — product/category|product, `shop` — checkout/checkout|cart, `contact`) → `text-accent` + `aria-current` у шапці, мобільному меню й підвалі.
- Підвал: `{{ cart }}` `{{ user_popup }}` `{{ quick_order }}` → `[data-toasts]` → `vendor/intlTelInput.min.js` (defer) → `javascript/brosse.js` (defer, `data-theme`).

## 3. CSS-конвенції

- Класи = Tailwind-утиліти з `brosse.css` (тільки ті, що були у React-джерелі). Перед тим як вжити клас, якого у верстці не було — перевірити: `grep -c '\.mt-1{' stylesheet/brosse.css`. Немає → додати в `brosse-custom.css` у секцію «утиліти, яких немає в збірці» звичайним CSS на токенах (`var(--accent)`, `--foreground`, `--border`, `--secondary`, `--muted-foreground`, `--destructive`, `--radius`).
- Стани теми: `.is-open` (шторка/модалка), `.is-busy` (форма/кнопка під час ajax), `.is-in` (reveal), `.is-hidden` (шапка), `.is-home` на `<body>` головної.
- Блокування прокрутки — класи на `<html>`: `menu-open`, `cart-open`, `modal-open` (`brosse.lock(name)`/`unlock(name)`); `wl-lock` ставить сервер (common/header) і знімає сценарій тизера.
- **Прелоадер-кружечок (2026-10-20, єдиний на тему, `brosse-custom.css`):** `.spin-host.is-loading` — кружечок 44px по центру (::after; дуга `--accent`), усередині `.spin-hide` ховається, `.spin-dim` приглушується; варіанти `.spin-sm`, `.spin-ink` (темне тло), `.spin-end` (праворуч у полі). Медіа: `data-spin-media` + `is-loading` у розмітці → `brosse.watchMedia(scope)` знімає на img load / video loadeddata|poster (плитки `product/tile`, слайди галереї). Кнопки: `brosse.setBusy(btn, on)` → `.btn-spin.is-loading` (напис ховається, кружечок кольору тексту; у кнопок з `.magnet-fill` — у круглому значку). Відео: `brosse.videoSpin(host, video, active?)` (`waiting` → показ, `playing|canplay|pause|error` → зняти) — герой, `[data-video-banner]`. Кошик: `[data-cart-content]` під час add/refresh/update/remove, ± і видалити `disabled`, бейдж `.is-updating`; `brosseCart.add` відкриває шторку одразу. Чекаут: підсумок (`spin-ink`) і підказки НП/Meest (`spin-sm spin-end`). `.wl-intro.is-loading` тизера — окремий, не плутати (генеричний спінер лише з `.spin-host`/`.btn-spin`). Reduced motion — 2.4 с на оберт.
- `.tap` — невидима зона дотику ±8px (для статичних іконок ≤28px; НЕ ставити елементам із `position:absolute`).
- Екран ≤390px: нічого дрібнішого за 12px для читабельного тексту. У верстці є `text-[10px]`/`text-[9px]`/`text-[8px]` у допоміжних підписах (бейджі, лічильники слайдерів, вертикальні написи) — лишаємо, але абзаци/описи/FAQ — `text-sm`+ на мобільному (додати `max-sm:text-sm` у custom, якщо треба).
- Знак brosse — партіал `common/logo` (порт LogoMark): типово `brand-fill-play` (заливка, коли знак уперше у вʼюпорті — `is-in` ставить brosse.js `initLogoFill`; далі «ss» + щітка) — шапка, мобільне меню, плашка товару, центр інтро; `still => true` — статичний (водяний знак підвалу, накладка відео-банера, верх 3D-коробки; у модулях головної — `logo_mark_still` з `BrosseHomeModule::logo()`); `draw => true` — тизер. Ролик `brosse-box-3d` прибрано зовсім (hero — 4 слайди, тизер — `brosse-packing-v2`).
- Лого (старий варіант через символ): `<svg viewBox="0 0 331 61" class="h-[1em] w-auto" role="img" aria-label="brosse"><use href="#brosse-logo"></use></svg>` — символ оголошений у шапці; розмір задається `text-*` на обгортці (`<span class="inline-flex text-2xl">`).

## 4. JS-глобали

```js
window.brosseToast(message, type)            // 'success' (типово) | 'error'/'danger' | 'info'; html обрізається до тексту
window.brosseCart.add(product_id, quantity, extra) // POST checkout/cart/add → тост → refresh → open(); extra = {'option[12]': 5}
window.brosseCart.update(cart_id, quantity)  // POST common/cart/update (0 = видалити)
window.brosseCart.remove(cart_id)            // POST common/cart/remove
window.brosseCart.open() / close() / refresh() / setCount(n)
window.brosseAuth.open('login'|'register' | {mode, redirect:'checkout'|'account'|'<своя https-адреса>'})
window.brosseQuickOrder.open(product_id, quantity, {name, price})
window.brossePhone.init(scope) / value(input) // повний +380… з поля з маскою
window.brosse = {url(route), post(route, data), lock, unlock, reveal(scope), openModal(el, lockName, panel), closeModal(el), collectToasts(scope), reducedMotion}
```
Подія `document` → `brosse:cart` (`detail = {html,count,total}`) після кожного оновлення кошика.
`brosse.url('common/cart/info')` → `index.php?route=…` відносно `<base href>`; `brosse.post` шле `X-Requested-With` і повертає JSON.

## 5. Делеговані data-атрибути (працюють на будь-якій розмітці, у т.ч. ajax-вставленій)

| Атрибут | Дія |
|---|---|
| `data-cart-add="<product_id>"` (+ `data-cart-quantity`, або `input[name=quantity]` у найближчій `form`/`[data-product]`; опції `option[...]` звідти ж) | додати в кошик, тост, відкрити шторку |
| `data-cart-qty="1|-1" data-cart-id data-cart-min` у `[data-cart-line]` з `[data-cart-line-qty]` | ± кількість (нижче мінімуму → видалити) |
| `data-cart-remove="<cart_id>"` | видалити |
| `data-cart-open` / `data-cart-close` | шторка |
| `data-cart-count` | бейдж-лічильник (у шапці ховається при 0) ; `data-cart-total` — сума |
| `data-quick-order="<product_id>"` (+ `data-quick-quantity`, `data-quick-name`, `data-quick-price`) | попап «купити в один клік» |
| `data-auth-open="login|register"` (+ `data-auth-redirect`) | OTP-попап; будь-яке `<a>` на `account/login|register|forgotten|reset` теж перехоплюється |
| `data-menu-open` / `data-menu-close` | мобільне меню |
| `data-phone-input` на `<input type="tel">` | маска intl-tel-input (UA типово, `separateDialCode`, `strictMode`); перед submit у value пишеться `+380…`; ajax-вставлені поля підхоплює MutationObserver |
| `data-toast="success|error"` на будь-якому елементі | показати його текст тостом і прибрати елемент (збирається на старті) |
| `data-reveal` (`""`, `"scale"`, `"left"`) + `style="--d:.12s"` | анімація появи; усе в `<main>` з `h1,h2,h3,p,img,video,form,li,button.group,a.group` позначається автоматично, окрім нащадків `[data-reveal]`, `.slide-in`, `[data-noreveal]` |
| `data-parallax="0.08"` | паралакс (вимкнено при reduced-motion) |

## 6. Розмітка секцій головної, яку очікує brosse.js

Класи — з `html/.output/public/index.html`, тут лише data-атрибути поведінки.

**Hero-слайдер** (`routes/index.tsx` HeroSlider):
```html
<section data-noreveal data-hero data-hero-interval="6500" class="container-site grid …">
  <div class="min-w-0">
    <div class="slide-in" data-hero-slide><h1>…</h1><p>…</p></div>      <!-- ×3, усі крім першого hidden -->
    <div class="slide-in" data-hero-slide hidden>…</div>
    <div class="mt-8 flex gap-2" role="tablist"><button role="tab" data-hero-dot class="h-2 rounded-full transition-all duration-500 w-10 bg-accent"></button><button role="tab" data-hero-dot class="h-2 rounded-full transition-all duration-500 w-2 bg-foreground/25 hover:bg-foreground/50"></button>…</div>
  </div>
  <div class="relative aspect-[9/10] …">
    <video data-hero-video data-hero-duration="6500" poster="{{ theme }}image/hero-poster.jpg" muted loop playsinline preload="auto" class="absolute inset-0 h-full w-full object-cover object-top transition-all duration-1000 scale-100 opacity-100"><source src="image/catalog/video/hero-block-care.mp4" type="video/mp4"></video>
    <video data-hero-video data-hero-duration="20000" poster="…brosse-set-presentation-poster.jpg" muted loop playsinline preload="metadata" class="… scale-110 opacity-0"><source src="…brosse-set-presentation.mp4" type="video/mp4"><source src="…brosse-set-presentation.webm" type="video/webm"></video>  <!-- до 5 у порядку слайдів; webm і poster необовʼязкові, data-hero-duration (мс) перекриває data-hero-interval для цього слайда -->
    <button data-hero-mute data-label-on="Вимкнути звук" data-label-off="Увімкнути звук" aria-label="Увімкнути звук" class="absolute right-5 top-5 …"><svg data-hero-icon="off">volume-x</svg><svg data-hero-icon="on" hidden>volume-2</svg></button>
  </div>
</section>
```
JS: автозміна кожні `data-hero-interval` мс (не при reduced-motion), крапки, відео активного слайда грає з початку, решта на паузі; звук — `sessionStorage['brosse-sound']`.

**Слайдер щіток** (BrushSlider):
```html
<section data-noreveal data-brush-slider data-brush-interval="7000" data-brush-rotate-active="-62" data-brush-rotate="-20">
  <div class="slide-in md:pb-16" data-brush-slide>…назва/текст/кнопка…</div>   <!-- ×5, крім першого hidden -->
  <img data-brush-image src="{{ theme }}image/brush-premium.png" class="absolute left-1/2 top-[42%] h-[95%] w-auto max-w-none drop-shadow-2xl transition-all duration-700 opacity-100" style="transform:translate(-50%,-50%) rotate(-62deg) scale(1)">
  <img data-brush-image … class="… pointer-events-none opacity-0" style="transform:translate(-50%,-50%) rotate(-20deg) scale(0.8)">  <!-- ×5 -->
  <button data-brush-prev aria-label="Попередня щітка">…</button><button data-brush-next aria-label="Наступна щітка">…</button>
  <span data-brush-counter class="absolute right-3 top-1 text-[8px] opacity-70">01/05</span>
</section>
```

**Лічильники** (CountUp): `<span data-count-to="24" data-count-prefix="+ " data-count-suffix="k">+ 0k</span>` (необовʼязково `data-count-duration="1400"`); стартує при появі у вʼюпорті.

**FAQ**:
```html
<section data-faq data-faq-open="0" class="container-site py-20">
  <div data-faq-item class="border-b border-border">
    <button type="button" data-faq-toggle aria-expanded="true" class="flex w-full items-center justify-between gap-4 py-6 text-left text-xs uppercase md:text-sm"><span>01</span><span class="flex items-center gap-3">Питання<svg data-faq-icon="minus" class="h-4 w-4">minus</svg><svg data-faq-icon="plus" class="h-4 w-4" hidden>plus</svg></span></button>
    <p data-faq-answer class="pb-8 text-xs leading-relaxed text-muted-foreground md:mx-auto md:max-w-2xl">Відповідь</p>
  </div>
  …
</section>
```
Одна відкрита відповідь; `data-faq-open="-1"` — усі закриті.

**Відео-банер** (VideoBanner / useVideo; той самий контракт для відео на сторінці товару):
```html
<div data-video-banner class="relative overflow-hidden rounded-[2.5rem] bg-ink">
  <video data-vb-video src="image/catalog/video/brosse.mp4" poster="{{ theme }}image/poster.jpg" muted loop playsinline preload="metadata" class="h-[420px] w-full object-cover md:h-[600px]"></video>
  <div data-vb-when="paused" class="pointer-events-none absolute inset-0 grid place-items-center …"><svg><use href="#brosse-logo"></use></svg></div>
  <div class="absolute bottom-6 right-6 flex …">
    <button data-vb-play aria-label="Play" class="grid h-8 w-8 place-items-center rounded-full border border-ink-foreground">play</button>   <!-- при відтворенні + bg-accent border-accent -->
    <button data-vb-pause aria-label="Pause" class="…">pause</button>
    <button data-vb-mute aria-label="Звук" class="opacity-50">volume</button>                 <!-- opacity-50 = muted -->
    <span class="relative hidden h-px w-24 bg-ink-foreground/30 sm:block"><span data-vb-progress class="absolute inset-y-0 left-0 bg-accent" style="width:0%"></span></span>
  </div>
</div>
```
**Ліниве відео (2026-10-18):** усе нижче першого екрана й неактивні слайди героя — `preload="none" data-lazy-video data-preload="metadata|auto"` + `data-src` на `<video>` або на його `<source>`. `brosse.hydrateVideo(v)` переносить data-src → src; IntersectionObserver (rootMargin 300px) гідрує все поза героєм, герой — активний слайд і наступний за 3 с до показу, `data-vb-play` — перед play. Мобільні копії (`event/video_mobile`) підставляються прямо в `data-src`; для `<video>` з `<source>` mp4+webm копія робиться лише з mp4, на телефоні webm-джерело прибирається (`data-mobile-drop` для вузького вікна на ПК).

**Постери й мобільні фото (2026-10-20, як у hydrophob):**
- Постер будь-якого `<video>` — кадр із самого ролика: `model_tool_poster->pair($video, $second, $override)` → `['poster' (до 1080px), 'poster_mobile' (theme_default_poster_mobile_width, типово 720)]`. Кадр ріже ffmpeg (jpg) → GD webp, кеш `image/catalog/video-posters/<імʼя>-<md5(шлях|сек|mtime)>.webp`, розміри — `tool/image::fit()` (`image/cache/…-WxHf.webp`, пропорційно, без полів). Типова секунда — 1 с; `brosse-packing*` — 4 с, `brosse-welcome*` — 2 с (`ModelToolPoster::$seconds`).
- Адмінка: поле «Постер (необовʼязково)» = лише заміна кадру картинкою; «Кадр постера, с» (тип схеми `seconds`, порожньо = авто) — home_hero (кожен слайд), home_video, Дизайн → Вітальний тизер (`welcome_poster_second`). Дизайн → Теми: `theme_default_image_mobile_width` (800) і `theme_default_poster_mobile_width` (720).
- Розмітка: `poster` — для першого екрана (слайд 0 героя, перший слайд галереї товару, тизер), `data-poster` — для решти (ставить `brosse.hydrateVideo` / `brosse-product.js hydrate`); `data-poster-mobile` — легкий кадр: на телефоні `event/video_mobile` підміняє його в розмітці (UA, `BrosseDevice::phone()`), на вузькому ПК — перемикач у `<head>`. Шапка: `brosse_preload_image(_mobile)` → preload лише мобільного на телефоні, на ПК — обидва з `media`.
- Фото: `<picture class="bp-pic"><source media="(max-width: 767px)" srcset="…">` (`.bp-pic{display:contents}`) — плитка `product/tile` (480×600 → 360×450), галерея товару (оригінал → `fit` 800), картка набору, слайдер щіток головної (`fit` по висоті 640). Мініатюри галереї й прев'ю — `fit` коротшою стороною 240 (не оригінали).
- Відеобанер (`home_video`): лого поверх ролика на паузі прибрано зовсім (`show_logo_overlay` видалено зі схеми). Посадка даних — `scripts/posters-auto.php <root> --dry-run|` (чистить старі статичні постери в module_home_hero/home_video і welcome_poster).

`data-vb-when="playing|paused"` — елементи, що показуються лише в цьому стані (на товарі: кнопка Play — `paused`, прозора кнопка-пауза на весь кадр — `playing`).

**3D-коробка** (Box3D): інтро малює її з `box-spin` (авто). Для скрол-версії на головній — відтворити розмітку з `index.html` (face-дiви зі `style`), обертання за скролом писати в модулі (brosse.js її не анімує — це єдине, що не портовано; за потреби додати `[data-box3d]` у brosse.js).

**Інтро `home_intro` → товари (2026-10-20):** щітки й коробка привʼязані до товарів полем схеми `product` (`rows.items[].shared.product_id`, `shared.box_product_id`, типово 6 = BR-SET). Щітка = `<a class="hm-intro-brush" href="SEO товару">` (фото+підпис), підпис порожній → коротка назва товару без «Brosse » (`uppercase`), фото порожнє → головне фото товару (`fit` по висоті 480); рядок без product_id шукає товар за підписом. Коробка: `data-box3d-href` — клік, якщо вказівник зсунувся ≤ 6px (`brosse-home.js`, pointercancel = не клік), плюс посилання `a.hm-intro-box-link` під коробкою (`box_caption`, мовне; 44px). Посадка старого вмісту: `php scripts/intro-products.php <root> --dry-run|--apply`.

**Типи полів схеми (адмінка, `admin_module.php` + `home_form.twig`):** `product` — select активних товарів, зберігається int; `link` — select «Типово / Каталог (`shop`) / Сторінки / Категорії / Товари / Своє посилання…», постить текстове поле (зберігається маршрут `product/product&product_id=N`, `information/about`, `shop`, '' або сира адреса; старі `index.php?route=…` нормалізує `BrosseHome::linkValue()`), підпис «Типово» — `text_link_default_<поле>`. Рядки повторювачів шлють `_src` (індекс збереженого рядка) — `sanitize` переносить з нього мови, яких нема у формі (вимкнена en-gb більше не губиться при збереженні).

## 7. Картки товару / сторінка товару

```html
<form data-product><input type="hidden" name="quantity" value="1">
  <button type="button" data-cart-add="{{ product_id }}" class="…">Додати до кошика</button>
  <button type="button" data-quick-order="{{ product_id }}" data-quick-name="{{ name }}" data-quick-price="{{ price }}" class="…">Купити в один клік</button>
</form>
```
**Обраного («Обране», wishlist) у темі НЕМАЄ** (прибрано 2026-10-18): ні сердечок на плитках/товарі, ні пункту в кабінеті, ні `[data-wishlist-*]`, `brosseWishlist`, події `brosse:wishlist`; `account/wishlist` (і `/add`, `/remove`) → 302 на кабінет, `user_popup` гостьовий вішліст після входу не переносить. `brosse-account.js` підключається лише на `account/edit`. Ядрова `model/account/wishlist.php` і стокові мовні файли лишились (не заважають).

Або з JS: `brosseCart.add(id, qty)`, `brosseQuickOrder.open(id, qty, {name, price})`. Опції товару — `select/input name="option[…]"` у тій самій формі підхоплюються автоматично; якщо стоковий `checkout/cart/add` поверне `redirect` (обовʼязкова опція), сторінка перейде на товар.

## 8. Серверні повідомлення

`{% include %}` у темі НЕ працює (ArrayLoader), тому два способи:
1. У контролері сторінки: `$data['alert'] = $this->load->controller('common/alert', array('success' => $success, 'error' => $error_warning));` і `{{ alert }}` у twig (рендерить `<script>` у чергу `window.brosseToastQueue`, brosse.js показує після старту).
2. Без PHP: `{% if success %}<div data-toast="success" hidden>{{ success }}</div>{% endif %}` / `data-toast="error"`.
Стокові `.alert.alert-success|danger|warning` на старті теж перетворюються на тости.

## 9. Ajax-контракт форм (user_popup, quick_order, чекаут далі)

Успіх `{success:true, message[, redirect]}`; помилка `{error:"<перший текст>", errors:{"<поле>":"<текст>"}}`. У JS — `showErrors(form, json, prefix, box)`: інлайн під полем `[data-<prefix>-field-error="<поле>"]`, поле `[data-<prefix>-input="<поле>"]` отримує `border-destructive`, решта — у `[role=alert]` + тост. Бекенд: `$json['error']['<поле>']`, в кінці `formJson()` (у обох контролерах).

## 10. Телефон

Поле: `<input type="tel" name="telephone|phone" data-phone-input autocomplete="tel" inputmode="tel">`. Маска ставиться сама (також для ajax-вставлених). На submit (capture) і blur у value пишеться повний міжнародний номер; `brossePhone.value(input)` — те саме для ajax-відправок. Бекенд: `startup/phone` нормалізує POST `telephone`/`phone` до `+380…`; у власних контролерах — `$this->load->library('phone'); Phone::normalize($v); Phone::valid($v)`.

## 11. OTP-вхід

`common/user_popup/sendCode` (POST `type=login|register`, `email`, для register `firstname`, `telephone` (необовʼязковий), `agree=1`) → код у сесії (`otp`: 10 хв, 5 спроб, повтор через 55 с), лист через `Mail(config_mail_engine)` (brevo, ключ у `config_mail_parameter`, відправник `config_email`). `verifyCode` (POST `email`, `code`, `redirect`) → логін (register — створення покупця з `token(20)`-паролем) → `{redirect}`. `?auth=login|register|1` на головній автовідкриває попап. Згода — посилання на інфо-сторінку з `config_account_id`, якщо задано.

## 12. Налаштування, які читає тема (`$this->config->get()`; SQL не виконувався — завести в адмінці/SQL самому)

| Ключ | Де | Дефолт |
|---|---|---|
| `brosse_shop_category_id` | «Купити» в шапці/меню, CTA порожнього кошика | перша верхня категорія, інакше `checkout/cart` |
| `config_instagram`, `config_telegram` | іконки в підвалі (є завжди, як у верстці) | порожньо = посилання `#` |
| `brosse_developer_url` | посилання «Розроблено: projectnine» | `#` |
| `brosse_quick_order_email` | адреса менеджера для «купити в один клік» | `config_email` |
| `config_account_id` | інфо-сторінка в рядку згоди OTP-реєстрації | без посилання |
| `config_mail_engine`, `config_mail_parameter`, `config_email`, `config_name` | листи OTP / quick order | — |
| `config_noindex` | гейт індексації (як було) | — |
| `welcome_status`, `welcome_days`, `welcome_max_shows`, `welcome_chance`, `welcome_min_gap_hours`, `welcome_video`, `welcome_video_mobile`, `welcome_poster`, `welcome_logo` (код `welcome`) | вітальний тизер: перший візит завжди, далі в межах вікна до N випадкових показів; `?welcome=1/0` форс/скіп; боти ніколи | 1 / 30 / 3 / 20 / 6 / `catalog/video/brosse-packing-v2.mp4` (+ webm-двійник поряд підхоплюється сам як запасне джерело; відео `object-fit: cover` на весь екран) / — / `brosse-packing-poster.jpg` теми / вбудований SVG |
| `theme_default_image_cart_width/height` | мініатюра в шторці | 160×160 |

Усі `config_*`/`brosse_*` ключі без поля у формі Налаштувань згорять при збереженні (див. глобальне правило про `editSetting`) — у проєкті вже є фікс перенесення відсутніх ключів, але для редагованих треба завести поля.

## 13. Що лишилось стоковим (заміняють інші агенти)

`template/product/*`, `checkout/*`, `account/*`, `information/*`, `error/*`, `extension/*`, `mail/*`, `common/{success,maintenance,column_left,column_right,content_top,content_bottom}.twig`. Вони рендеряться всередині `<main id="main">` без bootstrap (є мінімальний `main > .container` у custom). Після заміни останньої — прибрати jQuery/common.js із `header.twig`.

## 14. Відомі нюанси

- Локально `config_url`/`config_ssl` у БД = `https://brosse.com.ua/`, тому `<base href>` і редіректи ведуть на прод; для перевірки в браузері локально треба локальні значення цих ключів (або підміна base).
- `oc_translation` відсутня в локальній БД — стоковий `event/translation` пише warning у `error.log` на кожен запит (не повʼязано з темою).
- Навігація за брифом: Продукція → `information/about`, Купити → категорія, Про нас (підвал/мобільне меню) → `information/about`; якщо «Продукція» має вести на сторінку товару — змінити `$data['products']` у header.php і footer.php.

## 15. Суми в текстах ідуть за валютою (`{uah:N}`)

- У будь-якому тексті — мовні файли, модулі головної/«Про нас», описи товарів/категорій/інфо-сторінок, мета, налаштування — суму пишемо **токеном у гривнях**: `Доставка — від {uah:60}, від {uah:4000} — безкоштовно.` Хардкод «4000 грн» не писати: при $ / € він лишиться гривнею.
- На виході подія `event/money` (`view/*/after`, зареєстрована в `system/config/catalog.php`) міняє токен на `currency->format(N, валюта)`: «4 000 грн.» / «$96.39» / «€88.89». Крапка одразу після токена в кінці речення не подвоюється («{uah:60}.» → «60 грн.»). Копійки — `{uah:899.5}`.
- Валюта: реєстр `brosse_money_currency` → сесія → `config_currency`. Листи замовлення (`mail/order` add/edit/alert) кладуть у реєстр валюту замовлення.
- Що йде повз шаблон (JSON, `setOutput` напряму) — `require_once DIR_SYSTEM.'library/brosse/money.php'; BrosseMoney::apply($this->registry, $text_or_array)`. Уже так: `information/information/agree`.
- Ціни/пороги, які рахує контролер (знижка від N шт., безкоштовна доставка на товарі й у чекауті, тарифи доставки) — як і раніше `$this->currency->format()` у контролері + `%s` у мовному файлі.
- Лічильник `home_stats`: пункт із суфіксом/префіксом «грн» / «₴» / «UAH» конвертується сам (число лічильника — у вибраній валюті, `data-count-decimals`, у кінці `data-count-final` = готовий формат). Значення в адмінці — у гривнях.
- Міграція старого вмісту: `php scripts/money-tokens.php <SITE_ROOT> [--dry-run|--apply]` (типово dry-run, ідемпотентний, prepared statements, JSON у `oc_setting`/`oc_module` пише тими ж прапорцями). Наприкінці — список «лишилось без токена» (діапазони «60–100 грн», суми, розірвані тегами) — правити руками.
- Обмеження: токен у тексті, який контролер обрізає (`utf8_substr` у сніпетах пошуку/категорії), може розірватись і лишитись сирим; введений користувачем `{uah:…}` (пошук) теж форматується — нешкідливо.
- **Редакторам (адмінка):** у текстових полях модулів, описах і мета суму писати як `{uah:500}`.


## 16. Мапа магазину (Leaflet) і колонка «Покупцям» (2026-10-20)

- **Мапа**: партіал `controller/common/map.php` (`variant` = `page` | `footer`) + `template/common/map.twig`; налаштування/типові — `system/library/brosse/map.php` (`BrosseMap`), адмінка — Налаштування → Brosse → «Мапа» (`brosse_map_status`, `brosse_map_footer`, `brosse_map_lat/lng/zoom`, `brosse_map_label[language_id]`, код `brosse`); посадка — `scripts/map-setup.php <root> [--sql|--dry-run]`. Без рядків у БД діють типові (увімкнено, 50.454175 / 30.640155, zoom 15).
- Leaflet 1.9.4 — локально `vendor/leaflet/`; вантажить `brosse.js initMaps()` лише коли `[data-brosse-map]` за 400px від вʼюпорта. Тайли — Esri Light Gray Base + Reference (без ключа), запасні — OSM. **CARTO Positron з 2026 без API-ключа малює «API KEY REQUIRED» — не використовувати.**
- Поведінка: колесо лише після кліку/фокусу (підказка поверх), на дотик — двома пальцями (`dragging:false`, touchZoom пересуває), на телефоні без кнопок +/-; reduced motion — без анімацій. Спінер — `.spin-host.is-loading` до першого `load` тайлів (або 8 с).
- Підвал: мапа ≥768px (на телефоні `display:none` → IO не спрацьовує, Leaflet не вантажиться), на `information/contact` у підвалі не рендериться. Класи `bmap*`, `footer-grid`, `footer-info`, `footer-meta`, `footer-map` — `brosse-custom.css`.
- **«Покупцям»**: третя група «Меню сайту» `footer_info` (`brosse_menu_footer_info`); нічого не збережено → усі інфо-сторінки зі `status=1` за `sort_order` (`BrosseMenu::informationItems()` + 3-й аргумент `items()`). Ті самі пункти — бокова колонка на `information/information` (`info_nav`).
