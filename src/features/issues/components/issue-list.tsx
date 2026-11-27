"use client";

import Link from "next/link";
import { CornerDownRight } from "lucide-react";
import type { Issue } from "@/shared/api/types";
import { useProject, useStates } from "@/shared/api/lookups";
import { Avatar } from "@/shared/ui/avatar";
import { LabelChip } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { PriorityIcon, StateIcon } from "@/shared/ui/issue-icons";
import { EmptyState } from "@/shared/ui/page";
import { cn, formatDate } from "@/shared/lib/utils";
import { useGetIssuesQuery } from "../api";

export interface IssueListFilter {
  cycle?: string;
  module?: string;
}

interface IssueListProps {
  workspaceSlug: string;
  projectId: string;
  filter?: IssueListFilter;
  /** Группировка по статусу (по умолчанию) или одной таблицей */
  groupBy?: "state" | "none";
}

/**
 * D1.5 Список задач + D1.16 публичный компонент для Dev 2.
 * Dev 2 использует его в цикле и модуле: <IssueList workspaceSlug projectId filter={{ cycle }} />
 * Позже: GET .../issues?cycle=…&module=…&group_by=state&cursor=…; «Load more» — по next_cursor.
 */
export function IssueList({ workspaceSlug, projectId, filter = {}, groupBy = "state" }: IssueListProps) {
  const { data: project } = useProject(workspaceSlug, projectId);
  const { data: states } = useStates(workspaceSlug, projectId);

const showAll = !!(filter.cycle || filter.module);
const { data: issues = [], isLoading, isError } = useGetIssuesQuery(workspaceSlug, projectId, filter, { allPages: showAll });

if (isLoading) return <p className="p-4 text-muted">Loading tasks...</p>;
if (isError) return <p className="p-4 text-red-600">Could not load tasks</p>;

if (issues.length === 0) {
  return <EmptyState title="No tasks here yet" description="Tasks you add will show up in this list." />;
}


  const identifier = project?.identifier ?? "";
  const href = (issue: Issue) => `/w/${workspaceSlug}/p/${projectId}/issues/${issue.id}`;

  const groups =
    groupBy === "state"
      ? [...states]
          .sort((a, b) => order(a.group) - order(b.group) || a.order - b.order)
          .map((state) => ({ state, items: issues.filter((i) => i.state_id === state.id) }))
          .filter((g) => g.items.length > 0)
      : [{ state: null, items: issues }];

  return (
    <div className="space-y-5">
      {groups.map(({ state, items }) => (
        <section key={state?.id ?? "all"}>
          {state && (
            <h3
              className={cn(
                "mb-2 flex items-center gap-2 px-1 font-semibold",
                state.group === "started" && "border-l-[3px] border-marking pl-3",
              )}
            >
              <StateIcon group={state.group} color={state.color} />
              {state.name}
              <span className="font-medium tabular-nums text-muted">{items.length}</span>
            </h3>
          )}
          <ul className="divide-y divide-line-soft overflow-hidden rounded-xl border border-line bg-white">
            {items.map((issue) => (
              <li key={issue.id}>
                <Link href={href(issue)} className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-gray-50 md:gap-4">
                  <PriorityIcon priority={issue.priority} className="w-4 shrink-0" />
                  <span className="w-14 shrink-0 text-[12.5px] tabular-nums text-muted">
                    {identifier}-{issue.sequence_id}
                  </span>
                  <span className="flex min-w-0 flex-1 items-center gap-1.5 font-medium">
                    {issue.parent_id && <CornerDownRight className="size-3.5 shrink-0 text-faint" />}
                    <span className="truncate">{issue.title}</span>
                  </span>
                  <span className="hidden gap-1 lg:flex">
                    {issue.labels.map(({ label }) => (
                      <LabelChip key={label.id} name={label.name} color={label.color} />
                    ))}
                  </span>
                  <span className="hidden w-16 text-right tabular-nums text-muted sm:block">
                    {issue.due_date ? formatDate(issue.due_date) : ""}
                  </span>
                  {issue.assignees[0]?.user ? (
                    <Avatar name={issue.assignees[0].user.display_name} src={issue.assignees[0].user.avatar_url} />
                  ) : (
                    <span className="size-6 rounded-full border border-dashed border-gray-300" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {!showAll && (
        <div className="flex justify-center">
          {/* Позже: показываем, только если в ответе есть next_cursor */}
          <Button variant="secondary">Load more</Button>
        </div>
      )}
    </div>
  );
}

/** Порядок групп: сначала то, что в работе */
function order(group: string) {
  return ["started", "unstarted", "backlog", "completed", "cancelled"].indexOf(group);
}
