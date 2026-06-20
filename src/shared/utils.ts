export const normalizeUrl = (url: string): string => {
  const u = new URL(url);
  return u.origin + u.pathname;
};
