"use client";

import { usePathname } from "next/navigation";
import { Logo } from "@/shared/ui/logo";
import { cn } from "@/shared/lib/utils";
import { useT } from "@/shared/lib/i18n";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { LanguageSwitcher } from "@/shared/ui/language-switcher";

const heroCards = [
  { id: "WEB-118", title: "Drag-and-drop on the board", tag: "Feature", tagClass: "bg-[#e1ece4] text-[#3f6b50]", bars: "#c98a12", avatar: "AK", avatarClass: "bg-sage", pos: "left-0 top-0 -rotate-[4deg]" },
  { id: "WEB-121", title: "Refresh token does not update", tag: "Bug", tagClass: "bg-[#f8ddd2] text-[#a83a1a]", bars: "#d9532b", avatar: "MU", avatarClass: "bg-marking", pos: "left-[46%] top-[150px] rotate-[3deg]" },
  { id: "WEB-124", title: "Profile screen", tag: "Design", tagClass: "bg-[#ece0f0] text-[#653e75]", bars: "#5e8a6e", avatar: "ZR", avatarClass: "bg-plum", pos: "left-[12%] top-[300px] -rotate-[1deg]" },
];

function PriorityBars({ color }: { color: string }) {
  return (
    <span className="flex items-end gap-[2px]">
      {[5, 8, 11].map((h, i) => (
        <span key={h} className="w-[3px] rounded-sm" style={{ height: h, backgroundColor: i < 2 ? color : "#4a5068" }} />
      ))}
    </span>
  );
}

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = useT();
  const isRegister = usePathname().startsWith("/register");

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <section
        className={cn(
          "relative hidden flex-col overflow-hidden bg-asphalt px-14 py-12 text-[#f6f1e7] lg:flex",
          !isRegister && "lg:order-2",
        )}
      >
        <p className="flex items-center gap-2 text-sm text-[#a8acbd]">
          <span className="size-2 rounded-full bg-marking" />
          {t("Flowlane · planning without the noise")}
        </p>

        <div className="mt-20 max-w-xl">
          <p className="font-serif text-[52px] font-medium leading-[1.12] tracking-tight">
            {t(isRegister ? "auth.register.heroTitle" : "auth.hero.title")}
          </p>
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-[#a8acbd]">
            {t(isRegister ? "auth.register.heroSubtitle" : "auth.hero.subtitle")}
          </p>
        </div>

        <div aria-hidden className="relative mt-auto h-[440px] w-full max-w-[560px]">
          {heroCards.map((card) => (
            <div
              key={card.id}
              className={cn(
                "absolute w-[300px] rounded-[14px] border border-asphalt-line bg-asphalt-2 p-4 shadow-[0_24px_40px_-20px_rgba(0,0,0,.6)]",
                card.pos,
              )}
            >
              <div className="flex items-start justify-between">
                <span className="font-id text-[12px] text-[#8b90a6]">{card.id}</span>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", card.tagClass)}>{t(card.tag)}</span>
              </div>
              <p className="mt-2 text-[15px] font-semibold">{t(card.title)}</p>
              <div className="mt-4 flex items-center justify-between">
                <PriorityBars color={card.bars} />
                <span className={cn("grid size-7 place-items-center rounded-full text-[10px] font-bold text-white", card.avatarClass)}>
                  {card.avatar}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative flex flex-col bg-canvas px-6 py-10 sm:px-12">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <div className="mx-auto my-auto w-full max-w-[400px] py-10">{children}</div>
      </section>
    </div>
  );
}
