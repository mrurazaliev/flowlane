import { Suspense } from "react";
import { StatesSettingsPage } from "@/features/projects";
import { PageSkeleton } from "@/shared/ui/page";

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <StatesSettingsPage />
    </Suspense>
  );
}
