# AI-DEV — INDEX

Shared Knowledge Layer для AI-агентної розробки (Claude Code + Codex + субагенти).
Спеціалізація: OpenCart 3 «натяжки»; масштабується на WordPress/Laravel.

## Карта vault

- **[[ORCHESTRATOR]]** — хто що робить: оркестратор, Codex, субагенти
- **[[WORKFLOW]]** — порядок виконання задачі: repo → memory → knowledge → код
- **[[MEMORY-RULES]]** — що зберігати в vault, що ні (secrets — ніколи)
- **[[ROLES]]** — ролі агентів (architect / opencart / frontend / backend / qa / devops)

## Агенти (по доменах)

`Agents/<домен>/` — набір агентів під тип задач. Визначення — в `~/.claude/agents/*.md`, тут — знання «коли і як їх використовувати».

- **Agents/натяжки/** — порт верстки → OC3:
	- [[layout-porter]] — порт секцій верстки в OC-модулі
	- [[content-translator]] — масовий переклад uk→ru, інкрементальний запис
	- [[seo-filler]] — слаги + мета з реальних джерел
	- [[db-content-loader]] — наповнення каталогу з CSV
	- [[page-auditor]] — read-only аудит відповідності верстці

## Knowledge

- **[[Knowledge/OpenCart3/INDEX|OpenCart3]]** — головна база: архітектура, twig, events, SEO, checkout, пастки
- WordPress / Laravel — додаються за потреби (не створювати порожніх)

## Patterns

- [[Натяжка OpenCart 3 — чеклист]] — повний хід порту верстки на OC3 (hydrophob.net + shokeru)

## Projects

`Projects/<назва>/PROJECT.md` (+ MEMORY, TASKS) — память по кожному репозиторію:
[[Projects/hydrophob.net/PROJECT|hydrophob.net]] · [[Projects/well/PROJECT|well]] · [[Projects/nadel/PROJECT|nadel]]

## Як користуватись

1. Нова задача → [[WORKFLOW]] (пошук по Knowledge перед кодом, не весь vault у контекст).
2. Нова натяжка → [[Натяжка OpenCart 3 — чеклист]].
3. Після нетривіальної задачі → [[MEMORY-RULES]]: чи є reusable знання? Так → у Knowledge; ні → нічого.
