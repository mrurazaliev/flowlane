'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useWorkspace } from '@/features/workspaces'
import { AvatarStack } from '@/shared/ui/avatar'
import { cn } from '@/shared/lib/utils'
import { useProjectMembers, useProject } from '../api'
import { projectErrorText } from '../project-form';
import { useT } from "@/shared/lib/i18n";

export function ProjectHeader() {
  const t = useT();
  const { workspaceSlug, projectId } = useParams<{ workspaceSlug: string; projectId: string }>()
  const pathname = usePathname()
  const { data: workspace } = useWorkspace(workspaceSlug)
  const projectQuery = useProject(workspaceSlug, projectId)
  const { data: members } = useProjectMembers(workspaceSlug, projectId)

  if (projectQuery.isPending) return <ProjectHeaderSkeleton />
  const project = projectQuery.data
  if (!project) {
    return <p className="border-b border-line px-7 py-4 text-sm text-muted">
      {projectErrorText(projectQuery.error, t("Could not load the project."))}
    </p>
  }

  const base = `/w/${workspaceSlug}/p/${projectId}`
  const tabs = [
    { href: `${base}/issues`, label: t("Issues") },
    { href: `${base}/board`, label: t("Board") },
    { href: `${base}/cycles`, label: t("Cycles") },
    { href: `${base}/modules`, label: t("Modules") },
    { href: `${base}/settings`, label: t("Settings") },
  ]

  return (
    <header className="px-4 pb-3 pt-5 md:px-7">
      <p className="text-[13px] text-muted">
        {workspace?.name ?? workspaceSlug} / <span className="font-medium text-ink">{project.name}</span>
      </p>
      <div className="mt-1 flex items-center gap-3">
        <h1 className="font-serif text-[28px] font-semibold tracking-tight md:text-[38px]">{project.name}</h1>
        <span className="font-id rounded-md border border-line bg-white px-1.5 text-xs text-muted">{project.identifier}</span>
        <div className="ml-auto hidden md:block">
          {members && <AvatarStack names={members.map((m) => m.user.display_name)} />}
        </div>
      </div>

      <nav className="mt-4 flex w-fit max-w-full gap-1 overflow-x-auto rounded-[12px] border border-line bg-paper-2 p-1">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'shrink-0 rounded-[9px] px-3.5 py-1.5 font-medium transition-colors',
                active ? 'bg-white text-ink shadow-[0_1px_2px_rgba(27,34,56,.12)]' : 'text-muted hover:text-ink',
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}

export function ProjectHeaderSkeleton() {
  return <div className="h-[150px]" />
}
