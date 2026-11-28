import type { Progress } from "@/shared/api/types";
import { translate } from "@/shared/lib/i18n";

const segments = [
  { key: "completed", label: "Completed", color: "#3a9a6b" },
  { key: "started", label: "Started", color: "#f2b630" },
  { key: "unstarted", label: "Unstarted", color: "#c3c9d1" },
  { key: "backlog", label: "Backlog", color: "#dde1e6" },
  { key: "cancelled", label: "Cancelled", color: "#d64545" },
] as const;

export function ProgressBar({ progress, showLegend = false }: { progress: Progress; showLegend?: boolean }) {
  const total = progress.total || 1;

  return (
    <div>
      <div className="flex h-1.5 gap-px overflow-hidden rounded-full bg-line-soft">
        {segments.map((s) =>
          progress[s.key] > 0 ? (
            <div key={s.key} style={{ width: `${(progress[s.key] / total) * 100}%`, backgroundColor: s.color }} />
          ) : null,
        )}
      </div>

      {showLegend && (
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted">
          {segments.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
              {translate(s.label)} <span className="font-medium tabular-nums text-ink">{progress[s.key]}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
