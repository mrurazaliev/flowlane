"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useProjectAccess } from "@/features/projects/use-project-access";
import { useProjectMembers } from "@/shared/api/lookups";
import { Avatar } from "@/shared/ui/avatar";
import { PageSkeleton } from "@/shared/ui/page";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { formatDateRange } from "@/shared/lib/utils";
import { useModule } from "../api";
import { planningErrorText } from "../planning-form";
import { ModuleModal } from "./module-modal";
import { ModuleStatusBadge } from "./module-status";
import { PlanningActions } from "./planning-actions";
import { PlanningTasks } from "./planning-tasks";

export function ModuleDetail() {
  const { workspaceSlug, projectId, moduleId } = useParams<{
    workspaceSlug: string;
    projectId: string;
    moduleId: string;
  }>();
  const [editOpen, setEditOpen] = useState(false);
  const { canWrite } = useProjectAccess(workspaceSlug);
  const { data: members } = useProjectMembers(workspaceSlug, projectId);
  const { data: mod, isPending, error } = useModule({ workspaceSlug, projectId }, moduleId);
  if (isPending) return <PageSkeleton />;
  if (!mod || mod.project_id !== projectId) {
    return <p className="p-6 text-sm text-gray-500" role="alert">{planningErrorText(error, "Module not found.")}</p>;
  }

  const lead = members.find((member) => member.user_id === mod.lead_id)?.user;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-7">
      <Link
        href={`/w/${workspaceSlug}/p/${projectId}/modules`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="size-4" /> All modules
      </Link>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-900">{mod.name}</h1>
          <ModuleStatusBadge status={mod.status} />
          {canWrite && (
            <PlanningActions workspaceSlug={workspaceSlug} projectId={projectId} kind="modules"
              id={mod.id} name={mod.name} onEdit={() => setEditOpen(true)} />
          )}
        </div>
        {mod.description && <p className="mt-1 text-sm text-gray-500">{mod.description}</p>}

        <div className="mt-4 flex gap-6 text-sm text-gray-600">
          <span className="flex items-center gap-2">
            Lead: {lead ? <><Avatar name={lead.display_name} src={lead.avatar_url} /> {lead.display_name}</> : mod.lead_id ? "Unavailable" : "—"}
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

      <PlanningTasks workspaceSlug={workspaceSlug} projectId={projectId} kind="modules"
        id={mod.id} name={mod.name} canWrite={canWrite} />
      {canWrite && editOpen && (
        <ModuleModal workspaceSlug={workspaceSlug} projectId={projectId}
          mod={mod} onClose={() => setEditOpen(false)} />
      )}
    </div>
  );
}
