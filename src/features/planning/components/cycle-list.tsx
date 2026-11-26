"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import type { CycleStatus } from "@/shared/api/types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { EmptyState, PageHeader } from "@/shared/ui/page";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { Tabs } from "@/shared/ui/tabs";
import { formatDateRange } from "@/shared/lib/utils";
import { cycles } from "../mocks";
import { CreateCycleModal } from "./create-cycle-modal";

const statusTone = { active: "green", upcoming: "blue", completed: "gray" } as const;

export function CycleList() {
  const { workspaceSlug, projectId } = useParams<{ workspaceSlug: string; projectId: string }>();
  const [tab, setTab] = useState<CycleStatus>("active");
  const [createOpen, setCreateOpen] = useState(false);

  // Позже: useCycles(workspaceSlug, projectId). Прогресс есть только в GET /cycles/:id
  const projectCycles = cycles.filter((c) => c.project_id === projectId);
  const visible = projectCycles.filter((c) => c.status === tab);
  const count = (s: CycleStatus) => projectCycles.filter((c) => c.status === s).length;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <PageHeader
        title="Cycles"
        description="Time-boxed sprints. Status is calculated from the dates."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> New cycle
          </Button>
        }
      />

      <Tabs
        className="mb-5"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "active", label: "Active", count: count("active") },
          { value: "upcoming", label: "Upcoming", count: count("upcoming") },
          { value: "completed", label: "Completed", count: count("completed") },
        ]}
      />

      {visible.length === 0 ? (
        <EmptyState title={`No ${tab} cycles`} description="Create a cycle to plan the next sprint." />
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

      <CreateCycleModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
