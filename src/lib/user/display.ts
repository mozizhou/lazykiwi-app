import type { UserProfile } from "./service";

const PLACEHOLDER_EMAILS = new Set(["member@lazykiwi.ai"]);
const PLACEHOLDER_NICKNAMES = new Set(["LazyKiwi User"]);

export function getProfileDisplay(
  profile: Pick<UserProfile, "nickname" | "email" | "point"> | null,
  fallbackEmail?: string | null,
  creditsOverride?: number | null,
) {
  const profileEmail = profile?.email && !PLACEHOLDER_EMAILS.has(profile.email)
    ? profile.email
    : "";
  const email = fallbackEmail || profileEmail || "";
  const nickname =
    profile?.nickname && !PLACEHOLDER_NICKNAMES.has(profile.nickname)
      ? profile.nickname
      : email.split("@")[0] || profile?.nickname || "LazyKiwi User";
  const initials =
    nickname
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "LK";

  return {
    email,
    nickname: PLACEHOLDER_NICKNAMES.has(nickname) && email ? email.split("@")[0] : nickname,
    initials,
    credits: creditsOverride ?? null,
  };
}
