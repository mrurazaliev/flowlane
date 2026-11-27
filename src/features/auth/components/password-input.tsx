"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/shared/ui/form";
import { useT } from "@/shared/lib/i18n";

type PasswordInputProps = React.ComponentProps<typeof Input>;

export const PasswordInput = (props: PasswordInputProps) => {
  const t = useT();
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className="pr-11" />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t("password.hide") : t("password.show")}
        className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-faint hover:text-ink"
      >
        {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
      </button>
    </div>
  );
};