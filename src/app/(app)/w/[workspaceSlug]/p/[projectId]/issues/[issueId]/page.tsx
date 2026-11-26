import { Suspense } from "react";
import { IssueDetail } from "@/features/issues";
import { PageSkeleton } from "@/shared/ui/page";

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <IssueDetail />
    </Suspense>
  );
}
