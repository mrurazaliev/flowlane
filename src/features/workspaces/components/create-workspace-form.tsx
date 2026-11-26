"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { FieldError, FieldHint, Input, Label } from "@/shared/ui/form";

export function CreateWorkspaceForm() {
  const router = useRouter();

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-base font-semibold text-gray-900">Create new workspace</h2>
      <p className="mt-1 text-sm text-gray-500">A shared space for your team and its projects.</p>

      <form
        className="mt-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          // Позже: createWorkspace() через API, затем переход на /{slug}
          router.push("/w/demo/projects");
        }}
      >
        <div>
          <Label htmlFor="ws-name">Workspace name</Label>
          <Input id="ws-name" placeholder="Acme Corp" />
          <FieldError />
        </div>

        <div>
          <Label htmlFor="ws-slug">Workspace URL</Label>
          <div className="flex items-center rounded-md border border-gray-200 bg-gray-50 pl-3 focus-within:border-indigo-500">
            <span className="text-sm text-gray-400">flowlane.app/</span>
            <input id="ws-slug" placeholder="acme-corp" className="h-10 flex-1 bg-transparent px-1 text-sm outline-none" />
          </div>
          <FieldHint>Lowercase letters, digits and hyphens only</FieldHint>
          {/* Позже: ошибка 409 от бэкенда → "Slug is already taken" */}
          <FieldError />
        </div>

        <Button type="submit" className="w-full">
          Create workspace
        </Button>
      </form>
    </section>
  );
}
