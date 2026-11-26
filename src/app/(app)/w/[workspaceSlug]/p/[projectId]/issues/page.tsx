import { Suspense } from "react";
import { IssuesPage } from "@/features/issues";
import { PageSkeleton } from "@/shared/ui/page";

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <IssuesPage />
    </Suspense>
  );
}
