import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ComplaintDetailView } from "../../components/complaints/ComplaintDetailView";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Select } from "../../components/ui/Select";
import { Textarea } from "../../components/ui/Textarea";
import { Button } from "../../components/ui/Button";
import {
  getComplaint,
  updateComplaintPriority,
  updateComplaintStatus,
} from "../../services/complaintService";
import type { ComplaintDetails as ComplaintDetailsType, ComplaintPriority, ComplaintStatus } from "../../types";
import { extractErrorMessage } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { priorityLabels, statusLabels } from "../../utils/format";

const NEXT_STATUS: Record<ComplaintStatus, ComplaintStatus[]> = {
  OPEN: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: [],
};

export default function AdminComplaintDetails() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [complaint, setComplaint] = useState<ComplaintDetailsType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextStatus, setNextStatus] = useState<ComplaintStatus | "">("");
  const [note, setNote] = useState("");
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [priority, setPriority] = useState<ComplaintPriority | "">("");
  const [prioritySubmitting, setPrioritySubmitting] = useState(false);

  function load() {
    if (!id) return;
    setLoading(true);
    setError(null);
    getComplaint(id)
      .then((data) => {
        setComplaint(data);
        setPriority(data.priority);
        setNextStatus("");
        setNote("");
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function handleStatusUpdate() {
    if (!id || !nextStatus) return;
    setStatusSubmitting(true);
    try {
      await updateComplaintStatus(id, nextStatus, note || undefined);
      showToast("Status updated successfully");
      load();
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setStatusSubmitting(false);
    }
  }

  async function handlePriorityChange(value: ComplaintPriority) {
    if (!id) return;
    setPriority(value);
    setPrioritySubmitting(true);
    try {
      await updateComplaintPriority(id, value);
      showToast("Priority updated successfully");
      load();
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setPrioritySubmitting(false);
    }
  }

  if (loading) return <LoadingState label="Loading complaint..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!complaint) return null;

  const options = NEXT_STATUS[complaint.status];

  return (
    <ComplaintDetailView
      complaint={complaint}
      showResident
      adminControls={
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900">Manage Complaint</h2>
          </CardHeader>
          <CardBody className="flex flex-col gap-5">
            <div>
              <Select
                label="Priority"
                name="priority"
                value={priority}
                disabled={prioritySubmitting}
                onChange={(e) => handlePriorityChange(e.target.value as ComplaintPriority)}
              >
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            {options.length === 0 ? (
              <p className="text-sm text-slate-500">This complaint is resolved and closed for further updates.</p>
            ) : (
              <div className="flex flex-col gap-3">
                <Select
                  label="Update Status"
                  name="status"
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value as ComplaintStatus)}
                >
                  <option value="">Select a new status</option>
                  {options.map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </Select>
                <Textarea
                  label="Note (optional)"
                  name="note"
                  rows={3}
                  placeholder="Add context for this update..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <Button
                  onClick={handleStatusUpdate}
                  disabled={!nextStatus}
                  loading={statusSubmitting}
                  className="self-start"
                >
                  Update Status
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      }
    />
  );
}
