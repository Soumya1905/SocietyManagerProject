import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingState } from "../components/LoadingState";

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingState label="Checking your session..." />;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}
