import { API_BASE_URL, TENANT_ID } from "./config";
import { notifyAuthChange } from "../auth/events";
import { authStorage } from "../auth/storage";

export class ApiError extends Error {
  code?: number;
  status?: number;

  constructor(message: string, options: { code?: number; status?: number } = {}) {
    super(message);
    this.name = "ApiError";
    this.code = options.code;
    this.status = options.status;
  }
}

function clearSessionIfUnauthorized(
  code: number | undefined,
  status: number | undefined,
  hadAuth: boolean,
) {
  if (!hadAuth) return;
  if (code === 401 || status === 401) {
    authStorage.clear();
    notifyAuthChange();
  }
}

export async function parseApiResponse(response: Response, hadAuth = false) {
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const code = typeof payload === "object" && payload ? payload.code : undefined;
    clearSessionIfUnauthorized(code, response.status, hadAuth);
    const message =
      typeof payload === "object" && payload && "msg" in payload
        ? String(payload.msg)
        : typeof payload === "string" && payload.includes("Bad Request")
          ? "Request failed. Try clearing site cookies for localhost and retry."
          : `Request failed (${response.status})`;
    throw new ApiError(message, {
      code,
      status: response.status,
    });
  }

  if (typeof payload === "object" && payload !== null && "code" in payload) {
    if (payload.code !== 0) {
      clearSessionIfUnauthorized(payload.code, response.status, hadAuth);
      throw new ApiError(payload.msg || "API request failed", {
        code: payload.code,
        status: response.status,
      });
    }
    return payload.data;
  }

  return payload;
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
};

export async function apiRequest<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, headers = {} } = options;
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "tenant-id": TENANT_ID,
    ...headers,
  };

  if (auth) {
    const token = authStorage.getAccessToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return parseApiResponse(response, auth) as Promise<T>;
}
