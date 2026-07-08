import { notifyAuthChange } from "./events";
import { AUTH_COOKIE_DOMAIN } from "../api/config";

const ACCESS_TOKEN_KEY = "lazykiwi.accessToken";
const REFRESH_TOKEN_KEY = "lazykiwi.refreshToken";
const USER_ID_KEY = "lazykiwi.userId";
const USER_EMAIL_KEY = "lazykiwi.userEmail";
const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const prefix = `${encodeURIComponent(name)}=`;
  const item = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(prefix));
  return item ? decodeURIComponent(item.slice(prefix.length)) : null;
}

function setCookie(name: string, value: string, maxAge: number) {
  if (typeof document === "undefined") return;
  const domain = AUTH_COOKIE_DOMAIN ? `; Domain=${AUTH_COOKIE_DOMAIN}` : "";
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}${domain}`;
}

function removeCookie(name: string) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const domains = AUTH_COOKIE_DOMAIN ? [AUTH_COOKIE_DOMAIN, ""] : [""];
  domains.forEach((cookieDomain) => {
    const domain = cookieDomain ? `; Domain=${cookieDomain}` : "";
    document.cookie = `${encodeURIComponent(name)}=; Path=/; Max-Age=0; SameSite=Lax${secure}${domain}`;
  });
}

function readStoredValue(key: string) {
  if (typeof window === "undefined") return null;
  const cookieValue = getCookie(key);
  if (cookieValue) return cookieValue;
  const localValue = localStorage.getItem(key);
  if (localValue) {
    setCookie(key, localValue, key === ACCESS_TOKEN_KEY ? ACCESS_TOKEN_MAX_AGE : SESSION_MAX_AGE);
  }
  return localValue;
}

export const authStorage = {
  getAccessToken() {
    if (typeof window === "undefined") return null;
    return readStoredValue(ACCESS_TOKEN_KEY);
  },

  getRefreshToken() {
    if (typeof window === "undefined") return null;
    return readStoredValue(REFRESH_TOKEN_KEY);
  },

  getUserId() {
    if (typeof window === "undefined") return null;
    const value = readStoredValue(USER_ID_KEY);
    return value ? Number(value) : null;
  },

  getEmail() {
    if (typeof window === "undefined") return null;
    return readStoredValue(USER_EMAIL_KEY);
  },

  setSession({
    accessToken,
    refreshToken,
    userId,
    email,
  }: {
    accessToken?: string;
    refreshToken?: string;
    userId?: number;
    email?: string;
  }) {
    if (typeof window === "undefined") return;
    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      setCookie(ACCESS_TOKEN_KEY, accessToken, ACCESS_TOKEN_MAX_AGE);
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      setCookie(REFRESH_TOKEN_KEY, refreshToken, SESSION_MAX_AGE);
    }
    if (userId !== undefined && userId !== null) {
      localStorage.setItem(USER_ID_KEY, String(userId));
      setCookie(USER_ID_KEY, String(userId), SESSION_MAX_AGE);
    }
    if (email) {
      localStorage.setItem(USER_EMAIL_KEY, email);
      setCookie(USER_EMAIL_KEY, email, SESSION_MAX_AGE);
    }
    notifyAuthChange();
  },

  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
    removeCookie(ACCESS_TOKEN_KEY);
    removeCookie(REFRESH_TOKEN_KEY);
    removeCookie(USER_ID_KEY);
    removeCookie(USER_EMAIL_KEY);
    notifyAuthChange();
  },

  isAuthenticated() {
    return Boolean(this.getAccessToken());
  },

  getSession() {
    return {
      accessToken: this.getAccessToken(),
      refreshToken: this.getRefreshToken(),
      userId: this.getUserId(),
      email: this.getEmail(),
    };
  },
};
