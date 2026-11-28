'use client'

import { useCallback, useId, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { ConfirmDeleteModal } from '@/features/workspaces'
import { useLabels } from '@/shared/api/lookups'
import type { Label as ProjectLabel } from '@/shared/api/types'
import { Button } from '@/shared/ui/button'
import { ErrorBanner, FieldError, Input } from '@/shared/ui/form'
import { Modal } from '@/shared/ui/modal'
import { useDeleteProjectLabel, useSaveProjectLabel } from '../api'
import { projectErrorText, projectLabelSchema } from '../project-form'

type LabelFormValues = z.infer<typeof projectLabelSchema>

function LabelForm({ workspaceSlug, projectId, label, onClose }: {
  workspaceSlug: string
  projectId: string
  label?: ProjectLabel
  onClose?: () => void
}) {
  const formId = useId()
  const save = useSaveProjectLabel(workspaceSlug, projectId)
  const { register, handleSubmit, reset, setError, formState: { errors, isDirty, isSubmitting } } = useForm<LabelFormValues>({
    resolver: zodResolver(projectLabelSchema),
    defaultValues: { name: label?.name ?? '', color: label?.color ?? '#4f46e5' },
  })

  const close = useCallback(() => {
    if (!isSubmitting) onClose?.()
  }, [isSubmitting, onClose])

  async function onSubmit(values: LabelFormValues) {
    try {
      if (label) {
        await save.mutateAsync({
          labelId: label.id,
          payload: {
            name: values.name === label.name ? undefined : values.name,
            color: values.color.toLowerCase() === label.color.toLowerCase() ? undefined : values.color,
          },
        })
        onClose?.()
      } else {
        await save.mutateAsync({ payload: values })
        reset()
      }
    } catch (error) {
      setError('root.server', { message: projectErrorText(error, 'Could not save the label.') })
    }
  }

  const form = (
    <form id={formId} className={label ? 'space-y-3' : 'space-y-3 rounded-xl border border-gray-200 bg-white p-4'}
      onSubmit={handleSubmit(onSubmit)}>
      {errors.root?.server?.message && <div role="alert"><ErrorBanner>{errors.root.server.message}</ErrorBanner></div>}
      <div className="flex flex-wrap items-start gap-2">
        <Input type="color" aria-label="Label color" className="w-12 shrink-0 cursor-pointer p-1" disabled={isSubmitting}
          invalid={!!errors.color} aria-invalid={!!errors.color} {...register('color')} />
        <div className="min-w-28 flex-1">
          <Input aria-label="Label name" placeholder={label ? 'Label name' : 'New label name'} maxLength={50} readOnly={isSubmitting}
            invalid={!!errors.name} aria-invalid={!!errors.name} {...register('name')} />
          <FieldError>{errors.name?.message}</FieldError>
        </div>
        {!label && (
          <Button type="submit" className="h-11" disabled={isSubmitting}>
            <Plus className="size-4" /> {isSubmitting ? 'Adding…' : 'Add label'}
          </Button>
        )}
      </div>
      <FieldError>{errors.color?.message}</FieldError>
    </form>
  )

  if (!label) return form

  return (
    <Modal
      open
      onClose={close}
      title="Edit label"
      footer={
        <>
          <Button variant="secondary" disabled={isSubmitting} onClick={close}>Cancel</Button>
          <Button type="submit" form={formId} disabled={!isDirty || isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </Button>
        </>
      }
    >
      {form}
    </Modal>
  )
}

export function LabelsSettings({ workspaceSlug, projectId, canManage }: {
  workspaceSlug: string
  projectId: string
  canManage: boolean
}) {
  const labelsQuery = useLabels(workspaceSlug, projectId)
  const labels = labelsQuery.data
  const [editing, setEditing] = useState<ProjectLabel | null>(null)
  const [deleting, setDeleting] = useState<ProjectLabel | null>(null)
  const { mutate: removeLabel, isPending: isDeleting, error: deleteError, reset: resetDelete } =
    useDeleteProjectLabel(workspaceSlug, projectId)

  const closeEditor = useCallback(() => setEditing(null), [])
  const closeDelete = useCallback(() => {
    if (isDeleting) return
    resetDelete()
    setDeleting(null)
  }, [isDeleting, resetDelete])

  function handleDelete() {
    if (!deleting || isDeleting) return
    removeLabel(deleting.id, { onSuccess: () => setDeleting(null) })
  }

  if (labelsQuery.isPending) return <p role="status" className="text-sm text-muted">Loading labels…</p>

  if (labelsQuery.isError) {
    return (
      <div className="space-y-2">
        <div role="alert"><ErrorBanner>{projectErrorText(labelsQuery.error, 'Could not load project labels.')}</ErrorBanner></div>
        <Button variant="secondary" disabled={labelsQuery.isFetching} onClick={() => void labelsQuery.refetch()}>Try again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {canManage && <LabelForm workspaceSlug={workspaceSlug} projectId={projectId} />}

      {labels.length === 0 ? (
        <p className="text-sm text-muted">No labels yet</p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {labels.map((label) => (
            <li key={label.id} className="flex items-center gap-3 px-4 py-3">
              <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: label.color }} />
              <span className="min-w-0 break-words text-sm text-gray-900">{label.name}</span>
              {canManage && (
                <div className="ml-auto flex shrink-0 gap-1">
                  <button type="button" className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    aria-label={`Edit ${label.name}`} onClick={() => setEditing(label)}>
                    <Pencil className="size-4" />
                  </button>
                  <button type="button" className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Delete ${label.name}`} onClick={() => setDeleting(label)}>
                    <Trash2 className="size-4" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {canManage && editing && (
        <LabelForm workspaceSlug={workspaceSlug} projectId={projectId} label={editing} onClose={closeEditor} />
      )}
      {canManage && deleting && (
        <ConfirmDeleteModal
          title="Delete label?"
          description={`“${deleting.name}” will be removed from this project and its tasks.`}
          confirmLabel="Delete label"
          pending={isDeleting}
          error={deleteError ? projectErrorText(deleteError, 'Could not delete the label.') : undefined}
          onClose={closeDelete}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}
