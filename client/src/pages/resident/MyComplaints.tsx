import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { ComplaintCard } from "../../components/complaints/ComplaintCard";
import { ComplaintFilters } from "../../components/complaints/ComplaintFilters";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { EmptyState } from "../../components/EmptyState";
import { Button } from "../../components/ui/Button";
import { listComplaints, type ComplaintFilters as Filters } from "../../services/complaintService";
import type { Complaint } from "../../types";
import { extractErrorMessage } from "../../services/api";

export default function MyComplaints() {
  const [complaints, setComplaints] = useState<Complaint[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});

  function load() {
    setLoading(true);
    setError(null);
    listComplaints(filters)
      .then(setComplaints)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, [filters]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">My Complaints</h1>
        <Link to="/resident/complaints/new">
          <Button>
            <Plus className="h-4 w-4" /> Raise New Complaint
          </Button>
        </Link>
      </div>

      <ComplaintFilters filters={filters} onChange={setFilters} showStatus />

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && complaints && complaints.length === 0 && (
        <EmptyState
          title="No complaints found"
          description="Try adjusting your filters, or raise a new complaint."
        />
      )}
      {!loading && !error && complaints && complaints.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {complaints.map((c) => (
            <ComplaintCard key={c.id} complaint={c} detailsPath={`/resident/complaints/${c.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
