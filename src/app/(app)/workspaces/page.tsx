import type { Metadata } from "next";
import { WorkspacePicker } from "@/features/workspaces";

export const metadata: Metadata = { title: "Select a workspace · Flowlane" };

export default function WorkspacesPage() {
  return <WorkspacePicker />;
}
