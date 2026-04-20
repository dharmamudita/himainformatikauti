import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const kategoriList = [
  { key: 'semua', label: 'Semua' },
  { key: 'rapat', label: '📅 Rapat' },
  { key: 'progja', label: '🚀 Program Kerja' },
  { key: 'panitia', label: '🎪 Kepanitiaan' },
  { key: 'seminar', label: '🎤 Seminar' },
  { key: 'arsip', label: '📁 Arsip & Dokumen' },
];

const DIVISI_LIST = ['Hubungan Masyarakat','Sosial Masyarakat','Sumber Daya Manusia','Bina Prestasi','Komdigi','Ekonomi Kreatif'];

const Kegiatan = () => {
  const [filter, setFilter] = useState('semua');
  const [search, setSearch] = useState('');
  const [filterDivisi, setFilterDivisi] = useState('semua');
  const { user } = useAuth();
  const { kegiatan } = useData();

  const showDivisiFilter = ['progja', 'panitia', 'seminar'].includes(filter);

  let filtered = filter === 'semua' ? kegiatan : kegiatan.filter(k => k.kategori === filter);
  if (search.trim()) filtered = filtered.filter(k => k.title.toLowerCase().includes(search.toLowerCase()));
  if (filterDivisi !== 'semua') filtered = filtered.filter(k => (k.divisi || '') === filterDivisi);

  const getKategoriLabel = (kat) => {
    const map = { 'rapat': '📅 Rapat', 'progja': '🚀 Progja', 'panitia': '🎪 Panitia', 'seminar': '🎤 Seminar', 'arsip': '📁 Arsip' };
    return map[kat] || kat;
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-hijau pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Kegiatan <span className="text-kuning">Kami</span></h1>
          <p className="text-white/50 text-sm mb-6">Berbagai kegiatan dan program kerja HIMA Informatika UTI</p>
          <div className="flex flex-wrap justify-center gap-2">
            {kategoriList.map(k => (
              <button key={k.key} onClick={() => { setFilter(k.key); setFilterDivisi('semua'); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === k.key ? 'bg-white text-hijau' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
                {k.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          {/* Search + Divisi filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input type="text" placeholder="🔍 Cari kegiatan..." value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-hijau/20" />
            {showDivisiFilter && (
              <select value={filterDivisi} onChange={e => setFilterDivisi(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white sm:max-w-[220px]">
                <option value="semua">Semua Divisi</option>
                {DIVISI_LIST.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-400 text-sm">Belum ada kegiatan{search ? ` dengan kata kunci "${search}"` : ' dalam kategori ini'}</p>
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
                  <p className="text-gray-400 text-sm mb-3 flex-1 line-clamp-2">{k.description}</p>
                  {k.divisi && <div className="text-xs text-gray-500 mb-1">🏢 {k.divisi}</div>}
                  {k.jadwal && <div className="text-xs text-gray-500 mb-1">📅 {k.jadwal}</div>}
                  {k.tempat && <div className="text-xs text-gray-500 mb-1">📍 {k.tempat}</div>}
                  {k.pemateri && <div className="text-xs text-gray-500 mb-1">👤 {k.pemateri}</div>}
                  <div className="mt-3 pt-3 border-t border-gray-50">
                    {k.kategori === 'arsip' && k.linkUrl ? (
                      <a href={k.linkUrl} target="_blank" rel="noopener noreferrer"
                        className="block text-center py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors">
                        📂 Buka Dokumen
                      </a>
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
