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

  if (requiredRole) {
    const hasAccess = user?.role === requiredRole
      || (requiredRole.startsWith('ROLE_PROVIDER') && user?.role?.startsWith('ROLE_PROVIDER'))
      || (requiredRole === 'ROLE_PLATFORM_ADMIN' && user?.role === 'ROLE_PLATFORM_ADMIN');
    if (!hasAccess) {
      if (user?.role === 'ROLE_CUSTOMER') return <Navigate to="/" replace />;
      if (user?.role?.startsWith('ROLE_PROVIDER')) return <Navigate to="/provider/dashboard" replace />;
      if (user?.role === 'ROLE_PLATFORM_ADMIN') return <Navigate to="/admin/dashboard" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
