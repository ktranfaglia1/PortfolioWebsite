#!/usr/bin/env bash
# Pull the latest site, build it, and swap the new build into dist/.
# Safe to run from cron: it exits early when nothing changed, a failed build
# leaves the live site untouched, and only one run happens at a time.
#
#   ./scripts/deploy.sh            # deploy origin/main if it changed
#   FORCE=1 ./scripts/deploy.sh    # rebuild even if nothing changed
#   ./scripts/deploy.sh rollback   # put the previous build back
#
# Env: DEPLOY_BRANCH (default: main), GITHUB_TOKEN (optional, see README).
set -euo pipefail

cd "$(dirname "$0")/.."
branch="${DEPLOY_BRANCH:-main}"
log() { printf '[deploy %s] %s\n' "$(date '+%F %T')" "$*"; }

exec 9>.deploy.lock
if ! flock -n 9; then
  log "another deploy is running; exiting"
  exit 0
fi

if [[ "${1:-}" == "rollback" ]]; then
  [[ -d dist.prev ]] || { log "no previous build (dist.prev) to roll back to"; exit 1; }
  rm -rf dist.failed
  [[ -d dist ]] && mv dist dist.failed
  mv dist.prev dist
  log "rolled back; the replaced build is in dist.failed"
  exit 0
fi

git fetch --quiet origin "$branch"
if [[ -d dist && "${FORCE:-0}" != 1 && "$(git rev-parse HEAD)" == "$(git rev-parse "origin/$branch")" ]]; then
  log "already at $(git rev-parse --short HEAD); nothing to do"
  exit 0
fi

git checkout --quiet "$branch"
git merge --quiet --ff-only "origin/$branch"
log "building $(git rev-parse --short HEAD)"

pnpm install --frozen-lockfile
rm -rf .build-tmp
pnpm astro build --outDir .build-tmp

rm -rf dist.prev
[[ -d dist ]] && mv dist dist.prev
mv .build-tmp dist
log "live: $(git rev-parse --short HEAD) (previous build kept in dist.prev)"
