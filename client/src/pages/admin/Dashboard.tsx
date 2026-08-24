import { useEffect, useState } from "react";
import { ClipboardList, CircleDot, Clock, CheckCircle2, AlarmClock } from "lucide-react";
import { DashboardStatCard } from "../../components/dashboard/DashboardStatCard";
import { StatusChart } from "../../components/dashboard/StatusChart";
import { CategoryChart } from "../../components/dashboard/CategoryChart";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { EmptyState } from "../../components/EmptyState";
import { ComplaintTable } from "../../components/complaints/ComplaintTable";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { getAdminDashboard } from "../../services/dashboardService";
import type { AdminDashboard } from "../../types";
import { extractErrorMessage } from "../../services/api";

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    setError(null);
    getAdminDashboard()
      .then(setData)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  if (loading) return <LoadingState label="Loading admin dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-slate-900">Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <DashboardStatCard label="Total Complaints" value={data.stats.total} icon={ClipboardList} />
        <DashboardStatCard label="Open" value={data.stats.open} icon={CircleDot} tone="warning" />
        <DashboardStatCard label="In Progress" value={data.stats.inProgress} icon={Clock} />
        <DashboardStatCard label="Resolved" value={data.stats.resolved} icon={CheckCircle2} tone="success" />
        <DashboardStatCard label="Overdue" value={data.stats.overdue} icon={AlarmClock} tone="danger" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900">Complaints by Status</h2>
          </CardHeader>
          <CardBody>
            <StatusChart byStatus={data.byStatus} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900">Complaints by Category</h2>
          </CardHeader>
          <CardBody>
            <CategoryChart byCategory={data.byCategory} />
          </CardBody>
        </Card>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Overdue Complaints
        </h2>
        {data.overdueComplaints.length === 0 ? (
          <EmptyState title="No overdue complaints" description="Everything is on track." />
        ) : (
          <ComplaintTable complaints={data.overdueComplaints} basePath="/admin/complaints" />
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            High Priority Complaints
          </h2>
          {data.highPriorityComplaints.length === 0 ? (
            <EmptyState title="No high priority complaints" />
          ) : (
            <ComplaintTable complaints={data.highPriorityComplaints} basePath="/admin/complaints" />
          )}
        </section>
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Recent Complaints
          </h2>
          {data.recentComplaints.length === 0 ? (
            <EmptyState title="No complaints yet" />
          ) : (
            <ComplaintTable complaints={data.recentComplaints} basePath="/admin/complaints" />
          )}
        </section>
      </div>
    </div>
  );
}
