import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ComplaintStatus } from "../../types";
import { statusLabels } from "../../utils/format";

const COLORS: Record<ComplaintStatus, string> = {
  OPEN: "#f59e0b",
  IN_PROGRESS: "#3b82f6",
  RESOLVED: "#10b981",
};

export function StatusChart({ byStatus }: { byStatus: Record<ComplaintStatus, number> }) {
  const data = (Object.keys(byStatus) as ComplaintStatus[]).map((status) => ({
    status: statusLabels[status],
    count: byStatus[status],
    key: status,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="status" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.key} fill={COLORS[entry.key]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
