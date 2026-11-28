import type { Metadata } from "next";
import localFont from "next/font/local";
import { Anonymous_Pro, DM_Sans, Lora } from "next/font/google";
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

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

const anonymousPro = Anonymous_Pro({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  variable: "--font-anon",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Flowlane",
  description: "Every task in its lane",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${firaSans.variable} ${dmSans.variable} ${lora.variable} ${anonymousPro.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
