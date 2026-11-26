"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/shared/ui/logo";
import { cn } from "@/shared/lib/utils";

interface AppShellProps {
  /** Переключатель workspace — Dev 2 */
  switcher: React.ReactNode;
  /** Ссылки workspace: уведомления, участники, настройки — Dev 2 */
  nav: React.ReactNode;
  /** Список проектов — Dev 2 */
  projects: React.ReactNode;
  /** Меню профиля — Dev 1 */
  userMenu: React.ReactNode;
  children: React.ReactNode;
}

/**
 * SHARED (F2.2): каркас приложения — тёмный сайдбар со слотами + основная область.
 * На узком экране сайдбар прячется и открывается кнопкой меню.
 */
export function AppShell({ switcher, nav, projects, userMenu, children }: AppShellProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Перешли на другую страницу — закрываем мобильное меню
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* Затемнение под мобильным меню */}
      {open && <div className="fixed inset-0 z-40 bg-asphalt/50 md:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-asphalt px-3 py-4 text-[#c9cdd4] transition-transform md:static md:w-[244px] md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-2 pb-[18px]">
          <Logo light />
          <button className="rounded-lg p-1.5 text-faint hover:text-white md:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>
        {switcher}
        <nav className="mt-3.5 space-y-0.5">{nav}</nav>
        <div className="mt-6 flex min-h-0 flex-1 flex-col">{projects}</div>
        <div className="border-t border-asphalt-line pt-2">{userMenu}</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Верхняя панель на телефоне */}
        <header className="flex items-center gap-3 bg-asphalt px-4 py-3 text-white md:hidden">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="-ml-1 rounded-lg p-1">
            <Menu className="size-5" />
          </button>
          <Logo light />
        </header>
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
