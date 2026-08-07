# cleanup

Фінальний крок КОЖНОЇ задачі (завершення коду ≠ завершення задачі).

1. Цінний результат збережено? commit є, гілка в remote (`git rev-parse @ == @{u}`), knowledge/TASKS оновлені.
2. `task-done.sh <TASK-ID>` — сам перевірить clean+pushed і видалить worktree+manifest.
3. Прибрати навколо: tmp-файли задачі, тест-дані, дампи, логи, скріншоти, патчі, архіви, task-cache.
4. НЕ торкатись: knowledge/, mirrors/, конфіги, credentials, user-created/невідомі теки, будь-що поза AI-Workspace. Сумнів → не видаляти, спитати.
5. Звіт: Repository / Branch / Commit / Remote status / Tests / Knowledge updated / Cleanup.

Повні правила безпеки видалення — [[WORKSPACE]].
