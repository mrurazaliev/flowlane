'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Plus } from 'lucide-react'
import { projectColor } from '@/shared/api/lookups'
import { SidebarLink } from '@/shared/layout/sidebar-link'
import { useProjects } from '../api'
import { projectSettingsHref } from '../project-form'
import { useProjectAccess } from '../use-project-access'
import { CreateProjectModal } from './create-project-modal';
import { useT } from "@/shared/lib/i18n";

export function ProjectNav({ workspaceSlug }: { workspaceSlug: string }) {
  const t = useT();
  const { projectId } = useParams<{ projectId?: string }>()
  const [createOpen, setCreateOpen] = useState(false)
  const projectsQuery = useProjects(workspaceSlug)
  const projects = projectsQuery.data ?? []
  const activeProjects = projects.filter((project) => !project.is_archived)
  const { membersQuery, canManage } = useProjectAccess(workspaceSlug)
  const closeCreate = useCallback(() => setCreateOpen(false), [])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-1.5 flex items-center justify-between px-2.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-side-faint">
        <Link href={`/w/${workspaceSlug}/projects`} className="hover:text-ink">
          {t("Projects")}
        </Link>
        {canManage && <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="rounded p-0.5 hover:bg-side-hover hover:text-ink"
          aria-label={t("New project")}
        >
          <Plus className="size-4" />
        </button>}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {projectsQuery.isPending && <p className="px-2.5 py-2 text-sm text-side-faint">{t("Loading projects…")}</p>}
        {projectsQuery.isError && <p className="px-2.5 py-2 text-sm text-side-faint">{t("Could not load projects")}</p>}
        {projectsQuery.isSuccess && activeProjects.length === 0 && (
          <div className="px-2.5 py-2 text-sm">
            <p className="text-side-faint">{projects.length ? t("No active projects") : t("No projects yet")}</p>
            {canManage && <button type="button" onClick={() => setCreateOpen(true)} className="mt-1 font-medium text-marking hover:underline">
              {t("Create a project")}
            </button>}
          </div>
        )}
        {projects.map((project, index) => !project.is_archived && (
            <SidebarLink
              key={project.id}
              href={projectSettingsHref(workspaceSlug, project.id)}
              active={project.id === projectId}
            >
              <span className="size-2.5 rounded-full" style={{ backgroundColor: projectColor(index) }} />
              <span className="flex-1 truncate">{project.name}</span>
              <span className="font-id text-[11px] text-side-faint">{project.identifier}</span>
            </SidebarLink>
        ))}
      </nav>

      {createOpen && canManage && membersQuery.data && (
        <CreateProjectModal workspaceSlug={workspaceSlug} members={membersQuery.data} onClose={closeCreate} />
      )}
    </div>
  )
}
