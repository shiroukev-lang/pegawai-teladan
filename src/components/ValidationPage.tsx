import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getApiUrl, getHeaders } from '../utils/api-config';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { HeaderWithLogos } from './HeaderWithLogos';

export function ValidationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [nip, setNip] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const uniqueKey = searchParams.get('key');

  useEffect(() => {
    if (!uniqueKey) {
      setError('Link tidak valid. Hubungi admin untuk mendapatkan link voting.');
    }
  }, [uniqueKey]);

  const handleValidation = async () => {
    if (!nip) {
      setError('NIP wajib diisi');
      return;
    }

    if (!uniqueKey) {
      setError('Link tidak valid');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(getApiUrl('/validate'), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ uniqueKey, nip }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Validasi gagal');
        setLoading(false);
        return;
      }

      // Simpan data pegawai di sessionStorage
      sessionStorage.setItem('pegawai', JSON.stringify(data.pegawai));
      sessionStorage.setItem('currentPhase', data.currentPhase);

      // Redirect berdasarkan phase dan status voting
      if (data.currentPhase === 1) {
        if (data.pegawai.hasVotedPhase1) {
          navigate('/phase1/results');
        } else {
          navigate('/phase1');
        }
      } else if (data.currentPhase === 2) {
        if (data.pegawai.hasVotedPhase2) {
          navigate('/phase2/results');
        } else {
          navigate('/phase2');
        }
      } else {
        navigate('/phase2/results');
      }
    } catch (err) {
      console.error('Validation error:', err);
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <ShieldCheck className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Pemilihan Pegawai Teladan</CardTitle>
          <CardDescription>
            Inspektorat Jenderal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="nip" className="text-sm">
              Nomor Induk Pegawai (NIP)
            </label>
            <Input
              id="nip"
              type="text"
              placeholder="Masukkan NIP Anda"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleValidation()}
              disabled={!uniqueKey}
            />
          </div>

          <Button
            onClick={handleValidation}
            disabled={loading || !uniqueKey || !nip}
            className="w-full"
          >
            {loading ? 'Memvalidasi...' : 'Lanjutkan'}
          </Button>

          <p className="text-xs text-center text-gray-500">
            Pastikan Anda menggunakan link yang diberikan oleh admin
          </p>
        </CardContent>
      </Card>
    </div>
  );
}