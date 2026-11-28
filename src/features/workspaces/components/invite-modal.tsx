'use client'

import { useCallback, useRef, useState, type FormEvent } from 'react'
import { Check, Copy, UserPlus } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/shared/ui/button'
import { ErrorBanner, FieldError, FieldHint, Input, Label, Select } from '@/shared/ui/form'
import { Modal } from '@/shared/ui/modal'
import type { AssignableWorkspaceRole } from '../api'
import { useAddInvite } from '../invites-api'
import { useT } from "@/shared/lib/i18n";
import { workspaceErrorText } from '../workspace-form'

const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email')

export function InviteModal({ workspaceSlug, onClose }: { workspaceSlug: string; onClose: () => void }) {
  const t = useT();
  const inviteMutation = useAddInvite(workspaceSlug)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<AssignableWorkspaceRole>('member')
  const [emailError, setEmailError] = useState('')
  const [actionError, setActionError] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const linkField = useRef<HTMLDivElement>(null)
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
      const invite = await inviteMutation.mutateAsync({ email: result.data, role })
      setInviteLink(new URL(`/invites/${encodeURIComponent(invite.token)}`, window.location.origin).href)
    } catch (error) {
      setActionError(workspaceErrorText(error, t("Could not create the invitation. Please try again.")))
    }
  }

  async function handleCopyLink() {
    setCopyError(false)
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
    } catch {
      const input = linkField.current?.querySelector('input')
      input?.focus()
      input?.select()
      setCopyError(true)
    }
  }

  if (inviteLink) {
    return (
      <Modal open onClose={close} title={t("Invitation link")} icon={<UserPlus className="size-5 text-indigo-600" />}
        footer={<Button onClick={close}>{t("Close")}</Button>}>
        <Label htmlFor="invite-link">{t("Invitation link")}</Label>
        <div className="flex gap-2" ref={linkField}>
          <Input id="invite-link" value={inviteLink} readOnly autoFocus
            onFocus={(event) => event.currentTarget.select()} />
          <Button variant="secondary" className="h-11 shrink-0" onClick={() => void handleCopyLink()}>
            {copied ? <><Check className="size-4" /> {t("profile.copied")}</> : <><Copy className="size-4" /> {t("Copy link")}</>}
          </Button>
        </div>
        {copyError && <div role="status"><FieldHint>{t("Copy the selected link manually.")}</FieldHint></div>}
        <FieldHint>{t("Share this link with the person you invited.")}</FieldHint>
      </Modal>
    )
  }

  return (
    <Modal
      open
      onClose={close}
      title={t("Invite people")}
      icon={<UserPlus className="size-5 text-indigo-600" />}
      footer={
        <>
          <Button variant="secondary" disabled={busy} onClick={close}>{t("Cancel")}</Button>
          <Button type="submit" form="invite-form" disabled={busy}>{busy ? t("Sending…") : t("Send invite")}</Button>
        </>
      }
    >
      <form id="invite-form" className="space-y-4" noValidate onSubmit={handleSubmit}>
        {actionError && <div role="alert"><ErrorBanner>{actionError}</ErrorBanner></div>}
        <div>
          <Label htmlFor="invite-email">{t("Email")} *</Label>
          <Input id="invite-email" type="email" autoComplete="email" placeholder={t("colleague@company.com")}
            value={email} required readOnly={busy} invalid={!!emailError} aria-invalid={!!emailError}
            aria-describedby={emailError ? 'invite-email-error' : undefined}
            onChange={(event) => {
              setEmail(event.currentTarget.value)
              setEmailError('')
            }} />
          {emailError && <div id="invite-email-error" role="alert"><FieldError>{emailError}</FieldError></div>}
        </div>
        <div>
          <Label htmlFor="invite-role">{t("Role")}</Label>
          <Select id="invite-role" value={role} disabled={busy}
            onChange={(event) => setRole(event.currentTarget.value as AssignableWorkspaceRole)}>
            <option value="admin">{t("Admin — manages members and settings")}</option>
            <option value="member">{t("Member — creates and edits tasks")}</option>
            <option value="guest">{t("Guest — can view, cannot edit")}</option>
          </Select>
          <FieldHint>{t("The invitation is valid for 7 days.")}</FieldHint>
        </div>
      </form>
    </Modal>
  )
}
