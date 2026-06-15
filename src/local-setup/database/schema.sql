-- =====================================================
-- SCHEMA DATABASE APLIKASI PEGAWAI TELADAN
-- Inspektorat Jenderal - PostgreSQL Version
-- =====================================================

-- Drop existing tables if exists
DROP TABLE IF EXISTS vote_phase2 CASCADE;
DROP TABLE IF EXISTS vote_phase1 CASCADE;
DROP TABLE IF EXISTS pegawai CASCADE;
DROP TABLE IF EXISTS kandidat CASCADE;
DROP TABLE IF EXISTS app_config CASCADE;

-- =====================================================
-- TABLE: app_config
-- Menyimpan konfigurasi aplikasi
-- =====================================================
CREATE TABLE app_config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default config
INSERT INTO app_config (key, value) VALUES 
    ('current_phase', '1'),
    ('initialized', 'true'),
    ('bagian', '["Bagian Sekretariat", "Bagian Inspektorat Wilayah I", "Bagian Inspektorat Wilayah II", "Bagian Inspektorat Wilayah III", "Bagian Inspektorat Wilayah IV", "Bagian Inspektorat Wilayah V"]'::jsonb);

-- =====================================================
-- TABLE: pegawai
-- Menyimpan data pegawai yang terdaftar
-- =====================================================
CREATE TABLE pegawai (
    nip VARCHAR(50) PRIMARY KEY,
    nama VARCHAR(200) NOT NULL,
    bagian VARCHAR(100) NOT NULL,
    unique_key VARCHAR(100) UNIQUE NOT NULL,
    has_voted_phase1 BOOLEAN DEFAULT FALSE,
    has_voted_phase2 BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk performa
CREATE INDEX idx_pegawai_bagian ON pegawai(bagian);
CREATE INDEX idx_pegawai_unique_key ON pegawai(unique_key);

-- =====================================================
-- TABLE: kandidat
-- Menyimpan data kandidat pegawai teladan
-- =====================================================
CREATE TABLE kandidat (
    id SERIAL PRIMARY KEY,
    nip VARCHAR(50) UNIQUE NOT NULL,
    nama VARCHAR(200) NOT NULL,
    bagian VARCHAR(100) NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk performa
CREATE INDEX idx_kandidat_bagian ON kandidat(bagian);
CREATE INDEX idx_kandidat_nip ON kandidat(nip);

-- Constraint: maksimal 5 kandidat per bagian
CREATE OR REPLACE FUNCTION check_max_kandidat_per_bagian()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM kandidat WHERE bagian = NEW.bagian) >= 5 THEN
        RAISE EXCEPTION 'Setiap bagian maksimal 5 kandidat';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_max_kandidat
BEFORE INSERT ON kandidat
FOR EACH ROW
EXECUTE FUNCTION check_max_kandidat_per_bagian();

-- =====================================================
-- TABLE: vote_phase1
-- Menyimpan data voting tahap 1 (star rating)
-- =====================================================
CREATE TABLE vote_phase1 (
    id SERIAL PRIMARY KEY,
    nip VARCHAR(50) REFERENCES pegawai(nip) ON DELETE CASCADE,
    bagian VARCHAR(100) NOT NULL,
    kandidat_nip VARCHAR(50) REFERENCES kandidat(nip) ON DELETE CASCADE,
    berorientasi_pelayanan INTEGER CHECK (berorientasi_pelayanan BETWEEN 1 AND 5),
    akuntabel INTEGER CHECK (akuntabel BETWEEN 1 AND 5),
    kompeten INTEGER CHECK (kompeten BETWEEN 1 AND 5),
    harmonis INTEGER CHECK (harmonis BETWEEN 1 AND 5),
    loyal INTEGER CHECK (loyal BETWEEN 1 AND 5),
    adaptif INTEGER CHECK (adaptif BETWEEN 1 AND 5),
    kolaboratif INTEGER CHECK (kolaboratif BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(nip, kandidat_nip)
);

-- Index untuk performa
CREATE INDEX idx_vote_phase1_nip ON vote_phase1(nip);
CREATE INDEX idx_vote_phase1_kandidat ON vote_phase1(kandidat_nip);
CREATE INDEX idx_vote_phase1_bagian ON vote_phase1(bagian);

-- =====================================================
-- TABLE: vote_phase2
-- Menyimpan data voting tahap 2 (pilih 1 kandidat per kriteria)
-- =====================================================
CREATE TABLE vote_phase2 (
    id SERIAL PRIMARY KEY,
    nip VARCHAR(50) REFERENCES pegawai(nip) ON DELETE CASCADE,
    berorientasi_pelayanan VARCHAR(50) REFERENCES kandidat(nip),
    akuntabel VARCHAR(50) REFERENCES kandidat(nip),
    kompeten VARCHAR(50) REFERENCES kandidat(nip),
    harmonis VARCHAR(50) REFERENCES kandidat(nip),
    loyal VARCHAR(50) REFERENCES kandidat(nip),
    adaptif VARCHAR(50) REFERENCES kandidat(nip),
    kolaboratif VARCHAR(50) REFERENCES kandidat(nip),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(nip)
);

-- Index untuk performa
CREATE INDEX idx_vote_phase2_nip ON vote_phase2(nip);

-- =====================================================
-- VIEWS untuk hasil voting
-- =====================================================

-- View: Hasil voting Phase 1 per kandidat
CREATE OR REPLACE VIEW view_phase1_results AS
SELECT 
    k.nip,
    k.nama,
    k.bagian,
    k.photo_url,
    COUNT(DISTINCT v.nip) as total_voters,
    COALESCE(SUM(v.berorientasi_pelayanan), 0) as total_berorientasi_pelayanan,
    COALESCE(SUM(v.akuntabel), 0) as total_akuntabel,
    COALESCE(SUM(v.kompeten), 0) as total_kompeten,
    COALESCE(SUM(v.harmonis), 0) as total_harmonis,
    COALESCE(SUM(v.loyal), 0) as total_loyal,
    COALESCE(SUM(v.adaptif), 0) as total_adaptif,
    COALESCE(SUM(v.kolaboratif), 0) as total_kolaboratif,
    COALESCE(SUM(
        v.berorientasi_pelayanan + 
        v.akuntabel + 
        v.kompeten + 
        v.harmonis + 
        v.loyal + 
        v.adaptif + 
        v.kolaboratif
    ), 0) as total_score
FROM kandidat k
LEFT JOIN vote_phase1 v ON k.nip = v.kandidat_nip
GROUP BY k.nip, k.nama, k.bagian, k.photo_url;

-- View: Pemenang Phase 1 per bagian
CREATE OR REPLACE VIEW view_phase1_winners AS
WITH ranked_candidates AS (
    SELECT 
        *,
        ROW_NUMBER() OVER (PARTITION BY bagian ORDER BY total_score DESC, total_voters DESC) as rank
    FROM view_phase1_results
)
SELECT * FROM ranked_candidates WHERE rank = 1;

-- View: Hasil voting Phase 2 per kandidat per kriteria
CREATE OR REPLACE VIEW view_phase2_results AS
SELECT 
    k.nip,
    k.nama,
    k.bagian,
    k.photo_url,
    COALESCE(SUM(CASE WHEN v.berorientasi_pelayanan = k.nip THEN 1 ELSE 0 END), 0) as votes_berorientasi_pelayanan,
    COALESCE(SUM(CASE WHEN v.akuntabel = k.nip THEN 1 ELSE 0 END), 0) as votes_akuntabel,
    COALESCE(SUM(CASE WHEN v.kompeten = k.nip THEN 1 ELSE 0 END), 0) as votes_kompeten,
    COALESCE(SUM(CASE WHEN v.harmonis = k.nip THEN 1 ELSE 0 END), 0) as votes_harmonis,
    COALESCE(SUM(CASE WHEN v.loyal = k.nip THEN 1 ELSE 0 END), 0) as votes_loyal,
    COALESCE(SUM(CASE WHEN v.adaptif = k.nip THEN 1 ELSE 0 END), 0) as votes_adaptif,
    COALESCE(SUM(CASE WHEN v.kolaboratif = k.nip THEN 1 ELSE 0 END), 0) as votes_kolaboratif,
    COALESCE(
        SUM(CASE WHEN v.berorientasi_pelayanan = k.nip THEN 1 ELSE 0 END) +
        SUM(CASE WHEN v.akuntabel = k.nip THEN 1 ELSE 0 END) +
        SUM(CASE WHEN v.kompeten = k.nip THEN 1 ELSE 0 END) +
        SUM(CASE WHEN v.harmonis = k.nip THEN 1 ELSE 0 END) +
        SUM(CASE WHEN v.loyal = k.nip THEN 1 ELSE 0 END) +
        SUM(CASE WHEN v.adaptif = k.nip THEN 1 ELSE 0 END) +
        SUM(CASE WHEN v.kolaboratif = k.nip THEN 1 ELSE 0 END), 0
    ) as total_votes
FROM kandidat k
LEFT JOIN vote_phase2 v ON 
    k.nip IN (v.berorientasi_pelayanan, v.akuntabel, v.kompeten, v.harmonis, v.loyal, v.adaptif, v.kolaboratif)
GROUP BY k.nip, k.nama, k.bagian, k.photo_url;

-- =====================================================
-- FUNCTIONS untuk operasi database
-- =====================================================

-- Function: Update timestamp otomatis
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-update updated_at
CREATE TRIGGER update_pegawai_updated_at BEFORE UPDATE ON pegawai
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kandidat_updated_at BEFORE UPDATE ON kandidat
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_config_updated_at BEFORE UPDATE ON app_config
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (Optional - untuk testing)
-- =====================================================

-- Uncomment untuk menambahkan data sample
/*
-- Sample Pegawai
INSERT INTO pegawai (nip, nama, bagian, unique_key) VALUES
    ('199001012015011001', 'Ahmad Santoso', 'Bagian Sekretariat', 'voter_199001012015011001_abc123'),
    ('199002022015012002', 'Budi Prasetyo', 'Bagian Sekretariat', 'voter_199002022015012002_def456'),
    ('199003032015011003', 'Citra Dewi', 'Bagian Inspektorat Wilayah I', 'voter_199003032015011003_ghi789');

-- Sample Kandidat
INSERT INTO kandidat (nip, nama, bagian) VALUES
    ('198501012010011001', 'Rudi Hartono', 'Bagian Sekretariat'),
    ('198502022010012002', 'Siti Aminah', 'Bagian Sekretariat'),
    ('198503032010011003', 'Eko Sulistyo', 'Bagian Inspektorat Wilayah I');
*/

-- =====================================================
-- GRANT PERMISSIONS (adjust username sesuai kebutuhan)
-- =====================================================

-- Default user untuk development: tlhpuser
-- Password akan diset di docker-compose.yml

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tlhpuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tlhpuser;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO tlhpuser;

-- =====================================================
-- INDEXES TAMBAHAN untuk optimasi query
-- =====================================================

-- Index untuk query voting status
CREATE INDEX idx_pegawai_voting_status ON pegawai(has_voted_phase1, has_voted_phase2);

-- Index untuk query agregasi
CREATE INDEX idx_vote_phase1_kandidat_criteria ON vote_phase1(kandidat_nip, bagian);

-- =====================================================
-- COMPLETED
-- =====================================================

-- Database schema telah siap digunakan
-- Jalankan file ini dengan: psql -U tlhpuser -d tlhp_db -f schema.sql
