"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useLabels, useMemberUsers, useStates } from "@/shared/api/lookups";
import { Button, Kbd } from "@/shared/ui/button";
import { Dropdown } from "@/shared/ui/dropdown";
import { CreateIssueModal } from "./create-issue-modal";
import { IssueFilters, emptyFilters, toIssueQuery, type FilterSelection } from "./issue-filters";
import { useT } from "@/shared/lib/i18n";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";
import { useUrlSearch } from "../use-url-search";
import { IssueList } from "./issue-list";

export function IssuesPage() {
  const t = useT();
  const { workspaceSlug, projectId } = useParams<{ workspaceSlug: string; projectId: string }>();
  const [createOpen, setCreateOpen] = useState(false);
  const [groupBy, setGroupBy] = useState<"state" | "none">("state");
  const [search, setSearch] = useUrlSearch();
  const debouncedSearch = useDebouncedValue(search.trim());
  const [selected, setSelected] = useState<FilterSelection>(emptyFilters);

  const { data: states } = useStates(workspaceSlug, projectId);
  const { data: members } = useMemberUsers(workspaceSlug);
  const { data: labels } = useLabels(workspaceSlug, projectId);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <IssueFilters
        members={members}
        labels={labels}
        states={states}
        search={search}
        onSearchChange={setSearch}
        selected={selected}
        onSelectedChange={setSelected}
        actions={
          <>
            <Dropdown
              variant="ghost"
              prefix={t("Group")}
              value={groupBy}
              onChange={setGroupBy}
              align="right"
              options={[
                { value: "state", label: t("Status") },
                { value: "none", label: t("None") },
              ]}
            />
            <Dropdown
              variant="ghost"
              prefix={t("Sort")}
              value="sort_order"
              align="right"
              options={[
                { value: "sort_order", label: t("Manual") },
                { value: "created_at", label: t("Created") },
                { value: "updated_at", label: t("Updated") },
                { value: "priority", label: t("Priority") },
                { value: "due_date", label: t("Due date") },
              ]}
            />
            <Button className="ml-1" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" strokeWidth={2.2} /> {t("New task")} <Kbd>C</Kbd>
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 py-5 md:px-7">
        <IssueList
          workspaceSlug={workspaceSlug}
          projectId={projectId}
          groupBy={groupBy}
          filter={toIssueQuery(selected, debouncedSearch)}
        />
      </div>

      <CreateIssueModal open={createOpen} onClose={() => setCreateOpen(false)} states={states} members={members} labels={labels} />
    </div>
  );
}
