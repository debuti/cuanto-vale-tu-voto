#!/usr/bin/env bash
# Refreshes the polls and publishes a patch release when they changed.
#   scripts/auto-update.sh          one run
#   scripts/auto-update.sh --loop   one run a day until polls may no longer be published
# Anything odd (strange data, a red test, a failed deploy) stops the release and leaves
# the working tree as it was. Log: .cache/auto-update.log
set -uo pipefail
cd "$(dirname "$0")/.."
LAST_DAY=2026-11-24 # polls are banned from the 24th; that morning picks up the last ones
LOG=.cache/auto-update.log
mkdir -p .cache
say() { echo "$(date -u +%FT%TZ) $*" >> "$LOG"; }

run() {
  if [ -n "$(git status --porcelain)" ]; then say "skip: working tree not clean"; return 1; fi
  cp src/lib/data/polls.json .cache/polls.before.json
  if ! node scripts/update-data.mjs --polls > .cache/auto-data.log 2>&1; then
    say "FAIL: data script"; git checkout -- src/lib/data; return 1
  fi
  if git diff --quiet -- src/lib/data/polls.json; then
    say "no new polls"; git checkout -- src/lib/data; return 0
  fi
  if ! node scripts/check-polls.mjs .cache/polls.before.json src/lib/data/polls.json >> "$LOG" 2>&1; then
    say "FAIL: polls rejected"; git checkout -- src/lib/data; return 1
  fi
  npm version patch --no-git-tag-version > /dev/null
  local v; v=$(node -p "require('./package.json').version")
  if ! npm run gate > .cache/auto-gate.log 2>&1; then
    say "FAIL: gate red for v$v (see .cache/auto-gate.log)"; git checkout -- .; return 1
  fi
  git add src/lib/data package.json package-lock.json
  git commit -q -m "Encuestas al día: v$v" -m "Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>"
  git tag "v$v"
  if ! git push -q origin HEAD "v$v" >> "$LOG" 2>&1; then say "FAIL: push v$v"; return 1; fi
  # Rebuild after the commit so Settings shows the commit that is live.
  if ! npm run build > .cache/auto-build.log 2>&1; then say "FAIL: build v$v"; return 1; fi
  if ! npx wrangler deploy > .cache/auto-deploy.log 2>&1; then say "FAIL: deploy v$v"; return 1; fi
  # Right after a deploy the edge may still serve the old build: retry once a minute later.
  if ! npm run smoke > .cache/auto-smoke.log 2>&1 && ! { sleep 60; npm run smoke > .cache/auto-smoke.log 2>&1; }; then
    say "FAIL: smoke v$v"; return 1
  fi
  say "published v$v ($(node -p "require('./src/lib/data/meta.json').pollCount") polls, last $(node -p "require('./src/lib/data/meta.json').lastPoll"))"
}

if [ "${1:-}" != "--loop" ]; then run; exit $?; fi
say "loop started (pid $$)"
while [ "$(date -u +%F)" \< "$LAST_DAY" ] || [ "$(date -u +%F)" = "$LAST_DAY" ]; do
  run
  sleep 86400
done
say "loop finished: polls frozen"
