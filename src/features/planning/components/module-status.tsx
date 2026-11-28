import type { ModuleStatus } from "@/shared/api/types";
import { Badge } from "@/shared/ui/badge";
import { translate } from "@/shared/lib/i18n";

export const moduleStatusLabels: Record<ModuleStatus, string> = {
  backlog: "Backlog",
  in_progress: "In progress",
  paused: "Paused",
  completed: "Completed",
  cancelled: "Cancelled",
};

const tones = {
  backlog: "gray",
  in_progress: "marking",
  paused: "blue",
  completed: "green",
  cancelled: "red",
} as const;

export function ModuleStatusBadge({ status }: { status: ModuleStatus }) {
  return <Badge tone={tones[status]}>{translate(moduleStatusLabels[status])}</Badge>;
}
