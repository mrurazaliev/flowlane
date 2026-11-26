import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth";

export const metadata: Metadata = { title: "Sign up · Flowlane" };

// Позже: ?invite=<token> → регистрация сразу в workspace (D1.1)
export default function RegisterPage() {
  return <RegisterForm />;
}
