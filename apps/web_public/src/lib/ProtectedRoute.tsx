import { Navigate } from 'react-router-dom';
import { useAuth } from './auth';

export default function ProtectedRoute({
  children,
  requiredRole
}: {
  children: React.ReactNode;
  requiredRole?: string;
}) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    if (user?.role === 'ROLE_CUSTOMER') return <Navigate to="/" replace />;
    if (user?.role?.startsWith('ROLE_PROVIDER')) return <Navigate to="/provider/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
