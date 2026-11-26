import type { ModuleStatus } from "@/shared/api/types";
import { Badge } from "@/shared/ui/badge";

export const moduleStatusLabels: Record<ModuleStatus, string> = {
  backlog: "Backlog",
  in_progress: "In progress",
  paused: "Paused",
  completed: "Completed",
  cancelled: "Cancelled",
};

const tones = {
  backlog: "gray",
  in_progress: "amber",
  paused: "blue",
  completed: "green",
  cancelled: "red",
} as const;

export function ModuleStatusBadge({ status }: { status: ModuleStatus }) {
  return <Badge tone={tones[status]}>{moduleStatusLabels[status]}</Badge>;
}
