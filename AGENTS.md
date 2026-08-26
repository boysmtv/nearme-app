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
│   ├── web_public/          # React public booking (port 4100)
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
├── infra/
│   └── compose/
│       ├── compose.yaml         # Production compose (ghcr.io images)
│       ├── compose.local.yaml   # Local dev compose (dekat- prefix)
│       └── .env                 # Secrets (POSTGRES_PASSWORD=dekat123)
├── docs/                    # ADR + Runbooks
└── .github/workflows/       # CI/CD
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 21, Spring Boot 3.3.4, Spring Modulith 1.3.2 |
| Database | PostgreSQL 17 (postgis/postgis:17-3.4) + PostGIS |
| Cache | Redis 8.2-alpine |
| Messaging | Apache Kafka 4.3.1 (KRaft, no Zookeeper) |
| Mobile | Flutter 3.x, Dart, Riverpod |
| Web | React 19, TypeScript, Vite, Tailwind CSS |
| Infra | Docker Compose (single VPS) |

## Backend Modules (20)

| Module | Package | Responsibility |
|--------|---------|----------------|
| sharedkernel | id.dekat.sharedkernel | Base entities, outbox, security config, ApiResponse wrapper |
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
- Response wrapper: `{ success: boolean, data: T, message?: string }`
- Idempotency: `Idempotency-Key` header

## API Endpoints (Current State)

### Auth (public - no token required)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login (returns accessToken + refreshToken)
- `POST /auth/otp/request` - Request OTP
- `POST /auth/otp/verify` - Verify OTP
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout

### Public (no token required)
- `GET /public/categories` - List categories
- `GET /public/providers` - Search providers
- `GET /public/providers/featured` - Featured providers
- `GET /public/providers/{slug}` - Provider detail
- `GET /public/providers/{id}/services` - Provider services
- `GET /public/providers/{id}/staff` - Provider staff
- `GET /public/providers/{id}/availability` - Available slots
- `GET /public/providers/{id}/reviews` - Provider reviews
- `POST /public/bookings` - Create booking

### Provider Dashboard (JWT required)
- `GET /provider/dashboard/stats` - Dashboard stats
- `GET /provider/dashboard/recent-bookings` - Recent bookings
- `GET /provider/bookings` - List bookings
- `GET /provider/services` - List services
- `GET /provider/staff` - List staff

### Admin (JWT required)
- `GET /admin/dashboard/stats` - Platform stats
- `GET /admin/users` - List users
- `PUT /admin/users/{id}/status` - Update user status
- `GET /admin/tenants` - List tenants
- `PUT /admin/tenants/{id}/approve` - Approve tenant
- `GET /admin/config/flags` - Feature flags

### Core (JWT required)
- `POST /bookings/holds` - Create booking hold
- `POST /bookings` - Confirm booking
- `POST /bookings/{id}/cancel` - Cancel booking
- `GET /roles` - List roles
- `GET /availability` - Get available slots

## Database

- 80+ tables, migrations V0-V19 (Flyway)
- V14 includes seed data (roles, permissions, plans, users, tenant, services, bookings)
- V14 adds `password_hash` column to users table
- V18 adds `device_info` and `token_family` columns to sessions table
- V19 fixes `ip_address` type from `inet` to `text` in sessions table (entity uses String)
- Seed password: `admin123` (BCrypt hashed)
- Credentials stored in both `users.password_hash` and `credentials` table

## Common Commands

```bash
# Backend (from services/platform_backend/)
.\gradlew.bat build -x test          # Build all 20 modules
.\gradlew.bat clean build -x test    # Clean + build

# Docker Local Dev (from project root/)
docker compose -f infra/compose/compose.local.yaml up -d --build
docker compose -f infra/compose/compose.local.yaml down -v
docker logs dekat-api

# Test login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dekat.id","password":"admin123"}'

# Flutter (from apps/mobile_customer/)
flutter pub get && flutter run

# React Web (from apps/web_public/)
pnpm install && pnpm dev
```

## Default Credentials

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | admin@dekat.id | admin123 | ROLE_PLATFORM_ADMIN |
| Provider Owner | budi@barbershopcentral.id | admin123 | ROLE_PROVIDER_OWNER |
| Staff 1 | andi@barbershopcentral.id | admin123 | ROLE_PROVIDER_STAFF |
| Staff 2 | rudi@barbershopcentral.id | admin123 | ROLE_PROVIDER_STAFF |
| Customer | siti@gmail.com | admin123 | ROLE_CUSTOMER |

## Known Issues & Gotchas

### Build System
- Backend source dirs: `src/main/java_root/` (module controllers) and `src/main/java/` (sharedkernel)
- **CRITICAL**: `api/build.gradle` registers `../src/main/java_root` + `../src/main/resources` as sourceSets — WITHOUT this the Docker jar is an empty shell (only DeKatApplication, no controllers, everything 401)
- Kotlin incremental cache corruption on Windows: `org.gradle.daemon=false`, `org.gradle.parallel=false`
- `freezed` code generation failed (Dart SDK 3.13.0 vs analyzer 3.9.0) — models are plain Dart classes

### Flutter
- Firebase not configured — all Firebase init wrapped in try-catch
- `Provider` model renamed to `ProviderModel` to avoid conflict with Riverpod's `Provider`
- `DEKATColorScheme.light`/`.dark` → `.lightColorScheme`/`.darkColorScheme`
- `CardTheme` → `CardThemeData` (Flutter 3.x API change)

### Docker
- PostgreSQL: `postgis/postgis:17-3.4` (NOT `postgres:18-alpine` which needs `/var/lib/postgresql`)
- Redis password: `dekat123` (in `infra/redis/redis.conf`)
- Kafka: `apache/kafka:4.3.1` KRaft mode (no Zookeeper)
- Flyway 10.x: `filesystem:` prefix (not `file:`) for locations
- UUID hex: all UUIDs must be valid hex (0-9, a-f only)

### Auth
- JWT secrets: `jwt.access-secret` and `jwt.refresh-secret` in `application-dev.yml`
- SecurityConfig: `/auth/**` AND `/public/**` are permitAll, all other endpoints require JWT
- Password hashing: BCrypt (`$2a$10$...`)
- `OpaqueTokenIntrospector` replaced with JWT `JwtDecoder` bean
- **JWT alg**: jjwt must sign with explicit `Jwts.SIG.HS256` — default picks HS384 for 43-char keys and Nimbus rejects it
- Refresh token: `POST /auth/refresh?refreshToken=...` (query param, NOT body); response `{data:{accessToken,refreshToken}}` camelCase

### Frontend
- Web config API URL: `http://localhost:8080/api/v1` (NOT `/api`)
- Flutter base URL: `AppConfig.development.apiBaseUrl` (dart-define `API_BASE_URL` override; Android emulator needs `10.0.2.2`)
- Vite proxy: `/api` → `http://localhost:8080` (all 3 web apps)
- All apps share `auth_token` key in localStorage (`auth_refresh` for refresh token)
- Response format: `{ success, data, message }` — handled by `ApiResponse` wrapper
- Availability slots return `{id,time,startTime,endTime,available}` — startTime is full ISO datetime

### Testing
- **Total: 358 tests** across 6 platforms, all passing
- Backend: 72 tests (BookingService, Booking domain, JwtTokenProvider) — JUnit 5 + Mockito
- web_public: 80 tests (8 files) — Vitest + @testing-library/react
- web_provider: 58 tests (5 files) — Vitest + @testing-library/react
- web_admin: 49 tests (5 files) — Vitest + @testing-library/react
- mobile_customer: 56 tests (models, utils, router) — flutter_test
- mobile_partner: 31 tests (models, utils) — flutter_test
- E2E Playwright: 12 tests (web-public runtime proof)
- Run commands: `pnpm test` (React), `flutter test` (Dart), `.\gradlew.bat :api:test` (backend)

### Backend Runtime (verified 2026-08-25)
- Migrations V15–V17: bookings status CHECK widened, categories seeded, booking_holds expiry CHECK fixed, hold status CHECK includes CONVERTED/CANCELLED, ghost ddl-auto columns dropped
- `spring.jpa.hibernate.ddl-auto: none` in ALL profiles — update mode corrupts schema (adds NOT NULL columns to seeded tables)
- Healthcheck: image has NO curl → use `wget -q -O /dev/null http://localhost:8080/api/v1/actuator/health`
- Mail health indicator disabled in dev (no local SMTP); SmtpEmailAdapter catches RuntimeException on send
- Guest booking: `POST /public/bookings` resolves customerId from customerEmail (auto-creates PENDING_VERIFICATION user)
- Booking flow E2E verified: holds → confirm (`DKT-*` code) → detail → history; anti-overlap rejects conflicting slots with 409/IllegalState
- Duplicate class warning: sharedkernel module owns outbox trio; java_root/sharedkernel/outbox deleted — never re-create FQCN duplicates between java_root and modules

### Docker Compose (verified 2026-08-26)
- Always run backend via `docker compose -f infra/compose/compose.local.yaml up -d --build`
- Sessions table requires V18 (`device_info`, `token_family`) and V19 (`ip_address` type fix) migrations
- CORS allowed origins in `WebConfig.java`: `localhost:4100, 3001, 3002, 8081, 4101, 4102`

## Deployment

- Single VPS (8 vCPU, 32GB RAM recommended)
- Docker Compose with production override
- Blue-green via Caddy
- pgBackRest for PostgreSQL backup
- Offsite S3-compatible storage
