'use client'

import { useCallback, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useStates } from '@/shared/api/lookups'
import type { State, StateGroup } from '@/shared/api/types'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ErrorBanner } from '@/shared/ui/form'
import { StateIcon } from '@/shared/ui/issue-icons'
import { projectErrorText, stateGroups } from '../project-form'
import { DeleteStateModal, StateModal, stateGroupLabels } from './state-modal'
import { useT } from "@/shared/lib/i18n";

export function StatesSettings({ workspaceSlug, projectId, canManage }: {
  workspaceSlug: string
  projectId: string
  canManage: boolean
}) {
  const t = useT();
  const statesQuery = useStates(workspaceSlug, projectId)
  const states = statesQuery.data
  const [editing, setEditing] = useState<{ group: StateGroup; state?: State } | null>(null)
  const [deleting, setDeleting] = useState<State | null>(null)
  const closeEditor = useCallback(() => setEditing(null), [])
  const closeDelete = useCallback(() => setDeleting(null), [])

  if (statesQuery.isPending) return <p role="status" className="text-sm text-muted">{t("Loading statuses…")}</p>

  if (statesQuery.isError) {
    return (
      <div className="space-y-2">
        <div role="alert"><ErrorBanner>{projectErrorText(statesQuery.error, t("Could not load project statuses."))}</ErrorBanner></div>
        <Button variant="secondary" disabled={statesQuery.isFetching} onClick={() => void statesQuery.refetch()}>{t("Try again")}</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">{t("Each status is a column on the board and belongs to one of five groups.")}</p>

      {stateGroups.map((group) => {
        const groupStates = states.filter((state) => state.group === group)
        return (
          <section key={group} className="rounded-xl border border-gray-200 bg-white">
            <header className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-2.5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <StateIcon group={group} color="#6B7280" />
                {t(stateGroupLabels[group])}
              </h2>
              {canManage && (
                <button type="button" className="flex items-center gap-1 text-sm text-indigo-600 hover:underline"
                  onClick={() => setEditing({ group })}>
                  <Plus className="size-4" /> {t("Add status")}
                </button>
              )}
            </header>
            <ul className="divide-y divide-gray-100">
              {groupStates.length === 0 && <li className="px-4 py-3 text-sm text-muted">{t("No statuses in this group")}</li>}
              {groupStates.map((state) => (
                <li key={state.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: state.color }} />
                  <span className="min-w-0 break-words text-sm text-gray-900">{state.name}</span>
                  {state.is_default && <Badge tone="marking">{t("Default")}</Badge>}
                  {canManage && (
                    <div className="ml-auto flex shrink-0 gap-1">
                      <button type="button" className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        aria-label={t("Edit {name}", { name: state.name })} onClick={() => setEditing({ group, state })}>
                        <Pencil className="size-4" />
                      </button>
                      <button type="button" className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        aria-label={t("Delete {name}", { name: state.name })} onClick={() => setDeleting(state)}>
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      {canManage && editing && (
        <StateModal workspaceSlug={workspaceSlug} projectId={projectId} state={editing.state} group={editing.group}
          order={Math.min(2147483647, Math.max(0, ...states.map((state) => state.order + 1)))} onClose={closeEditor} />
      )}
      {canManage && deleting && (
        <DeleteStateModal workspaceSlug={workspaceSlug} projectId={projectId} state={deleting} states={states} onClose={closeDelete} />
      )}
    </div>
  )
}
