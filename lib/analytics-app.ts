export const LOTUS_ANALYTICS_URL = "https://analytics.marcosdelfrari.com";

export function analyticsAppUrl() {
  const raw =
    process.env.NEXT_PUBLIC_ANALYTICS_APP_URL ??
    process.env.ANALYTICS_APP_URL ??
    LOTUS_ANALYTICS_URL;
  return raw.replace(/\/$/, "");
}

export function analyticsDashboardUrl() {
  return analyticsAppUrl();
}

