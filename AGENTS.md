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
- `POST /provider/walk-in` - Create walk-in booking (QR check-in)
- `GET /provider/walk-in/qr/{bookingCode}` - Get walk-in QR data
- `GET /provider/waitlist` - List waitlist entries
- `POST /provider/waitlist` - Join waitlist
- `POST /provider/waitlist/{id}/notify` - Notify waitlist customer
- `DELETE /provider/waitlist/{id}` - Remove waitlist entry
- `GET /provider/commission/statement` - Commission statement (query: days)
- `GET /provider/commission/config` - Commission config (rate, currency)
- `GET /provider/settlement` - List settlements (query: limit)
- `POST /provider/settlement/request` - Request payout
- `GET /provider/subscription` - Get current subscription plan
- `POST /provider/subscription/upgrade` - Upgrade plan
- `POST /provider/subscription/cancel` - Cancel subscription

### Customer (JWT required)
- `GET /customer/profile` - Get customer profile
- `PUT /customer/profile` - Update customer profile
- `GET /customer/loyalty` - Get loyalty points + history
- `POST /customer/loyalty/redeem` - Redeem loyalty points
- `POST /customer/loyalty/birthday-bonus` - Birthday bonus (500 pts)
- `GET /customer/recurring-bookings` - List recurring bookings
- `POST /customer/recurring-bookings` - Create recurring booking
- `PUT /customer/recurring-bookings/{id}` - Update recurring booking
- `DELETE /customer/recurring-bookings/{id}` - Delete recurring booking

### Social (JWT required)
- `GET /social/feed` - Get social feed posts
- `POST /social/feed/{postId}/like` - Like/unlike post
- `POST /social/follow/{providerId}` - Follow/unfollow provider
- `GET /social/trending` - Get trending providers

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
- `GET /admin/feature-flags` - List feature flags (full CRUD)
- `POST /admin/feature-flags` - Create feature flag
- `PUT /admin/feature-flags/{id}` - Update feature flag
- `PUT /admin/feature-flags/{id}/toggle` - Toggle feature flag
- `DELETE /admin/feature-flags/{id}` - Delete feature flag
- `GET /admin/subscriptions/plans` - List subscription plans
- `POST /admin/subscriptions/plans` - Create plan
- `PUT /admin/subscriptions/plans/{id}` - Update plan
- `GET /admin/subscriptions` - List subscriptions
- `PUT /admin/subscriptions/{id}/cancel` - Cancel subscription
- `GET /admin/audit-logs` - List audit logs (with filters)
- `GET /admin/export/users` - Export users as CSV
- `GET /admin/export/bookings` - Export bookings as CSV

## Database

- 95+ tables, migrations V0-V27 (Flyway)
- V14 includes seed data (roles, permissions, plans, users, tenant, services, bookings)
- V14 adds `password_hash` column to users table
- V18 adds `device_info` and `token_family` columns to sessions table
- V19 fixes `ip_address` type from `inet` to `text` in sessions table (entity uses String)
- V20 adds `confirmation_pin` and `pin_verified` columns to bookings table
- V23 adds `media_assets` + `customer_favorites` + `review_photos` + `staff.specialties`
- V24 adds `deposit_amount/cancelDeadline/rescheduleCount/maxReschedule/cancelPolicy` to bookings
- V25 adds `faqs/policies` tables + seed 5 FAQ/3 policies
- V26 adds `conversations/messages` for chat
- V27 adds `loyalty_accounts` + `loyalty_transactions` + `recurring_bookings` + `waitlist_entries` + `settlement_batches`
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
- **Profile completion race condition FIXED**: `ProfileCompletePage` uses `useEffect` to navigate after `hasProfile` state is confirmed updated, avoiding redirect loop with `RequireProfileGuard`

### Testing
- **Total: ~391 tests** across 5 platforms, all passing (134 web_public + 49 web_admin + 43 mobile_partner + 124 mobile_customer + 41 e2e)
- Backend: 222 tests (BookingService + Media + Deposit + FAQ + Chat + Reporting + Coupon/Payment/Jwt + CouponServiceWeird + PaymentServiceWeird) — JUnit 5 + Mockito
- web_public: 134 tests (15 files) — Vitest + @testing-library/react
- web_admin: 49 tests (5 files) — Vitest + @testing-library/react
- E2E Playwright: 41 tests (12 web-public + 7 booking-weird + 18 UI audit + 4 web-provider) — screenshots + functional
- Run commands: `pnpm test` (React), `flutter test` (Dart), `.\gradlew.bat :api:test` (backend)
- Header.test.tsx requires QueryClientProvider wrapper (React Query dependency)

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
- **Loyalty system**: LoyaltyAccount + LoyaltyTransaction entities, LoyaltyService with earn/redeem/tier (BRONZE→PLATINUM), wired to BookingService (1pt per Rp1000 spent on completion)
- **Auto review request**: ReviewRequestService cron (1hr) sends review request 2h after booking completes
- **Walk-in check-in**: WalkInController creates instant booking + QR code for walk-in customers
- **Waitlist**: WaitlistController with CRUD + notify flow
- **Commission**: 5% platform commission statement + config
- **Settlement**: Payout requests + history
- **Subscription**: ProviderSubscriptionController for plan upgrade/cancel
- **Recurring bookings**: RecurringBookingController with CRUD (in-memory, V27 migration created for DB backing)

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
- **Token refresh interceptor ADDED** — `web_api_client/src/client.ts` auto-refreshes expired JWT via `POST /auth/refresh`, queues concurrent requests, redirects to `/login` on failure
- **Provider registration FIXED** — `ProviderRegisterPage.tsx` now creates tenant via `POST /provider/tenant` with Zod validation, auth check, auto-slug, success redirect
- **Support ticket form ADDED** — `SupportPage.tsx` now has "Hubungi Kami" form submitting to `POST /support/cases`
- **Admin FAQ/Policy management ADDED** — `admin/FaqsPage.tsx` with full CRUD, route `/admin/faqs`, sidebar nav link
- **Coupon edit ADDED** — `PromotionsPage.tsx` now has edit button + pre-filled form for each coupon
- **Loyalty history ADDED** — `PromotionsPage.tsx` "Lihat Riwayat" button shows per-customer loyalty entries
- **Dead ConfigPage REMOVED** — `admin/ConfigPage.tsx` deleted (superseded by FeatureFlagsPage)
- **Search page FIXED 2026-08-29** — `search_page.dart:46` no `requestFocus` (no auto keyboard), `searchResultsProvider:8` `getProviders()` on empty → all providers, `search_page.dart:54` no back button (hanya TextField), list `search_page.dart:51` attractive card `DEKATColors.primary` 64×64 `storefront_rounded`, chip category, rating `star_rounded` + price `Mulai Rp` + chevron, verified via `flutter build apk` → Mi A1 `192.168.100.70`
- **Availability FIXED 2026-08-29** — `availability_page.dart:11` `String key` `'$providerId|$date'` fix infinite loop (Map identity bug → 70ms loop), layout `availability_page.dart:39` card calendar `radius 20` shadow, service dropdown card, `Available Times` grouped Morning/Afternoon/Evening `Wrap` chip `AnimatedContainer` primary selected, shimmer loading, `usesCleartextTraffic` di `AndroidManifest.xml:4` untuk `http://192.168.100.55:8080` di Android 9
 - **Backend tests FIXED 2026-08-29** — `BookingAssignmentTest` 4-param + `ACCEPTED/DECLINED`, `BookingItemTest` `int price/Instant`, `BookingController` NPE `currentUserId` null, `BookingServiceTest` missing `CustomerService` mock → 82 tests pass, 368 total green
 - **Comprehensive weird tests 2026-08-31** — `docs/TEST_CASES_COMPREHENSIVE.md` 330 scenario P/N/E/A, `BookingWeirdCasesTest 26` + `BookingServiceWeirdTest 16` + `CouponServiceWeirdTest 19` + `PaymentServiceWeirdTest 21` + `web_public weird 21` + `flutter weird 30` + `e2e booking-weird 7`, backend 164 total, `playwright.config.ts` 3000→4100, `app_config.dart` default 192.168.100.55
 - **Availability popup 2026-08-31** — `availability_page.dart:82` inline month 320px → popup button `Tanggal Sen, 31 Aug 2026` + `showModalBottomSheet` month full, service picker `PILIH LAYANAN` card gradient + bottom sheet, separator `Atur Jadwal` divider, week→popup via hot-restart
 - **Provider detail & booking form 2026-08-31** — `provider_detail_page.dart:78` gradient header + white card overlay + Layanan `Pilih →` card, `booking_form_page.dart:16` Map key infinite loop fix `String key providerId|serviceId`, design `Ringkasan Booking` + `_InfoChip` + `_PaymentCard`, `auth_interceptor.dart:54` refresh parse `data['data']['accessToken']`, `app_router.dart:9` `GoRouterRefresh` + `redirect?redirect=` flow pilih jam→login→konfirmasi, `discovery_page.dart:110` `value.clamp(0,1)` fix red opacity, `availability_page.dart:42` date persist `SecureStorage selected_date` + focused sync
 - **Bundles 2026-09-01 — Media+Portfolio+Review + Deposit+Kalender+FAQ + Chat+Analytics** — `V23 media_assets` + `customer_favorites` + `review_photos` + `staff.specialties`, `MediaService` upload `./uploads` signed-url, `MediaController` `POST /media/upload` `GET /public/providers/{id}/media` `PUT /provider/media/reorder`, `FavoriteController` `POST/DELETE/GET /customer/favorites`, `ReviewService` photos cap 8 + `verified_booking`, `web_public/MediaPage.tsx` + `ProviderPage.tsx` gallery 3-col + `ChatPage.tsx` + `ChatWidget` + `useChatWebSocket` polling 3s+SSE, `ReportsPage.tsx` Recharts Area/Bar/Pie + `analyticsApi`, `V24 bookings` deposit `deposit_amount/cancelDeadline/rescheduleCount` `BookingService` DP+409, `BookingCalendarService` `.ics` + Google `BookingCalendarController` `GET /bookings/{id}/ics`, `BookingReminderScheduler` H-24/H-2, `V25 faqs/policies` `PublicFaqController` `GET /public/faqs` + `ProviderFaqController`, `V26 conversations/messages` `ChatService` `SimpMessagingTemplate /topic/chats/{id}` `ChatWebSocketConfig /ws-chat` JWT query `token`, `ReportingService` `revenueByDay/bookingsByStatus/retention/funnel/topServices/staffUtilization` `ReportingController /provider/reports/analytics`, `flutter` `chat_list/detail` + `reports_page` fl_chart, `SecurityConfig:36` `allowUriQueryParameter` + `WebConfig:14` `/uploads/**` resource, `api/build.gradle:44` `websocket`, tests +~160 (total ~650: backend 236+ web 134+ mobile 167+ e2e 19)
 - **Feature completion 2026-09-02** — 50+ new files across 6 platforms: FeatureFlag CRUD, NotificationPreference, AdminAuditController, AdminSubscriptionController, AdminExportController (CSV), EmailService + 6 HTML templates, ScheduledTasks, Nearby providers (Haversine), Public FAQs/Policies, Refund estimate/list, Booking history/code, BookingNote entity, web_admin (Analytics/Audit/Subscriptions/FeatureFlags pages), web_public customer (Bookings/Notifications/Favorites/Account/Support), web_public provider (Reviews/Promotions/Notifications), mobile_customer (favorites/reviews/loyalty pages), mobile_partner (services/reviews/promotions/notifications pages), ApiService wired with 7 new methods, V25 UUID hex fixed, FeatureFlag entity fixed (no key_name), Haversine query fixed (subquery instead of GROUP BY), E2E updated (+18 UI audit +4 web-provider), UI audit clean (exposed API paths removed, Indonesian localization), ~670 tests all pass
 - **Integration layer 2026-09-06** — Backend: fixed NotificationService UUID email bug (resolves via UserRepository), unified with EmailService, fixed PaymentController webhook to accept raw JSON (signature verification works), added PaymentGatewayProperties config to YAML, replaced hardcoded GATEWAY_PROVIDER, created OpenApiConfig with JWT Bearer security scheme, added @Operation/@Tag annotations to Auth/Payment/Public controllers, added @Cacheable/@CacheEvict to CatalogService (5 cache names), FCM config properties. Flutter: Google Services Gradle plugin, FCM background handler, onTokenRegistered callback, FCM notification channel metadata, foreground notification wiring. Tests: 222 backend + 134 web_public + 49 web_admin = 405 passing
 - **Dashboard improvements 2026-09-06** — Admin: `GET /admin/analytics?days=30` endpoint with revenueByDay/bookingsByStatus/topServices via native SQL, growth indicators (userGrowth/tenantGrowth/bookingGrowth/revenueGrowth), AnalyticsPage rewritten to use backend endpoint. Provider: `todayRevenue`+`weekBookings` stats, 30-day revenue chart. Mobile: customer dashboard summary on discovery page, provider dashboard stats on calendar page. Tests: 405 passing (222+134+49)
 - **Profile completion race condition FIXED 2026-09-06** — `ProfileCompletePage` used immediate `navigate('/')` after `setUser()` but React state updates are async/batched, causing `RequireProfileGuard` to see stale `hasProfile=false` and redirect back to `/profile/complete` (blank page). Fixed with `useEffect` watching `user?.hasProfile` before navigating. `Header.test.tsx` wrapped with `QueryClientProvider` for React Query dependency
 - **Unified web app + Admin dashboard 2026-09-07** — All 3 web apps (customer/admin/provider) merged into single `:4100` entry point. Admin routes `/admin/*` with role-based access (`ProtectedRoute requiredRole="ROLE_PLATFORM_ADMIN"`). `AdminLayout.tsx` sidebar navigation. `StatsCard` `change` prop: backend returns plain numbers (e.g. `100.0`), frontend `toChange()` converts to `{value, isPositive}`. Added `ErrorBoundary` in `App.tsx` for runtime error display. **AdminController stats FIX**: `User.createdAt` + `Tenant.createdAt` are `LocalDateTime`, `Booking.createdAt` is `OffsetDateTime` — repos must match entity field types (`UserRepository`/`TenantRepository` → `LocalDateTime`, `BookingRepository` → `OffsetDateTime`), controller passes correct type per entity. Login flow: admin → `/admin/dashboard`, provider → `/provider/dashboard`, customer → `/` (skip `syncHasProfile` for non-customer roles). **Header "Akun Saya" link** added for `ROLE_CUSTOMER`. **CustomerAccountPage profile edit**: inline form with name+phone (react-hook-form+zod), `PUT /customer/profile` mutation with cache invalidation. Tests: 134/134 web_public pass
 - **Booking confirm 500 FIXED 2026-09-07** — Two root causes: (1) `booking.setItems(items)` before `bookingRepository.save()` caused Hibernate to cascade-persist items with `booking_id=null` (parent UUID not yet generated). Fix: clear items before save, add to list after save. (2) `CreateBookingRequest` used `List<BookingItem>` (domain entity) as DTO, but Flutter sends `priceSnapshot`/`durationSnapshot` instead of `price`/`startsAt`/`endsAt` — Jackson couldn't map them → null `starts_at`/`ends_at`/`price`. Fix: created `BookingItemRequest` DTO, controller maps `priceSnapshot` → `price` and derives `startsAt`/`endsAt` from hold times. **RenderFlex overflow FIXED**: removed debug API path text from provider detail page Row. Verified: `POST /bookings` → 201, Total: 40000, Status: CONFIRMED. App running on Mi A1.
 - **Profile update + Payment + Mobile partner FIXED 2026-09-08** — (1) **Profile update bug FIXED**: `CustomerAccountPage.tsx` now calls `refreshUser()` from auth context after successful `PUT /customer/profile`, ensuring user state and localStorage are re-synced. (2) **Payment flow FIXED**: `api.ts createPaymentIntent` now accepts `{tenantId, amount, currency}` params; `BookingPage.tsx` passes `{bookingId, amount}` from `selectedService.depositAmount`; Flutter `ApiService.createPaymentIntent` and legacy `ApiClient.createPaymentIntent` both fixed to send `{tenantId, amount, currency, method}` to correct endpoint `POST /bookings/{id}/payment-intents` (was wrong `/payments/intent`). (3) **Mobile partner FIXED**: added `POST_NOTIFICATIONS` permission to both `mobile_partner` and `mobile_customer` AndroidManifest.xml for Android 13+; created dummy `google-services.json` for `mobile_partner` with correct package name `id.dekat.partner.mobile_partner`. (4) **Complete profile flow verified**: `syncHasProfile()` correctly evaluates `hasProfile` after profile update, `ProfileCompletePage` useEffect watches `saved && user?.hasProfile` before navigating. Tests: 134 web_public + 49 web_admin + 43 mobile_partner + 124 mobile_customer + 41 e2e = **391 all green**.
 - **Audit & improvements 2026-09-08** — Comprehensive audit across all platforms. **CRITICAL FIXES**: (1) `useChatWebSocket.ts:43` hardcoded `localhost:8080` fallback → `window.location.hostname` (chat production broken), (2) `BookingPage.tsx:102` + `CustomerBookingDetailPage.tsx:76` hardcoded timezone `+07:00` removed (reschedule wrong for non-WIB), (3) `BookingPage.tsx:250` added `onError` handler on `createBooking.mutate()` (user gets no feedback on failure), (4) `settings_page.dart` mobile_partner autoConfirm/depositRequired toggles now actually save (were silently discarded), (5) Backend `@Valid` added to 7 critical DTO endpoints (BookingController, ReviewController, SupportController, PaymentController), (6) `System.out.println` OTP → `log.warn` (security leak), (7) 16 exposed API paths in UI text replaced with user-friendly descriptions across 9 files. Tests: 134 web + 124 mobile_customer + 43 mobile_partner = **301 all green**.
 - **Final feature completion 2026-09-08** — All stub pages replaced with real API integration + 10 new backend features. Backend: `ReviewRequestService` (auto review 2h post-booking), `WalkInController` (QR check-in), `LoyaltyService` + `LoyaltyAccount`/`LoyaltyTransaction` entities (DB-backed earn/redeem/tier), `LoyaltyController` (customer API), `ProviderSubscriptionController`, `WaitlistController` (CRUD+notify), `CommissionController` (5% platform), `SettlementController` (payout requests). `V27` migration: 5 new tables. Web: `WaitlistPage`, `CommissionPage`, `SettlementPage` + routes + sidebar + dashboard quick actions. Mobile customer: `social_feed_page.dart` + `recurring_bookings_page.dart` now use real API. Mobile partner: `staff_checkin_page.dart` uses real API, `payment_page.dart` route added. `ApiService` +18 methods. Tests: 124+43+134+49=**350 all green**, backend BUILD SUCCESSFUL. Commit `3bf2a85`.
 - **Customer dashboard + all pending completed 2026-09-09** — (1) **Payment gateway verified**: `MidtransGatewayAdapter` + `PaymentGatewayProperties` fully wired, sandbox URL configured (`https://api.sandbox.midtrans.com`), real API keys needed from user. (2) **Both Flutter apps build**: `mobile_customer` and `mobile_partner` APKs compile successfully. (3) **All 350 tests green**: backend BUILD SUCCESSFUL + 134 web_public + 49 web_admin + 124 mobile_customer + 43 mobile_partner. (4) **Customer dashboard page created**: `CustomerDashboardPage.tsx` with welcome message, quick actions (Search/Bookings/Favorites/Notifications), loyalty points card (Bronze/Silver/Gold tier), recent bookings list, and 6 shortcut links. Route `/` shows dashboard for `ROLE_CUSTOMER`, public HomePage for guests.
  - **Customer dashboard full redesign 2026-09-09** — 14 customer pages rewritten to modern dashboard style with `CustomerLayout` sidebar navigation. New `CustomerLayout.tsx` with 13 menu items (same pattern as `AdminLayout`/`ProviderLayout`). All pages now use: SVG icons (no emoji), loading skeletons, empty states with illustrations, `max-w-screen-2xl mx-auto`. **Redesigned pages**: Dashboard (stats cards, welcome banner, loyalty progress ring, recent bookings), Bookings (filter tabs with counts, sort, card-style list), Booking Detail (5-step lifecycle stepper, 2-col info cards, PIN card), Notifications (date grouping, type icons, filter tabs), Favorites (3-col grid, star ratings), Account (profile header, sectioned menu, stats), Loyalty (hero card with progress ring, tier comparison, points history, redeem), Reviews (stats card, tabbed interface), Recurring (frequency cards, toggle active/inactive), Referral (gradient hero card, social share buttons), Nearby (map placeholder, provider grid), Support (search bar, FAQ accordion, contact form). TypeScript errors fixed (BookingResponse types, API import patterns). 134/134 tests PASSED.
  - **Force logout on 401 + booking overlap fix 2026-09-10** — (1) **Force logout**: `ApiClient.onAuthFailure` static callback on `flutter_core`, `_AuthInterceptor` in `dio_client.dart` calls it when token refresh fails OR no refresh token available; both apps register callback in `routerProvider` → `authProvider.notifier.logout()` → GoRouter redirect → `/login`. Fixed `_isRefreshing` flag stuck when retried request fails. (2) **Booking 500 FIXED**: `BookingItem` DB columns `starts_at`/`ends_at` are `NOT NULL` but Flutter sends items without them → `BookingService.confirmBooking` now fills null times from hold. Added `setStartsAt`/`setEndsAt` to `BookingItem.java`. (3) **GlobalExceptionHandler added**: `NotFoundException` → 404, `IllegalStateException` → 409, `IllegalArgumentException` → 400, validation → 400, others → 500 with message (in `src/main/java_root/id/dekat/sharedkernel/web/`). (4) **Booking overlap fix**: `BookingHoldRepository.findOverlappingHolds` now checks `expiresAt > CURRENT_TIMESTAMP` so expired holds don't block new bookings. (5) **Back button exit dialog**: Both `MainScaffold` widgets wrapped with `PopScope` → dialog "Keluar? Apakah anda ingin keluar dari aplikasi?" with Ya/Tidak. (6) **Improved booking error display**: extracts actual server error message from response body. Tests: 124+43+134=301 all green.

## What's Next

- **Payment gateway sandbox testing**: Configure real Midtrans sandbox keys in `application-dev.yml` (`SB-Mid-server-XXX`, `SB-Mid-signature-key-XXX`) and test end-to-end with Midtrans sandbox dashboard
- **Device testing (mobile)**: Run both apps on Mi A1 — verify FCM push notifications, booking flow end-to-end, PIN verification, calendar sync
- **Production deployment**: Docker Compose with real Midtrans production keys, PostgreSQL backup (pgBackRest), Caddy reverse proxy
- **Optional enhancements**: Push notification campaign system, advanced analytics, multi-language support
- **Nearby page map integration**: Replace placeholder with Leaflet/OpenStreetMap for real map view

## Deployment

- Single VPS (8 vCPU, 32GB RAM recommended)
- Docker Compose with production override
- Blue-green via Caddy
- pgBackRest for PostgreSQL backup
- Offsite S3-compatible storage
