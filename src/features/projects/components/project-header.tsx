"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useProject } from "@/shared/api/lookups";
import { cn } from "@/shared/lib/utils";

/** Шапка проекта: название + вкладки Issues / Board / Cycles / Modules / Settings */
export function ProjectHeader() {
  const { workspaceSlug, projectId } = useParams<{ workspaceSlug: string; projectId: string }>();
  const pathname = usePathname();
  const { data: project } = useProject(workspaceSlug, projectId);

  const base = `/w/${workspaceSlug}/p/${projectId}`;
  const tabs = [
    { href: `${base}/issues`, label: "Issues" },
    { href: `${base}/board`, label: "Board" },
    { href: `${base}/cycles`, label: "Cycles" },
    { href: `${base}/modules`, label: "Modules" },
    { href: `${base}/settings`, label: "Settings" },
  ];

  return (
    <header className="border-b border-gray-200 bg-white px-6 pt-4">
      <p className="text-xs text-gray-500">{project?.identifier}</p>
      <h1 className="text-xl font-semibold text-gray-900">{project?.name ?? "Project not found"}</h1>

      <nav className="mt-3 flex gap-5">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "-mb-px border-b-2 pb-2.5 text-sm font-medium",
                active ? "border-indigo-600 text-indigo-700" : "border-transparent text-gray-500 hover:text-gray-800",
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
  return <div className="h-[109px] border-b border-gray-200 bg-white" />;
}
