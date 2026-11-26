import { Search } from "lucide-react";
import type { Label, State, User } from "@/shared/api/types";
import { priorityLabels, priorityOrder } from "@/shared/ui/issue-icons";

interface IssueFiltersProps {
  members: User[];
  labels: Label[];
  states: State[];
}

const selectClass =
  "h-9 rounded-md border border-gray-200 bg-white px-2.5 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none";

/**
 * D1.6 Поиск и фильтры.
 * Позже: значения хранятся в URL (?state=…&priority=…&search=…), чтобы пережить reload,
 * и уходят в GET /issues как state[], priority[], assignee[], label[], search.
 */
export function IssueFilters({ members, labels, states }: IssueFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Search tasks…"
          className="h-9 w-56 rounded-md border border-gray-200 bg-white pl-8 pr-3 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <select className={selectClass} defaultValue="">
        <option value="">All statuses</option>
        {states.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <select className={selectClass} defaultValue="">
        <option value="">All priorities</option>
        {priorityOrder.map((p) => (
          <option key={p} value={p}>
            {priorityLabels[p]}
          </option>
        ))}
      </select>

      <select className={selectClass} defaultValue="">
        <option value="">All assignees</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.display_name}
          </option>
        ))}
      </select>

      <select className={selectClass} defaultValue="">
        <option value="">All labels</option>
        {labels.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </select>

      <button className="h-9 px-2 text-sm text-gray-500 hover:text-gray-800">Clear all</button>
    </div>
  );
}
