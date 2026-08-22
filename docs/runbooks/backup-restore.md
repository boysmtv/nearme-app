# Backup & Restore Runbook

**Service:** DEKAT Booking Platform (PostgreSQL)
**Last Updated:** 2026-08-22

## Backup Strategy

| Component | Method | Frequency | Retention | Destination |
|-----------|--------|-----------|-----------|-------------|
| PostgreSQL full backup | pg_basebackup | Daily 02:00 WIB | 7 days | Off-site S3/MinIO |
| PostgreSQL WAL archiving | archive_command | Continuous | 7 days | Off-site S3/MinIO |
| Redis data | RDB snapshot | Every 6 hours | 3 days | Local + off-site |
| MinIO data | mc mirror | Daily 03:00 WIB | 7 days | Off-site |
| Application config | Git | On change | Permanent | GitHub |
| Kafka data | Not backed up | N/A | N/A | Rebuilt from events |

## Backup Scripts

### PostgreSQL Backup

```bash
#!/bin/bash
# /opt/dekat/scripts/backup-postgres.sh
set -euo pipefail

BACKUP_DIR="/opt/dekat/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Full backup
docker compose -f /opt/dekat/compose.production.yaml exec -T postgres \
  pg_basebackup -U dekat -D /tmp/backup -Ft -z -P

# Copy to host
docker cp dekat-postgres:/tmp/backup "${BACKUP_DIR}/full_${DATE}"
rm -rf /tmp/backup

# Compress
tar -czf "${BACKUP_DIR}/full_${DATE}.tar.gz" -C "${BACKUP_DIR}" "full_${DATE}"
rm -rf "${BACKUP_DIR}/full_${DATE}"

# Upload to off-site (MinIO)
mc mirror "${BACKUP_DIR}/full_${DATE}.tar.gz" "off-site/dekat/postgres/"

# Cleanup old backups
find "${BACKUP_DIR}" -name "*.tar.gz" -mtime +${RETENTION_DAYS} -delete

echo "Backup completed: full_${DATE}.tar.gz"
```

### WAL Archiving Configuration

```ini
# /opt/dekat/postgres/postgresql.conf additions
wal_level = replica
archive_mode = on
archive_command = 'test ! -f /archive/%f && cp %p /archive/%f'
archive_timeout = 300
```

### Redis Backup

```bash
#!/bin/bash
# /opt/dekat/scripts/backup-redis.sh
set -euo pipefail

BACKUP_DIR="/opt/dekat/backups/redis"
DATE=$(date +%Y%m%d_%H%M%S)

# Trigger RDB save
docker compose -f /opt/dekat/compose.production.yaml exec -T redis redis-cli BGSAVE

# Wait for save to complete
sleep 10

# Copy RDB file
docker cp dekat-redis:/data/dump.rdb "${BACKUP_DIR}/dump_${DATE}.rdb"

# Upload to off-site
mc mirror "${BACKUP_DIR}/dump_${DATE}.rdb" "off-site/dekat/redis/"

# Cleanup (keep 3 days)
find "${BACKUP_DIR}" -name "*.rdb" -mtime +3 -delete

echo "Redis backup completed: dump_${DATE}.rdb"
```

### Automated Backup Cron

```bash
# /etc/cron.d/dekat-backups
0 2 * * * deployer /opt/dekat/scripts/backup-postgres.sh >> /var/log/dekat-backup.log 2>&1
0 */6 * * * deployer /opt/dekat/scripts/backup-redis.sh >> /var/log/dekat-backup.log 2>&1
0 3 * * * deployer /opt/dekat/scripts/backup-minio.sh >> /var/log/dekat-backup.log 2>&1
```

## Restore Procedure

### PostgreSQL Restore from Full Backup

**Step 1: Stop the Application**

```bash
cd /opt/dekat
docker compose -f compose.production.yaml stop api-blue api-green worker
```

**Step 2: Restore Database**

```bash
# Drop and recreate database
docker compose -f compose.production.yaml exec postgres \
  psql -U dekat -c "DROP DATABASE IF EXISTS dekat;"
docker compose -f compose.production.yaml exec postgres \
  psql -U dekat -c "CREATE DATABASE dekat OWNER dekat;"

# Restore from backup
docker cp backups/postgres/full_20260822_020000.tar.gz dekat-postgres:/tmp/
docker compose -f compose.production.yaml exec postgres \
  pg_restore -U dekat -d dekat /tmp/full_20260822_020000.tar.gz --clean --if-exists
```

**Step 3: Apply WAL (Point-in-Time Recovery)**

```bash
# For point-in-time recovery, configure recovery
docker compose -f compose.production.yaml exec postgres \
  psql -U dekat -c "SELECT pg_start_recovery('2026-08-22 10:30:00+07');"

# Or restore to latest
docker compose -f compose.production.yaml exec postgres \
  psql -U dekat -c "SELECT pg_start_recovery();"
```

**Step 4: Verify and Restart**

```bash
# Verify data
docker compose -f compose.production.yaml exec postgres \
  psql -U dekat -d dekat -c "SELECT COUNT(*) FROM dekat_booking;"

# Restart application
docker compose -f compose.production.yaml up -d api-blue worker
```

### Redis Restore

```bash
# Stop Redis
docker compose -f compose.production.yaml stop redis

# Copy backup file
docker cp backups/redis/dump_20260822_020000.rdb dekat-redis:/data/dump.rdb

# Set correct ownership
docker compose -f compose.production.yaml exec redis chown redis:redis /data/dump.rdb

# Start Redis
docker compose -f compose.production.yaml start redis
```

## Verification Checklist

After any restore:

- [ ] Application starts without errors
- [ ] Login works for customer and provider accounts
- [ ] Booking list loads correctly
- [ ] Payment history is intact
- [ ] File uploads (MinIO) are accessible
- [ ] Kafka consumers catch up to latest offsets
- [ ] Monitoring dashboards show healthy metrics

## Off-Site Backup Setup (MinIO)

```bash
# Configure mc client
mc alias set off-site https://s3.amazonaws.com ACCESS_KEY SECRET_KEY

# Verify backup exists
mc ls off-site/dekat/postgres/

# Download for testing
mc cp off-site/dekat/postgres/full_20260822_020000.tar.gz /tmp/
```

## Backup Monitoring

```bash
# Check last backup time
ls -lt /opt/dekat/backups/postgres/ | head -5

# Check backup log
tail -50 /var/log/dekat-backup.log

# Alert if backup is older than 24 hours
find /opt/dekat/backups/postgres -name "*.tar.gz" -mtime +1 | wc -l
```
