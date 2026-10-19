export function analyticsAppUrl() {
  const raw = process.env.ANALYTICS_APP_URL ?? "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function analyticsDashboardUrl() {
  return `${analyticsAppUrl()}/dashboard`;
}
