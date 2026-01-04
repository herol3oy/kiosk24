"use client";

import { Monitor, Smartphone } from "lucide-react";
import type { Device } from "@/lib/hooks/use-date-and-device";
import { cn } from "@/lib/utils";

export function DeviceTypeSelector({
  device,
  onDeviceChange,
  name = "device",
  variant = "default",
}: {
  device: Device;
  onDeviceChange: (device: Device) => void;
  name?: string;
  variant?: "default" | "compact";
}) {
  const isCompact = variant === "compact";

  return (
    <fieldset className={cn(isCompact ? "space-y-1" : "space-y-2")}>
      <legend
        className={cn(
          "font-medium text-muted-foreground",
          isCompact ? "sr-only" : "text-sm",
        )}
      >
        Device type
      </legend>

      <div className={cn("grid grid-cols-2", isCompact ? "gap-1" : "gap-2")}>
        <label
          htmlFor="desktop"
          className={cn(
            "cursor-pointer rounded-md border transition",
            "flex items-center justify-center",
            isCompact ? "gap-1.5 px-2 py-1 text-xs" : "gap-2 px-3 py-2 text-sm",
            device === "desktop"
              ? "border-primary bg-primary/5 text-primary"
              : "border-muted hover:bg-muted/40",
          )}
        >
          <input
            type="radio"
            id="desktop"
            name={name}
            value="desktop"
            checked={device === "desktop"}
            onChange={() => onDeviceChange("desktop")}
            className="sr-only"
          />
          <Monitor
            className={cn("opacity-70", isCompact ? "h-3.5 w-3.5" : "h-4 w-4")}
          />
          <span>Desktop</span>
        </label>

        <label
          htmlFor="mobile"
          className={cn(
            "cursor-pointer rounded-md border transition",
            "flex items-center justify-center",
            isCompact ? "gap-1.5 px-2 py-1 text-xs" : "gap-2 px-3 py-2 text-sm",
            device === "mobile"
              ? "border-primary bg-primary/5 text-primary"
              : "border-muted hover:bg-muted/40",
          )}
        >
          <input
            type="radio"
            id="mobile"
            name={name}
            value="mobile"
            checked={device === "mobile"}
            onChange={() => onDeviceChange("mobile")}
            className="sr-only"
          />
          <Smartphone
            className={cn("opacity-70", isCompact ? "h-3.5 w-3.5" : "h-4 w-4")}
          />
          <span>Mobile</span>
        </label>
      </div>
    </fieldset>
  );
}
