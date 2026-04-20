const Struktur = () => {
  const pengurus = [
    { name: 'M. Ghailan Danish', role: 'Ketua Umum' },
    { name: 'Dhiya Laila Az Zahra', role: 'Wakil Ketua Umum' },
    { name: 'Adelia Pramudiza', role: 'Sekretaris Umum' },
    { name: 'Asrialiatus Sholekhah', role: 'Bendahara Umum' },
  ];

  const divisi = [
    { name: 'Kaderisasi', desc: 'Pembinaan dan pengembangan kader organisasi', icon: '🎓' },
    { name: 'Research & Development', desc: 'Riset dan pengembangan kajian ekonomi Islam', icon: '🔬' },
    { name: 'Public Relation', desc: 'Hubungan masyarakat dan komunikasi eksternal', icon: '🤝' },
    { name: 'Entrepreneurship', desc: 'Pengembangan kewirausahaan berbasis Islam', icon: '💡' },
    { name: 'Kesekretariatan', desc: 'Administrasi dan dokumentasi organisasi', icon: '📋' },
    { name: 'Kemuslimahan', desc: 'Pembinaan keislaman anggota', icon: '🕌' },
    { name: 'Media & Komunikasi', desc: 'Pengelolaan media dan konten digital', icon: '📱' },
  ];

  return (
    <div>
      <section className="bg-hijau pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Struktur <span className="text-kuning">Organisasi</span></h1>
          <p className="text-white/50 text-sm">Kepengurusan UKM KSEI RIIEF UIN Raden Intan Lampung</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Pengurus <span className="text-hijau">Inti</span></h2>
          <p className="text-gray-400 text-sm text-center mb-10">Jajaran pengurus inti KSEI RIIEF</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pengurus.map((p, i) => (
              <div key={i} className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 mx-auto rounded-xl bg-hijau text-white flex items-center justify-center text-lg font-bold mb-3">{p.name[0]}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-0.5">{p.name}</h3>
                <p className="text-hijau text-xs font-medium">{p.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Divisi <span className="text-hijau">Kami</span></h2>
          <p className="text-gray-400 text-sm text-center mb-10">7 divisi yang bergerak aktif di KSEI RIIEF</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {divisi.map((d, i) => (
              <div key={i} className="p-5 rounded-xl bg-white border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">{d.icon}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{d.name}</h3>
                <p className="text-gray-400 text-sm">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Struktur;
