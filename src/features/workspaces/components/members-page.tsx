"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { UserPlus, X } from "lucide-react";
import type { WorkspaceRole } from "@/shared/api/types";
import { useMe } from "@/features/auth";
import { useWorkspace, useWorkspaceMembers } from "@/shared/api/lookups";
import { Avatar } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Select } from "@/shared/ui/form";
import { PageHeader } from "@/shared/ui/page";
import { InviteModal } from "./invite-modal";

const editableRoles: WorkspaceRole[] = ["admin", "member", "guest"];

/**
 * D2.4 Участники /w/:slug/members + D2.5 приглашение.
 * Позже: GET/POST ws/members, PATCH/DELETE ws/members/:userId; нельзя удалить последнего owner.
 */
export function MembersPage() {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data: workspace } = useWorkspace(workspaceSlug);
  const { data: members } = useWorkspaceMembers(workspaceSlug);
  const { data: me } = useMe();

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <PageHeader
        title="Members"
        description={workspace?.name}
        actions={
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="size-4" /> Invite
          </Button>
        }
      />

      <ul className="max-w-3xl divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {members.map((m) => {
          const isOwner = m.role === "owner";
          const isMe = m.user_id === me.id;
          return (
            <li key={m.user_id} className="flex items-center gap-3 px-4 py-3">
              <Avatar name={m.user.display_name} size="md" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {m.user.display_name} {isMe && <span className="text-gray-400">(you)</span>}
                </p>
                <p className="text-xs text-gray-500">{m.user.email}</p>
              </div>

              {/* Роль владельца и свою роль менять нельзя */}
              {isOwner || isMe ? (
                <Badge tone={isOwner ? "indigo" : "gray"}>{m.role}</Badge>
              ) : (
                <Select defaultValue={m.role} className="h-9 w-28">
                  {editableRoles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>
              )}

              {!isOwner && !isMe ? (
                <button className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove">
                  <X className="size-4" />
                </button>
              ) : (
                <span className="size-7" />
              )}
            </li>
          );
        })}
      </ul>

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
