"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarRange, KanbanSquare, Users } from "lucide-react";
import { getRefreshToken } from "@/shared/api/auth-store";
import { useT } from "@/shared/lib/i18n";
import { cn } from "@/shared/lib/utils";
import { Logo } from "@/shared/ui/logo";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { LanguageSwitcher } from "@/shared/ui/language-switcher";

/** Жёлтая кнопка «Начать работу» → регистрация */
function StartButton({ className }: { className?: string }) {
  const t = useT();
  return (
    <Link
      href="/register"
      className={cn("rounded-[10px] bg-marking px-5 py-2.5 text-[15px] font-semibold text-asphalt transition hover:brightness-105", className)}
    >
      {t("Get started")}
    </Link>
  );
}

/** Главная для тех, кто зашёл впервые. Вошедших сразу отправляем к их пространствам */
export function LandingPage() {
  const t = useT();
  const router = useRouter();

  useEffect(() => {
    if (getRefreshToken()) router.replace("/workspaces");
  }, [router]);

  return (
    <div className="min-h-dvh bg-surface">
      <section className="bg-asphalt px-6 pt-5 text-white sm:px-10">
        <header className="mx-auto flex max-w-6xl items-center gap-3">
          <Logo light />
          <div className="ml-auto flex items-center gap-1 rounded-xl bg-surface p-1">
            <LanguageSwitcher className="border-0" />
            <ThemeToggle />
          </div>
          <Link href="/login" className="px-3 py-2 text-sm font-medium text-[#d7dae0] hover:text-white">
            {t("Log in")}
          </Link>
        </header>

        <div className="mx-auto max-w-3xl pb-12 pt-20 text-center">
          <h1 className="text-[40px] font-semibold leading-[1.08] tracking-tight sm:text-[56px]">
            {t("Tasks keep moving.")}
            <br />
            {t("Your team sees the road.")}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-[#a3a9b4]">
            {t("Board, sprints and modules in one place. Every task follows its own lane — from idea to done.")}
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <StartButton />
            <Link
              href="/login"
              className="rounded-[10px] border border-asphalt-line px-5 py-2.5 text-[15px] font-medium text-[#d7dae0] hover:border-[#5a616d] hover:text-white"
            >
              {t("Log in")}
            </Link>
          </div>
        </div>

        <BoardPreview />
      </section>

      <section className="px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-[28px] font-semibold tracking-tight text-ink">{t("Everything your team needs, nothing extra")}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Feature icon={<KanbanSquare className="size-5" />} title={t("Board and list")} text={t("Drag a task and the status changes for everyone.")}>
              <div className="flex items-center gap-2 text-[12.5px]">
                <span className="rounded-full bg-gray-200 px-2.5 py-1 text-gray-700">{t("Todo")}</span>
                <span className="text-faint">→</span>
                <span className="rounded-full bg-marking-soft px-2.5 py-1 text-[#7a5300]">{t("In progress")}</span>
              </div>
            </Feature>
            <Feature icon={<CalendarRange className="size-5" />} title={t("Cycles and modules")} text={t("Sprints by dates, progress is counted automatically.")}>
              <div className="w-full text-[12.5px] text-gray-600">
                <div className="flex justify-between">
                  <span>{t("Sprint 4")}</span>
                  <span>{t("{done} of {total}", { done: 7, total: 10 })}</span>
                </div>
                <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-gray-200">
                  <span className="w-[70%] bg-[#3a9a6b]" />
                  <span className="w-[10%] bg-marking" />
                </div>
              </div>
            </Feature>
            <Feature icon={<Users className="size-5" />} title={t("Together with your team")} text={t("Assignments, comments and notifications.")}>
              <div className="flex items-center gap-2">
                <div className="flex">
                  <span className="flex size-7 items-center justify-center rounded-full border-2 border-canvas bg-[#9FE1CB] text-[11px] text-[#04342C]">AK</span>
                  <span className="-ml-2 flex size-7 items-center justify-center rounded-full border-2 border-canvas bg-[#CECBF6] text-[11px] text-[#26215C]">MR</span>
                </div>
                <span className="rounded-[12px] rounded-bl-sm border border-line bg-surface px-2.5 py-1.5 text-[12.5px] text-gray-700">
                  {t("@Dima, take a look at the mockup")}
                </span>
              </div>
            </Feature>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-asphalt px-6 py-14 text-white sm:px-10">
        {/* Горизонтальная разметка по низу блока */}
        <div aria-hidden className="absolute inset-x-0 bottom-5 h-[3px] bg-[linear-gradient(90deg,var(--color-marking)_55%,transparent_0)] bg-[length:36px_3px] opacity-60" />
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-[28px] font-semibold tracking-tight">{t("Get on the road")}</p>
            <p className="mt-1.5 text-[15px] text-[#a3a9b4]">{t("A space for your team in a minute.")}</p>
          </div>
          <StartButton className="sm:ml-auto" />
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, title, text, children }: { icon: React.ReactNode; title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-canvas p-5">
      <div className="flex h-16 items-center">{children}</div>
      <p className="mt-3 flex items-center gap-2 text-[15px] font-semibold text-ink">
        <span className="text-[#b88512]">{icon}</span>
        {title}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
    </div>
  );
}

/** Окно приложения: доска-«дорога», одна задача сама переезжает из «В работе» в «Готово» */
function BoardPreview() {
  const t = useT();
  const [moved, setMoved] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setMoved((m) => !m), 3200);
    return () => clearInterval(timer);
  }, []);

  const columns = [
    { name: t("Backlog"), color: "text-[#8c93a0]", cards: [["MOB-12", t("Dark theme")], ["MOB-14", t("Push notifications")]] },
    { name: t("Todo"), color: "text-[#8c93a0]", cards: [["MOB-9", t("Profile screen")]] },
    { name: t("In progress"), color: "text-marking", cards: [["MOB-11", t("Onboarding")]] },
    { name: t("Done"), color: "text-[#5DCAA5]", cards: [["MOB-4", t("Email sign-in")]] },
  ];

  return (
    <div aria-hidden className="mx-auto hidden max-w-5xl overflow-hidden rounded-t-2xl border border-b-0 border-asphalt-line bg-asphalt-2 sm:grid sm:grid-cols-[160px_1fr]">
      <div className="border-r border-asphalt-line bg-asphalt p-4 text-[13px] leading-8 text-[#8c93a0]">
        <p className="mb-1 font-semibold text-white">Acme</p>
        {[
          [t("Website"), "#7F77DD"],
          [t("Mobile"), "var(--color-marking)"],
          ["API", "#5DCAA5"],
        ].map(([name, color], i) => (
          <p key={name} className={cn("-mx-2 flex items-center gap-2 rounded-md px-2", i === 1 && "bg-asphalt-2 text-white")}>
            <span className="size-2 rounded-sm" style={{ backgroundColor: color }} />
            {name}
          </p>
        ))}
      </div>

      <div className="p-4 pb-0">
        <div className="mb-4 flex gap-4 text-[13px] text-[#8c93a0]">
          <span className="text-white">{t("Board")}</span>
          <span>{t("List")}</span>
          <span>{t("Cycles")}</span>
          <span>{t("Modules")}</span>
        </div>

        <div className="relative grid min-h-[210px] grid-cols-4">
          {columns.map((col, i) => (
            <div
              key={col.name}
              className={cn(
                "px-3",
                i > 0 && "bg-[length:2px_24px] bg-left bg-repeat-y",
                i > 0 && i !== 2 && "bg-[linear-gradient(var(--color-asphalt-line)_55%,transparent_0)]",
                i === 2 && "bg-[linear-gradient(var(--color-marking)_55%,transparent_0)]",
              )}
            >
              <p className={cn("mb-2.5 text-[12px]", col.color)}>{col.name}</p>
              {/* В колонке «В работе» оставляем место под едущую карточку */}
              {i === 2 && <div className="h-[58px]" />}
              {col.cards.map(([key, title]) => (
                <PreviewCard key={key} id={key} title={title} />
              ))}
            </div>
          ))}

          <PreviewCard
            id="MOB-10"
            title={t("Sync")}
            className={cn(
              "absolute top-[30px] w-[calc(25%-24px)] transition-[left,border-color] duration-1000 ease-in-out motion-reduce:transition-none",
              moved ? "left-[calc(75%+12px)] border-[#5DCAA5]" : "left-[calc(50%+12px)] border-marking",
            )}
          />
        </div>
      </div>
    </div>
  );
}

function PreviewCard({ id, title, className }: { id: string; title: string; className?: string }) {
  return (
    <div className={cn("mb-2.5 rounded-lg border border-asphalt-line bg-asphalt px-3 py-2 text-[13px] text-[#d7dae0]", className)}>
      <span className="block text-[11px] text-[#8c93a0]">{id}</span>
      {title}
    </div>
  );
}
