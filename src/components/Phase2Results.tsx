import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl, getHeaders } from '../utils/api-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trophy, Award } from 'lucide-react';
import { Badge } from './ui/badge';
import { HeaderWithLogos } from './HeaderWithLogos';

const CRITERIA = [
  'Berorientasi Pelayanan',
  'Akuntabel',
  'Kompeten',
  'Harmonis',
  'Loyal',
  'Adaptif',
  'Kolaboratif',
];

export function Phase2Results() {
  const navigate = useNavigate();
  const [pegawai, setPegawai] = useState<any>(null);
  const [results, setResults] = useState<any>({});
  const [finalWinner, setFinalWinner] = useState<any>(null);
  const [kandidatList, setKandidatList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPhase, setCurrentPhase] = useState<number | null>(null);

  // Fetch current phase from server
  useEffect(() => {
    const fetchCurrentPhase = async () => {
      try {
        const response = await fetch(getApiUrl('/phase'), {
          headers: getHeaders(),
        });
        const data = await response.json();
        setCurrentPhase(data.phase);
      } catch (err) {
        console.error('Fetch phase error:', err);
      }
    };
    fetchCurrentPhase();
  }, []);

  // Validasi phase - redirect jika bukan phase 2
  useEffect(() => {
    if (currentPhase !== null && currentPhase !== 2) {
      navigate('/vote');
    }
  }, [currentPhase, navigate]);

  useEffect(() => {
    const pegawaiData = sessionStorage.getItem('pegawai');
    if (!pegawaiData) {
      navigate('/vote');
      return;
    }

    setPegawai(JSON.parse(pegawaiData));
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      // Fetch winners dari tahap 1
      const winnersResponse = await fetch(getApiUrl('/winners/phase1'), {
        headers: getHeaders(),
      });
      const winnersData = await winnersResponse.json();
      const list = Object.values(winnersData.winners).filter((w: any) => w !== null);
      setKandidatList(list);

      // Fetch results tahap 2
      const resultsResponse = await fetch(getApiUrl('/results/phase2'), {
        headers: getHeaders(),
      });
      const resultsData = await resultsResponse.json();
      setResults(resultsData.results);

      // Fetch final winner
      const winnerResponse = await fetch(getApiUrl('/winner/final'), {
        headers: getHeaders(),
      });
      const winnerData = await winnerResponse.json();
      setFinalWinner(winnerData.winner);
    } catch (err) {
      console.error('Fetch data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBarChartData = () => {
    const totalVoters = getTotalVoters();
    const maxPossibleVotes = 7 * totalVoters; // 7 kriteria × total voter
    
    return kandidatList.map((kandidat) => {
      const votes = results[kandidat.nip]?.totalVotes || 0;
      const percentage = maxPossibleVotes > 0 ? (votes / maxPossibleVotes) * 100 : 0;
      return {
        nama: kandidat.nama,
        votes: parseFloat(percentage.toFixed(2)),
      };
    });
  };

  // Hitung total voter dari max voting di semua kriteria
  const getTotalVoters = () => {
    let maxVotes = 0;
    CRITERIA.forEach((criteria) => {
      let totalForCriteria = 0;
      kandidatList.forEach((kandidat) => {
        totalForCriteria += results[kandidat.nip]?.criteria[criteria] || 0;
      });
      maxVotes = Math.max(maxVotes, totalForCriteria);
    });
    return maxVotes || 1; // Minimal 1 untuk avoid division by zero
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Memuat data...</p>
      </div>
    );
  }

  if (!pegawai) {
    return null;
  }

  return (
    <HeaderWithLogos
      title="Hasil Voting Tahap 2 - Final"
      subtitle="Pemilihan Pegawai Teladan Inspektorat Jenderal"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {finalWinner && (
          <Card className="shadow-2xl border-4 border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-yellow-400 p-6 rounded-full">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl">Pegawai Teladan</CardTitle>
              <CardDescription className="text-lg">
                Pemenang Pemilihan Pegawai Teladan
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <img
                  src={finalWinner.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(finalWinner.nama)}&size=150&background=fbbf24`}
                  alt={finalWinner.nama}
                  className="w-32 h-32 rounded-full object-cover border-8 border-yellow-400 shadow-xl"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(finalWinner.nama)}&size=150&background=fbbf24`;
                  }}
                />
              </div>
              <h2 className="text-4xl text-amber-700">{finalWinner.nama}</h2>
              <p className="text-lg text-gray-600">{finalWinner.bagian}</p>
              <p className="text-sm text-gray-500">NIP: {finalWinner.nip}</p>
              <div className="flex flex-col gap-2 items-center">
                <Badge className="text-lg py-2 px-6 bg-yellow-500">
                  Total Vote: {finalWinner.totalVotes}
                </Badge>
                <Badge variant="secondary" className="text-lg py-2 px-6">
                  Nilai Akhir: {((finalWinner.totalVotes / (getTotalVoters() * 7)) * 100).toFixed(2)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-6 h-6 text-blue-600" />
              Perbandingan Nilai Akhir
            </CardTitle>
            <CardDescription>
              Grafik menampilkan nilai akhir (persentase) untuk setiap kandidat
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={getBarChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nama" />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  formatter={(value) => `${value}%`}
                  labelFormatter={(label) => `${label}`}
                />
                <Legend />
                <Bar dataKey="votes" fill="#8b5cf6" name="Nilai Akhir (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </HeaderWithLogos>
  );
}