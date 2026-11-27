"use client";

import { Logo } from "@/shared/ui/logo";
import { StateIcon } from "@/shared/ui/issue-icons";
import { cn } from "@/shared/lib/utils";
import { useT, type TranslationKey } from "@/shared/lib/i18n";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { LanguageSwitcher } from "@/shared/ui/language-switcher";

const lanes: { name: TranslationKey; group: "unstarted" | "started" | "completed"; color: string; cards: string[][] }[] = [
  { name: "auth.lane.todo", group: "unstarted", color: "#9aa1ad", cards: [["WEB-3", "Revamp hero section"], ["WEB-5", "Fix footer links"]] },
  { name: "auth.lane.inProgress", group: "started", color: "#e0a21b", cards: [["WEB-6", "Fix token refresh on 401"]] },
  { name: "auth.lane.done", group: "completed", color: "#3a9a6b", cards: [["WEB-8", "Design tokens"], ["WEB-9", "CI pipeline"]] },
];

/** Экран входа/регистрации: слева «дорога» с полосами задач, справа форма */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = useT();

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <section className="relative hidden flex-col overflow-hidden bg-asphalt px-13 py-11 text-white lg:flex">
        <Logo light />

        <div className="mt-20 grid grid-cols-3" aria-hidden>
          {lanes.map((lane, i) => (
            <div
              key={lane.name}
              className={cn(
                "min-h-[420px] px-4",
                i > 0 && "bg-[length:2px_26px] bg-repeat-y",
                i === 1 && "bg-[linear-gradient(#4a515d_55%,transparent_0)]",
                i === 2 && "bg-[linear-gradient(var(--color-marking)_55%,transparent_0)]",
              )}
            >
              <p className="mb-3 flex items-center gap-2 text-[12.5px] text-[#8c93a0]">
                <StateIcon group={lane.group} color={lane.color} />
                {t(lane.name)}
              </p>
              {lane.cards.map(([key, title]) => (
                <div
                  key={key}
                  className={cn(
                    "mb-3 rounded-[10px] border border-asphalt-line bg-asphalt-2 px-3 py-2.5 text-[13px] text-[#d7dae0]",
                    lane.group === "started" && "border-marking shadow-[0_0_0_3px_rgba(242,182,48,.15)]",
                  )}
                >
                  <span className="mb-0.5 block text-[11.5px] text-[#8c93a0]">{key}</span>
                  {title}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-auto max-w-md">
          <p className="text-[30px] font-semibold leading-tight tracking-tight">{t("auth.hero.title")}</p>
          <p className="mt-2.5 text-[15px] text-[#a3a9b4]">{t("auth.hero.subtitle")}</p>
        </div>
      </section>

      <section className="relative flex items-center justify-center bg-white px-5 py-12">
        {/* Язык и тема — в правом верхнем углу */}
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
