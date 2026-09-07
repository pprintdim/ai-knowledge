# Єдиний функціональний стандарт натяжки на OpenCart 3

Всі натяжки (hydrophob.ua — еталонна реалізація, hydrophob.net, autochemicals,
shoker.in.ua) зводяться до ЄДИНОГО функціоналу — різна тільки верстка.
Цей файл — контрольний перелік того, що має бути в КОЖНІЙ натяжці, з
готовими патернами. Виконавцям (layout-porter, oc-module-builder, oc-launch)
читати перед роботою і НЕ перепитувати користувача про ці рішення.

## 1. Авторизація і кабінет — тільки OTP, тільки попап
- Паролів НЕМАЄ взагалі: і вхід, і реєстрація — одноразовим кодом з email.
  Бекенд: `common/user_popup/sendCode|verifyCode` (типи `login`, `register`,
  `email` — зміна пошти в ЛК, `review` — верифікація гостя для відгуку).
- Сторінок login/register/forgotten/reset НЕМАЄ: GET → 302 на
  `katalog?auth=login|register`, JS шапки автовідкриває auth-модалку
  (`?auth=` чиститься через replaceState). Фолбек-редірект — на КАТАЛОГ,
  не на головну (головна може бути intro без шапки).
- Auth-модалка: таби Вхід/Реєстрація; вхід = email + кнопка «Отримати код»;
  реєстрація = імʼя, email, телефон (маска), чекбокс згоди. Код-модалка на
  6 клітинок з таймером повторної відправки (`code_modal`).
- Кабінет: 3 розділи — профіль / замовлення / обране (+ вихід). УСІ інші
  стокові роути account/* (newsletter, reward, transaction, return, download,
  recurring, voucher, address) → 302 у кабінет; форма зміни пароля НЕ потрібна.
- `password` у customer = випадковий token(20) при OTP-реєстрації.

## 2. Телефони — intl-tel-input скрізь
- Всі поля телефону: `data-phone-input`, vendor `intlTelInput` (js+css+прапори
  webp у `catalog/view/theme/<тема>/vendor/`), ініт: `initialCountry: 'ua'`,
  `separateDialCode`, `strictMode`, `autoPlaceholder: 'aggressive'`,
  `placeholderNumberType: 'MOBILE'`, utils з CDN.
- Сабміт (capture-фаза, делеговано): у поле пишеться повний `+380…`.
- Бекенд-дубль нормалізації `normalizePhone()` у checkout / quick_order /
  account/edit (10 цифр з 0, 9 цифр, 12 з 380 → `+380…`).

## 3. Кошик/мінікошик/бейджі
- Реальний кошик: `checkout/cart/add|edit|remove` ajax; drawer перерендер з
  `common/minicart/ajax`; делеговані обробники (innerHTML підміняється).
- Бейджі шапки: `[data-cart-total]` і `[data-wishlist-total]` — ЧИСЛО у
  кружечку кольору акценту теми; оновлення при додаванні І видаленні
  (`hpSetBadge`). Порожньо → hidden.
- Порожній мінікошик: свій стан (іконка + текст + CTA в каталог) + грід
  «Вас може зацікавити» 2 колонки, МАКС 6, порядок: popular → bestseller →
  новинки. З товарами в кошику блок пропозицій НЕ показується.
- Напис «Безкоштовна доставка від N» — ТІЛЬКИ якщо `shipping_free_status`,
  сума з `shipping_free_total`, формат теми («2 000 ₴»). Те саме в чекауті.
- Вішліст: залогінений — ajax add + бейдж з `json.total` (парсити число);
  гість — тост «увійдіть/зареєструйтесь» + відкрити auth-модалку. Тост —
  `window.hpToast` (фіксований знизу по центру).

## 4. Мінікартки товару (плитки) — єдиний вид скрізь
- Одна розмітка `.product-tile` ВСЮДИ: модулі (bestseller/featured/special/
  recently_viewed), рекомендації категорії/каталогу, «Схожі товари» на
  сторінці товару. Плитка: стрілка, фото, div(категорія/назва/ціна),
  кнопка mini-add.
- Фото: tall-рендер верстки `catalog/view/theme/<тема>/image/products/
  <model>/main.webp`, фолбек — resize 338×702. CSS: фото займає всю ширину,
  `height: calc(100% - 180px)` (моб. −130px), `object-fit: cover`,
  `object-position: top`; текст і кнопка В ПОТОЦІ (не absolute).
- Кнопка «Додати» видима ЗАВЖДИ (не на ховері), внизу; стани `is-added`
  («Додано ✓», disabled) і `is-out` («Немає в наявності»). Спешел: стара
  ціна `<s>`.
- Модульні контролери віддають: product_id, in_stock (quantity>0), спешел,
  ціни через hryvnia()-формат теми («500 ₴»).

## 5. Відгуки
- Сторінка товару: вкладка «Відгуки» ЗАВЖДИ (порожній стан з відступом +
  кнопка «Залишити відгук»).
- Категорія/каталог: секція «Що кажуть про…» — модуль `category_reviews`,
  збирає відгуки з УСІХ товарів категорії (JOIN product_to_category,
  status=1, LIMIT 30, date DESC); вкладки «Відгуки» на цих сторінках НЕМАЄ.
- Універсальна модалка відгуку (review_form.twig): імʼя, EMAIL, ТЕЛЕФОН
  (маска), зірки, текст. Гість: сабміт → `{"verify":"email"}` →
  sendCode(type=review) → код-модалка (ctx.onSuccess = повторний сабміт) →
  верифікований email у сесії (`review_verified`) → публікація.
- `oc_review` розширена колонками `email`, `telephone` (ALTER при посадці;
  на MySQL 8 перед ALTER зняти NO_ZERO_DATE в сесії). Модель addReview
  повертає review_id.
- Кнопка «Переглянути на prom.ua»: `source_url` відгуку або загальний
  prom-лінк магазину; узагальнені лінки старого сайту в source_url чистити.

## 6. Чекаут (одна сторінка)
- Перевізники: Нова Пошта / Укрпошта / Meest (тарифи з
  `shipping_delivery_<code>_cost`); міста/відділення НП з
  `catalog/data/warehouses.json`.
- Безкоштовна доставка: `shipping_free_status` + `shipping_free_total`
  перекривають тарифи (cost=0) і на сторінці, і в confirm().
- Оплати ДИНАМІЧНО з конфігів: cod («готівка при отриманні»), wayforpay
  («карткою онлайн», тайтл з `payment_wayforpay_title<lang_id>`),
  bank_transfer («за реквізитами»). Мапа радіо: card/cash/bank.
- WayForPay-флоу: confirm() створює замовлення зі статусом 0, кладе
  `session payment_method`, віддає `json.payment='wayforpay'`; JS: fetch
  `wayforpay/confirm` (ставить pending) → fetch `wayforpay/pay` (роут-обгортка
  `setOutput($this->index())` — БЕЗ неї index() повертає рядок і роутер
  віддає порожнє) → інжект форми `#wayforpay_submit` → submit на гейтвей.
- Телефон з маскою, бекенд-нормалізація, `session order_id` для платіжки.

## 7. СЕО (фільтри включно)
- Слаги `oc_seo_url` на все: товари/категорії/роути/блог, обидві мови.
- Фільтри: слаги `filter_id=N`; seo_url розбирає `/katalog/<slug>[/<slug2>]`
  → `get['filter']=1,2`, outbound rewrite будує шлях назад. shop.php:
  `filter_filter` у getProducts, тайтл/мета/H1 з назв(и) фільтра.
  1 фільтр = індексується, self-canonical; 2+ = `X-Robots-Tag: noindex,
  follow` + canonical на чистий каталог. `?category=N` → canonical на
  сторінку категорії.
- Випадайка фільтрів: чекбокси всіх фільтрів з кількістю товарів;
  чек/анчек → location.href на СЕО-URL комбінації (стан завжди серверний);
  відкрита випадайка — з оверлеєм, Esc/клік по оверлею закривають.
- Теги товару = популярні пошукові запити: плашки з `#`, клік →
  `product/search?search=<тег>`. Значення тегів беруться з еталонного
  проєкту/prom, uk+ru (словник для коротких термінів).
- Sitemap: фід `extension/feed/google_sitemap` — індекс `/sitemap.xml`
  (nginx `location = /sitemap.xml { rewrite … }`) + секції
  `/sitemap/<pages|categories|products|posts>.xml` (розбирає seo_url),
  `sitemap.xsl` у корені. Без мовних префіксів у URL — БЕЗ hreflang.
  Фільтри-одиночки — у pages-секції.
- Індексаційний гейт: `config_noindex=1` → meta + X-Robots-Tag (header.php);
  robots.txt = Disallow all, поруч robots-live.txt (Allow + Disallow службові
  + `Sitemap:`). На запуск: зняти config_noindex + `mv robots-live.txt robots.txt`.

## 8. Оверлеї/попапи/повідомлення
- ВСІ попапи (мінікошик, auth, код-модалка, відгук, лайтбокси, випадайка
  фільтрів) закриваються по Esc і по кліку на бекдроп/оверлей.
- Всі async-форми: стан `is-busy` (пригасання + disabled кнопка), помилки
  текстом у формі (не alert), подяка/успіх станом форми.
- `window.hpToast(msg)` — глобальний тост; `input:-webkit-autofill` —
  прозорий фон (box-shadow inset transparent + text-fill currentColor).
- Стокове сміття: у common.js гард `if ($.fn.tooltip)` (без bootstrap).

## 9. Сторінка товару
- Галерея: головне фото — слайдер (стрілки-кружечки + свайп), синх з
  мініатюрами; мініатюри — горизонтальний слайдер без стрілок (overflow-x,
  scroll-snap, маска-затухання краю, схований скролбар), ресайз мініатюр
  `cover` (квадратні); клік по великому — лайтбокс FULL-зображень з
  перелистуванням і Esc.
- Сток-бейдж на фото НЕ дублювати — наявність у рядку покупки
  («Є в наявності · Обʼєм · Код» в один рядок).
- Панелі вкладок: відступ зверху від рядка вкладок (~26px).

## 10. Пошта, аналітика, інше
- Brevo HTTP API (`system/library/mail/brevo.php`), відправник
  `owner@<домен>`; ключ у config_mail_parameter, ніколи в репо.
- Quick order («купити в 1 клік») — лист менеджеру через Brevo, БЕЗ
  створення замовлення; сток-перевірка в UI і бекенді.
- Плитковий swiper каталогу: mousewheel ВИМКНЕНО (трекпад не має
  перемикати категорії).
- Категорійні фото-галереї: таблиця `oc_category_image`
  (category_image_id, category_id, image, sort_order).
- Тестові артефакти на ЛАЙВІ чистити одразу (клієнти/замовлення qa-*);
  локальні — за «го» користувача.
