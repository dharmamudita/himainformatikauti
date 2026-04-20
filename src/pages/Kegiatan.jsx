import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const kategoriList = [
  { key: 'semua', label: 'Semua' },
  { key: 'materi-soal', label: '📝 Materi & Soal' },
  { key: 'kajian', label: '📖 Kajian Rutin' },
  { key: 'seminar', label: '🎤 Seminar & Workshop' },
  { key: 'lomba', label: '🏆 Lomba & Kompetisi' },
  { key: 'arsip', label: '📁 Arsip & Dokumen' },
];

const Kegiatan = () => {
  const [filter, setFilter] = useState('semua');
  const { user } = useAuth();
  const { kegiatan } = useData();

  const filtered = filter === 'semua' ? kegiatan : kegiatan.filter(k => k.kategori === filter);

  const getKategoriLabel = (kat) => {
    const map = { 'materi-soal': '📝 Materi & Soal', 'kajian': '📖 Kajian', 'seminar': '🎤 Seminar', 'lomba': '🏆 Lomba', 'arsip': '📁 Arsip' };
    return map[kat] || kat;
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-hijau pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Kegiatan <span className="text-kuning">Kami</span></h1>
          <p className="text-white/50 text-sm mb-6">Berbagai kegiatan dan program kerja KSEI RIIEF</p>
          <div className="flex flex-wrap justify-center gap-2">
            {kategoriList.map(k => (
              <button key={k.key} onClick={() => setFilter(k.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === k.key ? 'bg-white text-hijau' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
                {k.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-400 text-sm">Belum ada kegiatan dalam kategori ini</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(k => (
                <div key={k.id} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">{getKategoriLabel(k.kategori)}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${k.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {k.status === 'open' ? '🟢 Buka' : '🔴 Tutup'}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1.5">{k.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 flex-1 line-clamp-2">{k.description}</p>
                  {k.jadwal && <div className="text-xs text-gray-500 mb-1">📅 {k.jadwal}</div>}
                  {k.tempat && <div className="text-xs text-gray-500 mb-1">📍 {k.tempat}</div>}
                  {k.pemateri && <div className="text-xs text-gray-500 mb-1">👤 {k.pemateri}</div>}
                  {k.hadiah && <div className="text-xs text-gray-500 mb-1">🎁 {k.hadiah}</div>}
                  {k.kategori === 'materi-soal' && k.questions && (
                    <div className="text-xs text-gray-500 mb-1">
                      {k.type === 'soal' ? `📋 ${k.questions.length} soal` : '📄 Materi bacaan'}
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t border-gray-50">
                    {k.kategori === 'arsip' && k.linkUrl ? (
                      <a href={k.linkUrl} target="_blank" rel="noopener noreferrer"
                        className="block text-center py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors">
                        📂 Buka Dokumen
                      </a>
                    ) : k.kategori === 'materi-soal' ? (
                      <Link to={user ? `/kegiatan/${k.id}` : '/login'}
                        className="block text-center py-2 rounded-lg bg-hijau text-white text-sm font-semibold hover:bg-hijau-tua transition-colors">
                        {k.type === 'soal' ? 'Lihat & Kerjakan' : 'Baca Materi'}
                      </Link>
                    ) : (
                      <Link to={`/kegiatan/${k.id}`}
                        className="block text-center py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors">
                        Lihat Detail
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Kegiatan;
