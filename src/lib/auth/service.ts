import { apiRequest, ApiError } from "../api/client";

import { GOOGLE_SOCIAL_TYPE, SITE_URL } from "../api/config";

import { authStorage } from "./storage";



type LoginResponse = {

  accessToken: string;

  refreshToken: string;

  userId: number;

};



type SendEmailCodeResponse = {

  sent: boolean;

  devCode?: string;

};



function persistLogin(data: LoginResponse, email?: string) {
  const normalizedEmail = email?.trim().toLowerCase();
  authStorage.setSession({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    userId: data.userId,
    email: normalizedEmail,
  });
  return data;
}

function getDefaultRedirectUri() {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/auth/callback`;
  }
  return `${SITE_URL.replace(/\/$/, "")}/auth/callback`;
}

function withGoogleEnglishLocale(authorizeUrl: string) {
  try {
    const url = new URL(authorizeUrl);
    url.searchParams.set("hl", "en");
    url.searchParams.set("ui_locales", "en");
    return url.toString();
  } catch {
    return authorizeUrl;
  }
}

export function normalizeAuthErrorMessage(message?: string) {
  if (!message) return "";
  let normalized = message.trim();
  const replacements: Array<[RegExp, string]> = [
    [/社交授权失败[，,]?原因是[：:]\s*/i, "Social authorization failed: "],
    [/社交授权失败/i, "Social authorization failed"],
    [/登录失败[，,]?解析不到三方登录信息/i, "Sign-in failed: unable to resolve social login information"],
    [/用户不存在/i, "User not found"],
    [/系统异常/i, "System error"],
  ];
  for (const [pattern, replacement] of replacements) {
    normalized = normalized.replace(pattern, replacement);
  }
  return normalized;
}



export const authService = {

  isAuthenticated() {

    return authStorage.isAuthenticated();

  },



  async sendEmailCode({ email }: { email: string }) {

    return apiRequest<SendEmailCodeResponse>("/member/auth/send-email-code", {

      method: "POST",

      auth: false,

      body: { email },

    });

  },



  async loginWithEmailCode({ email, code }: { email: string; code: string }) {

    const data = await apiRequest<LoginResponse>("/member/auth/email-code-login", {

      method: "POST",

      auth: false,

      body: { email, code },

    });

    return persistLogin(data, email.trim());

  },



  async getGoogleAuthorizeUrl(redirectUri = getDefaultRedirectUri()) {

    const params = new URLSearchParams({

      type: String(GOOGLE_SOCIAL_TYPE),

      redirectUri,

    });

    return apiRequest<string>(`/member/auth/social-auth-redirect?${params.toString()}`, {

      auth: false,

    });

  },



  async startGoogleLogin(redirectUri = getDefaultRedirectUri()) {

    const authorizeUrl = await this.getGoogleAuthorizeUrl(redirectUri);

    if (!authorizeUrl) {

      throw new Error("Google login is not configured.");

    }

    window.location.href = withGoogleEnglishLocale(authorizeUrl);

  },



  async socialLogin({

    type = GOOGLE_SOCIAL_TYPE,

    code,

    state,

    redirectUri,

  }: {

    type?: number;

    code: string;

    state: string;

    redirectUri?: string;

  }) {

    const resolvedRedirectUri = redirectUri ?? getDefaultRedirectUri();

    try {
      const data = await apiRequest<LoginResponse>("/member/auth/social-login", {
        method: "POST",
        auth: false,
        body: { type, code, state, redirectUri: resolvedRedirectUri },
      });
      return persistLogin(data);
    } catch (err) {
      if (err instanceof ApiError) {
        throw new ApiError(normalizeAuthErrorMessage(err.message) || "Google sign-in failed.", {
          code: err.code,
          status: err.status,
        });
      }
      throw err;
    }
  },



  async logout() {

    try {

      await apiRequest("/member/auth/logout", { method: "POST", auth: true });

    } finally {

      authStorage.clear();

    }

  },

};


