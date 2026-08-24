import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, CircleDot, Clock, CheckCircle2, Plus } from "lucide-react";
import { DashboardStatCard } from "../../components/dashboard/DashboardStatCard";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { EmptyState } from "../../components/EmptyState";
import { ComplaintCard } from "../../components/complaints/ComplaintCard";
import { NoticeCard } from "../../components/notices/NoticeCard";
import { Button } from "../../components/ui/Button";
import { getResidentDashboard } from "../../services/dashboardService";
import type { ResidentDashboard } from "../../types";
import { extractErrorMessage } from "../../services/api";

export default function ResidentDashboard() {
  const [data, setData] = useState<ResidentDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    setError(null);
    getResidentDashboard()
      .then(setData)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  if (loading) return <LoadingState label="Loading your dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">My Dashboard</h1>
        <Link to="/resident/complaints/new">
          <Button>
            <Plus className="h-4 w-4" /> Raise New Complaint
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard label="Total Complaints" value={data.stats.total} icon={ClipboardList} />
        <DashboardStatCard label="Open" value={data.stats.open} icon={CircleDot} tone="warning" />
        <DashboardStatCard label="In Progress" value={data.stats.inProgress} icon={Clock} />
        <DashboardStatCard label="Resolved" value={data.stats.resolved} icon={CheckCircle2} tone="success" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Recent Complaints
          </h2>
          {data.recentComplaints.length === 0 ? (
            <EmptyState title="No complaints yet" description="Raise a complaint to get started." />
          ) : (
            <div className="flex flex-col gap-3">
              {data.recentComplaints.map((c) => (
                <ComplaintCard key={c.id} complaint={c} detailsPath={`/resident/complaints/${c.id}`} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Latest Notices
          </h2>
          {data.latestNotices.length === 0 ? (
            <EmptyState title="No notices yet" />
          ) : (
            <div className="flex flex-col gap-3">
              {data.latestNotices.map((n) => (
                <NoticeCard key={n.id} notice={n} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
