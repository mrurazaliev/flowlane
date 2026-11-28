"use client";

import { useState, type DragEvent } from "react";
import { Plus } from "lucide-react";
import type { Issue, State } from "@/shared/api/types";
import { StateIcon } from "@/shared/ui/issue-icons";
import { cn } from "@/shared/lib/utils";
import { IssueCard } from "./issue-card";
import { useT } from "@/shared/lib/i18n";

interface BoardColumnProps {
  state: State;
  issues: Issue[];
  identifier: string;
  meta: (issue: Issue) => { subTasks?: { done: number; total: number }; commentCount?: number };
  onIssueClick: (issue: Issue) => void;
  onAddClick?: () => void;
  states: State[];
  canMove: boolean;
  draggedIssue: Issue | null;
  onDragStart: (event: DragEvent<HTMLButtonElement>, issue: Issue) => void;
  onDragEnd: () => void;
  onMove: (issue: Issue, stateId: string) => void;
  first?: boolean;
}

const emptyText: Record<State["group"], string> = {
  backlog: "Nothing in the backlog",
  unstarted: "Nothing planned yet",
  started: "Nothing in motion",
  completed: "Finished tasks land here",
  cancelled: "No cancelled tasks",
};

export function BoardColumn({
  state, issues, identifier, meta, onIssueClick, onAddClick, first,
  states, canMove, draggedIssue, onDragStart, onDragEnd, onMove,
}: BoardColumnProps) {
  const t = useT();
  const isDone = state.group === "completed" || state.group === "cancelled";
  const moving = state.group === "started";
  const [isOver, setIsOver] = useState(false);
  const canDrop = canMove && draggedIssue !== null && draggedIssue.state_id !== state.id;

  return (
    <section
      onDragOver={(event) => {
        if (!canDrop) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setIsOver(true);
      }}
      onDragLeave={(event) => {
        if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
        setIsOver(false);
      }}
      onDrop={(event) => {
        if (!canDrop || !draggedIssue) return;
        event.preventDefault();
        setIsOver(false);
        onDragEnd();
        onMove(draggedIssue, state.id);
      }}
      className={cn(
        "relative mx-1.5 my-1 flex w-[290px] shrink-0 snap-start flex-col rounded-[16px] border border-line bg-paper-2 px-3 pt-3.5 transition-colors",
        first && "ml-0",
        canDrop && isOver && "border-dashed border-marking bg-marking-soft",
      )}
    >
      {moving && <span className="absolute inset-x-5 top-0 h-[3px] rounded-b bg-marking" />}

      <header className="mb-3.5 flex items-center gap-2 px-0.5">
        <StateIcon group={state.group} color={state.color} />
        <h3 className="text-[15px] font-semibold">{state.name}</h3>
        <span className="rounded-full border border-line bg-white px-2 text-xs font-medium tabular-nums text-muted">{issues.length}</span>
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="ml-auto rounded-md p-0.5 text-faint hover:bg-white hover:text-ink"
            aria-label={t("Add task to {name}", { name: state.name })}
          >
            <Plus className="size-4" />
          </button>
        )}
      </header>

      <div className="flex min-h-24 flex-1 flex-col gap-2.5 overflow-y-auto pb-6">
        {issues.length === 0 ? (
          <p className="rounded-[12px] border-[1.5px] border-dashed border-gray-300 bg-[repeating-linear-gradient(135deg,transparent_0_10px,color-mix(in_oklab,var(--color-line)_50%,transparent)_10px_11px)] px-3 py-7 text-center text-[13px] text-faint">
            {t(emptyText[state.group])}
          </p>
        ) : (
          issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              identifier={identifier}
              isDone={isDone}
              {...meta(issue)}
              onClick={() => onIssueClick(issue)}
              draggable={canMove}
              dragging={draggedIssue?.id === issue.id}
              onDragStart={(event) => onDragStart(event, issue)}
              onDragEnd={onDragEnd}
              onKeyDown={(event) => {
                if (!canMove || !event.altKey || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
                const index = states.findIndex((item) => item.id === state.id);
                const nextState = states[index + (event.key === "ArrowLeft" ? -1 : 1)];
                if (!nextState) return;
                event.preventDefault();
                onMove(issue, nextState.id);
              }}
            />
          ))
        )}
      </div>
    </section>
  );
}
