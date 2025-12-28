"use client";

import { ArrowLeftRight, Home, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Topbar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-muted bg-linear-to-r from-background to-muted/30 sticky top-0 z-50">
      <div className="mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-3 hover:text-muted-foreground"
        >
          <span className="rounded-lg bg-primary/10 p-2">
            <ImageIcon className="h-5 w-5 text-primary" />
          </span>
          <h1 className="text-xl font-bold tracking-tight">Kiosk24</h1>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Primary">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
              pathname === "/"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link
            href="/compare"
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
              pathname === "/compare"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            <ArrowLeftRight className="h-4 w-4" />
            Compare
          </Link>
        </nav>
      </div>
    </header>
  );
}
