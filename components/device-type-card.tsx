"use client";

import { DeviceTypeSelector } from "@/components/device-type-selector";
import { Card, CardContent } from "@/components/ui/card";
import type { Device } from "@/lib/hooks/use-date-and-device";

export function DeviceTypeCard({
  device,
  onDeviceChange,
  name = "device",
}: {
  device: Device;
  onDeviceChange: (device: Device) => void;
  name?: string;
}) {
  return (
    <Card className="border-muted bg-card/50 backdrop-blur-sm">
      <CardContent className="space-y-6">
        <DeviceTypeSelector
          device={device}
          onDeviceChange={onDeviceChange}
          name={name}
        />
      </CardContent>
    </Card>
  );
}
