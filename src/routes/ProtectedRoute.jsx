import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FullPageLoader } from '../components/Loader';

export function ProtectedRoute({ allowedRoles }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><FullPageLoader /></div>;
  }

  if (!user) return <Navigate to="/login" replace />;

  const isSuperAdmin = user.roles?.includes('super_admin');

  if (allowedRoles && !allowedRoles.some((r) => user.roles?.includes(r))) {
    return <Navigate to={isSuperAdmin ? '/platform' : '/'} replace />;
  }

  return <Outlet />;
}