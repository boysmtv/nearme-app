# ADR 002: JWT + Refresh Token Authentication

**Status:** Accepted
**Date:** 2026-08-22
**Deciders:** DEKAT Engineering Team

## Context

DEKAT supports multiple client types (Flutter mobile apps, React web apps) that need stateless authentication. The system must support:
- Short-lived access for API requests
- Long-lived sessions for mobile UX
- Role-based access control (customer, staff, provider owner, platform admin)
- Multi-tenant token scoping
- Token revocation for logout and security incidents

## Decision

We use **JWT access tokens + opaque refresh tokens** stored in Redis.

**Access Token:**
- Short-lived (15 minutes)
- Contains: `sub`, `tenantId`, `roles[]`, `permissions[]`, `iat`, `exp`
- Signed with RS256 (asymmetric key pair)
- Stateless verification at API gateway / resource server

**Refresh Token:**
- Long-lived (30 days, sliding window)
- Opaque UUID stored in Redis with TTL
- Bound to: user ID, tenant ID, device fingerprint, IP address
- Single-use rotation: each refresh invalidates the old token and issues a new pair
- Revocation list maintained in Redis for immediate invalidation

**Token Flow:**
```
Client -> POST /auth/login -> Access Token + Refresh Token
Client -> Authorization: Bearer <access_token>
Client -> POST /auth/refresh -> New Access Token + New Refresh Token
Client -> POST /auth/logout -> Refresh Token revoked
```

**Multi-tenant scoping:**
- `tenantId` is embedded in the JWT claims
- Refresh tokens are namespaced in Redis: `refresh:{userId}:{tenantId}:{deviceId}`
- Platform admins can impersonate tenants via a separate admin token

## Consequences

**Positive:**
- Stateless access token verification (no DB hit per request)
- Refresh token rotation limits window of stolen token abuse
- Redis-backed revocation enables immediate logout
- Device fingerprint binding prevents token theft across devices

**Negative:**
- JWT cannot be revoked before expiry (acceptable for 15-minute TTL)
- Redis dependency for refresh token storage
- Key rotation requires coordinated deployment

**Mitigations:**
- Short JWT TTL (15 min) limits exposure of stolen tokens
- Redis is already in the stack for caching
- RS256 key rotation is automated via Spring Security config

## Alternatives Considered

1. **Session-based auth:** Rejected because it requires sticky sessions or shared session store, and does not work well with stateless API design.
2. **Opaque access tokens:** Rejected because it requires a DB/cache lookup per request.
3. **OAuth2 with external provider (Auth0, Firebase):** Rejected to avoid vendor lock-in and reduce operational cost at current scale.
