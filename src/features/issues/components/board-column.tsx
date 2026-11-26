import { Plus } from "lucide-react";
import type { Issue, State } from "@/shared/api/types";
import { IssueCard } from "./issue-card";
import { StateIcon } from "@/shared/ui/issue-icons";

interface BoardColumnProps {
  state: State;
  issues: Issue[];
  identifier: string;
  onIssueClick: (issue: Issue) => void;
  onAddClick: () => void;
}

const emptyText: Record<State["group"], string> = {
  backlog: "No items in backlog",
  unstarted: "Nothing to do yet",
  started: "Nothing in progress",
  completed: "Completed work appears here",
  cancelled: "No cancelled tasks",
};

export function BoardColumn({ state, issues, identifier, onIssueClick, onAddClick }: BoardColumnProps) {
  const isDone = state.group === "completed" || state.group === "cancelled";

  return (
    <section className="flex w-72 shrink-0 flex-col rounded-xl bg-gray-100/70">
      <header className="flex items-center gap-2 px-3 py-3">
        <StateIcon group={state.group} color={state.color} />
        <h3 className="text-sm font-semibold text-gray-800">{state.name}</h3>
        <span className="rounded-full bg-gray-200 px-1.5 text-xs text-gray-600">{issues.length}</span>
        <button
          onClick={onAddClick}
          className="ml-auto rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
          aria-label={`Add task to ${state.name}`}
        >
          <Plus className="size-4" />
        </button>
      </header>

      <div className="flex min-h-32 flex-1 flex-col gap-2 px-2 pb-2">
        {issues.length === 0 ? (
          <p className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-gray-200 text-xs text-gray-400">
            {emptyText[state.group]}
          </p>
        ) : (
          issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              identifier={identifier}
              isDone={isDone}
              onClick={() => onIssueClick(issue)}
            />
          ))
        )}
      </div>
    </section>
  );
}
