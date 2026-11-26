"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { ErrorBanner, FieldError, FieldHint, Input, Label } from "@/shared/ui/form";

/** D1.1 Регистрация. Позже: RHF + Zod, POST /auth/register; с ?invite=<token> — сразу в workspace */
export function RegisterForm() {
  const router = useRouter();

  return (
    <>
      <h1 className="text-[26px] font-semibold tracking-tight">Create an account</h1>
      <p className="mb-7 mt-1.5 text-muted">Start organizing work with your team.</p>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/workspaces");
        }}
      >
        <ErrorBanner />

        <div>
          <Label htmlFor="name">Your name</Label>
          <Input id="name" placeholder="Alex Rivera" autoComplete="name" />
          <FieldError />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@company.com" autoComplete="email" />
          <FieldError />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" />
          <FieldHint>At least 8 characters</FieldHint>
          <FieldError />
        </div>

        <Button type="submit" className="mt-2 h-[46px] w-full text-[15px] font-semibold">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-ink underline decoration-marking decoration-2 underline-offset-[3px]">
          Log in
        </Link>
      </p>
    </>
  );
}
