"use client";

import { useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useMe } from "@/features/auth";
import type { Workspace } from "@/shared/api/types";
import { Button } from "@/shared/ui/button";
import { ErrorBanner, FieldError, FieldHint, Input, Label } from "@/shared/ui/form";
import { PageHeader } from "@/shared/ui/page";
import {
  useDeleteWorkspaceMutation,
  useUpdateWorkspaceMutation,
  useWorkspaceMembersQuery,
  useWorkspaceQuery,
} from "../api";
import { workspaceErrorText, workspaceFormSchema, type WorkspaceFormData } from "../workspace-form";
import { ConfirmDeleteModal } from "./confirm-delete-modal";

/** D2.3 Workspace settings at /w/:workspaceSlug/settings. */
export function WorkspaceSettings() {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const workspaceQuery = useWorkspaceQuery(workspaceSlug);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-7">
      <PageHeader title="Workspace settings" description={workspaceQuery.data?.name} />

      {workspaceQuery.isPending && <p role="status" className="text-sm text-gray-500">Loading workspace…</p>}

      {workspaceQuery.isError && (
        <div className="max-w-3xl space-y-3">
          <div role="alert">
            <ErrorBanner>{workspaceErrorText(workspaceQuery.error, "Could not load workspace settings.")}</ErrorBanner>
          </div>
          <Button variant="secondary" disabled={workspaceQuery.isFetching} onClick={() => void workspaceQuery.refetch()}>
            Try again
          </Button>
        </div>
      )}

      {workspaceQuery.isSuccess && (
        <WorkspaceSettingsContent key={workspaceSlug} workspace={workspaceQuery.data} />
      )}
    </div>
  );
}

function WorkspaceSettingsContent({ workspace }: { workspace: Workspace }) {
  const router = useRouter();
  const { data: me } = useMe();
  const { data: members } = useWorkspaceMembersQuery(workspace.slug);
  const updateWorkspace = useUpdateWorkspaceMutation(workspace.slug);
  const { mutate: deleteWorkspace, isPending: isDeleting, error: deleteError, reset: resetDelete } =
    useDeleteWorkspaceMutation(workspace.slug);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isOwner = workspace.owner_id === me?.id;
  const canEdit = isOwner || members?.some((member) => member.user_id === me?.id && member.role === "admin");

  const {
    register, handleSubmit, reset, setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceFormSchema),
    values: { name: workspace.name, slug: workspace.slug },
    resetOptions: { keepDirtyValues: true },
  });

  const closeDelete = useCallback(() => {
    if (isDeleting) return;
    setDeleteOpen(false);
    resetDelete();
  }, [isDeleting, resetDelete]);

  async function onSubmit(input: WorkspaceFormData) {
    if (!canEdit) return;

    if (input.name === workspace.name && input.slug === workspace.slug) {
      reset(input);
      return;
    }

    try {
      const updated = await updateWorkspace.mutateAsync({
        name: input.name === workspace.name ? undefined : input.name,
        slug: input.slug === workspace.slug ? undefined : input.slug,
      });
      reset({ name: updated.name, slug: updated.slug });
      if (updated.slug !== workspace.slug) {
        router.replace(`/w/${updated.slug}/settings`);
      }
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        setError("slug", { type: "server", message: "This workspace URL is already taken" }, { shouldFocus: true });
        return;
      }

      setError("root.server", {
        type: "server",
        message: workspaceErrorText(error, "Could not save the workspace. Please try again."),
      });
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <form className="space-y-4 rounded-xl border border-gray-200 bg-white p-6" onSubmit={handleSubmit(onSubmit)}>
        {errors.root?.server?.message && (
          <div role="alert"><ErrorBanner>{errors.root.server.message}</ErrorBanner></div>
        )}

        <div>
          <Label htmlFor="ws-name">Workspace name</Label>
          <Input
            id="ws-name"
            readOnly={!canEdit || isSubmitting || isDeleting}
            invalid={!!errors.name}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "ws-name-error" : undefined}
            {...register("name")}
          />
          {errors.name && <div id="ws-name-error"><FieldError>{errors.name.message}</FieldError></div>}
        </div>

        <div>
          <Label htmlFor="ws-slug">Workspace URL</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">/w/</span>
            <Input
              id="ws-slug"
              readOnly={!canEdit || isSubmitting || isDeleting}
              invalid={!!errors.slug}
              aria-invalid={!!errors.slug}
              aria-describedby="ws-slug-feedback"
              {...register("slug")}
            />
          </div>
          <div id="ws-slug-feedback" aria-live="polite">
            {errors.slug ? (
              <FieldError>{errors.slug.message}</FieldError>
            ) : (
              <FieldHint>Lowercase letters, digits and hyphens only</FieldHint>
            )}
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center justify-end gap-3">
            {updateWorkspace.isSuccess && !isDirty && <p role="status" className="text-sm text-gray-500">Changes saved.</p>}
            <Button type="submit" disabled={!isDirty || isSubmitting || isDeleting}>
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </div>
        )}
      </form>

      {isOwner && (
        <section className="space-y-4 rounded-xl border border-red-200 bg-white p-6">
          <h2 className="text-base font-semibold text-red-700">Danger zone</h2>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600">Permanently delete this workspace and all its projects.</p>
            <Button variant="danger" disabled={isSubmitting} onClick={() => setDeleteOpen(true)}>
              <Trash2 className="size-4" /> Delete workspace
            </Button>
          </div>
        </section>
      )}

      {deleteOpen && (
        <ConfirmDeleteModal
          title="Delete workspace?"
          description={`“${workspace.name}” and its projects will be permanently deleted.`}
          confirmLabel="Delete workspace"
          pending={isDeleting}
          error={deleteError ? workspaceErrorText(deleteError, "Could not delete the workspace.") : undefined}
          onClose={closeDelete}
          onConfirm={() => deleteWorkspace(undefined, { onSuccess: () => router.replace("/workspaces") })}
        />
      )}
    </div>
  );
}
