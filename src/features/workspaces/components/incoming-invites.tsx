'use client'

import Link from 'next/link'
import { Mail } from 'lucide-react'
import { formatDate } from '@/shared/lib/utils'
import { Button, buttonClasses } from '@/shared/ui/button'
import { ErrorBanner } from '@/shared/ui/form'
import { useInvites } from '../invites-api'
import { workspaceErrorText } from '../workspace-form'

export function IncomingInvites({ className }: { className?: string }) {
  const { data: invites = [], isError, error, isFetching, refetch } = useInvites()

  if (!invites.length && !isError) return null

  return (
    <section className={className} aria-label="Workspace invitations">
      <h2 className="mb-3 text-base font-semibold text-ink">Invitations</h2>

      {isError && (
        <div className="mb-3 space-y-2">
          <div role="alert"><ErrorBanner>{workspaceErrorText(error, 'Could not load invitations.')}</ErrorBanner></div>
          <Button variant="secondary" disabled={isFetching} onClick={() => void refetch()}>Try again</Button>
        </div>
      )}

      {invites.length > 0 && (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {invites.map((invite) => (
            <li key={invite.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-marking-soft text-ink">
                <Mail className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{invite.workspace.name}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {invite.invited_by.display_name} invited you as {invite.role} · Until {formatDate(invite.expires_at)}
                </p>
              </div>
              <Link href={`/invites/${encodeURIComponent(invite.token)}`} className={buttonClasses('secondary', 'sm')}>
                View invitation
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
