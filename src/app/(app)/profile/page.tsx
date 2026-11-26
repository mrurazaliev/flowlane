import type { Metadata } from "next";
import { ProfileSettings } from "@/features/auth";

export const metadata: Metadata = { title: "Profile · Flowlane" };

export default function ProfilePage() {
  return <ProfileSettings />;
}
