-- Add owner_id to tenants table for provider registration ownership
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS owner_id UUID;

-- Add admin chat endpoints (no schema change needed, just API)
-- Index for faster owner lookups
CREATE INDEX IF NOT EXISTS idx_tenants_owner_id ON tenants(owner_id);
