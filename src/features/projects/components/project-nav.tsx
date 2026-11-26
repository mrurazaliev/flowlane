"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { projectColor, useProjects } from "@/shared/api/lookups";
import { cn } from "@/shared/lib/utils";
import { CreateProjectModal } from "./create-project-modal";

/** Список проектов в сайдбаре + «+» для создания (слот в shared/layout) */
export function ProjectNav({ workspaceSlug }: { workspaceSlug: string }) {
  const { projectId } = useParams<{ projectId?: string }>();
  const [createOpen, setCreateOpen] = useState(false);
  const { data: projects } = useProjects(workspaceSlug);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-5">
        <Link
          href={`/w/${workspaceSlug}/projects`}
          className="text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-800"
        >
          Projects
        </Link>
        <button
          onClick={() => setCreateOpen(true)}
          className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label="New project"
        >
          <Plus className="size-4" />
        </button>
      </div>

      <nav className="mt-2 flex-1 space-y-0.5 overflow-y-auto px-3">
        {projects.length === 0 ? (
          <div className="px-2 py-2 text-sm">
            <p className="text-gray-400">No projects yet</p>
            <button onClick={() => setCreateOpen(true)} className="mt-1 text-indigo-600 hover:underline">
              + Create project
            </button>
          </div>
        ) : (
          projects.map((project, index) => (
            <Link
              key={project.id}
              href={`/w/${workspaceSlug}/p/${project.id}/board`}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2 py-2 text-sm",
                project.id === projectId ? "bg-indigo-50 font-medium text-indigo-700" : "text-gray-700 hover:bg-gray-100",
              )}
            >
              <span className="size-2 rounded-full" style={{ backgroundColor: projectColor(index) }} />
              <span className="flex-1 truncate">{project.name}</span>
              <span className="text-xs text-gray-400">{project.identifier}</span>
            </Link>
          ))
        )}
      </nav>

      <CreateProjectModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
