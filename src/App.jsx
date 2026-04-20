import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import Tentang from './pages/Tentang';
import Struktur from './pages/Struktur';
import Kegiatan from './pages/Kegiatan';
import KegiatanDetail from './pages/KegiatanDetail';
import Galeri from './pages/Galeri';
import Kontak from './pages/Kontak';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Leaderboard from './pages/Leaderboard';
import MemberDashboard from './pages/MemberDashboard';
import Forum from './pages/Forum';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const Layout = ({ children }) => {
  const { pathname } = useLocation();
  const hide = pathname === '/login' || pathname === '/admin';
  return (
    <>
      {!hide && <Navbar />}
      {children}
      {!hide && <Footer />}
    </>
  );
};

function App() {
  return (
    <Router>
      <DataProvider>
        <AuthProvider>
          <ScrollToTop />
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tentang" element={<Tentang />} />
              <Route path="/struktur" element={<Struktur />} />
              <Route path="/kegiatan" element={<Kegiatan />} />
              <Route path="/kegiatan/:id" element={<KegiatanDetail />} />
              <Route path="/galeri" element={<Galeri />} />
              <Route path="/kontak" element={<Kontak />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<ProtectedRoute><MemberDashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            </Routes>
          </Layout>
        </AuthProvider>
      </DataProvider>
    </Router>
  );
}

export default App;
