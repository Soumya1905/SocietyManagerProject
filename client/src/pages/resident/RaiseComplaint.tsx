import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ComplaintForm, type ComplaintFormValues } from "../../components/complaints/ComplaintForm";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { createComplaint } from "../../services/complaintService";
import { useToast } from "../../context/ToastContext";
import { extractErrorMessage } from "../../services/api";

export default function RaiseComplaint() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: ComplaintFormValues, photo: File | null) {
    setSubmitting(true);
    try {
      const complaint = await createComplaint({ ...values, photo });
      showToast("Complaint submitted successfully");
      navigate(`/resident/complaints/${complaint.id}`);
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold text-slate-900">Raise a New Complaint</h1>
          <p className="mt-1 text-sm text-slate-500">
            Describe the issue clearly so the admin team can act on it quickly.
          </p>
        </CardHeader>
        <CardBody>
          <ComplaintForm onSubmit={handleSubmit} submitting={submitting} />
        </CardBody>
      </Card>
    </div>
  );
}
