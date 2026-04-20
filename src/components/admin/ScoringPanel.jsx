import { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';

const katColor = { rapat: 'bg-purple-50 text-purple-600', progja: 'bg-blue-50 text-blue-600', panitia: 'bg-orange-50 text-orange-600' };
const katLabel = { rapat: '📅 Rapat', progja: '🚀 Progja', panitia: '🎪 Panitia' };
const DIVISI_LIST = ['Hubungan Masyarakat','Sosial Masyarakat','Sumber Daya Manusia','Bina Prestasi','Komdigi','Ekonomi Kreatif'];

export default function ScoringPanel() {
  const data = useData();
  const { users, kegiatan, scoreAssessments, SKOR_AWAL, getUserScore } = data;

  const [filterKat, setFilterKat] = useState('semua');
  const [filterDivisi, setFilterDivisi] = useState('semua');
  const [searchKeg, setSearchKeg] = useState('');
  const [searchMember, setSearchMember] = useState('');
  const [filterMemberDivisi, setFilterMemberDivisi] = useState('semua');
  const [selectedKegId, setSelectedKegId] = useState(null);
  const [checked, setChecked] = useState({});
  const [batchMode, setBatchMode] = useState(false);
  const [batchNilai, setBatchNilai] = useState('');
  const [nilaiModal, setNilaiModal] = useState(null);
  const [nilaiForm, setNilaiForm] = useState({ nilai: '', catatan: '' });
  const [err, setErr] = useState('');
  const [suc, setSuc] = useState('');
  const clearSuc = () => setTimeout(() => setSuc(''), 2500);

  const members = users.filter(u => u.role !== 'admin');

  const scorableKegiatan = useMemo(() => {
    return kegiatan.filter(k => ['rapat', 'progja', 'panitia'].includes(k.kategori));
  }, [kegiatan]);

  const filteredKeg = useMemo(() => {
    let list = [...scorableKegiatan];
    if (filterKat !== 'semua') list = list.filter(k => k.kategori === filterKat);
    if (filterDivisi !== 'semua') list = list.filter(k => (k.divisi || '') === filterDivisi || !k.divisi);
    if (searchKeg.trim()) list = list.filter(k => k.title.toLowerCase().includes(searchKeg.toLowerCase()));
    return list.sort((a, b) => new Date(b.openDate || b.createdAt || 0) - new Date(a.openDate || a.createdAt || 0));
  }, [scorableKegiatan, filterKat, filterDivisi, searchKeg]);

  const selectedKeg = selectedKegId ? kegiatan.find(k => k.id === selectedKegId) : null;
  const findAssessment = (userId, kegId) => scoreAssessments.find(a => a.userId === userId && a.kegiatanId === kegId);

  // All members for kegiatan with status
  const kegMembers = useMemo(() => {
    if (!selectedKeg) return [];
    let list = members.map(m => {
      const ass = findAssessment(m.id, selectedKeg.id);
      return { ...m, assessment: ass, status: ass ? (ass.nilai > 0 ? 'hadir' : 'tidak_hadir') : 'belum', nilai: ass?.nilai ?? null };
    });
    if (searchMember.trim()) list = list.filter(m => m.name?.toLowerCase().includes(searchMember.toLowerCase()));
    if (filterMemberDivisi !== 'semua') list = list.filter(m => (m.divisi || '') === filterMemberDivisi);
    return list.sort((a, b) => { const o = { belum: 0, hadir: 1, tidak_hadir: 2 }; return (o[a.status] || 0) - (o[b.status] || 0); });
  }, [selectedKeg, members, scoreAssessments, searchMember, filterMemberDivisi]);

  const kegStats = useMemo(() => {
    if (!selectedKeg) return { total: 0, hadir: 0, tidak: 0, belum: 0 };
    const total = members.length;
    const assessed = scoreAssessments.filter(a => a.kegiatanId === selectedKeg.id);
    return { total, hadir: assessed.filter(a => a.nilai > 0).length, tidak: assessed.filter(a => a.nilai === 0).length, belum: total - assessed.length };
  }, [selectedKeg, members, scoreAssessments]);

  const memberRanking = useMemo(() => {
    return members.map(m => ({ ...m, skor: Math.round(getUserScore(m.id) * 10) / 10, totalAss: scoreAssessments.filter(a => a.userId === m.id).length }))
      .sort((a, b) => b.skor - a.skor);
  }, [members, scoreAssessments, getUserScore]);

  const toggleCheck = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleAll = () => {
    const belum = kegMembers.filter(m => m.status === 'belum');
    const allChecked = belum.every(m => checked[m.id]);
    const nc = { ...checked }; belum.forEach(m => { nc[m.id] = !allChecked; }); setChecked(nc);
  };

  const batchMarkHadir = async () => {
    const n = Number(batchNilai);
    if (isNaN(n) || n < 1 || n > 100) { setErr('Nilai harus 1-100'); return; }
    const sel = kegMembers.filter(m => checked[m.id] && m.status === 'belum');
    for (const m of sel) await data.addScoreAssessment({ userId: m.id, kegiatanId: selectedKeg.id, kategori: selectedKeg.kategori, nilai: n, catatan: 'Hadir' });
    setChecked({}); setBatchMode(false); setBatchNilai(''); setSuc(`${sel.length} anggota dinilai hadir (${n})`); clearSuc();
  };

  const batchMarkTidakHadir = async () => {
    if (!window.confirm('Tandai yang dicentang sebagai Tidak Hadir (0)?')) return;
    const sel = kegMembers.filter(m => checked[m.id] && m.status === 'belum');
    for (const m of sel) await data.addScoreAssessment({ userId: m.id, kegiatanId: selectedKeg.id, kategori: selectedKeg.kategori, nilai: 0, catatan: 'Tidak hadir' });
    setChecked({}); setSuc(`${sel.length} anggota ditandai tidak hadir`); clearSuc();
  };

  const markAllTidakHadir = async () => {
    if (!window.confirm('Tandai semua belum dinilai sebagai Tidak Hadir (0)?')) return;
    const unassessed = members.filter(m => !findAssessment(m.id, selectedKeg.id));
    for (const m of unassessed) await data.addScoreAssessment({ userId: m.id, kegiatanId: selectedKeg.id, kategori: selectedKeg.kategori, nilai: 0, catatan: 'Tidak hadir' });
    setSuc(`${unassessed.length} ditandai tidak hadir`); clearSuc();
  };

  const openNilai = (userId, kegiatanId, kategori) => {
    const existing = findAssessment(userId, kegiatanId);
    setNilaiForm({ nilai: existing ? String(existing.nilai) : '', catatan: existing?.catatan || '' });
    setNilaiModal({ userId, kegiatanId, kategori, existing }); setErr('');
  };

  const saveNilai = async (e) => {
    e.preventDefault(); setErr('');
    const n = Number(nilaiForm.nilai);
    if (isNaN(n) || n < 0 || n > 100) { setErr('Nilai harus 0-100'); return; }
    if (nilaiModal.existing) await data.updateScoreAssessment(nilaiModal.existing.id, { nilai: n, catatan: nilaiForm.catatan });
    else await data.addScoreAssessment({ userId: nilaiModal.userId, kegiatanId: nilaiModal.kegiatanId, kategori: nilaiModal.kategori, nilai: n, catatan: nilaiForm.catatan });
    setNilaiModal(null); setSuc('Nilai tersimpan!'); clearSuc();
  };

  const getUserName = (uid) => users.find(u => u.id === uid)?.name || '?';
  const getUserDivisi = (uid) => users.find(u => u.id === uid)?.divisi || '-';
  const checkedCount = kegMembers.filter(m => checked[m.id] && m.status === 'belum').length;

  return (
    <div>
      {suc && <div className="p-3 rounded-xl bg-green-50 border border-green-100 text-sm text-green-700 mb-4">✅ {suc}</div>}

      {/* Bobot */}
      <div className="flex flex-wrap gap-2 mb-4 text-xs">
        <span className="bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 text-purple-600">📅 Rapat <strong>20%</strong></span>
        <span className="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 text-blue-600">🚀 Progja <strong>45%</strong></span>
        <span className="bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 text-orange-600">🎪 Panitia <strong>35%</strong></span>
        <span className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-gray-600">🎯 Skor Awal = <strong>{SKOR_AWAL}</strong></span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-xl p-4 border border-gray-100"><div className="text-2xl font-bold text-gray-900">{members.length}</div><div className="text-xs text-gray-400">Anggota</div></div>
        <div className="bg-white rounded-xl p-4 border border-gray-100"><div className="text-2xl font-bold text-gray-900">{scorableKegiatan.length}</div><div className="text-xs text-gray-400">Kegiatan</div></div>
        <div className="bg-white rounded-xl p-4 border border-gray-100"><div className="text-2xl font-bold text-gray-900">{scoreAssessments.length}</div><div className="text-xs text-gray-400">Penilaian</div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT: Kegiatan */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3">📋 Kegiatan (Pilih untuk menilai)</h3>
          <div className="space-y-2 mb-3">
            <div className="flex flex-wrap gap-2">
              {['semua', 'rapat', 'progja', 'panitia'].map(k => (
                <button key={k} onClick={() => { setFilterKat(k); setSelectedKegId(null); setChecked({}); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filterKat === k ? 'bg-hijau text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
                  {k === 'semua' ? 'Semua' : katLabel[k]} ({k === 'semua' ? scorableKegiatan.length : scorableKegiatan.filter(x => x.kategori === k).length})
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="🔍 Cari..." value={searchKeg} onChange={e => setSearchKeg(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs" />
              {(filterKat === 'progja' || filterKat === 'panitia') && (
                <select value={filterDivisi} onChange={e => setFilterDivisi(e.target.value)} className="px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-xs">
                  <option value="semua">Semua Divisi</option>
                  {DIVISI_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              )}
            </div>
          </div>

          <div className="space-y-2 max-h-[280px] overflow-y-auto mb-3">
            {filteredKeg.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-xs bg-white rounded-xl border border-gray-100">Belum ada kegiatan</div>
            ) : filteredKeg.map(k => {
              const assessed = scoreAssessments.filter(a => a.kegiatanId === k.id).length;
              const isSelected = selectedKegId === k.id;
              return (
                <button key={k.id} onClick={() => { setSelectedKegId(isSelected ? null : k.id); setChecked({}); setSearchMember(''); setFilterMemberDivisi('semua'); setBatchMode(false); }}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${isSelected ? 'border-hijau bg-hijau/5' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                  <div className="font-medium text-gray-900 text-sm truncate">{k.title}</div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${katColor[k.kategori]}`}>{katLabel[k.kategori]}</span>
                    {k.divisi && <span className="text-[10px] text-gray-400">🏢 {k.divisi}</span>}
                    {k.openDate && <span className="text-[10px] text-gray-400">📅 {new Date(k.openDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>}
                    <span className="text-[10px] text-gray-400">📊 {assessed}/{members.length}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected kegiatan members with checkboxes */}
          {selectedKeg && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{selectedKeg.title}</div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400">
                      <span className="text-green-600">✅ {kegStats.hadir}</span>
                      <span className="text-red-500">❌ {kegStats.tidak}</span>
                      <span>⏳ {kegStats.belum}</span>
                    </div>
                  </div>
                  {kegStats.belum > 0 && (
                    <button onClick={markAllTidakHadir} className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-medium rounded-lg border border-red-100">
                      Sisa → tidak hadir
                    </button>
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
                    {DIVISI_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                {kegMembers.some(m => m.status === 'belum') && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={toggleAll} className="text-[10px] text-blue-500 font-medium">
                      {kegMembers.filter(m => m.status === 'belum').every(m => checked[m.id]) ? '☑️ Batal semua' : '☐ Centang semua'}
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

              <div className="divide-y divide-gray-50 max-h-[350px] overflow-y-auto">
                {kegMembers.map(m => (
                  <div key={m.id} className={`flex items-center gap-2 px-3 py-2.5 ${m.status === 'tidak_hadir' ? 'bg-red-50/30' : ''}`}>
                    {m.status === 'belum' && (
                      <input type="checkbox" checked={!!checked[m.id]} onChange={() => toggleCheck(m.id)} className="w-4 h-4 rounded border-gray-300 text-hijau shrink-0" />
                    )}
                    {m.status !== 'belum' && <div className="w-4 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate">{m.name}</div>
                      <div className="text-[10px] text-gray-400">{m.divisi || '-'}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {m.status === 'belum' && checked[m.id] && (
                        <button onClick={() => openNilai(m.id, selectedKeg.id, selectedKeg.kategori)} className="px-2 py-0.5 bg-hijau text-white rounded text-[10px] font-medium">Nilai</button>
                      )}
                      {m.status === 'belum' && !checked[m.id] && <span className="text-[10px] text-gray-300">Belum</span>}
                      {m.status === 'hadir' && (
                        <>
                          <span className={`text-base font-bold ${m.nilai >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>{m.nilai}</span>
                          <button onClick={() => openNilai(m.id, selectedKeg.id, selectedKeg.kategori)} className="text-blue-500 text-xs">✏️</button>
                          <button onClick={() => { if (window.confirm('Hapus?')) data.deleteScoreAssessment(m.assessment.id); }} className="text-gray-300 hover:text-red-500 text-xs">🗑️</button>
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

        {/* RIGHT: Ranking */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3">🏆 Klasemen</h3>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden max-h-[700px] overflow-y-auto">
            {memberRanking.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">Belum ada anggota</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {memberRanking.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-200 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'
                    }`}>{i < 3 ? ['👑', '🥈', '🥉'][i] : i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate">{m.name}</div>
                      <div className="text-[10px] text-gray-400">{m.divisi || '-'} • {m.totalAss} penilaian</div>
                    </div>
                    <span className={`text-lg font-bold ${m.skor >= 70 ? 'text-green-600' : 'text-red-500'}`}>{m.skor.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Nilai */}
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
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-hijau/20" required placeholder="0-100" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea value={nilaiForm.catatan} onChange={e => setNilaiForm({ ...nilaiForm, catatan: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-hijau/20" rows={2} placeholder="Hadir tepat waktu, aktif..." />
              </div>
              <button type="submit" className="w-full py-2.5 bg-hijau text-white font-semibold rounded-xl hover:bg-hijau-tua text-sm">Simpan</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
