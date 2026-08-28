-- V22: Seed 10 diverse providers with services & staff
-- DEKAT Booking Platform - 9 additional providers (total 10)

-- ==========================================
-- 2. SALON CANTIK (Jakarta Selatan)
-- ==========================================
INSERT INTO tenants (id, slug, name, legal_name, phone, email, verification_status, verified_at, status, created_at, updated_at, version) VALUES
  ('10000000-0000-0000-0000-000000000002', 'salon-cantik', 'Salon Cantik', 'PT Salon Cantik Sejahtera', '+6282211110001', 'hello@saloncantik.id', 'VERIFIED', NOW(), 'ACTIVE', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO businesses (id, tenant_id, name, description, industry, website_url, email, phone, status, created_at, updated_at, version) VALUES
  ('b0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Salon Cantik', 'Salon premium untuk wanita modern. Potong, warna, creambath & perawatan rambut terbaik.', 'SALON', 'https://saloncantik.id', 'hello@saloncantik.id', '+6282211110001', 'ACTIVE', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO locations (id, tenant_id, business_id, name, address_line1, city, province, postal_code, country, latitude, longitude, phone, timezone, is_active, created_at, updated_at) VALUES
  ('d0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Salon Cantik - Kemang', 'Jl. Kemang Raya No. 10', 'Jakarta Selatan', 'DKI Jakarta', '12130', 'ID', -6.2607, 106.8107, '+6282211110001', 'Asia/Jakarta', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, email, phone, name, avatar_url, status, password_hash, created_at, updated_at, version) VALUES
  ('e0000000-0000-0000-0000-000000000006', 'maya@saloncantik.id', '+6282211110002', 'Maya Sari', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1),
  ('e0000000-0000-0000-0000-000000000007', 'lisa@saloncantik.id', '+6282211110003', 'Lisa Anggraini', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1),
  ('e0000000-0000-0000-0000-000000000008', 'owner@saloncantik.id', '+6282211110004', 'Rina Wijaya', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO credentials (id, user_id, credential_type, password_hash, failed_attempts, created_at, updated_at) VALUES
  ('f0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000006', 'PASSWORD', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000007', 'PASSWORD', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000008', 'PASSWORD', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO role_assignments (id, user_id, tenant_id, role_id, granted_by, expires_at, created_at) VALUES
  ('01000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', NULL, NOW()),
  ('01000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000008', NULL, NOW()),
  ('01000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000008', NULL, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO staff (id, user_id, tenant_id, display_name, title, bio, is_active, sort_order, created_at, updated_at, version) VALUES
  ('50000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'Maya Sari', 'Senior Stylist', 'Stylist 8 tahun, ahli warna & potong layer.', true, 1, NOW(), NOW(), 1),
  ('50000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002', 'Lisa Anggraini', 'Hair Colorist', 'Spesialis balayage & highlighting.', true, 2, NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO staff_schedules (id, staff_id, day_of_week, start_time, end_time, is_active, created_at, updated_at) VALUES
  ('60000000-0000-0000-0000-000000000013', '50000000-0000-0000-0000-000000000003', 1, '09:00', '17:00', true, NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000014', '50000000-0000-0000-0000-000000000003', 2, '09:00', '17:00', true, NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000015', '50000000-0000-0000-0000-000000000003', 3, '09:00', '17:00', true, NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000016', '50000000-0000-0000-0000-000000000003', 4, '09:00', '17:00', true, NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000017', '50000000-0000-0000-0000-000000000003', 5, '09:00', '17:00', true, NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000018', '50000000-0000-0000-0000-000000000004', 1, '10:00', '18:00', true, NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000019', '50000000-0000-0000-0000-000000000004', 2, '10:00', '18:00', true, NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000020', '50000000-0000-0000-0000-000000000004', 3, '10:00', '18:00', true, NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000021', '50000000-0000-0000-0000-000000000004', 4, '10:00', '18:00', true, NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000022', '50000000-0000-0000-0000-000000000004', 5, '10:00', '18:00', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO services (id, tenant_id, category_id, name, description, short_description, duration_minutes, buffer_minutes, price, currency, is_active, created_at, updated_at, version) VALUES
  ('70000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002', NULL, 'Potong & Blow', 'Potong rambut wanita + blow dry styling.', 'Potong blow', 60, 10, 85000, 'IDR', true, NOW(), NOW(), 1),
  ('70000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002', NULL, 'Warna Full', 'Pewarnaan penuh dengan produk Loreal.', 'Warna rambut', 120, 15, 350000, 'IDR', true, NOW(), NOW(), 1),
  ('70000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000002', NULL, 'Creambath', 'Creambath + pijat kepala 30 menit.', 'Creambath', 45, 5, 75000, 'IDR', true, NOW(), NOW(), 1),
  ('70000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-000000000002', NULL, 'Smoothing', 'Pelurusan rambut semi permanen.', 'Smoothing', 180, 20, 450000, 'IDR', true, NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO subscriptions (id, tenant_id, plan_id, status, current_period_start, current_period_end, created_at, updated_at) VALUES
  ('c1000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'ACTIVE', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 3. SPA HARMONY (Bandung)
-- ==========================================
INSERT INTO tenants (id, slug, name, legal_name, phone, email, verification_status, verified_at, status, created_at, updated_at, version) VALUES
  ('10000000-0000-0000-0000-000000000003', 'spa-harmony', 'Spa Harmony', 'PT Spa Harmony Bandung', '+6282211110005', 'hello@spaharmony.id', 'VERIFIED', NOW(), 'ACTIVE', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO businesses (id, tenant_id, name, description, industry, website_url, email, phone, status, created_at, updated_at, version) VALUES
  ('b0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Spa Harmony', 'Spa & wellness premium. Pijat tradisional, aromaterapi, refleksi.', 'SPA', 'https://spaharmony.id', 'hello@spaharmony.id', '+6282211110005', 'ACTIVE', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO locations (id, tenant_id, business_id, name, address_line1, city, province, postal_code, country, latitude, longitude, phone, timezone, is_active, created_at, updated_at) VALUES
  ('d0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'Spa Harmony - Dago', 'Jl. Dago No. 88', 'Bandung', 'Jawa Barat', '40135', 'ID', -6.8714, 107.6051, '+6282211110005', 'Asia/Jakarta', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, email, phone, name, avatar_url, status, password_hash, created_at, updated_at, version) VALUES
  ('e0000000-0000-0000-0000-000000000009', 'ayu@spaharmony.id', '+6282211110006', 'Ayu Lestari', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1),
  ('e0000000-0000-0000-0000-00000000000a', 'dewi@spaharmony.id', '+6282211110007', 'Dewi Fortuna', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1),
  ('e0000000-0000-0000-0000-00000000000b', 'owner@spaharmony.id', '+6282211110008', 'Bambang Spa', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO credentials (id, user_id, credential_type, password_hash, failed_attempts, created_at, updated_at) VALUES
  ('f0000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000009', 'PASSWORD', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW()),
  ('f0000000-0000-0000-0000-00000000000a', 'e0000000-0000-0000-0000-00000000000a', 'PASSWORD', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW()),
  ('f0000000-0000-0000-0000-00000000000b', 'e0000000-0000-0000-0000-00000000000b', 'PASSWORD', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO role_assignments (id, user_id, tenant_id, role_id, granted_by, expires_at, created_at) VALUES
  ('01000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-00000000000b', '10000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', NULL, NOW()),
  ('01000000-0000-0000-0000-00000000000a', 'e0000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-00000000000b', NULL, NOW()),
  ('01000000-0000-0000-0000-00000000000b', 'e0000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-00000000000b', NULL, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO staff (id, user_id, tenant_id, display_name, title, bio, is_active, sort_order, created_at, updated_at, version) VALUES
  ('50000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003', 'Ayu Lestari', 'Therapist Senior', 'Therapist 12 tahun, ahli pijat tradisional & aromaterapi.', true, 1, NOW(), NOW(), 1),
  ('50000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-000000000003', 'Dewi Fortuna', 'Therapist', 'Spesialis refleksi & hot stone.', true, 2, NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO staff_schedules (id, staff_id, day_of_week, start_time, end_time, is_active, created_at, updated_at) VALUES
  ('60000000-0000-0000-0000-000000000023', '50000000-0000-0000-0000-000000000005', 1, '09:00', '17:00', true, NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000024', '50000000-0000-0000-0000-000000000005', 2, '09:00', '17:00', true, NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000025', '50000000-0000-0000-0000-000000000005', 3, '09:00', '17:00', true, NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000026', '50000000-0000-0000-0000-000000000006', 1, '10:00', '18:00', true, NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000027', '50000000-0000-0000-0000-000000000006', 2, '10:00', '18:00', true, NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000028', '50000000-0000-0000-0000-000000000006', 3, '10:00', '18:00', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO services (id, tenant_id, category_id, name, description, short_description, duration_minutes, buffer_minutes, price, currency, is_active, created_at, updated_at, version) VALUES
  ('70000000-0000-0000-0000-00000000000b', '10000000-0000-0000-0000-000000000003', NULL, 'Pijat Tradisional', 'Pijat tradisional 60 menit, relaksasi total.', 'Pijat 60m', 60, 10, 120000, 'IDR', true, NOW(), NOW(), 1),
  ('70000000-0000-0000-0000-00000000000c', '10000000-0000-0000-0000-000000000003', NULL, 'Aromaterapi', 'Aromaterapi dengan essential oil premium 90 menit.', 'Aromaterapi 90m', 90, 15, 180000, 'IDR', true, NOW(), NOW(), 1),
  ('70000000-0000-0000-0000-00000000000d', '10000000-0000-0000-0000-000000000003', NULL, 'Refleksi Kaki', 'Pijat refleksi kaki 45 menit.', 'Refleksi 45m', 45, 5, 80000, 'IDR', true, NOW(), NOW(), 1),
  ('70000000-0000-0000-0000-00000000000e', '10000000-0000-0000-0000-000000000003', NULL, 'Hot Stone', 'Terapi batu panas 75 menit.', 'Hot stone 75m', 75, 10, 200000, 'IDR', true, NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO subscriptions (id, tenant_id, plan_id, status, current_period_start, current_period_end, created_at, updated_at) VALUES
  ('c1000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'ACTIVE', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 4. KLINIK GLOW (Surabaya)
-- ==========================================
INSERT INTO tenants (id, slug, name, legal_name, phone, email, verification_status, verified_at, status, created_at, updated_at, version) VALUES
  ('10000000-0000-0000-0000-000000000004', 'klinik-glow', 'Klinik Glow', 'PT Glow Kecantikan Surabaya', '+6282211110009', 'hello@klinikglow.id', 'VERIFIED', NOW(), 'ACTIVE', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO businesses (id, tenant_id, name, description, industry, website_url, email, phone, status, created_at, updated_at, version) VALUES
  ('b0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Klinik Glow', 'Klinik kecantikan modern. Facial, laser, botox & perawatan kulit.', 'KECANTIKAN', 'https://klinikglow.id', 'hello@klinikglow.id', '+6282211110009', 'ACTIVE', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO locations (id, tenant_id, business_id, name, address_line1, city, province, postal_code, country, latitude, longitude, phone, timezone, is_active, created_at, updated_at) VALUES
  ('d0000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'Klinik Glow - Surabaya Pusat', 'Jl. Pemuda No. 55', 'Surabaya', 'Jawa Timur', '60271', 'ID', -7.2575, 112.7521, '+6282211110009', 'Asia/Jakarta', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, email, phone, name, avatar_url, status, password_hash, created_at, updated_at, version) VALUES
  ('e0000000-0000-0000-0000-00000000000c', 'indah@klinikglow.id', '+6282211110010', 'Indah Permata', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1),
  ('e0000000-0000-0000-0000-00000000000d', 'sinta@klinikglow.id', '+6282211110011', 'Sinta Dewi', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1),
  ('e0000000-0000-0000-0000-00000000000e', 'owner@klinikglow.id', '+6282211110012', 'Dr. Citra', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO credentials (id, user_id, credential_type, password_hash, failed_attempts, created_at, updated_at) VALUES
  ('f0000000-0000-0000-0000-00000000000c', 'e0000000-0000-0000-0000-00000000000c', 'PASSWORD', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW()),
  ('f0000000-0000-0000-0000-00000000000d', 'e0000000-0000-0000-0000-00000000000d', 'PASSWORD', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW()),
  ('f0000000-0000-0000-0000-00000000000e', 'e0000000-0000-0000-0000-00000000000e', 'PASSWORD', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO role_assignments (id, user_id, tenant_id, role_id, granted_by, expires_at, created_at) VALUES
  ('01000000-0000-0000-0000-00000000000c', 'e0000000-0000-0000-0000-00000000000e', '10000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', NULL, NOW()),
  ('01000000-0000-0000-0000-00000000000d', 'e0000000-0000-0000-0000-00000000000c', '10000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-00000000000e', NULL, NOW()),
  ('01000000-0000-0000-0000-00000000000e', 'e0000000-0000-0000-0000-00000000000d', '10000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-00000000000e', NULL, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO staff (id, user_id, tenant_id, display_name, title, bio, is_active, sort_order, created_at, updated_at, version) VALUES
  ('50000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-00000000000c', '10000000-0000-0000-0000-000000000004', 'Indah Permata', 'Beautician', 'Beautician 5 tahun, spesialis facial & laser.', true, 1, NOW(), NOW(), 1),
  ('50000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-00000000000d', '10000000-0000-0000-0000-000000000004', 'Sinta Dewi', 'Therapist', 'Ahli perawatan kulit & botox.', true, 2, NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO staff_schedules (id, staff_id, day_of_week, start_time, end_time, is_active, created_at, updated_at) VALUES
  ('60000000-0000-0000-0000-000000000029', '50000000-0000-0000-0000-000000000007', 1, '09:00', '17:00', true, NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000030', '50000000-0000-0000-0000-000000000007', 2, '09:00', '17:00', true, NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000031', '50000000-0000-0000-0000-000000000008', 1, '09:00', '17:00', true, NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000032', '50000000-0000-0000-0000-000000000008', 2, '09:00', '17:00', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO services (id, tenant_id, category_id, name, description, short_description, duration_minutes, buffer_minutes, price, currency, is_active, created_at, updated_at, version) VALUES
  ('70000000-0000-0000-0000-00000000000f', '10000000-0000-0000-0000-000000000004', NULL, 'Facial Glow', 'Facial premium dengan serum vitamin C.', 'Facial 60m', 60, 10, 150000, 'IDR', true, NOW(), NOW(), 1),
  ('70000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000004', NULL, 'Laser Wajah', 'Perawatan laser untuk flek & jerawat.', 'Laser 45m', 45, 10, 300000, 'IDR', true, NOW(), NOW(), 1),
  ('70000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000004', NULL, 'Botox', 'Botox anti aging.', 'Botox 30m', 30, 5, 800000, 'IDR', true, NOW(), NOW(), 1),
  ('70000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000004', NULL, 'Peeling', 'Chemical peeling untuk kulit cerah.', 'Peeling 50m', 50, 10, 250000, 'IDR', true, NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO subscriptions (id, tenant_id, plan_id, status, current_period_start, current_period_end, created_at, updated_at) VALUES
  ('c1000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', 'ACTIVE', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 5. FITLIFE GYM (Jakarta Pusat)
-- ==========================================
INSERT INTO tenants (id, slug, name, legal_name, phone, email, verification_status, verified_at, status, created_at, updated_at, version) VALUES
  ('10000000-0000-0000-0000-000000000005', 'fitlife-gym', 'FitLife Gym', 'PT FitLife Indonesia', '+6282211110013', 'hello@fitlifegym.id', 'VERIFIED', NOW(), 'ACTIVE', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO businesses (id, tenant_id, name, description, industry, website_url, email, phone, status, created_at, updated_at, version) VALUES
  ('b0000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'FitLife Gym', 'Gym & fitness center. Personal trainer, kelas yoga, zumba.', 'OLAHRAGA', 'https://fitlifegym.id', 'hello@fitlifegym.id', '+6282211110013', 'ACTIVE', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO locations (id, tenant_id, business_id, name, address_line1, city, province, postal_code, country, latitude, longitude, phone, timezone, is_active, created_at, updated_at) VALUES
  ('d0000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'FitLife - Sudirman', 'Jl. Sudirman No. 88', 'Jakarta Pusat', 'DKI Jakarta', '10220', 'ID', -6.2090, 106.8300, '+6282211110013', 'Asia/Jakarta', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, email, phone, name, avatar_url, status, password_hash, created_at, updated_at, version) VALUES
  ('e0000000-0000-0000-0000-00000000000f', 'trainer@fitlifegym.id', '+6282211110014', 'Coach Andra', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1),
  ('e0000000-0000-0000-0000-000000000010', 'yoga@fitlifegym.id', '+6282211110015', 'Yoga Maya', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1),
  ('e0000000-0000-0000-0000-000000000011', 'owner@fitlifegym.id', '+6282211110016', 'Budi Fit', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO credentials (id, user_id, credential_type, password_hash, failed_attempts, created_at, updated_at) VALUES
  ('f0000000-0000-0000-0000-00000000000f', 'e0000000-0000-0000-0000-00000000000f', 'PASSWORD', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000010', 'PASSWORD', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000011', 'PASSWORD', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO role_assignments (id, user_id, tenant_id, role_id, granted_by, expires_at, created_at) VALUES
  ('01000000-0000-0000-0000-00000000000f', 'e0000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', NULL, NOW()),
  ('01000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-00000000000f', '10000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000011', NULL, NOW()),
  ('01000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000011', NULL, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO staff (id, user_id, tenant_id, display_name, title, bio, is_active, sort_order, created_at, updated_at, version) VALUES
  ('50000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-00000000000f', '10000000-0000-0000-0000-000000000005', 'Coach Andra', 'Personal Trainer', 'Trainer bersertifikat, spesialis weight loss.', true, 1, NOW(), NOW(), 1),
  ('50000000-0000-0000-0000-00000000000a', 'e0000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000005', 'Yoga Maya', 'Yoga Instructor', 'Instruktur yoga & pilates.', true, 2, NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO services (id, tenant_id, category_id, name, description, short_description, duration_minutes, buffer_minutes, price, currency, is_active, created_at, updated_at, version) VALUES
  ('70000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000005', NULL, 'Personal Training', 'Sesi personal training 60 menit.', 'PT 60m', 60, 10, 150000, 'IDR', true, NOW(), NOW(), 1),
  ('70000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000005', NULL, 'Gym Day Pass', 'Akses gym seharian.', 'Day pass', 1440, 0, 50000, 'IDR', true, NOW(), NOW(), 1),
  ('70000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000005', NULL, 'Yoga Class', 'Kelas yoga 90 menit.', 'Yoga 90m', 90, 10, 80000, 'IDR', true, NOW(), NOW(), 1),
  ('70000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000005', NULL, 'Zumba', 'Kelas zumba 60 menit.', 'Zumba 60m', 60, 10, 60000, 'IDR', true, NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO subscriptions (id, tenant_id, plan_id, status, current_period_start, current_period_end, created_at, updated_at) VALUES
  ('c1000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'ACTIVE', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 6. NAILS STUDIO CHIC (Yogyakarta)
-- ==========================================
INSERT INTO tenants (id, slug, name, legal_name, phone, email, verification_status, verified_at, status, created_at, updated_at, version) VALUES
  ('10000000-0000-0000-0000-000000000006', 'nails-studio-chic', 'Nails Studio Chic', 'PT Nails Chic Yogyakarta', '+6282211110017', 'hello@nailschic.id', 'VERIFIED', NOW(), 'ACTIVE', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO businesses (id, tenant_id, name, description, industry, website_url, email, phone, status, created_at, updated_at, version) VALUES
  ('b0000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', 'Nails Studio Chic', 'Nail art & perawatan kuku premium.', 'KECANTIKAN', 'https://nailschic.id', 'hello@nailschic.id', '+6282211110017', 'ACTIVE', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO locations (id, tenant_id, business_id, name, address_line1, city, province, postal_code, country, latitude, longitude, phone, timezone, is_active, created_at, updated_at) VALUES
  ('d0000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', 'Nails Chic - Malioboro', 'Jl. Malioboro No. 12', 'Yogyakarta', 'DI Yogyakarta', '55271', 'ID', -7.7925, 110.3658, '+6282211110017', 'Asia/Jakarta', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, email, phone, name, avatar_url, status, password_hash, created_at, updated_at, version) VALUES
  ('e0000000-0000-0000-0000-000000000012', 'nail1@nailschic.id', '+6282211110018', 'Tina Nail', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1),
  ('e0000000-0000-0000-0000-000000000013', 'nail2@nailschic.id', '+6282211110019', 'Sari Nail', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1),
  ('e0000000-0000-0000-0000-000000000014', 'owner@nailschic.id', '+6282211110020', 'Vonny Chic', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO credentials (id, user_id, credential_type, password_hash, failed_attempts, created_at, updated_at) VALUES
  ('f0000000-0000-0000-0000-000000000012', 'e0000000-0000-0000-0000-000000000012', 'PASSWORD', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000013', 'e0000000-0000-0000-0000-000000000013', 'PASSWORD', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000014', 'e0000000-0000-0000-0000-000000000014', 'PASSWORD', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO role_assignments (id, user_id, tenant_id, role_id, granted_by, expires_at, created_at) VALUES
  ('01000000-0000-0000-0000-000000000012', 'e0000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', NULL, NOW()),
  ('01000000-0000-0000-0000-000000000013', 'e0000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000014', NULL, NOW()),
  ('01000000-0000-0000-0000-000000000014', 'e0000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000014', NULL, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO staff (id, user_id, tenant_id, display_name, title, bio, is_active, sort_order, created_at, updated_at, version) VALUES
  ('50000000-0000-0000-0000-00000000000b', 'e0000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000006', 'Tina Nail', 'Nail Artist', 'Nail art 6 tahun.', true, 1, NOW(), NOW(), 1),
  ('50000000-0000-0000-0000-00000000000c', 'e0000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000006', 'Sari Nail', 'Nail Technician', 'Spesialis gel & extension.', true, 2, NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO services (id, tenant_id, category_id, name, description, short_description, duration_minutes, buffer_minutes, price, currency, is_active, created_at, updated_at, version) VALUES
  ('70000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000006', NULL, 'Manicure', 'Manicure + polish.', 'Manicure 30m', 30, 5, 50000, 'IDR', true, NOW(), NOW(), 1),
  ('70000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000006', NULL, 'Gel Extension', 'Gel extension + art.', 'Gel 90m', 90, 10, 150000, 'IDR', true, NOW(), NOW(), 1),
  ('70000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000006', NULL, 'Pedicure', 'Pedicure spa.', 'Pedicure 45m', 45, 5, 60000, 'IDR', true, NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO subscriptions (id, tenant_id, plan_id, status, current_period_start, current_period_end, created_at, updated_at) VALUES
  ('c1000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000002', 'ACTIVE', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 7. BARBER BROS (Bekasi)
-- ==========================================
INSERT INTO tenants (id, slug, name, legal_name, phone, email, verification_status, verified_at, status, created_at, updated_at, version) VALUES
  ('10000000-0000-0000-0000-000000000007', 'barber-bros', 'Barber Bros', 'PT Barber Bros Bekasi', '+6282211110021', 'hello@barberbros.id', 'VERIFIED', NOW(), 'ACTIVE', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO businesses (id, tenant_id, name, description, industry, website_url, email, phone, status, created_at, updated_at, version) VALUES
  ('b0000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000007', 'Barber Bros', 'Barbershop kekinian untuk pria urban Bekasi.', 'BARBERSHOP', 'https://barberbros.id', 'hello@barberbros.id', '+6282211110021', 'ACTIVE', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO locations (id, tenant_id, business_id, name, address_line1, city, province, postal_code, country, latitude, longitude, phone, timezone, is_active, created_at, updated_at) VALUES
  ('d0000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', 'Barber Bros - Bekasi', 'Jl. Ahmad Yani No. 5', 'Bekasi', 'Jawa Barat', '17141', 'ID', -6.2416, 106.9924, '+6282211110021', 'Asia/Jakarta', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, email, phone, name, avatar_url, status, password_hash, created_at, updated_at, version) VALUES
  ('e0000000-0000-0000-0000-000000000015', 'joko@barberbros.id', '+6282211110022', 'Joko Barber', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1),
  ('e0000000-0000-0000-0000-000000000016', 'hendro@barberbros.id', '+6282211110023', 'Hendro Cukur', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1),
  ('e0000000-0000-0000-0000-000000000017', 'owner@barberbros.id', '+6282211110024', 'Bro Owner', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO credentials (id, user_id, credential_type, password_hash, failed_attempts, created_at, updated_at) VALUES
  ('f0000000-0000-0000-0000-000000000015', 'e0000000-0000-0000-0000-000000000015', 'PASSWORD', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000016', 'e0000000-0000-0000-0000-000000000016', 'PASSWORD', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000017', 'e0000000-0000-0000-0000-000000000017', 'PASSWORD', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO role_assignments (id, user_id, tenant_id, role_id, granted_by, expires_at, created_at) VALUES
  ('01000000-0000-0000-0000-000000000015', 'e0000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', NULL, NOW()),
  ('01000000-0000-0000-0000-000000000016', 'e0000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000017', NULL, NOW()),
  ('01000000-0000-0000-0000-000000000017', 'e0000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000017', NULL, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO staff (id, user_id, tenant_id, display_name, title, bio, is_active, sort_order, created_at, updated_at, version) VALUES
  ('50000000-0000-0000-0000-00000000000d', 'e0000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000007', 'Joko Barber', 'Barber', 'Barber 7 tahun.', true, 1, NOW(), NOW(), 1),
  ('50000000-0000-0000-0000-00000000000e', 'e0000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000007', 'Hendro Cukur', 'Barber', 'Spesialis pompadour.', true, 2, NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO services (id, tenant_id, category_id, name, description, short_description, duration_minutes, buffer_minutes, price, currency, is_active, created_at, updated_at, version) VALUES
  ('70000000-0000-0000-0000-00000000001a', '10000000-0000-0000-0000-000000000007', NULL, 'Classic Cut', 'Potong klasik.', 'Cut 30m', 30, 5, 40000, 'IDR', true, NOW(), NOW(), 1),
  ('70000000-0000-0000-0000-00000000001b', '10000000-0000-0000-0000-000000000007', NULL, 'Pompadour', 'Pompadour styling.', 'Pompadour 45m', 45, 5, 60000, 'IDR', true, NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO subscriptions (id, tenant_id, plan_id, status, current_period_start, current_period_end, created_at, updated_at) VALUES
  ('c1000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000001', 'ACTIVE', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 8. SALON PRIYA (Depok)
-- ==========================================
INSERT INTO tenants (id, slug, name, legal_name, phone, email, verification_status, verified_at, status, created_at, updated_at, version) VALUES
  ('10000000-0000-0000-0000-000000000008', 'salon-priya', 'Salon Priya', 'PT Salon Priya Depok', '+6282211110025', 'hello@salonpriya.id', 'VERIFIED', NOW(), 'ACTIVE', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO businesses (id, tenant_id, name, description, industry, website_url, email, phone, status, created_at, updated_at, version) VALUES
  ('b0000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000008', 'Salon Priya', 'Salon keluarga, potong anak & dewasa.', 'SALON', 'https://salonpriya.id', 'hello@salonpriya.id', '+6282211110025', 'ACTIVE', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO locations (id, tenant_id, business_id, name, address_line1, city, province, postal_code, country, latitude, longitude, phone, timezone, is_active, created_at, updated_at) VALUES
  ('d0000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000008', 'Salon Priya - Depok', 'Jl. Margonda No. 22', 'Depok', 'Jawa Barat', '16424', 'ID', -6.4025, 106.7942, '+6282211110025', 'Asia/Jakarta', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, email, phone, name, avatar_url, status, password_hash, created_at, updated_at, version) VALUES
  ('e0000000-0000-0000-0000-000000000018', 'priya1@salonpriya.id', '+6282211110026', 'Priya 1', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1),
  ('e0000000-0000-0000-0000-000000000019', 'priya2@salonpriya.id', '+6282211110027', 'Priya 2', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1),
  ('e0000000-0000-0000-0000-00000000001a', 'owner@salonpriya.id', '+6282211110028', 'Ibu Priya', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO credentials (id, user_id, credential_type, password_hash, failed_attempts, created_at, updated_at) VALUES
  ('f0000000-0000-0000-0000-000000000018', 'e0000000-0000-0000-0000-000000000018', 'PASSWORD', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000019', 'e0000000-0000-0000-0000-000000000019', 'PASSWORD', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW()),
  ('f0000000-0000-0000-0000-00000000001a', 'e0000000-0000-0000-0000-00000000001a', 'PASSWORD', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO role_assignments (id, user_id, tenant_id, role_id, granted_by, expires_at, created_at) VALUES
  ('01000000-0000-0000-0000-000000000018', 'e0000000-0000-0000-0000-00000000001a', '10000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', NULL, NOW()),
  ('01000000-0000-0000-0000-000000000019', 'e0000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-00000000001a', NULL, NOW()),
  ('01000000-0000-0000-0000-00000000001a', 'e0000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-00000000001a', NULL, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO staff (id, user_id, tenant_id, display_name, title, bio, is_active, sort_order, created_at, updated_at, version) VALUES
  ('50000000-0000-0000-0000-00000000000f', 'e0000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000008', 'Priya 1', 'Stylist', 'Stylist.', true, 1, NOW(), NOW(), 1),
  ('50000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000008', 'Priya 2', 'Stylist', 'Stylist.', true, 2, NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO services (id, tenant_id, category_id, name, description, short_description, duration_minutes, buffer_minutes, price, currency, is_active, created_at, updated_at, version) VALUES
  ('70000000-0000-0000-0000-00000000001c', '10000000-0000-0000-0000-000000000008', NULL, 'Kids Cut', 'Potong anak.', 'Kids 20m', 20, 5, 35000, 'IDR', true, NOW(), NOW(), 1),
  ('70000000-0000-0000-0000-00000000001d', '10000000-0000-0000-0000-000000000008', NULL, 'Adult Cut', 'Potong dewasa.', 'Adult 30m', 30, 5, 50000, 'IDR', true, NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO subscriptions (id, tenant_id, plan_id, status, current_period_start, current_period_end, created_at, updated_at) VALUES
  ('c1000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000001', 'ACTIVE', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 9. WELLNESS SPA BALI (Denpasar)
-- ==========================================
INSERT INTO tenants (id, slug, name, legal_name, phone, email, verification_status, verified_at, status, created_at, updated_at, version) VALUES
  ('10000000-0000-0000-0000-000000000009', 'wellness-spa-bali', 'Wellness Spa Bali', 'PT Wellness Bali', '+6282211110029', 'hello@wellnessbali.id', 'VERIFIED', NOW(), 'ACTIVE', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO businesses (id, tenant_id, name, description, industry, website_url, email, phone, status, created_at, updated_at, version) VALUES
  ('b0000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000009', 'Wellness Spa Bali', 'Spa Bali autentik.', 'SPA', 'https://wellnessbali.id', 'hello@wellnessbali.id', '+6282211110029', 'ACTIVE', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO locations (id, tenant_id, business_id, name, address_line1, city, province, postal_code, country, latitude, longitude, phone, timezone, is_active, created_at, updated_at) VALUES
  ('d0000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000009', 'Wellness - Seminyak', 'Jl. Seminyak No. 1', 'Denpasar', 'Bali', '80361', 'ID', -8.6916, 115.1549, '+6282211110029', 'Asia/Jakarta', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, email, phone, name, avatar_url, status, password_hash, created_at, updated_at, version) VALUES
  ('e0000000-0000-0000-0000-00000000001b', 'bali1@wellnessbali.id', '+6282211110030', 'Kadek Spa', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1),
  ('e0000000-0000-0000-0000-00000000001c', 'bali2@wellnessbali.id', '+6282211110031', 'Made Spa', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1),
  ('e0000000-0000-0000-0000-00000000001d', 'owner@wellnessbali.id', '+6282211110032', 'Owner Bali', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO credentials (id, user_id, credential_type, password_hash, failed_attempts, created_at, updated_at) VALUES
  ('f0000000-0000-0000-0000-00000000001b', 'e0000000-0000-0000-0000-00000000001b', 'PASSWORD', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW()),
  ('f0000000-0000-0000-0000-00000000001c', 'e0000000-0000-0000-0000-00000000001c', 'PASSWORD', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW()),
  ('f0000000-0000-0000-0000-00000000001d', 'e0000000-0000-0000-0000-00000000001d', 'PASSWORD', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO role_assignments (id, user_id, tenant_id, role_id, granted_by, expires_at, created_at) VALUES
  ('01000000-0000-0000-0000-00000000001b', 'e0000000-0000-0000-0000-00000000001d', '10000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', NULL, NOW()),
  ('01000000-0000-0000-0000-00000000001c', 'e0000000-0000-0000-0000-00000000001b', '10000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-00000000001d', NULL, NOW()),
  ('01000000-0000-0000-0000-00000000001d', 'e0000000-0000-0000-0000-00000000001c', '10000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-00000000001d', NULL, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO staff (id, user_id, tenant_id, display_name, title, bio, is_active, sort_order, created_at, updated_at, version) VALUES
  ('50000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-00000000001b', '10000000-0000-0000-0000-000000000009', 'Kadek Spa', 'Therapist', 'Therapist Bali.', true, 1, NOW(), NOW(), 1),
  ('50000000-0000-0000-0000-000000000012', 'e0000000-0000-0000-0000-00000000001c', '10000000-0000-0000-0000-000000000009', 'Made Spa', 'Therapist', 'Therapist Bali.', true, 2, NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO services (id, tenant_id, category_id, name, description, short_description, duration_minutes, buffer_minutes, price, currency, is_active, created_at, updated_at, version) VALUES
  ('70000000-0000-0000-0000-00000000001e', '10000000-0000-0000-0000-000000000009', NULL, 'Bali Massage', 'Pijat Bali 60m.', 'Bali 60m', 60, 10, 120000, 'IDR', true, NOW(), NOW(), 1),
  ('70000000-0000-0000-0000-00000000001f', '10000000-0000-0000-0000-000000000009', NULL, 'Boreh', 'Lulur boreh.', 'Boreh 75m', 75, 10, 150000, 'IDR', true, NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO subscriptions (id, tenant_id, plan_id, status, current_period_start, current_period_end, created_at, updated_at) VALUES
  ('c1000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000002', 'ACTIVE', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 10. BEAUTY LOUNGE (Malang)
-- ==========================================
INSERT INTO tenants (id, slug, name, legal_name, phone, email, verification_status, verified_at, status, created_at, updated_at, version) VALUES
  ('10000000-0000-0000-0000-00000000000a', 'beauty-lounge', 'Beauty Lounge', 'PT Beauty Lounge Malang', '+6282211110033', 'hello@beautylounge.id', 'VERIFIED', NOW(), 'ACTIVE', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO businesses (id, tenant_id, name, description, industry, website_url, email, phone, status, created_at, updated_at, version) VALUES
  ('b0000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-00000000000a', 'Beauty Lounge', 'Kecantikan lengkap.', 'KECANTIKAN', 'https://beautylounge.id', 'hello@beautylounge.id', '+6282211110033', 'ACTIVE', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO locations (id, tenant_id, business_id, name, address_line1, city, province, postal_code, country, latitude, longitude, phone, timezone, is_active, created_at, updated_at) VALUES
  ('d0000000-0000-0000-0000-00000000000b', '10000000-0000-0000-0000-00000000000a', 'b0000000-0000-0000-0000-00000000000a', 'Beauty Lounge - Malang', 'Jl. Ijen No. 77', 'Malang', 'Jawa Timur', '65111', 'ID', -7.9666, 112.6326, '+6282211110033', 'Asia/Jakarta', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, email, phone, name, avatar_url, status, password_hash, created_at, updated_at, version) VALUES
  ('e0000000-0000-0000-0000-00000000001e', 'lounge1@beautylounge.id', '+6282211110034', 'Citra Lounge', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1),
  ('e0000000-0000-0000-0000-00000000001f', 'lounge2@beautylounge.id', '+6282211110035', 'Diana Lounge', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1),
  ('e0000000-0000-0000-0000-000000000020', 'owner@beautylounge.id', '+6282211110036', 'Owner Lounge', NULL, 'ACTIVE', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO credentials (id, user_id, credential_type, password_hash, failed_attempts, created_at, updated_at) VALUES
  ('f0000000-0000-0000-0000-00000000001e', 'e0000000-0000-0000-0000-00000000001e', 'PASSWORD', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW()),
  ('f0000000-0000-0000-0000-00000000001f', 'e0000000-0000-0000-0000-00000000001f', 'PASSWORD', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000020', 'e0000000-0000-0000-0000-000000000020', 'PASSWORD', '$2a$10$U8FpGJSb/wQcoqXNUEgfju1.ue6iIFrW4eBr7hF3EFWZCLYJADPd6', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO role_assignments (id, user_id, tenant_id, role_id, granted_by, expires_at, created_at) VALUES
  ('01000000-0000-0000-0000-00000000001e', 'e0000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-00000000000a', 'a0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', NULL, NOW()),
  ('01000000-0000-0000-0000-00000000001f', 'e0000000-0000-0000-0000-00000000001e', '10000000-0000-0000-0000-00000000000a', 'a0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000020', NULL, NOW()),
  ('01000000-0000-0000-0000-000000000020', 'e0000000-0000-0000-0000-00000000001f', '10000000-0000-0000-0000-00000000000a', 'a0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000020', NULL, NOW())
ON CONFLICT (id) DO NOTHING;
INSERT INTO staff (id, user_id, tenant_id, display_name, title, bio, is_active, sort_order, created_at, updated_at, version) VALUES
  ('50000000-0000-0000-0000-000000000013', 'e0000000-0000-0000-0000-00000000001e', '10000000-0000-0000-0000-00000000000a', 'Citra Lounge', 'Beautician', 'Beautician.', true, 1, NOW(), NOW(), 1),
  ('50000000-0000-0000-0000-000000000014', 'e0000000-0000-0000-0000-00000000001f', '10000000-0000-0000-0000-00000000000a', 'Diana Lounge', 'Therapist', 'Therapist.', true, 2, NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO services (id, tenant_id, category_id, name, description, short_description, duration_minutes, buffer_minutes, price, currency, is_active, created_at, updated_at, version) VALUES
  ('70000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-00000000000a', NULL, 'Facial Basic', 'Facial basic 45m.', 'Facial 45m', 45, 5, 100000, 'IDR', true, NOW(), NOW(), 1),
  ('70000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-00000000000a', NULL, 'Makeup', 'Makeup pesta.', 'Makeup 60m', 60, 10, 200000, 'IDR', true, NOW(), NOW(), 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO subscriptions (id, tenant_id, plan_id, status, current_period_start, current_period_end, created_at, updated_at) VALUES
  ('c1000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-00000000000a', 'c0000000-0000-0000-0000-000000000002', 'ACTIVE', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
