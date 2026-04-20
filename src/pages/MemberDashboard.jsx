import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

const MemberDashboard = () => {
  const { user } = useAuth();
  const data = useData();
  const [tab, setTab] = useState('overview');
  const [certModal, setCertModal] = useState(null);

  if (!user) return null;

  const kegiatan = data.kegiatan;
  const mySubs = data.getSubmissionsByUser(user.id);
  const myAtts = data.attendance.filter(a => a.userId === user.id);

  const quizPoints = mySubs.length * 15;
  const absenPoints = myAtts.length * 10;
  const totalPoints = quizPoints + absenPoints;
  const avgScore = mySubs.length > 0 ? Math.round(mySubs.reduce((a, s) => a + s.score, 0) / mySubs.length) : 0;

  const getRank = (pts) => {
    if (pts >= 100) return { label: 'Sangat Aktif', color: 'text-green-600 bg-green-50', icon: '🏆' };
    if (pts >= 60) return { label: 'Aktif', color: 'text-blue-600 bg-blue-50', icon: '⭐' };
    if (pts >= 30) return { label: 'Cukup Aktif', color: 'text-kuning bg-kuning/10', icon: '📊' };
    return { label: 'Pemula', color: 'text-gray-500 bg-gray-100', icon: '🌱' };
  };
  const rank = getRank(totalPoints);

  // All activities sorted by date
  const activities = [
    ...mySubs.map(s => {
      const keg = kegiatan.find(k => k.id === s.kegiatanId);
      return { id: s.id, type: 'quiz', title: keg?.title || 'Kegiatan', score: s.score, date: s.submittedAt, kegId: s.kegiatanId, kegTitle: keg?.title };
    }),
    ...myAtts.map(a => {
      const keg = kegiatan.find(k => k.id === a.kegiatanId);
      return { id: a.id, type: 'absen', title: keg?.title || 'Kegiatan', date: a.timestamp, kegId: a.kegiatanId, kegTitle: keg?.title };
    }),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Sertifikat: each completed activity = 1 certificate
  const certificates = activities.map(act => ({
    ...act,
    certType: act.type === 'quiz' ? 'Penyelesaian Quiz' : 'Kehadiran Kegiatan',
  }));

  const openCertificate = (cert) => {
    const html = `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Sertifikat - ${user.name}</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family:'Segoe UI',Arial; background:#f8f9fa; display:flex; align-items:center; justify-content:center; min-height:100vh; padding:20px; }
      .cert { width:800px; background:white; border:3px solid #006a4e; border-radius:16px; padding:50px; text-align:center; position:relative; overflow:hidden; }
      .cert::before { content:''; position:absolute; top:0; left:0; right:0; height:8px; background:linear-gradient(90deg,#006a4e,#d4a843,#006a4e); }
      .cert::after { content:''; position:absolute; bottom:0; left:0; right:0; height:8px; background:linear-gradient(90deg,#006a4e,#d4a843,#006a4e); }
      .ornament { position:absolute; width:60px; height:60px; border:3px solid #006a4e20; border-radius:12px; transform:rotate(45deg); }
      .tl { top:20px; left:20px; } .tr { top:20px; right:20px; } .bl { bottom:20px; left:20px; } .br { bottom:20px; right:20px; }
      h1 { font-size:14px; color:#006a4e; letter-spacing:6px; text-transform:uppercase; margin-bottom:8px; }
      h2 { font-size:32px; color:#333; margin-bottom:30px; font-weight:300; }
      .name { font-size:28px; font-weight:700; color:#006a4e; border-bottom:2px solid #d4a843; display:inline-block; padding-bottom:8px; margin-bottom:12px; }
      .npm { font-size:13px; color:#999; margin-bottom:30px; }
      .desc { font-size:14px; color:#555; max-width:500px; margin:0 auto 24px; line-height:1.8; }
      .activity { font-size:16px; font-weight:600; color:#333; background:#f0fdf4; padding:10px 20px; border-radius:8px; display:inline-block; margin-bottom:24px; }
      ${cert.type === 'quiz' ? '.score { font-size:13px; color:#006a4e; margin-bottom:24px; }' : ''}
      .footer { display:flex; justify-content:space-between; align-items:flex-end; margin-top:30px; padding-top:20px; border-top:1px solid #eee; }
      .sign { text-align:center; } .sign-line { width:150px; border-top:1px solid #333; margin-bottom:4px; }
      .sign-name { font-size:12px; font-weight:600; color:#333; } .sign-role { font-size:10px; color:#999; }
      .date { font-size:11px; color:#999; }
      .no-print { text-align:center; margin-top:20px; }
      .no-print button { padding:10px 24px; background:#006a4e; color:white; border:none; border-radius:8px; font-size:14px; cursor:pointer; font-weight:600; }
      @media print { .no-print{display:none} body{background:white;padding:0} }
    </style></head><body>
    <div>
      <div class="cert">
        <div class="ornament tl"></div><div class="ornament tr"></div><div class="ornament bl"></div><div class="ornament br"></div>
        <h1>UKM KSEI RIIEF</h1>
        <h2>Sertifikat</h2>
        <p style="font-size:13px;color:#999;margin-bottom:16px">Diberikan kepada:</p>
        <div class="name">${user.name}</div>
        <div class="npm">NPM: ${user.npm}</div>
        <p class="desc">Telah ${cert.type === 'quiz' ? 'menyelesaikan quiz' : 'menghadiri kegiatan'} yang diselenggarakan oleh UKM KSEI RIIEF UIN Raden Intan Lampung:</p>
        <div class="activity">${cert.kegTitle}</div>
        ${cert.type === 'quiz' ? `<div class="score">Nilai: ${cert.score}/100</div>` : ''}
        <div class="footer">
          <div class="date">Tanggal: ${new Date(cert.date).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}</div>
          <div class="sign"><div class="sign-line"></div><div class="sign-name">Ketua KSEI RIIEF</div><div class="sign-role">UIN Raden Intan Lampung</div></div>
        </div>
      </div>
      <div class="no-print"><button onclick="window.print()">🖨️ Cetak Sertifikat</button></div>
    </div>
    <script>window.onload=function(){setTimeout(function(){window.print()},800)};</script>
    </body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    window.open(URL.createObjectURL(blob), '_blank');
  };

  const tabs = [
    { key: 'overview', label: '📊 Overview', icon: '📊' },
    { key: 'riwayat', label: '📋 Riwayat', icon: '📋' },
    { key: 'sertifikat', label: '📜 Sertifikat', icon: '📜' },
  ];

  return (
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
              <span className={`inline-block mt-2 px-3 py-1 rounded-lg text-xs font-semibold ${rank.color}`}>
                {rank.icon} {rank.label}
              </span>
            </div>
            <div className="text-center">
              <div className="text-4xl font-extrabold text-kuning">{totalPoints}</div>
              <div className="text-white/40 text-xs">Total Poin</div>
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                  <div className="text-2xl font-bold text-blue-600">{mySubs.length}</div>
                  <div className="text-xs text-gray-400">Quiz Selesai</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                  <div className="text-2xl font-bold text-purple-600">{myAtts.length}</div>
                  <div className="text-xs text-gray-400">Absensi</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                  <div className="text-2xl font-bold text-green-600">{avgScore}</div>
                  <div className="text-xs text-gray-400">Rata-rata Nilai</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                  <div className="text-2xl font-bold text-kuning">{certificates.length}</div>
                  <div className="text-xs text-gray-400">Sertifikat</div>
                </div>
              </div>

              {/* Recent activities */}
              <h3 className="font-bold text-gray-900 mb-3">Aktivitas Terbaru</h3>
              {activities.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center text-gray-400 text-sm border border-gray-100">
                  Belum ada aktivitas. <Link to="/kegiatan" className="text-hijau font-semibold">Ikuti kegiatan →</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {activities.slice(0, 5).map(act => (
                    <div key={act.id} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3">
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                        act.type === 'quiz' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                      }`}>{act.type === 'quiz' ? '📝' : '📋'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">{act.title}</div>
                        <div className="text-xs text-gray-400">
                          {act.type === 'quiz' ? `Nilai: ${act.score}/100` : 'Hadir'}
                          {' • '}{new Date(act.date).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-hijau">+{act.type === 'quiz' ? 15 : 10} pts</span>
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
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                        act.type === 'quiz' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                      }`}>{act.type === 'quiz' ? '📝' : '📋'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">{act.title}</div>
                        <div className="text-xs text-gray-400">
                          {act.type === 'quiz' ? `Nilai: ${act.score}/100 • +15 pts` : 'Kehadiran • +10 pts'}
                          {' • '}{new Date(act.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                      <Link to={`/kegiatan/${act.kegId}`} className="text-hijau text-xs font-medium hover:underline">Lihat →</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SERTIFIKAT */}
          {tab === 'sertifikat' && (
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Sertifikat Saya</h3>
              <p className="text-gray-400 text-sm mb-4">Klik untuk melihat dan mencetak sertifikat</p>
              {certificates.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                  <div className="text-4xl mb-3">📜</div>
                  <p className="text-gray-400 text-sm">Belum ada sertifikat. Selesaikan quiz atau hadiri kegiatan untuk mendapatkan sertifikat.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {certificates.map(cert => (
                    <div key={cert.id}
                      onClick={() => openCertificate(cert)}
                      className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md hover:border-hijau/30 cursor-pointer transition-all group">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-kuning/10 text-kuning flex items-center justify-center text-xl group-hover:scale-110 transition-transform">📜</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm truncate group-hover:text-hijau transition-colors">{cert.kegTitle}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{cert.certType}</div>
                          {cert.type === 'quiz' && <div className="text-xs text-blue-600 mt-1">Nilai: {cert.score}/100</div>}
                          <div className="text-[10px] text-gray-300 mt-1">{new Date(cert.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        </div>
                        <span className="text-gray-300 group-hover:text-hijau text-sm transition-colors">🖨️</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MemberDashboard;
