"use client";

import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !Number.isNaN(date.getTime());
}

export function ScreenshotDayPicker({
  selected,
  onSelect,
  availableDays,
}: {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  availableDays: Date[];
}) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date | undefined>(selected);
  const [value, setValue] = useState(formatDate(selected));

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="date" className="px-1">
        Select a date
      </Label>
      <div className="relative flex gap-2">
        <Input
          id="date"
          value={value}
          placeholder="June 01, 2025"
          className="bg-background pr-10"
          onChange={(e) => {
            const date = new Date(e.target.value);
            setValue(e.target.value);
            if (isValidDate(date)) {
              onSelect(date);
              setMonth(date);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date-picker"
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              selected={selected}
              onSelect={(date) => {
                onSelect(date);
                setValue(formatDate(date));
                setOpen(false);
              }}
              showOutsideDays={false}
              modifiers={{ hasData: availableDays }}
              modifiersClassNames={{
                hasData:
                  "bg-green-500 text-white rounded-full font-bold text-primary",
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
