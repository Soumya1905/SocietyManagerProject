import { Search } from "lucide-react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { categoryLabels, priorityLabels, statusLabels } from "../../utils/format";
import type { ComplaintFilters as Filters } from "../../services/complaintService";

interface ComplaintFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  showStatus?: boolean;
  showOverdue?: boolean;
}

export function ComplaintFilters({
  filters,
  onChange,
  showStatus = true,
  showOverdue = false,
}: ComplaintFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[200px] flex-1">
        <Input
          label="Search"
          placeholder="Search description..."
          value={filters.search ?? ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>
      <div className="w-full sm:w-auto">
        <Select
          label="Category"
          value={filters.category ?? ""}
          onChange={(e) => onChange({ ...filters, category: (e.target.value || undefined) as never })}
        >
          <option value="">All categories</option>
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>
      {showStatus && (
        <div className="w-full sm:w-auto">
          <Select
            label="Status"
            value={filters.status ?? ""}
            onChange={(e) => onChange({ ...filters, status: (e.target.value || undefined) as never })}
          >
            <option value="">All statuses</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      )}
      <div className="w-full sm:w-auto">
        <Select
          label="Priority"
          value={filters.priority ?? ""}
          onChange={(e) => onChange({ ...filters, priority: (e.target.value || undefined) as never })}
        >
          <option value="">All priorities</option>
          {Object.entries(priorityLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>
      {showOverdue && (
        <div className="w-full sm:w-auto">
          <Select
            label="Overdue"
            value={filters.overdue === undefined ? "" : String(filters.overdue)}
            onChange={(e) =>
              onChange({
                ...filters,
                overdue: e.target.value === "" ? undefined : e.target.value === "true",
              })
            }
          >
            <option value="">All complaints</option>
            <option value="true">Overdue only</option>
            <option value="false">Not overdue</option>
          </Select>
        </div>
      )}
      <div className="flex items-center gap-1 self-center text-slate-400">
        <Search className="h-4 w-4" />
      </div>
    </div>
  );
}
