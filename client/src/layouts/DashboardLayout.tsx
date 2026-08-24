import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";

export function DashboardLayout() {
  return (
    <div className="flex h-full min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
