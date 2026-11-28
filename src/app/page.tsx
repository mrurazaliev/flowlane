import type { Metadata } from "next";
import { LandingPage } from "@/features/landing";

export const metadata: Metadata = { title: "Flowlane — tasks for your team" };

// Главная: лендинг для новых людей. Вошедших LandingPage сама отправит на /workspaces
export default function Home() {
  return <LandingPage />;
}
