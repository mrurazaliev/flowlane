'use client'

import { useCallback, useState } from 'react'
import { useParams } from 'next/navigation'
import { Plus, UserPlus, X } from 'lucide-react'
import { useMe } from '@/features/auth'
import type { WorkspaceMember } from '@/shared/api/types'
import { Avatar } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ErrorBanner, Select } from '@/shared/ui/form'
import { EmptyState, PageHeader } from '@/shared/ui/page'
import {
  useEditWorkspaceMemberRole,
  useRemoveWorkspaceMember,
  useWorkspaceMembers,
  useWorkspace,
  type AssignableWorkspaceRole,
} from '../api'
import { assignableWorkspaceRoles, workspaceErrorText } from '../workspace-form'
import { AddMemberModal } from './add-member-modal'
import { ConfirmDeleteModal } from './confirm-delete-modal'
import { InviteModal } from './invite-modal'
import { useT } from "@/shared/lib/i18n";

export function MembersPage() {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>()

  return <WorkspaceMembers key={workspaceSlug} workspaceSlug={workspaceSlug} />
}

function WorkspaceMembers({ workspaceSlug }: { workspaceSlug: string }) {
  const t = useT();
  const [modal, setModal] = useState<'add' | 'invite' | null>(null)
  const [memberToRemove, setMemberToRemove] = useState<WorkspaceMember | null>(null)
  const { data: workspace } = useWorkspace(workspaceSlug)
  const membersQuery = useWorkspaceMembers(workspaceSlug)
  const { data: me } = useMe()
  const changeRole = useEditWorkspaceMemberRole(workspaceSlug)
  const { mutate: removeMember, isPending: isRemoving, error: removeError, reset: resetRemove } =
    useRemoveWorkspaceMember(workspaceSlug)
  const members = membersQuery.data
  const myRole = members?.find((member) => member.user_id === me?.id)?.role
  const canManageMembers = !membersQuery.isError && (myRole === 'owner' || myRole === 'admin')
  const isChangingMembers = changeRole.isPending || isRemoving

  const closeModal = useCallback(() => setModal(null), [])
  const closeRemove = useCallback(() => {
    if (isRemoving) return
    setMemberToRemove(null)
    resetRemove()
  }, [isRemoving, resetRemove])

  function handleRoleChange(userId: string, role: AssignableWorkspaceRole) {
    changeRole.mutate({ user_id: userId, role })
  }

  function handleRemove() {
    if (!memberToRemove) return
    removeMember(memberToRemove.user_id, { onSuccess: () => setMemberToRemove(null) })
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-7">
      <PageHeader
        title={t("Members")}
        description={workspace?.name}
        actions={canManageMembers && (
          <>
            <Button variant="secondary" disabled={isChangingMembers} onClick={() => setModal('add')}>
              <Plus className="size-4" /> {t("Add")}
            </Button>
            <Button disabled={isChangingMembers} onClick={() => setModal('invite')}>
              <UserPlus className="size-4" /> {t("Invite")}
            </Button>
          </>
        )}
      />

      <div className="max-w-3xl space-y-3">
        {membersQuery.isPending && <p role="status" className="text-sm text-gray-500">{t("Loading members…")}</p>}

        {membersQuery.isError && (
          <div className="space-y-2">
            <div role="alert">
              <ErrorBanner>{workspaceErrorText(membersQuery.error, t("Could not load workspace members."))}</ErrorBanner>
            </div>
            <Button variant="secondary" disabled={membersQuery.isFetching} onClick={() => void membersQuery.refetch()}>
              {t("Try again")}
            </Button>
          </div>
        )}

        {changeRole.error && (
          <div role="alert">
            <ErrorBanner>{workspaceErrorText(changeRole.error, t("Could not change the member’s role."))}</ErrorBanner>
          </div>
        )}

        {membersQuery.isSuccess && members?.length === 0 && <EmptyState title={t("No workspace members")} />}

        {members && members.length > 0 && (
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
            {members.map((member) => {
              const isOwner = member.role === 'owner'
              const isMe = member.user_id === me?.id
              const canManageRow = canManageMembers && !isOwner && !isMe
              const currentRole = changeRole.isPending && changeRole.variables.user_id === member.user_id
                ? changeRole.variables.role
                : member.role

              return (
                <li key={member.user_id} className="flex items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4">
                  <Avatar name={member.user.display_name} src={member.user.avatar_url} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {member.user.display_name} {isMe && <span className="text-gray-400">(you)</span>}
                    </p>
                    <p className="truncate text-xs text-gray-500">{member.user.email}</p>
                  </div>

                  {canManageRow ? (
                    <>
                      <Select
                        value={currentRole}
                        disabled={isChangingMembers}
                        aria-label={t("Role for {display_name}", { display_name: member.user.display_name })}
                        className="h-9 w-24 sm:w-28"
                        onChange={(event) => handleRoleChange(member.user_id, event.currentTarget.value as AssignableWorkspaceRole)}
                      >
                        {assignableWorkspaceRoles.map((role) => <option key={role} value={role}>{role}</option>)}
                      </Select>
                      <button
                        type="button"
                        disabled={isChangingMembers}
                        onClick={() => setMemberToRemove(member)}
                        className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        aria-label={t("Remove {display_name}", { display_name: member.user.display_name })}
                      >
                        <X className="size-4" />
                      </button>
                    </>
                  ) : (
                    <Badge tone={isOwner ? 'marking' : 'gray'}>{member.role}</Badge>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {modal === 'add' && <AddMemberModal workspaceSlug={workspaceSlug} onClose={closeModal} />}
      {modal === 'invite' && <InviteModal workspaceSlug={workspaceSlug} onClose={closeModal} />}

      {memberToRemove && (
        <ConfirmDeleteModal
          title={t("Remove workspace member?")}
          description={`${memberToRemove.user.display_name} will lose access to this workspace.`}
          confirmLabel={t("Remove member")}
          pending={isRemoving}
          error={removeError ? workspaceErrorText(removeError, t("Could not remove the workspace member.")) : undefined}
          onClose={closeRemove}
          onConfirm={handleRemove}
        />
      )}
    </div>
  )
}
