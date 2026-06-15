import { useState, useEffect, useMemo } from 'react';
import { getApiUrl, getHeaders } from '../utils/api-config';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import {
  Users,
  UserPlus,
  Settings,
  BarChart3,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Copy,
  Trash2,
  LogOut,
  Trophy,
  Award,
  Crown,
  SquarePen,
  Trash,
  Edit,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AdminPasswordDialog, logoutAdmin, AdminLevel } from './AdminPasswordDialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar } from 'recharts';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { logoPengayoman, logoInspektorat } from './assets/logos';

const BAGIAN_LIST = [
  'Sekretariat Inspektorat Jenderal',
  'Inspektorat Wilayah I',
  'Inspektorat Wilayah II',
  'Inspektorat Wilayah III',
  'Inspektorat Wilayah IV',
  'Inspektorat Wilayah V'
];

const CRITERIA = [
  'Berorientasi Pelayanan',
  'Akuntabel',
  'Kompeten',
  'Harmonis',
  'Loyal',
  'Adaptif',
  'Kolaboratif',
];

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminLevel, setAdminLevel] = useState<AdminLevel>('admin');
  const [currentPhase, setCurrentPhase] = useState(1);
  const [pegawaiList, setPegawaiList] = useState<any[]>([]);
  const [kandidatData, setKandidatData] = useState<any>({});
  const [votingStatus, setVotingStatus] = useState<any>(null);
  const [phase1Results, setPhase1Results] = useState<any>({});
  const [phase2Results, setPhase2Results] = useState<any>({});
  const [finalWinner, setFinalWinner] = useState<any>(null);
  
  // Form states
  const [newPegawai, setNewPegawai] = useState({ nip: '', nama: '', bagian: '' });
  const [newKandidat, setNewKandidat] = useState({ nip: '', nama: '', bagian: '', photoUrl: '' });
  const [generatedLink, setGeneratedLink] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [pegawaiQuery, setPegawaiQuery] = useState('');

  // Grafik states
  const [selectedBagian, setSelectedBagian] = useState(BAGIAN_LIST[0]);
  const [selectedBagianTahap1, setSelectedBagianTahap1] = useState(BAGIAN_LIST[0]);
  const [bagianKandidat, setBagianKandidat] = useState<any[]>([]);
  const [phase2KandidatList, setPhase2KandidatList] = useState<any[]>([]);

  // Edit kandidat states
  const [editingCandidate, setEditingCandidate] = useState<any | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ nip: '', nama: '', bagian: '', photoUrl: '' });

  // Edit pegawai states
  const [editingPegawai, setEditingPegawai] =
    useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] =
    useState(false);
 

  // Jangan load data sebelum authenticated
  useEffect(() => {
    if (isAuthenticated) {
      initializeSystem();
    }
  }, [isAuthenticated]);

  const initializeSystem = async () => {
    try {
      // Auto-initialize sistem jika belum
      await fetch(getApiUrl('/initialize'), {
        method: 'POST',
        headers: getHeaders(),
      });
      
      // Fetch all data setelah initialize
      await fetchAllData();
    } catch (err) {
      console.error('Initialize error:', err);
    }
  };

  const fetchAllData = async () => {
    try {
      // Fetch current phase
      const phaseRes = await fetch(getApiUrl('/phase'), { headers: getHeaders() });
      const phaseData = await phaseRes.json();
      setCurrentPhase(phaseData.phase || 1);

      // Fetch pegawai
      const pegawaiRes = await fetch(getApiUrl('/pegawai'), { headers: getHeaders() });
      const pegawaiData = await pegawaiRes.json();
      setPegawaiList(pegawaiData.pegawai || []);

      // Fetch kandidat
      const kandidatRes = await fetch(getApiUrl('/kandidat'), { headers: getHeaders() });
      const kandidatResData = await kandidatRes.json();
      setKandidatData(kandidatResData.kandidat || {});

      // Fetch voting status
      const statusRes = await fetch(getApiUrl('/voting-status'), { headers: getHeaders() });
      const statusData = await statusRes.json();
      setVotingStatus(statusData.status);

      // Fetch phase 1 results
      const phase1Res = await fetch(getApiUrl('/results/phase1'), { headers: getHeaders() });
      const phase1Data = await phase1Res.json();
      setPhase1Results(phase1Data.results || {});

      // Fetch phase 2 results
      const phase2Res = await fetch(getApiUrl('/results/phase2'), { headers: getHeaders() });
      const phase2Data = await phase2Res.json();
      setPhase2Results(phase2Data.results || {});

      // Fetch final winner
      const winnerRes = await fetch(getApiUrl('/winner/final'), { headers: getHeaders() });
      const winnerData = await winnerRes.json();
      setFinalWinner(winnerData.winner);
    } catch (err) {
      console.error('Fetch data error:', err);
    }
  };

  const handleGenerateLink = async () => {
    if (!newPegawai.nip || !newPegawai.nama || !newPegawai.bagian) {
      setMessage({ type: 'error', text: 'Semua field harus diisi' });
      return;
    }

    try {
      const response = await fetch(getApiUrl('/generate-link'), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newPegawai),
      });

      const data = await response.json();

      if (response.ok) {
        const fullLink = `${window.location.origin}${data.link}`;
        setGeneratedLink(fullLink);
        setMessage({ type: 'success', text: 'Link berhasil dibuat!' });
        setNewPegawai({ nip: '', nama: '', bagian: '' });
        fetchAllData();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      console.error('Generate link error:', err);
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    }
  };

  const filteredPegawai = useMemo(() => {
      const q = pegawaiQuery.trim().toLowerCase();
      if (!q) return pegawaiList;
      return pegawaiList.filter((p: any) => {
        const nip = (p.nip || '').toString().toLowerCase();
        const nama = (p.nama || '').toString().toLowerCase();
        const bagian = (p.bagian || '').toString().toLowerCase();
        return nip.includes(q) || nama.includes(q) || bagian.includes(q);
      });
    }, [pegawaiList, pegawaiQuery]);

    // Handle edit pegawai
    const handleEditPegawai = (pegawai: any) => {
    setEditingPegawai({ ...pegawai });
    setIsEditDialogOpen(true);
  };

  // Handle update pegawai
  const handleUpdatePegawai = async () => {
    if (
      !editingPegawai.nip ||
      !editingPegawai.nama ||
      !editingPegawai.bagian
    ) {
      setMessage({
        type: "error",
        text: "Semua field harus diisi",
      });
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/pegawai/${editingPegawai.nip}`), {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ nama: editingPegawai.nama, bagian: editingPegawai.bagian }),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Pegawai berhasil diupdate!",
        });
        setIsEditDialogOpen(false);
        setEditingPegawai(null);
        fetchAllData();
      } else {
        const data = await response.json();
        setMessage({
          type: "error",
          text: data.error || "Gagal mengupdate pegawai",
        });
      }
    } catch (err) {
      console.error("Update pegawai error:", err);
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    }
  };

  // Handle delete pegawai
  const handleDeletePegawai = async (nip: string) => {
    if (
      !confirm(
        "Yakin ingin menghapus pegawai ini? Data voting pegawai juga akan terhapus!",
      )
    )
      return;

    try {
      const response = await fetch(getApiUrl(`/pegawai/${nip}`), {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Pegawai berhasil dihapus!",
        });
        fetchAllData();
      } else {
        const data = await response.json();
        setMessage({
          type: "error",
          text: data.error || "Gagal menghapus pegawai",
        });
      }
    } catch (err) {
      console.error("Delete pegawai error:", err);
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    }
  };

  // Handle Add Kandidat
  const handleAddKandidat = async () => {
    if (!newKandidat.nip || !newKandidat.nama || !newKandidat.bagian) {
      setMessage({ type: 'error', text: 'Semua field harus diisi' });
      return;
    }

    setMessage({ type: '', text: '' }); // Clear previous messages

    try {
      console.log('Menambah kandidat:', newKandidat);
      
      const response = await fetch(getApiUrl('/kandidat'), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newKandidat),
      });

      const data = await response.json();
      console.log('Response dari server:', response.status, data);

      if (response.ok) {
        setMessage({ type: 'success', text: 'Kandidat berhasil ditambahkan!' });
        setNewKandidat({ nip: '', nama: '', bagian: '', photoUrl: '' });
        await fetchAllData();
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal menambahkan kandidat' });
        console.error('Error response:', data);
      }
    } catch (err) {
      console.error('Add kandidat error:', err);
      setMessage({ type: 'error', text: `Terjadi kesalahan: ${err}` });
    }
  };

  const openEditCandidate = (candidate: any, bagianFrom?: string) => {
    const withBagian = { ...(candidate || {}), bagian: candidate?.bagian || bagianFrom || '' };
    setEditingCandidate(withBagian);
    setEditForm({
      nip: withBagian.nip || '',
      nama: withBagian.nama || '',
      bagian: withBagian.bagian || '',
      photoUrl: withBagian.photoUrl || ''
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingCandidate) return;
    if (!editForm.nip || !editForm.nama || !editForm.bagian) {
      setMessage({ type: 'error', text: 'NIP, Nama, dan Bagian harus diisi' });
      return;
    }

    try {
      
      const originalNip = editingCandidate.nip;
      const originalBagian = editingCandidate.bagian;

      // Hapus kandidat lama
      await fetch(getApiUrl(`/kandidat/${encodeURIComponent(originalBagian)}/${encodeURIComponent(originalNip)}`), {
        method: 'DELETE',
        headers: getHeaders(),
      });

      // Tambah kandidat baru dengan data yang diupdate
      const response = await fetch(getApiUrl('/kandidat'), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(editForm),
      });

      const data = await response.json();
      console.log('Save edit response:', response.status, data);

      if (response.ok) {
        setMessage({ type: 'success', text: 'Kandidat berhasil diperbarui!' });
        setEditDialogOpen(false);
        setEditingCandidate(null);
        await fetchAllData();
      } else {
        // setMessage({ type: 'error', text: data.error || 'Gagal memperbarui kandidat' });
        setMessage({ type: 'error', text: `Gagal: ${data.error || data.message || 'Terjadi kesalahan'}` });
        console.error('Error response:', data);}
    } catch (err) {
      console.error('Update kandidat error:', err);
      // setMessage({ type: 'error', text: 'Terjadi kesalahan saat menyimpan' });
      setMessage({ type: 'error', text: `Terjadi kesalahan: ${err instanceof Error ? err.message : String(err)}` });
    }
  };

  const handleDeleteKandidat = async (bagian: string, nip: string) => {
    if (!confirm('Yakin ingin menghapus kandidat ini?')) return;

    try {
      const response = await fetch(getApiUrl(`/kandidat/${encodeURIComponent(bagian)}/${nip}`), {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Kandidat berhasil dihapus!' });
        fetchAllData();
      }
    } catch (err) {
      console.error('Delete kandidat error:', err);
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    }
  };

  const handleUpdatePhase = async (phase: number) => {
    try {
      const response = await fetch(getApiUrl('/phase'), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ phase }),
      });

      if (response.ok) {
        setCurrentPhase(phase);
        setMessage({ type: 'success', text: `Phase diubah ke ${phase}` });
      }
    } catch (err) {
      console.error('Update phase error:', err);
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    }
  };

  const handleReset = async (resetType: string) => {
    if (!confirm(`Yakin ingin reset ${resetType}? Data tidak dapat dikembalikan!`)) return;

    try {
      const response = await fetch(getApiUrl('/reset'), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ resetType }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Reset berhasil!' });
        fetchAllData();
      }
    } catch (err) {
      console.error('Reset error:', err);
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage({ type: 'success', text: 'Link disalin ke clipboard!' });
    } catch (err) {
      // Fallback untuk browser yang tidak support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setMessage({ type: 'success', text: 'Link disalin ke clipboard!' });
      } catch (fallbackErr) {
        console.error('Copy to clipboard failed:', fallbackErr);
        setMessage({ type: 'error', text: 'Gagal menyalin ke clipboard. Silakan copy manual.' });
      }
      document.body.removeChild(textArea);
    }
  };

  // Helper function untuk mendapatkan data kandidat berdasarkan NIP
  const getKandidatByNip = (nip: string) => {
    for (const bagian in kandidatData) {
      const kandidat = kandidatData[bagian]?.find((k: any) => k.nip === nip);
      if (kandidat) {
        return kandidat;
      }
    }
    return null;
  };

  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => row[h]).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  useEffect(() => {
    const kandidat = kandidatData[selectedBagian] || [];
    setBagianKandidat(kandidat);
  }, [selectedBagian, kandidatData]);

  // Update bagianKandidat ketika selectedBagianTahap1 berubah untuk grafik
  useEffect(() => {
    const kandidat = kandidatData[selectedBagianTahap1] || [];
    setBagianKandidat(kandidat);
  }, [selectedBagianTahap1, kandidatData]);

  // Fetch phase 2 kandidat list saat phase2Results berubah
  useEffect(() => {
    if (Object.keys(phase2Results).length > 0) {
      fetchPhase2Winners();
    }
  }, [phase2Results]);

  const fetchPhase2Winners = async () => {
    try {
      const response = await fetch(getApiUrl('/winners/phase1'), {
        headers: getHeaders(),
      });
      const data = await response.json();
      const list = Object.values(data.winners).filter((w: any) => w !== null);
      setPhase2KandidatList(list as any[]);
    } catch (err) {
      console.error('Fetch phase2 winners error:', err);
    }
  };

  const getLineChartData = () => {
    return CRITERIA.map((criteria) => {
      const dataPoint: any = { criteria: criteria.substring(0, 15) };
      
      bagianKandidat.forEach((k) => {
        const totalScore = phase1Results[k.nip]?.scores[criteria] || 0;
        const voterCount = phase1Results[k.nip]?.count || 1;
        const avgScore = voterCount > 0 ? totalScore / voterCount : 0;
        dataPoint[k.nama] = Number( avgScore.toFixed(2) );
      });

      return dataPoint;
    });
  };

  const getRadarChartData = (kandidatNip: string) => {
    return CRITERIA.map((criteria) => {
      const totalScore = phase1Results[kandidatNip]?.scores[criteria] || 0;
      const voterCount = phase1Results[kandidatNip]?.count || 1;
      const avgScore = voterCount > 0 ? totalScore / voterCount : 0;
      return {
        criteria: criteria,
        nilai: Number( avgScore.toFixed(2) ),
      };
    });
  };

  const getBarChartDataTahap1 = () => {
    return bagianKandidat.map((k) => {
      const totalScore = phase1Results[k.nip]?.totalScore || 0;
      const voterCount = phase1Results[k.nip]?.count || 1;
      const avgScore = voterCount > 0 ? totalScore / voterCount : 0;
      const nilaiAkhir = (avgScore / 35) * 100; // 35 = 7 kriteria × 5 skor maksimal
      return {
        nama: k.nama,
        nilaiAkhir: Number(nilaiAkhir.toFixed(2)),
        avgScore: Number(avgScore.toFixed(2)),
      };
    });
  };

  // Phase 2 Functions
  const getBarChartDataPhase2 = () => {
    const totalVoters = getTotalVotersPhase2();
    const maxPossibleVotes = 7 * totalVoters; // 7 kriteria × total voter
    
    return phase2KandidatList.map((kandidat) => {
      const votes = phase2Results[kandidat.nip]?.totalVotes || 0;
      const percentage = maxPossibleVotes > 0 ? (votes / maxPossibleVotes) * 100 : 0;
      return {
        nama: kandidat.nama,
        votes: parseFloat(percentage.toFixed(2)),
      };
    });
  };

  const getTotalVotersPhase2 = () => {
    let maxVotes = 0;
    CRITERIA.forEach((criteria) => {
      let totalForCriteria = 0;
      phase2KandidatList.forEach((kandidat) => {
        totalForCriteria += phase2Results[kandidat.nip]?.criteria[criteria] || 0;
      });
      maxVotes = Math.max(maxVotes, totalForCriteria);
    });
    return maxVotes || 1;
  };

  // Get radar chart data for Phase 2 - per kandidat
  const getRadarChartDataPhase2 = (kandidatNip: string) => {
    const totalVoters = getTotalVotersPhase2();
    return CRITERIA.map((criteria) => {
      const votes = phase2Results[kandidatNip]?.criteria[criteria] || 0;
      const percentage = totalVoters > 0 ? (votes / totalVoters) * 100 : 0;
      return {
        criteria: criteria,
        nilai: Number(percentage.toFixed(2)),
      };
    });
  };

  return (
    <div className="min-h-screen p-4 py-8">
      {/* Password Dialog */}
      {!isAuthenticated && (
        <AdminPasswordDialog onAuthenticated={(level) => {
          setIsAuthenticated(true);
          setAdminLevel(level);
        }} />
      )}

      {/* Main Content - Only show when authenticated */}
      {isAuthenticated && (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Logout Button & Admin Badge - Pojok Kanan Atas */}
          <div className="flex justify-end items-center gap-3">
            <Badge variant={adminLevel === 'super_admin' ? 'default' : 'secondary'} className="text-xs">
              {adminLevel === 'super_admin' ? '🛡️ Super Admin' : '👤 Admin'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutAdmin()}
              className="flex items-center gap-1.5 text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </Button>
          </div>

          {/* Header with Logos */}
          <div className="bg-white shadow-md border-b-4 border-blue-600 rounded-lg">
            <div className="px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                {/* Logo Kiri */}
                <div className="flex-shrink-0">
                  <img
                    src={logoPengayoman}
                    alt="Logo Pengayoman - Kementerian Hukum dan HAM"
                    className="h-16 w-16 md:h-20 md:w-20 object-contain"
                  />
                </div>

                {/* Title */}
                <div className="flex-1 text-center">
                  <h1 className="text-2xl md:text-3xl text-gray-800 leading-tight">Admin Dashboard</h1>
                  <p className="text-sm md:text-base text-gray-600 mt-1">
                    Pemilihan Pegawai Teladan - Inspektorat Jenderal
                  </p>
                </div>

                {/* Logo Kanan */}
                <div className="flex-shrink-0">
                  <img
                    src={logoInspektorat}
                    alt="Logo Inspektorat Jenderal"
                    className="h-16 w-16 md:h-20 md:w-20 object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {message.text && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className={`grid w-full ${adminLevel === 'super_admin' ? 'grid-cols-3 md:grid-cols-6' : 'grid-cols-3'}`}>
              <TabsTrigger value="overview" className="text-xs md:text-sm">
                <BarChart3 className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden">Info</span>
              </TabsTrigger>
              
              {adminLevel === 'super_admin' && (
                <>
                  <TabsTrigger value="pegawai" className="text-xs md:text-sm">
                    <Users className="w-4 h-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Pegawai</span>
                    <span className="sm:hidden">Pgw</span>
                  </TabsTrigger>
                  <TabsTrigger value="kandidat" className="text-xs md:text-sm">
                    <UserPlus className="w-4 h-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Kandidat</span>
                    <span className="sm:hidden">Knd</span>
                  </TabsTrigger>
                </>
              )}
              
              <TabsTrigger value="results-phase1" className="text-xs md:text-sm">
                <Trophy className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Hasil Tahap 1</span>
                <span className="sm:hidden">T1</span>
              </TabsTrigger>
              <TabsTrigger value="results-phase2" className="text-xs md:text-sm">
                <Crown className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Hasil Tahap 2</span>
                <span className="sm:hidden">T2</span>
              </TabsTrigger>
              
              {adminLevel === 'super_admin' && (
                <TabsTrigger value="settings" className="text-xs md:text-sm">
                  <Settings className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Settings</span>
                  <span className="sm:hidden">Set</span>
                </TabsTrigger>
              )}
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Pegawai</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl">{pegawaiList.length}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Total Kandidat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl">
                      {Object.values(kandidatData).reduce((sum: number, arr: any) => sum + (arr?.length || 0), 0)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Phase Saat Ini</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge className="text-2xl py-2 px-4">
                      Phase {currentPhase}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {votingStatus && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Status Voting Tahap 1</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Sudah Voting</p>
                          <p className="text-2xl text-green-600">{votingStatus.phase1?.voted || 0}</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Belum Voting</p>
                          <p className="text-2xl text-red-600">{votingStatus.phase1?.notVoted || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Status Voting Tahap 2</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Sudah Voting</p>
                          <p className="text-2xl text-green-600">{votingStatus.phase2?.voted || 0}</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Belum Voting</p>
                          <p className="text-2xl text-red-600">{votingStatus.phase2?.notVoted || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Pegawai Tab - Super Admin Only */}
            {adminLevel === 'super_admin' && (
            <TabsContent value="pegawai" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tambah Pegawai & Generate Link</CardTitle>
                  <CardDescription>
                    Buat data pegawai dan dapatkan link voting unik
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="NIP"
                      value={newPegawai.nip}
                      onChange={(e) => setNewPegawai({ ...newPegawai, nip: e.target.value })}
                    />
                    <Input
                      placeholder="Nama Lengkap"
                      value={newPegawai.nama}
                      onChange={(e) => setNewPegawai({ ...newPegawai, nama: e.target.value })}
                    />
                    <Select
                      value={newPegawai.bagian}
                      onValueChange={(value: any) => setNewPegawai({ ...newPegawai, bagian: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Satuan Kerja" />
                      </SelectTrigger>
                      <SelectContent>
                        {BAGIAN_LIST.map((bagian) => (
                          <SelectItem key={bagian} value={bagian}>
                            {bagian}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleGenerateLink} className="w-full">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Generate Link Voting
                  </Button>

                  {generatedLink && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm mb-2">Link berhasil dibuat:</p>
                      <div className="flex gap-2">
                        <Input value={generatedLink} readOnly />
                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard(generatedLink)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Daftar Pegawai</CardTitle>
                  <CardDescription>
                    Kelola data pegawai dan link voting unik mereka
                  </CardDescription>
                  <div className="flex items-center gap-2 mt-4">
                    <Input
                      placeholder="Cari NIP, Nama, atau Satuan Kerja..."
                      value={pegawaiQuery}
                      onChange={(e) => setPegawaiQuery(e.target.value)}
                      className="max-w-lg"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPegawaiQuery('')}
                      title="Clear search"
                    >
                      Clear
                    </Button>
                    <div className="ml-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportToCSV(filteredPegawai, 'pegawai.csv')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No</TableHead>
                        <TableHead>NIP</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>URL Link</TableHead>
                        <TableHead>Satuan Kerja</TableHead>
                        <TableHead>Tahap 1</TableHead>
                        <TableHead>Tahap 2</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPegawai.length > 0 ? (
                        filteredPegawai.map((p, index) => (
                          <TableRow key={p.nip}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{p.nip}</TableCell>
                            <TableCell>{p.nama}</TableCell>
                            <TableCell>
                              {p.uniqueKey ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(`${window.location.origin}/vote?key=${p.uniqueKey}`)}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell>{p.bagian}</TableCell>
                            <TableCell>
                              {p.hasVotedPhase1 ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )}
                            </TableCell>
                            <TableCell>
                              {p.hasVotedPhase2 ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )}
                            </TableCell>
                            <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleEditPegawai(p)
                                }
                                title="Edit Pegawai"
                              >
                                <Edit className="w-4 h-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeletePegawai(p.nip)
                                }
                                title="Hapus Pegawai"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            Tidak ada pegawai ditemukan
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              {/* Edit Pegawai Dialog */}
              <Dialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Data Pegawai</DialogTitle>
                    <DialogDescription>
                      Ubah data pegawai. NIP tidak dapat diubah.
                    </DialogDescription>
                  </DialogHeader>
                  {editingPegawai && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm">NIP</label>
                        <Input
                          value={editingPegawai.nip}
                          disabled
                          className="bg-gray-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm">
                          Nama Lengkap
                        </label>
                        <Input
                          value={editingPegawai.nama}
                          onChange={(e) =>
                            setEditingPegawai({
                              ...editingPegawai,
                              nama: e.target.value,
                            })
                          }
                          placeholder="Nama Lengkap"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm">
                          Bagian
                        </label>
                        <Select
                          value={editingPegawai.bagian}
                          onValueChange={(value : any) =>
                            setEditingPegawai({
                              ...editingPegawai,
                              bagian: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Bagian" />
                          </SelectTrigger>
                          <SelectContent>
                            {BAGIAN_LIST.map((bagian) => (
                              <SelectItem
                                key={bagian}
                                value={bagian}
                              >
                                {bagian}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditDialogOpen(false);
                            setEditingPegawai(null);
                          }}
                        >
                          Batal
                        </Button>
                        <Button onClick={handleUpdatePegawai}>
                          Simpan Perubahan
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </TabsContent>
            )}

            {/* Kandidat Tab - Super Admin Only */}
            {adminLevel === 'super_admin' && (
            <TabsContent value="kandidat" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tambah Kandidat</CardTitle>
                  <CardDescription>
                    Maksimal 5 kandidat per bagian. Foto profil opsional (gunakan URL gambar)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="NIP"
                      value={newKandidat.nip}
                      onChange={(e) => setNewKandidat({ ...newKandidat, nip: e.target.value })}
                    />
                    <Input
                      placeholder="Nama Lengkap"
                      value={newKandidat.nama}
                      onChange={(e) => setNewKandidat({ ...newKandidat, nama: e.target.value })}
                    />
                    <Select
                      value={newKandidat.bagian}
                      onValueChange={(value: any) => setNewKandidat({ ...newKandidat, bagian: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Satuan Kerja" />
                      </SelectTrigger>
                      <SelectContent>
                        {BAGIAN_LIST.map((bagian) => (
                          <SelectItem key={bagian} value={bagian}>
                            {bagian}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='relative'>
                  <Input
                    placeholder="Masukan URL : `https://simpeg.kemenkum.go.id/siap/client/kumham/uploads/foto/*NIP KANDIDAT*.jpg`)"
                    value={newKandidat.photoUrl}
                    onChange={(e) => setNewKandidat({ ...newKandidat, photoUrl: e.target.value })}
                    className='pr-10'
                  />
                  <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-1/2 right-2 -translate-y-1/2"
                      onClick={() => copyToClipboard('https://simpeg.kemenkum.go.id/siap/client/kumham/uploads/foto/*NIP_KANDIDAT*.jpg')}
                      aria-label="Copy contoh URL foto"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {newKandidat.photoUrl && (
                    <div className="flex justify-center">
                      <img 
                        src={newKandidat.photoUrl} 
                        alt="Preview"
                        referrerPolicy='no-referrer' 
                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  )}

                  <Button onClick={handleAddKandidat} className="w-full">
                    Tambah Kandidat
                  </Button>
                </CardContent>
              </Card>

              {BAGIAN_LIST.map((bagian) => (
                <Card key={bagian}>
                  <CardHeader>
                    <CardTitle>{bagian}</CardTitle>
                    <CardDescription>
                      {kandidatData[bagian]?.length || 0} / 5 Kandidat
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {kandidatData[bagian]?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {kandidatData[bagian].map((k: any) => (
                          <div key={k.nip} className="flex items-center gap-4 p-4 border rounded-lg">
                            <img
                              src={k.photoUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(k.nama) + '&background=random'}
                              alt={k.nama}
                              className="w-16 h-16 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(k.nama) + '&background=random';
                              }}
                            />
                            <div className="flex-1">
                              <p className="font-semibold">{k.nama}</p>
                              <p className="text-sm text-gray-500">NIP: {k.nip}</p>
                            </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditCandidate(k, bagian)}
                                title="Edit kandidat"
                              >
                                <SquarePen className="w-4 h-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteKandidat(bagian, k.nip)}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-4">Belum ada kandidat</p>
                    )}
                  </CardContent>
                </Card>
              ))}
              {/* Edit Kandidat Dialog */}
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Kandidat</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="NIP"
                      value={editForm.nip}
                      onChange={(e) => setEditForm({ ...editForm, nip: e.target.value })}
                    />
                    <Input
                      placeholder="Nama Lengkap"
                      value={editForm.nama}
                      onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                    />
                    <Select
                      value={editForm.bagian}
                      onValueChange={(value: any) => setEditForm({ ...editForm, bagian: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BAGIAN_LIST.map((b) => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="URL Foto"
                      value={editForm.photoUrl}
                      onChange={(e) => setEditForm({ ...editForm, photoUrl: e.target.value })}
                    />
                    {/* Preview Foto */}
                    <div className="flex justify-center py-4">
                      <img
                        src={editForm.photoUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(editForm.nama) + '&background=random'}
                        alt="Preview"
                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(editForm.nama) + '&background=random';
                        }}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => { setEditDialogOpen(false); setEditingCandidate(null); }}>Batal</Button>
                      <Button onClick={handleSaveEdit}>Simpan</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              {/* ...existing code... */}
            </TabsContent>
            )}

            {/* Hasil Tahap 1 Tab */}
            <TabsContent value="results-phase1" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Hasil Tahap 1</CardTitle>
                      <CardDescription>
                        Rata-rata score per kandidat per bagian
                      </CardDescription>
                    </div>
                    <Select
                      value={selectedBagianTahap1}
                      onValueChange={setSelectedBagianTahap1}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BAGIAN_LIST.map((bagian) => (
                          <SelectItem key={bagian} value={bagian}>
                            {bagian}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No</TableHead>
                        <TableHead>NIP</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Satuan Kerja</TableHead>
                        <TableHead>Rata-rata Score</TableHead>
                        <TableHead>Jumlah Voter</TableHead>
                        <TableHead>Nilai Akhir</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(phase1Results)
                        .filter(([nip, data]: [string, any]) => {
                          const kandidat = getKandidatByNip(nip);
                          return kandidat?.bagian === selectedBagianTahap1;
                        })
                        .map(([nip, data]: [string, any]) => {
                          const avgScore = data.count > 0 ? data.totalScore / data.count : 0;
                          const nilaiAkhir = data.count > 0 ? (avgScore / 35) * 100 : 0;
                          return {
                            nip,
                            data,
                            avgScore,
                            nilaiAkhir,
                            kandidat: getKandidatByNip(nip)
                          };
                        })
                        .map(({ nip, data, avgScore, nilaiAkhir, kandidat }, index) => (
                          <TableRow key={nip}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{nip}</TableCell>
                            <TableCell>{kandidat?.nama || '-'}</TableCell>
                            <TableCell>{kandidat?.bagian || '-'}</TableCell>
                            <TableCell>
                              {data.count > 0 
                                ? avgScore.toFixed(2)
                                : '0.00'
                              }
                            </TableCell>
                            <TableCell>{data.count}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {nilaiAkhir.toFixed(2)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Bar Chart Tahap 1 */}
              <Card className="shadow-xl">
                <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Peringkat Kandidat Tahap 1</CardTitle>
                      <CardDescription>
                        Bar chart menampilkan peringkat kandidat berdasarkan nilai akhir
                      </CardDescription>
                    </div>
                    <Select
                      value={selectedBagianTahap1}
                      onValueChange={setSelectedBagianTahap1}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BAGIAN_LIST.map((bagian) => (
                          <SelectItem key={bagian} value={bagian}>
                            {bagian}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {bagianKandidat.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={getBarChartDataTahap1()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nama" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="nilaiAkhir"
                          fill="#3b82f6"
                          name="Nilai Akhir (%)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-gray-500">Belum ada data untuk bagian ini</p>
                  )}
                </CardContent>
              </Card>

              {/* Grafik Tahap 1 */}
              <Card className="shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        Grafik Perbandingan Kandidat Tahap 1
                      </CardTitle>
                      <CardDescription>
                        Pilih bagian untuk melihat grafik perbandingan dan individual kandidat
                      </CardDescription>
                    </div>
                    <Select
                      value={selectedBagianTahap1}
                      onValueChange={setSelectedBagianTahap1}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BAGIAN_LIST.map((bagian) => (
                          <SelectItem key={bagian} value={bagian}>
                            {bagian}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {bagianKandidat.length > 0 ? (
                    <>
                      {/* Line Chart - Perbandingan */}
                      <div>
                        <h3 className="text-lg mb-4">Perbandingan Semua Kandidat</h3>
                        <ResponsiveContainer width="100%" height={400}>
                          <LineChart data={getLineChartData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="criteria" />
                            <YAxis domain={[0, 5]} />
                            <Tooltip />
                            <Legend />
                            {bagianKandidat.map((k, index) => (
                              <Line
                                key={k.nip}
                                type="monotone"
                                dataKey={k.nama}
                                stroke={COLORS[index % COLORS.length]}
                                strokeWidth={2}
                                dot={{ r: 4 }}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Radar Charts - Individual */}
                      <div className="border-t pt-6">
                        <h3 className="text-lg mb-4">Grafik Individual Kandidat</h3>
                        <Tabs defaultValue={bagianKandidat[0]?.nip} className="w-full">
                          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${bagianKandidat.length}, 1fr)` }}>
                            {bagianKandidat.map((k) => (
                              <TabsTrigger key={k.nip} value={k.nip}>
                                {k.nama}
                              </TabsTrigger>
                            ))}
                          </TabsList>

                          {bagianKandidat.map((k) => (
                            <TabsContent key={k.nip} value={k.nip}>
                              <div className="space-y-4">
                                <div className="text-center">
                                  <h3 className="text-xl">{k.nama}</h3>
                                  <p className="text-sm text-gray-500">NIP: {k.nip}</p>
                                  <p className="text-lg mt-2">
                                    Average Score: <span className="font-semibold text-blue-600">
                                      {((phase1Results[k.nip]?.totalScore || 0) / (phase1Results[k.nip]?.count || 1)).toFixed(2)}
                                    </span>
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Voter: {phase1Results[k.nip]?.count || 0}
                                  </p>
                                </div>

                                <ResponsiveContainer width="100%" height={400}>
                                  <RadarChart data={getRadarChartData(k.nip)}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="criteria" />
                                    <PolarRadiusAxis domain={[0, 5]} />
                                    <Radar
                                      name={k.nama}
                                      dataKey="nilai"
                                      stroke="#8b5cf6"
                                      fill="#8b5cf6"
                                      fillOpacity={0.6}
                                    />
                                    <Tooltip />
                                  </RadarChart>
                                </ResponsiveContainer>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {CRITERIA.map((criteria) => {
                                    const totalScore = phase1Results[k.nip]?.scores[criteria] || 0;
                                    const voterCount = phase1Results[k.nip]?.count || 1;
                                    const avgScore = voterCount > 0 ? totalScore / voterCount : 0;
                                    return (
                                      <div
                                        key={criteria}
                                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                                      >
                                        <span className="text-sm">{criteria}</span>
                                        <span className="font-semibold text-blue-600">
                                          {avgScore.toFixed(2)}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </TabsContent>
                          ))}
                        </Tabs>
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      Belum ada kandidat di bagian {selectedBagianTahap1}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Hasil Tahap 2 Tab */}
            <TabsContent value="results-phase2" className="space-y-4">
              {/* Pegawai Teladan */}
              {finalWinner && (
                <Card className="border-4 border-yellow-400">
                  <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
                    <CardTitle>🏆 Pegawai Teladan</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <h2 className="text-3xl">{finalWinner.nama}</h2>
                      <p className="text-lg text-gray-600">{finalWinner.bagian}</p>
                      <p className="text-sm text-gray-500">NIP: {finalWinner.nip}</p>
                      <div className="flex flex-col gap-2 items-center">
                        <Badge className="text-lg py-2 px-6">
                          Total Vote: {finalWinner.totalVotes}
                        </Badge>
                        <Badge variant="secondary" className="text-lg py-2 px-6">
                          Nilai Akhir: {((finalWinner.totalVotes / (getTotalVotersPhase2() * 7)) * 100).toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tabel Hasil Tahap 2 */}
              <Card>
                <CardHeader>
                  <CardTitle>Hasil Tahap 2</CardTitle>
                  <CardDescription>
                    Total voting per kandidat dengan nilai akhir
                  </CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>NIP</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Bagian</TableHead>
                      <TableHead>Total Voting</TableHead>
                      <TableHead>Jumlah Voter</TableHead>
                      <TableHead>Nilai Akhir</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(phase2Results)
                      // LANGKAH 1: Hitung semua data terlebih dahulu (Mapping Data)
                      .map(([nip, data]: [string, any]) => {
                        const kandidat = getKandidatByNip(nip);
                        const totalVoters = getTotalVotersPhase2();
                        const maxPossibleVotes = totalVoters * 7; // 7 kriteria

                        // Hitung nilai akhir
                        const nilaiAkhir = maxPossibleVotes > 0
                          ? (data.totalVotes / maxPossibleVotes) * 100
                          : 0;
                      
                        // Return object baru yang lengkap
                        return {
                          nip,
                          data,
                          kandidat,
                          totalVoters,
                          nilaiAkhir
                        };
                      })
                      .map((item, index) => (
                        <TableRow key={item.nip}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{item.nip}</TableCell>
                          <TableCell>{item.kandidat?.nama || "-"}</TableCell>
                          <TableCell>{item.kandidat?.bagian || "-"}</TableCell>
                          <TableCell>{item.data.totalVotes}</TableCell>
                          <TableCell>{item.totalVoters}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {item.nilaiAkhir.toFixed(2)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                </CardContent>
              </Card>

              {/* Grafik Tahap 2 */}
              {phase2KandidatList.length > 0 && (
                <>
                  <Card className="shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-6 h-6 text-blue-600" />
                        Perbandingan Nilai Akhir Tahap 2
                      </CardTitle>
                      <CardDescription>
                        Grafik menampilkan nilai akhir (persentase) untuk setiap kandidat
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={getBarChartDataPhase2()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="nama" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="votes" fill="#8b5cf6" name="Nilai Akhir (%)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Radar Chart Individual per Kandidat Tahap 2 */}
                  <Card className="shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-6 h-6 text-purple-600" />
                        Profil Individu Kandidat - Tahap 2
                      </CardTitle>
                      <CardDescription>
                        Radar chart menampilkan persentase voting per kriteria untuk setiap kandidat
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {phase2KandidatList.map((kandidat) => (
                          <div key={kandidat.nip} className="border rounded-lg p-4 bg-white shadow-sm">
                            <div className="mb-4 text-center">
                              <h3 className="font-semibold text-lg">{kandidat.nama}</h3>
                              <p className="text-sm text-gray-500">{kandidat.bagian}</p>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                              <RadarChart data={getRadarChartDataPhase2(kandidat.nip)}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="criteria" style={{ fontSize: '11px' }} />
                                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                                <Radar
                                  name={kandidat.nama}
                                  dataKey="nilai"
                                  stroke="#8b5cf6"
                                  fill="#8b5cf6"
                                  fillOpacity={0.6}
                                />
                                <Tooltip />
                              </RadarChart>
                            </ResponsiveContainer>
                            <div className="mt-4 text-center text-sm text-gray-600">
                              Total Votes: {phase2Results[kandidat.nip]?.totalVotes || 0} / {getTotalVotersPhase2() * 7}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

            </TabsContent>

            {/* Settings Tab - Super Admin Only */}
            {adminLevel === 'super_admin' && (
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Phase</CardTitle>
                  <CardDescription>
                    Ubah phase voting saat ini
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Button
                      variant={currentPhase === 1 ? 'default' : 'outline'}
                      onClick={() => handleUpdatePhase(1)}
                    >
                      Phase 1
                    </Button>
                    <Button
                      variant={currentPhase === 2 ? 'default' : 'outline'}
                      onClick={() => handleUpdatePhase(2)}
                    >
                      Phase 2
                    </Button>
                    <Button
                      variant={currentPhase === 3 ? 'default' : 'outline'}
                      onClick={() => handleUpdatePhase(3)}
                    >
                      Selesai
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reset Data</CardTitle>
                  <CardDescription className="text-red-600">
                    Perhatian: Data yang direset tidak dapat dikembalikan!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="destructive"
                    onClick={() => handleReset('phase1')}
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset Voting Tahap 1
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReset('phase2')}
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset Voting Tahap 2
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReset('all')}
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset Semua Data
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            )}
          </Tabs>
        </div>
      )}
    </div>
  );
}