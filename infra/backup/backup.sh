#!/usr/bin/env bash
# DEKAT Booking Platform - PostgreSQL Backup Script
# Usage: ./backup.sh [daily|weekly|manual]

set -euo pipefail

# --- Configuration ---
BACKUP_TYPE="${1:-manual}"
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30
POSTGRES_CONTAINER="dekat-postgres"
POSTGRES_DB="${POSTGRES_DB:-dekat}"
POSTGRES_USER="${POSTGRES_USER:-dekat}"

# --- Create backup directory ---
mkdir -p "${BACKUP_DIR}/${BACKUP_TYPE}"

BACKUP_FILE="${BACKUP_DIR}/${BACKUP_TYPE}/${POSTGRES_DB}_${DATE}.sql.gz"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting ${BACKUP_TYPE} backup..."

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
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup completed: ${BACKUP_FILE} (${SIZE})"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Backup file is empty!" >&2
  exit 1
fi

# --- Retention cleanup ---
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Cleaning backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete

# --- List remaining backups ---
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Current backups:"
ls -lh "${BACKUP_DIR}/${BACKUP_TYPE}/" | tail -n +2

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup process complete."
