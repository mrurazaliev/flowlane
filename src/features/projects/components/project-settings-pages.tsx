"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useProject } from "@/shared/api/lookups";
import { cn } from "@/shared/lib/utils";
import { GeneralSettings } from "./general-settings";
import { LabelsSettings } from "./labels-settings";
import { ProjectMembersSettings } from "./project-members-settings";
import { StatesSettings } from "./states-settings";

function useProjectParams() {
  return useParams<{ workspaceSlug: string; projectId: string }>();
}

/** Меню настроек проекта: General & members / States / Labels */
function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { workspaceSlug, projectId } = useProjectParams();
  const pathname = usePathname();
  const base = `/w/${workspaceSlug}/p/${projectId}/settings`;
  const links = [
    { href: base, label: "General & members" },
    { href: `${base}/states`, label: "States" },
    { href: `${base}/labels`, label: "Labels" },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 md:flex-row md:px-7">
      <nav className="flex shrink-0 gap-1 overflow-x-auto md:w-48 md:flex-col md:gap-0.5">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "block shrink-0 rounded-lg px-3 py-2 text-sm",
              pathname === link.href ? "bg-indigo-50 font-medium text-indigo-700" : "text-gray-600 hover:bg-gray-100",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="min-w-0 max-w-3xl flex-1">{children}</div>
    </div>
  );
}

/** D2.8 /w/:slug/p/:projectId/settings */
export function ProjectSettingsPage() {
  const { workspaceSlug, projectId } = useProjectParams();
  const { data: project } = useProject(workspaceSlug, projectId);

  return (
    <SettingsLayout>
      {project ? (
        <div className="space-y-8">
          <GeneralSettings project={project} workspaceSlug={workspaceSlug} />
          <section>
            <h2 className="mb-3 text-base font-semibold text-gray-900">Members</h2>
            <ProjectMembersSettings workspaceSlug={workspaceSlug} projectId={projectId} />
          </section>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Project not found</p>
      )}
    </SettingsLayout>
  );
}

/** D2.9 .../settings/states */
export function StatesSettingsPage() {
  const { workspaceSlug, projectId } = useProjectParams();
  return (
    <SettingsLayout>
      <StatesSettings workspaceSlug={workspaceSlug} projectId={projectId} />
    </SettingsLayout>
  );
}

/** D2.10 .../settings/labels */
export function LabelsSettingsPage() {
  const { workspaceSlug, projectId } = useProjectParams();
  return (
    <SettingsLayout>
      <LabelsSettings workspaceSlug={workspaceSlug} projectId={projectId} />
    </SettingsLayout>
  );
}
