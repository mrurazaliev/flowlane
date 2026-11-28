"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/shared/ui/logo";
import { useT } from "@/shared/lib/i18n";
import { cn } from "@/shared/lib/utils";

interface AppShellProps {
  switcher: React.ReactNode;
  nav: React.ReactNode;
  projects: React.ReactNode;
  userMenu: React.ReactNode;
  topBar?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ switcher, nav, projects, userMenu, topBar, children }: AppShellProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="flex h-dvh overflow-hidden">
      {open && <div className="fixed inset-0 z-40 bg-asphalt/40 md:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-line bg-side px-3 py-4 text-side-text transition-transform md:static md:w-[252px] md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-2 pb-[18px]">
          <Logo />
          <button className="rounded-lg p-1.5 text-faint hover:text-ink md:hidden" onClick={() => setOpen(false)} aria-label={t("Close menu")}>
            <X className="size-5" />
          </button>
        </div>
        {switcher}
        <nav className="mt-3.5 space-y-0.5">{nav}</nav>
        <div className="mt-6 flex min-h-0 flex-1 flex-col">{projects}</div>
        <div className="border-t border-line pt-2">{userMenu}</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-line bg-side px-4 py-3 text-ink md:hidden">
          <button onClick={() => setOpen(true)} aria-label={t("Open menu")} className="-ml-1 rounded-lg p-1">
            <Menu className="size-5" />
          </button>
          <Logo />
        </header>
        {topBar}
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
