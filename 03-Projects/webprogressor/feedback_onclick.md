> [!note] Імпортовано з `/Users/pprintdim/Desktop/vs_projects/webprogressor/.claude/feedback_onclick.md` 2026-08-07 (DOCS-POLICY). Санітизовано секретів: 0. Оригінал: untracked, видалений.

---
name: onclick in PHP → автоматично JS в main.js
description: Якщо в PHP написано onclick="fn()" і очевидно що вона робить — одразу писати реалізацію в main.js без запиту
type: feedback
---

Коли в PHP/HTML з'являється `onclick="functionName()"` і з контексту зрозуміло що функція робить — одразу додавати реалізацію в main.js як `window.functionName`.

**Why:** Користувач не хоче окремо просити написати JS для кожного onclick — якщо очевидно, зроби самостійно.

**How to apply:** Побачив `onclick="fn()"` в PHP → зрозумів що робить (закрити меню, toggles щось, etc.) → одразу пишеш `window.fn = () => { ... }` в main.js у відповідному блоці.