"use client";

import { useCallback, useEffect, useState } from "react";
import { AUTH_CHANGE_EVENT } from "../auth/events";
import { BILLING_UPDATED_EVENT } from "../billing/events";
import { useAuthSession } from "../auth/useAuthSession";
import { authStorage } from "../auth/storage";
import { userService, type UserProfile } from "./service";

function readLoginEmail() {
  return authStorage.getEmail();
}

export function useUserProfile() {
  const { isLoggedIn } = useAuthSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState<string | null>(() => readLoginEmail());

  const syncLoginEmail = useCallback(() => {
    setLoginEmail(readLoginEmail());
  }, []);

  const load = useCallback(async () => {
    syncLoginEmail();

    if (!isLoggedIn) {
      setProfile(null);
      setCredits(null);
      return;
    }

    setProfile(null);
    setCredits(null);
    setLoading(true);
    try {
      const storedEmail = readLoginEmail();
      const [profileData, creditAccount] = await Promise.all([
        userService.getProfile(),
        userService.getCreditAccount().catch(() => null),
      ]);
      setProfile(profileData);
      setCredits(creditAccount?.availableCredits ?? null);

      if (storedEmail) {
        setLoginEmail(storedEmail);
      } else if (profileData?.email) {
        authStorage.setSession({ email: profileData.email });
        setLoginEmail(profileData.email);
      }
    } catch {
      setProfile(null);
      setCredits(null);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, syncLoginEmail]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onChange = () => {
      syncLoginEmail();
      load();
    };
    window.addEventListener(AUTH_CHANGE_EVENT, onChange);
    window.addEventListener(BILLING_UPDATED_EVENT, onChange);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, onChange);
      window.removeEventListener(BILLING_UPDATED_EVENT, onChange);
    };
  }, [load, syncLoginEmail]);

  return {
    profile,
    credits,
    loading,
    loginEmail,
    refresh: load,
  };
}
