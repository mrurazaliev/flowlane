"use client";

import { useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/shared/ui/button";
import { ErrorBanner, FieldError, FieldHint, Input, Label, Select } from "@/shared/ui/form";
import { Modal } from "@/shared/ui/modal";
import { useAddWorkspaceMemberMutation } from "../api";
import { assignableWorkspaceRoles, workspaceErrorText } from "../workspace-form";

const addMemberSchema = z.object({
  user_id: z.string().trim().uuid("Enter a valid user ID (UUID)"),
  role: z.enum(assignableWorkspaceRoles),
});

type AddMemberFormData = z.infer<typeof addMemberSchema>;

export function AddMemberModal({ workspaceSlug, onClose }: { workspaceSlug: string; onClose: () => void }) {
  const addMember = useAddWorkspaceMemberMutation(workspaceSlug);
  const {
    register, handleSubmit, setError,
    formState: { errors, isSubmitting },
  } = useForm<AddMemberFormData>({ resolver: zodResolver(addMemberSchema), defaultValues: { role: "member" } });

  const close = useCallback(() => {
    if (!isSubmitting) onClose();
  }, [isSubmitting, onClose]);

  async function onSubmit(input: AddMemberFormData) {
    try {
      await addMember.mutateAsync(input);
      onClose();
    } catch (error) {
      setError("root.server", {
        type: "server",
        message: workspaceErrorText(error, "Could not add the member. Please try again."),
      });
    }
  }

  return (
    <Modal
      open
      title="Add workspace member"
      icon={<UserPlus className="size-5 text-indigo-600" />}
      onClose={close}
      footer={
        <>
          <Button variant="secondary" disabled={isSubmitting} onClick={close}>Cancel</Button>
          <Button type="submit" form="add-member-form" disabled={isSubmitting}>
            {isSubmitting ? "Adding…" : "Add member"}
          </Button>
        </>
      }
    >
      <form id="add-member-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {errors.root?.server?.message && (
          <div role="alert"><ErrorBanner>{errors.root.server.message}</ErrorBanner></div>
        )}

        <div>
          <Label htmlFor="member-user-id">User ID</Label>
          <Input
            id="member-user-id"
            autoComplete="off"
            readOnly={isSubmitting}
            invalid={!!errors.user_id}
            aria-invalid={!!errors.user_id}
            aria-describedby="member-user-id-feedback"
            {...register("user_id")}
          />
          <div id="member-user-id-feedback" aria-live="polite">
            {errors.user_id ? (
              <FieldError>{errors.user_id.message}</FieldError>
            ) : (
              <FieldHint>Enter the UUID of an existing Flowlane user.</FieldHint>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="add-member-role">Role</Label>
          <Select id="add-member-role" disabled={isSubmitting} {...register("role")}>
            {assignableWorkspaceRoles.map((role) => <option key={role} value={role}>{role}</option>)}
          </Select>
        </div>
      </form>
    </Modal>
  );
}
