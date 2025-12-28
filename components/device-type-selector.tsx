"use client";

import { Monitor, Smartphone } from "lucide-react";
import type { Device } from "@/lib/hooks/use-date-and-device";

export function DeviceTypeSelector({
  device,
  onDeviceChange,
  name = "device",
}: {
  device: Device;
  onDeviceChange: (device: Device) => void;
  name?: string;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-muted-foreground">
        Device type
      </legend>

      <div className="grid grid-cols-2 gap-2">
        <label
          htmlFor="desktop"
          className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition
            ${
              device === "desktop"
                ? "border-primary bg-primary/5 text-primary"
                : "border-muted hover:bg-muted/40"
            }`}
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
          <Monitor className="h-4 w-4 opacity-70" />
          <span>Desktop</span>
        </label>

        <label
          htmlFor="mobile"
          className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition
            ${
              device === "mobile"
                ? "border-primary bg-primary/5 text-primary"
                : "border-muted hover:bg-muted/40"
            }`}
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
          <Smartphone className="h-4 w-4 opacity-70" />
          <span>Mobile</span>
        </label>
      </div>
    </fieldset>
  );
}
