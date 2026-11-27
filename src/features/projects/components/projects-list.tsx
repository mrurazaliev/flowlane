"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { projectColor } from "@/shared/api/lookups";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ErrorBanner } from "@/shared/ui/form";
import { EmptyState, PageHeader } from "@/shared/ui/page";
import { useProjectsQuery } from "../api";
import { projectErrorText, projectSettingsHref } from "../project-form";
import { useProjectAccess } from "../use-project-access";
import { CreateProjectModal } from "./create-project-modal";

/** D2.7 Список проектов /w/:slug/projects. */
export function ProjectsList() {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const [createOpen, setCreateOpen] = useState(false);
  const projectsQuery = useProjectsQuery(workspaceSlug);
  const { membersQuery, canManage } = useProjectAccess(workspaceSlug);
  const projects = projectsQuery.data;
  const closeCreate = useCallback(() => setCreateOpen(false), []);
  const createButton = canManage && (
    <Button onClick={() => setCreateOpen(true)}>
      <Plus className="size-4" /> New project
    </Button>
  );

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-7">
      <PageHeader title="Projects" actions={createButton} />

      {projectsQuery.isPending && <p role="status" className="text-sm text-muted">Loading projects…</p>}
      {projectsQuery.isError && (
        <div className="mb-4 max-w-xl space-y-2">
          <div role="alert">
            <ErrorBanner>{projectErrorText(projectsQuery.error, "Could not load projects.")}</ErrorBanner>
          </div>
          <Button variant="secondary" disabled={projectsQuery.isFetching} onClick={() => void projectsQuery.refetch()}>
            Try again
          </Button>
        </div>
      )}
      {projectsQuery.isSuccess && projectsQuery.data.length === 0 && (
        <EmptyState
          title="No projects yet"
          description={canManage ? "Create your first project to start tracking tasks." : undefined}
          action={createButton}
        />
      )}
      {projects && projects.length > 0 && (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project, index) => (
            <li key={project.id}>
              <Link
                href={projectSettingsHref(workspaceSlug, project.id)}
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
                  {project.is_archived && <Badge className="ml-auto">Archived</Badge>}
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-gray-500">{project.description ?? "No description"}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {createOpen && canManage && membersQuery.data && (
        <CreateProjectModal workspaceSlug={workspaceSlug} members={membersQuery.data} onClose={closeCreate} />
      )}
    </div>
  );
}
