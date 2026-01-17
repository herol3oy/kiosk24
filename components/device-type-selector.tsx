"use client";

import { Monitor, Smartphone } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Device } from "@/lib/hooks/use-date-and-device";

export function DeviceTypeSelector({
  device,
  onDeviceChange,
}: {
  device: Device;
  onDeviceChange: (device: Device) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      value={device}
      variant="outline"
      spacing={0}
      className="w-full"
      onValueChange={(value) => {
        if (value) onDeviceChange(value as Device);
      }}
    >
      <ToggleGroupItem value="desktop" aria-label="Desktop" className="flex-1">
        <Monitor className="size-4" />
      </ToggleGroupItem>

      <ToggleGroupItem value="mobile" aria-label="Mobile" className="flex-1">
        <Smartphone className="size-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
