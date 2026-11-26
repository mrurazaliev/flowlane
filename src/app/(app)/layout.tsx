import { AuthGuard } from "@/features/auth";

// Все страницы для залогиненных пользователей: без входа — на /login
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}