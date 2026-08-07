> [!note] Імпортовано з `/Users/pprintdim/Desktop/vs_projects/freelanceAuto/INSTRUCTIONS.md` 2026-08-07 (DOCS-POLICY). Санітизовано секретів: 0. Оригінал: untracked, видалений.

# FreelanceAuto — Інструкція з налаштування та тестування

## Зміст
1. [Огляд проекту](#огляд)
2. [Вимоги](#вимоги)
3. [Налаштування](#налаштування)
4. [Отримання токенів](#отримання-токенів)
5. [Тестування](#тестування)
6. [Запуск в продакшн](#запуск-в-продакшн)
7. [Структура проекту](#структура-проекту)
8. [API FreelanceHunt v2](<REDACTED→secrets/ACCESS.md>)
9. [Усунення несправностей](#усунення-несправностей)

---

## Огляд

FreelanceAuto — бот для автоматичного моніторингу нових замовлень на **FreelanceHunt** та **Freelance.ua**:

- Отримує нові проекти/вакансії з FreelanceHunt API v2
- Фільтрує їх за ключовими словами та навичками
- Генерує персоналізований відгук через GPT (OpenAI)
- Відправляє відгук через веб-форму (Publisher)
- Сповіщає про всі події в Telegram

---

## Вимоги

- PHP >= 8.1 з розширеннями: `curl`, `pdo_sqlite`, `mbstring`, `dom`
- Доступ до інтернету з сервера
- Акаунт на FreelanceHunt з API-токеном
- Telegram-бот
- (Опційно) OpenAI API ключ

Перевірити PHP:
```bash
php -v
php -m | grep -E 'curl|pdo_sqlite|mbstring|dom'
```

---

## Налаштування

### 1. Клонування / Завантаження

```bash
git clone <repo-url> freelanceAuto
cd freelanceAuto/bot
```

### 2. Копіювання конфігурації

```bash
cp bot/.env.example bot/.env
```

Відкрий `bot/.env` і заповни всі значення (дивись розділ [Отримання токенів](#отримання-токенів)).

### 3. Створення директорій

```bash
mkdir -p bot/data bot/logs
chmod 755 bot/data bot/logs
```

### 4. Ініціалізація бази даних

База даних (SQLite) створиться автоматично при першому запуску. Якщо потрібно вручну:

```bash
php -r "require 'bot/db.php'; require 'bot/logger.php'; Logger::init(); DB::connect();"
```

---

## Отримання токенів

### FreelanceHunt API Token

1. Авторизуйся на [freelancehunt.com](https://freelancehunt.com)
2. Перейди до **Налаштування → API** або відкрий [freelancehunt.com/my/api](https://freelancehunt.com/my/api)
3. Натисни **"Створити токен"**
4. Скопіюй токен → встав у `.env` як `FREELANCEHUNT_TOKEN`

> **Важливо:** Переконайся, що на профілі заповнені навички (Skills). Фільтр `only_my_skills=1` повертає проекти лише за вказаними навичками.

### Telegram Bot Token та Chat ID

**Крок 1 — Створити бота:**
1. Відкрий [@BotFather](https://t.me/BotFather) у Telegram
2. Відправ `/newbot`
3. Вкажи ім'я та username бота
4. Скопіюй токен вигляду `1234567890:AABBcc...` → `TELEGRAM_BOT_TOKEN`

**Крок 2 — Отримати Chat ID:**
1. Відправ будь-яке повідомлення своєму боту
2. Відкрий у браузері:
   ```
   https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getUpdates
   ```
3. Знайди `"chat":{"id":XXXXXXXXX}` — це і є `TELEGRAM_CHAT_ID`

### OpenAI API Key (Опційно)

1. Зареєструйся на [platform.openai.com](https://platform.openai.com)
2. Перейди до **API Keys → Create new secret key**
3. Скопіюй → `OPENAI_API_KEY`

> Якщо OpenAI не потрібен, використовуй тести з флагом `--no-gpt` (placeholder текст).

---

## Тестування

Всі тести запускаються з **кореня проекту**:

```bash
cd /шлях/до/freelanceAuto
```

### Тест 1: Telegram

Перевіряє чи правильні токени та надсилає тестові повідомлення:

```bash
php bot/tests/test_telegram.php
```

**Очікуваний результат:**
```
=== Telegram Test ===
Bot token : ...xqlmM
Chat ID   : 2123553623

✅ Message sent OK
✅ notifyNewProject sent
✅ notifyBidSent sent
=== Done ===
```

Якщо прийшло 3 повідомлення в Telegram — все налаштовано правильно.

---

### Тест 2: Вакансії (DRY-RUN)

Завантажує останні 5 проектів з FreelanceHunt та показує, що б відправив бот (без реальних відгуків):

```bash
# Базовий DRY-RUN (нічого не відправляє)
php bot/tests/test_vacancies.php

# Без фільтра ключових слів (показує будь-які 5 проектів)
php bot/tests/test_vacancies.php --no-filter

# Без GPT (використовує placeholder текст)
php bot/tests/test_vacancies.php --no-filter --no-gpt

# Завантажити контести замість проектів
php bot/tests/test_vacancies.php --contests --no-filter

# Змінити ліміт
php bot/tests/test_vacancies.php --no-filter --limit=3
```

---

### Тест 3: Реальна відправка відгуків

> ⚠️ **Увага!** Цей режим відправляє реальні відгуки від твого акаунту.

```bash
# Відправити відгуки через веб-форму (з GPT текстом)
php bot/tests/test_vacancies.php --send

# Без GPT (placeholder текст) + без TG сповіщень
php bot/tests/test_vacancies.php --send --no-gpt --no-tg

# Спробувати API bid замість форми
php bot/tests/test_vacancies.php --send --api-bid --no-gpt
```

**Всі флаги `test_vacancies.php`:**

| Флаг | Опис |
|------|------|
| `--send` | Реально відправляти відгуки (без цього — dry-run) |
| `--api-bid` | Спробувати API замість форми (fallback на форму) |
| `--contests` | Завантажувати contests замість projects |
| `--no-gpt` | Пропустити GPT, використати placeholder текст |
| `--no-tg` | Вимкнути Telegram повідомлення |
| `--no-filter` | Вимкнути фільтр ключових слів |
| `--limit=N` | Кількість вакансій для обробки (default: 5) |

---

## Запуск в продакшн

### Cron (рекомендовано)

Редагуй crontab:
```bash
crontab -e
```

Додай рядок (запуск кожні 20 хвилин):

```
*/20 * * * * /usr/bin/php /home/np588371/expertpergolas.gr/cron.php >> /home/np588371/expertpergolas.gr/logs/cron.log 2>&1
```

> Посилання для панелі хостингу (cPanel / Plesk) — вставляй рядок як є:
> ```
> /usr/bin/php /home/np588371/expertpergolas.gr/cron.php >> /home/np588371/expertpergolas.gr/logs/cron.log 2>&1
> ```

Перевір шлях до PHP:
```bash
which php
```

### Ручний запуск cron

```bash
# Повний запуск
php bot/cron.php

# Тільки проекти (без feed)
php bot/cron.php --projects-only

# Тільки feed/повідомлення
php bot/cron.php --feed-only

# Dry-run (нічого не відправляє, але виводить що б зробив)
php bot/cron.php --dry-run
```

### Перегляд логів

```bash
tail -f bot/logs/bot.log
tail -100 bot/logs/cron.log
```

---

## Структура проекту

```
freelanceAuto/
├── index.php              # Старий legacy endpoint (HTTP-запити)
├── latest_project.json    # ID останнього обробленого проекту (legacy)
├── freelanceUa.json       # Кеш проектів Freelance.ua (legacy)
├── freelanceUa_sent.json  # Відправлені посилання Freelance.ua (legacy)
│
├── INSTRUCTIONS.md        # Ця інструкція
│
└── bot/                   # Основний бот (production-ready)
    ├── .env               # Змінні середовища (НЕ комітити!)
    ├── .env.example       # Шаблон для .env
    │
    ├── api.php            # FreelanceHunt API v2 клієнт
    ├── telegram.php       # Telegram Bot API обгортка
    ├── gpt.php            # OpenAI GPT генерація тексту відгуку
    ├── publisher.php      # Відправка відгуку через веб-форму
    ├── parser.php         # Парсинг та фільтрація проектів
    ├── db.php             # SQLite: projects, bids, feed_items
    ├── logger.php         # Файловий + stdout логер
    ├── cron.php           # Головний оркестратор (запускати кроном)
    │
    ├── data/
    │   └── bot.db         # SQLite база (автостворюється)
    │
    ├── logs/
    │   └── bot.log        # Лог бота
    │
    └── tests/
        ├── bootstrap.php     # Спільний bootstrap для тестів
        ├── test_telegram.php # Тест Telegram з'єднання
        └── test_vacancies.php # Тест завантаження/відгуку на 5 вакансій
```

---

## API FreelanceHunt v2

**Base URL:** `https://api.freelancehunt.com/v2`

**Авторизація:**
```
Authorization: Bearer {FREELANCEHUNT_TOKEN}
Accept: application/vnd.api+json
Content-Type: application/vnd.api+json
```

### Основні ендпоінти

| Метод | URL | Опис |
|-------|-----|------|
| `GET` | `/projects` | Список проектів |
| `GET` | `/projects/{id}` | Деталі проекту |
| `POST` | `/projects/{id}/bids` | Відправити відгук (може бути недоступно) |
| `GET` | `/contests` | Список конкурсів/вакансій |
| `GET` | `/contests/{id}` | Деталі конкурсу |
| `GET` | `/my/profile` | Мій профіль |
| `GET` | `/my/feed` | Стрічка активності |
| `GET` | `/threads` | Список повідомлень |
| `GET` | `/threads/{id}/messages` | Повідомлення у треді |

### Фільтри для `/projects`

```
filter[only_my_skills]=1        # тільки мої навички
filter[skills]=78,124,1         # конкретні ID навичок
page[number]=1                  # номер сторінки
page[size]=25                   # розмір сторінки (max 25)
```

> Повна документація: [apidocs.freelancehunt.com](https://apidocs.freelancehunt.com)

---

## Усунення несправностей

### ❌ `No projects returned from API`

**Причини:**
- `FREELANCEHUNT_TOKEN` неправильний або протермінований
- На профілі не вказані навички (з фільтром `only_my_skills`)

**Рішення:**
```bash
# Перевіри токен напряму:
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Accept: application/vnd.api+json" \
     https://api.freelancehunt.com/v2/my/profile

# Запусти тест без фільтра навичок:
php bot/tests/test_vacancies.php --no-filter
```

---

### ❌ `Telegram: token or chat_id not set`

Перевір `.env`:
```bash
grep TELEGRAM bot/.env
```

---

### ❌ Bid FAILED (форма не відправляється)

**Можливі причини:**
1. Freelancehunt змінив структуру форми (CSRF токен)
2. Сесія не стартує (перевір email/пароль)
3. IP сервера заблокований

**Логи:**
```bash
tail -50 bot/logs/bot.log | grep -i "publisher\|login\|csrf"
```

---

### ❌ GPT повертає порожній текст

- Перевір `OPENAI_API_KEY` у `.env`
- Перевір ліміт токенів на OpenAI
- Тимчасово використай `--no-gpt`

---

### Переглянути DB

```bash
sqlite3 bot/data/bot.db ".tables"
sqlite3 bot/data/bot.db "SELECT id, title, bid_sent FROM projects ORDER BY id DESC LIMIT 10;"
sqlite3 bot/data/bot.db "SELECT * FROM bids ORDER BY sent_at DESC LIMIT 5;"
```
