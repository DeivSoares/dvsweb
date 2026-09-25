import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../services/AuthContext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="auth-loading">Validando sessão...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function ManagementRoute() {
  const { user, claims, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="auth-loading">Validando sessão...</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!["CEO", "Administrador"].includes(claims.nivelAcesso)) {
    return <Navigate to="/painel" replace />;
  }

  return <Outlet />;
}

export function RoleRoute({ allowedLevels }) {
  const { user, claims, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="auth-loading">Validando sessão...</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!allowedLevels.includes(claims.nivelAcesso)) {
    return <Navigate to="/painel" replace />;
  }

  return <Outlet />;
}