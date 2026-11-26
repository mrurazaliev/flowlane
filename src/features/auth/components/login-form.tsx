"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { ErrorBanner, FieldError, Input, Label } from "@/shared/ui/form";
import { Logo } from "@/shared/ui/logo";

export function LoginForm() {
  const router = useRouter();

  return (
    <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <Logo withText={false} />
        <h1 className="mt-4 text-2xl font-semibold text-gray-900">Flowlane</h1>
        <p className="mt-1 text-sm text-gray-500">Sign in to your workspace</p>
      </div>

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          // Позже: login() через API, при ошибке — показать ErrorBanner
          router.push("/workspaces");
        }}
      >
        {/* Позже: <ErrorBanner>Invalid email or password</ErrorBanner> */}
        <ErrorBanner />

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@company.com" autoComplete="email" />
          <FieldError />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" autoComplete="current-password" />
          <FieldError />
        </div>

        <Button type="submit" className="w-full">
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-indigo-600 hover:underline">
          Create account
        </Link>
      </p>
    </div>
  );
}
