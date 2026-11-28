'use client'

import { useCallback } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Boxes } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import type { Module, ModuleStatus } from '@/shared/api/types'
import { useProjectMembers } from '@/shared/api/lookups'
import { Button } from '@/shared/ui/button'
import { ErrorBanner, FieldError, Input, Label, Select, Textarea } from '@/shared/ui/form'
import { Modal } from '@/shared/ui/modal'
import { useSaveModule } from '../api'
import { moduleSchema, planningErrorText, toApiDate } from '../planning-form'
import { useT } from "@/shared/lib/i18n";
import { moduleStatusLabels } from './module-status'

type ModuleForm = z.infer<typeof moduleSchema>

export function ModuleModal({ workspaceSlug, projectId, mod, onClose }: {
  workspaceSlug: string
  projectId: string
  mod?: Module
  onClose: () => void
}) {
  const t = useT();
  const membersQuery = useProjectMembers(workspaceSlug, projectId)
  const saveModule = useSaveModule({ workspaceSlug, projectId }, mod?.id)
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<ModuleForm>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      name: mod?.name ?? '',
      description: mod?.description ?? '',
      start_date: mod?.start_date?.slice(0, 10) ?? '',
      target_date: mod?.target_date?.slice(0, 10) ?? '',
      lead_id: mod?.lead_id ?? '',
      status: mod?.status ?? 'backlog',
    },
  })
  const hasSavedLead = mod?.lead_id && !membersQuery.data.some((member) => member.user_id === mod.lead_id)

  const close = useCallback(() => {
    if (!isSubmitting) onClose()
  }, [isSubmitting, onClose])

  async function onSubmit({ name, description, status, lead_id, start_date, target_date }: ModuleForm) {
    try {
      await saveModule.mutateAsync({
        name, status,
        description: description || (mod ? null : undefined),
        lead_id: hasSavedLead && lead_id === mod?.lead_id ? undefined : lead_id || null,
        start_date: toApiDate(start_date),
        target_date: toApiDate(target_date, true),
      })
      onClose()
    } catch (error) {
      setError('root.server', { message: planningErrorText(error, t("Could not save the module.")) })
    }
  }

  return (
    <Modal
      open
      onClose={close}
      title={mod ? t("Edit module") : t("New module")}
      icon={<Boxes className="size-5 text-indigo-600" />}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={isSubmitting}>{t("Cancel")}</Button>
          <Button type="submit" form="module-form" disabled={isSubmitting}>
            {isSubmitting ? t("Saving…") : mod ? t("Save changes") : t("Create module")}
          </Button>
        </>
      }
    >
      <form id="module-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {errors.root?.server?.message && <div role="alert"><ErrorBanner>{errors.root.server.message}</ErrorBanner></div>}
        <div>
          <Label htmlFor="module-name">{t("Name")} *</Label>
          <Input id="module-name" placeholder={t("Authentication")} maxLength={255} readOnly={isSubmitting}
            invalid={!!errors.name} aria-invalid={!!errors.name} {...register('name')} />
          <FieldError>{errors.name?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="module-description">{t("Description")}</Label>
          <Textarea id="module-description" placeholder={t("What does this module cover?")} maxLength={10000}
            readOnly={isSubmitting} {...register('description')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="module-status">{t("Status")}</Label>
            <Select id="module-status" disabled={isSubmitting} {...register('status')}>
              {(Object.keys(moduleStatusLabels) as ModuleStatus[]).map((status) => (
                <option key={status} value={status}>{t(moduleStatusLabels[status])}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="module-lead">{t("Lead")}</Label>
            <Select id="module-lead" disabled={isSubmitting} {...register('lead_id')}>
              <option value="">{t("No lead")}</option>
              {hasSavedLead && <option value={mod.lead_id ?? ''}>{t("Current lead")}</option>}
              {membersQuery.data.map((member) => (
                <option key={member.user_id} value={member.user_id}>{member.user.display_name}</option>
              ))}
            </Select>
            {membersQuery.isError && <FieldError>{t("Could not load project members.")}</FieldError>}
          </div>
          <div>
            <Label htmlFor="module-start">{t("Start date")}</Label>
            <Input id="module-start" type="date" readOnly={isSubmitting}
              invalid={!!errors.start_date} aria-invalid={!!errors.start_date} {...register('start_date')} />
            <FieldError>{errors.start_date?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="module-target">{t("Target date")}</Label>
            <Input id="module-target" type="date" readOnly={isSubmitting}
              invalid={!!errors.target_date} aria-invalid={!!errors.target_date} {...register('target_date')} />
            <FieldError>{errors.target_date?.message}</FieldError>
          </div>
        </div>
      </form>
    </Modal>
  )
}
