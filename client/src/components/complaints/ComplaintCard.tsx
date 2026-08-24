import { Link } from "react-router-dom";
import type { Complaint } from "../../types";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { OverdueBadge } from "./OverdueBadge";
import { categoryLabels, formatDate } from "../../utils/format";

export function ComplaintCard({ complaint, detailsPath }: { complaint: Complaint; detailsPath: string }) {
  return (
    <Link
      to={detailsPath}
      className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">{categoryLabels[complaint.category]}</p>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{complaint.description}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusBadge status={complaint.status} />
        <PriorityBadge priority={complaint.priority} />
        <OverdueBadge isOverdue={complaint.isOverdue} overdueDays={complaint.overdueDays} />
      </div>
      <p className="mt-3 text-xs text-slate-400">Filed on {formatDate(complaint.createdAt)}</p>
    </Link>
  );
}
