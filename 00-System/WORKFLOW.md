# WORKFLOW — порядок виконання задачі

## Перед кодом (обовʼязково, у цьому порядку)

1. Визначити repo: `git status`, default branch, чи є незакомічені зміни.
2. Прочитати локальний `CLAUDE.md` / `AGENTS.md` / `handoff.md` проєкту.
3. Obsidian MCP: прочитати `Projects/<repo>/PROJECT.md` і `MEMORY.md` (якщо є).
4. Obsidian MCP: **targeted search** по Knowledge (див. нижче), прочитати 1–3 релевантні нотатки. НЕ читати весь vault.
5. Перевірити фактичний код там, де плануються зміни.
6. Тільки тепер — план і реалізація.

## Пріоритет істини

1. Фактичний код поточного repo
2. Project-specific інструкції (CLAUDE.md/AGENTS.md repo)
3. Project Memory (`Projects/<repo>/`)
4. Перевірені Knowledge/Patterns
5. Загальні припущення

Старе рішення НІКОЛИ не застосовувати сліпо, якщо код проєкту відрізняється.

## Рецепт пошуку знань

Задача → 3–6 ключових термінів → search по vault → відкрити тільки збіги.

- «XML supplier import» → `OpenCart3 import XML SKU cron`
- «OCFilter SEO URL» → `OCFilter seo_url routing layout`
- «друга мова показує ключі» → `language мова ключі cache`

Спочатку [[Knowledge/OpenCart3/INDEX|INDEX]] як карта, потім конкретна нотатка. Detail — тільки коли потрібен.

## Git workflow

- Суттєві задачі → окрема гілка `agent/<TASK>-<коротко>` (або worktree). Не працювати в main/master напряму для значних змін.
- Перед стартом: `git status` — не втратити чужі незакомічені зміни; НІКОЛИ `git add -A` без перегляду `git status`.
- Після: lint/tests якщо є → перегляд diff → короткий summary.
- Commit — якщо відповідає workflow проєкту або дозволено; push/merge — тільки за явною командою (якщо правила проєкту не кажуть інакше).

## Економія токенів

- INDEX-нотатки — карта; тіла нотаток — за потребою.
- Search замість читання тек; конкретні файли замість цілого repo.
- Не дублювати в retrieval те, що вже в контексті розмови.

## Після задачі

1. Оновити `Projects/<repo>/TASKS.md` (гілка/коміт/стан) і `handoff.md` проєкту.
2. Harvesting за [[MEMORY-RULES]] — тільки знання з повторною цінністю.
