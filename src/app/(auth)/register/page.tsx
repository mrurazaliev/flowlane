import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth";

export const metadata: Metadata = { title: "Sign up · Flowlane" };

export default function RegisterPage() {
  return <RegisterForm />;
}
