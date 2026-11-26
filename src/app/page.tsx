import { redirect } from "next/navigation";

// Позже: если пользователь залогинен — на /workspaces, иначе на /login
export default function Home() {
  redirect("/login");
}
