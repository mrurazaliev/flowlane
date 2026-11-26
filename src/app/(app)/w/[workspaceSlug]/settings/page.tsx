import { Suspense } from "react";
import { WorkspaceSettings } from "@/features/workspaces";
import { PageSkeleton } from "@/shared/ui/page";

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <WorkspaceSettings />
    </Suspense>
  );
}
