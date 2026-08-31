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
│   ├── web_public/          # React unified app - customer+provider (port 4100)
│   ├── web_provider/        # React provider portal (port 3001) [DEPRECATED - merged into web_public]
│   └── web_admin/           # React platform admin (port 3002)
├── packages/
│   ├── flutter_core/        # Shared Flutter core
│   ├── flutter_design_system/
│   ├── flutter_api_client/
│   ├── web_ui/
│   ├── web_api_client/
│   └── web_config/
├── services/
│   └── platform_backend/    # Java Spring Boot (21 modules)
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

## Backend Modules (21)

| Module | Package | Responsibility |
|--------|---------|----------------|
| sharedkernel | id.dekat.sharedkernel | Base entities, outbox, security config, ApiResponse wrapper |
| identity | id.dekat.identity | Auth, JWT, OTP, MFA, Sessions |
| access | id.dekat.access | RBAC, Roles, Permissions |
| tenant | id.dekat.tenant | Business, Locations, Verification, BlockedDates |
| staff | id.dekat.staff | Staff, Schedules, Time-off |
| catalog | id.dekat.catalog | Services, Variants, Add-ons, Pricing |
| scheduling | id.dekat.scheduling | Availability rules, Slot validation |
| booking | id.dekat.booking | Hold, State machine, Anti-overlap, PIN confirmation |
| payment | id.dekat.payment | Intent, Gateway (Midtrans/Xendit), Webhook, Refund, Ledger |
| subscription | id.dekat.subscription | Plans, Entitlements, Usage |
| customer | id.dekat.customer | Customer profiles, Service, Controller |
| marketplace | id.dekat.marketplace | Search projection, Attribution |
| review | id.dekat.review | Reviews, Responses, Moderation |
| promotion | id.dekat.promotion | Coupons, Campaigns, Loyalty (full CRUD) |
| notification | id.dekat.notification | Templates, Push, Email, Kafka consumer/producer |
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
- `GET /public/providers/{id}/blocked-dates` - Provider blocked dates
- `GET /public/bookings/validate-coupon` - Validate coupon code
- `POST /public/bookings` - Create booking

### Provider Dashboard (JWT required)
- `GET /provider/dashboard/stats` - Dashboard stats
- `GET /provider/dashboard/recent-bookings` - Recent bookings
- `GET /provider/bookings` - List bookings
- `GET /provider/services` - List services
- `GET /provider/staff` - List staff
- `GET /provider/reviews` - List reviews
- `POST /provider/reviews/{id}/respond` - Respond to review
- `GET /provider/blocked-dates` - List blocked dates
- `POST /provider/blocked-dates` - Add blocked date
- `DELETE /provider/blocked-dates/{date}` - Remove blocked date
- `GET /provider/coupons` - List coupons
- `POST /provider/coupons` - Create coupon
- `PUT /provider/coupons/{id}` - Update coupon
- `DELETE /provider/coupons/{id}` - Deactivate coupon
- `GET /provider/campaigns` - List campaigns
- `POST /provider/campaigns` - Create campaign
- `PUT /provider/campaigns/{id}/activate` - Activate campaign
- `PUT /provider/campaigns/{id}/pause` - Pause campaign
- `GET /provider/loyalty/{customerId}` - Customer loyalty history
- `POST /provider/loyalty/earn` - Earn loyalty points

### Customer (JWT required)
- `GET /customer/profile` - Get customer profile
- `PUT /customer/profile` - Update customer profile

### Core (JWT required)
- `POST /bookings/holds` - Create booking hold
- `POST /bookings` - Confirm booking
- `POST /bookings/{id}/verify-pin` - Verify booking PIN
- `POST /bookings/{id}/cancel` - Cancel booking
- `GET /roles` - List roles
- `GET /availability` - Get available slots

### Payment (JWT required)
- `POST /bookings/{id}/payment-intents` - Create payment intent
- `GET /payments/{id}` - Get payment status
- `POST /webhooks/payments/{provider}` - Payment webhook

### Notification (JWT required)
- `GET /notifications` - List notifications
- `PUT /notifications/{id}/read` - Mark as read
- `PUT /notifications/read-all` - Mark all as read
- `POST /notifications/device-tokens` - Register device token
- `GET /notifications/unread-count` - Unread count

### Admin (JWT required)
- `GET /admin/dashboard/stats` - Platform stats
- `GET /admin/users` - List users
- `PUT /admin/users/{id}/status` - Update user status
- `GET /admin/tenants` - List tenants
- `PUT /admin/tenants/{id}/approve` - Approve tenant
- `GET /admin/config/flags` - Feature flags

## Database

- 80+ tables, migrations V0-V20 (Flyway)
- V14 includes seed data (roles, permissions, plans, users, tenant, services, bookings)
- V14 adds `password_hash` column to users table
- V18 adds `device_info` and `token_family` columns to sessions table
- V19 fixes `ip_address` type from `inet` to `text` in sessions table (entity uses String)
- V20 adds `confirmation_pin` and `pin_verified` columns to bookings table
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
- Search page: no back button, shows all providers on empty query (not empty state)
- Navbar protected tabs (Bookings/Alerts/Account): uses `context.push('/login')` instead of `context.go` so back button works properly
- `DEKATColors` has soft palette constants (softViolet, softPink, softMint, softPeach, softSky, softLavender) — reverted to original primary #6C63FF per user preference

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
- **Unified web_public app**: Customer + Provider in one app, role-based routing via `useAuth()` context
- Auth user stored in `auth_user` localStorage key with `{id, email, name, role, hasProfile}`
- Provider routes: `/provider/dashboard`, `/provider/calendar`, `/provider/services`, etc.
- Customer routes: `/`, `/search`, `/provider/:slug`, `/booking/:providerId`
- Profile completion route: `/profile/complete` (required before booking)

### Testing
- **Total: 489 tests** across 6 platforms, all passing (164 backend + 101 web_public + 58 web_provider + 49 web_admin + 86 mobile + 19 e2e + 12 weird)
- Backend: 164 tests (BookingService 18+16 weird, Booking 17+26 weird, Coupon 19, Payment 21, Jwt 19) — JUnit 5 + Mockito
- web_public: 101 tests (9 files, +21 weird.test.ts) — Vitest + @testing-library/react
- web_provider: 58 tests (5 files) — Vitest + @testing-library/react
- web_admin: 49 tests (5 files) — Vitest + @testing-library/react
- mobile_customer: 86 tests (weird_test 30 + rows 27 + utils) — flutter_test (dart analyze pass, device Mi A1)
- mobile_partner: 31 tests (models, utils) — flutter_test
- E2E Playwright: 19 tests (12 web-public + 7 booking-weird) — `booking-weird.spec.ts` XSS/race/PIN/coupon
- Run commands: `pnpm test` (React), `flutter test` (Dart), `.\gradlew.bat :api:test` (backend)

### Backend Runtime (verified 2026-08-27)
- Migrations V15–V20: bookings status CHECK widened, categories seeded, booking_holds expiry CHECK fixed, hold status CHECK includes CONVERTED/CANCELLED, ghost ddl-auto columns dropped, confirmation_pin+pin_verified added
- `spring.jpa.hibernate.ddl-auto: none` in ALL profiles — update mode corrupts schema (adds NOT NULL columns to seeded tables)
- Healthcheck: image has NO curl → use `wget -q -O /dev/null http://localhost:8080/api/v1/actuator/health`
- Mail health indicator disabled in dev (no local SMTP); SmtpEmailAdapter catches RuntimeException on send
- Guest booking: `POST /public/bookings` resolves customerId from customerEmail (auto-creates PENDING_VERIFICATION user)
- Booking flow E2E verified: holds → confirm (`DKT-*` code) → detail → history; anti-overlap rejects conflicting slots with 409/IllegalState
- Duplicate class warning: sharedkernel module owns outbox trio; java_root/sharedkernel/outbox deleted — never re-create FQCN duplicates between java_root and modules
- **Payment module**: BigDecimal→Integer (DB uses INT/sen), MidtransGatewayAdapter has @Primary, webhook signature verification active
- **Notification module**: DeliveryRecord deleted (duplicate entity), NotificationWorker uses ObjectMapper, NotificationProducer sends to Kafka
- **Promotion module**: Full CRUD (Coupon, Campaign, Loyalty) built from scratch with 5 entities, 5 repos, 3 services, 4 controllers
- **Review module**: Entity fixed (rating/title/body), ReviewResponse entity added, provider review endpoints added
- **Customer module**: CustomerService + CustomerController with profile CRUD, booking integration
- **Blocked dates**: BlockedDate entity + repository, provider CRUD endpoints, public endpoint for date picker
- **Booking PIN**: confirmation_pin + pin_verified columns, verifyPin endpoint, auto-generated 6-digit PIN

### Docker Compose (verified 2026-08-27)
- Always run backend via `docker compose -f infra/compose/compose.local.yaml up -d --build`
- Sessions table requires V18 (`device_info`, `token_family`) and V19 (`ip_address` type fix) migrations
- CORS allowed origins in `WebConfig.java`: `localhost:4100, 3001, 3002, 8081, 4101, 4102`

### Known Issues (2026-08-29 - verified)
- `POST /public/bookings` 401 FIXED — `SecurityConfig.java:37` `BearerTokenResolver` now returns null for `/public/**` & `/auth/**` even if invalid Authorization header present; guest booking creates PENDING_VERIFICATION user via customerEmail (verified 2026-08-28 `100_percent_completion`)
- Booking PIN flow: backend endpoints created (`POST /bookings/{id}/verify-pin`), frontend wired (web + mobile), auto-generated 6-digit `confirmation_pin`
- Profile completion page (`/profile/complete`) created in frontend (guard `hasProfile`)
- Provider blocked dates UI added to Settings page (`GET/POST/DELETE /provider/blocked-dates` + public `GET /public/providers/{id}/blocked-dates`)
- web_provider app is now DEPRECATED — all its routes are in web_public unified app (role-based routing via `useAuth()`)
- Docker daemon must be running for `compose.local.yaml` — `postgis/postgis:17-3.4` + `apache/kafka:4.3.1` KRaft + `redis:8.2-alpine`
- **Search page FIXED 2026-08-29** — `search_page.dart:46` no `requestFocus` (no auto keyboard), `searchResultsProvider:8` `getProviders()` on empty → all providers, `search_page.dart:54` no back button (hanya TextField), list `search_page.dart:51` attractive card `DEKATColors.primary` 64×64 `storefront_rounded`, chip category, rating `star_rounded` + price `Mulai Rp` + chevron, verified via `flutter build apk` → Mi A1 `192.168.100.70`
- **Availability FIXED 2026-08-29** — `availability_page.dart:11` `String key` `'$providerId|$date'` fix infinite loop (Map identity bug → 70ms loop), layout `availability_page.dart:39` card calendar `radius 20` shadow, service dropdown card, `Available Times` grouped Morning/Afternoon/Evening `Wrap` chip `AnimatedContainer` primary selected, shimmer loading, `usesCleartextTraffic` di `AndroidManifest.xml:4` untuk `http://192.168.100.55:8080` di Android 9
 - **Backend tests FIXED 2026-08-29** — `BookingAssignmentTest` 4-param + `ACCEPTED/DECLINED`, `BookingItemTest` `int price/Instant`, `BookingController` NPE `currentUserId` null, `BookingServiceTest` missing `CustomerService` mock → 82 tests pass, 368 total green
 - **Comprehensive weird tests 2026-08-31** — `docs/TEST_CASES_COMPREHENSIVE.md` 330 scenario P/N/E/A, `BookingWeirdCasesTest 26` + `BookingServiceWeirdTest 16` + `CouponServiceWeirdTest 19` + `PaymentServiceWeirdTest 21` + `web_public weird 21` + `flutter weird 30` + `e2e booking-weird 7`, backend 164 total, `playwright.config.ts` 3000→4100, `app_config.dart` default 192.168.100.55
 - **Availability popup 2026-08-31** — `availability_page.dart:82` inline month 320px → popup button `Tanggal Sen, 31 Aug 2026` + `showModalBottomSheet` month full, service picker `PILIH LAYANAN` card gradient + bottom sheet, separator `Atur Jadwal` divider, week→popup via hot-restart
 - **Provider detail & booking form 2026-08-31** — `provider_detail_page.dart:78` gradient header + white card overlay + Layanan `Pilih →` card, `booking_form_page.dart:16` Map key infinite loop fix `String key providerId|serviceId`, design `Ringkasan Booking` + `_InfoChip` + `_PaymentCard`, `auth_interceptor.dart:54` refresh parse `data['data']['accessToken']`, `app_router.dart:9` `GoRouterRefresh` + `redirect?redirect=` flow pilih jam→login→konfirmasi, `discovery_page.dart:110` `value.clamp(0,1)` fix red opacity, `availability_page.dart:42` date persist `SecureStorage selected_date` + focused sync

## Deployment

- Single VPS (8 vCPU, 32GB RAM recommended)
- Docker Compose with production override
- Blue-green via Caddy
- pgBackRest for PostgreSQL backup
- Offsite S3-compatible storage
