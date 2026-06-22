#!/usr/bin/env bash
#
# Production build + deploy for FIFA 2026 Prode (Linux server).
#
# Replaces the manual sequence:
#     cd /opt/prode/backend  && ./mvnw clean package -DskipTests && sudo systemctl restart prode
#     cd /opt/prode/frontend && npm run build                    && sudo systemctl reload  nginx
#
# Both projects are built FIRST; only if both builds succeed are the services
# touched, so a broken build never gets half-deployed. The script stops at the
# first failure and explains why. systemctl runs under sudo (it may prompt for
# your password); the builds run as the invoking user.
#
# Usage:
#   ./deploy-prod.sh
#
# Overridable via environment variables:
#   PRODE_HOME       install root (default: this script's directory)
#   BACKEND_SERVICE  systemd unit for the backend (default: prode)
#   WEB_SERVICE      systemd unit for the web server (default: nginx)

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRODE_HOME="${PRODE_HOME:-$SCRIPT_DIR}"
BACKEND_DIR="$PRODE_HOME/backend"
FRONTEND_DIR="$PRODE_HOME/frontend"
BACKEND_SERVICE="${BACKEND_SERVICE:-prode}"
WEB_SERVICE="${WEB_SERVICE:-nginx}"

# Colors when attached to a terminal, plain otherwise.
if [ -t 1 ]; then
  CYAN=$'\033[36m'; GREEN=$'\033[32m'; RED=$'\033[31m'; GRAY=$'\033[90m'; RESET=$'\033[0m'
else
  CYAN=''; GREEN=''; RED=''; GRAY=''; RESET=''
fi

step() { printf '\n%s==> %s%s\n' "$CYAN" "$1" "$RESET"; }
fail() { printf '\n%sDEPLOY FAILED: %s%s\n' "$RED" "$1" "$RESET" >&2; exit 1; }

# --- Sanity checks -----------------------------------------------------------

[ -f "$BACKEND_DIR/mvnw" ]          || fail "$BACKEND_DIR/mvnw not found. Set PRODE_HOME to the install root."
[ -f "$FRONTEND_DIR/package.json" ] || fail "$FRONTEND_DIR/package.json not found. Set PRODE_HOME to the install root."
command -v java >/dev/null 2>&1     || fail "'java' is not on PATH."
command -v npm  >/dev/null 2>&1     || fail "'npm' is not on PATH."
command -v sudo >/dev/null 2>&1     || fail "'sudo' is not on PATH (needed to restart $BACKEND_SERVICE and reload $WEB_SERVICE)."

# --- 1. Build backend --------------------------------------------------------

step "Building backend (Maven, skipping tests)"
cd "$BACKEND_DIR" || fail "Cannot enter $BACKEND_DIR"
./mvnw clean package -DskipTests
rc=$?
[ "$rc" -eq 0 ] || fail "Backend build failed (Maven exited $rc). No service was touched."

# --- 2. Build frontend -------------------------------------------------------

step "Building frontend (npm run build)"
cd "$FRONTEND_DIR" || fail "Cannot enter $FRONTEND_DIR"
npm run build
rc=$?
[ "$rc" -eq 0 ] || fail "Frontend build failed (npm exited $rc). No service was touched."

# --- 3. Restart backend service ----------------------------------------------

step "Restarting backend service ($BACKEND_SERVICE)"
sudo systemctl restart "$BACKEND_SERVICE"
rc=$?
[ "$rc" -eq 0 ] || fail "Failed to restart $BACKEND_SERVICE (systemctl exited $rc)."

# Confirm it stayed up (a bad jar can start then crash within a second or two).
sleep 3
if ! sudo systemctl is-active --quiet "$BACKEND_SERVICE"; then
  printf '%sLast log lines for %s:%s\n' "$GRAY" "$BACKEND_SERVICE" "$RESET" >&2
  sudo journalctl -u "$BACKEND_SERVICE" -n 30 --no-pager >&2
  fail "$BACKEND_SERVICE is not active after restart (see the log lines above). nginx was NOT reloaded."
fi

# --- 4. Reload web server ----------------------------------------------------

step "Reloading web server ($WEB_SERVICE)"
sudo systemctl reload "$WEB_SERVICE"
rc=$?
[ "$rc" -eq 0 ] || fail "Failed to reload $WEB_SERVICE (systemctl exited $rc). The new frontend build is in place but nginx was not reloaded."

# --- Done --------------------------------------------------------------------

printf '\n%sDeploy complete.%s\n' "$GREEN" "$RESET"
printf '  Backend : %s (restarted, active)\n' "$BACKEND_SERVICE"
printf '  Frontend: built; %s (reloaded)\n' "$WEB_SERVICE"
