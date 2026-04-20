import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      {/* Hero */}
      <section className="bg-hijau pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-6 border border-white/10">
            ✨ UKM Universitas • Sejak 2008
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4">
            KSEI <span className="text-kuning">RIIEF</span>
          </h1>
          <p className="text-white/60 text-lg mb-1">Raden Intan Islamic Entrepreneur Forum</p>
          <p className="text-white/40 text-sm max-w-lg mx-auto mb-8">
            Forum mahasiswa dalam ekonomi Islam dan kewirausahaan yang unggul, objektif, komunikatif dan edukatif
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link to="/tentang" className="px-6 py-3 bg-white text-hijau font-semibold rounded-xl hover:bg-kuning hover:text-gray-900 transition-colors text-sm">
              Tentang Kami →
            </Link>
            <Link to="/kegiatan" className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors text-sm">
              Lihat Kegiatan
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {[['2008','Tahun Berdiri'],['7+','Divisi Aktif'],['100+','Anggota Aktif'],['50+','Kegiatan/Tahun']].map(([v,l],i) => (
              <div key={i} className="bg-white/10 rounded-xl px-4 py-3 border border-white/5">
                <div className="text-2xl font-bold text-white">{v}</div>
                <div className="text-white/40 text-xs">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Bidang Pergerakan Kami</h2>
            <p className="text-gray-400 text-sm">KSEI RIIEF bergerak dalam berbagai bidang untuk mengembangkan ekonomi Islam</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '🎓', title: 'Kajian Ekonomi Islam', desc: 'Mempelajari dan mengembangkan ilmu ekonomi Islam secara mendalam.' },
              { icon: '💡', title: 'Kewirausahaan', desc: 'Memberdayakan kewirausahaan berbasis prinsip ekonomi Islam.' },
              { icon: '🤝', title: 'Networking', desc: 'Menjalin ukhuwah antar Kelompok Studi Ekonomi Islam.' },
              { icon: '🌍', title: 'Kontribusi Masyarakat', desc: 'Memberikan kontribusi penerapan ekonomi Islam di masyarakat.' },
            ].map((f, i) => (
              <div key={i} className="p-5 rounded-xl border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1.5 text-sm">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visi Misi */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-hijau/10 text-hijau text-xs font-semibold mb-3">Visi Kami</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Menjadi Forum Mahasiswa <span className="text-hijau">Unggul & Edukatif</span>
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                UKM RIIEF UIN Raden Intan Lampung menjadi forum mahasiswa dalam ilmu pengetahuan ekonomi Islam dan kewirausahaan yang unggul, objektif, komunikatif dan edukatif di tatanan UIN Raden Intan Lampung.
              </p>
              <Link to="/tentang" className="text-hijau font-semibold text-sm hover:text-hijau-tua transition-colors">
                Pelajari Selengkapnya →
              </Link>
            </div>
            <div className="bg-hijau rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-4">Misi Kami</h3>
              <ul className="space-y-3">
                {['Memberdayakan dan mengembangkan sistem ekonomi Islam','Mengembangkan kewirausahaan berbasis ekonomi Islam','Menjalin ukhuwah dan kerjasama antar KSEI','Membangun budaya Islamiah, ilmiah dan professional','Kontribusi penerapan ekonomi Islam di masyarakat'].map((m,i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-md bg-white/20 text-kuning text-xs font-bold flex items-center justify-center shrink-0">{i+1}</span>
                    <span className="text-white/80 text-sm">{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="bg-hijau rounded-2xl px-6 py-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Bergabung Bersama Kami</h2>
            <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">Jadilah bagian dari keluarga besar KSEI RIIEF</p>
            <Link to="/kontak" className="inline-block px-6 py-3 bg-kuning text-gray-900 font-bold rounded-xl hover:bg-kuning-muda transition-colors text-sm">
              Hubungi Kami →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
