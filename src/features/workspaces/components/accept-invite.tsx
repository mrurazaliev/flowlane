'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { getRefreshToken } from '@/shared/api/auth-store'
import { formatDate } from '@/shared/lib/utils'
import { Button, buttonClasses } from '@/shared/ui/button'
import { ErrorBanner } from '@/shared/ui/form'
import { Logo } from '@/shared/ui/logo'
import { useAcceptInvite, useInvite } from '../invites-api'
import { workspaceErrorText } from '../workspace-form'

export function AcceptInvite() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const { data: invite, isPending, error } = useInvite(token)
  const acceptMutation = useAcceptInvite(token, invite?.workspace.slug)
  const [actionError, setActionError] = useState('')

  async function handleAccept() {
    if (!invite || acceptMutation.isPending) return
    setActionError('')

    if (!getRefreshToken()) {
      setActionError('Log in or sign up with the invited email, then open this link again.')
      return
    }

    try {
      await acceptMutation.mutateAsync()
      router.replace(`/w/${encodeURIComponent(invite.workspace.slug)}/projects`)
    } catch (error) {
      setActionError(workspaceErrorText(error, 'Could not accept the invitation. Please try again.'))
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="flex justify-center"><Logo withText={false} /></div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-indigo-600">Workspace invite</p>

        {isPending && <p role="status" className="mt-4 text-sm text-muted">Loading invitation…</p>}
        {error && (
          <div className="mt-4" role="alert">
            <ErrorBanner>{workspaceErrorText(error, 'Could not load this invitation.')}</ErrorBanner>
          </div>
        )}

        {invite && !error && (
          <>
            <h1 className="mt-2 text-xl font-semibold text-gray-900">
              {invite.invited_by.display_name} invited you to join {invite.workspace.name}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Sign in as {invite.email} to join as <span className="font-medium capitalize text-gray-900">{invite.role}</span>.
            </p>
            <p className="mt-2 text-xs text-gray-500">Valid until {formatDate(invite.expires_at)}.</p>

            {actionError && <div className="mt-4" role="alert"><ErrorBanner>{actionError}</ErrorBanner></div>}
            <div className="mt-6 space-y-2">
              <Button className="w-full" disabled={acceptMutation.isPending} onClick={() => void handleAccept()}>
                {acceptMutation.isPending ? 'Accepting…' : 'Accept invite'}
              </Button>
              <div className="flex gap-2">
                <Link href="/register" className={buttonClasses('secondary', 'md', 'flex-1')}>Sign up</Link>
                <Link href="/login" className={buttonClasses('secondary', 'md', 'flex-1')}>Log in</Link>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
