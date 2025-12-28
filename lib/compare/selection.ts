export type CompareSelection = {
  url: string;
  date: string;
  shotId: number | null;
};

export const emptySelection: CompareSelection = {
  url: "",
  date: "",
  shotId: null,
};

export function applyUrlChange(nextUrl: string): CompareSelection {
  return { url: nextUrl, date: "", shotId: null };
}

export function applyDateChange(
  prev: CompareSelection,
  nextDate: string,
): CompareSelection {
  return { ...prev, date: nextDate, shotId: null };
}

export function applyShotChange(
  prev: CompareSelection,
  nextShotId: number | null,
): CompareSelection {
  return { ...prev, shotId: nextShotId };
}
