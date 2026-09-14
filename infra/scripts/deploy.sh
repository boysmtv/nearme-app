#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# DEKAT Booking Platform - Blue-Green Deployment Script
# Usage: ./deploy.sh [blue|green] [tag]
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

# --- Configuration ---
DEPLOYMENT="${1:-blue}"
API_TAG="${2:-latest}"
COMPOSE_DIR="$(dirname "$0")/../compose"
CURRENT_ENV_FILE="${COMPOSE_DIR}/.env"
CADDYFILE="../caddy/Caddyfile"

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[$(date '+%H:%M:%S')] WARNING:${NC} $1"; }
err()  { echo -e "${RED}[$(date '+%H:%M:%S')] ERROR:${NC} $1" >&2; }

# --- Validation ---
if [[ ! "${DEPLOYMENT}" =~ ^(blue|green)$ ]]; then
  err "Usage: $0 [blue|green] [tag]"
  exit 1
fi

if [ ! -f "${CURRENT_ENV_FILE}" ]; then
  err ".env file not found at ${CURRENT_ENV_FILE}"
  exit 1
fi

log "Deploying API ${DEPLOYMENT} with tag: ${API_TAG}"

# --- Determine active slot ---
if [ "${DEPLOYMENT}" = "blue" ]; then
  ACTIVE="green"
else
  ACTIVE="blue"
fi

# --- Check active slot health ---
log "Checking ${ACTIVE} slot health..."
if docker inspect --format='{{.State.Health.Status}}' "dekat-api-${ACTIVE}" 2>/dev/null | grep -q "healthy"; then
  log "Active slot (${ACTIVE}) is healthy"
else
  warn "Active slot (${ACTIVE}) is not healthy, proceeding anyway"
fi

# --- Pull new image ---
log "Pulling image: ghcr.io/dekat/api:${API_TAG}"
docker pull "ghcr.io/dekat/api:${API_TAG}" 2>/dev/null || warn "Pull failed, using local image"

# --- Update and start new slot ---
log "Updating ${DEPLOYMENT} slot with image tag: ${API_TAG}"
export API_TAG="${API_TAG}"

cd "${COMPOSE_DIR}"

# Start the new slot
docker compose -f compose.yaml up -d "api-${DEPLOYMENT}"

# --- Wait for health check ---
log "Waiting for ${DEPLOYMENT} slot to become healthy..."
MAX_WAIT=120
INTERVAL=5
ELAPSED=0

while [ ${ELAPSED} -lt ${MAX_WAIT} ]; do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' "dekat-api-${DEPLOYMENT}" 2>/dev/null || echo "starting")
  if [ "${STATUS}" = "healthy" ]; then
    log "${DEPLOYMENT} slot is healthy after ${ELAPSED}s"
    break
  fi
  sleep ${INTERVAL}
  ELAPSED=$((ELAPSED + INTERVAL))
done

if [ ${ELAPSED} -ge ${MAX_WAIT} ]; then
  err "${DEPLOYMENT} slot failed to become healthy within ${MAX_WAIT}s"
  warn "Rolling back: stopping ${DEPLOYMENT} slot"
  docker compose -f compose.yaml stop "api-${DEPLOYMENT}"
  exit 1
fi

# --- Run smoke test ---
log "Running smoke test..."
SMOKE_RESULT=$(docker exec "dekat-api-${DEPLOYMENT}" \
  wget -q -O - http://localhost:8080/api/v1/actuator/health 2>/dev/null || echo "FAILED")

if echo "${SMOKE_RESULT}" | grep -q '"status":"UP"'; then
  log "Smoke test passed"
else
  warn "Smoke test returned: ${SMOKE_RESULT}"
fi

# --- Switch Caddy traffic ---
log "Switching traffic to ${DEPLOYMENT} slot..."
# Update Caddy config to point to new active slot
if [ -f "${CADDYFILE}" ]; then
  # Replace the default reverse_proxy target
  sed -i "s|reverse_proxy api-blue:8080|reverse_proxy api-${DEPLOYMENT}:8080|g" "${CADDYFILE}" 2>/dev/null || true
  # Reload Caddy
  docker exec dekat-caddy caddy reload --config /etc/caddy/Caddyfile 2>/dev/null || warn "Caddy reload failed"
fi

log "═══════════════════════════════════════════════════════════"
log "Deployment of API ${DEPLOYMENT} (${API_TAG}) complete!"
log "Previous active slot: ${ACTIVE}"
log "New active slot: ${DEPLOYMENT}"
log "═══════════════════════════════════════════════════════════"
