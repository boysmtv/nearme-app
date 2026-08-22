-- =============================================================================
-- V3: Role-Based Access Control (RBAC)
-- DEKAT Booking Platform
-- =============================================================================

-- ---------------------------------------------------------------------------
-- roles: Named roles (SUPER_ADMIN, TENANT_OWNER, STAFF, CUSTOMER, etc.)
-- ---------------------------------------------------------------------------
CREATE TABLE roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    is_system   BOOLEAN NOT NULL DEFAULT FALSE,   -- system roles cannot be deleted
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_roles_name ON roles (LOWER(name));

-- ---------------------------------------------------------------------------
-- permissions: Granular permission atoms
-- ---------------------------------------------------------------------------
CREATE TABLE permissions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(150) NOT NULL,   -- e.g. booking:create, service:read
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_permissions_code ON permissions (LOWER(code));

-- ---------------------------------------------------------------------------
-- role_permissions: Many-to-many role <-> permission
-- ---------------------------------------------------------------------------
CREATE TABLE role_permissions (
    role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX idx_role_permissions_permission ON role_permissions (permission_id);

-- ---------------------------------------------------------------------------
-- role_assignments: Assign a role to a user, scoped to a tenant (nullable)
-- ---------------------------------------------------------------------------
CREATE TABLE role_assignments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id     UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    tenant_id   UUID,                            -- NULL = platform-level role
    granted_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at  TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_role_assignments_scope
    ON role_assignments (user_id, role_id, tenant_id);

CREATE INDEX idx_role_assignments_user ON role_assignments (user_id);
CREATE INDEX idx_role_assignments_tenant ON role_assignments (tenant_id) WHERE tenant_id IS NOT NULL;
