import { APP_URL } from "./api/config";

export function appUrl(path = "/app/video-generator") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${APP_URL.replace(/\/$/, "")}${normalizedPath}`;
}
