import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user: me } = useAuth();
  const data = useData();
  const users = data.users;
  const kegiatan = data.kegiatan;
  const regs = data.registrations;
  const regSettings = data.regSettings;
  const feedbackList = data.feedback;
  const [tab, setTab] = useState('users');
  const [modal, setModal] = useState(null);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [kegFilter, setKegFilter] = useState('semua');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userForm, setUserForm] = useState({ name:'', npm:'', password:'', role:'member', divisi:'' });
  const [kegForm, setKegForm] = useState({ kategori:'materi-soal', title:'', description:'', type:'soal', status:'open', openDate:'', closeDate:'', materiContent:'', questions:[], createdBy: me?.name || 'Admin' });
  const [viewSub, setViewSub] = useState(null);
  const [subs, setSubs] = useState([]);
  const [attList, setAttList] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);

  // Question builder state
  const [qForm, setQForm] = useState({ type:'pilihan_ganda', question:'', options:['','','',''], correctAnswer:0, points:20 });

  const divisiList = ['Kaderisasi','Research & Development','Public Relation','Entrepreneurship','Kesekretariatan','Kemuslimahan','Media & Komunikasi'];

  const clearMsg = () => setTimeout(() => setSuccess(''), 2000);

  // User CRUD
  const resetUserForm = () => setUserForm({ name:'', npm:'', password:'', role:'member', divisi:'' });
  const onSaveUser = async (e) => {
    e.preventDefault(); setError('');
    if (editId) {
      const r = await data.updateUser(editId, userForm);
      if (r.error) { setError(r.error); return; }
      setSuccess('Pengguna berhasil diperbarui!');
    } else {
      const r = await data.createUser(userForm);
      if (r.error) { setError(r.error); return; }
      setSuccess('Akun berhasil dibuat!');
    }
    resetUserForm(); setEditId(null);
    setTimeout(() => setModal(null), 1000); clearMsg();
  };
  const onEditUser = (u) => {
    setUserForm({ name: u.name, npm: u.npm, password: u.password || '', role: u.role, divisi: u.divisi || '' });
    setEditId(u.id); setError(''); setModal('user');
  };
  const onDeleteUser = async (id, name) => { if (!window.confirm('Hapus pengguna ' + name + '?')) return; await data.deleteUser(id); setSuccess('Dihapus'); clearMsg(); };

  // Kegiatan CRUD
  const addQuestion = () => {
    if (!qForm.question.trim()) return;
    const q = { id: `q${Date.now()}`, ...qForm };
    setKegForm({ ...kegForm, questions: [...kegForm.questions, q] });
    setQForm({ type:'pilihan_ganda', question:'', options:['','','',''], correctAnswer:0, points:20 });
  };
  const removeQuestion = (idx) => {
    setKegForm({ ...kegForm, questions: kegForm.questions.filter((_,i) => i !== idx) });
  };
  const resetKegForm = () => setKegForm({ kategori:'materi-soal', title:'', description:'', type:'soal', status:'open', openDate:'', closeDate:'', materiContent:'', questions:[], createdBy: me?.name || 'Admin', jadwal:'', tempat:'', pemateri:'', hadiah:'' });
  const onSaveKeg = async (e) => {
    e.preventDefault(); setError('');
    if (!kegForm.title.trim()) { setError('Judul wajib diisi'); return; }
    const formData = { ...kegForm };
    if (formData.kategori !== 'materi-soal') { delete formData.questions; delete formData.materiContent; delete formData.type; }
    if (editId) {
      await data.updateKegiatan(editId, formData); setSuccess('Kegiatan berhasil diperbarui!');
    } else {
      await data.createKegiatan(formData); setSuccess('Kegiatan berhasil dibuat!');
    }
    resetKegForm(); setEditId(null);
    setTimeout(() => setModal(null), 1000); clearMsg();
  };
  const onEditKeg = (k) => {
    setKegForm({ kategori: k.kategori||'materi-soal', title: k.title||'', description: k.description||'', type: k.type||'soal', status: k.status||'open', openDate: k.openDate||'', closeDate: k.closeDate||'', materiContent: k.materiContent||'', questions: k.questions||[], createdBy: k.createdBy||'', jadwal: k.jadwal||'', tempat: k.tempat||'', pemateri: k.pemateri||'', hadiah: k.hadiah||'' });
    setEditId(k.id); setError(''); setModal('kegiatan');
  };
  const onDeleteKeg = async (id, title) => { if (!window.confirm('Hapus kegiatan ' + title + '?')) return; await data.deleteKegiatan(id); setSuccess('Dihapus'); clearMsg(); };
  const onToggleStatus = async (id, current) => { await data.updateKegiatan(id, { status: current === 'open' ? 'closed' : 'open' }); };

  const viewSubmissions = (kegId) => { setSubs(data.getSubmissionsByKegiatan(kegId)); setViewSub(kegId); setModal('soal-detail'); };
  const viewAttendance = (kegId) => { setAttList(data.getAttendanceByKegiatan(kegId)); setViewSub(kegId); setModal('attendance'); };

  // PDF Download
  const downloadPDF = (kegId) => {
    const keg = kegiatan.find(k => k.id === kegId);
    downloadAttendancePDFLocal(kegId, keg?.title || '');
  };

  // PDF generation (local function, uses data from context)
  const downloadAttendancePDFLocal = (kegiatanId, kegiatanTitle) => {
    const codes = data.getAllCodesForKegiatan(kegiatanId);
    if (codes.length === 0) { alert('Belum ada member.'); return; }
    const htmlContent = `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Kode Absensi - ${kegiatanTitle}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;padding:30px;color:#333;background:#fff}.header{border-bottom:3px solid #006a4e;padding-bottom:12px;margin-bottom:8px}.header h1{font-size:20px;color:#006a4e}.header h2{font-size:14px;color:#666;font-weight:normal;margin-top:4px}.meta{font-size:11px;color:#999;margin-bottom:20px}table{width:100%;border-collapse:collapse}thead th{background:#006a4e;color:white;padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.5px}tbody td{padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:12px}tbody tr:nth-child(even){background:#f9fafb}.code-cell{font-family:'Courier New',monospace;font-size:16px;font-weight:bold;color:#006a4e;letter-spacing:4px;background:#f0fdf4;padding:6px 10px;border-radius:6px;display:inline-block;border:1px dashed #006a4e}.footer{margin-top:30px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:10px;color:#999;text-align:center}.warning{background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:10px 14px;margin-bottom:20px;font-size:11px;color:#92400e}@media print{body{padding:15px}.no-print{display:none}}</style></head><body><div class="header"><h1>Kode Absensi Kegiatan</h1><h2>${kegiatanTitle}</h2></div><p class="meta">Tanggal cetak: ${new Date().toLocaleDateString('id-ID',{weekday:'long',year:'numeric',month:'long',day:'numeric'})} | Total: ${codes.length} peserta</p><div class="warning">RAHASIA - Setiap kode bersifat unik per individu.</div><table><thead><tr><th>No</th><th>Nama</th><th>NPM</th><th>Divisi</th><th>Kode Absensi</th></tr></thead><tbody>${codes.map((c,i)=>`<tr><td>${i+1}</td><td><strong>${c.name}</strong></td><td>${c.npm}</td><td>${c.divisi}</td><td><span class="code-cell">${c.code}</span></td></tr>`).join('')}</tbody></table><div class="footer">UKM KSEI RIIEF - UIN Raden Intan Lampung</div><div class="no-print" style="text-align:center;margin-top:20px"><button onclick="window.print()" style="padding:10px 24px;background:#006a4e;color:white;border:none;border-radius:8px;font-size:14px;cursor:pointer">Cetak / Simpan PDF</button></div><script>window.onload=function(){setTimeout(function(){window.print()},800)};<\/script></body></html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    window.open(URL.createObjectURL(blob), '_blank');
  };

  const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.npm?.includes(search));
  const filteredKeg = kegiatan
    .filter(k => kegFilter === 'semua' || k.kategori === kegFilter)
    .filter(k => k.title?.toLowerCase().includes(search.toLowerCase()));

  const kegKategoriTabs = [
    { key: 'semua', label: 'Semua', count: kegiatan.length },
    { key: 'materi-soal', label: '📝 Materi & Soal', count: kegiatan.filter(k=>k.kategori==='materi-soal').length },
    { key: 'kajian', label: '📖 Kajian', count: kegiatan.filter(k=>k.kategori==='kajian').length },
    { key: 'seminar', label: '🎤 Seminar', count: kegiatan.filter(k=>k.kategori==='seminar').length },
    { key: 'lomba', label: '🏆 Lomba', count: kegiatan.filter(k=>k.kategori==='lomba').length },
    { key: 'arsip', label: '📁 Arsip & Dokumen', count: kegiatan.filter(k=>k.kategori==='arsip').length },
  ];

  const inp = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-hijau/20 focus:border-hijau";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-gray-100 fixed inset-y-0 left-0">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <img src="/logo.jpeg" alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
            <div><div className="font-bold text-gray-900 text-sm">KSEI RIIEF</div><div className="text-[10px] text-gray-400">Admin Panel</div></div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <button onClick={() => { setTab('users'); setSearch(''); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${tab === 'users' ? 'bg-hijau/10 text-hijau' : 'text-gray-500 hover:bg-gray-50'}`}>👥 Pengguna</button>
          <button onClick={() => { setTab('kegiatan'); setSearch(''); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${tab === 'kegiatan' ? 'bg-hijau/10 text-hijau' : 'text-gray-500 hover:bg-gray-50'}`}>📋 Kegiatan</button>
          <button onClick={() => { setTab('keaktifan'); setSearch(''); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${tab === 'keaktifan' ? 'bg-hijau/10 text-hijau' : 'text-gray-500 hover:bg-gray-50'}`}>⭐ Keaktifan</button>
          <button onClick={() => { setTab('pendaftaran'); setSearch(''); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${tab === 'pendaftaran' ? 'bg-hijau/10 text-hijau' : 'text-gray-500 hover:bg-gray-50'}`}>📝 Pendaftaran</button>
          <button onClick={() => { setTab('feedback'); setSearch(''); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${tab === 'feedback' ? 'bg-hijau/10 text-hijau' : 'text-gray-500 hover:bg-gray-50'}`}>💬 Kritik & Saran</button>
        </nav>
        <div className="p-3 border-t border-gray-100">
          <Link to="/" className="block px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50">🏠 Ke Website</Link>
        </div>
      </aside>

      <main className="flex-1 lg:ml-56">
        <header className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-gray-900">Dashboard Admin</h1>
            <p className="text-xs text-gray-400">Halo, {me?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile tabs */}
            <button onClick={() => setTab('users')} className={`lg:hidden px-2 py-1 rounded text-xs ${tab === 'users' ? 'bg-hijau/10 text-hijau' : 'text-gray-400'}`}>👥</button>
            <button onClick={() => setTab('kegiatan')} className={`lg:hidden px-2 py-1 rounded text-xs ${tab === 'kegiatan' ? 'bg-hijau/10 text-hijau' : 'text-gray-400'}`}>📋</button>
            <button onClick={() => setTab('keaktifan')} className={`lg:hidden px-2 py-1 rounded text-xs ${tab === 'keaktifan' ? 'bg-hijau/10 text-hijau' : 'text-gray-400'}`}>⭐</button>
            <button onClick={() => setTab('pendaftaran')} className={`lg:hidden px-2 py-1 rounded text-xs ${tab === 'pendaftaran' ? 'bg-hijau/10 text-hijau' : 'text-gray-400'}`}>📝</button>
            <button onClick={() => setTab('feedback')} className={`lg:hidden px-2 py-1 rounded text-xs ${tab === 'feedback' ? 'bg-hijau/10 text-hijau' : 'text-gray-400'}`}>💬</button>
            <Link to="/" className="lg:hidden text-gray-400 text-sm">🏠</Link>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          {success && <div className="p-3 rounded-xl bg-green-50 border border-green-100 text-sm text-green-700 mb-4">✅ {success}</div>}

          {/* Stats - only for users/kegiatan/keaktifan */}
          {(tab === 'users' || tab === 'kegiatan' || tab === 'keaktifan') && (<>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="bg-white rounded-xl p-4 border border-gray-100"><div className="text-2xl font-bold text-gray-900">{users.length}</div><div className="text-xs text-gray-400">Pengguna</div></div>
            <div className="bg-white rounded-xl p-4 border border-gray-100"><div className="text-2xl font-bold text-gray-900">{kegiatan.length}</div><div className="text-xs text-gray-400">Kegiatan</div></div>
            <div className="bg-white rounded-xl p-4 border border-gray-100"><div className="text-2xl font-bold text-gray-900">{kegiatan.filter(k=>k.kategori==='materi-soal').length}</div><div className="text-xs text-gray-400">Materi/Soal</div></div>
            <div className="bg-white rounded-xl p-4 border border-gray-100"><div className="text-2xl font-bold text-gray-900">{kegiatan.filter(k=>k.status==='open').length}</div><div className="text-xs text-gray-400">Aktif</div></div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input type="text" placeholder="Cari..." value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 sm:max-w-xs px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-hijau/20" />
            <button onClick={() => { setEditId(null); if(tab==='users') resetUserForm(); else resetKegForm(); setModal(tab === 'users' ? 'user' : 'kegiatan'); setError(''); }}
              className="px-4 py-2 bg-hijau text-white rounded-lg text-sm font-semibold hover:bg-hijau-tua transition-colors">
              + Tambah {tab === 'users' ? 'Pengguna' : 'Kegiatan'}
            </button>
          </div>
          </>)}

          {/* === USERS TABLE === */}
          {tab === 'users' && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {filteredUsers.length === 0 ? <div className="p-10 text-center text-gray-400 text-sm">Tidak ditemukan</div> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="bg-gray-50 text-gray-400 text-xs uppercase">
                      <th className="px-4 py-2.5">Nama</th><th className="px-4 py-2.5">NPM</th>
                      <th className="px-4 py-2.5 hidden sm:table-cell">Divisi</th><th className="px-4 py-2.5">Role</th><th className="px-4 py-2.5">Aksi</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                          <td className="px-4 py-3 text-gray-500">{u.npm}</td>
                          <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{u.divisi || '-'}</td>
                          <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${u.role === 'admin' ? 'bg-kuning/20 text-kuning' : 'bg-hijau/10 text-hijau'}`}>{u.role}</span></td>
                          <td className="px-4 py-3 flex items-center gap-2">
                            <button onClick={() => onEditUser(u)} className="text-blue-500 hover:text-blue-700 text-xs font-medium">✏️ Edit</button>
                            <button onClick={() => onDeleteUser(u.id, u.name)} className="text-gray-400 hover:text-red-500 text-sm">🗑️</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* === KEGIATAN SECTION === */}
          {tab === 'kegiatan' && (
            <div>
              {/* Category filter tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {kegKategoriTabs.map(t => (
                  <button key={t.key} onClick={() => setKegFilter(t.key)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      kegFilter === t.key ? 'bg-hijau text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                    }`}>
                    {t.label} <span className={`ml-1 text-xs ${kegFilter === t.key ? 'text-white/70' : 'text-gray-400'}`}>({t.count})</span>
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {filteredKeg.length === 0 ? <div className="p-10 text-center text-gray-400 text-sm">Tidak ada kegiatan dalam kategori ini</div> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead><tr className="bg-gray-50 text-gray-400 text-xs uppercase">
                        <th className="px-4 py-2.5">Judul</th><th className="px-4 py-2.5">Kategori</th>
                        <th className="px-4 py-2.5 hidden sm:table-cell">Status</th><th className="px-4 py-2.5">Aksi</th>
                      </tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredKeg.map(k => (
                          <tr key={k.id} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{k.title}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                k.kategori === 'materi-soal' ? 'bg-blue-50 text-blue-600' :
                                k.kategori === 'kajian' ? 'bg-purple-50 text-purple-600' :
                                k.kategori === 'seminar' ? 'bg-orange-50 text-orange-600' :
                                k.kategori === 'arsip' ? 'bg-teal-50 text-teal-600' :
                                'bg-yellow-50 text-yellow-700'
                              }`}>
                                {k.kategori === 'materi-soal' ? '📝 Materi & Soal' : k.kategori === 'kajian' ? '📖 Kajian' : k.kategori === 'seminar' ? '🎤 Seminar' : k.kategori === 'arsip' ? '📁 Arsip' : '🏆 Lomba'}
                              </span>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${k.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                {k.status === 'open' ? '🟢 Buka' : '🔴 Tutup'}
                              </span>
                              {(k.openDate || k.closeDate) && (
                                <div className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                                  {k.openDate && <span>{new Date(k.openDate).toLocaleString('id-ID', {day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</span>}
                                  {k.openDate && k.closeDate && <span> → </span>}
                                  {k.closeDate && <span>{new Date(k.closeDate).toLocaleString('id-ID', {day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</span>}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 flex items-center gap-2 flex-wrap">
                              <button onClick={() => onEditKeg(k)} className="text-blue-500 hover:text-blue-700 text-xs font-medium">✏️ Edit</button>
                              {k.kategori === 'materi-soal' && k.questions?.length > 0 && (
                                <button onClick={() => viewSubmissions(k.id)} className="text-purple-500 hover:text-purple-700 text-xs font-medium">📊 Hasil</button>
                              )}
                              {k.kategori !== 'materi-soal' && (
                                <>
                                  <button onClick={() => downloadPDF(k.id)} className="text-green-600 hover:text-green-800 text-xs font-medium">📄 Kode</button>
                                  <button onClick={() => viewAttendance(k.id)} className="text-purple-500 hover:text-purple-700 text-xs font-medium">📋 Absen</button>
                                </>
                              )}
                              <button onClick={() => onDeleteKeg(k.id, k.title)} className="text-gray-400 hover:text-red-500 text-sm">🗑️</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* === KEAKTIFAN SECTION === */}
          {tab === 'keaktifan' && (() => {
            const allSubs = data.submissions;
            const allAtts = data.attendance;
            const members = users.filter(u => u.role !== 'admin');

            // Calculate engagement data per member
            const memberData = members.map(m => {
              const mySubs = allSubs.filter(s => s.userId === m.id);
              const myAtts = allAtts.filter(a => a.userId === m.id);

              // Points: Quiz = 15pts each, Attendance = 10pts each
              const quizPoints = mySubs.length * 15;
              const absenPoints = myAtts.length * 10;
              const totalPoints = quizPoints + absenPoints;

              // Get kegiatan names
              const activities = [
                ...mySubs.map(s => {
                  const keg = kegiatan.find(k => k.id === s.kegiatanId);
                  return { type: 'quiz', title: keg?.title || 'Kegiatan', score: s.score, date: s.submittedAt, points: 15 };
                }),
                ...myAtts.map(a => {
                  const keg = kegiatan.find(k => k.id === a.kegiatanId);
                  return { type: 'absen', title: keg?.title || 'Kegiatan', date: a.timestamp, points: 10 };
                }),
              ].sort((a, b) => new Date(b.date) - new Date(a.date));

              return { ...m, quizCount: mySubs.length, absenCount: myAtts.length, quizPoints, absenPoints, totalPoints, activities };
            }).sort((a, b) => b.totalPoints - a.totalPoints);

            const getRank = (pts) => {
              if (pts >= 100) return { label: 'Sangat Aktif', color: 'text-green-600 bg-green-50', icon: '🏆' };
              if (pts >= 60) return { label: 'Aktif', color: 'text-blue-600 bg-blue-50', icon: '⭐' };
              if (pts >= 30) return { label: 'Cukup Aktif', color: 'text-kuning bg-kuning/10', icon: '📊' };
              return { label: 'Kurang Aktif', color: 'text-red-500 bg-red-50', icon: '⚠️' };
            };

            const filteredMembers = memberData.filter(m =>
              m.name?.toLowerCase().includes(search.toLowerCase()) || m.npm?.includes(search)
            );

            return (
              <div>
                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="text-2xl font-bold text-gray-900">{members.length}</div>
                    <div className="text-xs text-gray-400">Total Member</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="text-2xl font-bold text-green-600">{memberData.filter(m => m.totalPoints >= 60).length}</div>
                    <div className="text-xs text-gray-400">Member Aktif</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="text-2xl font-bold text-gray-900">{allSubs.length}</div>
                    <div className="text-xs text-gray-400">Total Quiz</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="text-2xl font-bold text-gray-900">{allAtts.length}</div>
                    <div className="text-xs text-gray-400">Total Absensi</div>
                  </div>
                </div>

                {/* Search */}
                <div className="mb-4">
                  <input type="text" placeholder="Cari member..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full sm:max-w-xs px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-hijau/20" />
                </div>

                {/* Point system info */}
                <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-500">
                  <span className="bg-white px-3 py-1.5 rounded-lg border border-gray-100">📝 Quiz = <strong>15 poin</strong></span>
                  <span className="bg-white px-3 py-1.5 rounded-lg border border-gray-100">📋 Absensi = <strong>10 poin</strong></span>
                  <span className="bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 text-green-700">🏆 ≥100 Sangat Aktif</span>
                  <span className="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 text-blue-600">⭐ ≥60 Aktif</span>
                  <span className="bg-kuning/10 px-3 py-1.5 rounded-lg border border-kuning/20 text-kuning">📊 ≥30 Cukup</span>
                </div>

                {/* Member ranking table */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  {filteredMembers.length === 0 ? (
                    <div className="p-10 text-center text-gray-400 text-sm">
                      {members.length === 0 ? 'Belum ada member. Tambahkan pengguna terlebih dahulu.' : 'Tidak ditemukan'}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead><tr className="bg-gray-50 text-gray-400 text-xs uppercase">
                          <th className="px-4 py-2.5 w-10">#</th>
                          <th className="px-4 py-2.5">Nama</th>
                          <th className="px-4 py-2.5">NPM</th>
                          <th className="px-4 py-2.5 hidden sm:table-cell">Divisi</th>
                          <th className="px-4 py-2.5 text-center">Quiz</th>
                          <th className="px-4 py-2.5 text-center">Absen</th>
                          <th className="px-4 py-2.5 text-center">Poin</th>
                          <th className="px-4 py-2.5">Status</th>
                          <th className="px-4 py-2.5">Detail</th>
                        </tr></thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredMembers.map((m, idx) => {
                            const rank = getRank(m.totalPoints);
                            return (
                              <tr key={m.id} className="hover:bg-gray-50/50">
                                <td className="px-4 py-3">
                                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    idx === 0 ? 'bg-kuning/20 text-kuning' : idx === 1 ? 'bg-gray-200 text-gray-600' : idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'
                                  }`}>{idx + 1}</span>
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                                <td className="px-4 py-3 text-gray-500">{m.npm}</td>
                                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{m.divisi || '-'}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className="text-blue-600 font-medium">{m.quizCount}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="text-purple-600 font-medium">{m.absenCount}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="text-lg font-bold text-gray-900">{m.totalPoints}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${rank.color}`}>
                                    {rank.icon} {rank.label}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <button onClick={() => { setSelectedMember(m); setModal('member-detail'); }}
                                    className="text-hijau hover:text-hijau-tua text-xs font-medium">
                                    📋 Lihat
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* === TAB: PENDAFTARAN === */}
          {tab === 'pendaftaran' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div><h2 className="text-xl font-bold text-gray-900">📝 Pendaftaran Anggota</h2><p className="text-xs text-gray-400 mt-0.5">Kelola pendaftaran anggota baru</p></div>
                <button onClick={() => data.toggleRegistration()} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${regSettings.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{regSettings.isOpen ? '🟢 Pendaftaran Dibuka' : '🔴 Pendaftaran Ditutup'}</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[{l:'Total',v:regs.length,c:'text-blue-600',b:'bg-blue-50'},{l:'Menunggu',v:regs.filter(r=>r.status==='pending').length,c:'text-yellow-600',b:'bg-yellow-50'},{l:'Diterima',v:regs.filter(r=>r.status==='accepted').length,c:'text-green-600',b:'bg-green-50'},{l:'Ditolak',v:regs.filter(r=>r.status==='rejected').length,c:'text-red-600',b:'bg-red-50'}].map((s,i)=>(<div key={i} className={`${s.b} rounded-xl p-4 text-center`}><div className={`text-2xl font-bold ${s.c}`}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>))}
              </div>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {regs.length === 0 ? <div className="p-10 text-center text-gray-400 text-sm">Belum ada pendaftar</div> : (
                  <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="bg-gray-50 text-gray-400 text-xs uppercase"><th className="px-4 py-2.5">Nama</th><th className="px-4 py-2.5">NPM</th><th className="px-4 py-2.5 hidden sm:table-cell">Angkatan</th><th className="px-4 py-2.5 hidden md:table-cell">Alasan</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5">Aksi</th></tr></thead>
                    <tbody className="divide-y divide-gray-50">{regs.map(r=>(<tr key={r.id} className="hover:bg-gray-50/50"><td className="px-4 py-3 font-medium text-gray-900">{r.nama}</td><td className="px-4 py-3 text-gray-600">{r.npm}</td><td className="px-4 py-3 hidden sm:table-cell text-gray-600">{r.angkatan}</td><td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs max-w-[200px] truncate">{r.alasan}</td><td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${r.status==='pending'?'bg-yellow-100 text-yellow-700':r.status==='accepted'?'bg-green-100 text-green-700':'bg-red-100 text-red-600'}`}>{r.status==='pending'?'⏳ Menunggu':r.status==='accepted'?'✅ Diterima':'❌ Ditolak'}</span><div className="text-[10px] text-gray-400 mt-0.5">{new Date(r.submittedAt).toLocaleString('id-ID',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</div></td><td className="px-4 py-3"><div className="flex items-center gap-1.5">{r.status==='pending'&&(<><button onClick={()=>data.updateRegStatus(r.id,'accepted')} className="text-green-600 text-xs font-medium">✅</button><button onClick={()=>data.updateRegStatus(r.id,'rejected')} className="text-red-500 text-xs font-medium">❌</button></>)}<button onClick={()=>{if(window.confirm('Hapus?'))data.deleteRegistration(r.id)}} className="text-gray-400 hover:text-red-500 text-sm">🗑️</button></div></td></tr>))}</tbody></table></div>
                )}
              </div>
            </div>
          )}

          {/* === TAB: KRITIK & SARAN === */}
          {tab === 'feedback' && (
            <div className="space-y-5">
              <div><h2 className="text-xl font-bold text-gray-900">💬 Kritik & Saran</h2><p className="text-xs text-gray-400 mt-0.5">Masukan dari pengunjung dan anggota</p></div>
              <div className="grid grid-cols-3 gap-3">
                {[{l:'Total',v:feedbackList.length,c:'text-blue-600',b:'bg-blue-50'},{l:'Kritik',v:feedbackList.filter(f=>f.jenis==='kritik').length,c:'text-red-600',b:'bg-red-50'},{l:'Saran',v:feedbackList.filter(f=>f.jenis==='saran').length,c:'text-blue-600',b:'bg-blue-50'}].map((s,i)=>(<div key={i} className={`${s.b} rounded-xl p-4 text-center`}><div className={`text-2xl font-bold ${s.c}`}>{s.v}</div><div className="text-xs text-gray-500 mt-1">{s.l}</div></div>))}
              </div>
              {feedbackList.length===0?<div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400 text-sm">Belum ada masukan</div>:(
                <div className="space-y-3">{feedbackList.map(fb=>(<div key={fb.id} className="bg-white rounded-xl border border-gray-100 p-4"><div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${fb.jenis==='kritik'?'bg-red-50':fb.jenis==='saran'?'bg-blue-50':'bg-green-50'}`}>{fb.jenis==='kritik'?'💬':fb.jenis==='saran'?'💡':'❤️'}</div><div><div className="flex items-center gap-2 flex-wrap"><span className="font-semibold text-gray-900 text-sm">{fb.nama}</span><span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${fb.jenis==='kritik'?'bg-red-50 text-red-600':fb.jenis==='saran'?'bg-blue-50 text-blue-600':'bg-green-50 text-green-600'}`}>{fb.jenis}</span><span className="text-[10px] text-gray-400">{new Date(fb.createdAt).toLocaleString('id-ID',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</span></div><p className="text-sm text-gray-600 mt-1.5 whitespace-pre-wrap">{fb.pesan}</p></div></div><button onClick={()=>{if(window.confirm('Hapus?'))data.deleteFeedback(fb.id)}} className="text-gray-400 hover:text-red-500 text-sm shrink-0">🗑️</button></div></div>))}</div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* === MODALS === */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">
                {modal === 'user' && (editId ? '✏️ Edit Pengguna' : '+ Tambah Pengguna')}
                {modal === 'kegiatan' && (editId ? '✏️ Edit Kegiatan' : '+ Tambah Kegiatan')}
                {modal === 'soal-detail' && '📊 Hasil Pengerjaan'}
                {modal === 'attendance' && '📋 Daftar Absensi'}
                {modal === 'member-detail' && '⭐ Detail Keaktifan'}
              </h3>
              <button onClick={() => { setModal(null); setEditId(null); }} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            {error && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 mb-3">❌ {error}</div>}

            {/* User form */}
            {modal === 'user' && (
              <form onSubmit={onSaveUser} className="space-y-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama</label><input type="text" value={userForm.name} onChange={e=>setUserForm({...userForm,name:e.target.value})} className={inp} required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">NPM</label><input type="text" value={userForm.npm} onChange={e=>setUserForm({...userForm,npm:e.target.value})} className={inp} required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Password{editId ? ' (kosongkan jika tidak diubah)' : ''}</label><input type="text" value={userForm.password} onChange={e=>setUserForm({...userForm,password:e.target.value})} className={inp} {...(!editId && {required:true})} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Divisi</label>
                  <select value={userForm.divisi} onChange={e=>setUserForm({...userForm,divisi:e.target.value})} className={inp}><option value="">Pilih</option>{divisiList.map(d=><option key={d} value={d}>{d}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select value={userForm.role} onChange={e=>setUserForm({...userForm,role:e.target.value})} className={inp}><option value="member">Member</option><option value="admin">Admin</option></select></div>
                <button type="submit" className="w-full py-2.5 bg-hijau text-white font-semibold rounded-xl hover:bg-hijau-tua text-sm">{editId ? 'Simpan Perubahan' : 'Buat Akun'}</button>
              </form>
            )}

            {/* Kegiatan form */}
            {modal === 'kegiatan' && (
              <form onSubmit={onSaveKeg} className="space-y-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select value={kegForm.kategori} onChange={e=>setKegForm({...kegForm,kategori:e.target.value})} className={inp}>
                    <option value="materi-soal">📝 Materi & Soal</option><option value="kajian">📖 Kajian</option>
                    <option value="seminar">🎤 Seminar</option><option value="lomba">🏆 Lomba</option><option value="arsip">Arsip & Dokumen</option>
                  </select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Judul</label><input type="text" value={kegForm.title} onChange={e=>setKegForm({...kegForm,title:e.target.value})} className={inp} required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label><textarea value={kegForm.description} onChange={e=>setKegForm({...kegForm,description:e.target.value})} className={inp} rows={2} /></div>

                {kegForm.kategori === 'materi-soal' && (
                  <>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                      <select value={kegForm.type} onChange={e=>setKegForm({...kegForm,type:e.target.value})} className={inp}>
                        <option value="soal">Soal (Ada Quiz)</option><option value="materi">Materi Saja</option>
                      </select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Konten Materi</label>
                      <textarea value={kegForm.materiContent} onChange={e=>setKegForm({...kegForm,materiContent:e.target.value})} className={inp} rows={3} placeholder="Tulis materi..." /></div>
                    {kegForm.type === 'soal' && (
                      <div className="border border-gray-200 rounded-xl p-4">
                        <h4 className="font-semibold text-sm text-gray-900 mb-3">📋 Soal ({kegForm.questions.length})</h4>
                        {kegForm.questions.map((q,i) => (
                          <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-2 mb-2 text-sm">
                            <span className="truncate flex-1 text-gray-700">{i+1}. {q.question}</span>
                            <button type="button" onClick={() => removeQuestion(i)} className="text-red-400 hover:text-red-600 ml-2">✕</button>
                          </div>
                        ))}
                        <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                          <select value={qForm.type} onChange={e=>setQForm({...qForm,type:e.target.value})} className={inp}>
                            <option value="pilihan_ganda">Pilihan Ganda</option><option value="essay">Essay</option>
                          </select>
                          <input type="text" value={qForm.question} onChange={e=>setQForm({...qForm,question:e.target.value})} className={inp} placeholder="Pertanyaan" />
                          {qForm.type === 'pilihan_ganda' && (
                            <>
                              {qForm.options.map((o,i) => (
                                <input key={i} type="text" value={o} onChange={e => { const opts=[...qForm.options]; opts[i]=e.target.value; setQForm({...qForm,options:opts}); }}
                                  className={inp} placeholder={`Opsi ${['A','B','C','D'][i]}`} />
                              ))}
                              <select value={qForm.correctAnswer} onChange={e=>setQForm({...qForm,correctAnswer:parseInt(e.target.value)})} className={inp}>
                                {['A','B','C','D'].map((l,i) => <option key={i} value={i}>Jawaban Benar: {l}</option>)}
                              </select>
                            </>
                          )}
                          <input type="number" value={qForm.points} onChange={e=>setQForm({...qForm,points:parseInt(e.target.value)||0})} className={inp} placeholder="Poin" />
                          <button type="button" onClick={addQuestion} className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">+ Tambah Soal</button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {kegForm.kategori !== 'materi-soal' && (
                  <>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Jadwal</label><input type="text" value={kegForm.jadwal||''} onChange={e=>setKegForm({...kegForm,jadwal:e.target.value})} className={inp} placeholder="Contoh: Setiap Jumat, 13:00 WIB" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Tempat</label><input type="text" value={kegForm.tempat||''} onChange={e=>setKegForm({...kegForm,tempat:e.target.value})} className={inp} /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Pemateri</label><input type="text" value={kegForm.pemateri||''} onChange={e=>setKegForm({...kegForm,pemateri:e.target.value})} className={inp} /></div>
                    {kegForm.kategori === 'lomba' && <div><label className="block text-sm font-medium text-gray-700 mb-1">Hadiah</label><input type="text" value={kegForm.hadiah||''} onChange={e=>setKegForm({...kegForm,hadiah:e.target.value})} className={inp} /></div>}
                    {kegForm.kategori === 'arsip' && <div><label className="block text-sm font-medium text-gray-700 mb-1">🔗 Link Dokumen (URL)</label><input type="url" value={kegForm.linkUrl||''} onChange={e=>setKegForm({...kegForm,linkUrl:e.target.value})} className={inp} placeholder="https://docs.google.com/..." /><p className="text-[10px] text-gray-400 mt-1">Link ke Google Forms, PDF, Excel, atau dokumen lainnya</p></div>}
                  </>
                )}

                {/* Tanggal & Jam Buka/Tutup */}
                <div className="border border-dashed border-gray-200 rounded-xl p-4 bg-gray-50/50">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">📅 Periode Kegiatan</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Dibuka Pada</label>
                      <input type="datetime-local" value={kegForm.openDate||''} onChange={e=>setKegForm({...kegForm,openDate:e.target.value})} className={inp} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Ditutup Pada</label>
                      <input type="datetime-local" value={kegForm.closeDate||''} onChange={e=>setKegForm({...kegForm,closeDate:e.target.value})} className={inp} />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">Status otomatis tersinkron berdasarkan tanggal & jam. Jika dikosongkan, status default "Buka".</p>
                </div>

                <button type="submit" className="w-full py-2.5 bg-hijau text-white font-semibold rounded-xl hover:bg-hijau-tua text-sm">{editId ? 'Simpan Perubahan' : 'Buat Kegiatan'}</button>
              </form>
            )}

            {/* Submissions view */}
            {modal === 'soal-detail' && (
              <div>
                {subs.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">Belum ada yang mengerjakan</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 mb-3">{subs.length} pengerjaan</p>
                    {subs.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{s.userName}</div>
                          <div className="text-xs text-gray-400">{new Date(s.submittedAt).toLocaleString('id-ID')}</div>
                        </div>
                        <div className={`text-lg font-bold ${s.score >= 70 ? 'text-green-600' : 'text-orange-500'}`}>{s.score}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Attendance view */}
            {modal === 'attendance' && (
              <div>
                {attList.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">Belum ada yang absen</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 mb-3">✅ {attList.length} orang sudah absen</p>
                    {attList.map(a => (
                      <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{a.userName}</div>
                          <div className="text-xs text-gray-400">{new Date(a.timestamp).toLocaleString('id-ID')}</div>
                        </div>
                        <span className="text-xs font-mono bg-hijau/10 text-hijau px-2 py-1 rounded">{a.code}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Member detail view */}
            {modal === 'member-detail' && selectedMember && (() => {
              const getRankDetail = (pts) => {
                if (pts >= 100) return { label: 'Sangat Aktif', color: 'text-green-600 bg-green-50', icon: '🏆' };
                if (pts >= 60) return { label: 'Aktif', color: 'text-blue-600 bg-blue-50', icon: '⭐' };
                if (pts >= 30) return { label: 'Cukup Aktif', color: 'text-kuning bg-kuning/10', icon: '📊' };
                return { label: 'Kurang Aktif', color: 'text-red-500 bg-red-50', icon: '⚠️' };
              };
              const rank = getRankDetail(selectedMember.totalPoints);

              return (
                <div>
                  {/* Profile card */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-hijau text-white flex items-center justify-center text-lg font-bold">
                      {selectedMember.name?.[0]}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{selectedMember.name}</div>
                      <div className="text-xs text-gray-400">{selectedMember.npm} • {selectedMember.divisi || '-'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-extrabold text-gray-900">{selectedMember.totalPoints}</div>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${rank.color}`}>{rank.icon} {rank.label}</span>
                    </div>
                  </div>

                  {/* Point breakdown */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-center">
                      <div className="text-lg font-bold text-blue-600">{selectedMember.quizCount}</div>
                      <div className="text-[10px] text-blue-500">Quiz ({selectedMember.quizPoints} pts)</div>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-center">
                      <div className="text-lg font-bold text-purple-600">{selectedMember.absenCount}</div>
                      <div className="text-[10px] text-purple-500">Absen ({selectedMember.absenPoints} pts)</div>
                    </div>
                    <div className="p-3 rounded-xl bg-hijau/5 border border-hijau/10 text-center">
                      <div className="text-lg font-bold text-hijau">{selectedMember.activities.length}</div>
                      <div className="text-[10px] text-hijau">Total Partisipasi</div>
                    </div>
                  </div>

                  {/* Activity timeline */}
                  <h4 className="font-semibold text-gray-900 text-sm mb-3">📝 Riwayat Kegiatan</h4>
                  {selectedMember.activities.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-sm rounded-xl bg-gray-50">Belum ada aktivitas</div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedMember.activities.map((act, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                            act.type === 'quiz' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                          }`}>
                            {act.type === 'quiz' ? '📝' : '📋'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-sm truncate">{act.title}</div>
                            <div className="text-[10px] text-gray-400">
                              {act.type === 'quiz' ? `Nilai: ${act.score}/100` : 'Hadir'}
                              {' • '}{new Date(act.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                          <span className="text-xs font-bold text-hijau">+{act.points}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
