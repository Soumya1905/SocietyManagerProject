import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";

export function RoleProtectedRoute({ allow }: { allow: Role[] }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
}
