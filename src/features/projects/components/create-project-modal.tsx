"use client";

import { FolderPlus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { FieldError, FieldHint, Input, Label, Textarea } from "@/shared/ui/form";
import { Modal } from "@/shared/ui/modal";

export function CreateProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New project"
      icon={<FolderPlus className="size-5 text-indigo-600" />}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="create-project-form">
            Create project
          </Button>
        </>
      }
    >
      <form id="create-project-form" className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <Label htmlFor="project-name">Project name *</Label>
          <Input id="project-name" placeholder="e.g. Website" autoFocus />
          <FieldError />
        </div>

        <div>
          <Label htmlFor="identifier">Identifier *</Label>
          <Input id="identifier" placeholder="WEB" maxLength={10} className="uppercase" />
          <FieldHint>Uppercase letters or digits, max 10 characters. Tasks will be named WEB-1, WEB-2…</FieldHint>
        </div>

        <div>
          <Label htmlFor="project-description">Description</Label>
          <Textarea id="project-description" placeholder="What is this project about?" maxLength={500} />
        </div>
      </form>
    </Modal>
  );
}
