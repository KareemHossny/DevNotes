export const getSiteUrl = () => {
  const envUrl = import.meta.env.VITE_SITE_URL;
  if (envUrl && typeof envUrl === "string") return envUrl.replace(/\/+$/, "");
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "";
};

export const buildCanonicalUrl = (pathname = "/") => {
  const base = getSiteUrl();
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`.replace(/\/$/, "");
};

// NOTE: VITE_SITE_URL must be defined in production environment variables.
