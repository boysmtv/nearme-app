-- =============================================================================
-- V2: Identity & Access Management Tables
-- DEKAT Booking Platform
-- =============================================================================

-- ---------------------------------------------------------------------------
-- users: Core identity record
-- ---------------------------------------------------------------------------
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(320) NOT NULL,
    phone       VARCHAR(20),
    name        VARCHAR(255) NOT NULL,
    avatar_url  TEXT,
    status      VARCHAR(20) NOT NULL DEFAULT 'PENDING_VERIFICATION'
        CHECK (status IN ('ACTIVE','SUSPENDED','DEACTIVATED','PENDING_VERIFICATION')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    version     INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX uq_users_email ON users (LOWER(email));
CREATE UNIQUE INDEX uq_users_phone ON users (phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_users_status ON users (status);
CREATE INDEX idx_users_name_trgm ON users USING gin (name gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- user_identities: Social / OAuth provider links
-- ---------------------------------------------------------------------------
CREATE TABLE user_identities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider        VARCHAR(50) NOT NULL,  -- google, apple, facebook, etc.
    provider_uid    VARCHAR(255) NOT NULL,
    provider_email  VARCHAR(320),
    raw_profile     JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_user_identities_provider ON user_identities (provider, provider_uid);
CREATE INDEX idx_user_identities_user ON user_identities (user_id);

-- ---------------------------------------------------------------------------
-- credentials: Password / key material (separate from user for security)
-- ---------------------------------------------------------------------------
CREATE TABLE credentials (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credential_type VARCHAR(30) NOT NULL DEFAULT 'PASSWORD'
        CHECK (credential_type IN ('PASSWORD','PASSKEY','SSH_KEY')),
    password_hash   TEXT,
    public_key      TEXT,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until    TIMESTAMPTZ,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_credentials_user ON credentials (user_id);

-- ---------------------------------------------------------------------------
-- sessions: Active login sessions (JWT / refresh-token tracking)
-- ---------------------------------------------------------------------------
CREATE TABLE sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token   VARCHAR(512) NOT NULL,
    user_agent      TEXT,
    ip_address      INET,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_sessions_refresh_token ON sessions (refresh_token);
CREATE INDEX idx_sessions_user ON sessions (user_id);
CREATE INDEX idx_sessions_expires ON sessions (expires_at) WHERE revoked_at IS NULL;

-- ---------------------------------------------------------------------------
-- mfa_factors: TOTP / SMS / backup codes
-- ---------------------------------------------------------------------------
CREATE TABLE mfa_factors (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    factor_type     VARCHAR(20) NOT NULL CHECK (factor_type IN ('TOTP','SMS','BACKUP_CODES')),
    secret_enc      TEXT,           -- encrypted TOTP secret
    phone_number    VARCHAR(20),    -- for SMS factor
    enabled         BOOLEAN NOT NULL DEFAULT FALSE,
    last_used_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mfa_factors_user ON mfa_factors (user_id);

-- ---------------------------------------------------------------------------
-- otp_audit: One-time-password attempts (login, password-reset, verify)
-- ---------------------------------------------------------------------------
CREATE TABLE otp_audit (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    channel     VARCHAR(10) NOT NULL CHECK (channel IN ('EMAIL','SMS')),
    destination VARCHAR(320) NOT NULL,
    code_hash   TEXT NOT NULL,
    purpose     VARCHAR(30) NOT NULL CHECK (purpose IN ('LOGIN','PASSWORD_RESET','PHONE_VERIFY','EMAIL_VERIFY')),
    attempts    INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 5,
    expires_at  TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_otp_audit_user ON otp_audit (user_id);
CREATE INDEX idx_otp_audit_dest ON otp_audit (destination, purpose);
