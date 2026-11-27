'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useMe } from '@/features/auth'
import { Button } from '@/shared/ui/button'
import { ErrorBanner } from '@/shared/ui/form'
import { Logo } from '@/shared/ui/logo'
import { useWorkspaces } from '../api'
import { workspaceErrorText } from '../workspace-form'
import { CreateWorkspaceForm } from './create-workspace-form'
import { IncomingInvites } from './incoming-invites'

/** D2.1 Выбор и создание workspace */
export function WorkspacePicker() {
  const { data: workspaces, error, isPending, isError, isFetching, refetch } = useWorkspaces()
  const { data: currentUser } = useMe()

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-12">
      <Logo withText={false} />
      <h1 className="mt-4 text-2xl font-semibold text-gray-900">Select a workspace</h1>
      <p className="mt-1 text-sm text-gray-500">Choose an existing workspace or create a new one.</p>
      <IncomingInvites className="mt-8 w-full" />

      <div className="mt-10 grid w-full gap-6 md:grid-cols-2">
        {/* Мои workspace */}
        <section>
          <div className="mb-3 flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wide text-gray-500">
              Your workspaces{workspaces ? ` (${workspaces.length})` : ''}
            </span>
            <span className="text-gray-400">{currentUser?.email}</span>
          </div>

          {isPending && <p role="status" className="text-sm text-gray-500">Loading workspaces...</p>}

          {isError && (
            <div className="mb-3 space-y-2">
              <div role="alert">
                <ErrorBanner>
                  {workspaceErrorText(error, 'Could not load your workspaces.')}
                </ErrorBanner>
              </div>
              <Button variant="secondary" disabled={isFetching} onClick={() => void refetch()}>
                {isFetching ? 'Retrying...' : 'Try again'}
              </Button>
            </div>
          )}

          {workspaces && workspaces.length > 0 && (
            <ul className="space-y-3">
              {workspaces.map((ws) => (
                <li key={ws.id}>
                  <Link
                    href={`/w/${ws.slug}/projects`}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-sm"
                  >
                    <span className="flex size-10 items-center justify-center rounded-lg bg-indigo-100 font-semibold text-indigo-700">
                      {ws.name[0]}
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-medium text-gray-900">{ws.name}</span>
                      <span className="block text-xs text-gray-500">/{ws.slug}</span>
                    </span>
                    <ArrowRight className="size-4 text-gray-400" />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {workspaces?.length === 0 && !isError && (
            <p className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
              You are not in any workspace yet — create one.
            </p>
          )}
        </section>

        {/* Создать новый */}
        <CreateWorkspaceForm />
      </div>
    </main>
  )
}
