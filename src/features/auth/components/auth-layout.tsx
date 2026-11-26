import { Logo } from "@/shared/ui/logo";
import { StateIcon } from "@/shared/ui/issue-icons";
import { cn } from "@/shared/lib/utils";

const lanes = [
  { name: "Todo", group: "unstarted" as const, color: "#9aa1ad", cards: [["WEB-3", "Revamp hero section"], ["WEB-5", "Fix footer links"]] },
  { name: "In progress", group: "started" as const, color: "#e0a21b", cards: [["WEB-6", "Fix token refresh on 401"]] },
  { name: "Done", group: "completed" as const, color: "#3a9a6b", cards: [["WEB-8", "Design tokens"], ["WEB-9", "CI pipeline"]] },
];

/** Экран входа/регистрации: слева «дорога» с полосами задач, справа форма */
export function AuthLayout({ children }: { children: React.ReactNode }) {
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
                {lane.name}
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
          <p className="text-[30px] font-semibold leading-tight tracking-tight">Every task in its lane.</p>
          <p className="mt-2.5 text-[15px] text-[#a3a9b4]">Plan sprints, move work forward and see who is doing what.</p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-white px-5 py-12">
        <div className="w-full max-w-[360px]">
          <Logo className="mb-10 lg:hidden" />
          {children}
        </div>
      </section>
    </div>
  );
}
