"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Calendar, Plus } from "lucide-react";
import { Avatar } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { EmptyState, PageHeader } from "@/shared/ui/page";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { formatDateRange } from "@/shared/lib/utils";
import { useMemberUsers } from "@/shared/api/lookups";
import { modules } from "../mocks";
import { CreateModuleModal } from "./create-module-modal";
import { ModuleStatusBadge } from "./module-status";

export function ModuleList() {
  const { workspaceSlug, projectId } = useParams<{ workspaceSlug: string; projectId: string }>();
  const [createOpen, setCreateOpen] = useState(false);
  const { data: members } = useMemberUsers(workspaceSlug);

  // Позже: useModules(workspaceSlug, projectId)
  const projectModules = modules.filter((m) => m.project_id === projectId);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-7">
      <PageHeader
        title="Modules"
        description="Group tasks by feature. One task can be in several modules."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> New module
          </Button>
        }
      />

      {projectModules.length === 0 ? (
        <EmptyState title="No modules yet" description="Create a module to group related tasks." />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projectModules.map((mod) => {
            const lead = members.find((m) => m.id === mod.lead_id);
            return (
              <li key={mod.id}>
                <Link
                  href={`/w/${workspaceSlug}/p/${projectId}/modules/${mod.id}`}
                  className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold text-gray-900">{mod.name}</h2>
                    <ModuleStatusBadge status={mod.status} />
                  </div>
                  <p className="mt-1 line-clamp-2 flex-1 text-sm text-gray-500">{mod.description ?? "No description"}</p>

                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      {lead ? (
                        <>
                          <Avatar name={lead.display_name} /> {lead.display_name}
                        </>
                      ) : (
                        "No lead"
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      {formatDateRange(mod.start_date, mod.target_date)}
                    </span>
                  </div>

                  {mod.progress && (
                    <div className="mt-4">
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-medium text-gray-900">
                          {mod.progress.completed} / {mod.progress.total} tasks
                        </span>
                      </div>
                      <ProgressBar progress={mod.progress} />
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <CreateModuleModal open={createOpen} onClose={() => setCreateOpen(false)} members={members} />
    </div>
  );
}
