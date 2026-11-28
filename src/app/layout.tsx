import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";
import { themeScript } from "@/shared/lib/theme";

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
    <html lang="en" className={`${firaSans.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
