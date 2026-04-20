import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Link } from 'react-router-dom';

const katColor = { rapat: 'bg-purple-50 text-purple-600', progja: 'bg-blue-50 text-blue-600', panitia: 'bg-orange-50 text-orange-600' };
const katLabel = { rapat: '📅 Rapat', progja: '🚀 Progja', panitia: '🎪 Panitia' };

const KadivDashboard = () => {
  const { user: me } = useAuth();
  const data = useData();
  const { users, kegiatan, scoreAssessments, SKOR_AWAL, getUserScore } = data;

  const [tab, setTab] = useState('scoring');
  const [filterKat, setFilterKat] = useState('semua');
  const [searchKeg, setSearchKeg] = useState('');
  const [selectedKegId, setSelectedKegId] = useState(null);
  const [searchMember, setSearchMember] = useState('');
  const [filterMemberDivisi, setFilterMemberDivisi] = useState('semua');
  const [checked, setChecked] = useState({});
  const [nilaiModal, setNilaiModal] = useState(null);
  const [nilaiForm, setNilaiForm] = useState({ nilai: '', catatan: '' });
  const [batchMode, setBatchMode] = useState(false);
  const [batchNilai, setBatchNilai] = useState('');
  const [err, setErr] = useState('');
  const [suc, setSuc] = useState('');
  const clearSuc = () => setTimeout(() => setSuc(''), 2500);

  // Kegiatan form
  const [showKegForm, setShowKegForm] = useState(false);
  const [kegForm, setKegForm] = useState({ kategori: 'progja', title: '', description: '', divisi: me?.divisi || '' });

  if (!me) return null;
  const myDivisi = me.divisi;
  const members = users.filter(u => u.role !== 'admin');
  const myDivisiMembers = members.filter(m => m.divisi === myDivisi);

  // Kegiatan yang bisa diakses kadiv:
  // - Progja dari divisi dia
  // - Panitia semua
  const kadivKegiatan = useMemo(() => {
    return kegiatan.filter(k => {
      if (k.kategori === 'progja') return k.divisi === myDivisi || k.createdBy === me.name;
      if (k.kategori === 'panitia') return true;
      return false;
    });
  }, [kegiatan, myDivisi, me.name]);

  const filteredKeg = useMemo(() => {
    let list = [...kadivKegiatan];
    if (filterKat !== 'semua') list = list.filter(k => k.kategori === filterKat);
    if (searchKeg.trim()) list = list.filter(k => k.title.toLowerCase().includes(searchKeg.toLowerCase()));
    return list.sort((a, b) => new Date(b.openDate || b.createdAt || 0) - new Date(a.openDate || a.createdAt || 0));
  }, [kadivKegiatan, filterKat, searchKeg]);

  const selectedKeg = selectedKegId ? kegiatan.find(k => k.id === selectedKegId) : null;

  const findAssessment = (userId, kegId) => scoreAssessments.find(a => a.userId === userId && a.kegiatanId === kegId);

  // Members to show for selected kegiatan
  const kegMembers = useMemo(() => {
    if (!selectedKeg) return [];
    let pool;
    if (selectedKeg.kategori === 'progja') {
      // Progja: anggota divisi wajib + extra members (added by kadiv)
      const divMembers = myDivisiMembers;
      const extraIds = selectedKeg.extraMembers || [];
      const extraMembers = members.filter(m => extraIds.includes(m.id) && !divMembers.find(d => d.id === m.id));
      pool = [...divMembers, ...extraMembers];
    } else {
      // Panitia & Rapat: semua anggota
      pool = members;
    }

    let list = pool.map(m => {
      const ass = findAssessment(m.id, selectedKeg.id);
      return {
        ...m,
        assessment: ass,
        status: ass ? (ass.nilai > 0 ? 'hadir' : 'tidak_hadir') : 'belum',
        nilai: ass?.nilai ?? null,
        isDivisi: m.divisi === myDivisi,
      };
    });
    if (searchMember.trim()) {
      list = list.filter(m => m.name?.toLowerCase().includes(searchMember.toLowerCase()));
    }
    if (filterMemberDivisi !== 'semua') {
      list = list.filter(m => (m.divisi || '') === filterMemberDivisi);
    }
    return list.sort((a, b) => {
      const order = { belum: 0, hadir: 1, tidak_hadir: 2 };
      return (order[a.status] || 0) - (order[b.status] || 0);
    });
  }, [selectedKeg, members, myDivisiMembers, scoreAssessments, searchMember, filterMemberDivisi]);

  // Extra members from other divisions (for progja add)
  const addableMembers = useMemo(() => {
    if (!selectedKeg || selectedKeg.kategori !== 'progja') return [];
    const extraIds = selectedKeg.extraMembers || [];
    return members.filter(m => m.divisi !== myDivisi && !extraIds.includes(m.id));
  }, [selectedKeg, members, myDivisi]);

  const [showAddMember, setShowAddMember] = useState(false);
  const [addSearch, setAddSearch] = useState('');

  // Toggle checkbox
  const toggleCheck = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleAll = () => {
    const belum = kegMembers.filter(m => m.status === 'belum');
    const allChecked = belum.every(m => checked[m.id]);
    const newChecked = { ...checked };
    belum.forEach(m => { newChecked[m.id] = !allChecked; });
    setChecked(newChecked);
  };

  // Batch mark hadir (with nilai)
  const batchMarkHadir = async () => {
    const n = Number(batchNilai);
    if (isNaN(n) || n < 1 || n > 100) { setErr('Nilai harus 1-100'); return; }
    const selected = kegMembers.filter(m => checked[m.id] && m.status === 'belum');
    for (const m of selected) {
      await data.addScoreAssessment({
        userId: m.id, kegiatanId: selectedKeg.id, kategori: selectedKeg.kategori, nilai: n, catatan: 'Hadir',
      });
    }
    setChecked({}); setBatchMode(false); setBatchNilai('');
    setSuc(`${selected.length} anggota dinilai hadir (${n})`); clearSuc();
  };

  // Batch mark tidak hadir
  const batchMarkTidakHadir = async () => {
    if (!window.confirm('Tandai yang dicentang sebagai Tidak Hadir (0)?')) return;
    const selected = kegMembers.filter(m => checked[m.id] && m.status === 'belum');
    for (const m of selected) {
      await data.addScoreAssessment({
        userId: m.id, kegiatanId: selectedKeg.id, kategori: selectedKeg.kategori, nilai: 0, catatan: 'Tidak hadir',
      });
    }
    setChecked({});
    setSuc(`${selected.length} anggota ditandai tidak hadir`); clearSuc();
  };

  // Individual score
  const openNilai = (userId, kegiatanId, kategori) => {
    const existing = findAssessment(userId, kegiatanId);
    setNilaiForm({ nilai: existing ? String(existing.nilai) : '', catatan: existing?.catatan || '' });
    setNilaiModal({ userId, kegiatanId, kategori, existing });
    setErr('');
  };

  const saveNilai = async (e) => {
    e.preventDefault(); setErr('');
    const n = Number(nilaiForm.nilai);
    if (isNaN(n) || n < 0 || n > 100) { setErr('Nilai harus 0-100'); return; }
    if (nilaiModal.existing) {
      await data.updateScoreAssessment(nilaiModal.existing.id, { nilai: n, catatan: nilaiForm.catatan });
    } else {
      await data.addScoreAssessment({
        userId: nilaiModal.userId, kegiatanId: nilaiModal.kegiatanId, kategori: nilaiModal.kategori,
        nilai: n, catatan: nilaiForm.catatan,
      });
    }
    setNilaiModal(null); setSuc('Nilai tersimpan!'); clearSuc();
  };

  // Add member from other divisi to progja
  const addMemberToProgja = async (userId) => {
    if (!selectedKeg) return;
    const extraMembers = [...(selectedKeg.extraMembers || []), userId];
    await data.updateKegiatan(selectedKeg.id, { ...selectedKeg, extraMembers });
    setSuc('Anggota ditambahkan ke progja'); clearSuc();
  };

  // Save kegiatan
  const onSaveKeg = async (e) => {
    e.preventDefault();
    if (!kegForm.title.trim()) return;
    await data.createKegiatan({
      ...kegForm,
      divisi: kegForm.kategori === 'progja' ? myDivisi : '',
      status: 'open',
      createdBy: me.name,
    });
    setKegForm({ kategori: 'progja', title: '', description: '', divisi: myDivisi });
    setShowKegForm(false);
    setSuc('Kegiatan berhasil dibuat!'); clearSuc();
  };

  const getUserName = (uid) => users.find(u => u.id === uid)?.name || '?';
  const getUserDivisi = (uid) => users.find(u => u.id === uid)?.divisi || '-';
  const checkedCount = kegMembers.filter(m => checked[m.id] && m.status === 'belum').length;

  const inp = 'w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-hijau/20';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-gray-900">Dashboard Kadiv</h1>
            <p className="text-xs text-gray-400">{me.name} • {myDivisi}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-600">🏠 Website</Link>
            <Link to="/dashboard" className="text-xs text-gray-400 hover:text-gray-600">📊 Dashboard</Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {suc && <div className="p-3 rounded-xl bg-green-50 border border-green-100 text-sm text-green-700 mb-4">✅ {suc}</div>}

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          <button onClick={() => setTab('scoring')} className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === 'scoring' ? 'bg-hijau text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>⭐ Penilaian</button>
          <button onClick={() => setTab('kegiatan')} className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === 'kegiatan' ? 'bg-hijau text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>📋 Buat Kegiatan</button>
        </div>

        {/* KEGIATAN TAB */}
        {tab === 'kegiatan' && (
          <div className="max-w-lg">
            <h2 className="font-bold text-gray-900 mb-3">+ Buat Kegiatan Baru</h2>
            <form onSubmit={onSaveKeg} className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select value={kegForm.kategori} onChange={e => setKegForm({ ...kegForm, kategori: e.target.value })} className={inp}>
                  <option value="progja">🚀 Program Kerja (Divisi {myDivisi})</option>
                  <option value="panitia">🎪 Kepanitiaan</option>
                </select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                <input type="text" value={kegForm.title} onChange={e => setKegForm({ ...kegForm, title: e.target.value })} className={inp} required placeholder="Contoh: Workshop Desain Grafis" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea value={kegForm.description} onChange={e => setKegForm({ ...kegForm, description: e.target.value })} className={inp} rows={2} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Jadwal</label>
                <input type="text" value={kegForm.jadwal||''} onChange={e => setKegForm({ ...kegForm, jadwal: e.target.value })} className={inp} placeholder="Contoh: Jumat, 13:00 WIB" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Tempat</label>
                <input type="text" value={kegForm.tempat||''} onChange={e => setKegForm({ ...kegForm, tempat: e.target.value })} className={inp} placeholder="Contoh: Ruang Lab 3" /></div>
              <div className="border border-dashed border-gray-200 rounded-xl p-4 bg-gray-50/50">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">📅 Periode Kegiatan</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Dibuka Pada</label>
                    <input type="datetime-local" value={kegForm.openDate||''} onChange={e => setKegForm({ ...kegForm, openDate: e.target.value })} className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Ditutup Pada</label>
                    <input type="datetime-local" value={kegForm.closeDate||''} onChange={e => setKegForm({ ...kegForm, closeDate: e.target.value })} className={inp} />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-hijau text-white font-semibold rounded-xl hover:bg-hijau-tua text-sm">Buat Kegiatan</button>
            </form>
          </div>
        )}

        {/* SCORING TAB */}
        {tab === 'scoring' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* LEFT: Kegiatan list (2 cols) */}
            <div className="lg:col-span-2">
              <h3 className="font-bold text-gray-900 mb-3">📋 Pilih Kegiatan</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {['semua', 'progja', 'panitia'].map(k => (
                  <button key={k} onClick={() => { setFilterKat(k); setSelectedKegId(null); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filterKat === k ? 'bg-hijau text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
                    {k === 'semua' ? 'Semua' : katLabel[k]}
                  </button>
                ))}
              </div>
              <input type="text" placeholder="🔍 Cari..." value={searchKeg} onChange={e => setSearchKeg(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs mb-2" />

              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredKeg.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-xs bg-white rounded-xl border border-gray-100">Belum ada kegiatan</div>
                ) : filteredKeg.map(k => {
                  const assessed = scoreAssessments.filter(a => a.kegiatanId === k.id).length;
                  const isSelected = selectedKegId === k.id;
                  return (
                    <button key={k.id} onClick={() => { setSelectedKegId(isSelected ? null : k.id); setChecked({}); setSearchMember(''); setBatchMode(false); }}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${isSelected ? 'border-hijau bg-hijau/5' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                      <div className="font-medium text-gray-900 text-sm truncate">{k.title}</div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${katColor[k.kategori]}`}>{katLabel[k.kategori]}</span>
                        {k.divisi && <span className="text-[10px] text-gray-400">🏢 {k.divisi}</span>}
                        <span className="text-[10px] text-gray-400">📊 {assessed} dinilai</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: Member list + scoring (3 cols) */}
            <div className="lg:col-span-3">
              {!selectedKeg ? (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
                  ← Pilih kegiatan untuk mulai menilai
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  {/* Header */}
                  <div className="p-3 bg-gray-50 border-b border-gray-100">
                    <div className="font-semibold text-gray-900 text-sm">{selectedKeg.title}</div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400">
                      <span className={`px-2 py-0.5 rounded font-medium ${katColor[selectedKeg.kategori]}`}>{katLabel[selectedKeg.kategori]}</span>
                      {selectedKeg.kategori === 'progja' && (
                        <button onClick={() => setShowAddMember(true)} className="text-blue-500 font-medium hover:underline">+ Tambah dari divisi lain</button>
                      )}
                    </div>
                  </div>

                  {/* Search + divisi filter + batch actions */}
                  <div className="px-3 py-2 border-b border-gray-50 space-y-2">
                    <div className="flex gap-2">
                      <input type="text" placeholder="🔍 Cari anggota..." value={searchMember} onChange={e => setSearchMember(e.target.value)}
                        className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-xs" />
                      <select value={filterMemberDivisi} onChange={e => setFilterMemberDivisi(e.target.value)}
                        className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white">
                        <option value="semua">Semua Divisi</option>
                        {['Hubungan Masyarakat','Sosial Masyarakat','Sumber Daya Manusia','Bina Prestasi','Komdigi','Ekonomi Kreatif'].map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    {kegMembers.some(m => m.status === 'belum') && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={toggleAll} className="text-[10px] text-blue-500 font-medium">
                          {kegMembers.filter(m => m.status === 'belum').every(m => checked[m.id]) ? '☑️ Batal semua' : '☐ Centang semua belum'}
                        </button>
                        {checkedCount > 0 && (
                          <>
                            <span className="text-[10px] text-gray-300">|</span>
                            <span className="text-[10px] text-gray-500">{checkedCount} terpilih →</span>
                            {!batchMode ? (
                              <>
                                <button onClick={() => setBatchMode(true)} className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-[10px] font-medium border border-green-100">✅ Hadir & Nilai</button>
                                <button onClick={batchMarkTidakHadir} className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-medium border border-red-100">❌ Tidak Hadir</button>
                              </>
                            ) : (
                              <div className="flex items-center gap-1">
                                <input type="number" min="1" max="100" value={batchNilai} onChange={e => setBatchNilai(e.target.value)}
                                  className="w-16 px-2 py-0.5 rounded border border-gray-200 text-xs" placeholder="Nilai" autoFocus />
                                <button onClick={batchMarkHadir} className="px-2 py-0.5 bg-hijau text-white rounded text-[10px] font-medium">OK</button>
                                <button onClick={() => setBatchMode(false)} className="text-gray-400 text-xs">✕</button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Member list */}
                  <div className="divide-y divide-gray-50 max-h-[450px] overflow-y-auto">
                    {kegMembers.map(m => (
                      <div key={m.id} className={`flex items-center gap-2 px-3 py-2.5 ${m.status === 'tidak_hadir' ? 'bg-red-50/30' : ''}`}>
                        {m.status === 'belum' && (
                          <input type="checkbox" checked={!!checked[m.id]} onChange={() => toggleCheck(m.id)}
                            className="w-4 h-4 rounded border-gray-300 text-hijau shrink-0" />
                        )}
                        {m.status !== 'belum' && <div className="w-4 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm truncate">
                            {m.name} {m.isDivisi && <span className="text-[10px] text-hijau">★</span>}
                          </div>
                          <div className="text-[10px] text-gray-400">{m.divisi || '-'}</div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {m.status === 'belum' && !checked[m.id] && (
                            <span className="text-[10px] text-gray-300">Belum</span>
                          )}
                          {m.status === 'belum' && checked[m.id] && (
                            <button onClick={() => openNilai(m.id, selectedKeg.id, selectedKeg.kategori)}
                              className="px-2 py-0.5 bg-hijau text-white rounded text-[10px] font-medium">Nilai</button>
                          )}
                          {m.status === 'hadir' && (
                            <>
                              <span className={`text-base font-bold ${m.nilai >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>{m.nilai}</span>
                              <button onClick={() => openNilai(m.id, selectedKeg.id, selectedKeg.kategori)} className="text-blue-500 text-xs">✏️</button>
                            </>
                          )}
                          {m.status === 'tidak_hadir' && (
                            <>
                              <span className="text-sm font-bold text-red-400">0</span>
                              <button onClick={() => openNilai(m.id, selectedKeg.id, selectedKeg.kategori)} className="text-blue-500 text-xs">✏️</button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Input Nilai */}
      {nilaiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">⭐ {nilaiModal.existing ? 'Edit' : 'Input'} Nilai</h3>
              <button onClick={() => setNilaiModal(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="mb-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="text-sm font-medium text-gray-900">{getUserName(nilaiModal.userId)}</div>
              <div className="text-xs text-gray-400">{getUserDivisi(nilaiModal.userId)}</div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${katColor[nilaiModal.kategori]}`}>{katLabel[nilaiModal.kategori]}</span>
            </div>
            {err && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 mb-3">❌ {err}</div>}
            <form onSubmit={saveNilai} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nilai (0-100)</label>
                <input type="number" min="0" max="100" value={nilaiForm.nilai} onChange={e => setNilaiForm({ ...nilaiForm, nilai: e.target.value })}
                  className={inp} required placeholder="0 = tidak hadir, 100 = sempurna" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea value={nilaiForm.catatan} onChange={e => setNilaiForm({ ...nilaiForm, catatan: e.target.value })}
                  className={inp} rows={2} placeholder="Hadir tepat waktu, aktif..." />
              </div>
              <button type="submit" className="w-full py-2.5 bg-hijau text-white font-semibold rounded-xl hover:bg-hijau-tua text-sm">Simpan</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add member from other divisi */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">+ Tambah Anggota Lain</h3>
              <button onClick={() => { setShowAddMember(false); setAddSearch(''); }} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <input type="text" placeholder="Cari nama..." value={addSearch} onChange={e => setAddSearch(e.target.value)} className={inp + ' mb-3'} />
            <div className="max-h-[300px] overflow-y-auto space-y-1">
              {addableMembers.filter(m => !addSearch || m.name?.toLowerCase().includes(addSearch.toLowerCase())).map(m => (
                <div key={m.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{m.name}</div>
                    <div className="text-[10px] text-gray-400">{m.divisi}</div>
                  </div>
                  <button onClick={() => addMemberToProgja(m.id)} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium">+ Tambah</button>
                </div>
              ))}
              {addableMembers.filter(m => !addSearch || m.name?.toLowerCase().includes(addSearch.toLowerCase())).length === 0 && (
                <div className="p-4 text-center text-gray-400 text-xs">Tidak ada anggota yang bisa ditambahkan</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KadivDashboard;
