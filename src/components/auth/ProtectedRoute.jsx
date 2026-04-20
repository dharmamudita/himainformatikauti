import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, kadivAllowed = false }) => {
  const { user, isAdmin, isKadiv, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Memuat...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin && !(kadivAllowed && isKadiv)) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
