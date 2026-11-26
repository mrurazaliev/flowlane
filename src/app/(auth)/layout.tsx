import { AuthLayout } from "@/features/auth";

// Вход и регистрация: без сайдбара, с «дорогой» слева
export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}
