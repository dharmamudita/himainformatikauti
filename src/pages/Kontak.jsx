import { useState } from 'react';
import { useData } from '../contexts/DataContext';

const inp = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-hijau/20 focus:border-hijau text-sm';

const Kontak = () => {
  const data = useData();
  const settings = data.regSettings;
  const [form, setForm] = useState({ nama: '', npm: '', angkatan: '', alasan: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMsg('');
    if (!form.nama.trim() || !form.npm.trim() || !form.angkatan.trim() || !form.alasan.trim()) {
      setError('Semua field wajib diisi');
      return;
    }
    const result = await data.submitRegistration(form);
    if (result.error) { setError(result.error); return; }
    setMsg('Pendaftaran berhasil dikirim! Admin akan memverifikasi data Anda.');
    setSent(true);
    setForm({ nama: '', npm: '', angkatan: '', alasan: '' });
  };

  return (
    <div>
      <section className="bg-hijau pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Pendaftaran <span className="text-kuning">Anggota</span></h1>
          <p className="text-white/50 text-sm">Bergabung menjadi bagian dari KSEI RIIEF</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Gabung <span className="text-hijau">KSEI RIIEF</span></h2>
              <p className="text-gray-400 text-sm mb-6">Lengkapi formulir pendaftaran di bawah ini.</p>
              <div className="space-y-3">
                {[
                  { emoji: '📝', title: 'Isi Formulir', value: 'Lengkapi nama, NPM, angkatan, dan alasan bergabung.' },
                  { emoji: '📩', title: 'Kirim Data', value: 'Klik kirim dan data kamu akan masuk ke admin untuk diverifikasi.' },
                  { emoji: '✅', title: 'Tunggu Konfirmasi', value: 'Admin akan memverifikasi pendaftaran kamu.' },
                ].map((c, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-lg mt-0.5">{c.emoji}</span>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{c.title}</div>
                      <div className="text-gray-500 text-xs">{c.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="font-semibold text-gray-900 text-sm mb-2">📍 Kontak Kami</div>
                <div className="text-gray-500 text-xs space-y-1">
                  <p>Kampus UIN Raden Intan Lampung, Jl. Letkol H. Endro Suratmin, Bandar Lampung</p>
                  <p>📧 kseiriief@radenintan.ac.id</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              {!settings.isOpen ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🔒</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Pendaftaran Ditutup</h3>
                  <p className="text-gray-400 text-sm">Pendaftaran anggota baru sedang tidak dibuka. Silakan cek kembali nanti.</p>
                </div>
              ) : sent ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Pendaftaran Terkirim!</h3>
                  <p className="text-gray-400 text-sm mb-4">{msg}</p>
                  <button onClick={() => setSent(false)} className="px-4 py-2 bg-hijau text-white rounded-lg text-sm font-semibold hover:bg-hijau-tua">Daftar Lagi</button>
                </div>
              ) : (
                <>
                  <h3 className="font-bold text-gray-900 mb-1">📋 Formulir Pendaftaran</h3>
                  <p className="text-gray-400 text-xs mb-5">Isi data diri kamu dengan benar</p>
                  {error && <div className="mb-3 p-2.5 bg-red-50 text-red-600 rounded-lg text-xs">{error}</div>}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                      <input type="text" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} className={inp} placeholder="Nama lengkap" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">NPM</label>
                      <input type="text" value={form.npm} onChange={e => setForm({ ...form, npm: e.target.value })} className={inp} placeholder="Nomor Pokok Mahasiswa" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Angkatan</label>
                      <input type="text" value={form.angkatan} onChange={e => setForm({ ...form, angkatan: e.target.value })} className={inp} placeholder="Contoh: 2024" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alasan Bergabung</label>
                      <textarea rows={3} value={form.alasan} onChange={e => setForm({ ...form, alasan: e.target.value })} className={`${inp} resize-none`} placeholder="Ceritakan alasan kamu ingin bergabung..." required />
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-hijau text-white font-semibold rounded-xl hover:bg-hijau-tua transition-colors text-sm">📩 Kirim Pendaftaran</button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Kontak;
