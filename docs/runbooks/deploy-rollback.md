# Deploy & Rollback Runbook

**Service:** DEKAT Booking Platform
**Last Updated:** 2026-08-22

## Deployment Overview

- **Staging:** Automatic on push to `main` branch
- **Production:** Manual approval required after tag `v*` push
- **Strategy:** Blue-green for API, rolling for other services

## Prerequisites

- SSH access to VPS (`ssh deployer@dekat-prod`)
- Docker Compose files at `/opt/dekat/`
- `.env` file with production secrets
- Access to GHCR (`docker login ghcr.io`)

## Standard Deployment (Production)

### 1. Create Release Tag

```bash
git checkout main
git pull origin main
git tag -a v1.2.0 -m "Release 1.2.0"
git push origin v1.2.0
```

### 2. Monitor CI/CD Pipeline

```bash
# Check GitHub Actions
gh run list --workflow=cd.yml --limit=5
gh run watch <run-id>
```

### 3. Verify Deployment

```bash
# SSH to production
ssh deployer@dekat-prod

# Check running containers
docker compose -f /opt/dekat/compose.production.yaml ps

# Check API health
curl -sf http://localhost:8080/actuator/health | jq .

# Check logs
docker compose -f /opt/dekat/compose.production.yaml logs -f api-blue --tail=50
```

### 4. Smoke Test

```bash
# Test critical endpoints
curl -sf https://dekat.id/api/v1/health
curl -sf https://dekat.id/api/v1/tenants | jq .
curl -sf https://dekat.id/api/v1/catalog/services | jq .
```

## Blue-Green Switch

### Identify Current Slot

```bash
# Check which slot is live
docker inspect --format='{{.Config.Image}}' dekat-api-blue
docker inspect --format='{{.Config.Image}}' dekat-api-green
```

### Manual Slot Switch

```bash
# If blue is live, switch to green
cd /opt/dekat

# Update Caddyfile to point to green
sed -i 's/api-blue:8080/api-green:8080/' caddy/Caddyfile

# Reload Caddy
docker compose -f compose.production.yaml exec caddy caddy reload --config /etc/caddy/Caddyfile

# Verify traffic is hitting green
docker compose -f compose.production.yaml logs -f api-green --tail=20
```

## Rollback Procedure

### Automatic Rollback (Within Deployment Window)

If the new slot fails health checks during deployment, the CI/CD pipeline halts and the old slot remains active. No action needed.

### Manual Rollback

**Step 1: Switch Caddy to Previous Slot**

```bash
cd /opt/dekat

# Determine which slot is currently live
LIVE_SLOT=$(docker inspect --format='{{.Config.Image}}' dekat-api-blue | grep -o 'sha-[a-f0-9]*\|v[0-9]*')
echo "Current live slot version: $LIVE_SLOT"

# Switch to the other slot (which has the old version)
sed -i 's/api-blue:8080/api-green:8080/' caddy/Caddyfile  # or vice versa
docker compose -f compose.production.yaml exec caddy caddy reload --config /etc/caddy/Caddyfile
```

**Step 2: Verify Rollback**

```bash
# Confirm API is responding
curl -sf http://localhost:8080/actuator/health | jq .

# Check logs for errors
docker compose -f compose.production.yaml logs -f api-blue --tail=50
```

**Step 3: Database Rollback (If Needed)**

If the deployment included a database migration, see `database-migration.md` for rollback steps.

### Rollback Checklist

- [ ] Confirm Caddy is routing to the old slot
- [ ] Verify API health endpoint returns UP
- [ ] Check application logs for errors
- [ ] Verify critical user flows (login, booking, payment)
- [ ] Notify team of rollback in #incident Slack channel
- [ ] Create post-incident ticket for root cause analysis

## Post-Deployment Verification

```bash
# Run smoke tests
curl -sf https://dekat.id/api/v1/health

# Check error rates in Grafana
# Navigate to: http://grafana.dekat.id/d/api-overview

# Check Kafka consumer lag
docker compose -f compose.production.yaml exec kafka \
  /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list
```

## Emergency Contacts

| Role | Contact |
|------|---------|
| On-call Engineer | [Phone/Slack] |
| Platform Admin | [Phone/Slack] |
| Database Admin | [Phone/Slack] |
