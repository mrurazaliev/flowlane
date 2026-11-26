"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useLabels, useMemberUsers, useStates } from "@/shared/api/lookups";
import { Button, Kbd } from "@/shared/ui/button";
import { Dropdown } from "@/shared/ui/dropdown";
import { CreateIssueModal } from "./create-issue-modal";
import { IssueFilters } from "./issue-filters";
import { IssueList } from "./issue-list";

/** Страница /w/:slug/p/:projectId/issues — список задач с фильтрами, группировкой и сортировкой */
export function IssuesPage() {
  const { workspaceSlug, projectId } = useParams<{ workspaceSlug: string; projectId: string }>();
  const [createOpen, setCreateOpen] = useState(false);
  const [groupBy, setGroupBy] = useState<"state" | "none">("state");

  const { data: states } = useStates(workspaceSlug, projectId);
  const { data: members } = useMemberUsers(workspaceSlug);
  const { data: labels } = useLabels(workspaceSlug, projectId);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <IssueFilters
        members={members}
        labels={labels}
        states={states}
        actions={
          <>
            {/* D1.7 Позже: group_by, sort_by, order — в URL и в запрос */}
            <Dropdown
              variant="ghost"
              prefix="Group"
              value={groupBy}
              onChange={setGroupBy}
              align="right"
              options={[
                { value: "state", label: "Status" },
                { value: "none", label: "None" },
              ]}
            />
            <Dropdown
              variant="ghost"
              prefix="Sort"
              value="sort_order"
              align="right"
              options={[
                { value: "sort_order", label: "Manual" },
                { value: "created_at", label: "Created" },
                { value: "updated_at", label: "Updated" },
                { value: "priority", label: "Priority" },
                { value: "due_date", label: "Due date" },
              ]}
            />
            <Button className="ml-1" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" strokeWidth={2.2} /> New task <Kbd>C</Kbd>
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 py-5 md:px-7">
        <IssueList workspaceSlug={workspaceSlug} projectId={projectId} groupBy={groupBy} />
      </div>

      <CreateIssueModal open={createOpen} onClose={() => setCreateOpen(false)} states={states} members={members} labels={labels} />
    </div>
  );
}
