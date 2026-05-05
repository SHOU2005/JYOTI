import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, adminOnly }) {
  const { user, loading, isAuthenticated } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-zinc-400">Loading…</div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  if (!adminOnly && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return children;
}
