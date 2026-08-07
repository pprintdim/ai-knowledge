> [!note] Імпортовано з `/Applications/MAMP/htdocs/stocrm/handoff.md` 2026-08-07 (DOCS-POLICY). Санітизовано секретів: 5. Оригінал: untracked, видалений.

# Mechora — handoff

## Стан на зараз (2026-08-02, пізня сесія)

**Laravel 13 + Inertia.js + React + TypeScript**, локально й на проді. Активно
реалізується повна специфікація Mechora (мінi-CRM для СТО) — модель за
моделлю, повний стек кожного разу: міграція → модель (`toFrontendArray`) →
Policy → Form Request(и) → контролер → real Inertia props замість mock →
curl-перевірка (create/read/update/delete, авторизація по ролях) → коміт →
періодичний деплой.

**Працюю за стоячою інструкцією користувача**: рухатись до фіналу всієї
специфікації без проміжних питань, і повідомити лише коли дійсно готово
("як зафіналиш все то маякуй").

## Реалізовано реальним стеком (не mock) станом на зараз

- **Client, Vehicle** — повний CRUD, дублікат-перевірка VIN/держномер із
  `owner`-override.
- **Appointment** — CRUD, конфлікт-детекція механіка (виправлено NULL
  `end_at` баг через `COALESCE`), конвертація в WorkOrder.
- **RepairWork (каталог робіт), Supplier, Part/Stock** — CRUD,
  `InventoryService` з row-level locking (`lockForUpdate`), приховування
  закупівельної ціни від механіка.
- **WorkOrder** — повний життєвий цикл: works/parts/diagnostics/payments,
  `WorkOrderCalculatorService` (єдине джерело фінансових формул, ніколи не
  дублюється на фронтенді), `WorkOrderStatusService` (переходи статусів,
  снапшот при готовності/видачі), нумерація `WO-YYYY-NNNNNN` через
  `SequenceGenerator` (лочена послідовність, безпечна для конкурентності).
- **Expense/ExpenseCategory + FinanceService** — Finance і Payments сторінки
  на реальних агрегатах (дохід/витрати/прибуток за період), а не
  client-side підсумовуванні mock-масиву.
- **Employees (User CRUD)** — тільки owner, лок/розлок акаунтів
  (self-lock заблоковано).
- **Settings** — реальний `Settings` service, включно з тим, що
  appointment/work-order префікси нумерації тепер реально читаються з
  налаштувань (раніше були захардкожені `AP-`/`WO-`).
- **Global search** (Cmd+K) — `/search`, рольово-скоупований на бекенді
  (клієнти/авто приховані від механіка, наряди — тільки свої).
- **Dashboard** — реальні агрегати (активні наряди, черга заявок, дохід,
  борги, low-stock тощо), скоуповано по ролі механіка.
- **VehicleRecommendation, Attachment** — реальні моделі. Файли — приватний
  диск (`storage/app/private`), скачування тільки через авторизований
  роут `/attachments/{id}/download`, ніколи публічно. MIME/розмір
  валідуються на аплоаді.
- **Print-документи** — `Print/WorkOrder`, `Print/Act`, `Print/VehicleHistory`
  тепер реальні (через `PrintController`, з `authorize('view', ...)` —
  раніше були "голі" closure-роути без перевірки прав!). Додано
  `AmountInWordsService` (сума прописом, українська, з узгодженням роду
  числівника і валюти — вкрито unit-тестом).
- **Vehicle history** — картка авто показує реальні ремонти й рекомендації
  (рік-фільтр), `repairsTotal`/`lastRepairAt` рахуються з реальних
  WorkOrder, не захардкожені.

### Тести

`tests/Feature/` і `tests/Unit/` — перші реальні feature/unit тести
(SQLite in-memory, ізольовано від спільної БД): аплоад/скачування/видалення
файлів, рекомендації, `AmountInWordsService`. Один тест уже зловив реальний
баг (destroy-ендпоінти рекомендацій/файлів були на Owner-only policy замість
update-policy — блокувало менеджера видаляти власні файли). `php artisan test`
— усі зелені перед кожним комітом.

**Ще не покрито тестами**: Client/Vehicle/Appointment/WorkOrder CRUD,
InventoryService/WorkOrderCalculatorService формули, повний checklist зі
специфікації.

## Масове видалення + звуження прав ролей (2026-08-02, ще один заxід)

Додано bulk-delete (чекбокси + панель дій "Обрано: N" + підтвердження) на
Clients/Vehicles/Appointments/Works/Parts — кожен ID авторизується окремо
через той самий `Policy::delete`, що й одиночне видалення (жодних
додаткових прав через масовий режим). RepairWork у bulk-режимі архівує
(`is_active=false`), а не soft-deletes, як і одиночний destroy.

Заразом виявлено і закрито розбіжність: бічне меню вже ховало "Фінанси" від
Manager і "Запчастини"/"Склад" від Mechanic, але бекенд-політики
(`ExpensePolicy`, `PartPolicy`) досі пускали їх напряму за URL. Вирівняно:
Фінанси — тепер тільки Owner (Manager лишає собі "Оплати" — прийом оплат
по нарядах), Parts/Stock — тільки Owner+Manager (Mechanic і далі отримує
каталог запчастин у своєму наряді — це окремий, не через цю політику,
запит).

## HTTP Basic Auth на sto.pprintdim.com, /demo лишився шляхом (2026-08-03)

- **sto.pprintdim.com захищений HTTP Basic Auth** на рівні nginx (перед
  Laravel/PHP — блокує ботів/сканери ще до /login). Реалізовано напряму
  в `/etc/nginx/sites-enabled/sto.pprintdim.com.conf` (`auth_basic` у
  `location /` зовнішнього 443-блоку, що проксює на внутрішній 8080).
  `clpctl cloudpanel:enable:basic-auth` НЕ підходить — це захищає саму
  адмінку CloudPanel (порт 8443), не сайт.
  Логін/пароль: `<REDACTED — див. ~/AI-Workspace/secrets/ACCESS.md>` / `<REDACTED→secrets/ACCESS.md>` (файл
  `/etc/nginx/.htpasswd-sto.pprintdim.com` на сервері, бекап старого
  конфігу лежить поруч як `.conf.bak-*`).
- **`/demo/` лишився шляхом у цьому ж застосунку** (не окремий піддомен —
  пробували `demo.sto.pprintdim.com`, користувач попросив відкотити).
  У nginx-конфігу окремий `location ^~ /demo/ { auth_basic off; ... }`
  ПЕРЕД захищеним `location /` — тому `/demo/` відкритий без пароля,
  решта сайту вимагає Basic Auth. Файл на сервері:
  `/home/stocrm/htdocs/sto.pprintdim.com/public/demo/index.html`
  (синхронізувати вручну при змінах — це не частина звичайного
  `rsync`-деплою кодової бази, деплоїться окремо).

## Баг-фікси + security-аудит (2026-08-02, продовження)

1. **Форми редагування показували порожні поля** — `useForm()` захоплює
   початкові значення лише один раз при монтуванні; діалог редагування
   монтується постійно (`open={editing !== null}`), тож при зміні
   `editing`-запису форма НЕ оновлювалась. Виправлено в
   ClientFormDialog/VehicleFormDialog/PartFormDialog/WorkFormDialog/
   AppointmentDrawer через `setData(...)` у `useEffect` при відкритті
   (той самий патерн, що вже правильно був у EmployeeModal).
2. **Dashboard-картки стали клікабельними** — `StatCard` отримав `href`,
   веде на відповідну відфільтровану сторінку (наряди за статусом,
   заявки, фінанси, запчастини, оплати).
3. **IDOR у вкладених ресурсах наряду** (справжня знахідка
   security-аудиту): `/work-orders/{workOrder}/works/{work}` та аналогічні
   роути для parts/recommendations/attachments НЕ перевіряли, що
   `{work}` дійсно належить `{workOrder}` — авторизація йшла лише по
   `{workOrder}`. Будь-який користувач з доступом до СВОГО наряду міг
   підмінити ID дочірнього запису і змінити/видалити роботу/деталь/
   рекомендацію/файл ЧУЖОГО наряду. Виправлено `abort_unless` у 7
   ендпоінтах (WorkOrderWorkController, WorkOrderPartController,
   VehicleRecommendationController, AttachmentController), покрито 5
   regression-тестами (`WorkOrderNestedResourceIdorTest`).
4. Інше з аудиту — перевірено й **чисто**: mass assignment (всюди
   `$request->validated()`, жодного `::create($request->all())`),
   raw SQL (лише параметризовані `whereRaw`), XSS (React
   auto-escape, `dangerouslySetInnerHTML` лише в невикористаному
   shadcn chart-компоненті з хардкод-конфігом), CSRF (стандартний
   Laravel), rate-limiting логіну (5 спроб), `.env` ніколи не
   комітився, `APP_DEBUG=false`+`SESSION_SECURE_COOKIE=true` на
   проді, фінансові поля (`total`/`paid_total` тощо) неможливо
   передати з клієнта — рахуються лише сервером.
   Додано демо-сценарій (клієнт «Баєв і Ко», ВАЗ-2110) з реального
   скріншота користувача — `WorkOrderDemoSeeder::seedBaevVazScenario()`.

## Ще НЕ зроблено (з повної специфікації)

- Комплексний аудит сідерів на всі 15 названих демо-сценаріїв зі
  специфікації (частина вже покрита побічно через AppointmentSeeder/
  PartSeeder, але явного аудиту не було).
- Розширення test suite до повного чеклиста зі специфікації.
- Фінальний README.md (поточний — ще рання "аналізна" версія, не продакшн-опис
  зі seeders/demo credentials/бізнес-правилами).

## ✅ ПРОДАКШН: https://sto.pprintdim.com — живий, актуальний стан

Задеплоєно (2026-08-02, фінальний деплой сесії). `npm run build` + rsync +
`composer install --no-dev` + `migrate --force` ("Nothing to migrate" —
спільна БД вже мігрована локально через тунель) + `config:cache`/
`route:cache`/`view:cache`. Перевірено curl з авторизованою сесією:
dashboard, work-orders (6 демо-нарядів видно), vehicles/1 (історія),
finance, employees, settings — усі `200`.

**Демо-логіни** (owner/manager/mechanic), пароль скрізь `<REDACTED — див. ~/AI-Workspace/secrets/ACCESS.md>`:
`admin@mechora.ua`, `manager@mechora.ua`, `mechanic@mechora.ua`.

### Сервер

Hetzner VPS `46.224.100.254`, CloudPanel, спільний з іншими сайтами
(`pprintdim.com`, `hydrophob.net.ua` тощо). **Дані доступу (root SSH,
CloudPanel master-admin) — в `../hydrophob-landing/handoff.md`, звіряти
звідти (пароль ротується)**. Тут паролі свідомо не дублюю.

- Сайт у CloudPanel: `sto.pprintdim.com`, тип **PHP**, шаблон **"Laravel 13"**
  (root directory автоматично = `public/`), **PHP 8.4** (не 8.3! — композер-лок
  тягне пакет, що вимагає `>= 8.4.1`). Site user: `stocrm`, корінь
  `/home/stocrm/htdocs/sto.pprintdim.com/`.
- SSL: валідний Let's Encrypt.
- Немає pm2/Node на проді — звичайний PHP-FPM сайт.

### Спільна БД (локалка + прод — ОДНА база, за вимогою користувача)

- MySQL **на сервері** (не MAMP!), database `stocrm`, user `stocrm`.
- **Локальний доступ — через SSH-тунель**:
  `ssh -N -o <REDACTED→secrets/ACCESS.md> -o <REDACTED→secrets/ACCESS.md> -L 3306:127.0.0.1:3306 root@46.224.100.254`.
  Тунель регулярно відвалюється (перевіряти `ps aux | grep "ssh -N"` перед
  будь-якою міграцією/сідом; якщо мертвий — підняти знову тією ж командою,
  бажано у фоні через `nohup ... &`).
- **⚠️ MySQL 8.4/Percona на сервері**: `clpctl db:add` сам створює юзера з
  `mysql_native_password`<REDACTED — див. ~/AI-Workspace/secrets/ACCESS.md>`ALTER USER`.

### Найважливіші пастки (щоб не наступити знову)

1. **`clpctl site:delete` видаляє й прив'язану БД.**
2. **Не перезаписувати `.env` на сервері "порожнім" шаблоном** — зітре
   `APP_KEY`.
3. Після кожної зміни `.env`/коду на сервері:
   `php artisan config:cache && php artisan route:cache && php artisan view:cache`.
4. **`bootstrap/cache/*.php` виключати з rsync** (dev-пакети типу
   `laravel/pail` в кеші провайдерів ламають `--no-dev` прод-білд).
5. **`php artisan serve` + multipart POST (curl -F) через нову PHP 8.5.9
   built-in сервер деколи мовчки "губить" сесію/авторизацію** (302 на
   /login навіть при валідній сесії) — НЕ баг коду, перевірено через
   `php artisan test` (Feature-тест з `UploadedFile::fake()` проходить
   чисто). Якщо схожа поведінка повториться при ручному curl-тестуванні
   аплоаду — довіряти feature-тесту, а не сирому curl через дев-сервер.

### Процес деплою коду (без пересоздання сайту/БД)

```sh
cd /Applications/MAMP/htdocs/stocrm
npm run build
sshpass -p '<REDACTED — див. ~/AI-Workspace/secrets/ACCESS.md> з hydrophob-landing/handoff.md>' rsync -az --delete \
  --exclude='.git' --exclude='.env' --exclude='node_modules' --exclude='vendor' \
  --exclude='storage/logs/*' --exclude='.claude' --exclude='handoff.md' \
  --exclude='bootstrap/cache/*.php' --exclude='storage/app/private/*' \
  -e "ssh -o StrictHostKeyChecking=no" ./ root@46.224.100.254:/home/stocrm/htdocs/sto.pprintdim.com/
sshpass -p '<REDACTED — див. ~/AI-Workspace/secrets/ACCESS.md>' ssh -o StrictHostKeyChecking=no root@46.224.100.254 "
  chown -R stocrm:stocrm /home/stocrm/htdocs/sto.pprintdim.com
  su - stocrm -c 'cd ~/htdocs/sto.pprintdim.com && composer install --no-dev --optimize-autoloader && php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan view:cache'
"
curl -sk https://sto.pprintdim.com/login
```

## Локальне середовище (MAMP)

- PHP: Homebrew `php` 8.5.9 + Composer 2.10.2 (не MAMP-вський PHP).
- БД: спільна серверна (див. вище), через SSH-тунель на `127.0.0.1:3306`.
- Запуск: `php artisan serve --port=8000` (або інший вільний порт) +
  `npm run dev` (Vite) окремим процесом.
- `.env` в git НЕ комітиться.
- Тести (`php artisan test`) — окрема `sqlite :memory:` БД, спільної не
  торкаються.

## Нюанси / пастки

- git identity на цій машині не налаштована глобально (коміти йдуть з
  auto-detected `Dmitro <pprintdim@MacBook-Air-Dmitro.local>`).
- Codex CLI (`npx @openai/codex exec ... -s workspace-write`) НЕ має
  мережевого доступу — тільки для чистих локальних файл-трансформацій, НЕ
  для SSH/деплою/БД. Записано в `~/.claude/CLAUDE.md`.
- `resources/js` аліас `@/*` → `resources/js/*`.
- `AppLayout` підключається через Inertia persistent layout
  (`Page.layout = (page) => <AppLayout>{page}</AppLayout>`), не
  JSX-обгортку.
- Формули (гроші/години) — тільки в PHP-сервісах
  (`WorkOrderCalculatorService`, `InventoryService`, `FinanceService`).
  Фронтенд ніколи не рахує підсумки заново — лише відображає
  server-computed поля (`order.total`, `order.subtotalWorks` тощо).
