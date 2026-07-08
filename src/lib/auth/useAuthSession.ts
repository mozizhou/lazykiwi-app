"use client";

import { useCallback, useEffect, useState } from "react";
import { AUTH_CHANGE_EVENT } from "./events";
import { authService } from "./service";
import { authStorage } from "./storage";

function readAuthState() {
  return {
    isLoggedIn: authStorage.isAuthenticated(),
    session: authStorage.getSession(),
  };
}

export function useAuthSession() {
  const [state, setState] = useState(readAuthState);

  const refresh = useCallback(() => {
    setState(readAuthState());
  }, []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener(AUTH_CHANGE_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refresh]);

  const logout = useCallback(async () => {
    await authService.logout();
    refresh();
  }, [refresh]);

  return { ...state, refresh, logout };
}
