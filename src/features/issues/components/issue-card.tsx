import { CalendarDays, CornerDownRight, MessageSquare } from "lucide-react";
import type { DragEventHandler, KeyboardEventHandler } from "react";
import type { Issue } from "@/shared/api/types";
import { Avatar } from "@/shared/ui/avatar";
import { LabelChip } from "@/shared/ui/badge";
import { PriorityIcon } from "@/shared/ui/issue-icons";
import { cn, formatDate } from "@/shared/lib/utils";

interface IssueCardProps {
  issue: Issue;
  identifier: string; // "WEB"
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
        "w-full rounded-[11px] border border-line bg-white px-[13px] pb-[11px] pt-3 text-left shadow-[0_1px_0_rgba(30,34,42,.04)] transition-[border-color,box-shadow] hover:border-gray-300 hover:shadow-[0_4px_14px_-6px_rgba(30,34,42,.18)]",
        draggable && "cursor-grab",
        dragging && "cursor-grabbing opacity-50",
      )}
    >
      <div className="flex items-center text-xs text-muted">
        {identifier}-{issue.sequence_id}
        <PriorityIcon priority={issue.priority} className="ml-auto" />
      </div>

      <p className={cn("mb-2.5 mt-1.5 text-[14.5px] font-medium leading-snug", isDone ? "text-muted" : "text-ink")}>
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
        {/* Позже: если срок прошёл и задача не закрыта — красный текст */}
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
