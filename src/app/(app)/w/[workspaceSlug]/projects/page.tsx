import { Suspense } from "react";
import { ProjectsList } from "@/features/projects";
import { PageSkeleton } from "@/shared/ui/page";

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProjectsList />
    </Suspense>
  );
}
