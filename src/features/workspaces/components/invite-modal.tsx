'use client'

import { useCallback, useState, type FormEvent } from 'react'
import { UserPlus } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/shared/ui/button'
import { ErrorBanner, FieldError, FieldHint, Input, Label, Select } from '@/shared/ui/form'
import { Modal } from '@/shared/ui/modal'
import type { AssignableWorkspaceRole } from '../api'
import { useAddInvite } from '../invites-api'
import { workspaceErrorText } from '../workspace-form'

const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email')

export function InviteModal({ workspaceSlug, onClose }: { workspaceSlug: string; onClose: () => void }) {
  const inviteMutation = useAddInvite(workspaceSlug)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<AssignableWorkspaceRole>('member')
  const [emailError, setEmailError] = useState('')
  const [actionError, setActionError] = useState('')
  const busy = inviteMutation.isPending

  const close = useCallback(() => {
    if (!busy) onClose()
  }, [busy, onClose])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return

    setActionError('')
    const result = emailSchema.safeParse(email)
    if (!result.success) {
      setEmailError(result.error.issues[0].message)
      return
    }

    setEmailError('')
    try {
      await inviteMutation.mutateAsync({ email: result.data, role })
      onClose()
    } catch (error) {
      setActionError(workspaceErrorText(error, 'Could not create the invitation. Please try again.'))
    }
  }

  return (
    <Modal
      open
      onClose={close}
      title="Invite people"
      icon={<UserPlus className="size-5 text-indigo-600" />}
      footer={
        <>
          <Button variant="secondary" disabled={busy} onClick={close}>Cancel</Button>
          <Button type="submit" form="invite-form" disabled={busy}>{busy ? 'Sending…' : 'Send invite'}</Button>
        </>
      }
    >
      <form id="invite-form" className="space-y-4" noValidate onSubmit={handleSubmit}>
        {actionError && <div role="alert"><ErrorBanner>{actionError}</ErrorBanner></div>}
        <div>
          <Label htmlFor="invite-email">Email *</Label>
          <Input id="invite-email" type="email" autoComplete="email" placeholder="colleague@company.com"
            value={email} required readOnly={busy} invalid={!!emailError} aria-invalid={!!emailError}
            aria-describedby={emailError ? 'invite-email-error' : undefined}
            onChange={(event) => {
              setEmail(event.currentTarget.value)
              setEmailError('')
            }} />
          {emailError && <div id="invite-email-error" role="alert"><FieldError>{emailError}</FieldError></div>}
        </div>
        <div>
          <Label htmlFor="invite-role">Role</Label>
          <Select id="invite-role" value={role} disabled={busy}
            onChange={(event) => setRole(event.currentTarget.value as AssignableWorkspaceRole)}>
            <option value="admin">Admin — manages members and settings</option>
            <option value="member">Member — creates and edits tasks</option>
            <option value="guest">Guest — can view, cannot edit</option>
          </Select>
          <FieldHint>The invitation is valid for 7 days.</FieldHint>
        </div>
      </form>
    </Modal>
  )
}
