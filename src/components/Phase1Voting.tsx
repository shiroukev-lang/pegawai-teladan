import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl, getHeaders } from '../utils/api-config';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { StarRating } from './StarRating';
import { CheckCircle2, AlertCircle } from 'lucide-react';
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

export function Phase1Voting() {
  const navigate = useNavigate();
  const [pegawai, setPegawai] = useState<any>(null);
  const [kandidat, setKandidat] = useState<any[]>([]);
  const [votes, setVotes] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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

    const parsedPegawai = JSON.parse(pegawaiData);
    setPegawai(parsedPegawai);

    // Cek apakah sudah voting
    if (parsedPegawai.hasVotedPhase1) {
      navigate('/phase1/results');
      return;
    }

    fetchKandidat(parsedPegawai.bagian);
  }, [navigate]);

  const fetchKandidat = async (bagian: string) => {
    try {
      const response = await fetch(getApiUrl(`/kandidat/${encodeURIComponent(bagian)}`), {
        headers: getHeaders(),
      });

      const data = await response.json();

      if (response.ok) {
        setKandidat(data.kandidat);
        
        // Initialize votes
        const initialVotes: any = {};
        data.kandidat.forEach((k: any) => {
          initialVotes[k.nip] = {};
          CRITERIA.forEach((criteria) => {
            initialVotes[k.nip][criteria] = 0;
          });
        });
        setVotes(initialVotes);
      }
    } catch (err) {
      console.error('Fetch kandidat error:', err);
      setError('Gagal memuat data kandidat');
    }
  };

  const handleRatingChange = (kandidatNip: string, criteria: string, rating: number) => {
    setVotes((prev: any) => ({
      ...prev,
      [kandidatNip]: {
        ...prev[kandidatNip],
        [criteria]: rating,
      },
    }));
  };

  const isFormComplete = () => {
    for (const kandidatNip of Object.keys(votes)) {
      for (const criteria of CRITERIA) {
        if (votes[kandidatNip][criteria] === 0) {
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!isFormComplete()) {
      setError('Harap berikan nilai untuk semua kandidat dan semua kriteria');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(getApiUrl('/vote/phase1'), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ nip: pegawai.nip, votes }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Gagal menyimpan voting');
        setLoading(false);
        return;
      }

      setSuccess(true);
      
      // Update pegawai data
      const updatedPegawai = { ...pegawai, hasVotedPhase1: true };
      sessionStorage.setItem('pegawai', JSON.stringify(updatedPegawai));

      // Redirect ke results setelah 2 detik
      setTimeout(() => {
        navigate('/phase1/results');
      }, 2000);
    } catch (err) {
      console.error('Submit voting error:', err);
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (!pegawai) {
    return null;
  }

  return (
    <HeaderWithLogos
      title="Voting Tahap 1 - Pemilihan Pegawai Teladan"
      subtitle="Inspektorat Jenderal"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <p className="text-gray-600">
            {pegawai.bagian} • {pegawai.nama} ({pegawai.nip})
          </p>
          <p className="text-sm text-gray-500">
            Berikan nilai 1-5 untuk setiap kandidat pada setiap kriteria
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Voting berhasil disimpan! Mengalihkan ke hasil...
            </AlertDescription>
          </Alert>
        )}

        {kandidat.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">
                Belum ada kandidat untuk bagian ini. Hubungi admin.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {kandidat.map((k) => (
              <Card key={k.nip} className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center gap-4">
                    <img
                      src={k.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(k.nama)}&background=random`}
                      alt={k.nama}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(k.nama)}&background=random`;
                      }}
                    />
                    <div>
                      <CardTitle>{k.nama}</CardTitle>
                      <CardDescription>NIP: {k.nip}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {CRITERIA.map((criteria) => (
                      <div
                        key={criteria}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <span className="flex-1">{criteria}</span>
                        <StarRating
                          rating={votes[k.nip]?.[criteria] || 0}
                          onRatingChange={(rating) =>
                            handleRatingChange(k.nip, criteria, rating)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-center pt-4">
              <Button
                onClick={handleSubmit}
                disabled={loading || !isFormComplete() || success}
                size="lg"
                className="px-12"
              >
                {loading ? 'Menyimpan...' : 'Submit Voting'}
              </Button>
            </div>

            {!isFormComplete() && (
              <p className="text-sm text-center text-amber-600">
                Pastikan semua kandidat sudah dinilai pada semua kriteria
              </p>
            )}
          </div>
        )}
      </div>
    </HeaderWithLogos>
  );
}