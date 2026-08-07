#!/bin/bash
# workspace-status.sh — огляд worktrees/tmp: що висить, що можна чистити (нічого не видаляє)
WS="$HOME/AI-Workspace"
echo "=== $WS (розміри) ==="
du -sh "$WS"/knowledge "$WS"/mirrors "$WS"/worktrees "$WS"/tmp 2>/dev/null
echo
echo "=== worktrees ==="
found=0
for d in "$WS"/worktrees/*/; do
  [[ -d "$d" ]] || continue; found=1
  b="$(git -C "$d" branch --show-current 2>/dev/null || echo '?')"
  dirty="$(git -C "$d" status --porcelain 2>/dev/null | wc -l | tr -d ' ')"
  up="$(git -C "$d" rev-parse --abbrev-ref '@{u}' 2>/dev/null || echo 'НЕ ЗАПУШЕНО')"
  ahead="$(git -C "$d" rev-list '@{u}..@' --count 2>/dev/null || echo '-')"
  echo "$(basename "$d") | гілка: $b | незакомічено: $dirty | upstream: $up | не в remote: $ahead"
done
[[ $found -eq 0 ]] && echo "(порожньо — так і має бути між задачами)"
echo
echo "=== tmp manifests ==="
ls "$WS"/tmp/*.manifest 2>/dev/null || echo "(нема)"
