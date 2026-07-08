import { APP_URL, SITE_URL } from "./api/config";

export function appUrl(path = "/app/video-generator") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${APP_URL.replace(/\/$/, "")}${normalizedPath}`;
}

export function siteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL.replace(/\/$/, "")}${normalizedPath}`;
}
