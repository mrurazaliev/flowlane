"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRefreshToken } from "@/shared/api/auth-store";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!getRefreshToken()) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) return null;

  return children;
};