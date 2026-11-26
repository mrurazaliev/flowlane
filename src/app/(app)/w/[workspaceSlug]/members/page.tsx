import { Suspense } from "react";
import { MembersPage } from "@/features/workspaces";
import { PageSkeleton } from "@/shared/ui/page";

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MembersPage />
    </Suspense>
  );
}
