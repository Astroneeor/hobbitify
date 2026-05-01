import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface RequireAuthProps {
  children: ReactNode;
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { session, loading, configured } = useAuth();
  const location = useLocation();

  if (!configured) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-3">
          <h1 className="text-2xl font-semibold">Auth not configured</h1>
          <p className="text-text-secondary text-sm">
            Set <code>VITE_SUPABASE_URL</code> and{" "}
            <code>VITE_SUPABASE_ANON_KEY</code> in <code>react-app/.env.local</code>
            to enable accounts and the library.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center">
        <div className="animate-pulse text-text-muted text-sm">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};
