#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
cd "$ROOT_DIR"

REMOTE="${1:-origin}"
BASE_REF="${2:-main}"
REMOTE_BASE_REF="$REMOTE/$BASE_REF"

printf '=== Git Sync Check ===\n'
printf 'Remote: %s\n' "$REMOTE"
printf 'Base ref: %s\n\n' "$REMOTE_BASE_REF"

git fetch "$REMOTE" --prune --quiet

printf 'Current HEAD: %s\n' "$(git rev-parse --short HEAD)"
printf 'Working tree: '
if [[ -n "$(git status --short)" ]]; then
  printf 'dirty\n'
else
  printf 'clean\n'
fi

if git show-ref --verify --quiet "refs/remotes/$REMOTE_BASE_REF"; then
  read -r behind_count ahead_count < <(git rev-list --left-right --count "$REMOTE_BASE_REF...HEAD")
  printf 'Drift vs %s: behind=%s ahead=%s\n\n' "$REMOTE_BASE_REF" "$behind_count" "$ahead_count"
else
  printf 'WARNING: base ref %s not found locally after fetch\n\n' "$REMOTE_BASE_REF"
fi

merged_branches=()
stale_branches=()

while IFS= read -r branch; do
  [[ -z "$branch" ]] && continue
  [[ "$branch" == "$BASE_REF" ]] && continue

  upstream="$(git for-each-ref --format='%(upstream:short)' "refs/heads/$branch")"
  if git merge-base --is-ancestor "refs/heads/$branch" "$REMOTE_BASE_REF" 2>/dev/null; then
    merged_branches+=("$branch")
  elif [[ -n "$upstream" ]] && ! git show-ref --verify --quiet "refs/remotes/$upstream"; then
    stale_branches+=("$branch -> missing upstream $upstream")
  fi
done < <(git for-each-ref --format='%(refname:short)' refs/heads)

printf 'Branches already merged into %s:\n' "$REMOTE_BASE_REF"
if [[ ${#merged_branches[@]} -eq 0 ]]; then
  printf -- '- none\n'
else
  for branch in "${merged_branches[@]}"; do
    printf -- '- %s\n' "$branch"
  done
fi

printf '\nBranches with missing upstream refs:\n'
if [[ ${#stale_branches[@]} -eq 0 ]]; then
  printf -- '- none\n'
else
  for branch in "${stale_branches[@]}"; do
    printf -- '- %s\n' "$branch"
  done
fi

if command -v gh >/dev/null 2>&1; then
  printf '\nOpen PRs targeting %s:\n' "$BASE_REF"
  if gh auth status >/dev/null 2>&1; then
    pr_output="$(gh pr list --state open --base "$BASE_REF" --limit 20 --json number,title,headRefName --jq '.[] | "- #\(.number) \(.headRefName): \(.title)"' 2>/dev/null || true)"
    if [[ -z "$pr_output" ]]; then
      printf -- '- none\n'
    else
      printf '%s\n' "$pr_output"
    fi
  else
    printf -- '- unable to query GitHub CLI\n'
  fi
else
  printf '\nOpen PRs targeting %s:\n- gh not installed\n' "$BASE_REF"
fi

printf '\nRecommendation:\n'
if [[ ${#merged_branches[@]} -gt 0 ]]; then
  printf -- '- refresh durable memory/logs before assuming local branches represent active fronts\n'
fi
printf -- '- run this script before session-open, memory-curator, session-close and sprint-close when branch state matters\n'
