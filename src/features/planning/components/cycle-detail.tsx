"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { AddIssuesModal, IssueList } from "@/features/issues";
import { useProject } from "@/shared/api/lookups";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { formatDateRange } from "@/shared/lib/utils";
import { cycles } from "../mocks";

export function CycleDetail() {
  const { workspaceSlug, projectId, cycleId } = useParams<{
    workspaceSlug: string;
    projectId: string;
    cycleId: string;
  }>();
  const [addOpen, setAddOpen] = useState(false);

  // Позже: useCycle(cycleId) и useIssues(projectId, { cycle: cycleId })
  const cycle = cycles.find((c) => c.id === cycleId);
  const { data: project } = useProject(workspaceSlug, projectId);
  if (!cycle || !project) return <p className="p-6 text-sm text-gray-500">Cycle not found</p>;


  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-7">
      <Link
        href={`/w/${workspaceSlug}/p/${projectId}/cycles`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="size-4" /> All cycles
      </Link>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-900">{cycle.name}</h1>
          <Badge tone={cycle.status === "active" ? "marking" : cycle.status === "upcoming" ? "blue" : "green"}>
            {cycle.status}
          </Badge>
          <span className="text-sm text-gray-500">{formatDateRange(cycle.start_date, cycle.end_date)}</span>
          <Button className="ml-auto" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" /> Add existing tasks
          </Button>
        </div>
        {cycle.description && <p className="mt-1 text-sm text-gray-500">{cycle.description}</p>}

        {cycle.progress && (
          <div className="mt-5">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-2xl font-semibold text-gray-900">{cycle.progress.completion_percentage}%</span>
            </div>
            <ProgressBar progress={cycle.progress} showLegend />
          </div>
        )}
      </section>

      {/* По ТЗ: список задач цикла — общий компонент Dev 1 */}
      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Tasks</h2>
        <IssueList workspaceSlug={workspaceSlug} projectId={projectId} filter={{ cycle: cycle.id }} />
      </section>

      <AddIssuesModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={`Add tasks to ${cycle.name}`}
        hint="Tasks that are already in another cycle will be moved to this one."
        workspaceSlug={workspaceSlug}
        projectId={projectId}
        exclude={{ cycle: cycle.id }}
      />
    </div>
  );
}
