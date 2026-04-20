import { Link } from 'react-router-dom';

const socials = [
  { name: 'Instagram', icon: '📸', url: 'https://www.instagram.com/HIMAInformatika', color: 'hover:text-pink-400' },
  { name: 'TikTok', icon: '🎵', url: 'https://www.tiktok.com/@ukmHIMAInformatika', color: 'hover:text-white' },
  { name: 'YouTube', icon: '▶️', url: 'https://youtube.com/@HIMAInformatika2680', color: 'hover:text-red-400' },
  { name: 'Facebook', icon: '👤', url: 'https://www.facebook.com/share/18WVML7Wb6/', color: 'hover:text-blue-500' },
  { name: 'Blog', icon: '📝', url: 'http://HIMAInformatika-uinril.blogspot.com/', color: 'hover:text-orange-400' },
  { name: 'Email', icon: '📧', url: 'mailto:HIMAInformatika@radenintan.ac.id', color: 'hover:text-green-400' },
];

const Footer = () => (
  <footer className="bg-gray-900 text-gray-400">
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src="/logo-teknokrat.png" alt="UTI" className="w-7 h-7 rounded object-contain" />
            <img src="/logo-hima.png" alt="HIMA" className="w-7 h-7 rounded object-contain" />
            <img src="/logo-kabinet.png" alt="Kabinet" className="w-7 h-7 rounded object-contain" />
            <span className="text-white font-bold text-sm">HIMA Informatika</span>
          </div>
          <p className="text-sm leading-relaxed mb-4">Himpunan Mahasiswa Informatika Universitas Teknokrat Indonesia.</p>
          {/* Social Media Icons */}
          <div className="flex flex-wrap gap-2">
            {socials.map(s => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" title={s.name}
                className={`w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-sm transition-colors ${s.color}`}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Navigasi</h4>
          <ul className="space-y-2 text-sm">
            {[['Beranda','/'],['Tentang','/tentang'],['Struktur','/struktur'],['Kegiatan','/kegiatan'],['Leaderboard','/leaderboard'],['Forum','/forum'],['Pendaftaran','/kontak']].map(([n,p]) => (
              <li key={p}><Link to={p} className="hover:text-kuning transition-colors">{n}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Divisi</h4>
          <ul className="space-y-2 text-sm">
            {['Hubungan Masyarakat','Sosial Masyarakat','Sumber Daya Manusia','Bina Prestasi','Komdigi','Ekonomi Kreatif'].map(d => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Kontak</h4>
          <ul className="space-y-2 text-sm">
            <li>📍 Kampus Universitas Teknokrat Indonesia</li>
            <li><a href="mailto:HIMAInformatika@radenintan.ac.id" className="hover:text-kuning transition-colors">📧 HIMAInformatika@radenintan.ac.id</a></li>
          </ul>
          <h4 className="text-white font-semibold text-sm mt-5 mb-3">Ikuti Kami</h4>
          <div className="flex flex-wrap gap-1.5">
            {socials.map(s => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                className={`text-xs px-2.5 py-1 rounded-md bg-gray-800 transition-colors ${s.color}`}>
                {s.icon} {s.name}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-10 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} HIMA Informatika Universitas Teknokrat Indonesia
      </div>
    </div>
  </footer>
);

export default Footer;
