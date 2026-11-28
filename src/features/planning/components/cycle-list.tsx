"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useProjectAccess } from "@/features/projects/use-project-access";
import type { CycleStatus } from "@/shared/api/types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { EmptyState, PageHeader, PageSkeleton } from "@/shared/ui/page";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { Tabs } from "@/shared/ui/tabs";
import { formatDateRange } from "@/shared/lib/utils";
import { useCycles } from "../api";
import { planningErrorText } from "../planning-form";
import { useT } from "@/shared/lib/i18n";
import { CycleModal } from "./cycle-modal";

const statusTone = { active: "marking", upcoming: "blue", completed: "green" } as const;


const emptyTitles: Record<CycleStatus, string> = {
  active: "No active cycles",
  upcoming: "No upcoming cycles",
  completed: "No completed cycles",
};
export function CycleList() {
  const t = useT();
  const { workspaceSlug, projectId } = useParams<{ workspaceSlug: string; projectId: string }>();
  const [tab, setTab] = useState<CycleStatus>("active");
  const [createOpen, setCreateOpen] = useState(false);
  const { canWrite } = useProjectAccess(workspaceSlug);
  const { data: projectCycles = [], isPending, isError, error, refetch } = useCycles({ workspaceSlug, projectId });

  if (isPending) return <PageSkeleton />;
  const visible = projectCycles.filter((c) => c.status === tab);
  const count = (s: CycleStatus) => projectCycles.filter((c) => c.status === s).length;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-7">
      <PageHeader
        title={t("Cycles")}
        description={t("Time-boxed sprints. Status is calculated from the dates.")}
        actions={canWrite && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> {t("New cycle")}
          </Button>
        )}
      />

      <Tabs
        className="mb-5"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "active", label: t("Active"), count: count("active") },
          { value: "upcoming", label: t("Upcoming"), count: count("upcoming") },
          { value: "completed", label: t("Completed"), count: count("completed") },
        ]}
      />

      {isError ? (
        <EmptyState title={planningErrorText(error, t("Could not load cycles."))}
          action={<Button variant="secondary" onClick={() => void refetch()}>{t("Try again")}</Button>} />
      ) : visible.length === 0 ? (
        <EmptyState title={t(emptyTitles[tab])} description={t("Create a cycle to plan the next sprint.")} />
      ) : (
        <ul className="space-y-3">
          {visible.map((cycle) => (
            <li key={cycle.id}>
              <Link
                href={`/w/${workspaceSlug}/p/${projectId}/cycles/${cycle.id}`}
                className="block rounded-xl border border-gray-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-semibold text-gray-900">{cycle.name}</h2>
                  <Badge tone={statusTone[cycle.status]}>{cycle.status}</Badge>
                  <span className="ml-auto text-sm text-gray-500">{formatDateRange(cycle.start_date, cycle.end_date)}</span>
                </div>
                {cycle.description && <p className="mt-1 text-sm text-gray-500">{cycle.description}</p>}
                {cycle.progress && (
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex-1">
                      <ProgressBar progress={cycle.progress} />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{cycle.progress.completion_percentage}%</span>
                    <span className="text-xs text-gray-500">{cycle.progress.total} tasks</span>
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {canWrite && createOpen && (
        <CycleModal workspaceSlug={workspaceSlug} projectId={projectId}
          onClose={() => setCreateOpen(false)} onSaved={(cycle) => setTab(cycle.status)} />
      )}
    </div>
  );
}
