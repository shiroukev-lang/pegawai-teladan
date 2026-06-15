const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tlhp_db',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
});

pool.query('SELECT 1').then(() => {
  console.log('✅ Database connected successfully');
}).catch(err => {
  console.error('❌ Database connection error:', err.message);
});

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const prefix = '/make-server-ea54a030';

function generateUniqueKey(nip) {
  return `voter_${nip}_${Math.random().toString(36).substring(2, 15)}`;
}

function formatPegawai(p) {
  return {
    nip: p.nip,
    nama: p.nama,
    bagian: p.bagian,
    uniqueKey: p.unique_key,
    hasVotedPhase1: !!p.has_voted_phase1,
    hasVotedPhase2: !!p.has_voted_phase2,
    createdAt: p.created_at,
  };
}

// =====================================================
// INITIALIZATION
// =====================================================

app.post(`${prefix}/initialize`, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT `value` FROM app_config WHERE `key` = ?', ['initialized']);
    if (rows.length > 0) return res.json({ message: 'Already initialized' });
    await pool.query('INSERT IGNORE INTO app_config (`key`, `value`) VALUES (?, ?)', ['initialized', 'true']);
    res.json({ success: true, message: 'Initialized successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// PEGAWAI
// =====================================================

app.post(`${prefix}/generate-link`, async (req, res) => {
  try {
    const { nip, nama, bagian } = req.body;
    if (!nip || !nama || !bagian) return res.status(400).json({ error: 'NIP, nama, dan bagian wajib diisi' });

    const uniqueKey = generateUniqueKey(nip);
    await pool.query(
      'INSERT INTO pegawai (nip, nama, bagian, unique_key) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE nama = VALUES(nama), bagian = VALUES(bagian), unique_key = VALUES(unique_key)',
      [nip, nama, bagian, uniqueKey]
    );
    res.json({ success: true, uniqueKey, link: `/vote?key=${uniqueKey}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post(`${prefix}/validate`, async (req, res) => {
  try {
    const { uniqueKey, nip } = req.body;
    if (!uniqueKey || !nip) return res.status(400).json({ error: 'Key dan NIP wajib diisi' });

    const [pegawaiRows] = await pool.query('SELECT * FROM pegawai WHERE nip = ?', [nip]);
    if (pegawaiRows.length === 0) return res.status(404).json({ error: 'NIP tidak ditemukan' });

    const pegawai = pegawaiRows[0];
    if (pegawai.unique_key !== uniqueKey) return res.status(403).json({ error: 'Link tidak valid untuk NIP ini' });

    const [phaseRows] = await pool.query('SELECT `value` FROM app_config WHERE `key` = ?', ['current_phase']);
    const currentPhase = phaseRows.length > 0 ? parseInt(phaseRows[0].value) : 1;

    res.json({ success: true, pegawai: formatPegawai(pegawai), currentPhase });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get(`${prefix}/pegawai`, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pegawai ORDER BY created_at DESC');
    res.json({ pegawai: rows.map(formatPegawai) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put(`${prefix}/pegawai/:nip`, async (req, res) => {
  try {
    const { nip } = req.params;
    const { nama, bagian } = req.body;
    const [result] = await pool.query('UPDATE pegawai SET nama = ?, bagian = ? WHERE nip = ?', [nama, bagian, nip]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Pegawai tidak ditemukan' });
    const [rows] = await pool.query('SELECT * FROM pegawai WHERE nip = ?', [nip]);
    res.json({ success: true, pegawai: formatPegawai(rows[0]) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete(`${prefix}/pegawai/:nip`, async (req, res) => {
  try {
    const { nip } = req.params;
    const [result] = await pool.query('DELETE FROM pegawai WHERE nip = ?', [nip]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Pegawai tidak ditemukan' });
    res.json({ success: true, message: 'Pegawai berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// KANDIDAT
// =====================================================

app.post(`${prefix}/kandidat`, async (req, res) => {
  try {
    const { nip, nama, bagian, photoUrl } = req.body;
    if (!nip || !nama || !bagian) return res.status(400).json({ error: 'NIP, nama, dan bagian wajib diisi' });

    const [countRows] = await pool.query('SELECT COUNT(*) AS cnt FROM kandidat WHERE bagian = ?', [bagian]);
    if (parseInt(countRows[0].cnt) >= 5) return res.status(400).json({ error: 'Setiap bagian maksimal 5 kandidat' });

    await pool.query('INSERT INTO kandidat (nip, nama, bagian, photo_url) VALUES (?, ?, ?, ?)', [nip, nama, bagian, photoUrl || null]);
    const [rows] = await pool.query('SELECT * FROM kandidat WHERE bagian = ? ORDER BY created_at', [bagian]);
    res.json({ success: true, kandidat: rows });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'NIP sudah terdaftar sebagai kandidat' });
    if (error.message && error.message.includes('maksimal 5 kandidat')) return res.status(400).json({ error: 'Setiap bagian maksimal 5 kandidat' });
    res.status(500).json({ error: error.message });
  }
});

app.get(`${prefix}/kandidat/:bagian`, async (req, res) => {
  try {
    const { bagian } = req.params;
    const [rows] = await pool.query('SELECT * FROM kandidat WHERE bagian = ? ORDER BY created_at', [bagian]);
    res.json({ kandidat: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get(`${prefix}/kandidat`, async (req, res) => {
  try {
    const [bagianRows] = await pool.query('SELECT `value` FROM app_config WHERE `key` = ?', ['bagian']);
    const bagianList = bagianRows.length > 0 ? JSON.parse(bagianRows[0].value) : [];
    const allKandidat = {};
    for (const bagian of bagianList) {
      const [rows] = await pool.query('SELECT * FROM kandidat WHERE bagian = ? ORDER BY created_at', [bagian]);
      allKandidat[bagian] = rows;
    }
    res.json({ kandidat: allKandidat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete(`${prefix}/kandidat/:bagian/:nip`, async (req, res) => {
  try {
    const { bagian, nip } = req.params;
    await pool.query('DELETE FROM kandidat WHERE bagian = ? AND nip = ?', [bagian, nip]);
    const [rows] = await pool.query('SELECT * FROM kandidat WHERE bagian = ? ORDER BY created_at', [bagian]);
    res.json({ success: true, kandidat: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// VOTING PHASE 1
// =====================================================

app.post(`${prefix}/vote/phase1`, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { nip, votes } = req.body;
    if (!nip || !votes) return res.status(400).json({ error: 'NIP dan votes wajib diisi' });

    await connection.beginTransaction();

    const [pegawaiRows] = await connection.query('SELECT * FROM pegawai WHERE nip = ?', [nip]);
    if (pegawaiRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Pegawai tidak ditemukan' });
    }

    const pegawai = pegawaiRows[0];
    if (pegawai.has_voted_phase1) {
      await connection.rollback();
      return res.status(403).json({ error: 'Anda sudah melakukan voting tahap 1' });
    }

    for (const [kandidatNip, scores] of Object.entries(votes)) {
      await connection.query(
        'INSERT INTO vote_phase1 (nip, bagian, kandidat_nip, berorientasi_pelayanan, akuntabel, kompeten, harmonis, loyal, adaptif, kolaboratif) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [nip, pegawai.bagian, kandidatNip,
          scores['Berorientasi Pelayanan'], scores['Akuntabel'], scores['Kompeten'],
          scores['Harmonis'], scores['Loyal'], scores['Adaptif'], scores['Kolaboratif']]
      );
    }

    await connection.query('UPDATE pegawai SET has_voted_phase1 = 1 WHERE nip = ?', [nip]);
    await connection.commit();
    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

app.get(`${prefix}/results/phase1`, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM view_phase1_results');
    const results = {};
    let totalVotes = 0;
    for (const row of rows) {
      results[row.nip] = {
        totalScore: parseInt(row.total_score),
        count: parseInt(row.total_voters),
        scores: {
          'Berorientasi Pelayanan': parseInt(row.total_berorientasi_pelayanan),
          'Akuntabel': parseInt(row.total_akuntabel),
          'Kompeten': parseInt(row.total_kompeten),
          'Harmonis': parseInt(row.total_harmonis),
          'Loyal': parseInt(row.total_loyal),
          'Adaptif': parseInt(row.total_adaptif),
          'Kolaboratif': parseInt(row.total_kolaboratif),
        },
      };
      totalVotes = Math.max(totalVotes, parseInt(row.total_voters));
    }
    res.json({ results, totalVotes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get(`${prefix}/winners/phase1`, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM view_phase1_winners');
    const winners = {};
    for (const row of rows) {
      winners[row.bagian] = {
        nip: row.nip,
        nama: row.nama,
        bagian: row.bagian,
        photoUrl: row.photo_url,
        totalScore: parseInt(row.total_score),
      };
    }
    res.json({ winners });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// VOTING PHASE 2
// =====================================================

app.post(`${prefix}/vote/phase2`, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { nip, votes } = req.body;
    if (!nip || !votes) return res.status(400).json({ error: 'NIP dan votes wajib diisi' });

    await connection.beginTransaction();

    const [pegawaiRows] = await connection.query('SELECT * FROM pegawai WHERE nip = ?', [nip]);
    if (pegawaiRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Pegawai tidak ditemukan' });
    }

    const pegawai = pegawaiRows[0];
    if (pegawai.has_voted_phase2) {
      await connection.rollback();
      return res.status(403).json({ error: 'Anda sudah melakukan voting tahap 2' });
    }

    await connection.query(
      'INSERT INTO vote_phase2 (nip, berorientasi_pelayanan, akuntabel, kompeten, harmonis, loyal, adaptif, kolaboratif) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nip, votes['Berorientasi Pelayanan'], votes['Akuntabel'], votes['Kompeten'],
       votes['Harmonis'], votes['Loyal'], votes['Adaptif'], votes['Kolaboratif']]
    );

    await connection.query('UPDATE pegawai SET has_voted_phase2 = 1 WHERE nip = ?', [nip]);
    await connection.commit();
    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

app.get(`${prefix}/results/phase2`, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM view_phase2_results');
    const results = {};
    for (const row of rows) {
      results[row.nip] = {
        totalVotes: parseInt(row.total_votes),
        criteria: {
          'Berorientasi Pelayanan': parseInt(row.votes_berorientasi_pelayanan),
          'Akuntabel': parseInt(row.votes_akuntabel),
          'Kompeten': parseInt(row.votes_kompeten),
          'Harmonis': parseInt(row.votes_harmonis),
          'Loyal': parseInt(row.votes_loyal),
          'Adaptif': parseInt(row.votes_adaptif),
          'Kolaboratif': parseInt(row.votes_kolaboratif),
        },
      };
    }
    const [countRows] = await pool.query('SELECT COUNT(*) AS cnt FROM vote_phase2');
    const totalVotes = parseInt(countRows[0].cnt);
    res.json({ results, totalVotes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get(`${prefix}/winner/final`, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM view_phase2_results ORDER BY total_votes DESC LIMIT 1');
    if (rows.length === 0) return res.json({ winner: null });
    const row = rows[0];
    res.json({
      winner: {
        nip: row.nip,
        nama: row.nama,
        bagian: row.bagian,
        photoUrl: row.photo_url,
        totalVotes: parseInt(row.total_votes),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// ADMIN
// =====================================================

app.get(`${prefix}/voting-status`, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pegawai');
    const status = { phase1: { voted: 0, notVoted: 0, voters: [] }, phase2: { voted: 0, notVoted: 0, voters: [] } };
    for (const p of rows) {
      const entry = { nip: p.nip, nama: p.nama, bagian: p.bagian };
      if (p.has_voted_phase1) { status.phase1.voted++; status.phase1.voters.push(entry); }
      else status.phase1.notVoted++;
      if (p.has_voted_phase2) { status.phase2.voted++; status.phase2.voters.push(entry); }
      else status.phase2.notVoted++;
    }
    res.json({ status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get(`${prefix}/phase`, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT `value` FROM app_config WHERE `key` = ?', ['current_phase']);
    const phase = rows.length > 0 ? parseInt(rows[0].value) : 1;
    res.json({ phase });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post(`${prefix}/phase`, async (req, res) => {
  try {
    const { phase } = req.body;
    if (![1, 2, 3].includes(phase)) return res.status(400).json({ error: 'Phase harus 1, 2, atau 3' });
    await pool.query('UPDATE app_config SET `value` = ? WHERE `key` = ?', [phase.toString(), 'current_phase']);
    res.json({ success: true, phase });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post(`${prefix}/reset`, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { resetType } = req.body;
    await connection.beginTransaction();
    if (resetType === 'phase1') {
      await connection.query('DELETE FROM vote_phase1');
      await connection.query('UPDATE pegawai SET has_voted_phase1 = 0');
    } else if (resetType === 'phase2') {
      await connection.query('DELETE FROM vote_phase2');
      await connection.query('UPDATE pegawai SET has_voted_phase2 = 0');
    } else if (resetType === 'all') {
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
      await connection.query('DELETE FROM vote_phase2');
      await connection.query('DELETE FROM vote_phase1');
      await connection.query('DELETE FROM pegawai');
      await connection.query('DELETE FROM kandidat');
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
      await connection.query("UPDATE app_config SET `value` = '1' WHERE `key` = 'current_phase'");
    }
    await connection.commit();
    res.json({ success: true, message: 'Reset berhasil' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// =====================================================
// HEALTH & ROOT
// =====================================================

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'API Pegawai Teladan', version: '1.0.0' });
});

app.use((req, res) => res.status(404).json({ error: 'Endpoint tidak ditemukan' }));
app.use((err, req, res, next) => res.status(500).json({ error: err.message }));

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   APLIKASI PEGAWAI TELADAN                               ║
║   Server running on port ${PORT}                            ║
║   API: http://localhost:${PORT}${prefix}        ║
║   Health: http://localhost:${PORT}/health                  ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

process.on('SIGTERM', () => pool.end().then(() => process.exit(0)));
