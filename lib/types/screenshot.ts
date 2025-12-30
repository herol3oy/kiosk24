import type { Device } from "../hooks/use-date-and-device";

export type Screenshot = {
  id: number;
  url: string;
  public_id: string;
  storage_url: string | null;
  captured_at: string;
  device: Device;
  job_status: "ok" | "failed";
};
