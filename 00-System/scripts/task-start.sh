#!/bin/bash
# task-start.sh <repo-url|mirror-name> <TASK-ID> <short-name>
# GitHub → bare mirror (fetch) → worktree + гілка agent/TASK-ID-short-name + manifest
set -euo pipefail

WS="$HOME/AI-Workspace"
REPO_ARG="${1:?repo url або імʼя mirror}"
TASK_ID="${2:?TASK-ID}"
SHORT="${3:?short-name}"

if [[ "$REPO_ARG" == *"://"* || "$REPO_ARG" == git@* ]]; then
  URL="$REPO_ARG"; NAME="$(basename "$REPO_ARG" .git)"
else
  NAME="$(basename "$REPO_ARG" .git)"; URL=""
fi
MIRROR="$WS/mirrors/$NAME.git"
BRANCH="agent/$TASK_ID-$SHORT"
WT="$WS/worktrees/$TASK_ID-$SHORT"
MANIFEST="$WS/tmp/$TASK_ID.manifest"

[[ -e "$WT" ]] && { echo "ERROR: worktree вже існує: $WT"; exit 1; }
[[ -e "$MANIFEST" ]] && { echo "ERROR: manifest вже існує (незавершена задача?): $MANIFEST"; exit 1; }

if [[ ! -d "$MIRROR" ]]; then
  [[ -z "$URL" ]] && { echo "ERROR: mirror $MIRROR нема і URL не задано"; exit 1; }
  echo "→ bare clone $URL → $MIRROR"
  git clone --bare "$URL" "$MIRROR"
  # bare (НЕ --mirror): push не буде mirror-push усіх refs
  git -C "$MIRROR" config remote.origin.fetch '+refs/heads/*:refs/remotes/origin/*'
fi

echo "→ fetch mirror"
git -C "$MIRROR" fetch --prune origin

DEFAULT="$(git -C "$MIRROR" symbolic-ref --short HEAD 2>/dev/null || echo main)"
git -C "$MIRROR" show-ref -q "refs/remotes/origin/$DEFAULT" || DEFAULT=master

echo "→ worktree $WT (гілка $BRANCH від origin/$DEFAULT)"
git -C "$MIRROR" worktree add --no-track -b "$BRANCH" "$WT" "origin/$DEFAULT"

cat > "$MANIFEST" <<M
task_id=$TASK_ID
repository=$NAME
branch=$BRANCH
worktree_path=$WT
mirror_path=$MIRROR
created_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)
M
echo "OK: працюй у $WT ; завершення: task-done.sh $TASK_ID"
