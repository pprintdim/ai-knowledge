# Agents — глобальна бібліотека

**Agents = ЯК працювати · Knowledge = ЩО знаємо · Projects = що знаємо про КОНКРЕТНИЙ проєкт.** Не змішувати.
Агенти reusable для будь-якого repo: без project-specific коду і секретів. Специфіка проєкту — `Projects/<repo>/AGENTS.md` (вищий пріоритет за глобального агента).

## Групи (за роллю в циклі задачі)

### core/ — кістяк кожної задачі
| | |
|---|---|
| [[architect]] | аналіз/декомпозиція/план перед кодом |
| [[git]] | mirror/worktree/branch/push (механіка — [[WORKSPACE]]) |
| [[cleanup]] | завершальна очистка + фінальний звіт |

### specialists/ — стек-спеціалісти (виконують код)
| | |
|---|---|
| [[opencart3]] | все по OC3 |
| [[wordpress]] | WP/WooCommerce/теми/плагіни |
| [[frontend]] | верстка/UI, pixel-perfect |
| [[backend-php]] | PHP/бізнес-логіка/cron |
| [[database]] | схема/SQL/оптимізація |

### routine/ — типові повторювані задачі
| | |
|---|---|
| [[importer]] | CSV/XML/фіди/SKU/інкрементальні оновлення |
| [[api-integration]] | REST/webhooks/CRM/платіжки/доставки |
| [[debug]] | root cause помилок |
| [[seo]] | meta/canonical/SEO URL/redirects |

### review/ — перевірка чужої роботи (нічого не редагують)
| | |
|---|---|
| [[qa]] | diff/acceptance/regression після implementation |
| [[security]] | injection/XSS/auth/секрети |
| [[performance]] | запити/кеш/N+1/asset-и |

### натяжки/ — домен-виконавці (готові субагенти `~/.claude/agents/`)
[[layout-porter]] · [[content-translator]] · [[seo-filler]] · [[db-content-loader]] · [[page-auditor]]
Нові домени задач = нова тека зі своїм набором.

## Автоматичний вибір (оркестратор класифікує сам)

| Задача звучить як | Ланцюг |
|---|---|
| «імпортуй XML/CSV постачальника» | architect → opencart3 → importer → qa → cleanup |
| «зламалась верстка / не так виглядає» | frontend → qa → cleanup |
| «помилка / Unknown column / exception» | debug → спеціаліст стеку → database? → qa |
| «підключи CRM/API/платіжку» | api-integration → backend-php → qa |
| «нова фіча» | architect → спеціаліст (+frontend паралельно) → qa → cleanup |
| «повільно працює» | performance → спеціаліст → qa |
| «перевір/ревʼю» | qa → security → performance (за потреби) |
| «натяжка/порт верстки» | [[natyazhka-opencart|Workflows/natyazhka]] + натяжки/ |

Шорткати: `/fix /debug /feature /import /frontend /api /seo /performance /review /test` → `Workflows/` (= slash-команди `~/.claude/commands/`).

## Правила виконання

- **Context diet**: агенту — тільки task + project rules + релевантна память + релевантні нотатки Knowledge + потрібні файли. НЕ весь vault / НЕ весь repo.
- **Паралельність**: незалежні частини (backend ∥ frontend) — паралельно; ті самі файли двом агентам без координації — ЗАБОРОНЕНО.
- **Learning**: нове ТЕХНІЧНЕ знання → `Knowledge/`; інструкції агентів міняти ТІЛЬКИ при новому глобальному правилі роботи (не після кожної задачі).
- Спільне: інкрементальний запис на диск; не комітити і не виконувати SQL на проді самостійно; «success»-звіт перевіряється оркестратором.
