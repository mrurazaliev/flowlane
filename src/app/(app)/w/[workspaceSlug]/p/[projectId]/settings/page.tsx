import { Suspense } from "react";
import { ProjectSettingsPage } from "@/features/projects";
import { PageSkeleton } from "@/shared/ui/page";

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProjectSettingsPage />
    </Suspense>
  );
}
