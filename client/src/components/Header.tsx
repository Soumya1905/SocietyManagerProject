import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <div>
        <p className="text-sm text-slate-500">Welcome back,</p>
        <p className="text-base font-semibold text-slate-900">{user?.fullName}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-700">{user?.apartmentNumber}</p>
          <p className="text-xs text-slate-400">{user?.role === "ADMIN" ? "Administrator" : "Resident"}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </header>
  );
}
