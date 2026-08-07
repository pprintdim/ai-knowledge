# Workflows — типові процеси

Шорткати задач: пайплайн агентів + кроки. Продубльовані як slash-команди Claude Code (`~/.claude/commands/`) — набираєш `/import <опис>` і оркестратор веде процес сам.

| Workflow | Пайплайн |
|---|---|
| [[fix]] | debug → спеціаліст → qa → cleanup |
| [[debug-flow\|debug]] | debug → спеціаліст (+database) → qa |
| [[feature]] | architect → спеціаліст (∥frontend) → qa → cleanup |
| [[import]] | architect → importer → CMS-спеціаліст → qa → cleanup |
| [[frontend-flow\|frontend]] | frontend → qa → cleanup |
| [[api]] | api-integration → backend-php → qa |
| [[seo-flow\|seo]] | seo → CMS-спеціаліст → qa |
| [[performance-flow\|performance]] | performance → спеціаліст → qa |
| [[review]] | qa → security → performance (за потреби) |
| [[test]] | qa: тести/lint/рендер без змін коду |
| [[natyazhka-opencart]] | повний порт верстки → OC3 (окремий великий чеклист) |

Спільна рамка кожного workflow: [[WORKFLOW]] (пошук знань перед кодом) + [[WORKSPACE]] (worktree lifecycle + push-first + cleanup).
