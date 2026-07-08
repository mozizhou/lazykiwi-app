"use client";

import { useRouter } from "next/navigation";
import Settings from "@/demo/pages/Settings";
import { appUrl } from "@/lib/routes";

export function DemoSettings() {
  const router = useRouter();

  const navigateToPage = (_pageId: string, path?: string) => {
    if (!path) return;
    if (path === "/video-generator") window.location.assign(appUrl("/app/video-generator"));
    else if (path === "/image-generator") window.location.assign(appUrl("/app/image-generator"));
    else router.push(path);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Settings navigateToPage={navigateToPage} />
    </div>
  );
}
