import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ComplaintCategory } from "../../types";
import { categoryLabels } from "../../utils/format";

const PALETTE = ["#3b82f6", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#06b6d4", "#ec4899", "#64748b"];

export function CategoryChart({ byCategory }: { byCategory: Partial<Record<ComplaintCategory, number>> }) {
  const data = Object.entries(byCategory).map(([category, count]) => ({
    name: categoryLabels[category as ComplaintCategory],
    value: count ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={PALETTE[index % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
