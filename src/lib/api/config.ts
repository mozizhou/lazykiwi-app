export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/backend";
export const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? "1";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (SITE_URL.includes("localhost") || SITE_URL.includes("127.0.0.1")
    ? SITE_URL
    : "https://app.lazykiwi.ai");
export const AUTH_COOKIE_DOMAIN =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN ??
  (SITE_URL.includes("lazykiwi.ai") || APP_URL.includes("lazykiwi.ai") ? ".lazykiwi.ai" : "");
export const GOOGLE_SOCIAL_TYPE = Number(process.env.NEXT_PUBLIC_GOOGLE_SOCIAL_TYPE ?? "50");
export const IS_LOCAL_DEV_SITE = /localhost|127\.0\.0\.1/.test(SITE_URL);
