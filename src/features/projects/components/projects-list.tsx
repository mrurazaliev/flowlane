"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { projectColor, useProjects } from "@/shared/api/lookups";
import { Button } from "@/shared/ui/button";
import { EmptyState, PageHeader } from "@/shared/ui/page";
import { CreateProjectModal } from "./create-project-modal";

/** D2.7 Список проектов /w/:slug/projects. Позже: GET/POST ws/projects */
export function ProjectsList() {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const [createOpen, setCreateOpen] = useState(false);
  const { data: projects } = useProjects(workspaceSlug);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-7">
      <PageHeader
        title="Projects"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> New project
          </Button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start tracking tasks."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" /> New project
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project, index) => (
            <li key={project.id}>
              <Link
                href={`/w/${workspaceSlug}/p/${project.id}/board`}
                className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex size-9 items-center justify-center rounded-lg text-xs font-bold text-white"
                    style={{ backgroundColor: projectColor(index) }}
                  >
                    {project.identifier.slice(0, 3)}
                  </span>
                  <div>
                    <h2 className="font-semibold text-gray-900">{project.name}</h2>
                    <p className="text-xs text-gray-500">{project.identifier}</p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-gray-500">{project.description ?? "No description"}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <CreateProjectModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
