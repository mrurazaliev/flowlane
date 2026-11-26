import { Suspense } from "react";
import { WorkspaceShell } from "./workspace-shell";

// Слоты сайдбара читают slug из URL (useParams). В Next.js 16 с cacheComponents
// такие компоненты обязательно оборачиваются в <Suspense>.
export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <WorkspaceShell>{children}</WorkspaceShell>
    </Suspense>
  );
}
