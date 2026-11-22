export const ROUTES = {
  home: "/",
  qr: "/qr",
  invoice: "/invoice",
  proposal: "/proposal",
  background: "/background",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
