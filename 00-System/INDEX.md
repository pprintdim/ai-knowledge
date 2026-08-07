# AI-DEV — INDEX

Shared Knowledge Layer (`~/AI-Workspace/knowledge` = repo `pprintdim/ai-knowledge`).
**Agents = ЯК працювати · Knowledge = ЩО знаємо · Projects = про конкретний проєкт · Workflows = типові процеси · 00-System = правила оркестратора.**

## 00-System

- [[ORCHESTRATOR]] — хто що робить: оркестратор / Codex / субагенти; схема repo
- [[WORKFLOW]] — порядок задачі: repo → память → targeted search → код; пріоритет істини
- [[WORKSPACE]] — GitHub=truth, mirrors/worktrees, push-first, cleanup, безпека видалення
- [[MEMORY-RULES]] — harvesting: що у vault, що ні (секрети — ніколи)
- [[DOCS-POLICY]] — службові .md ТІЛЬКИ тут, project repo = продукт
- `scripts/` — task-start.sh / task-done.sh / workspace-status.sh

## Agents

[[Agents/INDEX|Бібліотека 15 ролей]] у групах за роллю в циклі: `core/` (architect, git, cleanup) · `specialists/` (opencart3, wordpress, frontend, backend-php, database) · `routine/` (importer, api-integration, debug, seo) · `review/` (qa, security, performance) · `натяжки/` (5 виконавців-субагентів) + автороутинг задач.

## Knowledge

[[Knowledge/OpenCart3/INDEX|OpenCart3]] — 10 нотаток (архітектура→checkout→пастки). WordPress/Laravel — при перших задачах.

## Projects

[[Projects/INDEX|Всі проєкти]] (скан 2026-08-07): память для hydrophob.net, well, nadel, stocrm, webprogressor, shokeru; решта — таблицею.

## Workflows

[[Workflows/INDEX|10 шорткатів]]: /fix /debug /feature /import /frontend /api /seo /performance /review /test (slash-команди в `~/.claude/commands/`) + [[natyazhka-opencart]].

## Цикл

1. Задача → workflow/автороутинг → память+знання → worktree → код → qa → push → cleanup → звіт.
2. Нове знання → Knowledge (за [[MEMORY-RULES]]); нове про проєкт → Projects; нове ПРАВИЛО роботи → Agents (рідко).
