import { Suspense } from "react";
import { LabelsSettingsPage } from "@/features/projects";
import { PageSkeleton } from "@/shared/ui/page";

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LabelsSettingsPage />
    </Suspense>
  );
}
