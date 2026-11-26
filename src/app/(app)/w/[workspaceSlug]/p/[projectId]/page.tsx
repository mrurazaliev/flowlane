import { Suspense } from "react";
import { Board } from "@/features/issues";
import { PageSkeleton } from "@/shared/ui/page";

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Board />
    </Suspense>
  );
}
