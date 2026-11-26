"use client";

import { useParams } from "next/navigation";
import { LogOut, Trash2 } from "lucide-react";
import { useWorkspace, useWorkspaceMembers } from "@/shared/api/lookups";
import { Button } from "@/shared/ui/button";
import { Input, Label, Select } from "@/shared/ui/form";
import { PageHeader } from "@/shared/ui/page";

/**
 * D2.3 Настройки workspace /w/:slug/settings.
 * Позже: PATCH/DELETE ws, POST ws/leave, POST ws/transfer-ownership. Редактируют только owner/admin,
 * удаление — через ConfirmDialog.
 */
export function WorkspaceSettings() {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const { data: workspace } = useWorkspace(workspaceSlug);
  const { data: members } = useWorkspaceMembers(workspaceSlug);

  if (!workspace) return <p className="p-6 text-sm text-gray-500">Workspace not found</p>;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-7">
      <PageHeader title="Workspace settings" description={workspace.name} />

      <div className="max-w-3xl space-y-6">
        <form className="space-y-4 rounded-xl border border-gray-200 bg-white p-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <Label htmlFor="ws-name">Workspace name</Label>
            <Input id="ws-name" defaultValue={workspace.name} />
          </div>
          <div>
            <Label htmlFor="ws-slug">URL</Label>
            <Input id="ws-slug" value={`flowlane.app/${workspace.slug}`} readOnly className="bg-gray-50 text-gray-500" />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save changes</Button>
          </div>
        </form>

        <section className="space-y-4 rounded-xl border border-red-200 bg-white p-6">
          <h2 className="text-base font-semibold text-red-700">Danger zone</h2>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="new-owner">Transfer ownership (owner only)</Label>
              <Select id="new-owner" defaultValue="">
                <option value="" disabled>
                  Select a member…
                </option>
                {members
                  .filter((m) => m.role !== "owner")
                  .map((m) => (
                    <option key={m.user_id} value={m.user_id}>
                      {m.user.display_name}
                    </option>
                  ))}
              </Select>
            </div>
            <Button variant="secondary">Transfer</Button>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-600">Leave this workspace (not available for the owner)</p>
            <Button variant="secondary">
              <LogOut className="size-4" /> Leave
            </Button>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-600">Delete the workspace and all its projects (owner only)</p>
            <Button variant="danger">
              <Trash2 className="size-4" /> Delete workspace
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
