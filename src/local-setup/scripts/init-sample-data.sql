-- =====================================================
-- SAMPLE DATA untuk Testing
-- Aplikasi Pegawai Teladan - Inspektorat Jenderal
-- =====================================================

-- Jalankan script ini untuk menambahkan data sample
-- psql -U tlhpuser -d tlhp_db -f init-sample-data.sql

BEGIN;

-- =====================================================
-- SAMPLE PEGAWAI (15 pegawai per bagian = 90 total)
-- =====================================================

-- Bagian Sekretariat (15 pegawai)
INSERT INTO pegawai (nip, nama, bagian, unique_key) VALUES
    ('199001011001', 'Ahmad Santoso', 'Bagian Sekretariat', 'voter_199001011001_sample01'),
    ('199001021002', 'Budi Prasetyo', 'Bagian Sekretariat', 'voter_199001021002_sample02'),
    ('199001031003', 'Citra Dewi', 'Bagian Sekretariat', 'voter_199001031003_sample03'),
    ('199001041004', 'Dwi Atmoko', 'Bagian Sekretariat', 'voter_199001041004_sample04'),
    ('199001051005', 'Eko Sulistyo', 'Bagian Sekretariat', 'voter_199001051005_sample05'),
    ('199001061006', 'Fitri Handayani', 'Bagian Sekretariat', 'voter_199001061006_sample06'),
    ('199001071007', 'Gunawan Wibowo', 'Bagian Sekretariat', 'voter_199001071007_sample07'),
    ('199001081008', 'Heni Purnama', 'Bagian Sekretariat', 'voter_199001081008_sample08'),
    ('199001091009', 'Indra Setiawan', 'Bagian Sekretariat', 'voter_199001091009_sample09'),
    ('199001101010', 'Joko Susilo', 'Bagian Sekretariat', 'voter_199001101010_sample10'),
    ('199001111011', 'Kartika Sari', 'Bagian Sekretariat', 'voter_199001111011_sample11'),
    ('199001121012', 'Linda Wijaya', 'Bagian Sekretariat', 'voter_199001121012_sample12'),
    ('199001131013', 'Maman Suryadi', 'Bagian Sekretariat', 'voter_199001131013_sample13'),
    ('199001141014', 'Novi Marlina', 'Bagian Sekretariat', 'voter_199001141014_sample14'),
    ('199001151015', 'Oka Mahendra', 'Bagian Sekretariat', 'voter_199001151015_sample15');

-- Bagian Inspektorat Wilayah I (15 pegawai)
INSERT INTO pegawai (nip, nama, bagian, unique_key) VALUES
    ('199002012001', 'Putri Ayu', 'Bagian Inspektorat Wilayah I', 'voter_199002012001_sample16'),
    ('199002022002', 'Rizky Fadilah', 'Bagian Inspektorat Wilayah I', 'voter_199002022002_sample17'),
    ('199002032003', 'Siti Nurhaliza', 'Bagian Inspektorat Wilayah I', 'voter_199002032003_sample18'),
    ('199002042004', 'Toni Hermawan', 'Bagian Inspektorat Wilayah I', 'voter_199002042004_sample19'),
    ('199002052005', 'Udin Sarifudin', 'Bagian Inspektorat Wilayah I', 'voter_199002052005_sample20'),
    ('199002062006', 'Vina Amalia', 'Bagian Inspektorat Wilayah I', 'voter_199002062006_sample21'),
    ('199002072007', 'Wawan Kurniawan', 'Bagian Inspektorat Wilayah I', 'voter_199002072007_sample22'),
    ('199002082008', 'Yanti Rahmawati', 'Bagian Inspektorat Wilayah I', 'voter_199002082008_sample23'),
    ('199002092009', 'Zaenal Arifin', 'Bagian Inspektorat Wilayah I', 'voter_199002092009_sample24'),
    ('199002102010', 'Agus Salim', 'Bagian Inspektorat Wilayah I', 'voter_199002102010_sample25'),
    ('199002112011', 'Bambang Sutrisno', 'Bagian Inspektorat Wilayah I', 'voter_199002112011_sample26'),
    ('199002122012', 'Candra Permana', 'Bagian Inspektorat Wilayah I', 'voter_199002122012_sample27'),
    ('199002132013', 'Dedi Supardi', 'Bagian Inspektorat Wilayah I', 'voter_199002132013_sample28'),
    ('199002142014', 'Erna Susanti', 'Bagian Inspektorat Wilayah I', 'voter_199002142014_sample29'),
    ('199002152015', 'Fajar Nugroho', 'Bagian Inspektorat Wilayah I', 'voter_199002152015_sample30');

-- Bagian Inspektorat Wilayah II (15 pegawai)
INSERT INTO pegawai (nip, nama, bagian, unique_key) VALUES
    ('199003013001', 'Gita Pertiwi', 'Bagian Inspektorat Wilayah II', 'voter_199003013001_sample31'),
    ('199003023002', 'Hadi Prayitno', 'Bagian Inspektorat Wilayah II', 'voter_199003023002_sample32'),
    ('199003033003', 'Ika Puspita', 'Bagian Inspektorat Wilayah II', 'voter_199003033003_sample33'),
    ('199003043004', 'Jajang Nurjaman', 'Bagian Inspektorat Wilayah II', 'voter_199003043004_sample34'),
    ('199003053005', 'Kiki Amelia', 'Bagian Inspektorat Wilayah II', 'voter_199003053005_sample35'),
    ('199003063006', 'Lukman Hakim', 'Bagian Inspektorat Wilayah II', 'voter_199003063006_sample36'),
    ('199003073007', 'Maya Sari', 'Bagian Inspektorat Wilayah II', 'voter_199003073007_sample37'),
    ('199003083008', 'Nanda Pratama', 'Bagian Inspektorat Wilayah II', 'voter_199003083008_sample38'),
    ('199003093009', 'Okta Ramadhan', 'Bagian Inspektorat Wilayah II', 'voter_199003093009_sample39'),
    ('199003103010', 'Pandu Wijaya', 'Bagian Inspektorat Wilayah II', 'voter_199003103010_sample40'),
    ('199003113011', 'Qory Sandiah', 'Bagian Inspektorat Wilayah II', 'voter_199003113011_sample41'),
    ('199003123012', 'Rini Astuti', 'Bagian Inspektorat Wilayah II', 'voter_199003123012_sample42'),
    ('199003133013', 'Saiful Bahri', 'Bagian Inspektorat Wilayah II', 'voter_199003133013_sample43'),
    ('199003143014', 'Tia Melati', 'Bagian Inspektorat Wilayah II', 'voter_199003143014_sample44'),
    ('199003153015', 'Usman Effendi', 'Bagian Inspektorat Wilayah II', 'voter_199003153015_sample45');

-- Bagian Inspektorat Wilayah III (15 pegawai)
INSERT INTO pegawai (nip, nama, bagian, unique_key) VALUES
    ('199004014001', 'Vera Anggraini', 'Bagian Inspektorat Wilayah III', 'voter_199004014001_sample46'),
    ('199004024002', 'Wahyu Hidayat', 'Bagian Inspektorat Wilayah III', 'voter_199004024002_sample47'),
    ('199004034003', 'Yuni Setiawati', 'Bagian Inspektorat Wilayah III', 'voter_199004034003_sample48'),
    ('199004044004', 'Zainal Muttaqin', 'Bagian Inspektorat Wilayah III', 'voter_199004044004_sample49'),
    ('199004054005', 'Andi Firmansyah', 'Bagian Inspektorat Wilayah III', 'voter_199004054005_sample50'),
    ('199004064006', 'Bella Safira', 'Bagian Inspektorat Wilayah III', 'voter_199004064006_sample51'),
    ('199004074007', 'Chandra Gunawan', 'Bagian Inspektorat Wilayah III', 'voter_199004074007_sample52'),
    ('199004084008', 'Dian Puspitasari', 'Bagian Inspektorat Wilayah III', 'voter_199004084008_sample53'),
    ('199004094009', 'Edi Kusuma', 'Bagian Inspektorat Wilayah III', 'voter_199004094009_sample54'),
    ('199004104010', 'Fenny Lestari', 'Bagian Inspektorat Wilayah III', 'voter_199004104010_sample55'),
    ('199004114011', 'Gilang Ramadhan', 'Bagian Inspektorat Wilayah III', 'voter_199004114011_sample56'),
    ('199004124012', 'Hilda Octavia', 'Bagian Inspektorat Wilayah III', 'voter_199004124012_sample57'),
    ('199004134013', 'Imam Syafi''i', 'Bagian Inspektorat Wilayah III', 'voter_199004134013_sample58'),
    ('199004144014', 'Jelita Anggun', 'Bagian Inspektorat Wilayah III', 'voter_199004144014_sample59'),
    ('199004154015', 'Kurniawan Adi', 'Bagian Inspektorat Wilayah III', 'voter_199004154015_sample60');

-- Bagian Inspektorat Wilayah IV (15 pegawai)
INSERT INTO pegawai (nip, nama, bagian, unique_key) VALUES
    ('199005015001', 'Laila Sari', 'Bagian Inspektorat Wilayah IV', 'voter_199005015001_sample61'),
    ('199005025002', 'Mulyadi Santoso', 'Bagian Inspektorat Wilayah IV', 'voter_199005025002_sample62'),
    ('199005035003', 'Nina Marlina', 'Bagian Inspektorat Wilayah IV', 'voter_199005035003_sample63'),
    ('199005045004', 'Oscar Pratama', 'Bagian Inspektorat Wilayah IV', 'voter_199005045004_sample64'),
    ('199005055005', 'Priska Amelia', 'Bagian Inspektorat Wilayah IV', 'voter_199005055005_sample65'),
    ('199005065006', 'Qomar Zaman', 'Bagian Inspektorat Wilayah IV', 'voter_199005065006_sample66'),
    ('199005075007', 'Rani Wulandari', 'Bagian Inspektorat Wilayah IV', 'voter_199005075007_sample67'),
    ('199005085008', 'Surya Dharma', 'Bagian Inspektorat Wilayah IV', 'voter_199005085008_sample68'),
    ('199005095009', 'Tiara Dewi', 'Bagian Inspektorat Wilayah IV', 'voter_199005095009_sample69'),
    ('199005105010', 'Utari Fitriani', 'Bagian Inspektorat Wilayah IV', 'voter_199005105010_sample70'),
    ('199005115011', 'Viktor Halim', 'Bagian Inspektorat Wilayah IV', 'voter_199005115011_sample71'),
    ('199005125012', 'Winda Setya', 'Bagian Inspektorat Wilayah IV', 'voter_199005125012_sample72'),
    ('199005135013', 'Yogi Saputra', 'Bagian Inspektorat Wilayah IV', 'voter_199005135013_sample73'),
    ('199005145014', 'Zahira Putri', 'Bagian Inspektorat Wilayah IV', 'voter_199005145014_sample74'),
    ('199005155015', 'Alvin Nugraha', 'Bagian Inspektorat Wilayah IV', 'voter_199005155015_sample75');

-- Bagian Inspektorat Wilayah V (15 pegawai)
INSERT INTO pegawai (nip, nama, bagian, unique_key) VALUES
    ('199006016001', 'Bunga Cantika', 'Bagian Inspektorat Wilayah V', 'voter_199006016001_sample76'),
    ('199006026002', 'Cahya Permana', 'Bagian Inspektorat Wilayah V', 'voter_199006026002_sample77'),
    ('199006036003', 'Danu Wicaksono', 'Bagian Inspektorat Wilayah V', 'voter_199006036003_sample78'),
    ('199006046004', 'Elsa Mawarni', 'Bagian Inspektorat Wilayah V', 'voter_199006046004_sample79'),
    ('199006056005', 'Farhan Maulana', 'Bagian Inspektorat Wilayah V', 'voter_199006056005_sample80'),
    ('199006066006', 'Gina Puspita', 'Bagian Inspektorat Wilayah V', 'voter_199006066006_sample81'),
    ('199006076007', 'Hendra Susanto', 'Bagian Inspektorat Wilayah V', 'voter_199006076007_sample82'),
    ('199006086008', 'Intan Permata', 'Bagian Inspektorat Wilayah V', 'voter_199006086008_sample83'),
    ('199006096009', 'Jaka Pratama', 'Bagian Inspektorat Wilayah V', 'voter_199006096009_sample84'),
    ('199006106010', 'Karina Salsabila', 'Bagian Inspektorat Wilayah V', 'voter_199006106010_sample85'),
    ('199006116011', 'Leo Pratama', 'Bagian Inspektorat Wilayah V', 'voter_199006116011_sample86'),
    ('199006126012', 'Mega Indah', 'Bagian Inspektorat Wilayah V', 'voter_199006126012_sample87'),
    ('199006136013', 'Noval Azhari', 'Bagian Inspektorat Wilayah V', 'voter_199006136013_sample88'),
    ('199006146014', 'Olivia Anggun', 'Bagian Inspektorat Wilayah V', 'voter_199006146014_sample89'),
    ('199006156015', 'Putra Mahardika', 'Bagian Inspektorat Wilayah V', 'voter_199006156015_sample90');

-- =====================================================
-- SAMPLE KANDIDAT (5 kandidat per bagian = 30 total)
-- =====================================================

-- Kandidat Bagian Sekretariat
INSERT INTO kandidat (nip, nama, bagian) VALUES
    ('198501011101', 'Rudi Hartono', 'Bagian Sekretariat'),
    ('198502021102', 'Siti Aminah', 'Bagian Sekretariat'),
    ('198503031103', 'Bambang Wijaya', 'Bagian Sekretariat'),
    ('198504041104', 'Dewi Lestari', 'Bagian Sekretariat'),
    ('198505051105', 'Joko Pramono', 'Bagian Sekretariat');

-- Kandidat Bagian Inspektorat Wilayah I
INSERT INTO kandidat (nip, nama, bagian) VALUES
    ('198506062101', 'Andi Saputra', 'Bagian Inspektorat Wilayah I'),
    ('198507072102', 'Rina Susanti', 'Bagian Inspektorat Wilayah I'),
    ('198508082103', 'Hendra Gunawan', 'Bagian Inspektorat Wilayah I'),
    ('198509092104', 'Sri Wahyuni', 'Bagian Inspektorat Wilayah I'),
    ('198510102105', 'Budi Santoso', 'Bagian Inspektorat Wilayah I');

-- Kandidat Bagian Inspektorat Wilayah II
INSERT INTO kandidat (nip, nama, bagian) VALUES
    ('198511113101', 'Linda Marlina', 'Bagian Inspektorat Wilayah II'),
    ('198512123102', 'Agung Prasetyo', 'Bagian Inspektorat Wilayah II'),
    ('198513133103', 'Maya Puspita', 'Bagian Inspektorat Wilayah II'),
    ('198514143104', 'Wahyu Firmansyah', 'Bagian Inspektorat Wilayah II'),
    ('198515153105', 'Dian Safitri', 'Bagian Inspektorat Wilayah II');

-- Kandidat Bagian Inspektorat Wilayah III
INSERT INTO kandidat (nip, nama, bagian) VALUES
    ('198516164101', 'Eko Saputro', 'Bagian Inspektorat Wilayah III'),
    ('198517174102', 'Yuni Astuti', 'Bagian Inspektorat Wilayah III'),
    ('198518184103', 'Fajar Setiawan', 'Bagian Inspektorat Wilayah III'),
    ('198519194104', 'Nurul Hidayah', 'Bagian Inspektorat Wilayah III'),
    ('198520204105', 'Ahmad Fauzi', 'Bagian Inspektorat Wilayah III');

-- Kandidat Bagian Inspektorat Wilayah IV
INSERT INTO kandidat (nip, nama, bagian) VALUES
    ('198521215101', 'Sari Rahayu', 'Bagian Inspektorat Wilayah IV'),
    ('198522225102', 'Dedi Kurniawan', 'Bagian Inspektorat Wilayah IV'),
    ('198523235103', 'Fitri Handayani', 'Bagian Inspektorat Wilayah IV'),
    ('198524245104', 'Rizki Pratama', 'Bagian Inspektorat Wilayah IV'),
    ('198525255105', 'Anisa Wulandari', 'Bagian Inspektorat Wilayah IV');

-- Kandidat Bagian Inspektorat Wilayah V
INSERT INTO kandidat (nip, nama, bagian) VALUES
    ('198526266101', 'Tono Sugiarto', 'Bagian Inspektorat Wilayah V'),
    ('198527276102', 'Lina Marliana', 'Bagian Inspektorat Wilayah V'),
    ('198528286103', 'Rama Dhani', 'Bagian Inspektorat Wilayah V'),
    ('198529296104', 'Wati Susanti', 'Bagian Inspektorat Wilayah V'),
    ('198530306105', 'Gilang Permana', 'Bagian Inspektorat Wilayah V');

COMMIT;

-- =====================================================
-- VERIFIKASI DATA
-- =====================================================

-- Tampilkan jumlah pegawai per bagian
SELECT 
    bagian, 
    COUNT(*) as jumlah_pegawai 
FROM pegawai 
GROUP BY bagian 
ORDER BY bagian;

-- Tampilkan jumlah kandidat per bagian
SELECT 
    bagian, 
    COUNT(*) as jumlah_kandidat 
FROM kandidat 
GROUP BY bagian 
ORDER BY bagian;

-- Tampilkan total
SELECT 
    (SELECT COUNT(*) FROM pegawai) as total_pegawai,
    (SELECT COUNT(*) FROM kandidat) as total_kandidat;

SELECT 'Sample data berhasil ditambahkan!' as status;
