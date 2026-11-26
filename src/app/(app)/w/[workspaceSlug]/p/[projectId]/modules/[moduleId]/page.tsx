import { Suspense } from "react";
import { ModuleDetail } from "@/features/planning";
import { PageSkeleton } from "@/shared/ui/page";

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ModuleDetail />
    </Suspense>
  );
}
