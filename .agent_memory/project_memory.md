# DEKAT Booking Platform - Project Memory

## Last Updated: 2026-08-23

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
- 50+ permissions
- 3 plans (Free, Pro, Business)
- 6 categories (Barbershop, Salon, Beauty, Spa, Massage, Fitness)
- 1 admin user (admin@dekat.id)
- 6 notification templates
- 3 feature flags

## Development Notes
- Backend uses Gradle with wrapper
- Flutter uses FVM for version management
- React uses pnpm with Corepack
- All secrets via Docker secrets or mounted files
- No `latest` tags in production containers
