'use client'

import { useCallback, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import type { State, StateGroup } from '@/shared/api/types'
import { Button } from '@/shared/ui/button'
import { ErrorBanner, FieldError, Input, Label, Select } from '@/shared/ui/form'
import { Modal } from '@/shared/ui/modal'
import { useDeleteProjectState, useSaveProjectState } from '../api'
import { projectErrorText, projectStateSchema, stateGroups } from '../project-form'
import { useT } from "@/shared/lib/i18n";

type StateForm = z.infer<typeof projectStateSchema>

export const stateGroupLabels: Record<StateGroup, string> = {
  backlog: 'Backlog',
  unstarted: 'Unstarted',
  started: 'Started',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function StateModal({ workspaceSlug, projectId, state, group, order, onClose }: {
  workspaceSlug: string
  projectId: string
  state?: State
  group: StateGroup
  order: number
  onClose: () => void
}) {
  const t = useT();
  const save = useSaveProjectState(workspaceSlug, projectId)
  const { register, handleSubmit, setError, formState: { errors, isDirty, isSubmitting } } = useForm<StateForm>({
    resolver: zodResolver(projectStateSchema),
    defaultValues: {
      name: state?.name ?? '',
      color: state?.color ?? '#4f46e5',
      group: state?.group ?? group,
      order: state?.order ?? order,
      is_default: state?.is_default ?? false,
    },
  })
  const close = useCallback(() => {
    if (!isSubmitting) onClose()
  }, [isSubmitting, onClose])

  async function onSubmit(values: StateForm) {
    try {
      if (state) {
        await save.mutateAsync({
          stateId: state.id,
          payload: {
            name: values.name === state.name ? undefined : values.name,
            color: values.color === state.color ? undefined : values.color,
            group: values.group === state.group ? undefined : values.group,
            order: values.order === state.order ? undefined : values.order,
            is_default: values.is_default === state.is_default && values.group === state.group
              ? undefined : values.is_default,
          },
        })
      } else {
        await save.mutateAsync({ payload: values })
      }
      onClose()
    } catch (error) {
      setError('root.server', { message: projectErrorText(error, t("Could not save the status.")) })
    }
  }

  return (
    <Modal
      open
      title={state ? t("Edit status") : t("New status")}
      onClose={close}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={isSubmitting}>{t("Cancel")}</Button>
          <Button type="submit" form="project-state-form" disabled={isSubmitting || (!!state && !isDirty)}>
            {isSubmitting ? t("Saving…") : state ? t("Save changes") : t("Add status")}
          </Button>
        </>
      }
    >
      <form id="project-state-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {errors.root?.server?.message && <div role="alert"><ErrorBanner>{errors.root.server.message}</ErrorBanner></div>}
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <Label htmlFor="state-name">{t("Name")} *</Label>
            <Input id="state-name" maxLength={50} placeholder={t("In review")} readOnly={isSubmitting}
              invalid={!!errors.name} aria-invalid={!!errors.name} {...register('name')} />
            <FieldError>{errors.name?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="state-color">{t("Color")}</Label>
            <Input id="state-color" type="color" className="w-14 cursor-pointer p-1" disabled={isSubmitting}
              invalid={!!errors.color} aria-invalid={!!errors.color} {...register('color')} />
            <FieldError>{errors.color?.message}</FieldError>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="state-group">{t("Group")}</Label>
            <Select id="state-group" disabled={isSubmitting} {...register('group')}>
              {stateGroups.map((item) => <option key={item} value={item}>{t(stateGroupLabels[item])}</option>)}
            </Select>
            <FieldError>{errors.group?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="state-order">{t("Board order")}</Label>
            <Input id="state-order" type="number" min={0} max={2147483647} step={1} readOnly={isSubmitting}
              invalid={!!errors.order} aria-invalid={!!errors.order} {...register('order', { valueAsNumber: true })} />
            <FieldError>{errors.order?.message}</FieldError>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" className="size-4 accent-indigo-600" disabled={isSubmitting} {...register('is_default')} />
          {t("Default status for this group")}
        </label>
      </form>
    </Modal>
  )
}

export function DeleteStateModal({ workspaceSlug, projectId, state, states, onClose }: {
  workspaceSlug: string
  projectId: string
  state: State
  states: State[]
  onClose: () => void
}) {
  const t = useT();
  const [transferToStateId, setTransferToStateId] = useState('')
  const remove = useDeleteProjectState(workspaceSlug, projectId)
  const destinations = states.filter((item) => item.id !== state.id)
  const selected = destinations.find((item) => item.id === transferToStateId)
  const canDelete = destinations.length === 0 || !!selected
  const close = useCallback(() => {
    if (!remove.isPending) onClose()
  }, [remove.isPending, onClose])

  function handleDelete() {
    if (!canDelete || remove.isPending) return
    remove.mutate({ stateId: state.id, transferToStateId: selected?.id ?? '' }, { onSuccess: onClose })
  }

  return (
    <Modal
      open
      onClose={close}
      title={t("Delete status “{name}”", { name: state.name })}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={remove.isPending}>{t("Cancel")}</Button>
          <Button variant="danger" onClick={handleDelete} disabled={remove.isPending || !canDelete}>
            {remove.isPending ? t("Deleting…") : t("Delete status")}
          </Button>
        </>
      }
    >
      {remove.error && (
        <div role="alert" className="mb-3"><ErrorBanner>{projectErrorText(remove.error, t("Could not delete the status."))}</ErrorBanner></div>
      )}
      {destinations.length > 0 ? (
        <>
          <p className="text-sm text-muted">{t("Tasks in this status will be moved to another status.")}</p>
          <div className="mt-4">
            <Label htmlFor="move-to">{t("Move tasks to")} *</Label>
            <Select id="move-to" value={selected?.id ?? ''} onChange={(event) => setTransferToStateId(event.currentTarget.value)}
              disabled={remove.isPending}>
              <option value="" disabled>{t("Select a status…")}</option>
              {destinations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </Select>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted">{t("This is the last status. It can be deleted if it has no tasks.")}</p>
      )}
    </Modal>
  )
}
