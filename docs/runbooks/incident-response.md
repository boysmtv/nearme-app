# Incident Response Runbook

**Service:** DEKAT Booking Platform
**Last Updated:** 2026-08-22

## Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| SEV-1 | Platform down | 15 min | API unreachable, database down |
| SEV-2 | Major feature broken | 30 min | Payment failure, auth broken |
| SEV-3 | Feature degraded | 2 hours | Slow queries, notification delays |
| SEV-4 | Cosmetic / low impact | Next business day | UI glitches, non-critical errors |

## Incident Response Flow

```
1. DETECT -> Monitoring alert or user report
2. TRIAGE -> Assess severity, assign responder
3. MITIGATE -> Stop the bleeding (rollback, restart)
4. DIAGNOSE -> Root cause analysis
5. RESOLVE -> Fix permanently
6. REVIEW -> Post-incident review within 48 hours
```

## Step 1: Detection

### Common Alerts

| Alert | Source | Severity |
|-------|--------|----------|
| API health check failed | Prometheus | SEV-1 |
| Error rate > 5% | Prometheus | SEV-2 |
| Kafka consumer lag > 1000 | Prometheus | SEV-3 |
| Disk usage > 85% | Node Exporter | SEV-3 |
| SSL cert expires in 7 days | Caddy | SEV-4 |

### User Reports

Collect: what happened, when, which feature, error messages, screenshots.

## Step 2: Triage Commands

```bash
# SSH to production
ssh deployer@dekat-prod

# Check container status
docker compose -f /opt/dekat/compose.production.yaml ps

# Check API logs
docker compose -f /opt/dekat/compose.production.yaml logs -f api-blue --tail=100

# Check resource usage
docker stats --no-stream

# Check disk
df -h

# Check database
docker compose -f /opt/dekat/compose.production.yaml exec postgres psql -U dekat -c "SELECT 1;"

# Check Redis
docker compose -f /opt/dekat/compose.production.yaml exec redis redis-cli ping

# Check Kafka
docker compose -f /opt/dekat/compose.production.yaml exec kafka \
  /opt/kafka/bin/kafka-broker-api-versions.sh --bootstrap-server localhost:9092 > /dev/null 2>&1
```

## Step 3: Common Mitigations

### API Down

```bash
# Restart API
docker compose -f /opt/dekat/compose.production.yaml restart api-blue

# If restart fails, check logs
docker compose -f /opt/dekat/compose.production.yaml logs api-blue --tail=200

# If OOM, increase memory
# Edit compose.production.yaml JAVA_OPTS: -Xmx2048m
docker compose -f /opt/dekat/compose.production.yaml up -d api-blue
```

### Database Connection Exhausted

```bash
# Check connection count
docker compose -f /opt/dekat/compose.production.yaml exec postgres \
  psql -U dekat -c "SELECT count(*) FROM pg_stat_activity;"

# Kill idle connections
docker compose -f /opt/dekat/compose.production.yaml exec postgres \
  psql -U dekat -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND query_start < now() - interval '10 minutes';"

# Restart PgBouncer
docker compose -f /opt/dekat/compose.production.yaml restart pgbouncer
```

### High Memory Usage

```bash
# Identify container using most memory
docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}"

# Restart the offending container
docker compose -f /opt/dekat/compose.production.yaml restart <service>

# If persistent, scale down non-critical services
docker compose -f /opt/dekat/compose.production.yaml stop grafana prometheus
```

### Disk Full

```bash
# Find large files
du -sh /var/lib/docker/volumes/* | sort -rh | head -10

# Prune Docker resources
docker system prune -f --volumes

# Truncate logs
truncate -s 0 /var/lib/docker/containers/*/\*-json.log

# Clean old backups
find /opt/dekat/backups -name "*.tar.gz" -mtime +7 -delete
```

### Payment Gateway Down

```bash
# Check payment service logs
docker compose -f /opt/dekat/compose.production.yaml logs -f api-blue | grep -i payment

# If gateway is unreachable, enable circuit breaker
# The Resilience4j circuit breaker should activate automatically
# Monitor: curl http://localhost:8080/actuator/metrics/resilience4j.circuitbreaker.state
```

### Kafka Issues

```bash
# Check consumer groups
docker compose -f /opt/dekat/compose.production.yaml exec kafka \
  /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list

# Check lag
docker compose -f /opt/dekat/compose.production.yaml exec kafka \
  /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --describe --group platform-backend

# Restart Kafka
docker compose -f /opt/dekat/compose.production.yaml restart kafka
```

## Step 4: Communication Template

### Internal (Slack/Team)

```
[SEV-X] Incident: <brief description>
Status: Investigating / Mitigating / Resolved
Impact: <what features are affected>
Responders: <names>
Next update: <time>
```

### External (Status Page / Users)

```
We are experiencing issues with <feature>.
Our team is actively working on a fix.
We will provide an update in <timeframe>.
```

## Step 5: Post-Incident Review

Within 48 hours, create a post-incident document:

1. **Timeline:** What happened and when
2. **Impact:** Users affected, duration, revenue impact
3. **Root Cause:** Technical root cause
4. **What went well:** Response actions that helped
5. **What went wrong:** Delays, gaps in monitoring, process issues
6. **Action items:** Preventive measures with owners and deadlines

## Escalation Path

| Level | Who | When |
|-------|-----|------|
| L1 | On-call engineer | First responder |
| L2 | Tech lead | SEV-1 or unresolved after 30 min |
| L3 | CTO / Platform admin | SEV-1 unresolved after 1 hour |
| External | VPS provider support | Hardware/network issues |

## Monitoring Quick Reference

| Dashboard | URL | Purpose |
|-----------|-----|---------|
| Grafana | http://localhost:3001 | Metrics, logs, traces |
| Prometheus | http://localhost:9090 | Raw metrics query |
| Loki | via Grafana | Log search |
| Tempo | via Grafana | Distributed tracing |
