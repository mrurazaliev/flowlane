import { Logo } from "@/shared/ui/logo";

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
 * SHARED (F2.2): каркас приложения — сайдбар со слотами + основная область.
 * Сам ничего не знает о фичах: что вставить в слоты, решает роут (app/.../layout.tsx).
 */
export function AppShell({ switcher, nav, projects, userMenu, children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="px-4 pt-4">
          <Logo />
        </div>
        <div className="mx-3 mt-4">{switcher}</div>
        <div className="mt-4 space-y-0.5 px-3">{nav}</div>
        <div className="mt-6 flex min-h-0 flex-1 flex-col">{projects}</div>
        <div className="border-t border-gray-200 p-3">{userMenu}</div>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}

/** Заглушка сайдбара, пока слоты ждут параметры URL (fallback для Suspense) */
export function SidebarSkeleton() {
  return <div className="h-full" />;
}
