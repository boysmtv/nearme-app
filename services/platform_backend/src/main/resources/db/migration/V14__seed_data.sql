-- V14: Comprehensive seed data for DEKAT Booking Platform
-- WARNING: This migration is for development/staging only

-- ==========================================
-- 0. SCHEMA FIXES (must be before seed inserts)
-- ==========================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE users ADD COLUMN password_hash TEXT;
    END IF;
END $$;

-- ==========================================
-- 1. DEFAULT ROLES
-- ==========================================
INSERT INTO roles (id, name, description, is_system, created_at) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'ROLE_CUSTOMER', 'Customer role', true, NOW()),
  ('a0000000-0000-0000-0000-000000000002', 'ROLE_PROVIDER_OWNER', 'Provider business owner', true, NOW()),
  ('a0000000-0000-0000-0000-000000000003', 'ROLE_PROVIDER_MANAGER', 'Provider location manager', true, NOW()),
  ('a0000000-0000-0000-0000-000000000004', 'ROLE_PROVIDER_STAFF', 'Provider staff member', true, NOW()),
  ('a0000000-0000-0000-0000-000000000005', 'ROLE_PLATFORM_SUPPORT', 'Platform support agent', true, NOW()),
  ('a0000000-0000-0000-0000-000000000006', 'ROLE_PLATFORM_FINANCE', 'Platform finance team', true, NOW()),
  ('a0000000-0000-0000-0000-000000000007', 'ROLE_PLATFORM_CONTENT', 'Platform content manager', true, NOW()),
  ('a0000000-0000-0000-0000-000000000008', 'ROLE_PLATFORM_ADMIN', 'Platform administrator', true, NOW()),
  ('a0000000-0000-0000-0000-000000000009', 'ROLE_SUPER_ADMIN', 'Super admin (break-glass)', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 2. DEFAULT PERMISSIONS
-- ==========================================
INSERT INTO permissions (id, code, module, action, description) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'identity:register', 'identity', 'register', 'Register new account'),
  ('b0000001-0000-0000-0000-000000000002', 'identity:login', 'identity', 'login', 'Login to account'),
  ('b0000001-0000-0000-0000-000000000003', 'identity:manage_profile', 'identity', 'manage_profile', 'Manage own profile'),
  ('b0000001-0000-0000-0000-000000000004', 'identity:manage_sessions', 'identity', 'manage_sessions', 'Manage own sessions'),
  ('b0000002-0000-0000-0000-000000000001', 'tenant:create', 'tenant', 'create', 'Create business'),
  ('b0000002-0000-0000-0000-000000000002', 'tenant:read', 'tenant', 'read', 'View business'),
  ('b0000002-0000-0000-0000-000000000003', 'tenant:update', 'tenant', 'update', 'Update business'),
  ('b0000002-0000-0000-0000-000000000004', 'tenant:verify', 'tenant', 'verify', 'Verify business'),
  ('b0000003-0000-0000-0000-000000000001', 'catalog:create_service', 'catalog', 'create_service', 'Create service'),
  ('b0000003-0000-0000-0000-000000000002', 'catalog:read_service', 'catalog', 'read_service', 'View service'),
  ('b0000003-0000-0000-0000-000000000003', 'catalog:update_service', 'catalog', 'update_service', 'Update service'),
  ('b0000003-0000-0000-0000-000000000004', 'catalog:delete_service', 'catalog', 'delete_service', 'Delete service'),
  ('b0000004-0000-0000-0000-000000000001', 'staff:invite', 'staff', 'invite', 'Invite staff'),
  ('b0000004-0000-0000-0000-000000000002', 'staff:read', 'staff', 'read', 'View staff'),
  ('b0000004-0000-0000-0000-000000000003', 'staff:update', 'staff', 'update', 'Update staff'),
  ('b0000004-0000-0000-0000-000000000004', 'staff:deactivate', 'staff', 'deactivate', 'Deactivate staff'),
  ('b0000005-0000-0000-0000-000000000001', 'booking:create', 'booking', 'create', 'Create booking'),
  ('b0000005-0000-0000-0000-000000000002', 'booking:read', 'booking', 'read', 'View booking'),
  ('b0000005-0000-0000-0000-000000000003', 'booking:update', 'booking', 'update', 'Update booking'),
  ('b0000005-0000-0000-0000-000000000004', 'booking:cancel', 'booking', 'cancel', 'Cancel booking'),
  ('b0000005-0000-0000-0000-000000000005', 'booking:override', 'booking', 'override', 'Admin override booking'),
  ('b0000006-0000-0000-0000-000000000001', 'payment:create', 'payment', 'create', 'Create payment'),
  ('b0000006-0000-0000-0000-000000000002', 'payment:read', 'payment', 'read', 'View payment'),
  ('b0000006-0000-0000-0000-000000000003', 'payment:refund', 'payment', 'refund', 'Process refund'),
  ('b0000006-0000-0000-0000-000000000004', 'payment:settle', 'payment', 'settle', 'Process settlement'),
  ('b0000007-0000-0000-0000-000000000001', 'review:create', 'review', 'create', 'Create review'),
  ('b0000007-0000-0000-0000-000000000002', 'review:respond', 'review', 'respond', 'Respond to review'),
  ('b0000007-0000-0000-0000-000000000003', 'review:moderate', 'review', 'moderate', 'Moderate review'),
  ('b0000008-0000-0000-0000-000000000001', 'support:create_case', 'support', 'create_case', 'Create support case'),
  ('b0000008-0000-0000-0000-000000000002', 'support:read_case', 'support', 'read_case', 'View support case'),
  ('b0000008-0000-0000-0000-000000000003', 'support:resolve_case', 'support', 'resolve_case', 'Resolve support case'),
  ('b0000009-0000-0000-0000-000000000001', 'subscription:read', 'subscription', 'read', 'View subscription'),
  ('b0000009-0000-0000-0000-000000000002', 'subscription:change', 'subscription', 'change', 'Change plan'),
  ('b0000009-0000-0000-0000-000000000003', 'subscription:cancel', 'subscription', 'cancel', 'Cancel subscription'),
  ('b0000010-0000-0000-0000-000000000001', 'reporting:read', 'reporting', 'read', 'View reports'),
  ('b0000010-0000-0000-0000-000000000002', 'reporting:export', 'reporting', 'export', 'Export reports'),
  ('b0000011-0000-0000-0000-000000000001', 'audit:read', 'audit', 'read', 'View audit logs'),
  ('b0000012-0000-0000-0000-000000000001', 'platformconfig:read', 'platformconfig', 'read', 'View config'),
  ('b0000012-0000-0000-0000-000000000002', 'platformconfig:update', 'platformconfig', 'update', 'Update config'),
  ('b0000012-0000-0000-0000-000000000003', 'platformconfig:feature_flag', 'platformconfig', 'feature_flag', 'Manage feature flags'),
  ('b0000013-0000-0000-0000-000000000001', 'marketplace:search', 'marketplace', 'search', 'Search marketplace'),
  ('b0000013-0000-0000-0000-000000000002', 'marketplace:manage', 'marketplace', 'manage', 'Manage marketplace')
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 3. ROLE-PERMISSION MAPPINGS
-- ==========================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000000-0000-0000-0000-000000000001', id FROM permissions
WHERE (module = 'identity' AND action IN ('register', 'login', 'manage_profile', 'manage_sessions'))
   OR (module = 'booking' AND action IN ('create', 'read', 'update', 'cancel'))
   OR (module = 'payment' AND action IN ('create', 'read'))
   OR (module = 'review' AND action = 'create')
   OR (module = 'marketplace' AND action = 'search')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000000-0000-0000-0000-000000000002', id FROM permissions
WHERE module IN ('identity', 'tenant', 'catalog', 'staff', 'booking', 'payment', 'review', 'subscription', 'reporting')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000000-0000-0000-0000-000000000003', id FROM permissions
WHERE module IN ('catalog', 'staff', 'booking', 'payment', 'review', 'reporting')
AND action NOT IN ('override', 'refund', 'settle', 'feature_flag', 'update')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000000-0000-0000-0000-000000000004', id FROM permissions
WHERE (module = 'booking' AND action IN ('read', 'update'))
   OR (module = 'catalog' AND action = 'read_service')
   OR (module = 'staff' AND action = 'read')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000000-0000-0000-0000-000000000005', id FROM permissions
WHERE module IN ('booking', 'support', 'audit') AND action != 'override'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000000-0000-0000-0000-000000000006', id FROM permissions
WHERE module IN ('payment', 'subscription', 'reporting')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000000-0000-0000-0000-000000000008', id FROM permissions
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000000-0000-0000-0000-000000000009', id FROM permissions
ON CONFLICT DO NOTHING;

-- ==========================================
-- 4. DEFAULT SUBSCRIPTION PLANS
-- ==========================================
INSERT INTO plans (id, name, slug, price_amount, currency, billing_cycle, max_staff, max_bookings_per_month, features, status, created_at) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Free', 'free', 0, 'IDR', 'MONTHLY', 1, 30,
   '{"public_booking_page": true, "basic_catalog": true, "email_notifications": true, "basic_reports": true}',
   'ACTIVE', NOW()),
  ('c0000000-0000-0000-0000-000000000002', 'Pro', 'pro', 99000, 'IDR', 'MONTHLY', 5, 200,
   '{"public_booking_page": true, "full_catalog": true, "push_notifications": true, "deposit_collection": true, "basic_reports": true, "customer_reminders": true, "booking_link": true, "qr_code": true}',
   'ACTIVE', NOW()),
  ('c0000000-0000-0000-0000-000000000003', 'Business', 'business', 249000, 'IDR', 'MONTHLY', 20, 1000,
   '{"public_booking_page": true, "full_catalog": true, "push_notifications": true, "deposit_collection": true, "advanced_reports": true, "customer_reminders": true, "booking_link": true, "qr_code": true, "multi_location": true, "role_management": true, "promotions": true, "loyalty_program": true, "data_export": true, "priority_support": true}',
   'ACTIVE', NOW())
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 5. PLATFORM ADMIN USER
-- Password: admin123 (DEV ONLY)
-- ==========================================
INSERT INTO users (id, email, phone, name, avatar_url, status, password_hash, created_at, updated_at, version) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'admin@dekat.id', '+6281234567890', 'Platform Admin', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO credentials (id, user_id, credential_type, password_hash, failed_attempts, created_at, updated_at) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'PASSWORD',
   '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO role_assignments (id, user_id, tenant_id, role_id, granted_by, expires_at, created_at) VALUES
  ('01000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', NULL, 'a0000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000001', NULL, NOW())
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 6. SAMPLE TENANT (Barbershop Provider)
-- ==========================================
INSERT INTO tenants (id, slug, name, legal_name, phone, email, verification_status, verified_at, status, created_at, updated_at, version) VALUES
  ('10000000-0000-0000-0000-000000000001', 'barbershop-central', 'Barbershop Central', 'PT Barbershop Central Indonesia', '+6281298765432', 'hello@barbershopcentral.id', 'VERIFIED', NOW(), 'ACTIVE', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 7. SAMPLE BUSINESS
-- ==========================================
INSERT INTO businesses (id, tenant_id, name, description, industry, website_url, email, phone, status, created_at, updated_at, version) VALUES
  ('b0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Barbershop Central', 'Barbershop premium untuk pria modern. Potong rapi, gaya kekinian.', 'BARBERSHOP', 'https://barbershopcentral.id', 'hello@barbershopcentral.id', '+6281298765432', 'ACTIVE', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 8. SAMPLE LOCATIONS
-- ==========================================
INSERT INTO locations (id, tenant_id, business_id, name, address_line1, city, province, postal_code, country, latitude, longitude, phone, timezone, is_active, created_at, updated_at) VALUES
  ('d0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Central Jakarta', 'Jl. Sudirman No. 123, RT 01/RW 02', 'Jakarta Pusat', 'DKI Jakarta', '10220', 'ID', -6.2088, 106.8456, '+6281298765432', 'Asia/Jakarta', true, NOW(), NOW()),
  ('d0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'South Jakarta', 'Jl. TB Simatupang No. 456', 'Jakarta Selatan', 'DKI Jakarta', '12310', 'ID', -6.2934, 106.8240, '+6281298765433', 'Asia/Jakarta', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 9. PROVIDER OWNER USER
-- Password: provider123
-- ==========================================
INSERT INTO users (id, email, phone, name, avatar_url, status, password_hash, created_at, updated_at, version) VALUES
  ('e0000000-0000-0000-0000-000000000002', 'budi@barbershopcentral.id', '+6281211112222', 'Budi Santoso', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO credentials (id, user_id, credential_type, password_hash, failed_attempts, created_at, updated_at) VALUES
  ('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'PASSWORD',
   '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO role_assignments (id, user_id, tenant_id, role_id, granted_by, expires_at, created_at) VALUES
  ('01000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', NULL, NOW())
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 10. SAMPLE STAFF USERS
-- ==========================================
INSERT INTO users (id, email, phone, name, avatar_url, status, password_hash, created_at, updated_at, version) VALUES
  ('e0000000-0000-0000-0000-000000000003', 'andi@barbershopcentral.id', '+6281233334444', 'Andi Wijaya', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1),
  ('e0000000-0000-0000-0000-000000000004', 'rudi@barbershopcentral.id', '+6281255556666', 'Rudi Pratama', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO credentials (id, user_id, credential_type, password_hash, failed_attempts, created_at, updated_at) VALUES
  ('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'PASSWORD',
   '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004', 'PASSWORD',
   '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO role_assignments (id, user_id, tenant_id, role_id, granted_by, expires_at, created_at) VALUES
  ('01000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000002', NULL, NOW()),
  ('01000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000002', NULL, NOW())
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 11. SAMPLE STAFF PROFILES
-- ==========================================
INSERT INTO staff (id, user_id, tenant_id, display_name, title, bio, is_active, sort_order, created_at, updated_at, version) VALUES
  ('50000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Andi Wijaya', 'Senior Barber', 'Barber berpengalaman 10 tahun. Spesialis potong rapi dan gaya klasik.', true, 1, NOW(), NOW(), 1),
  ('50000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Rudi Pratama', 'Barber', 'Barber muda kreatif. Jago fade dan undercut kekinian.', true, 2, NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 12. STAFF SCHEDULES (Senin - Sabtu)
-- ==========================================
INSERT INTO staff_schedules (id, staff_id, day_of_week, start_time, end_time, is_active, created_at, updated_at) VALUES
  -- Andi: Senin-Sabtu 09:00-17:00
  ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 1, '09:00', '17:00', true, NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 2, '09:00', '17:00', true, NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001', 3, '09:00', '17:00', true, NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000001', 4, '09:00', '17:00', true, NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000001', 5, '09:00', '17:00', true, NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000006', '50000000-0000-0000-0000-000000000001', 6, '09:00', '15:00', true, NOW(), NOW()),
  -- Rudi: Senin-Sabtu 10:00-18:00
  ('60000000-0000-0000-0000-000000000007', '50000000-0000-0000-0000-000000000002', 1, '10:00', '18:00', true, NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000008', '50000000-0000-0000-0000-000000000002', 2, '10:00', '18:00', true, NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000009', '50000000-0000-0000-0000-000000000002', 3, '10:00', '18:00', true, NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000010', '50000000-0000-0000-0000-000000000002', 4, '10:00', '18:00', true, NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000011', '50000000-0000-0000-0000-000000000002', 5, '10:00', '18:00', true, NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000012', '50000000-0000-0000-0000-000000000002', 6, '10:00', '16:00', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 13. SAMPLE SERVICES
-- ==========================================
INSERT INTO services (id, tenant_id, category_id, name, description, short_description, duration_minutes, buffer_minutes, price, currency, is_active, created_at, updated_at, version) VALUES
  ('70000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', NULL, 'Potong Rapi', 'Potong rambut pria dengan presisi tinggi. Konsultasi gaya gratis.', 'Potong rambut pria', 30, 5, 45000, 'IDR', true, NOW(), NOW(), 1),
  ('70000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', NULL, 'Fade Master', 'Potong rambut fade/styles kekinian. Termasuk styling.', 'Fade & styling', 45, 5, 65000, 'IDR', true, NOW(), NOW(), 1),
  ('70000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', NULL, 'Potong + Cukur', 'Paket komplit: potong rambut + cukur jenggot + handuk panas.', 'Potong + cukur', 60, 10, 85000, 'IDR', true, NOW(), NOW(), 1),
  ('70000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', NULL, 'Hair Coloring', 'Pewarnaan rambut pria dengan produk premium.', 'Pewarnaan rambut', 90, 15, 150000, 'IDR', true, NOW(), NOW(), 1),
  ('70000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', NULL, 'Cukur Jenggot', 'Cukur jenggot rapi dengan pisau cukur premium.', 'Cukur jenggot', 20, 5, 30000, 'IDR', true, NOW(), NOW(), 1),
  ('70000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', NULL, 'Hair Spa', 'Perawatan rambut pria: creambath + massage kepala.', 'Hair spa pria', 45, 10, 75000, 'IDR', true, NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 14. SERVICE VARIANTS
-- ==========================================
INSERT INTO service_variants (id, service_id, name, description, duration_minutes, price, currency, sort_order, is_active, created_at, updated_at) VALUES
  ('80000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'Standar', 'Potong rambut standar', 30, 45000, 'IDR', 1, true, NOW(), NOW()),
  ('80000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000001', 'Express', 'Potong cepat tanpa konsultasi', 20, 35000, 'IDR', 2, true, NOW(), NOW()),
  ('80000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000002', 'Classic Fade', 'Fade klasik', 45, 65000, 'IDR', 1, true, NOW(), NOW()),
  ('80000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000002', 'Skin Fade', 'Fade tipis sampai kulit', 50, 75000, 'IDR', 2, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 15. CUSTOMER USER
-- Password: customer123
-- ==========================================
INSERT INTO users (id, email, phone, name, avatar_url, status, password_hash, created_at, updated_at, version) VALUES
  ('e0000000-0000-0000-0000-000000000005', 'siti@gmail.com', '+6281277778888', 'Siti Rahayu', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO credentials (id, user_id, credential_type, password_hash, failed_attempts, created_at, updated_at) VALUES
  ('f0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000005', 'PASSWORD',
   '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO role_assignments (id, user_id, tenant_id, role_id, granted_by, expires_at, created_at) VALUES
  ('01000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000005', NULL, 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', NULL, NOW())
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 16. CUSTOMER PROFILE
-- ==========================================
INSERT INTO customer_profiles (id, user_id, tenant_id, nickname, notes, loyalty_points, total_bookings, total_spent, last_booking_at, created_at, updated_at, version) VALUES
  ('90000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'Siti', 'Suka potongan fade', 150, 3, 210000, NOW() - INTERVAL '7 days', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 17. TENANT SUBSCRIPTION (Pro plan)
-- ==========================================
INSERT INTO subscriptions (id, tenant_id, plan_id, status, current_period_start, current_period_end, created_at, updated_at) VALUES
  ('c1000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'ACTIVE', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 18. SAMPLE BOOKINGS
-- ==========================================
INSERT INTO bookings (id, tenant_id, location_id, customer_id, booking_code, status, service_mode, starts_at, ends_at, timezone, currency, subtotal, discount, tax, fee, deposit, total, source, version, created_at, confirmed_at, completed_at) VALUES
  ('a0000001-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', 'DKT-001', 'COMPLETED', 'IN_PERSON', NOW() - INTERVAL '7 days' + TIME '10:00', NOW() - INTERVAL '7 days' + TIME '10:30', 'Asia/Jakarta', 'IDR', 45000, 0, 0, 0, 0, 45000, 'MOBILE', 1, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + TIME '10:30'),
  ('a0000001-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', 'DKT-002', 'COMPLETED', 'IN_PERSON', NOW() - INTERVAL '14 days' + TIME '14:00', NOW() - INTERVAL '14 days' + TIME '14:45', 'Asia/Jakarta', 'IDR', 65000, 0, 0, 0, 0, 65000, 'WEB', 1, NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days' + TIME '14:45'),
  ('a0000001-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', '90000000-0000-0000-0000-000000000001', 'DKT-003', 'COMPLETED', 'IN_PERSON', NOW() - INTERVAL '3 days' + TIME '11:00', NOW() - INTERVAL '3 days' + TIME '11:30', 'Asia/Jakarta', 'IDR', 100000, 15000, 0, 0, 0, 85000, 'MOBILE', 1, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + TIME '11:30'),
  ('a0000001-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', 'DKT-004', 'CONFIRMED', 'IN_PERSON', CURRENT_DATE + INTERVAL '1 day' + TIME '10:00', CURRENT_DATE + INTERVAL '1 day' + TIME '10:45', 'Asia/Jakarta', 'IDR', 65000, 0, 0, 0, 0, 65000, 'MOBILE', 1, NOW(), NOW(), NULL)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 19. NOTIFICATION TEMPLATES
-- ==========================================
INSERT INTO notification_templates (id, event_type, channel, locale, version, subject_template, body_template, variables, status, created_at) VALUES
  ('10000000-0000-0000-0000-000000000001', 'BOOKING_CONFIRMED', 'EMAIL', 'id_ID', 1,
   'Booking {{booking_code}} Dikonfirmasi',
   'Halo {{customer_name}}, booking Anda {{booking_code}} untuk {{service_name}} pada {{date}} jam {{time}} telah dikonfirmasi.',
   '{"booking_code": "string", "customer_name": "string", "service_name": "string", "date": "string", "time": "string"}',
   'ACTIVE', NOW()),
  ('10000000-0000-0000-0000-000000000002', 'BOOKING_REMINDER_24H', 'PUSH', 'id_ID', 1,
   'Pengingat Booking',
   'Booking {{booking_code}} Anda akan dilakukan besok jam {{time}}. Jangan lupa ya!',
   '{"booking_code": "string", "time": "string"}',
   'ACTIVE', NOW()),
  ('10000000-0000-0000-0000-000000000003', 'BOOKING_REMINDER_2H', 'PUSH', 'id_ID', 1,
   'Booking dalam 2 Jam',
   'Booking {{booking_code}} Anda akan dimulai dalam 2 jam. Siap-siap ya!',
   '{"booking_code": "string"}',
   'ACTIVE', NOW()),
  ('10000000-0000-0000-0000-000000000004', 'BOOKING_CANCELLED', 'EMAIL', 'id_ID', 1,
   'Booking {{booking_code}} Dibatalkan',
   'Halo {{customer_name}}, booking {{booking_code}} telah dibatalkan. {{reason}}',
   '{"booking_code": "string", "customer_name": "string", "reason": "string"}',
   'ACTIVE', NOW()),
  ('10000000-0000-0000-0000-000000000005', 'PAYMENT_RECEIPT', 'EMAIL', 'id_ID', 1,
   'Bukti Pembayaran {{booking_code}}',
   'Pembayaran untuk booking {{booking_code}} sebesar {{amount}} telah diterima. Terima kasih!',
   '{"booking_code": "string", "amount": "string"}',
   'ACTIVE', NOW()),
  ('10000000-0000-0000-0000-000000000006', 'BOOKING_COMPLETED', 'EMAIL', 'id_ID', 1,
   'Booking {{booking_code}} Selesai',
   'Halo {{customer_name}}, booking {{booking_code}} telah selesai. Berikan penilaian Anda ya!',
   '{"booking_code": "string", "customer_name": "string"}',
   'ACTIVE', NOW())
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 20. FEATURE FLAGS
-- ==========================================
INSERT INTO feature_flags (id, name, description, enabled, target_environment, target_tenant_id, percentage, owner_id, expires_at, created_at) VALUES
  ('20000000-0000-0000-0000-000000000001', 'marketplace_enabled', 'Enable marketplace discovery', true, 'PRODUCTION', NULL, 100, 'e0000000-0000-0000-0000-000000000001', NULL, NOW()),
  ('20000000-0000-0000-0000-000000000002', 'whatsapp_reminders', 'Enable WhatsApp reminders', false, 'PRODUCTION', NULL, 0, 'e0000000-0000-0000-0000-000000000001', NULL, NOW()),
  ('20000000-0000-0000-0000-000000000003', 'loyalty_program', 'Enable loyalty points', false, 'PRODUCTION', NULL, 0, 'e0000000-0000-0000-0000-000000000001', NULL, NOW())
ON CONFLICT (id) DO NOTHING;



