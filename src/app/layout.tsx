import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Fira Sans лежит в проекте (src/app/fonts) — при сборке ничего не скачивается
const firaSans = localFont({
  src: [
    { path: "./fonts/FiraSans-Regular.woff", weight: "400", style: "normal" },
    { path: "./fonts/FiraSans-Medium.woff", weight: "500", style: "normal" },
    { path: "./fonts/FiraSans-SemiBold.woff", weight: "600", style: "normal" },
  ],
  variable: "--font-fira",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Flowlane",
  description: "Every task in its lane",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${firaSans.variable} h-full`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
