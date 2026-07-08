import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { appUrl } from "@/lib/routes";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#f7faf0]">
      <div className="mx-auto grid min-h-[680px] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-kiwi-300 bg-white px-3 py-1.5 text-sm font-bold text-kiwi-700 shadow-sm">
            <Sparkles size={16} />
            AI image and video creation workspace
          </div>
          <h1 className="text-5xl font-black leading-[1.02] tracking-normal text-gray-950 sm:text-6xl">
            LazyKiwi
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-gray-650">
            A creator workspace for image generation, video effects, face swap, meme templates, and production-ready AI tools.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={appUrl("/app/video-generator")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-950 px-6 py-3 text-sm font-black text-white transition hover:bg-gray-800"
            >
              Start creating
              <ArrowRight size={17} />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-black text-gray-950 transition hover:bg-gray-50"
            >
              View pricing
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] border border-white bg-white shadow-soft">
            <Image
              src="https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/landing/lazykiwi-hero-placeholder.png"
              alt="LazyKiwi AI creation preview"
              fill
              priority
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-6 left-6 right-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-soft">
            <div className="grid grid-cols-3 gap-3 text-center">
              {["Text to video", "Image tools", "Effects"].map((item) => (
                <div key={item} className="rounded-xl bg-gray-50 px-3 py-3 text-xs font-black text-gray-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
