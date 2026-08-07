#!/bin/bash
# task-done.sh <TASK-ID> [--abandon]
# Перевірки безпеки → видалення worktree + manifest. --abandon: без вимоги push (тільки clean).
set -euo pipefail

WS="$HOME/AI-Workspace"
TASK_ID="${1:?TASK-ID}"
MODE="${2:-}"
MANIFEST="$WS/tmp/$TASK_ID.manifest"

[[ -f "$MANIFEST" ]] || { echo "ERROR: manifest не знайдено: $MANIFEST"; exit 1; }
# shellcheck disable=SC1090
source "$MANIFEST"

# Безпека: шлях МУСИТЬ бути реальною текою всередині worktrees/
REAL="$(cd "$worktree_path" 2>/dev/null && pwd -P || true)"
case "$REAL" in
  "$WS/worktrees/"?*) ;;
  *) echo "ERROR: $worktree_path поза $WS/worktrees/ — відмова"; exit 1;;
esac

if [[ -n "$(git -C "$REAL" status --porcelain)" ]]; then
  echo "STOP: незакомічені зміни у $REAL — commit/stash або повідом користувача:"
  git -C "$REAL" status --short | head -20
  exit 1
fi

if [[ "$MODE" != "--abandon" ]]; then
  UP="$(git -C "$REAL" rev-parse --abbrev-ref '@{u}' 2>/dev/null || true)"
  [[ -z "$UP" ]] && { echo "STOP: гілка не запушена (нема upstream). зроби: git -C worktree push -u origin <гілка>, або --abandon"; exit 1; }
  [[ "$(git -C "$REAL" rev-parse @)" != "$(git -C "$REAL" rev-parse '@{u}')" ]] && {
    echo "STOP: локальні коміти не в remote — push перед cleanup"; exit 1; }
  echo "✓ clean, ✓ запушено ($UP)"
else
  echo "✓ clean (abandon — push не вимагається)"
fi

git -C "$mirror_path" worktree remove "$REAL"
git -C "$mirror_path" worktree prune
git -C "$mirror_path" branch -D "$branch" 2>/dev/null || true
rm -f "$MANIFEST"
echo "OK: worktree видалено, manifest прибрано. Задача $TASK_ID закрита."
