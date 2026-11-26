import { Suspense } from "react";
import { CycleList } from "@/features/planning";
import { PageSkeleton } from "@/shared/ui/page";

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CycleList />
    </Suspense>
  );
}
