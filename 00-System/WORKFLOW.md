# WORKFLOW — порядок виконання задачі

## Перед кодом (обовʼязково, у цьому порядку)

1. Визначити repo: `git status`, default branch, чи є незакомічені зміни.
2. Прочитати локальний `CLAUDE.md` / `AGENTS.md` / `handoff.md` проєкту.
3. Obsidian MCP: прочитати `03-Projects/<repo>/PROJECT.md` і `MEMORY.md` (якщо є).
4. Obsidian MCP: **targeted search** по Knowledge (див. нижче), прочитати 1–3 релевантні нотатки. НЕ читати весь vault.
5. Перевірити фактичний код там, де плануються зміни.
6. Тільки тепер — план і реалізація.

## Пріоритет істини

1. Фактичний код поточного repo
2. Project-specific інструкції (CLAUDE.md/AGENTS.md repo)
3. Project Memory (`03-Projects/<repo>/`)
4. Перевірені 02-Knowledge/Patterns
5. Загальні припущення

Старе рішення НІКОЛИ не застосовувати сліпо, якщо код проєкту відрізняється.

## Рецепт пошуку знань

Задача → 3–6 ключових термінів → search по vault → відкрити тільки збіги.

- «XML supplier import» → `OpenCart3 import XML SKU cron`
- «OCFilter SEO URL» → `OCFilter seo_url routing layout`
- «друга мова показує ключі» → `language мова ключі cache`

Спочатку [[02-Knowledge/OpenCart3/INDEX|INDEX]] як карта, потім конкретна нотатка. Detail — тільки коли потрібен.

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

1. Оновити `03-Projects/<repo>/TASKS.md` і `MEMORY.md` (handoff.md — лише в проектах, де вже заведений; [[DOCS-POLICY]]).
2. Harvesting за [[MEMORY-RULES]] — тільки знання з повторною цінністю.
