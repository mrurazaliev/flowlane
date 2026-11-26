"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { ErrorBanner, FieldError, Input, Label } from "@/shared/ui/form";

/** D1.2 Вход. Позже: RHF + Zod, POST /auth/login, после входа — на страницу, куда шёл пользователь */
export function LoginForm() {
  const router = useRouter();

  return (
    <>
      <h1 className="text-[26px] font-semibold tracking-tight">Log in</h1>
      <p className="mb-7 mt-1.5 text-muted">Welcome back. Use your work email.</p>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/workspaces");
        }}
      >
        {/* Позже: <ErrorBanner>{errorText(error)}</ErrorBanner> */}
        <ErrorBanner />

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@company.com" autoComplete="email" />
          <FieldError />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" />
          <FieldError />
        </div>

        <Button type="submit" className="mt-2 h-[46px] w-full text-[15px] font-semibold">
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-muted">
        New here?{" "}
        <Link
          href="/register"
          className="font-semibold text-ink underline decoration-marking decoration-2 underline-offset-[3px]"
        >
          Create an account
        </Link>
      </p>
    </>
  );
}
