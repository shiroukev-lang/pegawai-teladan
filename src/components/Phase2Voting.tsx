import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl, getHeaders } from '../utils/api-config';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { CheckCircle2, AlertCircle, Award } from 'lucide-react';
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

export function Phase2Voting() {
  const navigate = useNavigate();
  const [pegawai, setPegawai] = useState<any>(null);
  const [winners, setWinners] = useState<any>({});
  const [kandidatList, setKandidatList] = useState<any[]>([]);
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

    const parsedPegawai = JSON.parse(pegawaiData);
    setPegawai(parsedPegawai);

    // Cek apakah sudah voting
    if (parsedPegawai.hasVotedPhase2) {
      navigate('/phase2/results');
      return;
    }

    fetchWinners();
  }, [navigate]);

  const fetchWinners = async () => {
    try {
      const response = await fetch(getApiUrl('/winners/phase1'), {
        headers: getHeaders(),
      });

      const data = await response.json();

      if (response.ok) {
        setWinners(data.winners);
        
        // Convert winners object to array
        const list = Object.values(data.winners).filter((w: any) => w !== null);
        setKandidatList(list);

        // Initialize votes
        const initialVotes: any = {};
        CRITERIA.forEach((criteria) => {
          initialVotes[criteria] = '';
        });
        setVotes(initialVotes);
      }
    } catch (err) {
      console.error('Fetch winners error:', err);
      setError('Gagal memuat data pemenang tahap 1');
    }
  };

  const handleVoteChange = (criteria: string, kandidatNip: string) => {
    setVotes((prev: any) => ({
      ...prev,
      [criteria]: kandidatNip,
    }));
  };

  const isFormComplete = () => {
    return CRITERIA.every((criteria) => votes[criteria] !== '');
  };

  const handleSubmit = async () => {
    if (!isFormComplete()) {
      setError('Harap pilih kandidat untuk semua kriteria');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(getApiUrl('/vote/phase2'), {
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
      const updatedPegawai = { ...pegawai, hasVotedPhase2: true };
      sessionStorage.setItem('pegawai', JSON.stringify(updatedPegawai));

      // Redirect ke results setelah 2 detik
      setTimeout(() => {
        navigate('/phase2/results');
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
      title="Voting Tahap 2 - Final Pemilihan Pegawai Teladan"
      subtitle="Inspektorat Jenderal"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <Award className="w-16 h-16 text-yellow-500" />
          </div>
          <p className="text-gray-600">
            {pegawai.nama} ({pegawai.nip})
          </p>
          <p className="text-sm text-gray-500">
            Pilih 1 kandidat terbaik untuk setiap kriteria
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

        {kandidatList.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">
                Belum ada pemenang tahap 1. Hubungi admin.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {CRITERIA.map((criteria) => (
              <Card key={criteria} className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardTitle>{criteria}</CardTitle>
                  <CardDescription>
                    Pilih kandidat terbaik untuk kriteria ini
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <RadioGroup
                    value={votes[criteria]}
                    onValueChange={(value) => handleVoteChange(criteria, value)}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {kandidatList.map((kandidat) => (
                        <div
                          key={kandidat.nip}
                          className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-purple-50 ${
                            votes[criteria] === kandidat.nip
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200'
                          }`}
                          onClick={() => handleVoteChange(criteria, kandidat.nip)}
                        >
                          <RadioGroupItem value={kandidat.nip} id={`${criteria}-${kandidat.nip}`} />
                          <img
                            src={kandidat.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(kandidat.nama)}&background=random`}
                            alt={kandidat.nama}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(kandidat.nama)}&background=random`;
                            }}
                          />
                          <Label
                            htmlFor={`${criteria}-${kandidat.nip}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div>
                              <p className="font-semibold">{kandidat.nama}</p>
                              <p className="text-sm text-gray-500">{kandidat.bagian}</p>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
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
                {loading ? 'Menyimpan...' : 'Submit Voting Final'}
              </Button>
            </div>

            {!isFormComplete() && (
              <p className="text-sm text-center text-amber-600">
                Pastikan semua kriteria sudah dipilih
              </p>
            )}
          </div>
        )}
      </div>
    </HeaderWithLogos>
  );
}