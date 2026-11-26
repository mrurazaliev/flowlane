"use client";

import { Boxes } from "lucide-react";
import type { ModuleStatus, User } from "@/shared/api/types";
import { Button } from "@/shared/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/shared/ui/form";
import { Modal } from "@/shared/ui/modal";
import { moduleStatusLabels } from "./module-status";

export function CreateModuleModal({ open, onClose, members }: { open: boolean; onClose: () => void; members: User[] }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New module"
      icon={<Boxes className="size-5 text-indigo-600" />}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="create-module-form">
            Create module
          </Button>
        </>
      }
    >
      <form id="create-module-form" className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <Label htmlFor="module-name">Name *</Label>
          <Input id="module-name" placeholder="Authentication" autoFocus />
          <FieldError />
        </div>
        <div>
          <Label htmlFor="module-description">Description</Label>
          <Textarea id="module-description" placeholder="What does this module cover?" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="module-status">Status</Label>
            <Select id="module-status" defaultValue="backlog">
              {(Object.keys(moduleStatusLabels) as ModuleStatus[]).map((s) => (
                <option key={s} value={s}>
                  {moduleStatusLabels[s]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="module-lead">Lead</Label>
            <Select id="module-lead" defaultValue="">
              <option value="">No lead</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.display_name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="module-start">Start date</Label>
            <Input id="module-start" type="date" />
          </div>
          <div>
            <Label htmlFor="module-target">Target date</Label>
            <Input id="module-target" type="date" />
          </div>
        </div>
      </form>
    </Modal>
  );
}
