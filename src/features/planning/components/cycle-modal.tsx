'use client'

import { useCallback } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { RefreshCw } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import type { Cycle } from '@/shared/api/types'
import { Button } from '@/shared/ui/button'
import { ErrorBanner, FieldError, FieldHint, Input, Label, Textarea } from '@/shared/ui/form'
import { Modal } from '@/shared/ui/modal'
import { useSaveCycle } from '../api'
import { cycleSchema, planningErrorText, toApiDate } from '../planning-form'

type CycleForm = z.infer<typeof cycleSchema>

export function CycleModal({ workspaceSlug, projectId, cycle, onClose, onSaved }: {
  workspaceSlug: string
  projectId: string
  cycle?: Cycle
  onClose: () => void
  onSaved?: (cycle: Cycle) => void
}) {
  const saveCycle = useSaveCycle({ workspaceSlug, projectId }, cycle?.id)
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<CycleForm>({
    resolver: zodResolver(cycleSchema),
    defaultValues: {
      name: cycle?.name ?? '',
      description: cycle?.description ?? '',
      start_date: cycle?.start_date?.slice(0, 10) ?? '',
      end_date: cycle?.end_date?.slice(0, 10) ?? '',
    },
  })

  const close = useCallback(() => {
    if (!isSubmitting) onClose()
  }, [isSubmitting, onClose])

  async function onSubmit({ name, description, start_date, end_date }: CycleForm) {
    try {
      const savedCycle = await saveCycle.mutateAsync({
        name,
        description: description || (cycle ? null : undefined),
        start_date: toApiDate(start_date),
        end_date: toApiDate(end_date, true),
      })
      onSaved?.(savedCycle)
      onClose()
    } catch (error) {
      setError('root.server', { message: planningErrorText(error, 'Could not save the cycle.') })
    }
  }

  return (
    <Modal
      open
      onClose={close}
      title={cycle ? 'Edit cycle' : 'New cycle'}
      icon={<RefreshCw className="size-5 text-indigo-600" />}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" form="cycle-form" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : cycle ? 'Save changes' : 'Create cycle'}
          </Button>
        </>
      }
    >
      <form id="cycle-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {errors.root?.server?.message && <div role="alert"><ErrorBanner>{errors.root.server.message}</ErrorBanner></div>}
        <div>
          <Label htmlFor="cycle-name">Name *</Label>
          <Input id="cycle-name" placeholder="Sprint 4" maxLength={255} readOnly={isSubmitting}
            invalid={!!errors.name} aria-invalid={!!errors.name} {...register('name')} />
          <FieldError>{errors.name?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="cycle-description">Description</Label>
          <Textarea id="cycle-description" placeholder="Goals of this cycle" maxLength={10000}
            readOnly={isSubmitting} {...register('description')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cycle-start">Start date</Label>
            <Input id="cycle-start" type="date" readOnly={isSubmitting}
              invalid={!!errors.start_date} aria-invalid={!!errors.start_date} {...register('start_date')} />
            <FieldError>{errors.start_date?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="cycle-end">End date</Label>
            <Input id="cycle-end" type="date" readOnly={isSubmitting}
              invalid={!!errors.end_date} aria-invalid={!!errors.end_date} {...register('end_date')} />
            <FieldError>{errors.end_date?.message}</FieldError>
          </div>
        </div>
        <FieldHint>Dates are optional. Each task can belong to only one cycle.</FieldHint>
      </form>
    </Modal>
  )
}
