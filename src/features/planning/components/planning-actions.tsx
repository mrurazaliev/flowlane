'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import { ConfirmDeleteModal } from '@/features/workspaces'
import { Button } from '@/shared/ui/button'
import { useDeletePlanningItem } from '../api'
import { planningErrorText } from '../planning-form'

export function PlanningActions({ workspaceSlug, projectId, kind, id, name, onEdit }: {
  workspaceSlug: string
  projectId: string
  kind: 'cycles' | 'modules'
  id: string
  name: string
  onEdit: () => void
}) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const deleteItem = useDeletePlanningItem({ workspaceSlug, projectId, kind, id })
  const itemName = kind === 'cycles' ? 'cycle' : 'module'

  function closeDelete() {
    if (deleteItem.isPending) return
    deleteItem.reset()
    setDeleteOpen(false)
  }

  return (
    <div className="ml-auto flex gap-2">
      <Button size="sm" variant="secondary" onClick={onEdit}>
        <Pencil className="size-4" /> Edit
      </Button>
      <Button size="sm" variant="danger" onClick={() => setDeleteOpen(true)}>
        <Trash2 className="size-4" /> Delete
      </Button>
      {deleteOpen && (
        <ConfirmDeleteModal
          title={`Delete ${itemName}`}
          description={`Delete “${name}”? Its tasks will stay in the project.`}
          confirmLabel={`Delete ${itemName}`}
          pending={deleteItem.isPending}
          error={deleteItem.isError ? planningErrorText(deleteItem.error, `Could not delete the ${itemName}.`) : undefined}
          onClose={closeDelete}
          onConfirm={() => deleteItem.mutate(undefined, {
            onSuccess: () => router.replace(`/w/${workspaceSlug}/p/${projectId}/${kind}`),
          })}
        />
      )}
    </div>
  )
}
