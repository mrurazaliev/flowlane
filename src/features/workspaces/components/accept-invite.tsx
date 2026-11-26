"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { buttonClasses } from "@/shared/ui/button";
import { Logo } from "@/shared/ui/logo";

/**
 * D2.6 Страница по ссылке из приглашения (публичная): /invite/:token.
 * Позже: GET /invites/:token → данные приглашения, затем
 * залогинен → POST /invites/:token/accept; нет аккаунта → /register?invite=<token>.
 * Ошибка 410 (GONE) → приглашение истекло.
 * Ошибки: приглашение истекло / уже принято / для другого email.
 */
export function AcceptInvite() {
  const { token } = useParams<{ token: string }>();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="flex justify-center">
          <Logo withText={false} />
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-indigo-600">Workspace invite</p>
        <h1 className="mt-2 text-xl font-semibold text-gray-900">Sarah Chen invited you to join Demo Workspace</h1>
        <p className="mt-2 text-sm text-gray-500">
          You will join as <span className="font-medium text-gray-900">Member</span>.
        </p>

        <div className="mt-6 space-y-2">
          <Link href="/w/demo/projects" className={buttonClasses("primary", "md", "w-full")}>
            Accept invite
          </Link>
          <div className="flex gap-2">
            <Link href={`/register?invite=${token}`} className={buttonClasses("secondary", "md", "flex-1")}>
              Sign up
            </Link>
            <Link href="/login" className={buttonClasses("secondary", "md", "flex-1")}>
              Log in
            </Link>
          </div>
        </div>

        <p className="mt-6 text-xs text-gray-400">This invite expires in 7 days.</p>
      </div>
    </main>
  );
}
