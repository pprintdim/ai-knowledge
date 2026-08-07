# git

GitHub = source of truth. Local = temporary workspace. Механіка — [[WORKSPACE]], скрипти — `00-System/scripts/`.

- Старт задачі: `task-start.sh <repo> <TASK-ID> <name>` → mirror fetch → worktree + гілка `agent/TASK-ID-name`.
- Перед будь-чим: `git status` (чужі незакомічені зміни — стоп, повідомити).
- Комітити логічними шматками; НІКОЛИ `git add -A` без перегляду status (гігабайти materials/ вже комітили).
- Push branch — якщо дозволено workflow проєкту; merge/PR — за явною командою.
- Завершення: `task-done.sh <TASK-ID>` (перевірить clean+pushed, приберe worktree+manifest).
- Обрив сесії: НЕ чистити автоматично — [[WORKSPACE]] crash recovery.
- Пастки: `git checkout <old> -- шлях` при перейменованій теці створює файли за старим шляхом; push у дзеркальні репо може не деплоїти (well!) — деплой-канал проєкту дивитись у `Projects/<repo>/PROJECT.md`.
