export const BILLING_UPDATED_EVENT = "lazykiwi:billing-updated";

export function notifyBillingUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(BILLING_UPDATED_EVENT));
}
