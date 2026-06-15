import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Prefix untuk semua route
const prefix = '/make-server-ea54a030';

// Generate unique key untuk pegawai
function generateUniqueKey(nip: string): string {
  return `voter_${nip}_${Math.random().toString(36).substring(2, 15)}`;
}

// Initialize data kandidat dan pegawai
app.post(`${prefix}/initialize`, async (c) => {
  try {
    // Cek apakah sudah diinisialisasi
    const existing = await kv.get('initialized');
    if (existing) {
      return c.json({ message: 'Already initialized' });
    }

    // Data bagian
    const bagian = [
      'Bagian Sekretariat',
      'Bagian Inspektorat Wilayah I',
      'Bagian Inspektorat Wilayah II',
      'Bagian Inspektorat Wilayah III',
      'Bagian Inspektorat Wilayah IV',
      'Bagian Inspektorat Wilayah V'
    ];

    await kv.set('bagian', bagian);
    await kv.set('initialized', true);
    await kv.set('current_phase', 1); // 1 = tahap 1, 2 = tahap 2, 3 = selesai

    return c.json({ success: true, message: 'Initialized successfully' });
  } catch (error) {
    console.log(`Initialization error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Generate link untuk pegawai
app.post(`${prefix}/generate-link`, async (c) => {
  try {
    const { nip, nama, bagian } = await c.req.json();
    
    if (!nip || !nama || !bagian) {
      return c.json({ error: 'NIP, nama, dan bagian wajib diisi' }, 400);
    }

    const uniqueKey = generateUniqueKey(nip);
    
    // Simpan data pegawai
    await kv.set(`pegawai_${nip}`, {
      nip,
      nama,
      bagian,
      uniqueKey,
      hasVotedPhase1: false,
      hasVotedPhase2: false,
      createdAt: new Date().toISOString()
    });

    return c.json({ 
      success: true, 
      uniqueKey,
      link: `/vote?key=${uniqueKey}`
    });
  } catch (error) {
    console.log(`Generate link error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Validasi link dan NIP
app.post(`${prefix}/validate`, async (c) => {
  try {
    const { uniqueKey, nip } = await c.req.json();
    
    if (!uniqueKey || !nip) {
      return c.json({ error: 'Key dan NIP wajib diisi' }, 400);
    }

    // Cari pegawai berdasarkan NIP
    const pegawai = await kv.get(`pegawai_${nip}`);
    
    if (!pegawai) {
      return c.json({ error: 'NIP tidak ditemukan' }, 404);
    }

    if (pegawai.uniqueKey !== uniqueKey) {
      return c.json({ error: 'Link tidak valid untuk NIP ini' }, 403);
    }

    // Get current phase
    const currentPhase = await kv.get('current_phase');

    return c.json({ 
      success: true, 
      pegawai,
      currentPhase
    });
  } catch (error) {
    console.log(`Validation error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Tambah kandidat
app.post(`${prefix}/kandidat`, async (c) => {
  try {
    const { nip, nama, bagian, photoUrl } = await c.req.json();
    
    if (!nip || !nama || !bagian) {
      return c.json({ error: 'NIP, nama, dan bagian wajib diisi' }, 400);
    }

    // Get existing kandidat untuk bagian ini
    const key = `kandidat_${bagian}`;
    const existing = await kv.get(key) || [];
    
    // Cek apakah sudah ada 5 kandidat
    if (existing.length >= 5) {
      return c.json({ error: 'Setiap bagian maksimal 5 kandidat' }, 400);
    }

    // Cek duplikat NIP
    if (existing.some((k: any) => k.nip === nip)) {
      return c.json({ error: 'NIP sudah terdaftar sebagai kandidat' }, 400);
    }

    existing.push({ nip, nama, bagian, photoUrl: photoUrl || null });
    await kv.set(key, existing);

    return c.json({ success: true, kandidat: existing });
  } catch (error) {
    console.log(`Add kandidat error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get kandidat berdasarkan bagian
app.get(`${prefix}/kandidat/:bagian`, async (c) => {
  try {
    const bagian = c.req.param('bagian');
    const kandidat = await kv.get(`kandidat_${bagian}`) || [];
    
    return c.json({ kandidat });
  } catch (error) {
    console.log(`Get kandidat error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get semua kandidat
app.get(`${prefix}/kandidat`, async (c) => {
  try {
    const bagianList = await kv.get('bagian') || [];
    const allKandidat: any = {};

    for (const bagian of bagianList) {
      const kandidat = await kv.get(`kandidat_${bagian}`) || [];
      allKandidat[bagian] = kandidat;
    }

    return c.json({ kandidat: allKandidat });
  } catch (error) {
    console.log(`Get all kandidat error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Submit voting tahap 1
app.post(`${prefix}/vote/phase1`, async (c) => {
  try {
    const { nip, votes } = await c.req.json();
    
    if (!nip || !votes) {
      return c.json({ error: 'NIP dan votes wajib diisi' }, 400);
    }

    // Cek pegawai
    const pegawai = await kv.get(`pegawai_${nip}`);
    if (!pegawai) {
      return c.json({ error: 'Pegawai tidak ditemukan' }, 404);
    }

    // Cek apakah sudah voting
    if (pegawai.hasVotedPhase1) {
      return c.json({ error: 'Anda sudah melakukan voting tahap 1' }, 403);
    }

    // Simpan votes
    await kv.set(`vote_phase1_${nip}`, {
      nip,
      bagian: pegawai.bagian,
      votes,
      timestamp: new Date().toISOString()
    });

    // Update status pegawai
    pegawai.hasVotedPhase1 = true;
    await kv.set(`pegawai_${nip}`, pegawai);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Vote phase 1 error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get hasil voting tahap 1
app.get(`${prefix}/results/phase1`, async (c) => {
  try {
    const votes = await kv.getByPrefix('vote_phase1_');
    
    // Hitung total nilai per kandidat
    const results: any = {};
    
    for (const vote of votes) {
      for (const [kandidatNip, scores] of Object.entries(vote.votes)) {
        if (!results[kandidatNip]) {
          results[kandidatNip] = {
            totalScore: 0,
            count: 0,
            scores: {
              'Berorientasi Pelayanan': 0,
              'Akuntabel': 0,
              'Kompeten': 0,
              'Harmonis': 0,
              'Loyal': 0,
              'Adaptif': 0,
              'Kolaboratif': 0
            }
          };
        }
        
        const kandidatScores: any = scores;
        for (const [criteria, score] of Object.entries(kandidatScores)) {
          results[kandidatNip].scores[criteria] += score;
          results[kandidatNip].totalScore += score as number;
        }
        results[kandidatNip].count += 1;
      }
    }

    return c.json({ results, totalVotes: votes.length });
  } catch (error) {
    console.log(`Get results phase 1 error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get pemenang tahap 1 (1 per bagian)
app.get(`${prefix}/winners/phase1`, async (c) => {
  try {
    const bagianList = await kv.get('bagian') || [];
    const winners: any = {};

    for (const bagian of bagianList) {
      const votes = await kv.getByPrefix('vote_phase1_');
      const bagianVotes = votes.filter((v: any) => v.bagian === bagian);
      
      const results: any = {};
      
      for (const vote of bagianVotes) {
        for (const [kandidatNip, scores] of Object.entries(vote.votes)) {
          if (!results[kandidatNip]) {
            results[kandidatNip] = { totalScore: 0 };
          }
          
          const kandidatScores: any = scores;
          for (const score of Object.values(kandidatScores)) {
            results[kandidatNip].totalScore += score as number;
          }
        }
      }

      // Cari kandidat dengan score tertinggi
      let winnerNip = null;
      let maxScore = 0;

      for (const [nip, data] of Object.entries(results)) {
        const result: any = data;
        if (result.totalScore > maxScore) {
          maxScore = result.totalScore;
          winnerNip = nip;
        }
      }

      if (winnerNip) {
        // Get kandidat info
        const kandidatList = await kv.get(`kandidat_${bagian}`) || [];
        const kandidat = kandidatList.find((k: any) => k.nip === winnerNip);
        
        winners[bagian] = {
          ...kandidat,
          totalScore: maxScore
        };
      }
    }

    return c.json({ winners });
  } catch (error) {
    console.log(`Get winners phase 1 error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Submit voting tahap 2
app.post(`${prefix}/vote/phase2`, async (c) => {
  try {
    const { nip, votes } = await c.req.json();
    
    if (!nip || !votes) {
      return c.json({ error: 'NIP dan votes wajib diisi' }, 400);
    }

    // Cek pegawai
    const pegawai = await kv.get(`pegawai_${nip}`);
    if (!pegawai) {
      return c.json({ error: 'Pegawai tidak ditemukan' }, 404);
    }

    // Cek apakah sudah voting
    if (pegawai.hasVotedPhase2) {
      return c.json({ error: 'Anda sudah melakukan voting tahap 2' }, 403);
    }

    // Simpan votes (format: { criteria: kandidatNip })
    await kv.set(`vote_phase2_${nip}`, {
      nip,
      votes,
      timestamp: new Date().toISOString()
    });

    // Update status pegawai
    pegawai.hasVotedPhase2 = true;
    await kv.set(`pegawai_${nip}`, pegawai);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Vote phase 2 error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get hasil voting tahap 2
app.get(`${prefix}/results/phase2`, async (c) => {
  try {
    const votes = await kv.getByPrefix('vote_phase2_');
    
    // Hitung per kandidat per kriteria
    const results: any = {};
    
    for (const vote of votes) {
      for (const [criteria, kandidatNip] of Object.entries(vote.votes)) {
        if (!results[kandidatNip as string]) {
          results[kandidatNip as string] = {
            totalVotes: 0,
            criteria: {}
          };
        }
        
        if (!results[kandidatNip as string].criteria[criteria]) {
          results[kandidatNip as string].criteria[criteria] = 0;
        }
        
        results[kandidatNip as string].criteria[criteria] += 1;
        results[kandidatNip as string].totalVotes += 1;
      }
    }

    return c.json({ results, totalVotes: votes.length });
  } catch (error) {
    console.log(`Get results phase 2 error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get pemenang final tahap 2
app.get(`${prefix}/winner/final`, async (c) => {
  try {
    const votes = await kv.getByPrefix('vote_phase2_');
    const results: any = {};
    
    for (const vote of votes) {
      for (const kandidatNip of Object.values(vote.votes)) {
        if (!results[kandidatNip as string]) {
          results[kandidatNip as string] = 0;
        }
        results[kandidatNip as string] += 1;
      }
    }

    // Cari kandidat dengan votes terbanyak
    let winnerNip = null;
    let maxVotes = 0;

    for (const [nip, votes] of Object.entries(results)) {
      if ((votes as number) > maxVotes) {
        maxVotes = votes as number;
        winnerNip = nip;
      }
    }

    // Get kandidat info dari pemenang tahap 1
    if (winnerNip) {
      const winners = await kv.getByPrefix('kandidat_');
      let winnerInfo = null;

      for (const kandidatList of winners) {
        const found = kandidatList.find((k: any) => k.nip === winnerNip);
        if (found) {
          winnerInfo = found;
          break;
        }
      }

      return c.json({ 
        winner: {
          ...winnerInfo,
          totalVotes: maxVotes
        }
      });
    }

    return c.json({ winner: null });
  } catch (error) {
    console.log(`Get final winner error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get status voting (siapa saja yang sudah vote)
app.get(`${prefix}/voting-status`, async (c) => {
  try {
    const pegawaiList = await kv.getByPrefix('pegawai_');
    
    const status = {
      phase1: {
        voted: 0,
        notVoted: 0,
        voters: [] as any[]
      },
      phase2: {
        voted: 0,
        notVoted: 0,
        voters: [] as any[]
      }
    };

    for (const pegawai of pegawaiList) {
      if (pegawai.hasVotedPhase1) {
        status.phase1.voted += 1;
        status.phase1.voters.push({ nip: pegawai.nip, nama: pegawai.nama, bagian: pegawai.bagian });
      } else {
        status.phase1.notVoted += 1;
      }

      if (pegawai.hasVotedPhase2) {
        status.phase2.voted += 1;
        status.phase2.voters.push({ nip: pegawai.nip, nama: pegawai.nama, bagian: pegawai.bagian });
      } else {
        status.phase2.notVoted += 1;
      }
    }

    return c.json({ status });
  } catch (error) {
    console.log(`Get voting status error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Update current phase
app.post(`${prefix}/phase`, async (c) => {
  try {
    const { phase } = await c.req.json();
    
    if (![1, 2, 3].includes(phase)) {
      return c.json({ error: 'Phase harus 1, 2, atau 3' }, 400);
    }

    await kv.set('current_phase', phase);

    return c.json({ success: true, phase });
  } catch (error) {
    console.log(`Update phase error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get current phase
app.get(`${prefix}/phase`, async (c) => {
  try {
    const phase = await kv.get('current_phase') || 1;
    return c.json({ phase });
  } catch (error) {
    console.log(`Get phase error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Reset voting
app.post(`${prefix}/reset`, async (c) => {
  try {
    const { resetType } = await c.req.json();
    
    console.log(`Resetting data: ${resetType}`);
    
    if (resetType === 'phase1') {
      // Hapus semua vote phase 1 dengan cara yang benar
      const votes = await kv.getByPrefix('vote_phase1_');
      console.log(`Found ${votes.length} phase1 votes to delete`);
      
      for (const vote of votes) {
        await kv.del(`vote_phase1_${vote.nip}`);
      }
      
      // Reset status pegawai
      const pegawaiList = await kv.getByPrefix('pegawai_');
      console.log(`Resetting ${pegawaiList.length} pegawai phase1 status`);
      
      for (const pegawai of pegawaiList) {
        pegawai.hasVotedPhase1 = false;
        await kv.set(`pegawai_${pegawai.nip}`, pegawai);
      }
      
      console.log('Phase 1 reset completed');
    } else if (resetType === 'phase2') {
      // Hapus semua vote phase 2
      const votes = await kv.getByPrefix('vote_phase2_');
      console.log(`Found ${votes.length} phase2 votes to delete`);
      
      for (const vote of votes) {
        await kv.del(`vote_phase2_${vote.nip}`);
      }
      
      // Reset status pegawai
      const pegawaiList = await kv.getByPrefix('pegawai_');
      console.log(`Resetting ${pegawaiList.length} pegawai phase2 status`);
      
      for (const pegawai of pegawaiList) {
        pegawai.hasVotedPhase2 = false;
        await kv.set(`pegawai_${pegawai.nip}`, pegawai);
      }
      
      console.log('Phase 2 reset completed');
    } else if (resetType === 'all') {
      // Reset semua data dengan benar
      console.log('Starting full reset...');
      
      // Hapus votes phase 1
      const votes1 = await kv.getByPrefix('vote_phase1_');
      for (const vote of votes1) {
        await kv.del(`vote_phase1_${vote.nip}`);
      }
      
      // Hapus votes phase 2
      const votes2 = await kv.getByPrefix('vote_phase2_');
      for (const vote of votes2) {
        await kv.del(`vote_phase2_${vote.nip}`);
      }
      
      // Hapus pegawai
      const pegawaiList = await kv.getByPrefix('pegawai_');
      for (const pegawai of pegawaiList) {
        await kv.del(`pegawai_${pegawai.nip}`);
      }
      
      // Hapus kandidat
      const bagianList = await kv.get('bagian') || [];
      for (const bagian of bagianList) {
        await kv.del(`kandidat_${bagian}`);
      }
      
      // Reset phase
      await kv.set('current_phase', 1);
      
      console.log('Full reset completed');
    }

    return c.json({ success: true, message: 'Reset berhasil' });
  } catch (error) {
    console.log(`Reset error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Delete kandidat
app.delete(`${prefix}/kandidat/:bagian/:nip`, async (c) => {
  try {
    const bagian = c.req.param('bagian');
    const nip = c.req.param('nip');
    
    const kandidatList = await kv.get(`kandidat_${bagian}`) || [];
    const filtered = kandidatList.filter((k: any) => k.nip !== nip);
    
    await kv.set(`kandidat_${bagian}`, filtered);

    return c.json({ success: true, kandidat: filtered });
  } catch (error) {
    console.log(`Delete kandidat error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get all pegawai
app.get(`${prefix}/pegawai`, async (c) => {
  try {
    const pegawaiList = await kv.getByPrefix('pegawai_');
    return c.json({ pegawai: pegawaiList });
  } catch (error) {
    console.log(`Get pegawai error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Update pegawai
app.put(`${prefix}/pegawai/:nip`, async (c) => {
  try {
    const nip = c.req.param('nip');
    const { nama, bagian } = await c.req.json();

    // Get existing pegawai
    const existingPegawai = await kv.get(`pegawai_${nip}`);
    if (!existingPegawai) {
      return c.json({ error: 'Pegawai tidak ditemukan' }, 404);
    }

    // Update pegawai data
    const updatedPegawai = {
      ...existingPegawai,
      nama,
      bagian,
    };

    await kv.set(`pegawai_${nip}`, updatedPegawai);

    return c.json({ success: true, pegawai: updatedPegawai });
  } catch (error) {
    console.log(`Update pegawai error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Delete pegawai
app.delete(`${prefix}/pegawai/:nip`, async (c) => {
  try {
    const nip = c.req.param('nip');

    // Check if pegawai exists
    const existingPegawai = await kv.get(`pegawai_${nip}`);
    if (!existingPegawai) {
      return c.json({ error: 'Pegawai tidak ditemukan' }, 404);
    }

    // Delete pegawai
    await kv.del(`pegawai_${nip}`);

    // Also delete their votes if any
    await kv.del(`vote_phase1_${nip}`);
    await kv.del(`vote_phase2_${nip}`);

    return c.json({ success: true, message: 'Pegawai berhasil dihapus' });
  } catch (error) {
    console.log(`Delete pegawai error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);