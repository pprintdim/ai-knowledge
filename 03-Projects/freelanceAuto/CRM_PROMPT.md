> [!note] Імпортовано з `/Users/pprintdim/Desktop/vs_projects/freelanceAuto/CRM_PROMPT.md` 2026-08-07 (DOCS-POLICY). Санітизовано секретів: 0. Оригінал: untracked, видалений.

# Промт: Laravel міні-CRM для Freelancehunt (multi-account bidding)

> Готовий промт для розробки (Claude Code / розробник). Самодостатній — містить усі факти про API.
> Референси: apidocs.freelancehunt.com (Postman-колекція), https://github.com/VladKurluk/FreelancehuntAPI (Vue+Flask, тільки як референс ідеї UI — код не використовувати).
> Готових Composer-пакетів для Freelancehunt API немає — HTTP-клієнт пишемо свій на Laravel `Http::`.

---

## ПРОМТ (копіювати звідси і до кінця файлу)

Побудуй **Laravel 12 міні-CRM** для роботи з біржею Freelancehunt від імені **багатьох акаунтів** (стартуємо з 3, архітектура не повинна мати обмежень на кількість). Один користувач CRM (я), авторизація проста (Laravel Breeze або Filament login).

### Призначення

1. **Стрічка вакансій за моїми нішами.** Кожен акаунт має свій набір ніш (скілів Freelancehunt). CRM періодично тягне нові проєкти по нішах усіх активних акаунтів і показує їх однією стрічкою з фільтрами.
2. **Публікація відгуків (ставок) прямо з CRM.** Відкриваю вакансію → генерую/пишу текст → обираю акаунт → «Відправити». Ставка летить через офіційний API.
3. **Автоматизація (закласти одразу).** Per-акаунт перемикач авто-режиму: нові матчі за нішами → GPT-текст → автовідправка ставки в межах денного ліміту. За замовчуванням вимкнено, вмикається окремо для кожного акаунту.
4. **Telegram-сповіщення про реакції.** Якщо на ставку будь-якого акаунту відреагували — роботодавець написав у тред, ставку обрано переможцем, ставку відхилено — миттєве повідомлення в Telegram із зазначенням акаунту, проєкту і посиланням.

### Freelancehunt API v2 — факти (перевірено з офіційної документації)

- **Base URL:** `https://api.freelancehunt.com/v2`
- **Auth:** `Authorization: Bearer {token}`. Токен генерується на `freelancehunt.com/my/api2` окремо на кожен акаунт → у кожного акаунту в CRM свій токен.
- **Headers:** `Accept-Language: uk` (українська локалізація відповідей).
- **Формат відповідей:** JSON:API — `data` (об'єкт або колекція з `id`, `type`, `attributes`), `links` (пагінація: `next`, `prev`…), `meta`.
- **Пагінація:** `?page[number]=2`, до 25 записів на сторінку.
- **Rate limit:** на HTTP 429 — експоненційний backoff і повтор. Кожен токен має власний ліміт.

Ендпоінти:

| Метод | Ендпоінт | Призначення |
|-------|----------|-------------|
| `GET` | `/my/profile` | валідація токена при збереженні акаунту; profile_id, login, avatar |
| `GET` | `/projects?filter[skill_id]=69,99&page[number]=N` | проєкти за скілами (основа стрічки). `skill_id` перекриває `only_my_skills` |
| `GET` | `/projects/{id}` | деталі проєкту |
| `POST` | `/projects/{id}/bids` | **відправка ставки** (body нижче) |
| `GET` | `/my/bids?filter[status]=active` | мої ставки; статуси `active`, `revoked`, `rejected` |
| `POST` | `/projects/{id}/bids/{bid_id}/revoke` | відкликати ставку |
| `GET` | `/skills` | довідник скілів (кешувати добу) |
| `GET` | `/my/feed` | стрічка подій акаунту (нові відповіді, вибір переможця тощо) |
| `POST` | `/my/feed/read` | позначити фід прочитаним |
| `GET` | `/threads` | треди листування; `attributes.unread_count` > 0 → є нові повідомлення |
| `GET` | `/threads/{id}` | повідомлення треда |
| `POST` | `/threads/{id}` | відповісти в тред (етап 2) |

**Body для POST `/projects/{id}/bids` — плоский JSON, НЕ обгортати в `data.attributes`:**

```json
{
    "days": 3,
    "safe_type": "employer",
    "budget": { "amount": 5000, "currency": "UAH" },
    "comment": "Текст відгуку без HTML",
    "is_hidden": false
}
```

- `safe_type`: `null` — пряма оплата; `employer` / `developer` / `split` — Сейф (хто платить комісію); `employer_cashless` — Бізнес Сейф
- `is_hidden: true` — працює лише для Profile Plus
- Валюта: `UAH`

### Стек

- Laravel 12, PHP 8.3+, MySQL
- **Filament 3** для UI (ресурси, таблиці, фільтри, actions)
- Laravel Scheduler + Queue (database driver; передбачити перехід на Redis)
- HTTP: клієнт Laravel `Http::` з retry/backoff — свій сервіс `FhClient`, без сторонніх пакетів
- GPT-генерація тексту: OpenAI API (`gpt-4o-mini`), ключ у `.env`, промпт-шаблон редагований per-акаунт
- Telegram: Bot API, звичайний `sendMessage` (HTML parse mode)

### Схема БД

```
fh_accounts
    id, name, api_token (encrypted cast!), fh_profile_id, fh_login, avatar_url,
    is_active (bool), auto_bid_enabled (bool, default false),
    max_bids_per_day (default 20), default_days, default_safe_type,
    gpt_prompt_template (text), min_budget (nullable),
    last_projects_sync_at, last_feed_sync_at

skills                    ← синк з GET /skills щодоби
    id (= FH skill id), name

account_skill             ← «ніші» акаунту
    account_id, skill_id

projects                  ← глобальний пул, без дублів між акаунтами
    id (= FH project id), title, description, skill_ids (json),
    budget_amount, budget_currency, employer_id, employer_login,
    safe_type, is_only_for_plus, status, url, published_at, expired_at,
    raw (json), created_at

account_project           ← стан проєкту в розрізі акаунту
    account_id, project_id, matched_skill_ids (json),
    state enum: new | viewed | skipped | bid_sent | auto_bid_sent,
    updated_at

bids
    id, account_id, project_id, fh_bid_id (nullable),
    comment (text), amount, currency, days, safe_type, is_hidden,
    is_auto (bool), gpt_generated (bool),
    status enum: draft | sending | sent | active | rejected | revoked | won | failed,
    error (nullable), sent_at, status_synced_at

feed_events               ← події з /my/feed та threads per-акаунт
    id, account_id, fh_event_id (unique per account), type, payload (json),
    project_id (nullable), telegram_sent (bool), created_at
```

### Сервіси та джоби

```
app/Services/Freelancehunt/
    FhClient.php        ← конструюється з FhAccount; Bearer, Accept-Language,
                          retry (3x), backoff на 429/5xx, логування помилок
    ProjectSyncService  ← GET /projects?filter[skill_id]=<ніші акаунту>,
                          upsert у projects, створення account_project(state=new)
                          для кожного акаунту, чиї ніші перетинаються зі скілами проєкту
    BidService          ← відправка ставки (плоский body!), revoke,
                          синк статусів з /my/bids; перевірка денного ліміту
    FeedSyncService     ← /my/feed + threads(unread) → feed_events;
                          класифікація подій (відповідь роботодавця, won, rejected)
app/Services/
    GptBidWriter        ← текст ставки з шаблону акаунту + даних проєкту
    TelegramNotifier    ← сповіщення (нові матчі — опційно; реакції — обов'язково)

app/Jobs (через Scheduler):
    SyncAccountProjects  — кожні 10 хв, по всіх is_active акаунтах (чергою, не паралельно з одного IP без пауз)
    ProcessAutoBids      — після синку: для акаунтів з auto_bid_enabled бере account_project(state=new),
                           фільтр min_budget → GPT → відправка → state=auto_bid_sent; поважає max_bids_per_day
    SyncAccountBids      — кожні 30 хв, оновлення статусів ставок
    SyncAccountFeed      — кожні 5 хв; нова подія по ставці → TelegramNotifier одразу
    SyncSkillsDictionary — щодоби
```

Антибан: пауза 5–15 c між ставками одного акаунту, денний ліміт per-акаунт, черга джобів акаунтів послідовна.

### Екрани (Filament-ресурси)

1. **Dashboard** — віджети по акаунтах: нових вакансій сьогодні, відправлено ставок / ліміт, останні реакції.
2. **Вакансії** — таблиця стрічки: фільтри по акаунту, скілу (ніші), бюджету, state; badges (Сейф, Plus-only, авто/вручну). Дії з рядка: відкрити, пропустити.
3. **Картка вакансії** — опис, роботодавець, які акаунти матчаться; форма ставки: select акаунту, textarea коментаря + кнопка «Згенерувати GPT», amount, days, safe_type → «Відправити відгук». Показ помилки API, якщо ставка не прийнята.
4. **Ставки** — всі ставки всіх акаунтів, статуси, фільтри, дія revoke.
5. **Акаунти** — CRUD: назва, токен (masked; при збереженні валідація через `/my/profile`), ніші (multi-select зі skills), ліміти, auto_bid_enabled, шаблон GPT, min_budget, is_active.
6. **Події** — журнал feed_events з фільтром по акаунту.

### Telegram-сповіщення (пріоритет)

- 💬 «[Акаунт X] Роботодавець відповів по проєкту "..." → лінк»
- 🎉 «[Акаунт X] Вашу ставку обрано переможцем: "..."»
- ❌ «[Акаунт X] Ставку відхилено: "..."»
- 🤖 «[Акаунт X] Авто-ставка відправлена: "..." (сума, дні)» — коли працює авто-режим
- ⚠️ системні помилки (невалідний токен, серія фейлів API)

Один спільний `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` у `.env`; передбачити опційний chat_id per-акаунт.

### Вимоги до якості

- Токени тільки через encrypted cast, у логах — masked.
- Ідемпотентність синків: повторний запуск не створює дублів (upsert по FH id, unique-індекси).
- Всі виклики API — з обробкою помилок; фейл однієї ставки/акаунту не валить джобу для решти.
- `php artisan` команди для ручного запуску кожного синку (`fh:sync-projects {account?}` тощо).
- Мінімум абстракцій: без зайвих інтерфейсів/репозиторіїв, сервіси + моделі Eloquent.
- Seeders: skills-довідник, демо-акаунт.
- Тести: unit на матчинг ніш і формування bid body, feature на BidService з Http::fake.

### Етапи здачі

1. Каркас: Laravel + Filament, міграції, CRUD акаунтів з валідацією токена, синк skills.
2. Стрічка: ProjectSync + екрани вакансій/картки.
3. Ставки вручну: BidService + GPT + екран ставок + синк статусів.
4. Реакції: FeedSync + Telegram-сповіщення.
5. Авто-режим: ProcessAutoBids + ліміти + сповіщення про авто-ставки.

Після кожного етапу — робочий стан, який можна перевірити руками.
