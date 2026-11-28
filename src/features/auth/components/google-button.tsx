"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { errorText } from "@/shared/lib/errors";
import { useLocaleStore, useT } from "@/shared/lib/i18n";
import { ErrorBanner } from "@/shared/ui/form";
import { useGoogleLoginMutation } from "../api";

type GoogleCredentialResponse = { credential: string };

type GoogleIdentity = {
  initialize: (options: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentity } };
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

const loadGoogleScript = () =>
  new Promise<void>((resolve, reject) => {
    if (window.google?.accounts) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("Google script failed to load")));
    if (!existing) {
      script.src = SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
  });

export const GoogleButton = () => {
  const t = useT();
  const locale = useLocaleStore((s) => s.locale);
  const router = useRouter();
  const googleLogin = useGoogleLoginMutation();
  const buttonRef = useRef<HTMLDivElement>(null);
  const handleCredential = useRef<(credential: string) => void>(() => {});

  useEffect(() => {
    handleCredential.current = (credential) =>
      googleLogin.mutate(credential, { onSuccess: () => router.push("/workspaces") });
  });

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        const parent = buttonRef.current;
        const google = window.google;
        if (cancelled || !parent || !google) return;
        google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => handleCredential.current(response.credential),
        });
        parent.innerHTML = "";
        google.accounts.id.renderButton(parent, {
          theme: "outline",
          size: "large",
          shape: "rectangular",
          text: "continue_with",
          width: Math.min(parent.offsetWidth || 360, 400),
          locale,
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [locale]);

  if (!CLIENT_ID) return null;

  const error = googleLogin.error
    ? isAxiosError(googleLogin.error)
      ? errorText(googleLogin.error.response?.data, t("auth.googleError"))
      : t("auth.googleError")
    : null;

  return (
    <div className="mt-5 space-y-3">
      <div className="flex items-center gap-3 text-[13px] text-faint">
        <span className="h-px flex-1 bg-line" />
        {t("auth.or")}
        <span className="h-px flex-1 bg-line" />
      </div>
      <ErrorBanner>{error}</ErrorBanner>
      <div ref={buttonRef} aria-busy={googleLogin.isPending} className="flex min-h-11 justify-center" />
    </div>
  );
};
