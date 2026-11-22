export const ICON_PATHS = {
  arrowRight: "M2 8h12M9 3l5 5-5 5",
  check: "M3 8.5l3.5 3.5L13 4.5",
  chevronDown: "M3 6l5 5 5-5",
  close: "M3 3l10 10M13 3L3 13",
  copy: "M5 5h8v8H5zM3 11V3h8",
  download: "M8 2v8M4 7l4 4 4-4M2 14h12",
} as const;

export type IconName = keyof typeof ICON_PATHS;
