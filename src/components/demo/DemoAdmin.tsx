"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminDashboard from "@/demo/pages/AdminDashboard";
import { appUrl } from "@/lib/routes";
import { authStorage } from "@/lib/auth/storage";

export function DemoAdmin() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!authStorage.isAuthenticated()) {
      window.location.assign(appUrl("/login"));
      return;
    }
    setReady(true);
  }, []);

  const navigateToPage = (_pageId: string, path?: string) => {
    if (!path) return;
    if (path.startsWith("/app/") || path === "/login") {
      window.location.assign(appUrl(path));
    } else {
      router.push(path);
    }
  };

  if (!ready) return null;

  return <AdminDashboard navigateToPage={navigateToPage} />;
}
