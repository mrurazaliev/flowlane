import { CalendarDays, CornerDownRight, MessageSquare } from "lucide-react";
import type { DragEventHandler, KeyboardEventHandler } from "react";
import type { Issue } from "@/shared/api/types";
import { Avatar } from "@/shared/ui/avatar";
import { LabelChip } from "@/shared/ui/badge";
import { PriorityIcon } from "@/shared/ui/issue-icons";
import { cn, formatDate } from "@/shared/lib/utils";

interface IssueCardProps {
  issue: Issue;
  identifier: string;
  isDone?: boolean;
  subTasks?: { done: number; total: number };
  commentCount?: number;
  onClick?: () => void;
  draggable?: boolean;
  dragging?: boolean;
  onDragStart?: DragEventHandler<HTMLButtonElement>;
  onDragEnd?: DragEventHandler<HTMLButtonElement>;
  onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
}

export function IssueCard({
  issue, identifier, isDone, subTasks, commentCount, onClick,
  draggable, dragging, onDragStart, onDragEnd, onKeyDown,
}: IssueCardProps) {
  const assignee = issue.assignees[0]?.user;

  return (
    <button
      type="button"
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onKeyDown={onKeyDown}
      aria-keyshortcuts={draggable ? "Alt+ArrowLeft Alt+ArrowRight" : undefined}
      className={cn(
        "w-full rounded-[12px] border border-line bg-white px-[14px] pb-3 pt-3 text-left shadow-[0_1px_0_var(--color-line)] transition-[border-color,box-shadow,transform] hover:border-gray-300 hover:shadow-[0_8px_20px_-10px_rgba(27,34,56,.25)]",
        draggable && "cursor-grab",
        dragging && "cursor-grabbing -rotate-2 border-ink opacity-70",
      )}
    >
      <div className="font-id flex items-center text-[12px] text-muted">
        {identifier}-{issue.sequence_id}
        <PriorityIcon priority={issue.priority} className="ml-auto" />
      </div>

      <p className={cn("mb-2.5 mt-1.5 text-[15px] font-semibold leading-snug", isDone ? "text-muted line-through decoration-faint" : "text-ink")}>
        {issue.title}
      </p>

      {issue.labels.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1">
          {issue.labels.map(({ label }) => (
            <LabelChip key={label.id} name={label.name} color={label.color} />
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 text-xs tabular-nums text-muted">
        {issue.due_date && (
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3.5" />
            {formatDate(issue.due_date)}
          </span>
        )}
        {subTasks && subTasks.total > 0 && (
          <span className="flex items-center gap-1">
            <CornerDownRight className="size-3.5" />
            {subTasks.done}/{subTasks.total}
          </span>
        )}
        {commentCount ? (
          <span className="flex items-center gap-1">
            <MessageSquare className="size-3.5" />
            {commentCount}
          </span>
        ) : null}
        {assignee && <Avatar name={assignee.display_name} src={assignee.avatar_url} className="ml-auto" />}
      </div>
    </button>
  );
}
