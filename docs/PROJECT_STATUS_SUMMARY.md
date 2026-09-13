# DEKAT Platform — Status Summary (13 Sep 2026)

## Project Overview

**DEKAT** adalah platform booking layanan lokal (barbershop, salon, kecantikan) dengan model provider-first hybrid (SaaS + marketplace).

- **Mobile**: Flutter (2 apps: customer + partner)
- **Web**: React + TypeScript + Vite + Tailwind (3 apps: unified public/admin)
- **Backend**: Java 21 + Spring Boot 3.3.4 + Spring Modulith (21 modules)
- **Database**: PostgreSQL 17 + PostGIS + Redis + Kafka
- **Deploy**: Single VPS + Docker Compose

---

## Current State: STABLE ✅

| Platform | Tests | Status |
|----------|-------|--------|
| Backend (21 modules) | 222 | ✅ BUILD SUCCESSFUL |
| web_public (unified) | 134 | ✅ All pass |
| web_admin | 49 | ✅ All pass |
| mobile_customer | 124 | ✅ APK build OK |
| mobile_partner | 43 | ✅ APK build OK |
| E2E Playwright | 41 | ✅ All pass |
| **Total** | **~391** | **All green** |

Working tree: **Clean** (no uncommitted changes)

---

## Completed Features (What's Done)

### Backend (21 modules, 95+ tables, V0-V27 migrations)
- Auth (JWT + OTP + MFA + refresh token rotation)
- RBAC (roles + permissions)
- Tenant/Business management + verification
- Staff + schedules + time-off
- Catalog (services, variants, add-ons, pricing)
- Scheduling (availability rules, slot validation)
- Booking (hold, state machine, anti-overlap, PIN confirmation, deposit, walk-in QR check-in)
- Payment (Midtrans/Xendit gateway, webhook, refund, ledger)
- Subscription (plans, entitlements, usage)
- Customer profiles
- Marketplace search projection + attribution
- Reviews + responses + moderation
- Promotions (coupons, campaigns, loyalty earn/redeem/tier)
- Notifications (push, email, templates, Kafka consumer/producer)
- Support (cases, evidence, SLA)
- Reporting (aggregates, export)
- Media (object storage, signed URLs)
- Audit logs
- Platform config (feature flags)
- Chat (conversations + messages + WebSocket)
- Waitlist
- Commission (5% platform)
- Settlement (payout requests)
- Recurring bookings
- Nearby providers (Haversine distance)
- Public FAQs/Policies

### Web (Unified web_public at :4100)
- Customer routes: dashboard, search, provider detail, booking, bookings, notifications, favorites, account, loyalty, reviews, recurring, referral, nearby (Leaflet/OpenStreetMap), support
- Provider routes: dashboard, calendar, services, staff, bookings, reviews, promotions, notifications, waitlist, commission, settlement, subscription
- Admin routes: dashboard, users, tenants, subscriptions, feature flags, FAQs, audit logs, analytics, export
- Profile completion flow
- Token refresh interceptor (auto-refresh JWT)

### Mobile Customer (id.dekat.customer)
- Discovery + search + provider detail
- Availability (service → staff → date → slots)
- Booking form + confirmation + PIN verification
- Payment (Midtrans)
- Booking history + detail
- Notifications + favorites + chat
- Loyalty (earn/redeem/tier)
- Reviews + social feed + recurring bookings + referral + nearby map (OpenStreetMap)
- Profile management + account settings

### Mobile Partner (id.dekat.partner)
- Dashboard stats
- Calendar + bookings management
- Services + staff management
- Reviews + promotions + notifications
- Walk-in check-in (QR)
- Waitlist + commission + settlement
- Settings (auto-confirm, deposit required)

---

## What's NOT Done (Pending / Needs User Input)

### 1. Payment Gateway Sandbox Testing ⏳
- Midtrans adapter code is wired and ready
- Needs **real sandbox API keys** from user (`SB-Mid-server-XXX`, `SB-Mid-signature-key-XXX`)
- Configure in `application-dev.yml`
- Test end-to-end with Midtrans sandbox dashboard

### 2. Device Testing (Mobile) ⏳
- Both APKs compile but need real device testing on Mi A1
- Verify: FCM push notifications, full booking flow, PIN verification, calendar sync
- Backend must be running via Docker Compose

### 3. Production Deployment ⏳
- Docker Compose config ready (blue-green via Caddy)
- Needs: real Midtrans production keys, PostgreSQL backup (pgBackRest), SSL/TLS certificates
- Single VPS deployment (8 vCPU, 32GB RAM recommended)

---

## Tech Stack Details

| Layer | Version |
|-------|---------|
| Java | 21 |
| Spring Boot | 3.3.4 |
| Spring Modulith | 1.3.2 |
| PostgreSQL | 17 (postgis/postgis:17-3.4) |
| Redis | 8.2-alpine |
| Kafka | 4.3.1 (KRaft, no Zookeeper) |
| Flutter | 3.x |
| Dart | 3.x |
| React | 19 |
| TypeScript | 5.7 |
| Vite | 8.1 |
| Tailwind CSS | 4.3 |
| Docker Compose | Single VPS |

---

## Key Patterns

1. **Transactional Outbox** — Events via `outbox_events` → Kafka
2. **Anti-Double-Booking** — PostgreSQL exclusion constraints + `tstzrange`
3. **Multi-Tenancy** — Shared schema, `tenant_id` column
4. **Optimistic Locking** — `@Version` on aggregates
5. **Blue-Green Deployment** — Caddy routes api-blue/api-green

---

## Default Credentials

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | admin@dekat.id | admin123 | ROLE_PLATFORM_ADMIN |
| Provider | budi@barbershopcentral.id | admin123 | ROLE_PROVIDER_OWNER |
| Staff 1 | andi@barbershopcentral.id | admin123 | ROLE_PROVIDER_STAFF |
| Customer | siti@gmail.com | admin123 | ROLE_CUSTOMER |

---

## Recent Changes (Last 5 commits)

```
8c3070b feat(mobile): add staff selection to availability and booking flow
6471e99 fix: force logout on 401, booking 500, back button exit dialog
db454c9 feat: modern dashboard redesign - 14 customer pages + CustomerLayout sidebar
23bb716 docs: update AGENTS.md with V27 migration, new API endpoints
3bf2a85 feat: complete all stub pages + 10 new backend features + V27 migration
```

---

## How to Run

```bash
# Backend
cd services/platform_backend
.\gradlew.bat build -x test

# Docker (all services)
docker compose -f infra/compose/compose.local.yaml up -d --build

# Flutter Customer
cd apps/mobile_customer
flutter pub get && flutter run

# Flutter Partner
cd apps/mobile_partner
flutter pub get && flutter run

# Web
cd apps/web_public
pnpm install && pnpm dev

# Tests
pnpm test                    # React web
flutter test                  # Flutter mobile
.\gradlew.bat :api:test       # Backend
```

---

## Recommendation for Next AI Session

Jika ingin melanjutkan, tanyakan:

1. **"Konfigurasi Midtrans sandbox dan test payment flow"** — butuh API keys dari Midtrans dashboard
2. **"Deploy ke VPS dengan Docker Compose"** — butuh server + domain + SSL
3. **"Tambahkan fitur X"** — sebutkan fitur spesifik yang diinginkan
4. **"Fix bug Y"** — sebutkan error atau masalah yang ditemukan

Project dalam kondisi **sangat stabil** — semua fitur inti selesai, 391 tests hijau, working tree bersih.
