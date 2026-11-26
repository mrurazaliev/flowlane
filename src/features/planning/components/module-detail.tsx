"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { AddIssuesModal, IssueList } from "@/features/issues";
import { useMemberUsers, useProject } from "@/shared/api/lookups";
import { Avatar } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { formatDateRange } from "@/shared/lib/utils";
import { modules } from "../mocks";
import { ModuleStatusBadge } from "./module-status";

export function ModuleDetail() {
  const { workspaceSlug, projectId, moduleId } = useParams<{
    workspaceSlug: string;
    projectId: string;
    moduleId: string;
  }>();
  const [addOpen, setAddOpen] = useState(false);

  // Позже: useModule(moduleId) и useIssues(projectId, { module: moduleId })
  const mod = modules.find((m) => m.id === moduleId);
  const { data: project } = useProject(workspaceSlug, projectId);
  const { data: members } = useMemberUsers(workspaceSlug);
  if (!mod || !project) return <p className="p-6 text-sm text-gray-500">Module not found</p>;

  const lead = members.find((m) => m.id === mod.lead_id);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <Link
        href={`/w/${workspaceSlug}/p/${projectId}/modules`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="size-4" /> All modules
      </Link>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-900">{mod.name}</h1>
          <ModuleStatusBadge status={mod.status} />
          <Button className="ml-auto" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" /> Add existing tasks
          </Button>
        </div>
        {mod.description && <p className="mt-1 text-sm text-gray-500">{mod.description}</p>}

        <div className="mt-4 flex gap-6 text-sm text-gray-600">
          <span className="flex items-center gap-2">
            Lead: {lead ? <><Avatar name={lead.display_name} /> {lead.display_name}</> : "—"}
          </span>
          <span>Dates: {formatDateRange(mod.start_date, mod.target_date)}</span>
        </div>

        {mod.progress && (
          <div className="mt-5">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-2xl font-semibold text-gray-900">{mod.progress.completion_percentage}%</span>
            </div>
            <ProgressBar progress={mod.progress} showLegend />
          </div>
        )}
      </section>

      {/* По ТЗ: список задач модуля — общий компонент Dev 1 */}
      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Tasks</h2>
        <IssueList workspaceSlug={workspaceSlug} projectId={projectId} filter={{ module: mod.id }} />
      </section>

      <AddIssuesModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={`Add tasks to ${mod.name}`}
        workspaceSlug={workspaceSlug}
        projectId={projectId}
        exclude={{ module: mod.id }}
      />
    </div>
  );
}
