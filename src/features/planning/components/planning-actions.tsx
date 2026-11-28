'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import { ConfirmDeleteModal } from '@/features/workspaces'
import { Button } from '@/shared/ui/button'
import { useDeletePlanningItem } from '../api'
import { planningErrorText } from '../planning-form'
import { useT } from "@/shared/lib/i18n";

export function PlanningActions({ workspaceSlug, projectId, kind, id, name, onEdit }: {
  workspaceSlug: string
  projectId: string
  kind: 'cycles' | 'modules'
  id: string
  name: string
  onEdit: () => void
}) {
  const t = useT();
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const deleteItem = useDeletePlanningItem({ workspaceSlug, projectId, kind, id })
  const isCycle = kind === 'cycles'

  function closeDelete() {
    if (deleteItem.isPending) return
    deleteItem.reset()
    setDeleteOpen(false)
  }

  return (
    <div className="ml-auto flex gap-2">
      <Button size="sm" variant="secondary" onClick={onEdit}>
        <Pencil className="size-4" /> {t("Edit")}
      </Button>
      <Button size="sm" variant="danger" onClick={() => setDeleteOpen(true)}>
        <Trash2 className="size-4" /> {t("Delete")}
      </Button>
      {deleteOpen && (
        <ConfirmDeleteModal
          title={isCycle ? t("Delete cycle") : t("Delete module")}
          description={t("Delete “{name}”? Its tasks will stay in the project.", { name })}
          confirmLabel={isCycle ? t("Delete cycle") : t("Delete module")}
          pending={deleteItem.isPending}
          error={deleteItem.isError ? planningErrorText(deleteItem.error, isCycle ? t("Could not delete the cycle.") : t("Could not delete the module.")) : undefined}
          onClose={closeDelete}
          onConfirm={() => deleteItem.mutate(undefined, {
            onSuccess: () => router.replace(`/w/${workspaceSlug}/p/${projectId}/${kind}`),
          })}
        />
      )}
    </div>
  )
}
