# DEKAT Booking Platform - Agent Configuration

## Project Overview

**DEKAT** adalah platform booking layanan lokal (barbershop, salon, kecantikan) dengan:
- Provider-first hybrid model (SaaS + marketplace)
- Mobile apps (Flutter), Web apps (React), Backend (Java Spring Boot)
- Single VPS deployment dengan Docker Compose

## Repository Structure

```
dekat-platform/
├── apps/
│   ├── mobile_customer/     # Flutter customer app (id.dekat.customer)
│   ├── mobile_partner/      # Flutter partner app (id.dekat.partner)
│   ├── web_public/          # React public booking (port 3000)
│   ├── web_provider/        # React provider portal (port 3001)
│   └── web_admin/           # React platform admin (port 3002)
├── packages/
│   ├── flutter_core/        # Shared Flutter core
│   ├── flutter_design_system/
│   ├── flutter_api_client/
│   ├── web_ui/
│   ├── web_api_client/
│   └── web_config/
├── services/
│   └── platform_backend/    # Java Spring Boot (20 modules)
├── contracts/               # OpenAPI + Event schemas
├── infra/                   # Docker Compose + configs
├── docs/                    # ADR + Runbooks
└── .github/workflows/       # CI/CD
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 25, Spring Boot 4.1.1, Spring Modulith |
| Database | PostgreSQL 18.6 + PostGIS |
| Cache | Redis 8.2 |
| Messaging | Apache Kafka 4.3.1 (KRaft) |
| Mobile | Flutter 3.44.7, Dart, Riverpod |
| Web | React 19.2, TypeScript, Vite 8.1, Tailwind CSS 4.3 |
| Infra | Docker Compose, Caddy 2.11+ |
| Observability | OpenTelemetry, Prometheus, Loki, Tempo, Grafana |

## Backend Modules (20)

| Module | Package | Responsibility |
|--------|---------|----------------|
| sharedkernel | id.dekat.sharedkernel | Base entities, outbox, security config |
| identity | id.dekat.identity | Auth, JWT, OTP, MFA, Sessions |
| access | id.dekat.access | RBAC, Roles, Permissions |
| tenant | id.dekat.tenant | Business, Locations, Verification |
| staff | id.dekat.staff | Staff, Schedules, Time-off |
| catalog | id.dekat.catalog | Services, Variants, Add-ons, Pricing |
| scheduling | id.dekat.scheduling | Availability rules, Slot validation |
| booking | id.dekat.booking | Hold, State machine, Anti-overlap |
| payment | id.dekat.payment | Intent, Webhook, Refund, Ledger |
| subscription | id.dekat.subscription | Plans, Entitlements, Usage |
| customer | id.dekat.customer | Customer profiles, Consent |
| marketplace | id.dekat.marketplace | Search projection, Attribution |
| review | id.dekat.review | Reviews, Responses, Moderation |
| promotion | id.dekat.promotion | Coupons, Campaigns, Loyalty |
| notification | id.dekat.notification | Templates, Push, Email, Worker |
| support | id.dekat.support | Cases, Evidence, SLA |
| reporting | id.dekat.reporting | Aggregates, Export |
| media | id.dekat.media | Object storage, Signed URLs |
| audit | id.dekat.audit | Audit logs |
| platformconfig | id.dekat.platformconfig | Feature flags, Config |

## Module Layer Structure

```
module/
  api/             # public module contracts
  application/     # use cases, transaction orchestration
  domain/          # aggregate, entity, value object
  infrastructure/  # persistence, Kafka, Redis, external adapters
  web/             # REST controller and DTOs
```

## Key Patterns

1. **Transactional Outbox** - Events published via outbox_events table → Kafka
2. **Anti-Double-Booking** - PostgreSQL exclusion constraints with tstzrange
3. **Multi-Tenancy** - Shared schema, tenant_id column, RLS
4. **Optimistic Locking** - @Version on aggregates
5. **Blue-Green Deployment** - Caddy routes between api-blue/api-green

## API Conventions

- Base path: `/api/v1`
- Auth: JWT Bearer (15min access + rotating refresh)
- IDs: UUID v4
- Money: Integer minor units (sen for IDR)
- Time: RFC 3339 with timezone
- Errors: RFC 9457 ProblemDetail
- Idempotency: `Idempotency-Key` header

## Database

- 80+ tables across 14 migrations (V1-V14)
- Seed data in V14 (roles, permissions, plans, categories, admin user)
- Flyway for migrations

## Common Commands

```bash
# Backend
cd services/platform_backend
./gradlew build
./gradlew test
./gradlew flywayMigrate

# Flutter
cd apps/mobile_customer
flutter pub get
flutter run
flutter test

# React
cd apps/web_public
pnpm install
pnpm dev
pnpm build

# Docker
docker compose -f infra/compose/compose.yaml up -d
docker compose -f infra/compose/compose.yaml logs -f api-blue
```

## Environment Variables

Key env vars (see infra/compose/.env.example for full list):
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `KAFKA_BOOTSTRAP_SERVERS` - Kafka brokers
- `JWT_PRIVATE_KEY_FILE` - JWT signing key
- `PAYMENT_PROVIDER` - midtrans|xendit
- `FCM_CREDENTIALS_FILE` - Firebase config

## Testing

- Backend: JUnit 5 + Testcontainers
- Flutter: flutter_test + integration_test
- Web: Vitest + Playwright

## Deployment

- Single VPS (8 vCPU, 32GB RAM recommended)
- Docker Compose with production override
- Blue-green via Caddy
- pgBackRest for PostgreSQL backup
- Offsite S3-compatible storage
