"use client";

import Link from "next/link";
import { useProject, useStates } from "@/shared/api/lookups";
import { Avatar } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { PriorityIcon, StateIcon } from "@/shared/ui/issue-icons";
import { EmptyState } from "@/shared/ui/page";
import { formatDate } from "@/shared/lib/utils";
import { issues as allIssues, moduleIssueIds } from "../mocks";

export interface IssueListFilter {
  cycle?: string;
  module?: string;
}

interface IssueListProps {
  workspaceSlug: string;
  projectId: string;
  filter?: IssueListFilter;
}

/**
 * D1.5 Список задач (таблица) + D1.16 публичный компонент для Dev 2.
 * Dev 2 использует его в цикле и модуле: <IssueList workspaceSlug projectId filter={{ cycle }} />
 * Позже: GET .../issues?cycle=…&module=…&cursor=…&limit=… и кнопка «Load more» по next_cursor.
 */
export function IssueList({ workspaceSlug, projectId, filter = {} }: IssueListProps) {
  const { data: project } = useProject(workspaceSlug, projectId);
  const { data: states } = useStates(workspaceSlug, projectId);

  const issues = allIssues.filter(
    (i) =>
      i.project_id === projectId &&
      (!filter.cycle || i.cycle_id === filter.cycle) &&
      (!filter.module || (moduleIssueIds[filter.module] ?? []).includes(i.id)),
  );

  if (issues.length === 0) {
    return <EmptyState title="No tasks yet" description="Tasks will appear here." />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-2.5">Key</th>
            <th className="px-4 py-2.5">Title</th>
            <th className="px-4 py-2.5">Status</th>
            <th className="px-4 py-2.5">Priority</th>
            <th className="px-4 py-2.5">Assignees</th>
            <th className="px-4 py-2.5">Due date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {issues.map((issue) => {
            const state = states.find((s) => s.id === issue.state_id);
            const href = `/w/${workspaceSlug}/p/${projectId}/issues/${issue.id}`;
            return (
              <tr key={issue.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-2.5 text-xs font-medium text-gray-500">
                  {project?.identifier}-{issue.sequence_id}
                </td>
                <td className="px-4 py-2.5">
                  <Link href={href} className="font-medium text-gray-900 hover:text-indigo-600">
                    {issue.parent_id && <span className="mr-1 text-gray-400">↳</span>}
                    {issue.title}
                  </Link>
                </td>
                <td className="px-4 py-2.5">
                  {state && (
                    <span className="flex items-center gap-1.5 whitespace-nowrap text-gray-700">
                      <StateIcon group={state.group} color={state.color} />
                      {state.name}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <PriorityIcon priority={issue.priority} />
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex -space-x-1">
                    {issue.assignees.map(({ user }) => (
                      <Avatar key={user.id} name={user.display_name} src={user.avatar_url} className="ring-2 ring-white" />
                    ))}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-gray-500">
                  {issue.due_date ? formatDate(issue.due_date) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="border-t border-gray-100 p-3 text-center">
        {/* Позже: показываем, только если в ответе есть next_cursor */}
        <Button variant="secondary" size="sm">
          Load more
        </Button>
      </div>
    </div>
  );
}
