import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [npm, setNpm] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const r = login(npm, password);
      if (r.success) navigate('/');
      else setError(r.error);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-hijau flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Link to="/">
            <div className="w-12 h-12 mx-auto rounded-xl bg-white/10 text-white font-bold text-lg flex items-center justify-center mb-3 border border-white/20">R</div>
          </Link>
          <h1 className="text-xl font-bold text-white mb-1">Selamat Datang</h1>
          <p className="text-white/50 text-sm">Masuk ke akun KSEI RIIEF Anda</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 mb-4">
              <p className="text-sm text-red-600">❌ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NPM</label>
              <input type="text" value={npm} onChange={e => setNpm(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-hijau/20 focus:border-hijau text-sm" placeholder="Masukkan NPM" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-hijau/20 focus:border-hijau text-sm pr-10" placeholder="Masukkan password" required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-hijau text-white font-semibold rounded-xl hover:bg-hijau-tua transition-colors text-sm disabled:opacity-50">
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-400">Akun dibuat oleh Admin.</p>
        </div>

        <div className="text-center mt-4">
          <Link to="/" className="text-white/50 hover:text-white text-sm">← Kembali ke Beranda</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
