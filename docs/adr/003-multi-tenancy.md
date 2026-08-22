# ADR 003: Shared-Schema Multi-Tenancy

**Status:** Accepted
**Date:** 2026-08-22
**Deciders:** DEKAT Engineering Team

## Context

DEKAT is a multi-tenant platform where each provider (business) is a tenant. Tenants share the same database but their data must be isolated. The system must support:
- Data isolation between tenants
- Efficient querying without N+1 tenant filters
- Easy tenant onboarding (no per-tenant DB provisioning)
- Reasonable cost on a single VPS

## Decision

We use **shared-schema multi-tenancy** with a `tenant_id` column on all tenant-scoped tables and a Spring Modulith interceptor for automatic tenant filtering.

**Implementation:**
1. Every tenant-scoped entity has a `tenant_id UUID NOT NULL` column with a composite index `(tenant_id, id)` and appropriate unique constraints.
2. A Spring `TenantContext` (ThreadLocal) is set from the JWT `tenantId` claim at request entry.
3. A JPA `@Where` annotation or Hibernate filter automatically appends `WHERE tenant_id = :currentTenant` on all queries within a module.
4. A Flyway migration ensures `tenant_id` columns and indexes are created.
5. Cross-tenant queries (platform admin) bypass the filter via an explicit `@DisableTenantFilter` annotation.

**Data boundaries:**
| Table | Scoped | Notes |
|-------|--------|-------|
| `booking` | tenant | Bookings belong to a provider |
| `staff` | tenant | Staff belongs to a provider |
| `catalog_service` | tenant | Services listed by a provider |
| `payment` | tenant | Payments for a provider's bookings |
| `customer` | global | Customer profile shared across tenants |
| `customer_tenant` | tenant | Customer's relationship with a specific tenant |
| `subscription` | tenant | Provider's subscription to DEKAT |
| `platform_config` | global | System-wide configuration |
| `audit_log` | tenant | Audit trail per tenant |

**Naming convention:** `dekat_{module}_{entity}` with a `tenant_id` prefix in composite indexes.

## Consequences

**Positive:**
- Simple deployment (single database)
- No per-tenant DB provisioning overhead
- Efficient cross-tenant analytics for platform admin
- Low operational cost

**Negative:**
- Noisy-neighbor risk (one tenant's heavy queries can affect others)
- Backup/restore is all-or-nothing
- Schema migrations affect all tenants simultaneously
- Data isolation relies on application-level enforcement (not database-level)

**Mitigations:**
- PgBouncer connection pooling limits per-tenant connection usage
- Query timeouts enforced at the application level
- Row-level security (RLS) in PostgreSQL as a defense-in-depth layer
- Automated migration testing against a copy of production data
- Tenant-aware backup labeling for selective restore

## Alternatives Considered

1. **Database-per-tenant:** Rejected due to operational complexity on a single VPS and high provisioning cost.
2. **Schema-per-tenant:** Rejected because PostgreSQL schema management is complex and adds migration overhead.
3. **Row-level security only:** Considered as defense-in-depth but insufficient alone without application-level filtering.
