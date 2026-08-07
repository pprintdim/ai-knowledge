# Agents — глобальна бібліотека

**Agents = ЯК працювати · Knowledge = ЩО знаємо · Projects = що знаємо про КОНКРЕТНИЙ проєкт.** Не змішувати.
Агенти reusable для будь-якого repo: без project-specific коду і секретів. Специфіка проєкту — `Projects/<repo>/AGENTS.md` (вищий пріоритет за глобального агента).

## Ролі

| Агент | Для чого |
|---|---|
| [[architect]] | аналіз/декомпозиція/план перед кодом |
| [[opencart3]] | все по OC3 |
| [[wordpress]] | WP/WooCommerce/теми/плагіни |
| [[frontend]] | верстка/UI, pixel-perfect |
| [[backend-php]] | PHP/бізнес-логіка/cron |
| [[database]] | схема/SQL/оптимізація |
| [[importer]] | CSV/XML/фіди/SKU/інкрементальні оновлення |
| [[api-integration]] | REST/webhooks/CRM/платіжки/доставки |
| [[debug]] | root cause помилок |
| [[qa]] | перевірка diff після implementation |
| [[security]] | injection/XSS/auth/секрети |
| [[performance]] | запити/кеш/N+1/asset-и |
| [[seo]] | meta/canonical/SEO URL/redirects |
| [[git]] | mirror/worktree/branch/push |
| [[cleanup]] | завершальна очистка workspace |

Домен-виконавці (готові субагенти `~/.claude/agents/`): `Agents/натяжки/` — layout-porter, content-translator, seo-filler, db-content-loader, page-auditor.

## Автоматичний вибір (оркестратор класифікує сам, користувач нікого не називає)

| Задача звучить як | Ланцюг |
|---|---|
| «імпортуй XML/CSV постачальника» | architect → opencart3 → importer → qa → cleanup |
| «зламалась верстка / не так виглядає» | frontend → qa → cleanup |
| «помилка / Unknown column / exception» | debug → спеціаліст стеку → database? → qa |
| «підключи CRM/API/платіжку» | api-integration → backend-php → qa |
| «нова фіча» | architect → спеціаліст стеку (+frontend паралельно) → qa → cleanup |
| «повільно працює» | performance → спеціаліст → qa |
| «перевір/ревʼю» | qa → security → performance (за потреби) |
| «натяжка/порт верстки» | [[natyazhka-opencart|Workflows/natyazhka]] + Agents/натяжки/ |

Шорткати: `/fix /debug /feature /import /frontend /api /seo /performance /review /test` → нотатки у `Workflows/` (продубльовані як slash-команди `~/.claude/commands/`).

## Правила виконання

- **Context diet**: агенту передавати тільки task + project rules + релевантну память + релевантні нотатки Knowledge + потрібні файли. НЕ весь vault / НЕ весь repo.
- **Паралельність**: незалежні частини (backend ∥ frontend) — паралельно; ті самі файли двом агентам без координації — ЗАБОРОНЕНО.
- **Learning**: після задачі нове ТЕХНІЧНЕ знання → `Knowledge/`; інструкції агентів міняти ТІЛЬКИ якщо знайдено нове глобальне правило роботи (не після кожної задачі).
- Спільне для всіх: інкрементальний запис на диск; не комітити і не виконувати SQL на проді самостійно; «success»-звіт перевіряється оркестратором (`ls`/diff).
