-- V14: Seed data for DEKAT Booking Platform
-- WARNING: This migration is for development/staging only

-- ==========================================
-- DEFAULT ROLES
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
-- DEFAULT PERMISSIONS
-- ==========================================
INSERT INTO permissions (id, module, action, description) VALUES
  -- Identity
  ('b0000001-0000-0000-0000-000000000001', 'identity', 'register', 'Register new account'),
  ('b0000001-0000-0000-0000-000000000002', 'identity', 'login', 'Login to account'),
  ('b0000001-0000-0000-0000-000000000003', 'identity', 'manage_profile', 'Manage own profile'),
  ('b0000001-0000-0000-0000-000000000004', 'identity', 'manage_sessions', 'Manage own sessions'),
  -- Tenant
  ('b0000002-0000-0000-0000-000000000001', 'tenant', 'create', 'Create business'),
  ('b0000002-0000-0000-0000-000000000002', 'tenant', 'read', 'View business'),
  ('b0000002-0000-0000-0000-000000000003', 'tenant', 'update', 'Update business'),
  ('b0000002-0000-0000-0000-000000000004', 'tenant', 'verify', 'Verify business'),
  -- Catalog
  ('b0000003-0000-0000-0000-000000000001', 'catalog', 'create_service', 'Create service'),
  ('b0000003-0000-0000-0000-000000000002', 'catalog', 'read_service', 'View service'),
  ('b0000003-0000-0000-0000-000000000003', 'catalog', 'update_service', 'Update service'),
  ('b0000003-0000-0000-0000-000000000004', 'catalog', 'delete_service', 'Delete service'),
  -- Staff
  ('b0000004-0000-0000-0000-000000000001', 'staff', 'invite', 'Invite staff'),
  ('b0000004-0000-0000-0000-000000000002', 'staff', 'read', 'View staff'),
  ('b0000004-0000-0000-0000-000000000003', 'staff', 'update', 'Update staff'),
  ('b0000004-0000-0000-0000-000000000004', 'staff', 'deactivate', 'Deactivate staff'),
  -- Booking
  ('b0000005-0000-0000-0000-000000000001', 'booking', 'create', 'Create booking'),
  ('b0000005-0000-0000-0000-000000000002', 'booking', 'read', 'View booking'),
  ('b0000005-0000-0000-0000-000000000003', 'booking', 'update', 'Update booking'),
  ('b0000005-0000-0000-0000-000000000004', 'booking', 'cancel', 'Cancel booking'),
  ('b0000005-0000-0000-0000-000000000005', 'booking', 'override', 'Admin override booking'),
  -- Payment
  ('b0000006-0000-0000-0000-000000000001', 'payment', 'create', 'Create payment'),
  ('b0000006-0000-0000-0000-000000000002', 'payment', 'read', 'View payment'),
  ('b0000006-0000-0000-0000-000000000003', 'payment', 'refund', 'Process refund'),
  ('b0000006-0000-0000-0000-000000000004', 'payment', 'settle', 'Process settlement'),
  -- Review
  ('b0000007-0000-0000-0000-000000000001', 'review', 'create', 'Create review'),
  ('b0000007-0000-0000-0000-000000000002', 'review', 'respond', 'Respond to review'),
  ('b0000007-0000-0000-0000-000000000003', 'review', 'moderate', 'Moderate review'),
  -- Support
  ('b0000008-0000-0000-0000-000000000001', 'support', 'create_case', 'Create support case'),
  ('b0000008-0000-0000-0000-000000000002', 'support', 'read_case', 'View support case'),
  ('b0000008-0000-0000-0000-000000000003', 'support', 'resolve_case', 'Resolve support case'),
  -- Subscription
  ('b0000009-0000-0000-0000-000000000001', 'subscription', 'read', 'View subscription'),
  ('b0000009-0000-0000-0000-000000000002', 'subscription', 'change', 'Change plan'),
  ('b0000009-0000-0000-0000-000000000003', 'subscription', 'cancel', 'Cancel subscription'),
  -- Reporting
  ('b0000010-0000-0000-0000-000000000001', 'reporting', 'read', 'View reports'),
  ('b0000010-0000-0000-0000-000000000002', 'reporting', 'export', 'Export reports'),
  -- Audit
  ('b0000011-0000-0000-0000-000000000001', 'audit', 'read', 'View audit logs'),
  -- Platform Config
  ('b0000012-0000-0000-0000-000000000001', 'platformconfig', 'read', 'View config'),
  ('b0000012-0000-0000-0000-000000000002', 'platformconfig', 'update', 'Update config'),
  ('b0000012-0000-0000-0000-000000000003', 'platformconfig', 'feature_flag', 'Manage feature flags'),
  -- Marketplace
  ('b0000013-0000-0000-0000-000000000001', 'marketplace', 'search', 'Search marketplace'),
  ('b0000013-0000-0000-0000-000000000002', 'marketplace', 'manage', 'Manage marketplace')
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- ROLE-PERMISSION MAPPINGS
-- ==========================================
-- Customer permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000000-0000-0000-0000-000000000001', id FROM permissions
WHERE module IN ('identity') AND action IN ('register', 'login', 'manage_profile', 'manage_sessions')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000000-0000-0000-0000-000000000001', id FROM permissions
WHERE module IN ('booking') AND action IN ('create', 'read', 'update', 'cancel')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000000-0000-0000-0000-000000000001', id FROM permissions
WHERE module IN ('payment') AND action IN ('create', 'read')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000000-0000-0000-0000-000000000001', id FROM permissions
WHERE module IN ('review') AND action IN ('create')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000000-0000-0000-0000-000000000001', id FROM permissions
WHERE module IN ('marketplace') AND action IN ('search')
ON CONFLICT DO NOTHING;

-- Provider Owner permissions (all provider permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000000-0000-0000-0000-000000000002', id FROM permissions
WHERE module IN ('identity', 'tenant', 'catalog', 'staff', 'booking', 'payment', 'review', 'subscription', 'reporting')
ON CONFLICT DO NOTHING;

-- Provider Manager permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000000-0000-0000-0000-000000000003', id FROM permissions
WHERE module IN ('catalog', 'staff', 'booking', 'payment', 'review', 'reporting')
AND action NOT IN ('override', 'refund', 'settle', 'feature_flag', 'update')
ON CONFLICT DO NOTHING;

-- Provider Staff permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000000-0000-0000-0000-000000000004', id FROM permissions
WHERE (module = 'booking' AND action IN ('read', 'update'))
   OR (module = 'catalog' AND action IN ('read_service'))
   OR (module = 'staff' AND action IN ('read'))
ON CONFLICT DO NOTHING;

-- Platform Support permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000000-0000-0000-0000-000000000005', id FROM permissions
WHERE module IN ('booking', 'support', 'audit')
AND action NOT IN ('override')
ON CONFLICT DO NOTHING;

-- Platform Finance permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000000-0000-0000-0000-000000000006', id FROM permissions
WHERE module IN ('payment', 'subscription', 'reporting')
ON CONFLICT DO NOTHING;

-- Platform Admin permissions (all)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000000-0000-0000-0000-000000000008', id FROM permissions
ON CONFLICT DO NOTHING;

-- Super Admin (all permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000000-0000-0000-0000-000000000009', id FROM permissions
ON CONFLICT DO NOTHING;

-- ==========================================
-- DEFAULT SUBSCRIPTION PLANS
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
-- DEFAULT SERVICE CATEGORIES
-- ==========================================
INSERT INTO categories (id, parent_id, name, slug, icon_url, sort_order, status, created_at) VALUES
  ('d0000000-0000-0000-0000-000000000001', NULL, 'Barbershop', 'barbershop', '/icons/barbershop.svg', 1, 'ACTIVE', NOW()),
  ('d0000000-0000-0000-0000-000000000002', NULL, 'Salon', 'salon', '/icons/salon.svg', 2, 'ACTIVE', NOW()),
  ('d0000000-0000-0000-0000-000000000003', NULL, 'Beauty Treatment', 'beauty-treatment', '/icons/beauty.svg', 3, 'ACTIVE', NOW()),
  ('d0000000-0000-0000-0000-000000000004', NULL, 'Spa', 'spa', '/icons/spa.svg', 4, 'ACTIVE', NOW()),
  ('d0000000-0000-0000-0000-000000000005', NULL, 'Massage', 'massage', '/icons/massage.svg', 5, 'ACTIVE', NOW()),
  ('d0000000-0000-0000-0000-000000000006', NULL, 'Fitness', 'fitness', '/icons/fitness.svg', 6, 'ACTIVE', NOW())
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- DEFAULT PLATFORM ADMIN USER
-- Password: admin123 (DEV ONLY - must be changed in production)
-- Argon2id hash of 'admin123'
-- ==========================================
INSERT INTO users (id, email, phone, name, avatar_url, status, created_at, updated_at, version) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'admin@dekat.id', '+6281234567890', 'Platform Admin', NULL, 'ACTIVE', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO credentials (id, user_id, credential_type, password_hash, created_at, last_used_at) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'PASSWORD',
   '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$somerhashhere', NOW(), NULL)
ON CONFLICT (id) DO NOTHING;

-- Assign Platform Admin role to admin user
INSERT INTO role_assignments (id, user_id, tenant_id, role_id, location_id, assigned_by, expires_at, created_at) VALUES
  ('00000001-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', NULL, 'a0000000-0000-0000-0000-000000000008', NULL, 'e0000000-0000-0000-0000-000000000001', NULL, NOW())
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- DEFAULT NOTIFICATION TEMPLATES
-- ==========================================
INSERT INTO notification_templates (id, event_type, channel, locale, version, subject_template, body_template, variables, status, created_at) VALUES
  ('10000000-0000-0000-0000-000000000001', 'BOOKING_CONFIRMED', 'EMAIL', 'id-ID', 1,
   'Booking {{booking_code}} Dikonfirmasi',
   'Halo {{customer_name}}, booking Anda {{booking_code}} untuk {{service_name}} pada {{date}} jam {{time}} telah dikonfirmasi.',
   '{"booking_code": "string", "customer_name": "string", "service_name": "string", "date": "string", "time": "string"}',
   'ACTIVE', NOW()),
  ('10000000-0000-0000-0000-000000000002', 'BOOKING_REMINDER_24H', 'PUSH', 'id-ID', 1,
   'Pengingat Booking',
   'Booking {{booking_code}} Anda akan dilakukan besok jam {{time}}. Jangan lupa ya!',
   '{"booking_code": "string", "time": "string"}',
   'ACTIVE', NOW()),
  ('10000000-0000-0000-0000-000000000003', 'BOOKING_REMINDER_2H', 'PUSH', 'id-ID', 1,
   'Booking dalam 2 Jam',
   'Booking {{booking_code}} Anda akan dimulai dalam 2 jam. Siap-siap ya!',
   '{"booking_code": "string"}',
   'ACTIVE', NOW()),
  ('10000000-0000-0000-0000-000000000004', 'BOOKING_CANCELLED', 'EMAIL', 'id-ID', 1,
   'Booking {{booking_code}} Dibatalkan',
   'Halo {{customer_name}}, booking {{booking_code}} telah dibatalkan. {{reason}}',
   '{"booking_code": "string", "customer_name": "string", "reason": "string"}',
   'ACTIVE', NOW()),
  ('10000000-0000-0000-0000-000000000005', 'PAYMENT_RECEIPT', 'EMAIL', 'id-ID', 1,
   'Bukti Pembayaran {{booking_code}}',
   'Pembayaran untuk booking {{booking_code}} sebesar {{amount}} telah diterima. Terima kasih!',
   '{"booking_code": "string", "amount": "string"}',
   'ACTIVE', NOW()),
  ('10000000-0000-0000-0000-000000000006', 'BOOKING_COMPLETED', 'EMAIL', 'id-ID', 1,
   'Booking {{booking_code}} Selesai',
   'Halo {{customer_name}}, booking {{booking_code}} telah selesai. Berikan penilaian Anda ya!',
   '{"booking_code": "string", "customer_name": "string"}',
   'ACTIVE', NOW())
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- DEFAULT FEATURE FLAGS
-- ==========================================
INSERT INTO feature_flags (id, name, description, enabled, target_environment, target_tenant_id, percentage, owner_id, expires_at, created_at) VALUES
  ('20000000-0000-0000-0000-000000000001', 'marketplace_enabled', 'Enable marketplace discovery', true, 'production', NULL, 100, 'e0000000-0000-0000-0000-000000000001', NULL, NOW()),
  ('20000000-0000-0000-0000-000000000002', 'whatsapp_reminders', 'Enable WhatsApp reminders', false, 'production', NULL, 0, 'e0000000-0000-0000-0000-000000000001', NULL, NOW()),
  ('20000000-0000-0000-0000-000000000003', 'loyalty_program', 'Enable loyalty points', false, 'production', NULL, 0, 'e0000000-0000-0000-0000-000000000001', NULL, NOW())
ON CONFLICT (id) DO NOTHING;
