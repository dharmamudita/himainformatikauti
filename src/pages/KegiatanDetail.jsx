import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const KegiatanDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const data = useData();
  const [mySubmission, setMySubmission] = useState(null);
  const [myAttendance, setMyAttendance] = useState(null);
  const [tab, setTab] = useState('info');
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [absenCode, setAbsenCode] = useState('');
  const [absenMsg, setAbsenMsg] = useState(null);

  const kegiatan = data.getKegiatanById(id);

  useEffect(() => {
    if (!kegiatan) { navigate('/kegiatan'); return; }
    if (user && kegiatan.kategori === 'materi-soal') {
      const sub = data.getUserSubmission(id, user.id);
      if (sub) { setMySubmission(sub); setTab('hasil'); }
    }
    if (user && kegiatan.kategori !== 'materi-soal') {
      const att = data.getUserAttendance(id, user.id);
      if (att) setMyAttendance(att);
    }
  }, [id, user, kegiatan]);

  if (!kegiatan) return <div className="min-h-screen flex items-center justify-center text-gray-400">Memuat...</div>;

  const isMateriSoal = kegiatan.kategori === 'materi-soal';
  const hasSoal = kegiatan.questions && kegiatan.questions.length > 0;

  const handleSubmit = async () => {
    if (!user) { navigate('/login'); return; }
    if (!hasSoal) return;

    let totalPoints = 0;
    let earnedPoints = 0;
    kegiatan.questions.forEach(q => {
      totalPoints += q.points;
      if (q.type === 'pilihan_ganda') {
        if (answers[q.id] === q.correctAnswer) earnedPoints += q.points;
      } else {
        if (answers[q.id] && answers[q.id].trim().length > 10) earnedPoints += q.points;
      }
    });

    const score = Math.round((earnedPoints / totalPoints) * 100);
    const sub = await data.submitAnswer(id, user.id, user.name, answers, score);
    setMySubmission(sub);
    setSubmitted(true);
    setTab('hasil');
  };

  const getKategoriInfo = () => {
    const map = {
      'materi-soal': { emoji: '📝', label: 'Materi & Soal' },
      'kajian': { emoji: '📖', label: 'Kajian Rutin' },
      'seminar': { emoji: '🎤', label: 'Seminar & Workshop' },
      'lomba': { emoji: '🏆', label: 'Lomba & Kompetisi' },
    };
    return map[kegiatan.kategori] || { emoji: '📌', label: 'Kegiatan' };
  };

  const katInfo = getKategoriInfo();

  return (
    <div>
      {/* Hero */}
      <section className="bg-hijau pt-24 pb-10">
        <div className="max-w-4xl mx-auto px-4">
          <Link to="/kegiatan" className="text-white/50 hover:text-white text-sm mb-4 inline-block">← Kembali ke Kegiatan</Link>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/10 text-white/80 px-2 py-1 rounded text-xs">{katInfo.emoji} {katInfo.label}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${kegiatan.status === 'open' ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
              {kegiatan.status === 'open' ? 'Buka' : 'Tutup'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{kegiatan.title}</h1>
          <p className="text-white/50 text-sm">{kegiatan.description}</p>
        </div>
      </section>

      {/* Tabs for materi-soal */}
      {isMateriSoal && (
        <div className="bg-white border-b border-gray-100 sticky top-16 z-20">
          <div className="max-w-4xl mx-auto px-4 flex gap-1">
            {[
              { key: 'info', label: 'ℹ️ Info' },
              ...(kegiatan.materiContent ? [{ key: 'materi', label: '📄 Materi' }] : []),
              ...(hasSoal ? [{ key: 'soal', label: '📋 Soal' }] : []),
              ...(mySubmission ? [{ key: 'hasil', label: '📊 Hasil' }] : []),
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-hijau text-hijau' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <section className="py-10 bg-white min-h-[50vh]">
        <div className="max-w-4xl mx-auto px-4">

          {/* === INFO TAB === */}
          {(tab === 'info' || !isMateriSoal) && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {kegiatan.createdAt && (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-xs text-gray-400 mb-0.5">Tanggal Dibuat</div>
                    <div className="text-sm font-semibold text-gray-900">{kegiatan.createdAt}</div>
                  </div>
                )}
                {kegiatan.createdBy && (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-xs text-gray-400 mb-0.5">Dibuat Oleh</div>
                    <div className="text-sm font-semibold text-gray-900">{kegiatan.createdBy}</div>
                  </div>
                )}
                {kegiatan.jadwal && (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-xs text-gray-400 mb-0.5">📅 Jadwal</div>
                    <div className="text-sm font-semibold text-gray-900">{kegiatan.jadwal}</div>
                  </div>
                )}
                {kegiatan.tempat && (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-xs text-gray-400 mb-0.5">📍 Tempat</div>
                    <div className="text-sm font-semibold text-gray-900">{kegiatan.tempat}</div>
                  </div>
                )}
                {kegiatan.pemateri && (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 sm:col-span-2">
                    <div className="text-xs text-gray-400 mb-0.5">👤 Pemateri/Narasumber</div>
                    <div className="text-sm font-semibold text-gray-900">{kegiatan.pemateri}</div>
                  </div>
                )}
                {kegiatan.hadiah && (
                  <div className="p-4 rounded-xl bg-kuning/10 border border-kuning/20 sm:col-span-2">
                    <div className="text-xs text-kuning mb-0.5">🏆 Hadiah</div>
                    <div className="text-sm font-semibold text-gray-900">{kegiatan.hadiah}</div>
                  </div>
                )}
                {kegiatan.kuota && (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-xs text-gray-400 mb-0.5">👥 Kuota</div>
                    <div className="text-sm font-semibold text-gray-900">{kegiatan.kuota} peserta</div>
                  </div>
                )}
              </div>

              {isMateriSoal && hasSoal && !mySubmission && kegiatan.status === 'open' && (
                <div className="mt-6 p-4 rounded-xl bg-hijau/5 border border-hijau/10">
                  <p className="text-sm text-gray-700 mb-3">📋 Terdapat <strong>{kegiatan.questions.length} soal</strong> yang perlu dikerjakan.</p>
                  {user ? (
                    <button onClick={() => setTab('soal')} className="px-5 py-2 bg-hijau text-white rounded-lg text-sm font-semibold hover:bg-hijau-tua transition-colors">
                      Mulai Kerjakan →
                    </button>
                  ) : (
                    <Link to="/login" className="inline-block px-5 py-2 bg-hijau text-white rounded-lg text-sm font-semibold">Login untuk Mengerjakan</Link>
                  )}
                </div>
              )}

              {mySubmission && (
                <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-100">
                  <p className="text-sm text-green-700">✅ Anda sudah mengerjakan soal ini. Nilai: <strong>{mySubmission.score}/100</strong></p>
                  <button onClick={() => setTab('hasil')} className="text-sm text-hijau font-semibold mt-2">Lihat Detail Hasil →</button>
                </div>
              )}

              {/* === ATTENDANCE SECTION for non materi-soal === */}
              {!isMateriSoal && kegiatan.status === 'open' && (
                <div className="mt-6 p-5 rounded-xl border border-gray-100 bg-gray-50">
                  <h3 className="font-bold text-gray-900 mb-1">📋 Absensi Kegiatan</h3>
                  <p className="text-gray-400 text-xs mb-4">Masukkan kode absensi unik Anda untuk konfirmasi kehadiran</p>

                  {myAttendance ? (
                    <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                      <p className="text-sm text-green-700 font-medium">✅ Anda sudah absen</p>
                      <p className="text-xs text-green-600 mt-1">Kode: {myAttendance.code} • {new Date(myAttendance.timestamp).toLocaleString('id-ID')}</p>
                    </div>
                  ) : user ? (
                    <div>
                      {absenMsg && (
                        <div className={`p-3 rounded-xl mb-3 text-sm ${absenMsg.type === 'error' ? 'bg-red-50 border border-red-100 text-red-600' : 'bg-green-50 border border-green-100 text-green-700'}`}>
                          {absenMsg.type === 'error' ? '❌' : '✅'} {absenMsg.text}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input type="text" value={absenCode} onChange={e => setAbsenCode(e.target.value.toUpperCase())}
                          maxLength={6} placeholder="Masukkan 6 digit kode"
                          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-mono tracking-widest text-center uppercase focus:outline-none focus:ring-2 focus:ring-hijau/20 focus:border-hijau" />
                        <button onClick={async () => {
                          if (absenCode.length !== 6) { setAbsenMsg({ type: 'error', text: 'Kode harus 6 karakter' }); return; }
                          const r = await data.recordAttendance(id, user.id, user.name, absenCode);
                          if (r.error) { setAbsenMsg({ type: 'error', text: r.error }); }
                          else { setAbsenMsg({ type: 'success', text: 'Absensi berhasil!' }); setMyAttendance({ code: absenCode, timestamp: new Date().toISOString() }); setAbsenCode(''); }
                        }} className="px-5 py-2.5 bg-hijau text-white rounded-xl text-sm font-semibold hover:bg-hijau-tua transition-colors">
                          Absen
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">💡 Kode absensi didapatkan dari panitia/admin saat kegiatan berlangsung</p>
                    </div>
                  ) : (
                    <Link to="/login" className="inline-block px-5 py-2 bg-hijau text-white rounded-lg text-sm font-semibold">Login untuk Absen</Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* === MATERI TAB === */}
          {tab === 'materi' && kegiatan.materiContent && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">📄 Materi Pembelajaran</h2>
              <div className="p-6 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-gray-700 text-sm leading-[1.8] whitespace-pre-wrap">{kegiatan.materiContent}</p>
              </div>
              {hasSoal && !mySubmission && kegiatan.status === 'open' && user && (
                <div className="mt-6 text-center">
                  <button onClick={() => setTab('soal')} className="px-6 py-2.5 bg-hijau text-white rounded-lg text-sm font-semibold hover:bg-hijau-tua transition-colors">
                    Lanjut ke Soal →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* === SOAL TAB === */}
          {tab === 'soal' && hasSoal && (
            <div>
              {kegiatan.status !== 'open' ? (
                <div className="text-center py-10">
                  <div className="text-3xl mb-3">🔒</div>
                  <p className="text-gray-400 text-sm">Soal ini sudah ditutup</p>
                </div>
              ) : mySubmission ? (
                <div className="text-center py-10">
                  <div className="text-3xl mb-3">✅</div>
                  <p className="text-gray-700 text-sm">Anda sudah mengerjakan soal ini</p>
                  <button onClick={() => setTab('hasil')} className="text-hijau font-semibold text-sm mt-2">Lihat Hasil</button>
                </div>
              ) : !user ? (
                <div className="text-center py-10">
                  <Link to="/login" className="px-5 py-2 bg-hijau text-white rounded-lg text-sm font-semibold">Login untuk Mengerjakan</Link>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">📋 Kerjakan Soal</h2>
                  <p className="text-gray-400 text-sm mb-6">{kegiatan.questions.length} soal • Jawab semua pertanyaan</p>

                  <div className="space-y-6">
                    {kegiatan.questions.map((q, idx) => (
                      <div key={q.id} className="p-5 rounded-xl border border-gray-100 bg-gray-50">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-7 h-7 rounded-lg bg-hijau text-white text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${q.type === 'pilihan_ganda' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                            {q.type === 'pilihan_ganda' ? 'Pilihan Ganda' : 'Essay'} • {q.points} poin
                          </span>
                        </div>
                        <p className="text-gray-800 text-sm font-medium mb-3">{q.question}</p>

                        {q.type === 'pilihan_ganda' ? (
                          <div className="space-y-2">
                            {q.options.map((opt, oi) => (
                              <label key={oi} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                answers[q.id] === oi ? 'border-hijau bg-hijau/5' : 'border-gray-200 bg-white hover:border-gray-300'
                              }`}>
                                <input type="radio" name={q.id} checked={answers[q.id] === oi} onChange={() => setAnswers({ ...answers, [q.id]: oi })}
                                  className="accent-hijau" />
                                <span className="text-sm text-gray-700">{opt}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <textarea value={answers[q.id] || ''} onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                            rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-hijau/20 focus:border-hijau resize-none"
                            placeholder="Tulis jawaban Anda..." />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      {Object.keys(answers).length}/{kegiatan.questions.length} soal terjawab
                    </p>
                    <button onClick={handleSubmit}
                      disabled={Object.keys(answers).length < kegiatan.questions.length}
                      className="px-6 py-2.5 bg-hijau text-white rounded-lg text-sm font-semibold hover:bg-hijau-tua transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      Submit Jawaban ✓
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* === HASIL TAB === */}
          {tab === 'hasil' && mySubmission && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Hasil Pengerjaan</h2>

              {/* Score card */}
              <div className={`p-6 rounded-xl border mb-6 text-center ${mySubmission.score >= 70 ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
                <div className={`text-4xl font-extrabold mb-1 ${mySubmission.score >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                  {mySubmission.score}
                </div>
                <div className="text-sm text-gray-500">dari 100</div>
                <div className={`text-sm font-semibold mt-2 ${mySubmission.score >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                  {mySubmission.score >= 90 ? '🌟 Sangat Baik!' : mySubmission.score >= 70 ? '👍 Baik' : mySubmission.score >= 50 ? '📚 Cukup, Perlu Belajar Lagi' : '💪 Tetap Semangat!'}
                </div>
                <div className="text-xs text-gray-400 mt-2">Dikerjakan: {new Date(mySubmission.submittedAt).toLocaleString('id-ID')}</div>
              </div>

              {/* Review answers */}
              <h3 className="font-bold text-gray-900 mb-3">Detail Jawaban</h3>
              <div className="space-y-4">
                {kegiatan.questions.map((q, idx) => {
                  const myAnswer = mySubmission.answers[q.id];
                  const isCorrect = q.type === 'pilihan_ganda' && myAnswer === q.correctAnswer;

                  return (
                    <div key={q.id} className={`p-4 rounded-xl border ${q.type === 'pilihan_ganda' ? (isCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50') : 'border-gray-100 bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-gray-500">Soal {idx + 1}</span>
                        {q.type === 'pilihan_ganda' && (
                          <span className={`text-xs font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {isCorrect ? '✅ Benar' : '❌ Salah'}
                          </span>
                        )}
                        {q.type === 'essay' && <span className="text-xs text-purple-600">📝 Essay</span>}
                      </div>
                      <p className="text-sm text-gray-800 mb-2">{q.question}</p>
                      {q.type === 'pilihan_ganda' ? (
                        <div className="text-sm">
                          <div className="text-gray-500">Jawaban Anda: <span className={isCorrect ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{q.options[myAnswer] || '-'}</span></div>
                          {!isCorrect && <div className="text-green-600 mt-1">Jawaban benar: {q.options[q.correctAnswer]}</div>}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100">{myAnswer || '-'}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default KegiatanDetail;
