import { Calendar } from "lucide-react";
import type { Issue } from "@/shared/api/types";
import { Avatar } from "@/shared/ui/avatar";
import { cn, formatDate } from "@/shared/lib/utils";
import { PriorityIcon } from "@/shared/ui/issue-icons";

interface IssueCardProps {
  issue: Issue;
  identifier: string; // "WEB"
  isDone?: boolean;
  onClick?: () => void;
}

export function IssueCard({ issue, identifier, isDone, onClick }: IssueCardProps) {
  const label = issue.labels[0]?.label;
  const assignee = issue.assignees[0]?.user;

  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg border border-gray-200 bg-white p-3 text-left shadow-sm transition hover:border-gray-300 hover:shadow"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-gray-500">
          {identifier}-{issue.sequence_id}
        </span>
        {label && (
          <span className="flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600">
            <span className="size-1.5 rounded-full" style={{ backgroundColor: label.color }} />
            {label.name}
          </span>
        )}
      </div>

      <p className={cn("mt-1.5 text-sm font-medium text-gray-900", isDone && "text-gray-400 line-through")}>
        {issue.title}
      </p>

      <div className="mt-3 flex items-center gap-3">
        <PriorityIcon priority={issue.priority} />
        {issue.due_date && (
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="size-3.5" />
            {formatDate(issue.due_date)}
          </span>
        )}
        {assignee && <Avatar name={assignee.display_name} src={assignee.avatar_url} className="ml-auto" />}
      </div>
    </button>
  );
}
