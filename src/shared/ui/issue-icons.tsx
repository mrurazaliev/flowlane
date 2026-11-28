import type { Priority, StateGroup } from "@/shared/api/types";
import { cn } from "@/shared/lib/utils";
import { translate } from "@/shared/lib/i18n";

export const priorityLabels: Record<Priority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
  none: "No priority",
};

export const priorityOrder: Priority[] = ["urgent", "high", "medium", "low", "none"];

/** Приоритет: красный квадрат «!» для urgent, столбики для остальных, тире для none */
export function PriorityIcon({ priority, className }: { priority: Priority; className?: string }) {
  if (priority === "urgent") {
    return (
      <span
        aria-label={translate("Urgent")}
        className={cn("inline-grid size-[15px] place-items-center rounded-[4px] bg-[#d64545] text-[11px] font-bold leading-none text-white", className)}
      >
        !
      </span>
    );
  }
  if (priority === "none") {
    return <span aria-label={translate("No priority")} className={cn("inline-block h-0.5 w-3 rounded bg-gray-300", className)} />;
  }

  const filled = { high: 3, medium: 2, low: 1 }[priority];
  const color = { high: "#e07b39", medium: "#c9a227", low: "#5b8def" }[priority];

  return (
    <span aria-label={translate(priorityLabels[priority])} className={cn("inline-flex h-3 items-end gap-[2px]", className)}>
      {[5, 8, 12].map((height, i) => (
        <span
          key={height}
          className="w-[3px] rounded-[1px]"
          style={{ height, backgroundColor: i < filled ? color : "#d5d9df" }}
        />
      ))}
    </span>
  );
}

/** Иконка статуса по группе, цвет — из state.color */
export function StateIcon({ group, color, className }: { group: StateGroup; color: string; className?: string }) {
  const common = { width: 15, height: 15, viewBox: "0 0 16 16", className: cn("shrink-0", className) };

  switch (group) {
    case "backlog":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="6" fill="none" stroke={color} strokeWidth="1.6" strokeDasharray="2.4 2" />
        </svg>
      );
    case "unstarted":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="6" fill="none" stroke={color} strokeWidth="1.6" />
        </svg>
      );
    case "started":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="6" fill="none" stroke={color} strokeWidth="1.6" />
          <path d="M8 4 A4 4 0 0 1 8 12 Z" fill={color} />
        </svg>
      );
    case "completed":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="7" fill={color} />
          <path d="M5 8.2 7 10.2 11 6" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "cancelled":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="7" fill={color} />
          <path d="M5.8 5.8 10.2 10.2 M10.2 5.8 5.8 10.2" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
  }
}
