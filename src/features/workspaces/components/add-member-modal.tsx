'use client'

import { useCallback, useState, type FormEvent } from 'react'
import { UserPlus } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/shared/ui/button'
import { ErrorBanner, FieldError, FieldHint, Input, Label, Select } from '@/shared/ui/form'
import { Modal } from '@/shared/ui/modal'
import { useAddWorkspaceMember, type AssignableWorkspaceRole } from '../api'
import { assignableWorkspaceRoles, workspaceErrorText } from '../workspace-form'
import { useT } from "@/shared/lib/i18n";

const userIdSchema = z.string().trim().uuid('Enter a valid user ID (UUID)')

export function AddMemberModal({ workspaceSlug, onClose }: { workspaceSlug: string; onClose: () => void }) {
  const t = useT();
  const addMutation = useAddWorkspaceMember(workspaceSlug)
  const [userId, setUserId] = useState('')
  const [role, setRole] = useState<AssignableWorkspaceRole>('member')
  const [userIdError, setUserIdError] = useState('')
  const [actionError, setActionError] = useState('')
  const busy = addMutation.isPending

  const close = useCallback(() => {
    if (!busy) onClose()
  }, [busy, onClose])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return

    setActionError('')
    const id = userIdSchema.safeParse(userId)
    if (!id.success) {
      setUserIdError(id.error.issues[0].message)
      event.currentTarget.querySelector<HTMLInputElement>('#member-user-id')?.focus()
      return
    }

    try {
      await addMutation.mutateAsync({ user_id: id.data, role })
      onClose()
    } catch (error) {
      setActionError(workspaceErrorText(error, t("Could not add the member. Please try again.")))
    }
  }

  return (
    <Modal
      open
      title={t("Add workspace member")}
      icon={<UserPlus className="size-5 text-indigo-600" />}
      onClose={close}
      footer={
        <>
          <Button variant="secondary" disabled={busy} onClick={close}>{t("Cancel")}</Button>
          <Button type="submit" form="add-member-form" disabled={busy}>
            {busy ? t("Adding…") : t("Add member")}
          </Button>
        </>
      }
    >
      <form id="add-member-form" className="space-y-4" onSubmit={handleSubmit}>
        {actionError && (
          <div role="alert"><ErrorBanner>{actionError}</ErrorBanner></div>
        )}

        <div>
          <Label htmlFor="member-user-id">{t("User ID")}</Label>
          <Input
            id="member-user-id"
            name="user_id"
            autoComplete="off"
            readOnly={busy}
            invalid={!!userIdError}
            aria-invalid={!!userIdError}
            aria-describedby="member-user-id-feedback"
            value={userId}
            onChange={(event) => {
              setUserId(event.currentTarget.value)
              if (userIdError && userIdSchema.safeParse(event.currentTarget.value).success) setUserIdError('')
            }}
          />
          <div id="member-user-id-feedback" aria-live="polite">
            {userIdError ? (
              <FieldError>{userIdError}</FieldError>
            ) : (
              <FieldHint>{t("Enter the UUID of an existing Flowlane user.")}</FieldHint>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="add-member-role">{t("Role")}</Label>
          <Select id="add-member-role" disabled={busy} value={role}
            onChange={(event) => setRole(event.currentTarget.value as AssignableWorkspaceRole)}>
            {assignableWorkspaceRoles.map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
        </div>
      </form>
    </Modal>
  )
}
