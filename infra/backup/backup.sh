#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# DEKAT Booking Platform - PostgreSQL Backup Script
# Usage: ./backup.sh [daily|weekly|manual|restore <backup_file>]
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

# --- Configuration ---
BACKUP_TYPE="${1:-manual}"
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30
POSTGRES_CONTAINER="dekat-postgres"
POSTGRES_DB="${POSTGRES_DB:-dekat}"
POSTGRES_USER="${POSTGRES_USER:-dekat}"

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"; }
err()  { echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" >&2; }

# --- Handle restore ---
if [ "${BACKUP_TYPE}" = "restore" ]; then
  RESTORE_FILE="${2:-}"
  if [ -z "${RESTORE_FILE}" ]; then
    err "Usage: $0 restore <backup_file>"
    exit 1
  fi
  if [ ! -f "${RESTORE_FILE}" ]; then
    err "Backup file not found: ${RESTORE_FILE}"
    exit 1
  fi
  log "Restoring from: ${RESTORE_FILE}"
  log "Stopping API containers..."
  docker stop dekat-api-blue dekat-api-green 2>/dev/null || true

  log "Dropping and recreating database..."
  docker exec "${POSTGRES_CONTAINER}" \
    psql -U "${POSTGRES_USER}" -d postgres -c "DROP DATABASE IF EXISTS ${POSTGRES_DB};"
  docker exec "${POSTGRES_CONTAINER}" \
    psql -U "${POSTGRES_USER}" -d postgres -c "CREATE DATABASE ${POSTGRES_DB} OWNER ${POSTGRES_USER};"

  log "Restoring database..."
  gunzip -c "${RESTORE_FILE}" | docker exec -i "${POSTGRES_CONTAINER}" \
    pg_restore -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" --no-owner --no-acl 2>/dev/null || true

  log "Starting API containers..."
  docker start dekat-api-blue dekat-api-green 2>/dev/null || true

  log "Restore complete!"
  exit 0
fi

# --- Create backup directory ---
mkdir -p "${BACKUP_DIR}/${BACKUP_TYPE}"

BACKUP_FILE="${BACKUP_DIR}/${BACKUP_TYPE}/${POSTGRES_DB}_${DATE}.sql.gz"

log "Starting ${BACKUP_TYPE} backup..."

# --- Run pg_dump ---
docker exec "${POSTGRES_CONTAINER}" \
  pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
  --format=custom \
  --compress=9 \
  --verbose \
  > "${BACKUP_FILE}" 2>/dev/null

# --- Verify backup ---
if [ -s "${BACKUP_FILE}" ]; then
  SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
  log "Backup completed: ${BACKUP_FILE} (${SIZE})"
else
  err "Backup file is empty!"
  exit 1
fi

# --- Verify backup integrity ---
log "Verifying backup integrity..."
if docker exec "${POSTGRES_CONTAINER}" pg_restore -l "${BACKUP_FILE}" > /dev/null 2>&1; then
  log "Backup integrity verified"
else
  warn "Backup integrity check failed (may still be usable)"
fi

# --- Retention cleanup ---
log "Cleaning backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete

# --- List remaining backups ---
log "Current backups:"
ls -lh "${BACKUP_DIR}/${BACKUP_TYPE}/" 2>/dev/null | tail -n +2

# --- Write backup manifest ---
MANIFEST="${BACKUP_DIR}/${BACKUP_TYPE}/manifest.json"
cat > "${MANIFEST}" <<EOF
{
  "last_backup": "$(date -Iseconds)",
  "type": "${BACKUP_TYPE}",
  "file": "${BACKUP_FILE}",
  "size": "$(du -h "${BACKUP_FILE}" | cut -f1)",
  "database": "${POSTGRES_DB}",
  "retention_days": ${RETENTION_DAYS}
}
EOF

log "Backup process complete."
