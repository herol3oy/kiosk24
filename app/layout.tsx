import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Topbar } from "@/components/top-bar";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Kiosk24",
  description: "Screenshot of news website every hour",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-svh bg-background text-foreground">
        <Providers>
          <Topbar />
          <main className="px-4 py-8">
            {children}
            <Analytics />
          </main>
        </Providers>
      </body>
    </html>
  );
}
