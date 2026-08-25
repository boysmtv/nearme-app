-- V15: Align bookings.status CHECK with application state machine + seed categories

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE bookings ADD CONSTRAINT bookings_status_check CHECK (status IN (
    'DRAFT','PENDING','HELD','PENDING_PAYMENT','PENDING_APPROVAL','CONFIRMED',
    'CHECKED_IN','EN_ROUTE','IN_PROGRESS','IN_SERVICE','COMPLETED',
    'CANCELLED','NO_SHOW','REFUNDED','EXPIRED','DISPUTED','RESOLVED'
));

INSERT INTO categories (id, tenant_id, name, description, sort_order, is_active, created_at, updated_at) VALUES
    ('c1000000-0000-0000-0000-000000000001', (SELECT id FROM tenants ORDER BY created_at LIMIT 1), 'Barbershop', 'Potong rambut pria dan perawatan', 1, TRUE, now(), now()),
    ('c1000000-0000-0000-0000-000000000002', (SELECT id FROM tenants ORDER BY created_at LIMIT 1), 'Salon', 'Potong dan styling rambut', 2, TRUE, now(), now()),
    ('c1000000-0000-0000-0000-000000000003', (SELECT id FROM tenants ORDER BY created_at LIMIT 1), 'Spa & Massage', 'Relaksasi dan perawatan tubuh', 3, TRUE, now(), now()),
    ('c1000000-0000-0000-0000-000000000004', (SELECT id FROM tenants ORDER BY created_at LIMIT 1), 'Kecantikan', 'Perawatan kecantikan', 4, TRUE, now(), now()),
    ('c1000000-0000-0000-0000-000000000005', (SELECT id FROM tenants ORDER BY created_at LIMIT 1), 'Kesehatan', 'Layanan kesehatan', 5, TRUE, now(), now()),
    ('c1000000-0000-0000-0000-000000000006', (SELECT id FROM tenants ORDER BY created_at LIMIT 1), 'Olahraga', 'Layanan olahraga dan fitness', 6, TRUE, now(), now())
ON CONFLICT (id) DO NOTHING;

UPDATE services SET category_id = 'c1000000-0000-0000-0000-000000000001'
WHERE category_id IS NULL AND tenant_id = (SELECT id FROM tenants ORDER BY created_at LIMIT 1);
