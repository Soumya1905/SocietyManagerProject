import type { ReactNode } from "react";
import type { ComplaintDetails } from "../../types";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { OverdueBadge } from "./OverdueBadge";
import { ComplaintTimeline } from "./ComplaintTimeline";
import { Card, CardBody, CardHeader } from "../ui/Card";
import { categoryLabels, formatDate } from "../../utils/format";

interface ComplaintDetailViewProps {
  complaint: ComplaintDetails;
  showResident?: boolean;
  adminControls?: ReactNode;
}

export function ComplaintDetailView({ complaint, showResident, adminControls }: ComplaintDetailViewProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card>
          <CardHeader className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                {categoryLabels[complaint.category]}
              </h1>
              <p className="text-xs text-slate-400">Complaint ID: {complaint.id}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
              <OverdueBadge isOverdue={complaint.isOverdue} overdueDays={complaint.overdueDays} />
            </div>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            {showResident && (
              <div className="text-sm text-slate-600">
                <span className="font-medium text-slate-800">{complaint.residentName}</span> ·{" "}
                {complaint.apartmentNumber}
              </div>
            )}
            <p className="whitespace-pre-wrap text-sm text-slate-700">{complaint.description}</p>

            {complaint.photoUrl && (
              <img
                src={complaint.photoUrl}
                alt="Complaint evidence"
                className="max-h-80 w-full rounded-md border border-slate-200 object-contain"
              />
            )}

            <dl className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-slate-400">Created</dt>
                <dd className="text-slate-700">{formatDate(complaint.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Resolved</dt>
                <dd className="text-slate-700">
                  {complaint.resolvedAt ? formatDate(complaint.resolvedAt) : "—"}
                </dd>
              </div>
            </dl>
          </CardBody>
        </Card>

        {adminControls}
      </div>

      <Card className="h-fit">
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900">Status History</h2>
        </CardHeader>
        <CardBody>
          <ComplaintTimeline history={complaint.history} />
        </CardBody>
      </Card>
    </div>
  );
}
