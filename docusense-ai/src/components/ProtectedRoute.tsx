import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function FullPageLoader() {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <span className="page-loader__ring" aria-hidden="true" />
      <span className="sr-only">Loading your workspace</span>
    </div>
  );
}

/** Only signed-in people can see child routes. Everyone else goes to /login. */
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/** Login, signup and reset pages: signed-in people are sent on to their workspace. */
export function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageLoader />;
  if (user) {
    const from = (location.state as { from?: string } | null)?.from ?? '/welcome';
    return <Navigate to={from} replace />;
  }
  return <Outlet />;
}
