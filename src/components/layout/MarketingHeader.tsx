import Image from "next/image";
import Link from "next/link";
import { appUrl } from "@/lib/routes";

const navItems = [
  { label: "Tools", href: appUrl("/app/video-generator") },
  { label: "Effects", href: "/effects/bullet-time" },
  { label: "Pricing", href: "/pricing" }
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold tracking-tight text-gray-950">
          <Image src="https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/kiwi-logo.svg" width={30} height={30} alt="LazyKiwi" />
          <span>LazyKiwi</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-gray-600 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-gray-950">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href={appUrl("/app/video-generator")}
          className="rounded-full bg-gray-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-gray-800"
        >
          Start creating
        </Link>
      </div>
    </header>
  );
}
