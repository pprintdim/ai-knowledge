# stocrm — MEMORY

## Авторизація по логінах (2026-08-24)

Працівники входять коротким логіном без email: у формі «Працівники» поле «Логін» (латиниця), у БД зберігається як `<login>@autovibe.local`. `LoginRequest` шукає юзера по префіксу (`email LIKE 'login@%'`), тому legacy-акаунти `@mechora.ua` працюють і по повному email, і по короткому префіксу (`admin`). Unique перевіряється по префіксу через closure у Store/UpdateUserRequest. ForgotPassword по email лишився тільки для legacy.

## Друковані сторінки: два грабля (2026-08-24)

1) SPA-перехід на принт-сторінку міг успадкувати `pointer-events:none` на body від Radix-модалки — ВСІ кнопки мертві. Тому принт-лінки відкриваються `target="_blank"`, а принт-сторінки в mount чистять `document.body.style.pointerEvents`. 2) html2canvas не парсить oklch-кольори теми → «Зберегти PDF» на html2canvas-pro + jsPDF (растровий, порізаний на A4).

## Деплой ЗАВЖДИ повний: rsync + chown + кеші (2026-08-23, реальний 500)

rsync іде від root → файли в `storage/framework` стають root-owned, PHP-FPM (юзер `stocrm`) не може писати compiled views → **500 на всіх сторінках** ("tempnam(): file created in the system's temporary directory" у laravel.log). Сталося після двох «скорочених» деплоїв (rsync без chown). Правило: після КОЖНОГО rsync обовʼязково `chown -R stocrm:stocrm` + `config:cache && route:cache && view:cache` від stocrm, навіть для суто фронтових правок. Краще: додати `--exclude='storage/framework/*'` до rsync.

## Appointment → WorkOrder конвертація — фронтенд НЕ підключений

Бекенд-роут `POST /appointments/{id}/convert` існує, але жодна кнопка в UI його не викликає. Кнопка «Створити наряд» на Календарі просто веде на `/work-orders/new` з порожньою формою — клієнта й авто треба обирати вручну ще раз. Задокументовано як явне обмеження в `Pages/Instructions.tsx` (розділ «заявка → наряд»), реальний фікс (підключити фронтенд до існуючого роуту) — у TASKS.md.

## Dashboard "Активні наряди" — патерн для composite-статусних лічильників

`WorkOrderController::index()` фільтрував лише по ОДНОМУ статусу (`where('status', $status)`), тому картка дашборду, що рахує суму 6 нетермінальних статусів, не могла коректно deep-link'атись через `?status=X`. Рішення: `WorkOrderStatus::active()` (enum-метод, єдине джерело переліку) + спецзначення `status=active` в контролері (`whereIn`), відображене в фільтрі `WorkOrders/Index.tsx` як окрема опція "Активні (у роботі)". Патерн застосовний до будь-якого іншого composite-фільтра в цьому CRM (напр. якщо колись знадобиться "прострочені" чи інша група статусів).

## Демо-логіни — email-домен не чіпати без окремого запиту

`admin@mechora.ua` / `manager@mechora.ua` / `mechanic@mechora.ua` (пароль `password`) лишаються на цьому домені навіть після ребрендингу на AutoVibe — це живі записи у спільній прод+лок БД, зміна вимагає SQL UPDATE, користувач explicitly відмовився (2026-08-06/07).
