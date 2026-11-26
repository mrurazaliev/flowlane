import { CircleAlert } from "lucide-react";
import type { Priority, StateGroup } from "@/shared/api/types";
import { cn } from "@/shared/lib/utils";

export const priorityLabels: Record<Priority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
  none: "None",
};

export const priorityOrder: Priority[] = ["urgent", "high", "medium", "low", "none"];

/** Иконка приоритета: ! для urgent, столбики для high/medium/low, тире для none */
export function PriorityIcon({ priority, className }: { priority: Priority; className?: string }) {
  if (priority === "urgent") {
    return <CircleAlert className={cn("size-4 text-red-600", className)} aria-label="Urgent" />;
  }
  if (priority === "none") {
    return <span className={cn("block h-0.5 w-3 rounded bg-gray-300", className)} aria-label="No priority" />;
  }

  const filled = { high: 3, medium: 2, low: 1 }[priority];
  const color = { high: "bg-orange-500", medium: "bg-amber-400", low: "bg-blue-400" }[priority];

  return (
    <span className={cn("flex h-3.5 items-end gap-0.5", className)} aria-label={priorityLabels[priority]}>
      {[1, 2, 3].map((bar) => (
        <span
          key={bar}
          className={cn("w-[3px] rounded-sm", bar <= filled ? color : "bg-gray-200")}
          style={{ height: `${bar * 33}%` }}
        />
      ))}
    </span>
  );
}

/** Иконка статуса по группе, цвет берётся из state.color */
export function StateIcon({ group, color, className }: { group: StateGroup; color: string; className?: string }) {
  const common = { width: 16, height: 16, viewBox: "0 0 16 16", className: cn("shrink-0", className) };

  switch (group) {
    case "backlog":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="6" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="2.5 2" />
        </svg>
      );
    case "unstarted":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="6" fill="none" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case "started":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="6" fill="none" stroke={color} strokeWidth="1.5" />
          <path d="M8 4 A4 4 0 0 1 8 12 Z" fill={color} />
        </svg>
      );
    case "completed":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="7" fill={color} />
          <path d="M5 8.2 7 10.2 11 6" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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
