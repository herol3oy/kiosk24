"use client";

import {
  ArrowLeftRight,
  Home,
  Hourglass,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Topbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home", Icon: Home },
    { href: "/compare", label: "Compare", Icon: ArrowLeftRight },
    { href: "/latest", label: "Latest", Icon: Hourglass },
  ] as const;

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
          {navLinks.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                pathname === href
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
