'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { FolderPlus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import type { WorkspaceMember } from '@/shared/api/types'
import { Button } from '@/shared/ui/button'
import { ErrorBanner, FieldError, FieldHint, Input, Label, Select, Textarea } from '@/shared/ui/form'
import { Modal } from '@/shared/ui/modal'
import { useAddProject } from '../api'
import { createProjectSchema, projectErrorText, projectSettingsHref } from '../project-form'

type CreateProjectForm = z.infer<typeof createProjectSchema>

export function CreateProjectModal({ workspaceSlug, members, onClose }: {
  workspaceSlug: string;
  members: WorkspaceMember[];
  onClose: () => void;
}) {
  const router = useRouter()
  const createProject = useAddProject(workspaceSlug)
  const {
    register, handleSubmit, setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: '', identifier: '', description: '', lead_id: '' },
  })

  const close = useCallback(() => {
    if (!isSubmitting) onClose()
  }, [isSubmitting, onClose])

  async function onSubmit({ name, identifier, description, lead_id }: CreateProjectForm) {
    try {
      const project = await createProject.mutateAsync({
        name, identifier, description: description || undefined, lead_id: lead_id || undefined,
      })
      onClose()
      router.push(projectSettingsHref(workspaceSlug, project.id))
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        setError('identifier', {
          type: 'server',
          message: projectErrorText(error, 'This project identifier is already in use.'),
        }, { shouldFocus: true })
        return
      }

      setError('root.server', {
        type: 'server',
        message: projectErrorText(error, 'Could not create the project. Please try again.'),
      })
    }
  }

  return (
    <Modal
      open
      onClose={close}
      title="New project"
      icon={<FolderPlus className="size-5 text-indigo-600" />}
      footer={
        <>
          <Button variant="secondary" disabled={isSubmitting} onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form="create-project-form" disabled={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create project'}
          </Button>
        </>
      }
    >
      <form id="create-project-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {errors.root?.server?.message && (
          <div role="alert"><ErrorBanner>{errors.root.server.message}</ErrorBanner></div>
        )}
        <div>
          <Label htmlFor="project-name">Project name *</Label>
          <Input id="project-name" placeholder="e.g. Website" readOnly={isSubmitting} invalid={!!errors.name}
            aria-invalid={!!errors.name} {...register('name')} />
          <FieldError>{errors.name?.message}</FieldError>
        </div>

        <div>
          <Label htmlFor="identifier">Identifier *</Label>
          <Input id="identifier" placeholder="WEB" maxLength={10} className="uppercase" readOnly={isSubmitting}
            invalid={!!errors.identifier} aria-invalid={!!errors.identifier} {...register('identifier')} />
          {errors.identifier ? (
            <FieldError>{errors.identifier.message}</FieldError>
          ) : (
            <FieldHint>Letters and digits, max 10 characters. Tasks will be named WEB-1, WEB-2…</FieldHint>
          )}
        </div>

        <div>
          <Label htmlFor="project-description">Description</Label>
          <Textarea id="project-description" placeholder="What is this project about?" maxLength={500}
            readOnly={isSubmitting} invalid={!!errors.description} aria-invalid={!!errors.description}
            {...register('description')} />
          <FieldError>{errors.description?.message}</FieldError>
        </div>

        <div>
          <Label htmlFor="project-lead">Project lead</Label>
          <Select id="project-lead" disabled={isSubmitting} aria-invalid={!!errors.lead_id} {...register('lead_id')}>
            <option value="">No lead</option>
            {members.map((member) => (
              <option key={member.user_id} value={member.user_id}>{member.user.display_name}</option>
            ))}
          </Select>
          <FieldError>{errors.lead_id?.message}</FieldError>
        </div>
      </form>
    </Modal>
  )
}
