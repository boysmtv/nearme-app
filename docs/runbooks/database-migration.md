# Database Migration Runbook

**Service:** DEKAT Booking Platform (PostgreSQL)
**Last Updated:** 2026-08-22

## Overview

- **Tool:** Flyway (managed by Spring Boot)
- **Database:** PostgreSQL 18.6
- **Location:** `services/platform_backend/src/main/resources/db/migration/`
- **Naming:** `V{version}__{description}.sql` (e.g., `V001__create_booking_table.sql`)

## Migration Workflow

### 1. Development

```bash
# Create migration file
touch services/platform_backend/src/main/resources/db/migration/V002__add_payment_method.sql

# Write migration SQL
cat > services/platform_backend/src/main/resources/db/migration/V002__add_payment_method.sql << 'EOF'
ALTER TABLE dekat_booking_payment
  ADD COLUMN payment_method VARCHAR(50);

UPDATE dekat_booking_payment
  SET payment_method = 'bank_transfer'
  WHERE payment_method IS NULL;

ALTER TABLE dekat_booking_payment
  ALTER COLUMN payment_method SET NOT NULL;
EOF
```

### 2. Local Testing

```bash
cd services/platform_backend

# Start local database
docker compose -f ../../infra/compose/compose.development.yaml up -d postgres

# Run migrations
./gradlew flywayMigrate \
  -Pflyway.url=jdbc:postgresql://localhost:5432/dekat \
  -Pflyway.user=dekat \
  -Pflyway.password=dev_password

# Verify migration
./gradlew flywayInfo \
  -Pflyway.url=jdbc:postgresql://localhost:5432/dekat \
  -Pflyway.user=dekat \
  -Pflyway.password=dev_password
```

### 3. CI Validation

The CI pipeline runs `flywayValidate` to ensure:
- No duplicate migration versions
- Checksums of applied migrations have not changed
- All migrations are syntactically valid

### 4. Production Deployment

Migrations run automatically on application startup:

```bash
# Flyway runs on API startup (both blue and green slots)
# The active slot applies pending migrations on boot
docker compose -f compose.production.yaml up -d api-blue

# Monitor migration execution
docker compose -f compose.production.yaml logs api-blue | grep -i flyway
```

## Rollback Procedure

Flyway does not support automatic rollback. Manual steps required:

### Step 1: Identify the Migration to Rollback

```bash
# Connect to production database
docker compose -f compose.production.yaml exec postgres psql -U dekat -d dekat

# List applied migrations
SELECT installed_rank, version, description, success
FROM flyway_schema_history
ORDER BY installed_rank DESC
LIMIT 10;
```

### Step 2: Create Rollback Migration

Always create a new migration that undoes the change. Never modify or delete applied migrations.

```bash
# Create rollback migration
cat > services/platform_backend/src/main/resources/db/migration/V003__rollback_payment_method.sql << 'EOF'
-- Rollback: Remove payment_method column added in V002
ALTER TABLE dekat_booking_payment DROP COLUMN IF EXISTS payment_method;
EOF
```

### Step 3: Apply Rollback

```bash
# Deploy the rollback migration
git checkout -b rollback/v002-payment-method
git add services/platform_backend/src/main/resources/db/migration/V003__rollback_payment_method.sql
git commit -m "rollback: V002 payment_method column"
git push origin rollback/v002-payment-method

# Create PR and merge to main
# CI/CD will deploy and apply the rollback migration
```

### Step 4: Verify Rollback

```bash
# Connect to database
docker compose -f compose.production.yaml exec postgres psql -U dekat -d dekat

# Verify column is removed
\d dekat_booking_payment

# Verify flyway_schema_history
SELECT * FROM flyway_schema_history WHERE version = '002';
```

## Emergency: Manual Database Fix

If a migration causes a critical failure:

```bash
# 1. Stop the application to prevent further damage
docker compose -f compose.production.yaml stop api-blue api-green

# 2. Connect to database
docker compose -f compose.production.yaml exec postgres psql -U dekat -d dekat

# 3. Manually fix the issue
-- Example: revert a bad migration
BEGIN;
-- Apply manual fixes
COMMIT;

-- Mark migration as failed (if needed)
DELETE FROM flyway_schema_history WHERE version = '002';

# 4. Create a proper rollback migration
# 5. Restart application
docker compose -f compose.production.yaml start api-blue
```

## Best Practices

1. **Never modify applied migrations** - always create new ones
2. **Keep migrations small** - one logical change per migration file
3. **Test rollback before deploying** - every migration must have a rollback
4. **Back up before major migrations** - see `backup-restore.md`
5. **Use transactions** - wrap DDL in `BEGIN`/`COMMIT` where PostgreSQL supports it
6. **Avoid destructive operations** - prefer `ALTER TABLE ADD COLUMN` over `DROP COLUMN`
7. **Add columns as nullable** - backfill data before adding `NOT NULL` constraints

## Monitoring

```bash
# Check migration status
curl -sf http://localhost:8080/actuator/flyway | jq .

# Monitor via Prometheus
# Metric: flyway_migration_pending
# Metric: flyway_migration_success
```
