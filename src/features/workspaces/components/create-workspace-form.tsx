'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { Button } from '@/shared/ui/button'
import { ErrorBanner, FieldError, FieldHint, Input, Label } from '@/shared/ui/form'
import { useAddWorkspace } from '../api'
import { workspaceErrorText, workspaceFormSchema, type WorkspaceFormData } from '../workspace-form'
import { useT } from "@/shared/lib/i18n";

export function CreateWorkspaceForm() {
  const t = useT();
  const router = useRouter()
  const createWorkspace = useAddWorkspace()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<WorkspaceFormData>({ resolver: zodResolver(workspaceFormSchema) })

  async function onSubmit(input: WorkspaceFormData) {
    try {
      const workspace = await createWorkspace.mutateAsync(input)
      router.push(`/w/${workspace.slug}/projects`)
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        setError(
          'slug',
          { type: 'server', message: t("This workspace URL is already taken") },
          { shouldFocus: true },
        )
        return
      }

      setError('root.server', {
        type: 'server',
        message: workspaceErrorText(error, t("Could not create the workspace. Please try again.")),
      })
    }
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-base font-semibold text-gray-900">{t("Create new workspace")}</h2>
      <p className="mt-1 text-sm text-gray-500">{t("A shared space for your team and its projects.")}</p>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {errors.root?.server?.message && (
          <div role="alert">
            <ErrorBanner>{errors.root.server.message}</ErrorBanner>
          </div>
        )}

        <div>
          <Label htmlFor="ws-name">{t("Workspace name")}</Label>
          <Input
            id="ws-name"
            placeholder={t("Acme Corp")}
            readOnly={isSubmitting}
            invalid={!!errors.name}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'ws-name-error' : undefined}
            {...register('name')}
          />
          {errors.name && (
            <div id="ws-name-error"><FieldError>{errors.name.message}</FieldError></div>
          )}
        </div>

        <div>
          <Label htmlFor="ws-slug">{t("Workspace URL")}</Label>
          <div className="flex items-center rounded-md border border-gray-200 bg-gray-50 pl-3 focus-within:border-indigo-500">
            <span className="text-sm text-gray-400">flowlane.app/</span>
            <input
              id="ws-slug"
              placeholder={t("acme-corp")}
              className="h-10 flex-1 bg-transparent px-1 text-sm outline-none"
              readOnly={isSubmitting}
              aria-invalid={!!errors.slug}
              aria-describedby="ws-slug-feedback"
              {...register('slug')}
            />
          </div>
          <div id="ws-slug-feedback" aria-live="polite">
            {errors.slug ? (
              <FieldError>{errors.slug.message}</FieldError>
            ) : (
              <FieldHint>{t("Lowercase letters, digits and hyphens only")}</FieldHint>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? t("Creating workspace...") : t("Create workspace")}
        </Button>
      </form>
    </section>
  )
}
