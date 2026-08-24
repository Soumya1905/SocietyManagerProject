import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ComplaintDetailView } from "../../components/complaints/ComplaintDetailView";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { getComplaint } from "../../services/complaintService";
import type { ComplaintDetails as ComplaintDetailsType } from "../../types";
import { extractErrorMessage } from "../../services/api";

export default function ComplaintDetails() {
  const { id } = useParams<{ id: string }>();
  const [complaint, setComplaint] = useState<ComplaintDetailsType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    if (!id) return;
    setLoading(true);
    setError(null);
    getComplaint(id)
      .then(setComplaint)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  if (loading) return <LoadingState label="Loading complaint..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!complaint) return null;

  return <ComplaintDetailView complaint={complaint} />;
}
