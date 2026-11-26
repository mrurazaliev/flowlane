"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useProject, useProjectMembers, useWorkspace } from "@/shared/api/lookups";
import { AvatarStack } from "@/shared/ui/avatar";
import { cn } from "@/shared/lib/utils";

/** Шапка проекта: путь, название, команда и вкладки (активная — жёлтая разметка) */
export function ProjectHeader() {
  const { workspaceSlug, projectId } = useParams<{ workspaceSlug: string; projectId: string }>();
  const pathname = usePathname();
  const { data: workspace } = useWorkspace(workspaceSlug);
  const { data: project } = useProject(workspaceSlug, projectId);
  const { data: members } = useProjectMembers(workspaceSlug, projectId);

  const base = `/w/${workspaceSlug}/p/${projectId}`;
  const tabs = [
    { href: `${base}/issues`, label: "Issues" },
    { href: `${base}/board`, label: "Board" },
    { href: `${base}/cycles`, label: "Cycles" },
    { href: `${base}/modules`, label: "Modules" },
    { href: `${base}/settings`, label: "Settings" },
  ];

  return (
    <header className="border-b border-line bg-white px-4 pt-4 md:px-7">
      <p className="text-[13px] text-muted">
        {workspace?.name} / <span className="font-medium text-ink">{project?.name}</span>
      </p>
      <div className="mt-1 flex items-center gap-3">
        <h1 className="text-[22px] font-semibold tracking-tight md:text-[26px]">{project?.name ?? "Project not found"}</h1>
        {project && <span className="rounded-md border border-line px-1.5 text-xs text-muted">{project.identifier}</span>}
        <div className="ml-auto hidden md:block">
          <AvatarStack names={members.map((m) => m.user.display_name)} />
        </div>
      </div>

      <nav className="mt-3 flex gap-5 overflow-x-auto md:gap-7">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "shrink-0 border-b-[3px] pb-3 font-medium transition-colors",
                active ? "border-marking text-ink" : "border-transparent text-muted hover:text-ink",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

export function ProjectHeaderSkeleton() {
  return <div className="h-[118px] border-b border-line bg-white" />;
}
