"use client";

import { useParams } from "next/navigation";
import { UserMenu } from "@/features/auth";
import { NotificationsLink } from "@/features/notifications";
import { ProjectNav } from "@/features/projects";
import { WorkspaceNav, WorkspaceSwitcher } from "@/features/workspaces";
import { AppShell } from "@/shared/layout/app-shell";

/** Собирает сайдбар из слотов разных фич (SHARED, app/) */
export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();

  return (
    <AppShell
      switcher={<WorkspaceSwitcher workspaceSlug={workspaceSlug} />}
      nav={
        <>
          <NotificationsLink workspaceSlug={workspaceSlug} />
          <WorkspaceNav workspaceSlug={workspaceSlug} />
        </>
      }
      projects={<ProjectNav workspaceSlug={workspaceSlug} />}
      userMenu={<UserMenu />}
    >
      {children}
    </AppShell>
  );
}
