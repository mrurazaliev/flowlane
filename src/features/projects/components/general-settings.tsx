"use client";

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Archive, ArchiveRestore, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { ConfirmDeleteModal } from '@/features/workspaces'
import { Button } from '@/shared/ui/button'
import { ErrorBanner, FieldError, FieldHint, Input, Label, Select, Textarea } from '@/shared/ui/form'
import type { Project, WorkspaceMember } from '@/shared/api/types'
import { useDeleteProject, useEditProject } from '../api'
import { projectErrorText, projectSettingsSchema } from '../project-form'
import { useT } from "@/shared/lib/i18n";

type SettingsForm = z.infer<typeof projectSettingsSchema>

function formValues(project: Project): SettingsForm {
  return { name: project.name, description: project.description ?? '', lead_id: project.lead_id ?? '' }
}

/** D2.8 Основные настройки проекта. */
export function GeneralSettings({ project, workspaceSlug, workspaceMembers, canManage }: {
  project: Project;
  workspaceSlug: string;
  workspaceMembers: WorkspaceMember[];
  canManage: boolean;
}) {
  const t = useT();
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const update = useEditProject(workspaceSlug, project.id)
  const { mutate: remove, reset: resetDelete, isPending: isDeleting, error: deleteError } =
    useDeleteProject(workspaceSlug, project.id)
  const {
    register, handleSubmit, reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<SettingsForm>({
    resolver: zodResolver(projectSettingsSchema),
    values: formValues(project),
    resetOptions: { keepDirtyValues: true },
  })
  const isBusy = isSubmitting || update.isPending || isDeleting
  const closeDelete = useCallback(() => {
    if (isDeleting) return
    setDeleteOpen(false)
    resetDelete()
  }, [isDeleting, resetDelete])

  function onSubmit(input: SettingsForm) {
    if (!canManage || isBusy) return
    update.mutate({
      name: input.name === project.name ? undefined : input.name,
      description: input.description === (project.description ?? '') ? undefined : input.description || null,
      lead_id: input.lead_id === (project.lead_id ?? '') ? undefined : input.lead_id || null,
    }, { onSuccess: (saved) => reset(formValues(saved)) })
  }

  function handleArchive() {
    update.mutate({ is_archived: !project.is_archived })
  }

  function handleDelete() {
    remove(undefined, { onSuccess: () => router.replace(`/w/${encodeURIComponent(workspaceSlug)}/projects`) })
  }

  return (
    <div className="space-y-6">
      {update.error && (
        <div role="alert"><ErrorBanner>{projectErrorText(update.error, t("Could not update the project."))}</ErrorBanner></div>
      )}
      <form className="space-y-4 rounded-xl border border-gray-200 bg-white p-6" onSubmit={handleSubmit(onSubmit)}>
        <h2 className="text-base font-semibold text-gray-900">{t("General")}</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Label htmlFor="p-name">{t("Project name")}</Label>
            <Input id="p-name" readOnly={!canManage || isBusy} invalid={!!errors.name}
              aria-invalid={!!errors.name} {...register('name')} />
            <FieldError>{errors.name?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="p-identifier">{t("Identifier")}</Label>
            <Input id="p-identifier" value={project.identifier} readOnly />
          </div>
        </div>
        <div>
          <Label htmlFor="p-description">{t("Description")}</Label>
          <Textarea id="p-description" maxLength={500} readOnly={!canManage || isBusy}
            invalid={!!errors.description} aria-invalid={!!errors.description} {...register('description')} />
          {errors.description ? <FieldError>{errors.description.message}</FieldError> : <FieldHint>{t("Max 500 characters")}</FieldHint>}
        </div>
        <div>
          <Label htmlFor="p-lead">{t("Project lead")}</Label>
          <Select id="p-lead" disabled={!canManage || isBusy} aria-invalid={!!errors.lead_id} {...register('lead_id')}>
            <option value="">{t("No lead")}</option>
            {project.lead_id && !workspaceMembers.some((member) => member.user_id === project.lead_id) && (
              <option value={project.lead_id}>{t("Current lead")}</option>
            )}
            {workspaceMembers.map((member) => (
              <option key={member.user_id} value={member.user_id}>
                {member.user.display_name}
              </option>
            ))}
          </Select>
          <FieldError>{errors.lead_id?.message}</FieldError>
        </div>
        {canManage && (
          <div className="flex items-center justify-end gap-3">
            {update.isSuccess && !isDirty && <p role="status" className="text-sm text-muted">{t("Changes saved.")}</p>}
            <Button type="submit" disabled={!isDirty || isBusy}>
              {update.isPending && update.variables.is_archived === undefined ? t("Saving…") : t("Save changes")}
            </Button>
          </div>
        )}
      </form>

      {canManage && <section className="rounded-xl border border-red-200 bg-white p-6">
        <h2 className="text-base font-semibold text-red-700">{t("Danger zone")}</h2>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900">{project.is_archived ? t("Restore project") : t("Archive project")}</p>
            <p className="text-sm text-gray-500">{project.is_archived
              ? t("Show the project in the sidebar again.")
              : t("Hide the project from the sidebar. You can restore it later.")}</p>
          </div>
          <Button variant="secondary" disabled={isBusy} onClick={handleArchive}>
            {project.is_archived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
            {project.is_archived ? t("Restore") : t("Archive")}
          </Button>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
          <div>
            <p className="text-sm font-medium text-gray-900">{t("Delete project")}</p>
            <p className="text-sm text-gray-500">{t("All tasks, cycles and modules will be deleted.")}</p>
          </div>
          <Button variant="danger" disabled={isBusy} onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-4" /> {t("Delete")}
          </Button>
        </div>
      </section>}

      {deleteOpen && (
        <ConfirmDeleteModal
          title={t("Delete project?")}
          description={`“${project.name}” and its tasks, cycles and modules will be permanently deleted.`}
          confirmLabel={t("Delete project")}
          pending={isDeleting}
          error={deleteError ? projectErrorText(deleteError, t("Could not delete the project.")) : undefined}
          onClose={closeDelete}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}
