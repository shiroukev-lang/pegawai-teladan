-- =====================================================
-- SCHEMA DATABASE APLIKASI PEGAWAI TELADAN
-- MySQL 8.0+ Version
-- =====================================================

CREATE DATABASE IF NOT EXISTS tlhp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tlhp_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS vote_phase2;
DROP TABLE IF EXISTS vote_phase1;
DROP TABLE IF EXISTS pegawai;
DROP TABLE IF EXISTS kandidat;
DROP TABLE IF EXISTS app_config;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- TABLE: app_config
-- =====================================================
CREATE TABLE app_config (
    `key` VARCHAR(100) PRIMARY KEY,
    `value` TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO app_config (`key`, `value`) VALUES
    ('current_phase', '1'),
    ('initialized', 'true'),
    ('bagian', '["Sekretariat Inspektorat Jenderal","Inspektorat Wilayah I","Inspektorat Wilayah II","Inspektorat Wilayah III","Inspektorat Wilayah IV","Inspektorat Wilayah V"]');

-- =====================================================
-- TABLE: pegawai
-- =====================================================
CREATE TABLE pegawai (
    nip VARCHAR(50) PRIMARY KEY,
    nama VARCHAR(200) NOT NULL,
    bagian VARCHAR(100) NOT NULL,
    unique_key VARCHAR(100) UNIQUE NOT NULL,
    has_voted_phase1 TINYINT(1) DEFAULT 0,
    has_voted_phase2 TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_bagian (bagian),
    INDEX idx_unique_key (unique_key),
    INDEX idx_voting_status (has_voted_phase1, has_voted_phase2)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TABLE: kandidat
-- =====================================================
CREATE TABLE kandidat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nip VARCHAR(50) UNIQUE NOT NULL,
    nama VARCHAR(200) NOT NULL,
    bagian VARCHAR(100) NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_bagian (bagian),
    INDEX idx_nip (nip)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Trigger: max 5 kandidat per bagian
DELIMITER //
CREATE TRIGGER check_max_kandidat
BEFORE INSERT ON kandidat
FOR EACH ROW
BEGIN
    DECLARE cnt INT;
    SELECT COUNT(*) INTO cnt FROM kandidat WHERE bagian = NEW.bagian;
    IF cnt >= 5 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Setiap bagian maksimal 5 kandidat';
    END IF;
END//
DELIMITER ;

-- =====================================================
-- TABLE: vote_phase1
-- =====================================================
CREATE TABLE vote_phase1 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nip VARCHAR(50) NOT NULL,
    bagian VARCHAR(100) NOT NULL,
    kandidat_nip VARCHAR(50) NOT NULL,
    berorientasi_pelayanan INT CHECK (berorientasi_pelayanan BETWEEN 1 AND 5),
    akuntabel INT CHECK (akuntabel BETWEEN 1 AND 5),
    kompeten INT CHECK (kompeten BETWEEN 1 AND 5),
    harmonis INT CHECK (harmonis BETWEEN 1 AND 5),
    loyal INT CHECK (loyal BETWEEN 1 AND 5),
    adaptif INT CHECK (adaptif BETWEEN 1 AND 5),
    kolaboratif INT CHECK (kolaboratif BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_vote (nip, kandidat_nip),
    FOREIGN KEY (nip) REFERENCES pegawai(nip) ON DELETE CASCADE,
    FOREIGN KEY (kandidat_nip) REFERENCES kandidat(nip) ON DELETE CASCADE,
    INDEX idx_nip (nip),
    INDEX idx_kandidat (kandidat_nip),
    INDEX idx_bagian (bagian),
    INDEX idx_kandidat_criteria (kandidat_nip, bagian)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TABLE: vote_phase2
-- =====================================================
CREATE TABLE vote_phase2 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nip VARCHAR(50) NOT NULL,
    berorientasi_pelayanan VARCHAR(50),
    akuntabel VARCHAR(50),
    kompeten VARCHAR(50),
    harmonis VARCHAR(50),
    loyal VARCHAR(50),
    adaptif VARCHAR(50),
    kolaboratif VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_voter (nip),
    FOREIGN KEY (nip) REFERENCES pegawai(nip) ON DELETE CASCADE,
    FOREIGN KEY (berorientasi_pelayanan) REFERENCES kandidat(nip),
    FOREIGN KEY (akuntabel) REFERENCES kandidat(nip),
    FOREIGN KEY (kompeten) REFERENCES kandidat(nip),
    FOREIGN KEY (harmonis) REFERENCES kandidat(nip),
    FOREIGN KEY (loyal) REFERENCES kandidat(nip),
    FOREIGN KEY (adaptif) REFERENCES kandidat(nip),
    FOREIGN KEY (kolaboratif) REFERENCES kandidat(nip),
    INDEX idx_nip (nip)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- VIEWS
-- =====================================================

CREATE OR REPLACE VIEW view_phase1_results AS
SELECT
    k.nip,
    k.nama,
    k.bagian,
    k.photo_url,
    COUNT(DISTINCT v.nip) AS total_voters,
    COALESCE(SUM(v.berorientasi_pelayanan), 0) AS total_berorientasi_pelayanan,
    COALESCE(SUM(v.akuntabel), 0) AS total_akuntabel,
    COALESCE(SUM(v.kompeten), 0) AS total_kompeten,
    COALESCE(SUM(v.harmonis), 0) AS total_harmonis,
    COALESCE(SUM(v.loyal), 0) AS total_loyal,
    COALESCE(SUM(v.adaptif), 0) AS total_adaptif,
    COALESCE(SUM(v.kolaboratif), 0) AS total_kolaboratif,
    COALESCE(SUM(
        v.berorientasi_pelayanan +
        v.akuntabel +
        v.kompeten +
        v.harmonis +
        v.loyal +
        v.adaptif +
        v.kolaboratif
    ), 0) AS total_score
FROM kandidat k
LEFT JOIN vote_phase1 v ON k.nip = v.kandidat_nip
GROUP BY k.nip, k.nama, k.bagian, k.photo_url;

CREATE OR REPLACE VIEW view_phase1_winners AS
WITH ranked_candidates AS (
    SELECT *,
        ROW_NUMBER() OVER (PARTITION BY bagian ORDER BY total_score DESC, total_voters DESC) AS rnk
    FROM view_phase1_results
)
SELECT nip, nama, bagian, photo_url, total_voters,
       total_berorientasi_pelayanan, total_akuntabel, total_kompeten,
       total_harmonis, total_loyal, total_adaptif, total_kolaboratif, total_score
FROM ranked_candidates WHERE rnk = 1;

CREATE OR REPLACE VIEW view_phase2_results AS
SELECT
    k.nip,
    k.nama,
    k.bagian,
    k.photo_url,
    COALESCE(SUM(CASE WHEN v.berorientasi_pelayanan = k.nip THEN 1 ELSE 0 END), 0) AS votes_berorientasi_pelayanan,
    COALESCE(SUM(CASE WHEN v.akuntabel = k.nip THEN 1 ELSE 0 END), 0) AS votes_akuntabel,
    COALESCE(SUM(CASE WHEN v.kompeten = k.nip THEN 1 ELSE 0 END), 0) AS votes_kompeten,
    COALESCE(SUM(CASE WHEN v.harmonis = k.nip THEN 1 ELSE 0 END), 0) AS votes_harmonis,
    COALESCE(SUM(CASE WHEN v.loyal = k.nip THEN 1 ELSE 0 END), 0) AS votes_loyal,
    COALESCE(SUM(CASE WHEN v.adaptif = k.nip THEN 1 ELSE 0 END), 0) AS votes_adaptif,
    COALESCE(SUM(CASE WHEN v.kolaboratif = k.nip THEN 1 ELSE 0 END), 0) AS votes_kolaboratif,
    COALESCE(
        SUM(CASE WHEN v.berorientasi_pelayanan = k.nip THEN 1 ELSE 0 END) +
        SUM(CASE WHEN v.akuntabel = k.nip THEN 1 ELSE 0 END) +
        SUM(CASE WHEN v.kompeten = k.nip THEN 1 ELSE 0 END) +
        SUM(CASE WHEN v.harmonis = k.nip THEN 1 ELSE 0 END) +
        SUM(CASE WHEN v.loyal = k.nip THEN 1 ELSE 0 END) +
        SUM(CASE WHEN v.adaptif = k.nip THEN 1 ELSE 0 END) +
        SUM(CASE WHEN v.kolaboratif = k.nip THEN 1 ELSE 0 END), 0
    ) AS total_votes
FROM kandidat k
LEFT JOIN vote_phase2 v ON
    k.nip IN (v.berorientasi_pelayanan, v.akuntabel, v.kompeten, v.harmonis, v.loyal, v.adaptif, v.kolaboratif)
GROUP BY k.nip, k.nama, k.bagian, k.photo_url;
