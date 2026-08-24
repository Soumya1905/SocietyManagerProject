import { Outlet } from "react-router-dom";
import { Building2 } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Building2 className="h-7 w-7 text-brand-600" />
          <span className="text-lg font-semibold text-slate-900">Society Maintenance Tracker</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
