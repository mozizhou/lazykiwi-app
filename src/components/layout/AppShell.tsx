"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gift, LifeBuoy, LogOut, Menu, User } from "lucide-react";
import { appNavigation } from "@/data/navigation";
import { cn } from "@/lib/cn";
import { useState } from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-950">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-gray-200 bg-white transition-transform md:relative md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5">
          <Link href="/" className="flex items-center gap-2.5 font-extrabold">
            <Image src="https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/kiwi-logo.svg" alt="LazyKiwi" width={30} height={30} />
            <span>LazyKiwi</span>
          </Link>
        </div>
        <nav className="custom-scrollbar flex-1 overflow-y-auto px-4 py-5">
          {appNavigation.map((group) => (
            <div key={group.category} className="mb-6">
              <div className="mb-2 px-3 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">
                {group.category}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition",
                        active ? "bg-gray-950 text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-950"
                      )}
                    >
                      <Icon size={18} />
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-gray-100 p-4">
          <Link
            href="/pricing"
            className="mb-3 flex items-center gap-2 rounded-xl bg-kiwi-100 px-3 py-2.5 text-sm font-black text-kiwi-700"
          >
            <Gift size={16} />
            Claim Gift (+50 Credits)
          </Link>
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-kiwi-400 text-sm font-black">
              MS
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-black">Mark Sheng</div>
              <div className="truncate text-xs text-gray-500">28 credits</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[User, LifeBuoy, LogOut].map((Icon, index) => (
              <button
                key={index}
                className="flex h-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-950"
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>
      </aside>
      {mobileOpen ? <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setMobileOpen(false)} /> : null}
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg border border-gray-200 p-2">
            <Menu size={18} />
          </button>
          <span className="text-sm font-black">LazyKiwi</span>
          <div className="w-9" />
        </div>
        {children}
      </main>
    </div>
  );
}
