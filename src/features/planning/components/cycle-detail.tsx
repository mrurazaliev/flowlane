"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useProjectAccess } from "@/features/projects/use-project-access";
import { Badge } from "@/shared/ui/badge";
import { PageSkeleton } from "@/shared/ui/page";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { formatDateRange } from "@/shared/lib/utils";
import { useCycle } from "../api";
import { planningErrorText } from "../planning-form";
import { CycleModal } from "./cycle-modal";
import { PlanningActions } from "./planning-actions";
import { PlanningTasks } from "./planning-tasks";
import { useT } from "@/shared/lib/i18n";

export function CycleDetail() {
  const t = useT();
  const { workspaceSlug, projectId, cycleId } = useParams<{
    workspaceSlug: string;
    projectId: string;
    cycleId: string;
  }>();
  const [editOpen, setEditOpen] = useState(false);
  const { canWrite } = useProjectAccess(workspaceSlug);
  const { data: cycle, isPending, error } = useCycle({ workspaceSlug, projectId }, cycleId);
  if (isPending) return <PageSkeleton />;
  if (!cycle || cycle.project_id !== projectId) {
    return <p className="p-6 text-sm text-gray-500" role="alert">{planningErrorText(error, t("Cycle not found."))}</p>;
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-7">
      <Link
        href={`/w/${workspaceSlug}/p/${projectId}/cycles`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="size-4" /> {t("All cycles")}
      </Link>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-900">{cycle.name}</h1>
          <Badge tone={cycle.status === "active" ? "marking" : cycle.status === "upcoming" ? "blue" : "green"}>
            {cycle.status}
          </Badge>
          <span className="text-sm text-gray-500">{formatDateRange(cycle.start_date, cycle.end_date)}</span>
          {canWrite && (
            <PlanningActions workspaceSlug={workspaceSlug} projectId={projectId} kind="cycles"
              id={cycle.id} name={cycle.name} onEdit={() => setEditOpen(true)} />
          )}
        </div>
        {cycle.description && <p className="mt-1 text-sm text-gray-500">{cycle.description}</p>}

        {cycle.progress && (
          <div className="mt-5">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-sm font-medium text-gray-700">{t("Progress")}</span>
              <span className="text-2xl font-semibold text-gray-900">{cycle.progress.completion_percentage}%</span>
            </div>
            <ProgressBar progress={cycle.progress} showLegend />
          </div>
        )}
      </section>

      <PlanningTasks workspaceSlug={workspaceSlug} projectId={projectId} kind="cycles"
        id={cycle.id} name={cycle.name} canWrite={canWrite} />
      {canWrite && editOpen && (
        <CycleModal workspaceSlug={workspaceSlug} projectId={projectId}
          cycle={cycle} onClose={() => setEditOpen(false)} />
      )}
    </div>
  );
}
