"use client";

import { format, parseISO } from "date-fns";
import { UrlSelect } from "@/components/compare/url-select";
import { ScreenshotDayPicker } from "@/components/screenshot-day-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatTime24 } from "@/lib/datetime/format";
import type { Screenshot } from "@/lib/types/screenshot";
import { cn } from "@/lib/utils";

export function ScreenshotPickerCard({
  title,
  url,
  onUrlChange,
  date,
  onDateChange,
  availableDays,
  screenshots,
  selectedId,
  onSelect,
}: {
  title: string;
  url: string;
  onUrlChange: (v: string) => void;
  date: string;
  onDateChange: (v: string) => void;
  availableDays: Date[];
  screenshots: Screenshot[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  const okScreenshots = screenshots.filter((s) => s.job_status === "ok");
  const failedCount = screenshots.filter(
    (s) => s.job_status === "failed",
  ).length;

  const selectedOkId = okScreenshots.some((s) => s.id === selectedId)
    ? selectedId
    : null;

  const parsedDate = date ? parseISO(date) : undefined;

  return (
    <Card className="border-muted bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium">URL</Label>
          <UrlSelect value={url} onValueChange={onUrlChange} />
        </div>

        {url && (
          <>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Date</Label>
              <div className="rounded-lg border border-muted bg-background p-2">
                <ScreenshotDayPicker
                  selected={parsedDate}
                  availableDays={availableDays}
                  onSelect={(selectedDate) => {
                    if (selectedDate) {
                      onDateChange(format(selectedDate, "yyyy-MM-dd"));
                    }
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Available: {okScreenshots.length} • Failed: {failedCount}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Time</Label>
              <div className="rounded-lg border border-muted bg-background p-2">
                {!date ? (
                  <p className="text-xs text-muted-foreground">
                    Select a date first
                  </p>
                ) : okScreenshots.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {okScreenshots.map((s) => {
                      const isSelected = s.id === selectedOkId;
                      return (
                        <Button
                          key={s.id}
                          type="button"
                          size="sm"
                          variant={isSelected ? "default" : "secondary"}
                          aria-pressed={isSelected}
                          onClick={() => onSelect(s.id)}
                          className={cn(
                            "h-7 rounded-full px-2 text-xs",
                            isSelected && "shadow-none",
                          )}
                        >
                          {formatTime24(s.captured_at)}
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No screenshots available
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {!url && (
          <p className="text-sm text-muted-foreground">
            Select a URL to start.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
