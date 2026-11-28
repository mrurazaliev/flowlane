<<<<<<< HEAD
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
=======
"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { isAxiosError } from "axios";
import { useLabels } from "@/shared/api/lookups";
import { errorText } from "@/shared/lib/errors";
import { Button } from "@/shared/ui/button";
import { ErrorBanner, Input } from "@/shared/ui/form";
import { useAddLabelMutation, useDeleteLabelMutation, useEditLabelMutation } from "../labels-api";

const DEFAULT_COLOR = "#4F46E5";

const apiError = (error: unknown) =>
  error ? errorText(isAxiosError(error) ? error.response?.data : undefined, "Something went wrong. Try again.") : null;

/** D2.10 Метки проекта: список, создание, переименование, смена цвета, удаление */
export function LabelsSettings({ workspaceSlug, projectId }: { workspaceSlug: string; projectId: string }) {
  const { data: labels, isLoading } = useLabels(workspaceSlug, projectId);
  const addLabel = useAddLabelMutation(workspaceSlug, projectId);
  const editLabel = useEditLabelMutation(workspaceSlug, projectId);
  const deleteLabel = useDeleteLabelMutation(workspaceSlug, projectId);

  // Новый лейбл
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);

  // Редактирование и удаление
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState(DEFAULT_COLOR);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    await addLabel.mutateAsync({ name: trimmed, color });
    setName("");
    setColor(DEFAULT_COLOR);
  };

  const startEdit = (id: string, currentName: string, currentColor: string) => {
    setEditingId(id);
    setEditName(currentName);
    setEditColor(currentColor);
    setConfirmDeleteId(null);
  };

  const saveEdit = async () => {
    const trimmed = editName.trim();
    if (!editingId || !trimmed) return;
    await editLabel.mutateAsync({ labelId: editingId, name: trimmed, color: editColor });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    await deleteLabel.mutateAsync(id);
    setConfirmDeleteId(null);
  };

  const error = apiError(addLabel.error) ?? apiError(editLabel.error) ?? apiError(deleteLabel.error);

  return (
    <div className="space-y-4">
      <ErrorBanner>{error}</ErrorBanner>

      {/* Новый лейбл */}
      <form onSubmit={handleAdd} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-4">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          aria-label="Label color"
          className="size-10 cursor-pointer rounded-md border border-gray-200 p-1"
        />
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New label name, e.g. Bug"
          maxLength={50}
          aria-label="Label name"
          className="flex-1"
        />
        <Button type="submit" disabled={addLabel.isPending || !name.trim()}>
          <Plus className="size-4" /> {addLabel.isPending ? "Adding..." : "Add label"}
        </Button>
      </form>

      {/* Список */}
      {isLoading ? (
        <p className="text-sm text-muted">Loading labels...</p>
      ) : labels.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-muted">
          No labels yet. Create the first one above, for example Bug or Feature.
        </p>
>>>>>>> main
      ) : (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {labels.map((label) => (
            <li key={label.id} className="flex items-center gap-3 px-4 py-3">
<<<<<<< HEAD
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
=======
              {editingId === label.id ? (
                // Режим редактирования
                <>
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    aria-label="Label color"
                    className="size-8 cursor-pointer rounded-md border border-gray-200 p-0.5"
                  />
                  <Input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void saveEdit();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    maxLength={50}
                    aria-label="Label name"
                    className="h-9 flex-1"
                  />
                  <button
                    onClick={() => void saveEdit()}
                    disabled={editLabel.isPending || !editName.trim()}
                    className="rounded p-1.5 text-[#3a9a6b] hover:bg-gray-100"
                    aria-label="Save"
                  >
                    <Check className="size-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Cancel"
                  >
                    <X className="size-4" />
                  </button>
                </>
              ) : confirmDeleteId === label.id ? (
                // Подтверждение удаления
                <>
                  <span className="size-3 rounded-full" style={{ backgroundColor: label.color }} />
                  <span className="flex-1 text-sm text-gray-900">
                    Delete <b>{label.name}</b>? It will be removed from all tasks.
                  </span>
                  <Button size="sm" variant="danger" onClick={() => void handleDelete(label.id)} disabled={deleteLabel.isPending}>
                    {deleteLabel.isPending ? "Deleting..." : "Delete"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId(null)}>
                    Cancel
                  </Button>
                </>
              ) : (
                // Обычный вид
                <>
                  <span className="size-3 rounded-full" style={{ backgroundColor: label.color }} />
                  <span className="text-sm text-gray-900">{label.name}</span>
                  <div className="ml-auto flex gap-1">
                    <button
                      onClick={() => startEdit(label.id, label.name, label.color)}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      aria-label={`Edit ${label.name}`}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => {
                        setConfirmDeleteId(label.id);
                        setEditingId(null);
                      }}
                      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Delete ${label.name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </>
>>>>>>> main
              )}
            </li>
          ))}
        </ul>
      )}
<<<<<<< HEAD

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
=======
>>>>>>> main
    </div>
  )
}
