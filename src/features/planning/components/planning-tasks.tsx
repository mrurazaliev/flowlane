'use client'

import { useCallback, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { AddIssuesModal, IssueList } from '@/features/issues'
import { Button } from '@/shared/ui/button'
import { useChangePlanningTasks } from '../api'
import { planningErrorText } from '../planning-form'

export function PlanningTasks({ workspaceSlug, projectId, kind, id, name, canWrite }: {
  workspaceSlug: string
  projectId: string
  kind: 'cycles' | 'modules'
  id: string
  name: string
  canWrite: boolean
}) {
  const [action, setAction] = useState<'add' | 'remove' | null>(null)
  const changeTasks = useChangePlanningTasks({ workspaceSlug, projectId, kind, id }, action ?? 'add')
  const { reset } = changeTasks
  const filter = kind === 'cycles' ? { cycle: id } : { module: id }

  const close = useCallback(() => {
    reset()
    setAction(null)
  }, [reset])

  return (
    <section className="mt-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-900">Tasks</h2>
        {canWrite && (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => setAction('remove')}>
              <Minus className="size-4" /> Remove task
            </Button>
            <Button size="sm" onClick={() => setAction('add')}>
              <Plus className="size-4" /> Add existing tasks
            </Button>
          </div>
        )}
      </div>
      <IssueList workspaceSlug={workspaceSlug} projectId={projectId} filter={filter} />

      {canWrite && action && (
        <AddIssuesModal
          onClose={close}
          title={action === 'add' ? `Add tasks to ${name}` : `Remove a task from ${name}`}
          hint={action === 'add' && kind === 'cycles' ? 'Tasks already in another cycle will move to this one.' : undefined}
          workspaceSlug={workspaceSlug}
          projectId={projectId}
          filter={filter}
          action={action}
          pending={changeTasks.isPending}
          error={changeTasks.isError ? planningErrorText(changeTasks.error, 'Could not update the task list.') : undefined}
          onConfirm={(issueIds) => changeTasks.mutate(issueIds, { onSuccess: close })}
        />
      )}
    </section>
  )
}
