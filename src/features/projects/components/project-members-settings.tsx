"use client";

import { useCallback, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { ConfirmDeleteModal } from '@/features/workspaces'
import type { ProjectMember, ProjectRole, WorkspaceMember } from '@/shared/api/types'
import { Avatar } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ErrorBanner, Select } from '@/shared/ui/form'
import { useAddProjectMember, useProjectMembers, useRemoveProjectMember } from '../api'
import { projectErrorText, projectRoles } from '../project-form';
import { useT } from "@/shared/lib/i18n";

/** Участники проекта. Добавлять можно только тех, кто уже в workspace */
export function ProjectMembersSettings({ workspaceSlug, projectId, workspaceMembers, canManage }: {
  workspaceSlug: string;
  projectId: string;
  workspaceMembers: WorkspaceMember[];
  canManage: boolean;
}) {
  const t = useT();
  const membersQuery = useProjectMembers(workspaceSlug, projectId)
  const projectMembers = membersQuery.data ?? []
  const add = useAddProjectMember(workspaceSlug, projectId)
  const { mutate: remove, isPending: isRemoving, error: removeError, reset: resetRemove } =
    useRemoveProjectMember(workspaceSlug, projectId)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [role, setRole] = useState<ProjectRole>('member')
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null)
  const notInProject = workspaceMembers.filter((wm) => !projectMembers.some((pm) => pm.user_id === wm.user_id))
  const selectedMember = notInProject.find((member) => member.user_id === selectedUserId)
  const isBusy = add.isPending || isRemoving
  const canEdit = canManage && membersQuery.isSuccess

  const closeRemove = useCallback(() => {
    if (isRemoving) return
    setMemberToRemove(null)
    resetRemove()
  }, [isRemoving, resetRemove])

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canEdit || isBusy || !selectedMember) return
    add.mutate({ user_id: selectedMember.user_id, role }, {
      onSuccess: () => {
        setSelectedUserId('')
        setRole('member')
      },
    })
  }

  function handleRemove() {
    if (!memberToRemove) return
    remove(memberToRemove.user_id, { onSuccess: () => setMemberToRemove(null) })
  }

  return (
    <div className="space-y-4">
      {membersQuery.isPending && <p role="status" className="text-sm text-muted">{t("Loading project members…")}</p>}
      {membersQuery.isError && (
        <div className="space-y-2">
          <div role="alert"><ErrorBanner>{projectErrorText(membersQuery.error, t("Could not load project members."))}</ErrorBanner></div>
          <Button variant="secondary" disabled={membersQuery.isFetching} onClick={() => void membersQuery.refetch()}>
            {t("Try again")}
          </Button>
        </div>
      )}
      {add.error && <div role="alert"><ErrorBanner>{projectErrorText(add.error, t("Could not add the project member."))}</ErrorBanner></div>}

      {canEdit && (
        <form className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-4" onSubmit={handleAdd}>
          <Select
            value={selectedMember?.user_id ?? ''}
            onChange={(event) => setSelectedUserId(event.currentTarget.value)}
            className="min-w-0 flex-1"
            aria-label={t("Workspace member")}
            disabled={isBusy || notInProject.length === 0}
          >
            <option value="" disabled>{notInProject.length ? t("Add a workspace member…") : t("No workspace members to add")}</option>
            {notInProject.map((member) => (
              <option key={member.user_id} value={member.user_id}>{member.user.display_name} ({member.user.email})</option>
            ))}
          </Select>
          <Select value={role} onChange={(event) => setRole(event.currentTarget.value as ProjectRole)}
            className="w-28" aria-label={t("Project role")} disabled={isBusy || notInProject.length === 0}>
            {projectRoles.map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
          <Button type="submit" disabled={isBusy || !selectedMember}>{add.isPending ? t("Adding…") : t("Add")}</Button>
        </form>
      )}

      {membersQuery.isSuccess && projectMembers.length === 0 && <p className="text-sm text-muted">{t("No project members yet.")}</p>}
      {projectMembers.length > 0 && (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {projectMembers.map((member) => (
            <li key={member.user_id} className="flex items-center gap-3 px-4 py-3">
              <Avatar name={member.user.display_name} src={member.user.avatar_url} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{member.user.display_name}</p>
                <p className="truncate text-xs text-gray-500">{member.user.email}</p>
              </div>
              <Badge>{member.role}</Badge>
              {canEdit && (
                <button type="button" disabled={isBusy} onClick={() => setMemberToRemove(member)}
                  className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  aria-label={t("Remove {display_name}", { display_name: member.user.display_name })}>
                  <X className="size-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {memberToRemove && (
        <ConfirmDeleteModal
          title={t("Remove project member?")}
          description={t("Remove {display_name} from this project’s member list?", { display_name: memberToRemove.user.display_name })}
          confirmLabel={t("Remove member")}
          pending={isRemoving}
          error={removeError ? projectErrorText(removeError, t("Could not remove the project member.")) : undefined}
          onClose={closeRemove}
          onConfirm={handleRemove}
        />
      )}
    </div>
  )
}
