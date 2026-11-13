# Спрощена версія магазину автохімії для аудиторії 35–70 — бриф і промт для Lovable

Контекст: це окремий домен-сателіт у мультидоменній схемі autochemicals (варіант Б: окремий OpenCart зі своєю темою,
товари/залишки/ціни — з материнського сайту по API, ті самі product_id/категорії). Lovable робить лише верстку й UI;
структура даних (категорії, картка товару, кошик, чекаут) — як у матері.

## 1. Що варто зробити інакше, ніж на основному сайті (рекомендації)

### Принципи
- **Одна дія на екран.** Жодних каруселей, авто-слайдерів, відео-hero, паралаксів, hover-only ефектів. Усе, що важливе, видно одразу й не рухається.
- **Великий текст і контраст.** Базовий шрифт 18px (мінімум 16px для будь-якого тексту), заголовки 32–44px, line-height 1.6, вага від 400, жодних тонких (300) накреслень і сірого на сірому. Контраст WCAG AAA для тексту (≥7:1), AA — для кнопок.
- **Великі цілі.** Кнопки й пункти меню ≥ 52px заввишки, між ними ≥ 12px повітря; поля вводу 56px з підписом НАД полем (не placeholder).
- **Проста мова.** Без «гідрофоб», «нанокераміка», «детейлінг» у навігації — замість них: «Захист від води й бруду», «Щоб кузов блищав», «Для салону», «Для скла й дзеркал», «Для дисків і шин». Терміни — лише в описі, з поясненням у дужках.
- **Телефон — головний канал.** Номер великим у шапці на всіх екранах, кнопка «Передзвоніть мені» і «Замовити по телефону» на кожній картці. На телефоні — липка нижня панель: Каталог · Пошук · Подзвонити · Кошик.

### Структура
- Головна: 6–8 великих плиток-категорій «за задачею» з фото і підписом у 2–4 слова; під ними «Найпростіші набори» (готові комплекти 2–3 засоби з інструкцією), блок довіри (гарантія, повернення 14 днів, адреса, графік, реальне фото магазину/команди), 5 найчастіших питань великим текстом.
- Пошук: одне велике поле завжди на видноті + «Підібрати засіб» — майстер із 3 питань (Що чистимо? → Яка проблема? → Чим користуєтесь: рука/мийка?) → 3–5 товарів із поясненням «чому саме цей».
- Каталог: максимум 2 рівні, список фільтрів — 3–4 найважливіші (призначення, обʼєм, ціна), без «фасетного» нагромадження; пагінація кнопкою «Показати ще 12», не нескінченний скрол.
- Картка товару: велике фото, назва людською мовою, ціна 32px, наявність словами («Є в наявності, відправимо сьогодні»), один головний CTA «Замовити» + другорядний «Замовити по телефону». Нижче — «Як користуватись» у 3–4 кроки з іконками, «Для чого підходить / не підходить», відгуки великим текстом, «Часто беруть разом».
- Кошик/чекаут — один екран, 4 поля (імʼя, телефон, місто, відділення НП), оплата: при отриманні (за замовчуванням) або карткою; без обовʼязкової реєстрації — підтвердження коду **на телефон** (Viber/SMS/дзвінок), не на email; після замовлення — великий екран «Дякуємо, менеджер передзвонить протягом 10 хвилин» з номером замовлення.
- Кабінет мінімальний: мої замовлення + повторити замовлення одним натиском.

### Доступність і зручність
- Перемикач розміру шрифту «A / A+ / A++» у шапці (зберігається).
- Видимий фокус, підписи до всіх іконок, помилки форм словами під полем, без червоного-тільки-кольором.
- Жодних модалок на вході (кукі-банер — тонка смужка внизу з однією кнопкою «Зрозуміло»), жодних чатів-попапів, таймерів «акція закінчиться через…».
- Друк: сторінка товару й замовлення нормально друкуються (люди 60+ друкують інструкції).

### Чого НЕ переносити з основного сайту
- Велком-прелоадер і hero-відео, стікери «ТОП/NEW», скляні/темні блоки, дрібні надзаголовки, карусель категорій, теги-хмара, вкладки в картці (замість вкладок — усе по черзі вниз).
- Вхід/реєстрацію через email-код як обовʼязковий крок перед формами.

## 2. Промт для Lovable (візуал і UI) — окремо від основного сайту

> Вставляти цілком. Англійською — Lovable стабільніше тримає стиль; тексти в макеті робити українською.

```
Build a calm, high-legibility e-commerce website for car care products (shampoos, polishes, protective coatings, interior cleaners) aimed at customers aged 35–70 who are not confident with technology. This is a SEPARATE brand site that must look clearly different from a modern "detailing" store: no dark theme, no neon, no glassmorphism, no video hero, no carousels, no parallax, no hover-only interactions, no auto-playing anything.

VISUAL LANGUAGE
- Mood: trustworthy neighbourhood shop, daylight, clean garage, friendly staff. Think printed catalogue clarity, not tech startup.
- Palette: warm off-white background (#F7F5F0), ink text (#1E2A32), one deep accent for primary actions (#1F5FA8 blue) and one success green (#1F7A45) for availability; soft warm grey (#E6E2DA) for borders. No gradients, no more than these colours.
- Typography: humanist sans-serif with large x-height (IBM Plex Sans or Source Sans 3). Body 18px / 1.6, small text never below 16px, H1 44px, H2 32px, weights 400/600 only. Generous letter-spacing on buttons, never uppercase paragraphs.
- Shapes: 8px radius, 1px visible borders on cards and inputs, flat (no shadows beyond a subtle 0 1px 2px). Lots of white space; max content width 1200px; single-column on mobile.
- Imagery: large, bright product photos on white; lifestyle photos of people 40–65 using products on real cars in daylight. Simple two-colour line icons at 32–40px for steps and benefits.
- Motion: none except 150ms colour/underline transitions. Respect prefers-reduced-motion by default.

LAYOUT & COMPONENTS
- Header (sticky, 80px): logo left; large phone number with a phone icon and text "Дзвоніть: 9:00–19:00"; a prominent search field (56px tall, placeholder "Що потрібно почистити?"); "Кошик" button with count. On mobile: logo + phone call button + hamburger; plus a fixed bottom bar with 4 big items: Каталог · Пошук · Подзвонити · Кошик.
- Hero: static, two columns — plain headline "Засоби для догляду за авто, які легко підібрати", one sentence, two big buttons "Підібрати засіб" and "Дивитись каталог", and a trust row (free consultation, delivery by Nova Poshta, 14-day returns). Right side: one large product photo.
- Category tiles: 6–8 large cards (min 220px tall) with photo, short plain-language name ("Для кузова", "Для салону", "Для скла", "Для дисків і шин", "Захист від води й бруду", "Готові набори"), and a text arrow link. 2 columns on mobile, 3–4 on desktop.
- "Підібрати засіб" wizard: a 3-step full-width panel with radio cards (big icons + labels), progress "Крок 1 з 3", result list of 3–5 products with a one-line "Чому підходить".
- Product card (list): photo, name (2 lines max), price 24px bold, availability in words with a green dot, one primary button "Замовити" and a text link "Замовити по телефону". Min height for buttons 52px.
- Product page: gallery as a single large image with thumbnails below (no zoom popups); name, price 32px, availability, volume selector as big pill buttons; primary CTA "Замовити", secondary "Передзвоніть мені"; then sequential sections (no tabs): "Для чого підходить", "Як користуватись" (numbered steps with icons), "Склад і безпека", "Відгуки" (large text, name + city + date), "Часто беруть разом".
- Cart & checkout: one page, cart items on the left, a 4-field form on the right (Імʼя, Телефон with country flag, Місто, Відділення Нової пошти), payment radio cards ("Оплата при отриманні" selected by default, "Карткою онлайн"), one big "Підтвердити замовлення" button. Phone confirmation code screen with 4 big digit boxes and the text "Ми надіслали код у Viber/SMS".
- Thank-you page: huge check icon, order number 40px, "Менеджер передзвонить протягом 10 хвилин", the shop phone again, button "Повернутись у каталог".
- Footer: large links in 2–3 columns, full address, map link, working hours, phone, email; legal links last. Font 18px.
- Accessibility extras: a font-size switcher "A A+ A++" in the header; visible 3px focus rings; labels above inputs; error messages in words under the field; cookie notice as a slim bottom bar with one button "Зрозуміло".
- Pages to design: Home, Category list, Product page, Wizard, Cart/Checkout, Code confirmation, Thank you, Contacts, FAQ, Delivery & payment, Account (orders list with "Повторити замовлення").

Write all UI copy in Ukrainian, short and plain. Do not use words "детейлінг", "гідрофобний", "нанокераміка" in navigation or buttons.
```

## 3. Як це ляже в мультидомен
- Окремий OpenCart на новому домені зі своєю темою (порт із Lovable), товари/ціни/залишки — з матері по API; категорії «за задачею» — локальні колекції поверх материнських категорій (мапа «задача → category_id/фільтр»), щоб не ламати спільний каталог.
- Форми: на цьому сайті дозволити замовлення без email-входу — підтвердження коду на телефон; у матері це окремий прапорець сайту-сателіта (`site_auth_mode = phone`), ліди/замовлення йдуть у ту саму CRM.
- Відгуки — спільні з матері + свої, показувати лише текстові, великим шрифтом.
