"use client";

import {
  ArrowLeftRight,
  Home,
  Hourglass,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDateAndDevice } from "@/lib/hooks/use-date-and-device";
import { cn } from "@/lib/utils";
import { DeviceTypeCard } from "./device-type-card";

export function Topbar() {
  const pathname = usePathname();

  const { device, setDevice } = useDateAndDevice();

  const navLinks = [
    { href: "/", label: "Home", Icon: Home },
    { href: "/compare", label: "Compare", Icon: ArrowLeftRight },
    { href: "/latest", label: "Latest", Icon: Hourglass },
  ] as const;

  return (
    <header className="border-b border-muted bg-linear-to-r from-background to-muted/30 sticky top-0 z-50">
      <div className="mx-auto flex h-16 items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="flex items-center gap-3 hover:text-muted-foreground"
        >
          <span className="rounded-lg bg-primary/10 p-2">
            <ImageIcon className="h-5 w-5 text-primary" />
          </span>
          <h1 className="hidden text-xl font-bold tracking-tight sm:block">
            Kiosk24
          </h1>
        </Link>

        <div className="shrink-0">
          <DeviceTypeCard
            device={device}
            onDeviceChange={setDevice}
            variant="compact"
            className="w-40 sm:w-56 lg:w-64"
          />
        </div>

        <nav className="flex items-center gap-1" aria-label="Primary">
          {navLinks.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200 sm:px-4",
                pathname === href
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
