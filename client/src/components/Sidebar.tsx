import { NavLink } from "react-router-dom";
import clsx from "clsx";
import {
  LayoutDashboard,
  FilePlus2,
  ListChecks,
  Megaphone,
  User,
  Building2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const residentLinks = [
  { to: "/resident/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/resident/complaints/new", label: "Raise Complaint", icon: FilePlus2 },
  { to: "/resident/complaints", label: "My Complaints", icon: ListChecks },
  { to: "/resident/notices", label: "Notice Board", icon: Megaphone },
  { to: "/resident/profile", label: "Profile", icon: User },
];

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/complaints", label: "Complaints", icon: ListChecks },
  { to: "/admin/notices", label: "Notices", icon: Megaphone },
  { to: "/admin/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const { user } = useAuth();
  const links = user?.role === "ADMIN" ? adminLinks : residentLinks;

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <Building2 className="h-6 w-6 text-brand-600" />
        <span className="text-sm font-semibold text-slate-900">Society Tracker</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to.endsWith("dashboard")}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
