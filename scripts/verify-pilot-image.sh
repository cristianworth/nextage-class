#!/usr/bin/env bash
set -euo pipefail

# All addresses and credentials below are fictitious. The test never connects to Supabase.
image="nextage-pilot-verification:${GITHUB_RUN_ID:-local}"
container="nextage-pilot-verification-${GITHUB_RUN_ID:-local}-$$"
web_image="${image}-web"
fixture="$(mktemp web/.env.container-canary-XXXXXXXX)"
port=5189

cleanup() {
  docker rm -f "$container" >/dev/null 2>&1 || true
  docker image rm "$image" "$web_image" >/dev/null 2>&1 || true
  rm -f -- "$fixture"
}
trap cleanup EXIT

printf '%s\n' 'fictitious-private-fixture' > "$fixture"

args=(--build-arg VITE_SUPABASE_URL=https://auth.nextage.test
      --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_browser_test)
docker build "${args[@]}" --target web -t "$web_image" .
docker run --rm --entrypoint sh "$web_image" -c \
  'test -z "$(find /src/web -maxdepth 1 -name .env.container-canary-\* -print -quit)"'
docker build "${args[@]}" -t "$image" .

docker run -d --name "$container" -p "127.0.0.1:${port}:${port}" \
  -e PORT="$port" \
  -e ConnectionStrings__NextageClass='Host=127.0.0.1;Port=1;Database=fictitious;Username=fictitious;Password=fictitious;Timeout=1' \
  -e Supabase__Url='https://auth.nextage.test' "$image" >/dev/null

base="http://127.0.0.1:${port}"
ready=false
for _ in {1..40}; do
  if curl -fsS "$base/api/health/live" >/dev/null 2>&1; then ready=true; break; fi
  sleep 0.5
done
if [[ "$ready" != true ]]; then
  docker logs "$container"
  echo 'The container did not start.' >&2
  exit 1
fi

check_status() {
  local method="$1" path="$2" expected="$3" actual
  actual=$(curl -sS -o /dev/null -w '%{http_code}' -X "$method" "$base$path")
  printf '%s %s: %s\n' "$method" "$path" "$actual"
  [[ "$actual" == "$expected" ]]
}

check_status GET / 200
check_status GET /acesso 200
check_status GET /api/health/live 200
check_status GET /api/health/ready 503
check_status GET /api/session 401
check_status GET /api/unknown 404
check_status POST /acesso 404
curl -fsS "$base/" | grep -q '<div id="root">'
test "$(docker exec "$container" id -u)" != 0
if missing_config=$(docker run --rm -e Supabase__Url='https://auth.nextage.test' "$image" 2>&1); then
  echo 'The application started without a database connection.' >&2
  exit 1
fi
[[ "$missing_config" == *'ConnectionStrings__NextageClass'* ]]
echo 'Pilot image passed isolated checks.'
