# DEKAT Booking Platform - Project Memory

## Last Updated: 2026-08-24

## Project Status
- **Phase**: Foundation Complete (100%)
- **Total Files**: 435
- **Backend**: 186 Java files (20 modules)
- **Mobile**: 64 Dart files (2 apps)
- **Web**: 66 TS/TSX files (3 apps)
- **Database**: 15 SQL migrations (80+ tables)
- **Infrastructure**: Docker Compose, Caddy, PostgreSQL, Redis, Kafka, Observability
- **Tests**: 6 unit test classes
- **Documentation**: 6 ADRs, 4 Runbooks

## Architecture Decisions
1. Modular monolith with Spring Modulith
2. Transactional outbox for event-driven
3. PostgreSQL exclusion constraints for anti-double-booking
4. Blue-green deployment via Caddy
5. Shared schema multi-tenancy with tenant_id

## Key Files
- Backend entry: `services/platform_backend/src/main/java/id/dekat/DeKatApplication.java`
- Main config: `services/platform_backend/src/main/resources/application.yml`
- Migrations: `services/platform_backend/src/main/resources/db/migration/`
- Docker: `infra/compose/compose.yaml`
- Caddy: `infra/caddy/Caddyfile`

## Module Dependencies
```
booking → customer, catalog, scheduling, staff, tenant
payment → booking, customer, tenant
notification → booking, payment, customer
review → booking, customer, tenant
support → booking, customer
subscription → tenant
```

## Database Tables (80+)
### Core Tables
- users, credentials, sessions, mfa_factors, otp_audit
- roles, permissions, role_assignments
- tenants, businesses, locations, business_documents
- customer_profiles, customer_addresses, customer_tenant_links
- staff, staff_locations, staff_services, staff_schedules, time_off
- categories, services, service_variants, service_addons, service_prices

### Booking Tables
- booking_holds (with exclusion constraint)
- bookings, booking_items, booking_addons
- booking_assignments (with exclusion constraint)
- booking_status_history, booking_notes

### Payment Tables
- payment_intents, payment_transactions
- payment_webhook_events, refunds
- ledger_entries, settlement_batches

### Other Tables
- plans, subscriptions, usage_counters
- reviews, review_responses, review_reports
- support_cases, case_events, case_attachments
- notification_templates, notification_deliveries, device_tokens
- audit_logs, feature_flags, config_versions
- media_objects, idempotency_records
- outbox_events, consumer_inbox
- marketplace_profiles, booking_attributions

## API Endpoints (50+)
### Auth
- POST /auth/register, /auth/login, /auth/otp/request, /auth/otp/verify
- POST /auth/refresh, /auth/logout

### Discovery
- GET /marketplace/search, /businesses/{slug}, /services/{id}

### Availability
- GET /availability, POST /availability/validate

### Bookings
- POST /bookings/holds, /bookings
- GET /bookings/{id}
- POST /bookings/{id}/confirm, /reschedule, /cancel
- POST /bookings/{id}/check-in, /start, /complete, /no-show

### Payments
- POST /bookings/{id}/payment-intents
- GET /payments/{id}
- POST /webhooks/payments/{provider}

### Provider
- POST/GET /provider/tenant, /provider/locations
- POST/GET /provider/staff, /provider/services
- GET /provider/calendar

### Admin
- GET /admin/users, /admin/tenants, /admin/bookings
- POST /admin/bookings/{id}/override

## Frontend Pages
### Customer App (12 pages)
- Login, Register, Forgot Password
- Discovery, Search
- Provider List, Provider Detail
- Availability, Booking Form, Booking Confirmation
- Booking History, Booking Detail
- Payment, Payment Success
- Notifications, Support, Account, Profile Edit

### Partner App (9 pages)
- Login, Onboarding
- Calendar, Booking List, Booking Detail
- Earnings, Staff List, Reports

### Web Public (4 pages)
- Home, Search, Provider, Booking

### Web Provider (8 pages)
- Login, Dashboard, Calendar, Services
- Staff, Customers, Reports, Settings

### Web Admin (8 pages)
- Login (with MFA), Dashboard
- Users, Tenants, Bookings, Payments
- Cases, Config

## Payment Gateways
- Midtrans: Basic auth, SHA512 signature, VA/QR support
- Xendit: Basic auth, HMAC-SHA256, Invoice flow

## Notification Channels
- Push: Firebase Cloud Messaging (FCM v1 API)
- Email: SMTP with template rendering
- WhatsApp: WhatsApp Business API
- SMS: Adapter ready

## Deployment
- VPS: 8 vCPU, 32GB RAM recommended
- Docker Compose: 17 services
- Blue-green: Caddy routes api-blue/api-green
- Backup: pgBackRest + offsite S3
- Monitoring: Grafana + Prometheus + Loki + Tempo

## Seed Data (V14)
- 9 roles (Customer, Provider Owner/Manager/Staff, Platform Support/Finance/Content/Admin/Super Admin)
- 50+ permissions (with module:action code format)
- 3 plans (Free, Pro, Business)
- 5 users with BCrypt hashes (admin123 for all)
- 1 tenant (Barbershop Central), 2 locations, 2 staff, 6 services, 4 bookings
- 6 notification templates, 3 feature flags

## Session 2026-08-24 - Auth & API Integration

### Completed
- **SecurityConfig**: Replaced OpaqueTokenIntrospector stub with JWT JwtDecoder bean. `/auth/**` now permitAll.
- **PasswordEncoder**: Added BCryptPasswordEncoder bean in SecurityConfig.
- **JWT secrets**: Added `jwt.access-secret` and `jwt.refresh-secret` to application-dev.yml.
- **DB schema**: V14 adds `password_hash` column to users table (DO $$ block). Users have real BCrypt hashes.
- **Session entity**: Added `@Column(name = "refresh_token")` to match DB column name.
- **UserStatus enum**: Added `PENDING_VERIFICATION` to match DB check constraint.
- **AuthController**: Now returns `ApiResponse<TokenResponse>` wrapper.
- **ApiResponse wrapper**: Created in `sharedkernel/src/main/java/id/dekat/sharedkernel/web/ApiResponse.java`.
- **PublicController**: New controller at `src/main/java_root/id/dekat/api/web/PublicController.java` — handles `/public/*` endpoints.
- **AdminController**: New controller — handles `/admin/*` endpoints.
- **ProviderDashboardController**: New controller — handles `/provider/dashboard/*`, `/provider/bookings`, `/provider/services`, `/provider/staff`.
- **Frontend fixes**: API base URL → `api/v1`, Vite proxy added to all 3 web apps, API paths fixed (`/auth/login` not `/auth/provider/login`), token key unified to `auth_token`.
- **web_public auth**: Added LoginPage.tsx, RegisterPage.tsx, routes in App.tsx.
- **web_config**: CORS origins added for ports 3000/3001/3002.
- **Flyway**: V14 includes ALTER TABLE for password_hash, V15 deleted (merged into V14).

### In Progress / Known Issues
- **Gradle build FAILED** for `api` module: controllers in `src/main/java` can't find `ApiResponse` from sharedkernel. Controllers were moved to root `src/main/java_root/id/dekat/api/web/` but build still failing. Likely need to verify source set configuration.
- **Backend running but still 401**: The Docker image has the OLD jar (before SecurityConfig fix). Need to rebuild after fixing the Gradle issue.
- **Login untested**: Cannot test until build passes and Docker is rebuilt with new jar.

### Next Session TODO
1. Fix the Gradle build for api module (source set issue with `java_root` vs `java`)
2. Rebuild Docker with working jar
3. Test `POST /api/v1/auth/login` with `admin@dekat.id` / `admin123`
4. Start web apps and test full login flow
5. Verify all endpoints match frontend expectations

## Development Notes
- Backend uses Gradle with wrapper
- Flutter uses FVM for version management
- React uses pnpm with Corepack
- All secrets via Docker secrets or mounted files
- No `latest` tags in production containers
