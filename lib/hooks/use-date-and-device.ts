import {
  createContext,
  createElement,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";

export type Device = "mobile" | "desktop";

type DateAndDeviceContextValue = {
  date: string;
  setDate: Dispatch<SetStateAction<string>>;
  device: Device;
  setDevice: Dispatch<SetStateAction<Device>>;
};

const DateAndDeviceContext = createContext<DateAndDeviceContextValue | null>(
  null,
);

export function DateAndDeviceProvider({ children }: { children: ReactNode }) {
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [device, setDevice] = useState<Device>("desktop");

  const value = useMemo(
    () => ({ date, setDate, device, setDevice }),
    [date, device],
  );

  return createElement(DateAndDeviceContext.Provider, { value }, children);
}

export function useDateAndDevice() {
  const ctx = useContext(DateAndDeviceContext);
  if (!ctx) {
    throw new Error(
      "useDateAndDevice must be used within <DateAndDeviceProvider>",
    );
  }

  return ctx;
}
