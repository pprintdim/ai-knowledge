> [!note] Імпортовано з `/Users/pprintdim/Desktop/vs_projects/freelanceAuto/LARAVEL_CRM_ANALYSIS.md` 2026-08-07 (DOCS-POLICY). Санітизовано секретів: 0. Оригінал: untracked, видалений.

# FreelanceAuto → Laravel Mini-CRM: аналіз та план

> Дата аналізу: 2026-07-04
> Мета: переробити поточний PHP-бот на Laravel міні-CRM з керуванням **3 акаунтами Freelancehunt**, стрічкою вакансій за нішами (заданими в налаштуваннях кожного профілю) та публікацією відгуків прямо з CRM.

---

## 1. Що є зараз (поточний проєкт)

### Структура

| Файл | Роль | Стан |
|------|------|------|
| `bot/cron.php` | Оркестратор: фетч проєктів → фільтр → GPT-текст → Telegram-апрув | працює, 1 акаунт |
| `bot/api.php` | Обгортка Freelancehunt API v2 (cURL, retry, 429-backoff) | працює |
| `bot/parser.php` | Фільтрація за ключовими словами + fuzzy matching (75%) | працює |
| `bot/gpt.php` | Генерація тексту відгуку через OpenAI gpt-4o-mini | працює |
| `bot/publisher.php` | Відправка ставки через **веб-форму** (login + CSRF + cookies) | хак, крихкий |
| `bot/telegram.php` + `webhook.php` | Сповіщення + кнопки [✅ Відправити] [❌ Пропустити] | працює |
| `bot/db.php` | SQLite: `projects`, `bids`, `feed_items`, `meta` | працює |
| `index.php`, `freelanceUa*.json` | Legacy (Freelance.ua парсер) | не переносити |

### Головні обмеження поточної версії

1. **Один акаунт** — токен, email/пароль, ключові слова захардкоджені в одному `.env`.
2. **Ставки через веб-форму** (`publisher.php`, 326 рядків) — логін по email/паролю, парсинг CSRF, cookie-сесії, ротація User-Agent. Ламається при будь-якій зміні верстки сайту.
3. **Немає UI** — все керування через Telegram-кнопки і логи.
4. **Ніші = ключові слова в `.env`** — не пов'язані зі скілами Freelancehunt, нема керування per-акаунт.

### ⚠️ Важлива знахідка по API

Офіційна документація (Postman-колекція apidocs.freelancehunt.com) **підтверджує ендпоінт відправки ставки**:

```
POST /v2/projects/{project_id}/bids
```

Body — **плоский JSON** (не JSON:API обгортка!):

```json
{
    "days": 2,
    "safe_type": "employer",
    "budget": { "amount": 5000, "currency": "UAH" },
    "comment": "Текст відгуку без HTML",
    "is_hidden": false
}
```

| Параметр | Значення |
|----------|----------|
| `days` | термін виконання в днях |
| `budget` | об'єкт `{amount, currency}` (UAH) |
| `safe_type` | `null` — пряма оплата, `employer` / `developer` / `split` — Сейф, `employer_cashless` — Бізнес Сейф |
| `comment` | текст ставки, без HTML |
| `is_hidden` | `true` тільки для Profile Plus |

**Висновки:**
- `publisher.php` (веб-форма, логін, CSRF) — **повністю викидаємо**. Email/пароль більше не потрібні, тільки Bearer-токени.
- Поточний `api.php::submitBid()` має **неправильний формат body** (обгортає в `data.type.attributes`) — тому "API bid" і не працював, а не тому що ендпоінта немає.

---

## 2. Freelancehunt API v2 — що потрібно для CRM

**Base URL:** `https://api.freelancehunt.com/v2`
**Auth:** `Authorization: Bearer {token}` — токен генерується на [freelancehunt.com/my/api2](https://freelancehunt.com/my/api2) **окремо для кожного акаунту** → 3 акаунти = 3 токени.
**Headers:** `Accept-Language: uk` для української локалізації відповідей.
**Формат:** JSON:API (`data`, `links`, `meta`), пагінація `page[number]`.

### Ендпоінти, які використовує CRM

| Метод | Ендпоінт | Навіщо |
|-------|----------|--------|
| `GET` | `/my/profile` | Валідація токена, ім'я/аватар акаунту, скіли профілю |
| `GET` | `/projects?filter[skill_id]=1,5,99` | **Стрічка вакансій за нішами** (skill_id перекриває only_my_skills) |
| `GET` | `/projects?filter[only_my_skills]=1` | Альтернатива: скіли задані на самому профілі FH |
| `GET` | `/projects/{id}` | Деталі проєкту (опис, бюджет, роботодавець) |
| `POST` | `/projects/{id}/bids` | **Публікація відгуку з CRM** |
| `GET` | `/my/bids` | Мої ставки (статуси: `active`, `revoked`, `rejected`) — синк результатів |
| `POST` | `/projects/{id}/bids/{bid_id}/revoke` | Відкликати ставку |
| `GET` | `/skills` | Довідник скілів (загальний, кешувати) |
| `GET` | `/my/feed` + `POST /my/feed/read` | Стрічка подій (ставку прийнято/відхилено) |
| `GET` | `/threads`, `GET/POST /threads/{id}` | Листування (етап 2, опційно) |

### Фільтри `/projects`

- `filter[only_my_skills]=1` — скіли з профілю FH
- `filter[skill_id]=69,99` — конкретні ID скілів (**перекриває** only_my_skills) ← основа "ніш"
- `filter[employer_id]`, `filter[only_for_plus]`
- Пагінація: `page[number]=N`, до 25 записів на сторінку

### Rate limits / антибан

- HTTP 429 → backoff (у поточному api.php вже реалізовано, перенести логіку)
- Ліміти: зберегти механізм max ставок/день per-акаунт (зараз 20)
- 3 токени = 3 незалежні ліміти, запити рознесені по акаунтах

---

## 3. Концепція Laravel CRM

### Основний сценарій

```
Налаштування акаунту (ніші/скіли, шаблони, ліміти)
        ↓
Scheduler (кожні N хв) тягне /projects за скілами кожного з 3 акаунтів
        ↓
Дедуплікація + збереження в MySQL
        ↓
Стрічка вакансій у CRM (фільтри: акаунт, ніша, бюджет, статус)
        ↓
Картка вакансії → [згенерувати GPT-текст] → редагування → бюджет/днi/safe_type
        ↓
Кнопка «Відправити відгук» → POST /projects/{id}/bids від імені обраного акаунту
        ↓
Синк /my/bids + /my/feed → статуси ставок у CRM (+ Telegram-сповіщення)
```

### Ключові рішення

1. **Ніші = набір skill_id для акаунту.** У налаштуваннях акаунту чекбокси зі скілами з довідника `/skills`. Фетчинг іде через `filter[skill_id]=...`. Додатково (опційно) — keyword/fuzzy фільтр поверх, як у поточному parser.php.
2. **Один проєкт FH може матчитись кільком акаунтам** — таблиця `projects` глобальна, зв'язка з акаунтом через pivot `account_project` (звідти ж — статус "переглянуто/відправлено/пропущено" per-акаунт).
3. **Відгук публікується вручну з CRM** (кнопкою), не автоматично — це замінює Telegram-апрув. Telegram лишається як канал сповіщень про нові матчі та зміни статусів.
4. **GPT-генерація** — опційна кнопка в картці, текст завжди можна відредагувати перед відправкою.

---

## 4. Схема БД (MySQL)

```
fh_accounts
    id, name, api_token (encrypted cast), profile_id, login,
    avatar_url, is_active, max_bids_per_day, default_days,
    default_safe_type, bid_template (базовий промпт/підпис для GPT),
    telegram_chat_id (nullable), last_synced_at

skills                          ← довідник з GET /skills, синк раз на добу
    id (= FH skill id), name

account_skill (ніші акаунту)
    account_id, skill_id

projects                        ← глобально, без дублів
    id (= FH project id), title, description, skill_ids (json),
    budget_amount, budget_currency, employer_login, employer_id,
    safe_type, is_only_for_plus, status, url, published_at, expired_at,
    raw (json), fetched_at

account_project                 ← стан проєкту в розрізі акаунту
    account_id, project_id,
    matched_skills (json), state: new|viewed|skipped|bid_sent,
    viewed_at

bids
    id, account_id, project_id, fh_bid_id (nullable),
    comment, amount, currency, days, safe_type, is_hidden,
    gpt_generated (bool), status: draft|sent|active|rejected|revoked|won,
    sent_at, status_synced_at, error (nullable)

feed_items                      ← події з /my/feed per-акаунт
    id, account_id, fh_id, type, payload (json), notified, created_at
```

`api_token` — через `encrypted` cast Laravel, не plaintext.

---

## 5. Архітектура Laravel

### Стек

- **Laravel 12**, PHP 8.3+, MySQL
- **Черги/розклад:** Laravel Scheduler + Queue (database driver достатньо; Redis — якщо буде на VPS)
- **HTTP:** `Http::` клієнт Laravel (retry, throw, middleware) замість самописного cURL

### Структура коду

```
app/
├── Models/            FhAccount, Skill, Project, Bid, FeedItem
├── Services/
│   ├── Freelancehunt/
│   │   ├── FhClient.php          ← per-account клієнт (Bearer, 429 backoff, Accept-Language)
│   │   ├── ProjectSync.php       ← фетч + дедуп + матчинг нішам
│   │   ├── BidService.php        ← POST bids, revoke, синк /my/bids
│   │   └── FeedSync.php          ← /my/feed → feed_items + сповіщення
│   ├── GptBidWriter.php          ← генерація тексту (перенести промпт з gpt.php)
│   └── TelegramNotifier.php      ← перенести з telegram.php
├── Jobs/
│   ├── SyncAccountProjects.php   ← кожні 10–15 хв per-акаунт
│   ├── SyncAccountBids.php       ← кожні 30 хв
│   ├── SyncAccountFeed.php       ← кожні 5–10 хв
│   └── SyncSkillsDictionary.php  ← щодоби
└── Http/… або Filament/…         ← залежно від вибору UI (нижче)
```

### Варіанти UI — треба обрати

| Варіант | Плюси | Мінуси |
|---------|-------|--------|
| **A. Filament 3** (рекомендую) | Адмінка "з коробки": таблиці, фільтри, форми, actions, badges. Стрічка вакансій + картка + кнопка Bid = ресурси й actions, мінімум кастомного коду. Швидше за все | Свій layout-фреймворк (не Bootstrap), обмежена свобода дизайну |
| B. Blade + Livewire вручну | Повний контроль, звична верстка | Все руками: таблиці, фільтри, пагінація — довше |
| C. Inertia + Vue | SPA-відчуття | Найбільше роботи, для внутрішньої CRM на 1 користувача — overkill |

### Що переноситься з поточного бота

| Звідки | Куди | Примітка |
|--------|------|----------|
| `api.php` (retry, 429) | `FhClient` | переписати на Laravel Http, **виправити body для bids** |
| `gpt.php` (промпт) | `GptBidWriter` | промпт-шаблон зробити редагованим per-акаунт |
| `telegram.php` | `TelegramNotifier` | тільки сповіщення; кнопки-апруви більше не потрібні (замінює UI) |
| `parser.php` (fuzzy) | опційний keyword-фільтр у `ProjectSync` | етап 2 |
| `publisher.php` | — | **викинути** (є офіційний API bids) |
| `db.php` SQLite-дані | міграція історії (опційно) | можна почати з чистої БД |

---

## 6. Екрани CRM

1. **Dashboard** — по 3 акаунтах: нові вакансії за сьогодні, відправлені ставки, ліміт дня, статуси останніх ставок.
2. **Вакансії (стрічка)** — таблиця з фільтрами: акаунт, ніша (skill), бюджет від, стан (new/viewed/skipped/bid_sent). Badges: Сейф, Plus-only, бюджет.
3. **Картка вакансії** — опис, роботодавець (рейтинг/відгуки), матчинг ніш; форма ставки: текст (кнопка "Згенерувати GPT"), сума, дні, safe_type, вибір акаунту (якщо матчить кільком) → **Відправити**.
4. **Мої ставки** — по всіх акаунтах, статуси з `/my/bids`, кнопка revoke.
5. **Налаштування акаунту** — токен (masked), ніші (чекбокси скілів), ліміти, шаблон GPT-промпту, Telegram chat_id, перемикач активності.
6. *(Етап 2)* **Листування** — threads/messages, відповідь з CRM.

---

## 7. Етапи розробки

| Етап | Обсяг | Результат |
|------|-------|-----------|
| **1. Каркас** | Laravel + Filament, міграції, модель акаунтів, CRUD акаунтів, синк `/skills`, валідація токенів через `/my/profile` | 3 акаунти заведені в CRM |
| **2. Стрічка** | `FhClient`, `SyncAccountProjects` (scheduler), дедуп, матчинг нішам, екран вакансій + картка | Бачу вакансії за нішами всіх акаунтів |
| **3. Ставки** | `BidService` (правильний POST body), форма ставки, GPT-генерація, `SyncAccountBids`, денні ліміти | Публікую відгук з CRM, бачу статуси |
| **4. Сповіщення** | `SyncAccountFeed`, Telegram-нотифікації (новий матч, ставку прийнято) | Telegram знову працює, але як read-only канал |
| **5. Поліш** | Dashboard, keyword/fuzzy фільтр, revoke, листування (threads) | Повноцінна міні-CRM |

---

## 8. Відкриті питання (вирішити перед стартом)

1. **UI:** Filament (варіант A) — ок? Це найшвидший шлях.
2. **Де житиме CRM:** локально (MAMP/Herd) чи на хостингу? Впливає на чергу (database vs Redis) і scheduler (cron).
3. **Новий репозиторій** `freelanceCrm` поруч, чи переробка всередині `freelanceAuto`? (Рекомендація: нова папка, старий бот працює до запуску CRM.)
4. **Автовідправка:** лишаємо тільки ручну кнопку з CRM, чи потрібен опційний авто-режим (як у старому боті) per-акаунт?
5. **GPT:** лишаємо OpenAI gpt-4o-mini чи переходимо на Claude API?
