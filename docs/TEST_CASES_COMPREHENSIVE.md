# DEKAT Platform — Comprehensive Test Cases (Positif / Negatif / Edge / Aneh)

> Generated: 2026-08-31 | Coverage target: 21 fitur, 96 endpoints, 5 platform (mobile_customer, mobile_partner, web_public, web_provider, web_admin) + backend 21 modules
> Existing baseline: 368 tests (82 backend, 187 web, 87 flutter, 12 e2e) — dokumen ini melengkapi ke **~600+ scenario** dengan klasifikasi **P/N/E/A**

Legenda: **P**=Positif, **N**=Negatif, **E**=Edge, **A**=Aneh/Weird (chaos, race, unicode, timezone, injection)

---

## 1. AUTH (`POST /auth/*`, 6 endpoints)

### P1-P6 Positif
| ID | Scenario | Steps | Expected | Platform |
|---|---|---|---|---|
| AUTH-P01 | Register valid | `POST /auth/register {name, email valid, phone 08..., password 8+}` | 201 `success:true data:{accessToken, refreshToken}` `hasProfile:false` | all |
| AUTH-P02 | Login email/password valid | `POST /auth/login {admin@dekat.id/admin123}` | 200 JWT 15m + refresh, `role` in payload | all |
| AUTH-P03 | Login OTP request+verify | `POST /auth/otp/request {phone}` → `POST /auth/otp/verify {otp}` | 200 token | mobile |
| AUTH-P04 | Refresh token valid | `POST /auth/refresh?refreshToken=...` | 200 new `accessToken` camelCase | all |
| AUTH-P05 | Logout | `POST /auth/logout` with Bearer | 200, token invalidated | all |
| AUTH-P06 | Role redirect | login sebagai `ROLE_PROVIDER_OWNER` → redirect `/provider/dashboard`, `CUSTOMER` → `/` | redirect benar | web_public |

### N1-N8 Negatif
| ID | Scenario | Expected |
|---|---|---|
| AUTH-N01 | Register email duplicate | 409 `User already exists` |
| AUTH-N02 | Register phone duplicate | 409 handle di `ProfileCompletePage.tsx` jangan `Unknown error` |
| AUTH-N03 | Login password salah | 401 `ProblemDetail` RFC9457 |
| AUTH-N04 | Login email tidak terdaftar | 401/404 |
| AUTH-N05 | OTP verify salah/expired | 400 `Invalid OTP` |
| AUTH-N06 | Refresh token expired/revoked | 401 |
| AUTH-N07 | Access token tanpa Bearer / malformed | 401 (kecuali `/public/**` & `/auth/**` via `BearerTokenResolver.java:37` return null) |
| AUTH-N08 | Register password <8 char / email tanpa @ | 400 validation |

### E1-E6 Edge
| ID | Scenario | Expected |
|---|---|---|
| AUTH-E01 | Email `+` alias `budi+test@dekat.id`, mixed case `BUDI@DEKAT.ID` | normalize, tetap login |
| AUTH-E02 | Phone `0` leading `0812...` vs `+62 812...` `62812...` | disimpan konsisten E.164, login tetap |
| AUTH-E03 | Password tepat 8 char, 72 char (BCrypt limit), 100 char | 8 pass, 72 pass, >72 truncate sesuai BCrypt |
| AUTH-E04 | Refresh token di-rotate 2x concurrent | hanya 1 valid (token family), yang lain 401 |
| AUTH-E05 | Nama 255 char unicode `Budi 🤙🏻` | trim + simpan |
| AUTH-E06 | Register dengan spasi `  budi@dekat.id  ` | trim → success |

### A1-A6 Aneh/Weird
| ID | Scenario | Expected |
|---|---|---|
| AUTH-A01 | Email `'; DROP TABLE users; --` SQLi | 400 validation, tidak execute |
| AUTH-A02 | Body `{"email": {"$ne": null}}` NoSQL injection | 400 |
| AUTH-A03 | Header `Authorization: Bearer <invalid-base64> + valid endpoint /public/providers` | `SecurityConfig` skip → 200 tetap (guest booking bug regression `2026-08-28`) |
| AUTH-A04 | Login 100 req/detik brute force | 429 rate-limit |
| AUTH-A05 | JWT alg `none` atau `HS384` (bug `Jwts.SIG.HS256`) | Nimbus reject → 401 |
| AUTH-A06 | Timezone login jam 23:59 WIB, server UTC | expiry 15m tetap UTC, tidak off-by-day |

---

## 2. DISCOVERY & SEARCH (`GET /public/*`)

### P
- P01 List categories `GET /public/categories` → 200 array `id,name,slug`
- P02 Featured `GET /public/providers/featured` → 200 top 10
- P03 Search `q=barber` `GET /public/providers?q=barber&page=1&limit=10` → paginated
- P04 Empty query `q=` → return **all providers** (fix `search_page.dart:54` `searchResultsProvider:8`)
- P05 Category filter + sort `?category=salon&sort=rating_desc`

### N
- N01 `q=<script>alert(1)</script>` → escape, 200 empty
- N02 `page=-1` `limit=9999` → 400 atau clamp `limit max 50`
- N03 `category=NOT_EXIST` → 200 empty `data:[]`
- N04 Tanpa koneksi → mobile show retry, shimmer

### E
- E01 Query 200 char, 1 char `a` → tetap query
- E02 Provider name unicode `Barber 💈 東京` → render & search
- E03 Pagination `page=1000` total 10 → empty + `totalPages`
- E04 0 providers (DB kosong) → empty state `Tidak ada provider`

### A
- A01 Search ketik cepat `b`→`ba`→`bar` 300ms debounce, cancel previous fetch (race)
- A02 Keyboard tidak auto-muncul di `search_page.dart:46` (no `requestFocus`)
- A03 Card render 64×64 `storefront_rounded` `DEKATColors.primary 0.08` + chip kategori + `star_rounded` rating (`search_page.dart:51`)
- A04 Injection `q=barber' OR 1=1 --` → tidak dump semua jika bukan empty, param binding

---

## 3. PROVIDER PROFILE (`GET /public/providers/{slug}` etc)

### P
- P01 Detail by slug `barbershop-central` → 200 `name, rating, city, minPrice`
- P02 Services `GET /public/providers/{id}/services` → list harga `Mulai Rp`
- P03 Staff `.../staff` → list `Andi, Rudi`
- P04 Reviews `.../reviews` → paginated `rating, title, body`

### N
- N01 Slug typo `barbershop-central-typo` → 404
- N02 ID bukan UUID `.../providers/abc/services` → 400
- N03 Provider `isActive=false` / `suspended` → 404 atau 403 public

### E
- E01 Provider tanpa services/staff/reviews → 200 `data:[]` bukan 500
- E02 `minPrice=null` → UI `Mulai Rp -` atau hide
- E03 Rating 0, reviewCount 0 → `0.0 (0)`

### A
- A01 Slug `BARBERSHOP-CENTRAL` upper case → 404 atau redirect lower
- A02 ImageUrl broken `https://.../404.jpg` → placeholder
- A03 Deskripsi 5000 char HTML `<b><script>` → sanitize

---

## 4. AVAILABILITY (`GET /public/providers/{id}/availability`, `GET /availability`, `POST /availability/validate`)

### P
- P01 `GET .../availability?serviceId=...&staffId=...&date=2026-08-30` → 8 slots `09:00-17:00`
- P02 Grouped `Morning/Afternoon/Evening` `Wrap` chip (`availability_page.dart:39`)
- P03 Validate slot available → 200 `available:true`

### N
- N01 Tanggal lampau `date=2020-01-01` → 400 `Cannot hold slot in past`
- N02 `staffId` tidak milik provider → 400/404
- N03 Slot sudah dibooking → `available:false`, `createHold` → 409 `Time slot not available`

### E
- E01 `date` hari libur / `blocked-dates` → semua slot `available:false`
- E02 Slot 00:00 & 23:30 edge timezone `Asia/Jakarta` vs UTC → render benar (`startTime` ISO)
- E03 `Map` identity bug regression: `FutureProvider.family` dengan `Map` param loop 70ms → harus `String key '$providerId|$date'` (`availability_page.dart:11`)
- E04 Leap year `2026-02-29` (2026 bukan leap) → 400

### A
- A01 DST / pergantian jam (WIB tidak DST, tapi test WIB→WITA) tidak shift slot
- A02 Concurrent `createHold` 2 customer same slot same ms → 1 success 1 `IllegalStateException` 409, exclusion `tstzrange`
- A03 `http://` cleartext di Android 9 tanpa `usesCleartextTraffic=true` (`AndroidManifest.xml:4`) → `CLEARTEXT_NOT_PERMITTED` → fix

---

## 5. BOOKING (hold → confirm → lifecycle)

**Endpoints:** `POST /bookings/holds`, `POST /bookings`, `POST /public/bookings`, `POST /bookings/{id}/verify-pin`, `POST /bookings/{id}/cancel|confirm|reschedule|check-in|start|complete|no-show`, `GET /bookings/{id}`, `GET /bookings`

### Positif (P)
| ID | Flow | Expected |
|---|---|---|
| BK-P01 | `createHold` valid future 1h slot | 201 `HoldStatus.ACTIVE` `expiresAt = now+10m` (`BookingService.java:24`) |
| BK-P02 | `confirmBooking(holdId)` → `DKT-XXXXX` `status=CONFIRMED` `confirmationPin 6-digit` auto | 200 |
| BK-P03 | Guest `POST /public/bookings {customerEmail}` auto-create `PENDING_VERIFICATION` user | 201 |
| BK-P04 | `cancel CONFIRMED` → `CANCELLED` history `cancellationReason` | 200 |
| BK-P05 | Lifecycle `CONFIRMED → CHECKED_IN → IN_SERVICE → COMPLETED` | semua 200, `completedAt` set |
| BK-P06 | `verifyPin` benar → `pinVerified=true` + `CONFIRMED` | 200 |
| BK-P07 | `reschedule` dengan `expectedVersion` benar | 200 |
| BK-P08 | Idempotency `Idempotency-Key` same → return same `bookingCode` tanpa duplicate |

### Negatif (N)
| ID | Scenario | Expected (`Booking.java:134-184`) |
|---|---|---|
| BK-N01 | `createHold` `startsAt==null` atau `endsAt==null` | `IllegalArgumentException` 400 `Start and end times are required` |
| BK-N02 | `startsAt.isAfter(endsAt)` atau `equals` | 400 `Start time must be before end time` |
| BK-N03 | Slot di masa lalu | 400 `Cannot hold a slot in the past` |
| BK-N04 | Overlap booking `CONFIRMED/CHECKED_IN/IN_SERVICE` existing → `validateSlotAvailability` | 409 `Time slot not available` (`BookingService.java:324`) |
| BK-N05 | Hold expired `isExpired()=true` → `confirmBooking` | 409 `Hold has expired. Please create a new hold.` + `markExpired` |
| BK-N06 | Hold `CONVERTED/CANCELLED/EXPIRED` bukan `ACTIVE` | 409 `Hold is no longer active` |
| BK-N07 | Hold tidak ditemukan | 404 `NotFoundException` |
| BK-N08 | `cancel COMPLETED` | 409 `Cannot cancel a completed booking` |
| BK-N09 | `cancel CANCELLED` | 409 `Booking is already cancelled` |
| BK-N10 | `confirm` dari `CANCELLED/COMPLETED` | 409 `Cannot confirm booking in status: ...` |
| BK-N11 | `checkIn` tidak dari `CONFIRMED` | 409 |
| BK-N12 | `startService` tidak dari `CHECKED_IN/EN_ROUTE` | 409 |
| BK-N13 | `complete` tidak dari `IN_SERVICE` | 409 |
| BK-N14 | `noShow` tidak dari `CONFIRMED/CHECKED_IN` | 409 |
| BK-N15 | `reschedule` dari `COMPLETED/CANCELLED` | 409 |
| BK-N16 | `verifyPin` salah | 400 `Invalid PIN` |
| BK-N17 | `verifyPin` booking tanpa PIN | 400 `does not have a confirmation PIN` |
| BK-N18 | `reschedule` version mismatch `expectedVersion != actual` | 409 `IdempotencyException` concurrent |
| BK-N19 | `total` negatif `discount > subtotal` → `total = subtotal-discount+tax+fee` bisa 0/min | clamp |
| BK-N20 | `customerId=null` guest tanpa `customerEmail` | 400 |

### Edge (E)
| ID | Scenario |
|---|---|
| BK-E01 | `startsAt == endsAt.plusNanos(1)` 1ns duration → tetap 400 |
| BK-E02 | Hold 9m59s (hampir expired) confirm → success, 10m01s → expired |
| BK-E03 | Timezone `startsAt` `2026-08-30T10:00+07:00` vs `03:00Z` → simpan `OffsetDateTime` benar |
| BK-E04 | `generateBookingCode` collision 10 attempt → `RuntimeException Unable to generate` |
| BK-E05 | `customerId=null` confirm → skip `incrementBookingStats` (`BookingService.java:117`) |
| BK-E06 | `recalculateTotal` dengan `items=[]` → `total = 0 - discount + tax + fee` |
| BK-E07 | `bookingCode` lowercase `dkt-abc12` lookup → 404 (case sensitive) |
| BK-E08 | `GET /bookings/{id}` lazy load `items, assignments` → `size()` trigger (N+1 check) |

### Aneh (A) — critical untuk anti-double-booking
| ID | Scenario | Expected |
|---|---|---|
| BK-A01 | 10 concurrent `createHold` same slot same `staffId` via `ThreadLocalRandom` | 1 ACTIVE, 9 `409` via DB exclusion `tstzrange` |
| BK-A02 | Hold `staffId=null` + `resourceId` overlap → `findOverlappingHolds` tanpa filter staff → tetap 409 |
| BK-A03 | Reschedule ke slot yang sama dengan booking sendiri (self-overlap) → harus exclude `bookingId` sendiri, else false positive |
| BK-A04 | `OffsetDateTime.now()` flaky di test → gunakan `Clock` inject, bukan `now()` langsung |
| BK-A05 | Booking `policySnapshot JSON` 1MB payload → `JdbcTypeCode JSON` overflow → 400 |
| BK-A06 | PIN `000000` leading zero `String.format %06d` → tetap 6 digit, jangan int 0 |
| BK-A07 | Booking 100 years future `3026-01-01` → allow? should 400 `too far` |
| BK-A08 | Cancel lalu `releaseExpiredHolds` cron `60s` (`@Scheduled fixedRate 60000`) tidak resurrect CANCELLED |

---

## 6. PAYMENT (`POST /bookings/{id}/payment-intents`, `GET /payments/{id}`, `POST /webhooks/payments/{provider}`)

### P
- P01 `createPaymentIntent` `amount` INT sen `50000` → 201 `Midtrans`/`Xendit` mock
- P02 Webhook valid signature → update `Payment.status=PAID` + booking `PENDING_PAYMENT→CONFIRMED`
- P03 Idempotent webhook same eventId → 200 tanpa double credit

### N
- N01 Amount `0`, `-100`, `null` → 400
- N02 Currency mismatch `IDR` vs `USD` → 400
- N03 Webhook signature invalid → 401 `signature verification`
- N04 Booking `CANCELLED` bayar → 409
- N05 Double webhook race → ledger `BigDecimal vs Integer sen` mismatch (`AGENTS.md Payment BigDecimal→Integer`)

### E
- E01 Amount `1` sen (min) & `999999999` sen (max int) → handle
- E02 Gateway timeout → retry dengan `Idempotency-Key`
- E03 Refund sebagian `refund 50%` → ledger debit

### A
- A01 Webhook replay 1 jam kemudian → harus idempotent
- A02 `provider` path `../etc/passwd` traversal → 400
- A03 JSON webhook 10MB bomb → 413

---

## 7. CUSTOMER / ACCOUNT (`GET/PUT /customer/profile`)

### P
- P01 Get profile authenticated → 200
- P02 Update `name, phone, avatar` → 200
- P03 `hasProfile` guard `/profile/complete` → redirect jika false

### N
- N01 Without JWT → 401
- N02 Phone duplicate `0812...` milik user lain → 409 `handle duplicate phone` (`AGENTS.md`) bukan `Unknown error`
- N03 Phone `62 812-...` format salah → 400
- N04 `PUT` tanpa `name` kosong → 400

### E
- E01 Phone `0` leading `0812...` allow (`AGENTS.md`)
- E02 Hapus foto avatar `avatar=null` → 200
- E03 Concurrent `PUT` 2 device → last write wins + `@Version`

### A
- A01 Name `Robert'); DROP TABLE customers; --` → sanitize
- A02 Avatar URL `file:///etc/passwd` SSRF → reject hanya https
- A03 Phone `+62 812 3456 7890` whitespace → trim

---

## 8. PROMOTION (Coupon, Campaign, Loyalty) — `promotion` module

### P
- P01 Create coupon `code=HEMAT20 discount 20%` → 201
- P02 Validate `GET /public/bookings/validate-coupon?code=HEMAT20` → 200 valid
- P03 Loyalty earn `POST /provider/loyalty/earn {customerId, points}` → 200

### N
- N01 Coupon expired, usage limit reached, `INACTIVE` → 400 `invalid`
- N02 Campaign `activate` yang sudah `ACTIVE` → 409
- N03 Loyalty negative points → 400

### E
- E01 Coupon `minPurchase 100000` total `99999` → tidak apply
- E02 1000 concurrent redemption same coupon `limit 1` → 1 success 999 `limit exceeded` optimistic lock
- E03 Coupon code case `hemat20` vs `HEMAT20` → case-insensitive?

### A
- A01 Code `FREE$$$` unicode → validate `^[A-Z0-9-_]+$`
- A02 Loyalty overflow `Integer.MAX_VALUE` points → clamp BigDecimal

---

## 9. REVIEW (`POST /bookings/{id}/review`, `POST /reviews/{id}/report`, `GET /public/providers/{id}/reviews`)

### P
- P01 Create review `rating 5 title/body` setelah `COMPLETED` → 201
- P02 Provider respond `POST /provider/reviews/{id}/respond` → 200

### N
- N01 Review sebelum `COMPLETED` (mis `CONFIRMED`) → 403
- N02 Duplicate review same `bookingId` → 409
- N03 Rating `6`, `0`, `-1` → 400 `1-5`
- N04 Report review tanpa reason → 400

### E
- E01 Body 5000 char → 400 max
- E02 Rating `4.5` float → 400 must int
- E03 Provider review own business → 403

### A
- A01 Body `<script>alert(1)</script>` XSS → escape
- A02 Mass report 100 user same review → moderation queue

---

## 10. NOTIFICATION (`GET /notifications`, `PUT .../read`)

### P
- P01 List → 200 `id, channel, subject, read`
- P02 Mark `PUT /notifications/{id}/read` → 200
- P03 Unread count `GET /notifications/unread-count` → int

### N
- N01 Mark read `id` orang lain → 403/404
- N02 Device token invalid FCM → 400

### E
- E01 1000 notifikasi → pagination `?page&limit`
- E02 Mark `read-all` idempotent

### A
- A01 Kafka consumer lag → notification delay test via `NotificationProducer`

---

## 11. SUPPORT (`POST /support/cases`)

### P
- P01 Create case `subject, description, priority` → 201 `OPEN`
- P02 Admin `GET /admin/cases` → list, `PUT .../status RESOLVED` → 200

### N
- N01 Empty subject → 400
- N02 Take case `ASSIGNED` already → 409

### A
- A01 Attachment 50MB → 413

---

## 12. TENANT / BUSINESS (`/provider/tenant`, locations, verification)

### P
- P01 Create tenant `name, slug, category` → 201 `DRAFT`
- P02 Submit → `PENDING_REVIEW`, admin approve → `ACTIVE`

### N
- N01 Slug duplicate `barbershop-central` → 409
- N02 Approve tanpa `PENDING_REVIEW` → 409
- N03 Location tanpa `tenantId` → 400

### E
- E01 Slug `barber-central-` trailing hyphen → 400
- E02 Hapus tenant `ACTIVE` punya booking → 409

### A
- A01 Slug `../../../admin` path traversal → 400

---

## 13. STAFF & SCHEDULING

### P
- P01 Invite `POST /provider/staff {name, role}` → 201
- P02 Schedule `POST /provider/staff/{id}/schedule {day, start, end}` → 201

### N
- N01 Staff email duplicate tenant → 409
- N02 Schedule overlap same staff same day → 409

### E
- E01 Schedule `00:00-23:59` & `22:00-02:00` overnight → valid?

### A
- A01 `staffId` UUID hex tidak valid `zzzz...` → 400

---

## 14. CATALOG (Services, Variants, Addons)

### P
- P01 Create service `price 50000 duration 30` → 201
- P02 Publish/unpublish toggle → 200

### N
- N01 Price `-1000` → 400
- N02 Duration `0` → 400

### E
- E01 Price `0` gratis → allow? `Mulai Rp 0`
- E02 100 addons → pagination

---

## 15. BOOKING-PIN (weird spesifik DEKAT)

### P
- P01 Confirm generate `confirmationPin` `String.format %06d` → regex `^\d{6}$`
- P02 Verify correct → `pinVerified true`

### N
- N01 `000000` jangan dianggap `0` int
- N02 Brute force 10x salah → 429

### A
- A01 PIN `012345` leading zero hilang jika parse `int` → bug

---

## 16. SECURITY / CROSS-CUTTING

| ID | Test | Expected |
|---|---|---|
| SEC-P01 | JWT 15m expiry, refresh rotate | ok |
| SEC-N01 | CORS `Origin: http://evil.com` → block, only `localhost:4100,3001,3002,8081,4101,4102` (`WebConfig.java`) | 403 |
| SEC-A01 | `Idempotency-Key` header missing `POST /bookings` → 400 atau generate? | spec require header |
| SEC-A02 | `X-Forwarded-For` spoof | ignore, use `RemoteAddr` |

## 17. FRONTEND WEB (web_public/web_provider/web_admin Vitest)

- Render: `ProviderCard`, `ServiceCard`, `SlotPicker` `available:true/false` chip `AnimatedContainer`
- Error boundary: API 500 → `ErrorFallback` retry
- Auth: `localStorage auth_token`, `auth_user {role, hasProfile}` guard
- Aneh: `localStorage` quota exceeded, `JSON.parse` corrupt `auth_user` → fallback logout

## 18. FLUTTER (mobile_customer/partner `flutter_test`)

- `ProviderRow.fromJson` missing fields → defaults (sudah ada `rows_test.dart:34-59`)
- `formatRupiah(1000000) → Rp 1.000.000`, `0 → Rp 0`, `NaN`, `Infinity` → `Rp 0` atau error?
- `parsePaginated` empty `data` → `total` default list length
- `go_router` `context.push('/login')` vs `go` back behaviour (`AGENTS.md`)
- `SlotRow.available` `'yes'` string → `false` (`rows_test.dart:181`)
- Weird: `usesCleartextTraffic` missing → `SocketException`, offline → cache, `DateTime` `Asia/Jakarta` vs `UTC`

---

## Ringkasan Jumlah

| Kategori | Jumlah scenario |
|---|---|
| Positif | ~85 |
| Negatif | ~110 |
| Edge | ~70 |
| Aneh/Weird | ~65 |
| **Total** | **~330** |

> Implementasi: backend `api/src/test/java/id/dekat/**/*Test.java` (Mockito), web `src/lib/__tests__` + `components/__tests__` (Vitest), flutter `test/models|utils|router` (`flutter_test`), e2e `e2e/*.spec.ts` (Playwright). Prioritas: Booking lifecycle + Availability anti-overlap + Auth `BearerTokenResolver` adalah P0.

