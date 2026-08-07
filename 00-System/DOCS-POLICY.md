# DOCS-POLICY — де живуть markdown-файли (глобально, всі стеки)

**Project repo = код продукту. Цей knowledge repo = память Claude + AI-документація. Local disk = temporary workspace.**

## У project repository — НЕ створювати

Службові AI-md: CLAUDE.md, AGENTS.md, PLAN/TASKS/MEMORY/NOTES/DECISIONS/ARCHITECTURE/CONTEXT/IMPLEMENTATION/DEBUG/REVIEW/TODO/HANDOFF/SESSION/ROADMAP.md і будь-які інші md для памʼяті/планування/scratch/QA/session summaries.

Дозволені винятки: README.md; md як частина продукту; user/dev docs на пряме прохання; технічно потрібні toolchain-файли.

## Куди натомість

| Тип запису | Місце |
|---|---|
| Про конкретний repo (память/рішення/задачі) | `03-Projects/{repo}/` (PROJECT, MEMORY, DECISIONS, TASKS, ARCHITECTURE за потреби) |
| Reusable знання | `02-Knowledge/{технологія}/` |
| Правила роботи | `00-System/` |
| Ролі агентів | `01-Agents/` |
| Процеси | `04-Workflows/` |
| Scratch під задачу | `~/AI-Workspace/tmp/{task-id}/` → після задачі: цінне у knowledge, файл видалити |

## Імпорт 2026-08-07 (виконано)

Службові .md з усіх проєктів перенесені в `03-Projects/<repo>/` і санітизовані (26 секретів → `~/AI-Workspace/secrets/ACCESS.md`). Untracked-оригінали видалені з проєктів; tracked AI-документація видалена комітом. **Залишені навмисно**: `AGENTS.md` (читає Codex CLI — toolchain-виняток), `materials/*.md` і `shokstore/analysis/*.md` (контент-дані, не AI-память), README.md.

## Тест перед створенням будь-якого .md

1. Частина продукту? → repo. 2. Людська документація, що мусить жити з кодом (прямо попросили)? → repo. 3. AI memory/planning/context? → **сюди, в knowledge repo**.

## Git-перевірка

Перед commit у project repo: переглянути нові .md; службовий → зміст у knowledge repo, локальний файл видалити, НЕ комітити.

## Існуючі файли

Існуючі .md у репо (включно з legacy `handoff.md`) не видаляти; читати як джерело на старті сесії; змінювати — тільки якщо потрібно для задачі/дозволено. НОВІ session-state записи ведуться тут у `03-Projects/{repo}/` (MEMORY+TASKS), не в нових handoff.md.

CLAUDE.md у репо не створювати автоматично: глобальні інструкції + MCP + `03-Projects/{repo}/` покривають контекст. Якщо без локального CLAUDE.md технічно ніяк — спершу повідомити користувача.
