import { useNavigate } from "react-router-dom";
import type { Complaint } from "../../types";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { OverdueBadge } from "./OverdueBadge";
import { categoryLabels, formatDate } from "../../utils/format";

export function ComplaintTable({ complaints, basePath }: { complaints: Complaint[]; basePath: string }) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Resident</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Filed</th>
            <th className="px-4 py-3">Overdue</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {complaints.map((c) => (
            <tr
              key={c.id}
              onClick={() => navigate(`${basePath}/${c.id}`)}
              className="cursor-pointer hover:bg-slate-50"
            >
              <td className="px-4 py-3">
                <p className="font-medium text-slate-800">{c.residentName ?? "—"}</p>
                <p className="text-xs text-slate-400">{c.apartmentNumber}</p>
              </td>
              <td className="px-4 py-3 text-slate-700">{categoryLabels[c.category]}</td>
              <td className="px-4 py-3">
                <StatusBadge status={c.status} />
              </td>
              <td className="px-4 py-3">
                <PriorityBadge priority={c.priority} />
              </td>
              <td className="px-4 py-3 text-slate-500">{formatDate(c.createdAt)}</td>
              <td className="px-4 py-3">
                <OverdueBadge isOverdue={c.isOverdue} overdueDays={c.overdueDays} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
