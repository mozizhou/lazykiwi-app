"use client";

import LoginPage from "@/demo/pages/LoginPage";
import { appUrl } from "@/lib/routes";

export function DemoLogin() {
  return <LoginPage onLogin={() => window.location.assign(appUrl("/app/video-generator"))} />;
}
