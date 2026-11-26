"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { FieldError, FieldHint, Input, Label, Textarea } from "@/shared/ui/form";
import { Modal } from "@/shared/ui/modal";

export function CreateCycleModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New cycle"
      icon={<RefreshCw className="size-5 text-indigo-600" />}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="create-cycle-form">
            Create cycle
          </Button>
        </>
      }
    >
      <form id="create-cycle-form" className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <Label htmlFor="cycle-name">Name *</Label>
          <Input id="cycle-name" placeholder="Sprint 4" autoFocus />
          <FieldError />
        </div>
        <div>
          <Label htmlFor="cycle-description">Description</Label>
          <Textarea id="cycle-description" placeholder="Goals of this cycle" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cycle-start">Start date</Label>
            <Input id="cycle-start" type="date" />
          </div>
          <div>
            <Label htmlFor="cycle-end">End date</Label>
            <Input id="cycle-end" type="date" />
          </div>
        </div>
        {/* Позже: Zod — "End date must be after start date" */}
        <FieldError />
        <FieldHint>Dates are optional. Each task can belong to only one cycle.</FieldHint>
      </form>
    </Modal>
  );
}
