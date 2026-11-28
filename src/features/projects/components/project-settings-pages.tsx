'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { ErrorBanner } from '@/shared/ui/form'
import { useProject } from '../api'
import { projectErrorText } from '../project-form'
import { useProjectAccess } from '../use-project-access'
import { GeneralSettings } from './general-settings'
import { LabelsSettings } from './labels-settings'
import { ProjectMembersSettings } from './project-members-settings'
import { StatesSettings } from './states-settings'
import { useT } from "@/shared/lib/i18n";

function useProjectParams() {
  return useParams<{ workspaceSlug: string; projectId: string }>()
}

function SettingsLayout({ children }: { children: React.ReactNode }) {
  const t = useT();
  const { workspaceSlug, projectId } = useProjectParams()
  const pathname = usePathname()
  const base = `/w/${workspaceSlug}/p/${projectId}/settings`
  const links = [
    { href: base, label: t("General & members") },
    { href: `${base}/states`, label: t("Statuses") },
    { href: `${base}/labels`, label: t("Labels") },
  ]

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 md:flex-row md:px-7">
      <nav className="flex shrink-0 gap-1 overflow-x-auto md:w-48 md:flex-col md:gap-0.5">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname === link.href ? 'page' : undefined}
            className={cn(
              'block shrink-0 rounded-lg px-3 py-2 text-sm',
              pathname === link.href ? 'bg-indigo-50 font-medium text-indigo-700' : 'text-gray-600 hover:bg-gray-100',
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="min-w-0 max-w-3xl flex-1">{children}</div>
    </div>
  )
}

export function ProjectSettingsPage() {
  const t = useT();
  const { workspaceSlug, projectId } = useProjectParams()
  const projectQuery = useProject(workspaceSlug, projectId)
  const { membersQuery, canManage } = useProjectAccess(workspaceSlug)
  const project = projectQuery.data
  const workspaceMembers = membersQuery.data ?? []

  return (
    <SettingsLayout>
      {projectQuery.isPending && <p role="status" className="text-sm text-muted">{t("Loading project…")}</p>}
      {projectQuery.isError && (
        <div className="space-y-2">
          <div role="alert"><ErrorBanner>{projectErrorText(projectQuery.error, t("Could not load the project."))}</ErrorBanner></div>
          <Button variant="secondary" disabled={projectQuery.isFetching} onClick={() => void projectQuery.refetch()}>
            {t("Try again")}
          </Button>
        </div>
      )}
      {projectQuery.isSuccess && project && (
        <div key={project.id} className="space-y-8">
          <GeneralSettings project={project} workspaceSlug={workspaceSlug} workspaceMembers={workspaceMembers} canManage={canManage} />
          <section>
            <h2 className="mb-3 text-base font-semibold text-gray-900">{t("Members")}</h2>
            <ProjectMembersSettings
              workspaceSlug={workspaceSlug} projectId={projectId} workspaceMembers={workspaceMembers} canManage={canManage}
            />
          </section>
        </div>
      )}
    </SettingsLayout>
  )
}

export function StatesSettingsPage() {
  const { workspaceSlug, projectId } = useProjectParams()
  const { canManage } = useProjectAccess(workspaceSlug)
  return (
    <SettingsLayout>
      <StatesSettings key={projectId} workspaceSlug={workspaceSlug} projectId={projectId} canManage={canManage} />
    </SettingsLayout>
  )
}

export function LabelsSettingsPage() {
  const { workspaceSlug, projectId } = useProjectParams()
  const { canManage } = useProjectAccess(workspaceSlug)
  return (
    <SettingsLayout>
      <LabelsSettings key={projectId} workspaceSlug={workspaceSlug} projectId={projectId} canManage={canManage} />
    </SettingsLayout>
  )
}
