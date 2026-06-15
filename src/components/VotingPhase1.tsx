import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
import { Star } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { toast } from 'sonner@2.0.3'

interface Kandidat {
  nip: string
  nama: string
  bagian: string
}

interface Pegawai {
  nip: string
  nama: string
  bagian: string
  hasVotedPhase1: boolean
  hasVotedPhase2: boolean
}

const KRITERIA = [
  'Berorientasi Pelayanan',
  'Akuntabel',
  'Kompeten',
  'Harmonis',
  'Loyal',
  'Adaptif',
  'Kolaboratif'
]

export function VotingPhase1() {
  const navigate = useNavigate()
  const [pegawai, setPegawai] = useState<Pegawai | null>(null)
  const [kandidatList, setKandidatList] = useState<Kandidat[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [votes, setVotes] = useState<Record<string, Record<string, number>>>({})

  useEffect(() => {
    const pegawaiData = sessionStorage.getItem('pegawai')
    if (!pegawaiData) {
      navigate('/vote')
      return
    }

    const parsedPegawai = JSON.parse(pegawaiData)
    setPegawai(parsedPegawai)

    if (parsedPegawai.hasVotedPhase1) {
      toast.error('Anda sudah melakukan voting tahap 1')
      navigate('/results/phase1')
      return
    }

    fetchKandidat(parsedPegawai.bagian)
  }, [navigate])

  const fetchKandidat = async (bagian: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ea54a030/kandidat-phase1/${bagian}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      )

      const data = await response.json()

      if (response.ok && data.kandidat) {
        setKandidatList(data.kandidat)
        
        // Initialize votes
        const initialVotes: Record<string, Record<string, number>> = {}
        data.kandidat.forEach((kandidat: Kandidat) => {
          initialVotes[kandidat.nip] = {}
          KRITERIA.forEach(kriteria => {
            initialVotes[kandidat.nip][kriteria] = 0
          })
        })
        setVotes(initialVotes)
      }
    } catch (error) {
      console.error('Error fetching kandidat:', error)
      toast.error('Gagal memuat data kandidat')
    } finally {
      setLoading(false)
    }
  }

  const handleStarClick = (kandidatNip: string, kriteria: string, rating: number) => {
    setVotes(prev => ({
      ...prev,
      [kandidatNip]: {
        ...prev[kandidatNip],
        [kriteria]: rating
      }
    }))
  }

  const validateVotes = () => {
    for (const kandidat of kandidatList) {
      for (const kriteria of KRITERIA) {
        if (!votes[kandidat.nip]?.[kriteria] || votes[kandidat.nip][kriteria] === 0) {
          return false
        }
      }
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateVotes()) {
      toast.error('Silakan berikan penilaian untuk semua kriteria pada semua kandidat')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ea54a030/vote-phase1`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            nip: pegawai?.nip,
            votes
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Gagal menyimpan voting')
        setSubmitting(false)
        return
      }

      toast.success('Voting berhasil disimpan!')
      
      // Update session data
      if (pegawai) {
        pegawai.hasVotedPhase1 = true
        sessionStorage.setItem('pegawai', JSON.stringify(pegawai))
      }

      setTimeout(() => {
        navigate('/results/phase1')
      }, 1500)
    } catch (error) {
      console.error('Error submitting vote:', error)
      toast.error('Terjadi kesalahan saat menyimpan voting')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p>Memuat data...</p>
      </div>
    )
  }

  if (!kandidatList.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Tidak Ada Kandidat</CardTitle>
            <CardDescription>
              Belum ada kandidat yang terdaftar untuk bagian {pegawai?.bagian}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="mb-2">Pemilihan Pegawai Teladan - Tahap 1</h1>
          <p className="text-muted-foreground">
            {pegawai?.nama} ({pegawai?.bagian})
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Berikan penilaian untuk setiap kandidat dengan skala 1-5 bintang
          </p>
        </div>

        <div className="space-y-6">
          {kandidatList.map((kandidat) => (
            <Card key={kandidat.nip}>
              <CardHeader>
                <CardTitle>{kandidat.nama}</CardTitle>
                <CardDescription>NIP: {kandidat.nip}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {KRITERIA.map((kriteria) => (
                    <div key={kriteria} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b last:border-b-0 last:pb-0">
                      <Label className="sm:w-1/3">{kriteria}</Label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => handleStarClick(kandidat.nip, kriteria, rating)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                votes[kandidat.nip]?.[kriteria] >= rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-muted-foreground">
                          {votes[kandidat.nip]?.[kriteria] || 0}/5
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            size="lg"
            className="min-w-[200px]"
          >
            {submitting ? 'Menyimpan...' : 'Submit Penilaian'}
          </Button>
        </div>

        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Perhatian:</strong> Setelah menekan tombol Submit, penilaian Anda tidak dapat diubah lagi.
          </p>
        </div>
      </div>
    </div>
  )
}
