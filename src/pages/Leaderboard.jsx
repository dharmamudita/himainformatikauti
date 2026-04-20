import { useState } from 'react';
import { useData } from '../contexts/DataContext';

const Leaderboard = () => {
  const data = useData();
  const users = data.users.filter(u => u.role !== 'admin');
  const [search, setSearch] = useState('');
  const [filterDivisi, setFilterDivisi] = useState('semua');

  const divisiList = ['Hubungan Masyarakat','Sosial Masyarakat','Sumber Daya Manusia','Bina Prestasi','Komdigi','Ekonomi Kreatif'];

  const memberData = users.map(m => {
    const skor = Math.round(data.getUserScore(m.id) * 10) / 10;
    const myAss = data.scoreAssessments.filter(a => a.userId === m.id);
    const totalAss = myAss.length;
    // Masuk leaderboard jika sudah pernah dinilai minimal 1x
    const qualified = totalAss > 0;
    return { ...m, skor, totalAss, qualified };
  }).sort((a, b) => b.skor - a.skor);

  const filtered = memberData
    .filter(m => m.qualified)
    .filter(m => filterDivisi === 'semua' || m.divisi === filterDivisi)
    .filter(m => !search || m.name?.toLowerCase().includes(search.toLowerCase()));

  const top3 = filtered.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="bg-hijau pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">🏆 HIMA <span className="text-kuning">Score</span></h1>
          <p className="text-white/50 text-sm mb-4">Klasemen skor keaktifan anggota HIMA Informatika</p>
          <div className="flex justify-center gap-4 text-white/40 text-xs">
            <span>📅 Rapat 20%</span><span>🚀 Progja 45%</span><span>🎪 Panitia 35%</span>
          </div>
        </div>
      </section>

      {/* Top 3 Podium */}
      {top3.length > 0 && (
        <section className="bg-white py-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-end justify-center gap-3 sm:gap-6 mb-10">
              {/* 2nd place */}
              {top3[1] && (
                <div className="text-center flex-1 max-w-[160px]">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-200 text-gray-600 flex items-center justify-center text-2xl font-bold mb-2">{top3[1].name?.[0]}</div>
                  <div className="font-bold text-gray-900 text-sm truncate">{top3[1].name}</div>
                  <div className="text-xs text-gray-400 mb-2">{top3[1].divisi || '-'}</div>
                  <div className="bg-gray-100 rounded-2xl p-4 min-h-[80px] flex flex-col items-center justify-center">
                    <div className={`text-2xl font-extrabold ${top3[1].skor >= 70 ? 'text-green-600' : 'text-red-500'}`}>{top3[1].skor}</div>
                    <div className="text-[10px] text-gray-400 font-medium">SKOR</div>
                    <div className="text-lg mt-1">🥈</div>
                  </div>
                </div>
              )}
              {/* 1st place */}
              {top3[0] && (
                <div className="text-center flex-1 max-w-[180px]">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-kuning to-orange-400 text-white flex items-center justify-center text-3xl font-bold mb-2 shadow-lg shadow-kuning/30">{top3[0].name?.[0]}</div>
                  <div className="font-bold text-gray-900 truncate">{top3[0].name}</div>
                  <div className="text-xs text-gray-400 mb-2">{top3[0].divisi || '-'}</div>
                  <div className="bg-gradient-to-br from-kuning/10 to-orange-50 rounded-2xl p-5 min-h-[100px] flex flex-col items-center justify-center border border-kuning/20">
                    <div className={`text-3xl font-extrabold ${top3[0].skor >= 70 ? 'text-kuning' : 'text-red-500'}`}>{top3[0].skor}</div>
                    <div className="text-[10px] text-kuning/60 font-medium">SKOR</div>
                    <div className="text-2xl mt-1">👑</div>
                  </div>
                </div>
              )}
              {/* 3rd place */}
              {top3[2] && (
                <div className="text-center flex-1 max-w-[160px]">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl font-bold mb-2">{top3[2].name?.[0]}</div>
                  <div className="font-bold text-gray-900 text-sm truncate">{top3[2].name}</div>
                  <div className="text-xs text-gray-400 mb-2">{top3[2].divisi || '-'}</div>
                  <div className="bg-orange-50 rounded-2xl p-3 min-h-[70px] flex flex-col items-center justify-center">
                    <div className={`text-xl font-extrabold ${top3[2].skor >= 70 ? 'text-orange-600' : 'text-red-500'}`}>{top3[2].skor}</div>
                    <div className="text-[10px] text-orange-400 font-medium">SKOR</div>
                    <div className="text-base mt-1">🥉</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Full ranking */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex-1">Peringkat Lengkap</h2>
            <input type="text" placeholder="Cari nama..." value={search} onChange={e => setSearch(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-hijau/20 sm:max-w-[200px]" />
            <select value={filterDivisi} onChange={e => setFilterDivisi(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white">
              <option value="semua">Semua Divisi</option>
              {divisiList.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center border border-gray-100">
              <div className="text-gray-400 text-sm mb-2">Belum ada anggota yang masuk leaderboard</div>
              <div className="text-xs text-gray-300">Anggota akan muncul setelah mendapat penilaian dari admin/kadiv</div>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((m, idx) => (
                <div key={m.id} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-4 hover:shadow-sm transition-shadow">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-200 text-gray-600' : idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'
                  }`}>{idx < 3 ? ['👑', '🥈', '🥉'][idx] : idx + 1}</div>
                  <div className="w-10 h-10 rounded-xl bg-hijau/10 text-hijau flex items-center justify-center font-bold text-sm">{m.name?.[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm truncate">{m.name}</div>
                    <div className="text-xs text-gray-400">{m.npm} • {m.divisi || '-'}</div>
                  </div>
                  <div className="hidden sm:block text-xs text-gray-400">{m.totalAss} penilaian</div>
                  <div className="text-right">
                    <div className={`text-lg font-extrabold ${m.skor >= 70 ? 'text-green-600' : 'text-red-500'}`}>{m.skor}</div>
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

export default Leaderboard;
