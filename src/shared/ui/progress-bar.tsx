import type { Progress } from "@/shared/api/types";

const segments = [
  { key: "completed", label: "Completed", color: "bg-emerald-500" },
  { key: "started", label: "Started", color: "bg-amber-400" },
  { key: "unstarted", label: "Unstarted", color: "bg-gray-300" },
  { key: "backlog", label: "Backlog", color: "bg-gray-200" },
  { key: "cancelled", label: "Cancelled", color: "bg-red-400" },
] as const;

/** Полоска прогресса цикла/модуля, разбитая по группам статусов */
export function ProgressBar({ progress, showLegend = false }: { progress: Progress; showLegend?: boolean }) {
  const total = progress.total || 1;

  return (
    <div>
      <div className="flex h-2 overflow-hidden rounded-full bg-gray-100">
        {segments.map((s) =>
          progress[s.key] > 0 ? (
            <div key={s.key} className={s.color} style={{ width: `${(progress[s.key] / total) * 100}%` }} />
          ) : null,
        )}
      </div>

      {showLegend && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
          {segments.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${s.color}`} />
              {s.label} <span className="font-medium text-gray-900">{progress[s.key]}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
