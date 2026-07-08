"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { socialLogin } from "@/lib/auth";
import { appUrl } from "@/lib/routes";

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      setError("Missing Google authorization parameters.");
      return;
    }

    socialLogin({ code, state })
      .then(() => {
        window.location.replace(appUrl("/app/video-generator"));
      })
      .catch((err) => setError(err?.message || "Google sign-in failed."));
  }, [searchParams]);

  return <AuthCallbackStatus error={error} />;
}

function AuthCallbackStatus({ error }: { error?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg">
        <h1 className="text-xl font-bold text-gray-900">Signing you in...</h1>
        {error ? (
          <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>
        ) : (
          <p className="mt-3 text-sm text-gray-500">Completing Google authentication.</p>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackStatus />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
