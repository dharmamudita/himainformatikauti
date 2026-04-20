import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scroll, setScroll] = useState(false);
  const [drop, setDrop] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();

  const links = [
    { name: 'Beranda', to: '/' },
    { name: 'Tentang', to: '/tentang' },
    { name: 'Struktur', to: '/struktur' },
    { name: 'Kegiatan', to: '/kegiatan' },
    { name: 'Leaderboard', to: '/leaderboard' },
    { name: 'Forum', to: '/forum' },
    { name: 'Pendaftaran', to: '/kontak' },
  ];

  useEffect(() => {
    const fn = () => setScroll(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setOpen(false); setDrop(false); }, [loc.pathname]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scroll ? 'bg-white shadow-lg' : 'bg-hijau'}`}>
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.jpeg" alt="KSEI RIIEF" className="w-9 h-9 rounded-lg object-cover" />
          <div>
            <div className={`font-bold text-sm ${scroll ? 'text-gray-900' : 'text-white'}`}>KSEI RIIEF</div>
            <div className={`text-[9px] tracking-widest ${scroll ? 'text-gray-400' : 'text-white/60'}`}>UIN RADEN INTAN</div>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link key={l.to} to={l.to} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${loc.pathname === l.to
                ? (scroll ? 'text-hijau bg-hijau/10' : 'text-kuning')
                : (scroll ? 'text-gray-600 hover:text-hijau' : 'text-white/70 hover:text-white')
              }`}>
              {l.name}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative hidden md:block">
              <button onClick={() => setDrop(!drop)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${scroll ? 'text-gray-700' : 'text-white'}`}>
                <div className="w-7 h-7 rounded-lg bg-hijau text-white text-xs font-bold flex items-center justify-center">{user.name?.[0]}</div>
                {user.name}
              </button>
              {drop && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-400">{user.npm}</div>
                  </div>
                  {isAdmin && <Link to="/admin" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">Dashboard Admin</Link>}
                  {!isAdmin && <Link to="/dashboard" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">Dashboard Saya</Link>}
                  <button onClick={() => { logout(); nav('/'); }} className="block w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50">Keluar</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className={`hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors
              ${scroll ? 'bg-hijau text-white hover:bg-hijau-tua' : 'bg-white text-hijau hover:bg-kuning hover:text-gray-900'}`}>
              Login
            </Link>
          )}

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className={`md:hidden p-2 rounded-lg ${scroll ? 'text-gray-700' : 'text-white'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? <path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          {links.map(l => (
            <Link key={l.to} to={l.to} className={`block px-3 py-2 rounded-lg text-sm font-medium ${loc.pathname === l.to ? 'bg-hijau/10 text-hijau' : 'text-gray-600'}`}>{l.name}</Link>
          ))}
          {user ? (
            <div className="pt-2 border-t border-gray-100 mt-2">
              <div className="px-3 py-2 text-sm font-semibold text-gray-900">{user.name}</div>
              {isAdmin && <Link to="/admin" className="block px-3 py-2 text-sm text-hijau">Dashboard Admin</Link>}
              {!isAdmin && <Link to="/dashboard" className="block px-3 py-2 text-sm text-hijau">Dashboard Saya</Link>}
              <button onClick={() => { logout(); nav('/'); }} className="block w-full text-left px-3 py-2 text-sm text-red-500">Keluar</button>
            </div>
          ) : (
            <Link to="/login" className="block text-center px-3 py-2 mt-2 rounded-lg bg-hijau text-white text-sm font-semibold">Login</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
