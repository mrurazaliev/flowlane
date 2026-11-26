"use client";

import { UserPlus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { FieldError, FieldHint, Input, Label, Select } from "@/shared/ui/form";
import { Modal } from "@/shared/ui/modal";

/** Приглашение по email. Позже: POST /workspaces/:slug/invites */
export function InviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invite people"
      icon={<UserPlus className="size-5 text-indigo-600" />}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="invite-form">
            Send invite
          </Button>
        </>
      }
    >
      <form id="invite-form" className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <Label htmlFor="invite-email">Email *</Label>
          <Input id="invite-email" type="email" placeholder="colleague@company.com" autoFocus />
          <FieldError />
        </div>
        <div>
          <Label htmlFor="invite-role">Role</Label>
          <Select id="invite-role" defaultValue="member">
            <option value="admin">Admin — manages members and settings</option>
            <option value="member">Member — creates and edits tasks</option>
            <option value="guest">Guest — can view, cannot edit</option>
          </Select>
          <FieldHint>The invite link is valid for 7 days.</FieldHint>
        </div>
      </form>
    </Modal>
  );
}
