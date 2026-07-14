import { APP_URL, SITE_URL } from "./api/config";

export function appUrl(path = "/app/video-generator") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${APP_URL.replace(/\/$/, "")}${normalizedPath}`;
}

export function siteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const siteBase = SITE_URL.replace(/\/$/, "");
  const appBase = APP_URL.replace(/\/$/, "");
  const marketingBase =
    siteBase.includes("app.lazykiwi") || siteBase === appBase
      ? "https://lazykiwi.ai"
      : siteBase;
  return `${marketingBase}${normalizedPath}`;
}

export function pricingUrl() {
  return siteUrl("/pricing");
}
