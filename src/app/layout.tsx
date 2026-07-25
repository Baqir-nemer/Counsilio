import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { ProfileProvider } from "@/context/profile-context";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Counsilio — Jurisdiction-aware legal assistant",
  description:
    "Draft legal papers with country-specific law sources, citations, and multilingual preferences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <ProfileProvider>{children}</ProfileProvider>
      </body>
    </html>
  );
}
