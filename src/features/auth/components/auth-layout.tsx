"use client";

import { usePathname } from "next/navigation";
import { Logo } from "@/shared/ui/logo";
import { cn } from "@/shared/lib/utils";
import { useT } from "@/shared/lib/i18n";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { LanguageSwitcher } from "@/shared/ui/language-switcher";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = useT();
  const isRegister = usePathname().startsWith("/register");

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <section className={cn("relative hidden flex-col bg-asphalt px-13 py-11 text-white lg:flex", isRegister && "lg:order-2")}>
        <Logo light />

        <div className="my-auto flex max-w-lg gap-7">
          <div
            aria-hidden
            className="w-[3px] shrink-0 bg-[linear-gradient(var(--color-marking)_55%,transparent_0)] bg-[length:3px_26px] bg-repeat-y"
          />
          <div className="py-2">
            <p className="text-[44px] font-semibold leading-[1.1] tracking-tight">{t(isRegister ? "auth.register.heroTitle" : "auth.hero.title")}</p>
            <p className="mt-4 max-w-sm text-[16px] leading-relaxed text-[#a3a9b4]">{t(isRegister ? "auth.register.heroSubtitle" : "auth.hero.subtitle")}</p>
          </div>
        </div>
      </section>

      <section className="relative flex items-center justify-center bg-white px-5 py-12">
        <div className="absolute right-5 top-5 flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        <div className="w-full max-w-[360px]">
          <Logo className="mb-10 lg:hidden" />
          {children}
        </div>
      </section>
    </div>
  );
}
