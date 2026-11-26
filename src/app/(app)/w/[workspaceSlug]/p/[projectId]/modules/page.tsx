import { Suspense } from "react";
import { ModuleList } from "@/features/planning";
import { PageSkeleton } from "@/shared/ui/page";

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ModuleList />
    </Suspense>
  );
}
