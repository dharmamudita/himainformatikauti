import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

const katColor = { rapat: 'bg-purple-50 text-purple-600', progja: 'bg-blue-50 text-blue-600', panitia: 'bg-orange-50 text-orange-600' };
const katLabel = { rapat: '📅 Rapat', progja: '🚀 Progja', panitia: '🎪 Panitia' };

const MemberDashboard = () => {
  const { user } = useAuth();
  const data = useData();
  const [tab, setTab] = useState('overview');
  const [pwForm, setPwForm] = useState({ old: '', new: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });

  const kegiatan = data.kegiatan;
  const myAtts = data.attendance.filter(a => a.userId === user.id);
  const myAssessments = data.scoreAssessments.filter(a => a.userId === user.id);
  const himaScore = Math.round(data.getUserScore(user.id) * 10) / 10;

  // Breakdown per kategori
  const getKatAvg = (kat) => {
    const vals = myAssessments.filter(a => a.kategori === kat);
    if (vals.length === 0) return null;
    return Math.round(vals.reduce((s, v) => s + v.nilai, 0) / vals.length * 10) / 10;
  };

  // All activities: attendance + assessments merged
  const activities = myAtts.map(a => {
    const keg = kegiatan.find(k => k.id === a.kegiatanId);
    const ass = myAssessments.find(sa => sa.kegiatanId === a.kegiatanId);
    return {
      id: a.id,
      title: keg?.title || 'Kegiatan',
      kategori: keg?.kategori || '-',
      date: a.timestamp,
      kegId: a.kegiatanId,
      nilai: ass?.nilai ?? null,
      catatan: ass?.catatan || '',
    };
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const tabs = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'riwayat', label: '📋 Riwayat Kegiatan' },
    { key: 'settings', label: '⚙️ Pengaturan' },
  ];

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMsg({ type: '', text: '' });
    if (pwForm.new !== pwForm.confirm) {
      return setPwMsg({ type: 'error', text: 'Password baru tidak cocok' });
    }
    if (pwForm.new.length < 4) {
      return setPwMsg({ type: 'error', text: 'Password minimal 4 karakter' });
    }
    const res = await data.changePassword(user.id, pwForm.old, pwForm.new);
    if (res.error) {
      setPwMsg({ type: 'error', text: res.error });
    } else {
      setPwMsg({ type: 'success', text: 'Password berhasil diubah!' });
      setPwForm({ old: '', new: '', confirm: '' });
      setTimeout(() => setPwMsg({ type: '', text: '' }), 3000);
    }
  };

  if (!user) return null;
    <div>
      {/* Hero */}
      <section className="bg-hijau pt-24 pb-14">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/10 text-white flex items-center justify-center text-3xl font-bold">
              {user.name?.[0]}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              <p className="text-white/50 text-sm">{user.npm} • {user.divisi || 'Member'}</p>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-extrabold ${himaScore >= 70 ? 'text-kuning' : 'text-red-300'}`}>{himaScore}</div>
              <div className="text-white/40 text-xs">HIMA Score</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-20">
        <div className="max-w-4xl mx-auto px-4 flex gap-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-hijau text-hijau' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <section className="py-8 bg-gray-50 min-h-[50vh]">
        <div className="max-w-4xl mx-auto px-4">

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div>
              {/* Score breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                  <div className={`text-2xl font-bold ${himaScore >= 70 ? 'text-green-600' : 'text-red-500'}`}>{himaScore}</div>
                  <div className="text-xs text-gray-400">HIMA Score</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                  <div className="text-2xl font-bold text-purple-600">{getKatAvg('rapat') ?? '-'}</div>
                  <div className="text-xs text-gray-400">Avg Rapat (20%)</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                  <div className="text-2xl font-bold text-blue-600">{getKatAvg('progja') ?? '-'}</div>
                  <div className="text-xs text-gray-400">Avg Progja (45%)</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                  <div className="text-2xl font-bold text-orange-600">{getKatAvg('panitia') ?? '-'}</div>
                  <div className="text-xs text-gray-400">Avg Panitia (35%)</div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                  <div className="text-2xl font-bold text-gray-900">{myAtts.length}</div>
                  <div className="text-xs text-gray-400">Absensi</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                  <div className="text-2xl font-bold text-gray-900">{myAssessments.length}</div>
                  <div className="text-xs text-gray-400">Dinilai</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                  <div className="text-2xl font-bold text-gray-900">{myAtts.length - myAssessments.length}</div>
                  <div className="text-xs text-gray-400">Belum Dinilai</div>
                </div>
              </div>

              {/* Recent */}
              <h3 className="font-bold text-gray-900 mb-3">Aktivitas Terbaru</h3>
              {activities.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center text-gray-400 text-sm border border-gray-100">
                  Belum ada aktivitas. <Link to="/kegiatan" className="text-hijau font-semibold">Ikuti kegiatan →</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {activities.slice(0, 5).map(act => (
                    <div key={act.id} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3">
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium ${katColor[act.kategori] || 'bg-gray-50 text-gray-500'}`}>
                        {katLabel[act.kategori] ? katLabel[act.kategori].split(' ')[0] : '📋'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">{act.title}</div>
                        <div className="text-xs text-gray-400">
                          {katLabel[act.kategori] || act.kategori} • {new Date(act.date).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                      {act.nilai !== null ? (
                        <span className={`text-lg font-bold ${act.nilai >= 70 ? 'text-green-600' : 'text-red-500'}`}>{act.nilai}</span>
                      ) : (
                        <span className="text-xs text-gray-300">Belum dinilai</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* RIWAYAT */}
          {tab === 'riwayat' && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Semua Riwayat Kegiatan</h3>
              {activities.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center text-gray-400 text-sm border border-gray-100">Belum ada riwayat</div>
              ) : (
                <div className="space-y-2">
                  {activities.map(act => (
                    <div key={act.id} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3">
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium ${katColor[act.kategori] || 'bg-gray-50 text-gray-500'}`}>
                        {katLabel[act.kategori] ? katLabel[act.kategori].split(' ')[0] : '📋'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">{act.title}</div>
                        <div className="text-xs text-gray-400">
                          {katLabel[act.kategori] || act.kategori}
                          {' • '}{new Date(act.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                      {act.nilai !== null ? (
                        <span className={`text-lg font-bold ${act.nilai >= 70 ? 'text-green-600' : 'text-red-500'}`}>{act.nilai}</span>
                      ) : (
                        <span className="text-xs text-gray-300 bg-gray-50 px-2 py-1 rounded">Belum dinilai</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS */}
          {tab === 'settings' && (
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Ganti Password</h2>
                <p className="text-gray-500 text-xs mb-6">Ubah kata sandi akun Anda untuk keamanan.</p>

                {pwMsg.text && (
                  <div className={`mb-4 p-3 rounded-xl text-xs font-medium text-center ${pwMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {pwMsg.text}
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Password Lama</label>
                    <input type="password" value={pwForm.old} onChange={e => setPwForm({...pwForm, old: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-hijau" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Password Baru</label>
                    <input type="password" value={pwForm.new} onChange={e => setPwForm({...pwForm, new: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-hijau" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                    <input type="password" value={pwForm.confirm} onChange={e => setPwForm({...pwForm, confirm: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-hijau" required />
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-hijau text-white text-sm font-semibold rounded-lg hover:bg-hijau-tua transition-colors mt-2">
                    Simpan Password
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MemberDashboard;
