# ADR 006: Docker Compose Single VPS Deployment

**Status:** Accepted
**Date:** 2026-08-22
**Deciders:** DEKAT Engineering Team

## Context

DEKAT must be deployed cost-effectively while supporting the full stack: backend API, async worker, 3 web apps, PostgreSQL, Redis, Kafka, object storage, and observability. The initial user base does not justify Kubernetes or multi-server infrastructure.

Target: single VPS running all services with 99.5% monthly availability.

## Decision

We deploy the entire stack on a **single VPS using Docker Compose** with separate compose files for each environment.

### Infrastructure Layout

```
VPS (8 vCPU, 32GB RAM, 500GB NVMe SSD)
  |-- Caddy (reverse proxy, TLS termination)
  |-- API Blue / Green (Spring Boot, blue-green deployment)
  |-- Worker (Spring Boot async processor)
  |-- Web Public (React, Vite)
  |-- Web Provider (React, Vite)
  |-- Web Admin (React, Vite)
  |-- PostgreSQL 18 + PgBouncer
  |-- Redis 8.2
  |-- Kafka (KRaft mode, single node)
  |-- MinIO (object storage)
  |-- Alloy (OTLP collector)
  |-- Prometheus + Loki + Tempo + Grafana
```

### Compose Files

| File | Environment | Purpose |
|------|-------------|---------|
| `compose.yaml` | Base | All service definitions |
| `compose.staging.yaml` | Staging | Overrides for staging |
| `compose.production.yaml` | Production | Overrides for production |

### Blue-Green Deployment

The API service runs two instances (blue and green). Only one receives traffic at a time via Caddy routing:

1. Deploy new version to the inactive slot
2. Health check the new slot
3. Switch Caddy upstream to the new slot
4. Old slot becomes the rollback target

### VPS Specifications

| Resource | Spec |
|----------|------|
| CPU | 8 vCPU (AMD EPYC or equivalent) |
| RAM | 32 GB |
| Storage | 500 GB NVMe SSD |
| OS | Ubuntu 24.04 LTS |
| Network | 1 Gbps |
| Backup | Daily pg_basebackup + WAL archival to off-site |

### TLS and DNS

- Caddy handles automatic TLS via Let's Encrypt (ACME)
- DNS managed via Cloudflare (proxy mode for DDoS protection)
- HSTS, CSP, and security headers configured in Caddy

## Consequences

**Positive:**
- Low operational cost (~$50-80/month for VPS)
- Simple deployment via SSH + docker compose
- Blue-green deployment for zero-downtime API updates
- Full observability stack included

**Negative:**
- No horizontal scaling (single machine)
- Single point of failure (hardware failure)
- All services share resources (noisy neighbor risk)
- Manual scaling requires VPS upgrade

**Mitigations:**
- Automated daily backups with off-site storage
- Resource limits set on each container
- Monitoring with alerts for resource exhaustion
- documented VPS upgrade path to larger instance or multi-server
- Future migration path to Docker Swarm or Kubernetes

## Alternatives Considered

1. **Kubernetes (k3s):** Rejected as premature complexity for current scale. Documented as future scaling path.
2. **Serverless (AWS Lambda):** Rejected due to vendor lock-in, cold starts, and operational cost at scale.
3. **Multi-VPS with Docker Swarm:** Considered but adds operational complexity without clear benefit at current scale.
4. **Platform-as-a-Service (Railway, Render):** Rejected due to cost and limited control over infrastructure.
