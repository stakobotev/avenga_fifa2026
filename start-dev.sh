#!/usr/bin/env bash
#
# Local dev startup for FIFA 2026 Prode (personal use; Git Bash on Windows).
#
# Runs four steps in order and STOPS at the first failure with a clear reason:
#   1. Build backend  (Maven)
#   2. Build frontend (npm install + tsc + vite build)
#   3. Start backend  (runs the built jar with the dev profile, in the background)
#   4. Start frontend (vite dev server, in the foreground)
#
# The backend runs in the background with its log written to
# backend/target/backend-dev.log; the frontend runs in the foreground so this
# window shows its output. Press Ctrl+C to stop the frontend, and the backend
# is shut down automatically on exit.
#
# Usage:
#   ./start-dev.sh               # normal (backend tests skipped for speed)
#   ./start-dev.sh --with-tests  # include the backend test suite in the build

set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"
BACKEND_LOG="$BACKEND/target/backend-dev.log"
WITH_TESTS=0

for arg in "$@"; do
  case "$arg" in
    --with-tests) WITH_TESTS=1 ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

# Colors when attached to a terminal, plain otherwise.
if [ -t 1 ]; then
  CYAN=$'\033[36m'; GREEN=$'\033[32m'; RED=$'\033[31m'; GRAY=$'\033[90m'; RESET=$'\033[0m'
else
  CYAN=''; GREEN=''; RED=''; GRAY=''; RESET=''
fi

step() { printf '\n%s==> %s%s\n' "$CYAN" "$1" "$RESET"; }
fail() { printf '\n%sSTARTUP FAILED: %s%s\n' "$RED" "$1" "$RESET" >&2; exit 1; }

BACKEND_PID=""
cleanup() {
  if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    printf '\n%sStopping backend (pid %s)...%s\n' "$GRAY" "$BACKEND_PID" "$RESET"
    kill "$BACKEND_PID" 2>/dev/null
  fi
}
trap cleanup EXIT INT TERM

# Wait until a TCP port accepts a connection, or time out after $2 seconds.
# Returns 0 if the port opened, 2 if the process ($3) died first, 1 on timeout.
wait_port() {
  local port="$1" timeout="$2" pid="$3" i=0
  while [ "$i" -lt "$timeout" ]; do
    if [ -n "$pid" ] && ! kill -0 "$pid" 2>/dev/null; then
      return 2
    fi
    if (exec 3<>"/dev/tcp/127.0.0.1/$port") 2>/dev/null; then
      exec 3>&- 3<&-
      return 0
    fi
    sleep 1
    i=$((i + 1))
  done
  return 1
}

# --- Sanity checks -----------------------------------------------------------

[ -f "$BACKEND/mvnw" ]          || fail "backend/mvnw not found. Run this script from the repository root."
[ -f "$FRONTEND/package.json" ] || fail "frontend/package.json not found. Run this script from the repository root."
command -v java >/dev/null 2>&1 || fail "'java' is not on your PATH. Install a JDK (17+) so the backend jar can run."
command -v npm  >/dev/null 2>&1 || fail "'npm' is not on your PATH. Install Node.js so the frontend can build and run."

# --- 1. Build backend --------------------------------------------------------

step "Building backend (Maven)"
cd "$BACKEND" || fail "Cannot enter the backend directory."
MVN_ARGS="clean package"
[ "$WITH_TESTS" -eq 0 ] && MVN_ARGS="$MVN_ARGS -DskipTests"
sh ./mvnw $MVN_ARGS
rc=$?
[ "$rc" -eq 0 ] || fail "Backend build failed (Maven exited $rc). See the Maven output above for the failing module/test."

# Locate the runnable Spring Boot jar (not the *.jar.original).
JAR="$(ls -1 "$BACKEND"/target/*.jar 2>/dev/null | grep -v '\.original$' | head -n 1)"
[ -n "$JAR" ] || fail "Backend build succeeded but no runnable jar was found in backend/target."

# --- 2. Build frontend -------------------------------------------------------

step "Building frontend (npm install + build)"
cd "$FRONTEND" || fail "Cannot enter the frontend directory."
npm install
rc=$?
[ "$rc" -eq 0 ] || fail "Frontend dependency install failed (npm exited $rc). See the npm output above."
npm run build
rc=$?
[ "$rc" -eq 0 ] || fail "Frontend build failed (npm exited $rc). This is usually a TypeScript (tsc) or Vite error shown above."

# --- 3. Start backend --------------------------------------------------------

step "Starting backend (dev profile, port 8080)"
cd "$BACKEND" || fail "Cannot enter the backend directory."
SPRING_PROFILES_ACTIVE=dev java -jar "$JAR" > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!
printf '%s    Backend starting (pid %s); logs: %s%s\n' "$GRAY" "$BACKEND_PID" "$BACKEND_LOG" "$RESET"
printf '%s    Waiting for backend to accept connections on port 8080...%s\n' "$GRAY" "$RESET"

wait_port 8080 120 "$BACKEND_PID"
case $? in
  0) printf '%s    Backend is up.%s\n' "$GREEN" "$RESET" ;;
  2) fail "The backend process exited before listening on port 8080 (common causes: port 8080 in use, or a schema error). Last log lines:
$(tail -n 30 "$BACKEND_LOG" 2>/dev/null)" ;;
  *) fail "The backend did not start listening on port 8080 within 120s. Check $BACKEND_LOG" ;;
esac

# --- 4. Start frontend -------------------------------------------------------

step "Starting frontend (Vite dev server, port 5173)"
printf '\n%sBoth servers are running:%s\n' "$GREEN" "$RESET"
printf '  Backend : http://localhost:8080  (H2 console: http://localhost:8080/h2-console)\n'
printf '  Frontend: http://localhost:5173\n'
printf '%sPress Ctrl+C to stop the frontend; the backend will be stopped automatically.%s\n\n' "$GRAY" "$RESET"

cd "$FRONTEND" || fail "Cannot enter the frontend directory."
npm run dev
