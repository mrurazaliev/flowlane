import { Suspense } from "react";
import { AcceptInvite } from "@/features/workspaces";
import { PageSkeleton } from "@/shared/ui/page";

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AcceptInvite />
    </Suspense>
  );
}
