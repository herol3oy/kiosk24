"use client";

import { DayPicker } from "react-day-picker";

export function ScreenshotDayPicker({
  selected,
  onSelect,
  availableDays,
}: {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  availableDays: Date[];
}) {
  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={onSelect}
      showOutsideDays={false}
      modifiers={{ hasData: availableDays }}
      modifiersClassNames={{
        hasData: "bg-green-500 text-white rounded-full font-bold text-primary",
      }}
      formatters={{
        formatCaption: (month) =>
          month.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          }),
      }}
    />
  );
}
