import { useEffect, useState } from "react";
import { ComplaintFilters } from "../../components/complaints/ComplaintFilters";
import { ComplaintTable } from "../../components/complaints/ComplaintTable";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { EmptyState } from "../../components/EmptyState";
import { Select } from "../../components/ui/Select";
import { listComplaints, type ComplaintFilters as Filters } from "../../services/complaintService";
import type { Complaint } from "../../types";
import { extractErrorMessage } from "../../services/api";

export default function ComplaintManagement() {
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
      <h1 className="text-xl font-semibold text-slate-900">Complaint Management</h1>

      <div className="flex flex-wrap items-end gap-3">
        <ComplaintFilters filters={filters} onChange={setFilters} showStatus showOverdue />
        <div className="w-full sm:w-auto">
          <Select
            label="Sort by"
            value={filters.sortBy ?? "createdAt"}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as Filters["sortBy"] })}
          >
            <option value="createdAt">Date filed</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
          </Select>
        </div>
        <div className="w-full sm:w-auto">
          <Select
            label="Order"
            value={filters.sortOrder ?? "desc"}
            onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as Filters["sortOrder"] })}
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </Select>
        </div>
      </div>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && complaints && complaints.length === 0 && (
        <EmptyState title="No complaints found" description="Try adjusting your filters." />
      )}
      {!loading && !error && complaints && complaints.length > 0 && (
        <ComplaintTable complaints={complaints} basePath="/admin/complaints" />
      )}
    </div>
  );
}
