import { API_BASE_URL, TENANT_ID } from "./config";
import { authStorage } from "../auth/storage";
import { parseApiResponse } from "./client";

type LegacyRequestOptions = {
  method?: string;
  body?: BodyInit | null;
  auth?: boolean;
  headers?: Record<string, string>;
};

/** Demo/workbench helper used by image & video generator modules. */
export async function request<T = unknown>(
  path: string,
  { method = "GET", body, auth = true, headers = {} }: LegacyRequestOptions = {},
): Promise<T> {
  const requestHeaders: Record<string, string> = {
    "tenant-id": TENANT_ID,
    ...headers,
  };

  if (!(body instanceof FormData)) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = authStorage.getAccessToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: body ?? undefined,
  });

  return parseApiResponse(response, auth) as Promise<T>;
}
