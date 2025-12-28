import { useState } from "react";

export type Device = "mobile" | "desktop";

export function useDateAndDevice() {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [device, setDevice] = useState<Device>("desktop");

  return { date, setDate, device, setDevice };
}
