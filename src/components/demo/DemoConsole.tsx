"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Menu } from "lucide-react";
import Banner from "@/demo/components/Banner";
import Sidebar from "@/demo/components/Sidebar";
import Footer from "@/demo/components/Footer";
import AuthModal from "@/demo/components/AuthModal";
import { getStoredAuth, isAuthenticated, logout as logoutAuth } from "@/demo/lib/auth";
import { AUTH_CHANGE_EVENT } from "@/lib/auth/events";
import { authStorage } from "@/lib/auth/storage";
import Home from "@/demo/pages/Home";
import VideoEffects from "@/demo/pages/VideoEffects";
import VideoGenerator from "@/demo/pages/VideoGenerator";
import ImageGenerator from "@/demo/pages/ImageGenerator";
import AvatarTalking from "@/demo/pages/AvatarTalking";
import PhotoEffects from "@/demo/pages/PhotoEffects";
import FaceSwap from "@/demo/pages/FaceSwap";
import CharacterSwap from "@/demo/pages/CharacterSwap";
import MemeGenerator from "@/demo/pages/MemeGenerator";
import BackgroundRemover from "@/demo/pages/BackgroundRemover";
import ImageEditor from "@/demo/pages/ImageEditor";
import VideoEditor from "@/demo/pages/VideoEditor";
import Placeholder from "@/demo/pages/Placeholder";
import LoginPage from "@/demo/pages/LoginPage";
import Settings from "@/demo/pages/Settings";

const pagePaths: Record<string, string> = {
  home: "/app/home",
  "video-effects": "/app/video-effects",
  "video-generator": "/app/video-generator",
  "image-generator": "/app/image-generator",
  "avatar-talking": "/app/avatar-talking",
  "photo-effects": "/app/photo-effects",
  "face-swap": "/app/face-swap",
  "character-swap": "/app/character-swap",
  "meme-generator": "/app/meme-generator",
  "background-remover": "/app/background-remover",
  "image-editor": "/app/image-editor",
  "video-editor": "/app/video-editor",
  settings: "/settings",
  login: "/login"
};

export function DemoConsole({ initialPage }: { initialPage: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activePage, setActivePageState] = useState(initialPage);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authSession, setAuthSession] = useState<unknown>(null);
  const [authModalMode, setAuthModalMode] = useState<null | "login" | "signup">(null);

  useEffect(() => {
    const syncAuth = () => {
      setIsLoggedIn(isAuthenticated());
      setAuthSession(getStoredAuth());
    };
    syncAuth();
    window.addEventListener(AUTH_CHANGE_EVENT, syncAuth);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, syncAuth);
  }, []);

  useEffect(() => {
    const openLogin = () => setAuthModalMode("login");
    window.addEventListener("lazykiwi:open-auth", openLogin);
    return () => window.removeEventListener("lazykiwi:open-auth", openLogin);
  }, []);

  const setActivePage = (pageId: string) => {
    setActivePageState(pageId);
    const path = pagePaths[pageId];
    if (path) router.push(path);
  };

  const navigateToPage = (pageId: string, path?: string) => {
    if (path) {
      let targetPath = path;
      if (path.startsWith("/video-generator")) targetPath = path.replace("/video-generator", "/app/video-generator");
      else if (path.startsWith("/image-generator")) targetPath = path.replace("/image-generator", "/app/image-generator");
      router.push(targetPath);
      window.dispatchEvent(new CustomEvent("lazykiwi:route-change", { detail: { pageId, path: targetPath } }));
    } else {
      const mapped = pagePaths[pageId];
      if (mapped) {
        router.push(mapped);
        window.dispatchEvent(new CustomEvent("lazykiwi:route-change", { detail: { pageId, path: mapped } }));
      }
    }
    setActivePageState(pageId);
    const mainEl = document.querySelector("main");
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAuthComplete = (auth?: { email?: string }) => {
    if (auth?.email) {
      authStorage.setSession({ email: auth.email.trim().toLowerCase() });
    }
    setAuthSession(getStoredAuth());
    setIsLoggedIn(isAuthenticated());
    setAuthModalMode(null);
    window.location.reload();
  };

  const handleLogout = async () => {
    await logoutAuth();
    setAuthSession(null);
    setIsLoggedIn(false);
  };

  const renderPage = () => {
    const routeKey = `${activePage}?${searchParams.toString()}`;
    const routeMode = searchParams.get("mode") || undefined;
    const routeTemplate = searchParams.get("template") || undefined;
    switch (activePage) {
      case "home":
        return <Home setActivePage={setActivePage} />;
      case "login":
        return <LoginPage onLogin={handleAuthComplete} />;
      case "settings":
        return isLoggedIn
          ? <Settings navigateToPage={navigateToPage} />
          : <LoginPage onLogin={handleAuthComplete} />;
      case "video-effects":
        return <VideoEffects />;
      case "video-generator":
        return <VideoGenerator key={routeKey} routeMode={routeMode} routeTemplate={routeTemplate} />;
      case "image-generator":
        return <ImageGenerator key={routeKey} routeMode={routeMode} routeTemplate={routeTemplate} />;
      case "avatar-talking":
        return <AvatarTalking />;
      case "photo-effects":
        return <PhotoEffects />;
      case "face-swap":
        return <FaceSwap />;
      case "character-swap":
        return <CharacterSwap />;
      case "meme-generator":
        return <MemeGenerator />;
      case "background-remover":
        return <BackgroundRemover />;
      case "image-editor":
        return <ImageEditor />;
      case "video-editor":
        return <VideoEditor />;
      default:
        return <Placeholder pageId={activePage} />;
    }
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#F7F8FA] font-sans text-gray-900">
      <Banner isVisible={isBannerVisible} onClose={() => setIsBannerVisible(false)} navigateToPage={navigateToPage} />
      <div className="relative flex min-w-0 flex-1 overflow-hidden">
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(true)}
          className="fixed left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200/80 bg-white/90 text-gray-700 shadow-md backdrop-blur transition hover:bg-gray-50 active:scale-95 md:hidden"
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>

        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          navigateToPage={navigateToPage}
          isMobileOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((value) => !value)}
          isLoggedIn={isLoggedIn}
          authSession={authSession}
          onLogin={() => setAuthModalMode("login")}
          onStartFree={() => setAuthModalMode("signup")}
          onLogout={handleLogout}
        />
        {isMobileSidebarOpen ? (
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-30 bg-gray-900/40 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        ) : null}
        <MainScrollArea scrollDisabled={activePage === "video-generator" || activePage === "image-generator" || activePage === "home"}>
          {renderPage()}
          {activePage !== "video-generator" && activePage !== "image-generator" && activePage !== "home" && activePage !== "settings" ? <Footer aliases={null} /> : null}
        </MainScrollArea>
      </div>
      <AuthModal
        mode={authModalMode}
        onClose={() => setAuthModalMode(null)}
        onComplete={handleAuthComplete}
      />
    </div>
  );
}

function MainScrollArea({ children, scrollDisabled }: { children: React.ReactNode; scrollDisabled: boolean }) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const h = el.clientHeight;
      if (h > 0) el.style.setProperty("--kiwi-viewport", `${h}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <main
      ref={ref}
      className={`relative min-w-0 flex-1 bg-[#F7F8FA] ${
        scrollDisabled ? "flex h-full flex-col overflow-hidden" : "overflow-y-auto"
      }`}
    >
      {children}
    </main>
  );
}
