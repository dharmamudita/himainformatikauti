import { useState } from 'react';
import { useData } from '../contexts/DataContext';

const Tentang = () => {
  const data = useData();
  const [fbForm, setFbForm] = useState({ nama: '', jenis: 'saran', pesan: '' });
  const [fbMsg, setFbMsg] = useState('');
  const [fbErr, setFbErr] = useState('');

  const handleFeedback = async (e) => {
    e.preventDefault();
    setFbErr(''); setFbMsg('');
    if (!fbForm.nama.trim() || !fbForm.pesan.trim()) { setFbErr('Nama dan pesan wajib diisi'); return; }
    await data.submitFeedback(fbForm.nama.trim(), fbForm.jenis, fbForm.pesan.trim());
    setFbMsg('Terima kasih atas masukan Anda! 🙏');
    setFbForm({ nama: '', jenis: 'saran', pesan: '' });
    setTimeout(() => setFbMsg(''), 4000);
  };

  const inp = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-hijau/20 focus:border-hijau text-sm';

  return (
    <div>
      {/* Hero */}
      <section className="bg-hijau pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Tentang <span className="text-kuning">HIMA Informatika</span></h1>
          <p className="text-white/50 text-sm">Mengenal lebih dekat HIMA Informatika Universitas Teknokrat Indonesia</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-hijau/10 text-hijau text-xs font-semibold mb-3">Profil Organisasi</span>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Himpunan Mahasiswa <span className="text-hijau">Informatika</span></h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-3">
                HIMA Informatika adalah Himpunan Mahasiswa Informatika di Universitas Teknokrat Indonesia yang menjadi wadah aspirasi, pengembangan potensi, dan kreativitas mahasiswa program studi Informatika.
              </p>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Berdiri sebagai organisasi resmi mahasiswa informatika yang bertujuan meningkatkan kompetensi dan prestasi mahasiswa.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="text-xs text-gray-400">Berdiri</div>
                  <div className="text-sm font-bold text-gray-900">Mei 2008</div>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="text-xs text-gray-400">Tingkat</div>
                  <div className="text-sm font-bold text-gray-900">Universitas</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-3">Visi</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">Menjadi himpunan mahasiswa informatika yang unggul, inovatif, kompetitif dan berprestasi di tingkat nasional.</p>
              <h3 className="font-bold text-gray-900 mb-3">Misi</h3>
              <ul className="space-y-2.5">
                {['Mengembangkan kompetensi mahasiswa di bidang teknologi.','Memfasilitasi pengembangan soft skill dan hard skill.','Menjalin kerjasama internal dan eksternal kampus.','Mendorong prestasi akademik dan non-akademik.','Kontribusi kepada masyarakat melalui teknologi.'].map((m,i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-500">
                    <span className="w-5 h-5 rounded bg-hijau/10 text-hijau text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Perjalanan <span className="text-hijau">Sejarah</span></h2>
          <p className="text-gray-400 text-sm text-center mb-10">Jejak langkah HIMA Informatika dari awal hingga sekarang</p>
          <div className="space-y-4">
            {[
              { year: '2020', title: 'Terbentuknya HIMA Informatika', desc: 'HIMA Informatika resmi didirikan sebagai wadah mahasiswa program studi Informatika.' },
              { year: '2022', title: 'Pengembangan Organisasi', desc: 'Memperluas divisi dan program kerja untuk seluruh mahasiswa informatika.' },
              { year: '2024', title: 'Era Digital & Inovasi', desc: 'Mengadopsi sistem digital untuk mendukung seluruh kegiatan organisasi.' },
            ].map((t, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-14 h-14 rounded-xl bg-hijau text-white flex items-center justify-center font-bold text-xs shrink-0">{t.year}</div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 flex-1">
                  <h3 className="font-bold text-gray-900 mb-1 text-sm">{t.title}</h3>
                  <p className="text-gray-500 text-sm">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kritik & Saran */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Kritik & <span className="text-hijau">Saran</span></h2>
            <p className="text-gray-400 text-sm">Bantu kami menjadi lebih baik dengan masukan Anda</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            {fbMsg && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl text-sm font-medium text-center">{fbMsg}</div>}
            {fbErr && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm text-center">{fbErr}</div>}

            <form onSubmit={handleFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input type="text" value={fbForm.nama} onChange={e => setFbForm({ ...fbForm, nama: e.target.value })} className={inp} placeholder="Nama Anda (boleh anonim)" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis</label>
                <div className="flex gap-3">
                  {[
                    { key: 'kritik', label: '💬 Kritik', color: 'border-red-200 bg-red-50 text-red-700' },
                    { key: 'saran', label: '💡 Saran', color: 'border-blue-200 bg-blue-50 text-blue-700' },
                    { key: 'apresiasi', label: '❤️ Apresiasi', color: 'border-green-200 bg-green-50 text-green-700' },
                  ].map(j => (
                    <button key={j.key} type="button" onClick={() => setFbForm({ ...fbForm, jenis: j.key })}
                      className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${fbForm.jenis === j.key ? j.color : 'border-gray-200 bg-white text-gray-400'}`}>
                      {j.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pesan</label>
                <textarea rows={4} value={fbForm.pesan} onChange={e => setFbForm({ ...fbForm, pesan: e.target.value })} className={`${inp} resize-none`} placeholder="Tulis kritik, saran, atau apresiasi Anda..." required />
              </div>
              <button type="submit" className="w-full py-2.5 bg-hijau text-white font-semibold rounded-xl hover:bg-hijau-tua transition-colors text-sm">
                📩 Kirim Masukan
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Tentang;
