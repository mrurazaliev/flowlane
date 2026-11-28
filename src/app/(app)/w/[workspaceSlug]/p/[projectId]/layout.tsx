import { Suspense } from "react";
import { ProjectHeader, ProjectHeaderSkeleton } from "@/features/projects";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Suspense fallback={<ProjectHeaderSkeleton />}>
        <ProjectHeader />
      </Suspense>
      {children}
    </div>
  );
}
