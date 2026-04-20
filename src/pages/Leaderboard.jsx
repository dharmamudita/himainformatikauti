import { useData } from '../contexts/DataContext';

const Leaderboard = () => {
  const data = useData();
  const users = data.users.filter(u => u.role !== 'admin');
  const allSubs = data.submissions;
  const allAtts = data.attendance;
  const kegiatan = data.kegiatan;

  const memberData = users.map(m => {
    const mySubs = allSubs.filter(s => s.userId === m.id);
    const myAtts = allAtts.filter(a => a.userId === m.id);
    const quizPoints = mySubs.length * 15;
    const absenPoints = myAtts.length * 10;
    const totalPoints = quizPoints + absenPoints;
    const avgScore = mySubs.length > 0 ? Math.round(mySubs.reduce((a, s) => a + s.score, 0) / mySubs.length) : 0;
    return { ...m, quizCount: mySubs.length, absenCount: myAtts.length, totalPoints, avgScore, total: mySubs.length + myAtts.length };
  }).sort((a, b) => b.totalPoints - a.totalPoints);

  const getRank = (pts) => {
    if (pts >= 100) return { label: 'Sangat Aktif', color: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white', icon: '🏆' };
    if (pts >= 60) return { label: 'Aktif', color: 'bg-blue-100 text-blue-700', icon: '⭐' };
    if (pts >= 30) return { label: 'Cukup', color: 'bg-gray-100 text-gray-600', icon: '📊' };
    return { label: 'Pemula', color: 'bg-gray-50 text-gray-400', icon: '🌱' };
  };

  const top3 = memberData.slice(0, 3);
  const rest = memberData.slice(3);

  return (
    <div>
      {/* Hero */}
      <section className="bg-hijau pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">🏆 Leaderboard <span className="text-kuning">Keaktifan</span></h1>
          <p className="text-white/50 text-sm mb-3">Ranking anggota paling aktif di KSEI RIIEF</p>
          <div className="flex justify-center gap-4 text-white/40 text-xs">
            <span>📝 Quiz = 15 pts</span><span>📋 Absensi = 10 pts</span>
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
                  <div className="text-xs text-gray-400 mb-2">{top3[1].npm}</div>
                  <div className="bg-gray-100 rounded-2xl p-4 min-h-[80px] flex flex-col items-center justify-center">
                    <div className="text-2xl font-extrabold text-gray-700">{top3[1].totalPoints}</div>
                    <div className="text-[10px] text-gray-400 font-medium">POIN</div>
                    <div className="text-lg mt-1">🥈</div>
                  </div>
                </div>
              )}
              {/* 1st place */}
              {top3[0] && (
                <div className="text-center flex-1 max-w-[180px]">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-kuning to-orange-400 text-white flex items-center justify-center text-3xl font-bold mb-2 shadow-lg shadow-kuning/30">{top3[0].name?.[0]}</div>
                  <div className="font-bold text-gray-900 truncate">{top3[0].name}</div>
                  <div className="text-xs text-gray-400 mb-2">{top3[0].npm}</div>
                  <div className="bg-gradient-to-br from-kuning/10 to-orange-50 rounded-2xl p-5 min-h-[100px] flex flex-col items-center justify-center border border-kuning/20">
                    <div className="text-3xl font-extrabold text-kuning">{top3[0].totalPoints}</div>
                    <div className="text-[10px] text-kuning/60 font-medium">POIN</div>
                    <div className="text-2xl mt-1">🥇</div>
                  </div>
                </div>
              )}
              {/* 3rd place */}
              {top3[2] && (
                <div className="text-center flex-1 max-w-[160px]">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl font-bold mb-2">{top3[2].name?.[0]}</div>
                  <div className="font-bold text-gray-900 text-sm truncate">{top3[2].name}</div>
                  <div className="text-xs text-gray-400 mb-2">{top3[2].npm}</div>
                  <div className="bg-orange-50 rounded-2xl p-3 min-h-[70px] flex flex-col items-center justify-center">
                    <div className="text-xl font-extrabold text-orange-600">{top3[2].totalPoints}</div>
                    <div className="text-[10px] text-orange-400 font-medium">POIN</div>
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
          <h2 className="text-xl font-bold text-gray-900 mb-4">Peringkat Lengkap</h2>
          {memberData.length === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center text-gray-400 text-sm border border-gray-100">Belum ada member yang terdaftar</div>
          ) : (
            <div className="space-y-2">
              {memberData.map((m, idx) => {
                const rank = getRank(m.totalPoints);
                return (
                  <div key={m.id} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-4 hover:shadow-sm transition-shadow">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      idx === 0 ? 'bg-kuning/20 text-kuning' : idx === 1 ? 'bg-gray-200 text-gray-600' : idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'
                    }`}>{idx + 1}</div>
                    <div className="w-10 h-10 rounded-xl bg-hijau/10 text-hijau flex items-center justify-center font-bold text-sm">{m.name?.[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">{m.name}</div>
                      <div className="text-xs text-gray-400">{m.npm} • {m.divisi || '-'}</div>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500">
                      <span>📝 {m.quizCount}</span>
                      <span>📋 {m.absenCount}</span>
                      {m.avgScore > 0 && <span>📊 Avg: {m.avgScore}</span>}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-extrabold text-gray-900">{m.totalPoints}</div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${rank.color}`}>{rank.icon} {rank.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Leaderboard;
