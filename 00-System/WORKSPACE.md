# WORKSPACE — гігієна локального диска

**GitHub — source of truth. Локальний диск — workspace, не archive.**
Все цінне живе у 2 місцях: GitHub repo проєкту АБО knowledge repo (цей vault). Решта — тимчасове й видаляється.

## Постійне локально (НЕ видаляти)

```
~/AI-Workspace/
├── knowledge/    ← цей vault (clone ai-knowledge) — Obsidian + MCP
├── mirrors/      ← bare-репозиторії (кеш обʼєктів): well.git, nadel.git…
├── worktrees/    ← ТИМЧАСОВІ робочі копії під задачі
└── tmp/          ← manifest-и задач, тимчасові файли
```

Також не чіпати: SSH keys, git/MCP/Claude config, credentials, production-дані, user-created теки, невідомі теки, файли поза AI-Workspace, чужі незакомічені зміни. **Не впевнений, що файл створив поточний workflow — НЕ видаляй.**
Існуючі повні копії проєктів у `/Applications/MAMP/htdocs/` (MAMP їх СЕРВІТЬ — робочі стенди) і `~/Desktop/vs_projects/` — user-created, лишаються.

## Життєвий цикл задачі

```
GitHub → bare mirror (fetch) → worktree (гілка agent/TASK-ID-name) →
робота → перевірка → commit → push → verify remote → видалити worktree + manifest
```

Скрипти: [[scripts|00-System/scripts/]]:
- `task-start.sh <repo-url|name> <TASK-ID> <short-name>` — mirror fetch/clone → worktree + гілка + manifest у tmp/
- `task-done.sh <TASK-ID>` — перевірки (clean? запушено?) → видалення worktree+manifest; `--abandon` — викинути без push (тільки clean)
- `workspace-status.sh` — огляд усіх worktrees: гілка, стан, синк з remote

## Push-first policy

Завершення коду ≠ завершення задачі. Задача завершена ТІЛЬКИ після: commit → push → verify remote → cleanup. НІКОЛИ: реалізація → видалення workspace → втрата коду.

## Що видаляти після задачі

Worktree/тимчасовий clone, build artifacts, tmp, тест-дані, архіви (і розпаковані), тимчасові SQL-дампи/логи/скріншоти/дебаг-файли, task-cache, node_modules/vendor УСЕРЕДИНІ worktree, тимчасові копії БД, застосовані patch-файли, manifest.
npm/composer cache — глобальні, спільні; в worktrees залежності не зберігати між задачами.

## Безпека cleanup (жорсткі правила)

1. Перед recursive delete: resolve абсолютний шлях → він МУСИТЬ бути всередині `~/AI-Workspace/worktrees/` або `~/AI-Workspace/tmp/` → це task-owned тека (є manifest) → тільки тоді rm.
2. Ніякого `rm -rf $VAR` без перевірки значення. Ніколи recursive delete: `/`, `~`, `~/Projects`, `~/Documents`, vault root, mirrors root.
3. Перед видаленням worktree: `git status` чистий І гілка запушена (`git rev-parse @ == @{u}`). Є зміни → commit/stash/повідомити користувача, НЕ видаляти.

## Crash recovery / старі workspace

Після обриву НЕ чистити автоматично. Спершу: git status → branch → uncommitted → remote → manifest. Є незбережена робота → запропонувати resume. Точно orphaned і все в GitHub → cleanup. Старі worktrees чистити тільки після цих перевірок, не «за датою».

## Задача-аналіз (без змін коду)

Worktree не створювати без потреби: git show з mirror / GitHub API / shallow fetch; тимчасове — прибрати після.

## Диск

Періодично: `du -sh ~/AI-Workspace/*`. Великі теки → зʼясувати причину (node_modules/vendor/.git/build/logs/backups/tmp). Не видаляти лише через розмір — спершу впевнитись, що disposable.

## Логи і звіт задачі

Сирі debug-логи після успіху — видаляти. В Obsidian — тільки короткий summary у `Projects/<repo>/TASKS.md`. Фінальний звіт кожної задачі:

```
Repository / Branch / Commit / Remote status / Tests / Knowledge updated / Cleanup
```
