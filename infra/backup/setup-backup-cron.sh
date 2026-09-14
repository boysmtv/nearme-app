#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# DEKAT Booking Platform - Backup Cron Setup
# Usage: ./setup-backup-cron.sh
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKUP_SCRIPT="${SCRIPT_DIR}/backup.sh"

# --- Colors ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"; }

log "Setting up DEKAT backup cron jobs..."

# --- Create cron entries ---
CRON_ENTRIES="
# DEKAT Booking Platform - Automated Backups
# Daily backup at 2:00 AM
0 2 * * * ${BACKUP_SCRIPT} daily >> /var/log/dekat-backup.log 2>&1
# Weekly backup (full) on Sunday at 3:00 AM
0 3 * * 0 ${BACKUP_SCRIPT} weekly >> /var/log/dekat-backup.log 2>&1
# Cleanup old backups daily at 4:00 AM
0 4 * * * find /backups/postgres -name '*.sql.gz' -type f -mtime +30 -delete >> /var/log/dekat-backup.log 2>&1
"

# --- Check if entries already exist ---
if crontab -l 2>/dev/null | grep -q "DEKAT Booking Platform"; then
  warn "DEKAT backup cron jobs already exist. Updating..."
  crontab -l 2>/dev/null | grep -v "DEKAT Booking Platform" | grep -v "backup.sh" | grep -v "dekat-backup" | { cat; echo "${CRON_ENTRIES}"; } | crontab -
else
  (crontab -l 2>/dev/null; echo "${CRON_ENTRIES}") | crontab -
fi

log "Cron jobs installed:"
crontab -l | grep -A1 "DEKAT"

log ""
log "Backup schedule:"
log "  - Daily backup:   02:00 AM"
log "  - Weekly backup:  Sunday 03:00 AM"
log "  - Cleanup:        04:00 AM (30 day retention)"
log ""
log "Manual backup:  ${BACKUP_SCRIPT} manual"
log "Restore:        ${BACKUP_SCRIPT} restore /path/to/backup.sql.gz"
