#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# DEKAT Booking Platform - Rollback Script
# Usage: ./rollback.sh [blue|green]
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

# --- Configuration ---
COMPOSE_DIR="$(dirname "$0")/../compose"
CADDYFILE="../caddy/Caddyfile"

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[$(date '+%H:%M:%S')] WARNING:${NC} $1"; }
err()  { echo -e "${RED}[$(date '+%H:%M:%S')] ERROR:${NC} $1" >&2; }

# --- Determine current and rollback slots ---
CURRENT_SLOT="${1:-}"
if [ -z "${CURRENT_SLOT}" ]; then
  # Auto-detect active slot
  for slot in blue green; do
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' "dekat-api-${slot}" 2>/dev/null || echo "stopped")
    if [ "${STATUS}" = "healthy" ]; then
      CURRENT_SLOT="${slot}"
      break
    fi
  done

  if [ -z "${CURRENT_SLOT}" ]; then
    err "Could not determine active slot. Usage: $0 [blue|green]"
    exit 1
  fi
fi

if [ "${CURRENT_SLOT}" = "blue" ]; then
  ROLLBACK_SLOT="green"
else
  ROLLBACK_SLOT="blue"
fi

log "Current active slot: ${CURRENT_SLOT}"
log "Rolling back to: ${ROLLBACK_SLOT}"

# --- Check rollback slot exists ---
if ! docker ps --format '{{.Names}}' | grep -q "dekat-api-${ROLLBACK_SLOT}"; then
  err "Rollback slot (${ROLLBACK_SLOT}) container not found"
  exit 1
fi

# --- Check rollback slot health ---
log "Checking ${ROLLBACK_SLOT} slot health..."
STATUS=$(docker inspect --format='{{.State.Health.Status}}' "dekat-api-${ROLLBACK_SLOT}" 2>/dev/null || echo "stopped")

if [ "${STATUS}" != "healthy" ]; then
  warn "${ROLLBACK_SLOT} slot is not healthy (${STATUS})"
  log "Attempting to start ${ROLLBACK_SLOT} slot..."

  cd "${COMPOSE_DIR}"
  docker compose -f compose.yaml up -d "api-${ROLLBACK_SLOT}"

  # Wait for health
  MAX_WAIT=120
  INTERVAL=5
  ELAPSED=0

  while [ ${ELAPSED} -lt ${MAX_WAIT} ]; do
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' "dekat-api-${ROLLBACK_SLOT}" 2>/dev/null || echo "starting")
    if [ "${STATUS}" = "healthy" ]; then
      log "${ROLLBACK_SLOT} slot is now healthy"
      break
    fi
    sleep ${INTERVAL}
    ELAPSED=$((ELAPSED + INTERVAL))
  done

  if [ ${ELAPSED} -ge ${MAX_WAIT} ]; then
    err "${ROLLBACK_SLOT} slot failed to become healthy within ${MAX_WAIT}s"
    exit 1
  fi
fi

# --- Run smoke test ---
log "Running smoke test on ${ROLLBACK_SLOT}..."
SMOKE_RESULT=$(docker exec "dekat-api-${ROLLBACK_SLOT}" \
  wget -q -O - http://localhost:8080/api/v1/actuator/health 2>/dev/null || echo "FAILED")

if echo "${SMOKE_RESULT}" | grep -q '"status":"UP"'; then
  log "Smoke test passed"
else
  warn "Smoke test returned: ${SMOKE_RESULT}"
fi

# --- Switch Caddy traffic ---
log "Switching traffic to ${ROLLBACK_SLOT} slot..."
if [ -f "${CADDYFILE}" ]; then
  sed -i "s|reverse_api-${CURRENT_SLOT}:8080|reverse_proxy api-${ROLLBACK_SLOT}:8080|g" "${CADDYFILE}" 2>/dev/null || true
  docker exec dekat-caddy caddy reload --config /etc/caddy/Caddyfile 2>/dev/null || warn "Caddy reload failed"
fi

# --- Stop failed slot ---
log "Stopping failed ${CURRENT_SLOT} slot..."
cd "${COMPOSE_DIR}"
docker compose -f compose.yaml stop "api-${CURRENT_SLOT}"

log "═══════════════════════════════════════════════════════════"
log "Rollback complete!"
log "Active slot: ${ROLLBACK_SLOT}"
log "Stopped slot: ${CURRENT_SLOT}"
log "═══════════════════════════════════════════════════════════"
