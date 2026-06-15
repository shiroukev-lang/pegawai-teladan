import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl, getHeaders } from '../utils/api-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Trophy } from 'lucide-react';
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

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];

export function Phase1Results() {
  const navigate = useNavigate();
  const [pegawai, setPegawai] = useState<any>(null);
  const [kandidat, setKandidat] = useState<any[]>([]);
  const [results, setResults] = useState<any>({});
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

  // Validasi phase - redirect jika bukan phase 1
  useEffect(() => {
    if (currentPhase !== null && currentPhase !== 1) {
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
    fetchData(JSON.parse(pegawaiData).bagian);
  }, [navigate]);

  const fetchData = async (bagian: string) => {
    try {
      // Fetch kandidat
      const kandidatResponse = await fetch(getApiUrl(`/kandidat/${encodeURIComponent(bagian)}`), {
        headers: getHeaders(),
      });
      const kandidatData = await kandidatResponse.json();
      setKandidat(kandidatData.kandidat);

      // Fetch results
      const resultsResponse = await fetch(getApiUrl('/results/phase1'), {
        headers: getHeaders(),
      });
      const resultsData = await resultsResponse.json();
      setResults(resultsData.results);
    } catch (err) {
      console.error('Fetch data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLineChartData = () => {
    return CRITERIA.map((criteria) => {
      const dataPoint: any = { criteria: criteria.substring(0, 15) };
      
      kandidat.forEach((k) => {
        const totalScore = results[k.nip]?.scores[criteria] || 0;
        const voterCount = results[k.nip]?.count || 1;
        const avgScore = voterCount > 0 ? totalScore / voterCount : 0;
        dataPoint[k.nama] = Number(avgScore.toFixed(2));
      });

      return dataPoint;
    });
  };

  const getRadarChartData = (kandidatNip: string) => {
    return CRITERIA.map((criteria) => {
      const totalScore = results[kandidatNip]?.scores[criteria] || 0;
      const voterCount = results[kandidatNip]?.count || 1;
      const avgScore = voterCount > 0 ? totalScore / voterCount : 0;
      return {
        criteria: criteria,
        nilai: Number(avgScore.toFixed(2)),
      };
    });
  };

  const getBarChartData = () => {
    return kandidat.map((k) => {
      const totalScore = results[k.nip]?.totalScore || 0;
      const voterCount = results[k.nip]?.count || 1;
      const avgScore = voterCount > 0 ? totalScore / voterCount : 0;
      const nilaiAkhir = (avgScore / 35) * 100; // 35 = 7 kriteria × 5 skor maksimal
      return {
        nama: k.nama,
        nilaiAkhir: Number(nilaiAkhir.toFixed(2)),
        avgScore: Number(avgScore.toFixed(2)),
      };
    });
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
      title="Hasil Voting Tahap 1"
      subtitle={pegawai.bagian}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
            <CardTitle>Peringkat Kandidat</CardTitle>
            <CardDescription>
              Bar chart menampilkan peringkat kandidat berdasarkan nilai akhir
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={getBarChartData()}>
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
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Perbandingan Semua Kandidat
            </CardTitle>
            <CardDescription>
              Grafik line menampilkan perbandingan nilai semua kandidat
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={getLineChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="criteria" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                {kandidat.map((k, index) => (
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
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle>Grafik Individual Kandidat</CardTitle>
            <CardDescription>
              Radar chart menampilkan profil nilai masing-masing kandidat
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue={kandidat[0]?.nip} className="w-full">
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${kandidat.length}, 1fr)` }}>
                {kandidat.map((k) => (
                  <TabsTrigger key={k.nip} value={k.nip}>
                    {k.nama}
                  </TabsTrigger>
                ))}
              </TabsList>

              {kandidat.map((k) => (
                <TabsContent key={k.nip} value={k.nip}>
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-xl">{k.nama}</h3>
                      <p className="text-sm text-gray-500">NIP: {k.nip}</p>
                      <p className="text-lg mt-2">
                        Average Score: <span className="font-semibold text-blue-600">
                          {((results[k.nip]?.totalScore || 0) / (results[k.nip]?.count || 1)).toFixed(2)}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Voter: {results[k.nip]?.count || 0}
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
                        const totalScore = results[k.nip]?.scores[criteria] || 0;
                        const voterCount = results[k.nip]?.count || 1;
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
          </CardContent>
        </Card>
      </div>
    </HeaderWithLogos>
  );
}