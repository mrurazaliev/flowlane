import type { Metadata } from "next";
import { LandingPage } from "@/features/landing";

export const metadata: Metadata = { title: "Flowlane — tasks for your team" };

export default function Home() {
  return <LandingPage />;
}
