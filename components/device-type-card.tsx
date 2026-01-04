"use client";

import { DeviceTypeSelector } from "@/components/device-type-selector";
import { Card, CardContent } from "@/components/ui/card";
import type { Device } from "@/lib/hooks/use-date-and-device";
import { cn } from "@/lib/utils";

export function DeviceTypeCard({
  device,
  onDeviceChange,
  name = "device",
  variant = "default",
  className,
  contentClassName,
}: {
  device: Device;
  onDeviceChange: (device: Device) => void;
  name?: string;
  variant?: "default" | "compact";
  className?: string;
  contentClassName?: string;
}) {
  const isCompact = variant === "compact";

  return (
    <Card
      className={cn(
        "border-muted bg-card/50 backdrop-blur-sm",
        isCompact && "gap-2 py-2",
        className,
      )}
    >
      <CardContent
        className={cn(
          isCompact ? "space-y-2 px-3" : "space-y-6",
          contentClassName,
        )}
      >
        <DeviceTypeSelector
          device={device}
          onDeviceChange={onDeviceChange}
          name={name}
          variant={variant}
        />
      </CardContent>
    </Card>
  );
}
