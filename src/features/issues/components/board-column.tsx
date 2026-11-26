import { Plus } from "lucide-react";
import type { Issue, State } from "@/shared/api/types";
import { StateIcon } from "@/shared/ui/issue-icons";
import { cn } from "@/shared/lib/utils";
import { IssueCard } from "./issue-card";

interface BoardColumnProps {
  state: State;
  issues: Issue[];
  identifier: string;
  meta: (issue: Issue) => { subTasks?: { done: number; total: number }; commentCount?: number };
  onIssueClick: (issue: Issue) => void;
  onAddClick: () => void;
  first?: boolean;
}

const emptyText: Record<State["group"], string> = {
  backlog: "Nothing in the backlog",
  unstarted: "Nothing planned yet",
  started: "Nothing in motion",
  completed: "Finished tasks land here",
  cancelled: "No cancelled tasks",
};

/**
 * Колонка доски = полоса движения. Полосы разделены пунктирной разметкой,
 * над полосой «в работе» (group started) — жёлтая линия.
 */
export function BoardColumn({ state, issues, identifier, meta, onIssueClick, onAddClick, first }: BoardColumnProps) {
  const isDone = state.group === "completed" || state.group === "cancelled";
  const moving = state.group === "started";

  return (
    <section
      className={cn(
        "relative flex w-[290px] shrink-0 snap-start flex-col px-3.5 pt-[18px]",
        !first && "bg-[linear-gradient(var(--color-gray-200)_55%,transparent_0)] bg-[length:2px_22px] bg-repeat-y",
      )}
    >
      {moving && <span className="absolute inset-x-3.5 top-0 h-[3px] rounded-b bg-marking" />}

      <header className="mb-3.5 flex items-center gap-2 px-0.5">
        <StateIcon group={state.group} color={state.color} />
        <h3 className="font-semibold">{state.name}</h3>
        <span className="font-medium tabular-nums text-muted">{issues.length}</span>
        <button
          onClick={onAddClick}
          className="ml-auto rounded p-0.5 text-faint hover:bg-white hover:text-ink"
          aria-label={`Add task to ${state.name}`}
        >
          <Plus className="size-4" />
        </button>
      </header>

      <div className="flex min-h-24 flex-1 flex-col gap-2.5 overflow-y-auto pb-6">
        {issues.length === 0 ? (
          <p className="rounded-[11px] border-[1.5px] border-dashed border-gray-300 px-3 py-6 text-center text-[13px] text-faint">
            {emptyText[state.group]}
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
            />
          ))
        )}
      </div>
    </section>
  );
}
