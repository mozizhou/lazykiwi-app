import { apiRequest } from "../api/client";

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

    window.location.href = authorizeUrl;

  },



  async socialLogin({

    type = GOOGLE_SOCIAL_TYPE,

    code,

    state,

  }: {

    type?: number;

    code: string;

    state: string;

  }) {

    const data = await apiRequest<LoginResponse>("/member/auth/social-login", {

      method: "POST",

      auth: false,

      body: { type, code, state },

    });

    return persistLogin(data);

  },



  async logout() {

    try {

      await apiRequest("/member/auth/logout", { method: "POST", auth: true });

    } finally {

      authStorage.clear();

    }

  },

};


