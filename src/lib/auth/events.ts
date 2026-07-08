export const AUTH_CHANGE_EVENT = "lazykiwi:auth-change";

export function notifyAuthChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
}
