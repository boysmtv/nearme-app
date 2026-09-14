#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# DEKAT Booking Platform - Full Production Deployment Script
# Usage: ./deploy-production.sh
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMPOSE_DIR="${SCRIPT_DIR}/../compose"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[$(date '+%H:%M:%S')] WARNING:${NC} $1"; }
err()  { echo -e "${RED}[$(date '+%H:%M:%S')] ERROR:${NC} $1" >&2; }
info() { echo -e "${BLUE}[$(date '+%H:%M:%S')] INFO:${NC} $1"; }

log "═══════════════════════════════════════════════════════════"
log "DEKAT Production Deployment"
log "═══════════════════════════════════════════════════════════"

# --- Step 1: Pre-flight checks ---
info "Step 1: Pre-flight checks..."

# Check Docker
if ! command -v docker &> /dev/null; then
  err "Docker not found. Install Docker first."
  exit 1
fi

if ! docker info &> /dev/null; then
  err "Docker daemon not running."
  exit 1
fi

# Check Docker Compose
if ! docker compose version &> /dev/null; then
  err "Docker Compose not found."
  exit 1
fi

# Check .env file
if [ ! -f "${COMPOSE_DIR}/.env" ]; then
  err ".env file not found at ${COMPOSE_DIR}/.env"
  echo "  Copy .env.prod to .env and fill in real values:"
  echo "  cp ${COMPOSE_DIR}/.env.prod ${COMPOSE_DIR}/.env"
  echo "  nano ${COMPOSE_DIR}/.env"
  exit 1
fi

# Validate critical env vars
source "${COMPOSE_DIR}/.env"
MISSING_VARS=()
[ -z "${POSTGRES_PASSWORD:-}" ] && MISSING_VARS+=("POSTGRES_PASSWORD")
[ -z "${REDIS_PASSWORD:-}" ] && MISSING_VARS+=("REDIS_PASSWORD")
[ -z "${MIDTRANS_SERVER_KEY:-}" ] && MISSING_VARS+=("MIDTRANS_SERVER_KEY")
[ -z "${JWT_ACCESS_SECRET:-}" ] && MISSING_VARS+=("JWT_ACCESS_SECRET")

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  err "Missing required environment variables:"
  for var in "${MISSING_VARS[@]}"; do
    echo "  - ${var}"
  done
  exit 1
fi

log "Pre-flight checks passed"

# --- Step 2: Build backend ---
info "Step 2: Building backend..."
cd "${PROJECT_ROOT}/services/platform_backend"
if [ -f "gradlew" ] || [ -f "gradlew.bat" ]; then
  log "Building backend JAR..."
  ./gradlew.bat :api:bootJar -x test 2>/dev/null || ./gradlew :api:bootJar -x test 2>/dev/null || warn "Build failed, using existing image"
fi

# --- Step 3: Build web apps ---
info "Step 3: Building web apps..."
cd "${PROJECT_ROOT}/apps/web_public"
if [ -f "package.json" ]; then
  log "Building web_public..."
  pnpm install --frozen-lockfile 2>/dev/null && pnpm build 2>/dev/null || warn "web_public build failed"
fi

cd "${PROJECT_ROOT}/apps/web_admin"
if [ -f "package.json" ]; then
  log "Building web_admin..."
  pnpm install --frozen-lockfile 2>/dev/null && pnpm build 2>/dev/null || warn "web_admin build failed"
fi

# --- Step 4: Start infrastructure ---
info "Step 4: Starting infrastructure..."
cd "${COMPOSE_DIR}"

log "Starting PostgreSQL, Redis, Kafka..."
docker compose -f compose.yaml up -d postgres pgbouncer redis kafka object-storage

# Wait for data layer
log "Waiting for data layer to be healthy..."
sleep 10

# --- Step 5: Run migrations ---
info "Step 5: Running database migrations..."
log "Starting API to trigger Flyway migrations..."
docker compose -f compose.yaml up -d api-green

# Wait for API to start and run migrations
log "Waiting for API to start (60s)..."
sleep 60

# Check migration status
if docker exec dekat-api-green wget -q -O - http://localhost:8080/api/v1/actuator/health 2>/dev/null | grep -q '"status":"UP"'; then
  log "API started successfully, migrations should be complete"
else
  warn "API health check failed, checking logs..."
  docker logs dekat-api-green --tail 50 2>&1 | grep -i "flyway\|migration\|error" || true
fi

# --- Step 6: Start all services ---
info "Step 6: Starting all services..."
docker compose -f compose.yaml up -d

# --- Step 7: Wait for health checks ---
info "Step 7: Waiting for health checks..."
MAX_WAIT=180
INTERVAL=10
ELAPSED=0

while [ ${ELAPSED} -lt ${MAX_WAIT} ]; do
  HEALTHY=$(docker ps --filter "health=healthy" --format "{{.Names}}" | wc -l)
  TOTAL=$(docker ps --format "{{.Names}}" | wc -l)
  log "Health checks: ${HEALTHY}/${TOTAL} services healthy (${ELAPSED}s)"
  
  if [ "${HEALTHY}" -ge 8 ]; then
    log "Most services are healthy"
    break
  fi
  sleep ${INTERVAL}
  ELAPSED=$((ELAPSED + INTERVAL))
done

# --- Step 8: Verify deployment ---
info "Step 8: Verifying deployment..."

# Check API
if docker exec dekat-api-green wget -q -O - http://localhost:8080/api/v1/actuator/health 2>/dev/null | grep -q '"status":"UP"'; then
  log "✅ API: Healthy"
else
  warn "❌ API: Unhealthy"
fi

# Check PostgreSQL
if docker exec dekat-postgres pg_isready -U dekat 2>/dev/null; then
  log "✅ PostgreSQL: Ready"
else
  warn "❌ PostgreSQL: Not ready"
fi

# Check Redis
if docker exec dekat-redis redis-cli ping 2>/dev/null | grep -q PONG; then
  log "✅ Redis: Ready"
else
  warn "❌ Redis: Not ready"
fi

# --- Step 9: Setup cron jobs ---
info "Step 9: Setting up cron jobs..."
if [ -f "${SCRIPT_DIR}/../backup/setup-backup-cron.sh" ]; then
  bash "${SCRIPT_DIR}/../backup/setup-backup-cron.sh" 2>/dev/null || warn "Cron setup failed"
fi

log "═══════════════════════════════════════════════════════════"
log "Deployment complete!"
log ""
log "Services:"
log "  - API:      https://${API_DOMAIN:-api.dekat.id}"
log "  - Web:      https://${PUBLIC_DOMAIN:-app.dekat.id}"
log "  - Admin:    https://${ADMIN_DOMAIN:-admin.dekat.id}"
log "  - Grafana:  https://grafana.dekat.id"
log ""
log "Useful commands:"
log "  - Status:   docker compose -f ${COMPOSE_DIR}/compose.yaml ps"
log "  - Logs:     docker compose -f ${COMPOSE_DIR}/compose.yaml logs -f"
log "  - Restart:  docker compose -f ${COMPOSE_DIR}/compose.yaml restart"
log "  - Stop:     docker compose -f ${COMPOSE_DIR}/compose.yaml down"
log "═══════════════════════════════════════════════════════════"
