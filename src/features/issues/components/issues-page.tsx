"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useLabels, useMemberUsers, useStates } from "@/shared/api/lookups";
import { Button } from "@/shared/ui/button";
import { CreateIssueModal } from "./create-issue-modal";
import { IssueFilters } from "./issue-filters";
import { IssueList } from "./issue-list";

const selectClass =
  "h-9 rounded-md border border-gray-200 bg-white px-2.5 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none";

/** Страница /w/:slug/p/:projectId/issues — таблица задач с фильтрами, сортировкой и группировкой */
export function IssuesPage() {
  const { workspaceSlug, projectId } = useParams<{ workspaceSlug: string; projectId: string }>();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: states } = useStates(workspaceSlug, projectId);
  const { data: members } = useMemberUsers(workspaceSlug);
  const { data: labels } = useLabels(workspaceSlug, projectId);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-6 py-3">
        <IssueFilters members={members} labels={labels} states={states} />

        <div className="flex items-center gap-2">
          {/* D1.7 Сортировка и группировка. Позже: sort_by, order, group_by в URL и в запросе */}
          <select className={selectClass} defaultValue="created_at" aria-label="Sort by">
            <option value="created_at">Sort: Created</option>
            <option value="updated_at">Sort: Updated</option>
            <option value="priority">Sort: Priority</option>
            <option value="due_date">Sort: Due date</option>
            <option value="sort_order">Sort: Manual</option>
          </select>
          <select className={selectClass} defaultValue="" aria-label="Group by">
            <option value="">No grouping</option>
            <option value="state">Group: Status</option>
            <option value="priority">Group: Priority</option>
            <option value="assignee">Group: Assignee</option>
          </select>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> New task
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <IssueList workspaceSlug={workspaceSlug} projectId={projectId} />
      </div>

      <CreateIssueModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        states={states}
        members={members}
        labels={labels}
      />
    </div>
  );
}
