"use client";

import { useEffect, useState } from 'react';
import {
  /* Home — kept for future homepage landing nav entry */
  Video, Image, X,
  ChevronLeft, ChevronRight, User, LifeBuoy, LogOut, Zap, Copy,
  Check, LogIn, UserPlus, LayoutDashboard
} from 'lucide-react';
import clsx from 'clsx';
import { useUserProfile } from '@/lib/user/useUserProfile';
import { getProfileDisplay } from '@/lib/user/display';
import { adminService } from '@/lib/admin/service';

// HOME category removed from console nav.
// The Home page code is preserved in src/pages/Home.jsx for reuse as homepage landing.
// Restore by adding: { category: "HOME", items: [{ id: "home", label: "Home", icon: HomeIcon }] }
const IA = [
  {
    category: "GENERATOR",
    items: [
      { id: "video-generator", label: "Video Generator", icon: Video },
      { id: "image-generator", label: "Image Generator", icon: Image }
    ]
  }
];

export default function Sidebar({
  activePage,
  setActivePage,
  navigateToPage,
  isMobileOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  isLoggedIn,
  authSession,
  onLogin,
  onStartFree,
  onLogout,
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [supportCopied, setSupportCopied] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!isLoggedIn) {
      setIsAdmin(false);
      return undefined;
    }
    adminService.checkAdmin().then((result) => {
      if (mounted) setIsAdmin(result);
    });
    return () => {
      mounted = false;
    };
  }, [isLoggedIn]);

  const { profile, credits, loginEmail, loading: profileLoading } = useUserProfile();
  const displayEmailSource = loginEmail || authSession?.email || null;
  const { nickname, email, initials } = getProfileDisplay(
    isLoggedIn ? profile : null,
    displayEmailSource,
    credits,
  );

  const handleNavigation = (pageId) => {
    setActivePage(pageId);
    onClose?.();
  };

  const handleSupportCopy = async () => {
    const supportEmail = 'support@lazykiwi.ai';
    try {
      if (!navigator.clipboard) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(supportEmail);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = supportEmail;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setSupportCopied(true);
    window.setTimeout(() => setSupportCopied(false), 1600);
  };

  const handleLogout = () => {
    onLogout?.();
    setShowProfileMenu(false);
  };

  const displayName = nickname || 'LazyKiwi User';
  const displayEmail = email || '';
  const creditLabel = profileLoading ? '...' : credits != null ? `${credits} Cr` : null;

  return (
    <div
      className={clsx(
        "fixed inset-y-0 left-0 z-40 h-full bg-[#FAFAFA] border-r border-gray-100 flex flex-col shrink-0 transform transition-all duration-300 ease-out md:relative md:z-20 md:translate-x-0",
        isCollapsed ? "w-20" : "w-64 max-w-[85vw]",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Header: Logo & Brand + Collapse/Close controls */}
      <div className={clsx(
        "flex items-center border-b border-gray-100 shrink-0",
        isCollapsed ? "justify-center px-2 py-3" : "justify-between px-4 py-3.5"
      )}>
        {/* Logo and Brand */}
        {!isCollapsed ? (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2.5 rounded-lg pl-3 pr-2 py-1 font-bold tracking-tight text-gray-900 transition hover:bg-gray-100"
            aria-label="Refresh LazyKiwi workbench"
          >
            <img src="https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/kiwi-logo.svg" alt="LazyKiwi Logo" width={28} height={28} className="shrink-0" />
            <span className="text-base font-extrabold text-gray-900">LazyKiwi</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 transition text-gray-500 hover:text-gray-900 shrink-0"
            title="Expand sidebar"
          >
            <ChevronRight size={18} />
          </button>
        )}

        {/* Controls on expanded */}
        {!isCollapsed && (
          <div className="flex items-center gap-1">
            {/* Desktop collapse toggle */}
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-600"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
            {/* Mobile close */}
            <button
              type="button"
              onClick={onClose}
              className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-600"
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pt-4 md:pt-6 space-y-1">
        {IA.map((group, idx) => (
          <div key={idx} className={clsx(isCollapsed ? "px-2" : "px-4")}>
            {idx > 0 && (
              <div className={clsx("h-px bg-gray-200/40 my-3", isCollapsed ? "mx-1" : "mx-2")} />
            )}
            <div className="flex flex-col gap-1">
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = activePage === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={clsx(
                      "flex items-center rounded-lg text-sm font-medium transition-all text-left shrink-0 group/item",
                      isCollapsed
                        ? "justify-center w-full py-2.5"
                        : "gap-3 px-3 py-2 w-full",
                      isActive
                        ? "bg-gray-200/60 text-gray-900 font-semibold"
                        : "text-gray-500 hover:bg-gray-100/50 hover:text-gray-900"
                    )}
                  >
                    <Icon size={18} className={clsx("transition-colors", isActive ? "text-gray-800" : "text-gray-400 group-hover/item:text-gray-700")} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom account section */}
      <div className="shrink-0 p-4 border-t border-gray-100 relative bg-[#FAFAFA] flex flex-col gap-3 items-center">
        {isLoggedIn && (
          <button
            type="button"
            onClick={() => navigateToPage?.('pricing', '/pricing')}
            title={isCollapsed ? 'Upgrade' : undefined}
            className={clsx(
              "flex items-center justify-center rounded-xl bg-gray-900 font-bold text-white transition hover:bg-black",
              isCollapsed ? "h-10 w-10" : "w-full gap-2 px-4 py-2.5 text-sm"
            )}
          >
            <Zap size={16} />
            {!isCollapsed && <span>Upgrade</span>}
          </button>
        )}

        {!isLoggedIn ? (
          <div className={clsx("flex w-full gap-2", isCollapsed ? "flex-col" : "flex-row")}>
            <button
              type="button"
              onClick={onLogin}
              title={isCollapsed ? 'Log in' : undefined}
              className={clsx(
                "flex items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 transition hover:bg-gray-100",
                isCollapsed ? "h-10 w-10" : "flex-1 gap-2 px-3 py-2.5"
              )}
            >
              <LogIn size={16} />
              {!isCollapsed && <span>Log in</span>}
            </button>
            <button
              type="button"
              onClick={onStartFree}
              title={isCollapsed ? 'Start for free' : undefined}
              className={clsx(
                "flex items-center justify-center rounded-xl bg-gray-900 text-sm font-bold text-white transition hover:bg-black",
                isCollapsed ? "h-10 w-10" : "flex-1 gap-2 px-3 py-2.5"
              )}
            >
              <UserPlus size={16} />
              {!isCollapsed && <span>Start for free</span>}
            </button>
          </div>
        ) : isCollapsed ? (
          /* Avatar only in collapsed mode */
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="relative shrink-0 focus:outline-none group"
            title="Profile menu"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-kiwi-green to-lime-300 text-gray-950 font-extrabold text-[13px] shadow-sm transition-transform duration-200 group-hover:scale-105">
              {initials}
            </div>
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-kiwi-green-dark ring-2 ring-[#FAFAFA] animate-pulse" />
          </button>
        ) : (
          /* Simplified clean profile block in expanded mode */
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full flex items-center justify-between gap-3 text-left focus:outline-none group hover:bg-gray-200/40 p-1.5 -m-1.5 rounded-xl transition-all duration-200"
            title="Profile menu"
          >
            {/* Avatar and Name */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-kiwi-green to-lime-300 text-gray-950 font-extrabold text-[13px] shadow-sm transition-transform duration-200 group-hover:scale-105">
                  {initials}
                </div>
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-kiwi-green-dark ring-2 ring-[#FAFAFA] animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-gray-800 truncate leading-snug group-hover:text-gray-900 transition-colors">{displayName}</div>
                <div className="text-[11px] text-gray-400 font-medium truncate mt-0.5">{displayEmail}</div>
              </div>
            </div>

            {/* Muted elegant credit badge */}
            {creditLabel ? (
              <span className="shrink-0 px-2 py-0.5 rounded-full bg-gray-200/50 text-[10px] font-bold text-gray-500 group-hover:text-gray-700 transition-colors">
                {creditLabel}
              </span>
            ) : null}
          </button>
        )}

        {/* Dropdown Menu Popover */}
        {isLoggedIn && showProfileMenu && (
          <>
            <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowProfileMenu(false)} />
            <div className={clsx(
              "absolute bottom-full mb-2 z-50 rounded-2xl border border-gray-200/60 bg-white/95 backdrop-blur-md p-1.5 shadow-2xl flex flex-col gap-0.5 w-60",
              isCollapsed ? "left-14" : "left-4"
            )}>
              {isAdmin && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    window.location.assign('/admin');
                  }}
                  className="w-full px-3 py-2.5 text-left hover:bg-gray-50 rounded-xl flex items-center gap-2.5 text-[13px] font-semibold text-gray-700 transition"
                >
                  <LayoutDashboard size={15} className="text-kiwi-green-dark" />
                  管理后台
                </button>
              )}
              <button
                onClick={() => {
                  navigateToPage?.('settings', '/settings');
                  setShowProfileMenu(false);
                }}
                className="w-full px-3 py-2.5 text-left hover:bg-gray-50 rounded-xl flex items-center gap-2.5 text-[13px] font-semibold text-gray-700 transition"
              >
                <User size={15} className="text-gray-400" />
                Account Setting
              </button>
              <button
                type="button"
                onClick={handleSupportCopy}
                className="w-full px-3 py-2.5 text-left hover:bg-gray-50 rounded-xl flex items-center gap-2.5 text-[13px] font-semibold text-gray-700 transition"
              >
                <LifeBuoy size={15} className="text-gray-400" />
                <span className="flex-1">Contact Support</span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-kiwi-green-dark">
                  {supportCopied ? <><Check size={13} /> Copied</> : <Copy size={13} />}
                </span>
              </button>

              <div className="h-px bg-gray-100/80 my-1 mx-1"></div>

              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-xl flex items-center gap-2.5 text-[13px] font-semibold text-red-600 hover:bg-red-50 transition"
              >
                <LogOut size={15} className="text-red-400" /> Log out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
