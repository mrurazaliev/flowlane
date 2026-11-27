import { isAxiosError } from "axios";
import { z } from "zod";
import { errorText } from "@/shared/lib/errors";

export const workspaceFormSchema = z.object({
  name: z.string().trim().min(1, "Enter a workspace name").max(100, "Use at most 100 characters"),
  slug: z.string()
    .trim()
    .min(2, "Use at least 2 characters")
    .max(50, "Use at most 50 characters")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, digits and hyphens only"),
});

export type WorkspaceFormData = z.infer<typeof workspaceFormSchema>;

export const assignableWorkspaceRoles = ["admin", "member", "guest"] as const;

export function workspaceErrorText(error: unknown, fallback: string) {
  return errorText(isAxiosError(error) ? error.response?.data : undefined, fallback);
}
