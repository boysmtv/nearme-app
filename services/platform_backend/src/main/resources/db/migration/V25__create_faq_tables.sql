-- V25: FAQ & Policies tables
-- Bundle B - Task 10

CREATE TABLE IF NOT EXISTS faqs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID REFERENCES tenants(id) ON DELETE CASCADE,
    question    TEXT NOT NULL,
    answer      TEXT NOT NULL,
    category    VARCHAR(64),
    sort_order  INT NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_faqs_tenant ON faqs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_faqs_active ON faqs(is_active);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);

CREATE TABLE IF NOT EXISTS policies (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID REFERENCES tenants(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    body        TEXT NOT NULL,
    type        VARCHAR(64) NOT NULL,
    version     INT NOT NULL DEFAULT 1,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_policies_tenant ON policies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_policies_type ON policies(type);
CREATE INDEX IF NOT EXISTS idx_policies_active ON policies(is_active);

-- seed platform-global FAQs
INSERT INTO faqs (id, tenant_id, question, answer, category, sort_order, is_active) VALUES
  ('f1000000-0000-0000-0000-000000000001', NULL, 'Bagaimana cara booking layanan?', 'Pilih provider, layanan, staf, dan slot waktu tersedia, lalu isi data kontak dan konfirmasi. Anda akan menerima kode booking DKT-* dan PIN 6-digit.', 'booking', 1, true),
  ('f1000000-0000-0000-0000-000000000002', NULL, 'Apakah bisa reschedule booking?', 'Ya, setiap booking dapat di-reschedule gratis 1 kali. Reschedule berikutnya akan dikenakan biaya atau ditolak tergantung kebijakan provider.', 'booking', 2, true),
  ('f1000000-0000-0000-0000-000000000003', NULL, 'Bagaimana kebijakan pembatalan & deposit?', 'Pembatalan sebelum batas waktu (H-24) mendapat refund penuh. Setelah deadline deposit hangus (no refund). Deposit diperlukan untuk layanan tertentu dan dibayar saat booking.', 'pembayaran', 3, true),
  ('f1000000-0000-0000-0000-000000000004', NULL, 'Bagaimana cara menambahkan ke kalender?', 'Setelah booking, klik "Add to Calendar" untuk download file .ics atau buka link Google Calendar di halaman detail booking.', 'kalender', 4, true),
  ('f1000000-0000-0000-0000-000000000005', NULL, 'Apakah data saya aman?', 'DEKAT menggunakan JWT, OTP/MFA, dan enkripsi BCrypt. Data tidak dibagikan tanpa persetujuan.', 'keamanan', 5, true)
ON CONFLICT (id) DO NOTHING;

-- seed platform policies
INSERT INTO policies (id, tenant_id, title, body, type, version, is_active) VALUES
  ('p1000000-0000-0000-0000-000000000001', NULL, 'Kebijakan Pembatalan', 'Pembatalan sebelum 24 jam sebelum jadwal mendapat refund 100%. Setelah itu no refund. Reschedule gratis 1x.', 'cancellation', 1, true),
  ('p1000000-0000-0000-0000-000000000002', NULL, 'Kebijakan Privasi', 'Kami menjaga privasi data pelanggan dan provider sesuai UU PDP. Data hanya digunakan untuk layanan booking.', 'privacy', 1, true),
  ('p1000000-0000-0000-0000-000000000003', NULL, 'Syarat & Ketentuan', 'Dengan menggunakan DEKAT Anda menyetujui syarat penggunaan platform, tanggung jawab provider, dan proses sengketa.', 'terms', 1, true)
ON CONFLICT (id) DO NOTHING;
