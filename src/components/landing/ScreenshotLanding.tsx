"use client";

import Link from "next/link";
import { appUrl } from "@/lib/routes";
import {
  ArrowRight,
  ChevronDown,
  Languages,
  MessageCircle,
  Sparkles
} from "lucide-react";
import { useState } from "react";

const APP_VIDEO_GENERATOR = appUrl("/app/video-generator");
const APP_IMAGE_GENERATOR = appUrl("/app/image-generator");
const APP_VIDEO_EFFECTS = appUrl("/app/video-effects");
const APP_MEME_GENERATOR = appUrl("/app/meme-generator");
const APP_AVATAR_TALKING = appUrl("/app/avatar-talking");

const showcaseCards = [
  {
    href: APP_IMAGE_GENERATOR,
    image: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/resources1/01-gpt-image-2.png",
    title: "Sharper. Faster. Next-Level Image Creation."
  },
  {
    href: APP_VIDEO_EFFECTS,
    image: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/resources1/02-video-effects.png",
    title: "From Explosion to Magic - All in One Place."
  },
  {
    href: "/effects/bullet-time",
    image: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/resources1/03-camera-motion.png",
    title: "Cinematic Moves in Just One Click."
  },
  {
    href: APP_MEME_GENERATOR,
    image: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/resources1/04-meme-generator.png",
    title: "Turn One Image into Viral Motion."
  },
  {
    href: APP_AVATAR_TALKING,
    image: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/resources1/05-avatar-talking.png",
    title: "Make Avatars Speak in Seconds."
  }
];

const sections = [
  {
    id: "camera-motion",
    title: "Camera Motion",
    cards: [
      ["Bullet Time", "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/bullet time.png"],
      ["Earth Zoom Out", "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/earth zoom out.png"],
      ["Seamless Transition", "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/seamless transition.png"],
      ["Crash Zoom", "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/crash zoom.png"],
      ["Rolling Motion", "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/rolling motion.png"],
      ["Zoom Out", "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/zoom out.png"],
      ["Whip Pan", "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/whip pan.png"],
      ["Zoom Eyes", "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/zoom eyes.png"],
      ["360 Rotation", "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/360 rotation.png"],
      ["Eat Camera", "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/eat camera.png"],
      ["Flying Cam Transition", "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/flying cam transition.png"],
      ["Dolly In Zoom Out", "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/dolly in zoom out.png"]
    ]
  },
  {
    id: "video-effects",
    title: "Video Effects",
    cards: [
      ["Disintegration", "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/disintegration.png"],
      ["Exploded View", "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/exploded view.png"],
      ["Head Explode", "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/head explode.png"],
      ["Explosion", "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/explosion.png"],
      ["Melting", "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/melting.png"]
    ]
  },
  {
    id: "photo-effects",
    title: "Photo Effects",
    cards: [
      ["X-Ray Image", "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-photoeffects/x-ray.png"],
      ["Dirty Lens", "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-photoeffects/dirty lens.png"],
      ["Metallic Filter", "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-photoeffects/metallic filter.png"],
      ["Face Aging", "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-photoeffects/face aging.png"]
    ]
  },
  {
    id: "meme-generator",
    title: "Meme Generator",
    cards: [
      ["Instant Explosion", "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-meme/instant explosion.png"],
      ["Force Squash", "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-meme/force squash.png"],
      ["Forced Hug", "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-meme/forced hug.png"],
      ["Melt Down", "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-meme/melt down.png"],
      ["Funny Dance", "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-meme/funny dance.png"]
    ]
  }
];

const models = [
  "Flux",
  "Midjourney",
  "Stable Diffusion",
  "Ideogram",
  "Sora",
  "Veo",
  "Runway",
  "Kling",
  "Pika",
  "Luma",
  "Hailuo"
];

const megaMenus = {
  "AI Tools": [
    {
      title: "Video Tools",
      items: [
        { label: "Text to Video", href: APP_VIDEO_GENERATOR },
        { label: "Image to Video", href: APP_VIDEO_GENERATOR },
        { label: "Start & End Frames", href: APP_VIDEO_GENERATOR }
      ]
    },
    {
      title: "Image Tools",
      items: [
        { label: "Text to Image", href: APP_IMAGE_GENERATOR },
        { label: "Image to Image", href: APP_IMAGE_GENERATOR }
      ]
    }
  ],
  Models: [
    {
      title: "Video Models",
      items: [
        { label: "Veo 3", href: APP_VIDEO_GENERATOR },
        { label: "Sora 2", href: APP_VIDEO_GENERATOR },
        { label: "Kling AI", href: APP_VIDEO_GENERATOR },
        { label: "Seedance 2.0", href: APP_VIDEO_GENERATOR },
        { label: "More Video Models", href: APP_VIDEO_GENERATOR }
      ]
    },
    {
      title: "Image Models",
      items: [
        { label: "GPT Image 2", href: APP_IMAGE_GENERATOR },
        { label: "Nano Banana 2", href: APP_IMAGE_GENERATOR },
        { label: "Recraft", href: APP_IMAGE_GENERATOR },
        { label: "Ideogram", href: APP_IMAGE_GENERATOR },
        { label: "Stable Diffusion", href: APP_IMAGE_GENERATOR },
        { label: "More Image Models", href: APP_IMAGE_GENERATOR }
      ]
    }
  ],
  Effects: [
    {
      title: "Video Generator Templates",
      items: [
        { label: "Bullet Time", href: "/effects/bullet-time" },
        { label: "Earth Zoom Out", href: APP_VIDEO_GENERATOR },
        { label: "Seamless Transition", href: APP_VIDEO_GENERATOR }
      ]
    },
    {
      title: "",
      items: [
        { label: "Crash Zoom", href: APP_VIDEO_GENERATOR },
        { label: "Rolling Motion", href: APP_VIDEO_GENERATOR },
        { label: "Zoom Out", href: APP_VIDEO_GENERATOR }
      ]
    },
    {
      title: "",
      items: [
        { label: "Whip Pan", href: APP_VIDEO_GENERATOR },
        { label: "Zoom Eyes", href: APP_VIDEO_GENERATOR },
        { label: "360 Rotation", href: APP_VIDEO_GENERATOR },
        { label: "Eat Camera", href: APP_VIDEO_GENERATOR },
        { label: "Flying Camera", href: APP_VIDEO_GENERATOR }
      ]
    }
  ]
} satisfies Record<string, Array<{ title: string; items: Array<{ label: string; href: string }> }>>;

export function ScreenshotLanding() {
  return (
    <div className="min-h-screen bg-white text-[#06152b]">
      <Header />
      <main>
        <Hero />
        <Showcase />
        <PopularTools />
        <Models />
      </main>
      <FloatingActions />
    </div>
  );
}

function Header() {
  type MegaMenuName = keyof typeof megaMenus;
  const [activeMenu, setActiveMenu] = useState<MegaMenuName | null>(null);
  const menuNames = Object.keys(megaMenus) as MegaMenuName[];

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 bg-white/55 shadow-[0_18px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl"
      onMouseLeave={() => setActiveMenu(null)}
    >
      <div className="relative z-10 mx-auto flex h-16 max-w-[1230px] items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/kiwi-logo.svg" alt="LazyKiwi" className="h-[30px] w-[30px]" />
          <span className="text-[17px] font-extrabold tracking-normal text-[#111827]">LazyKiwi</span>
        </Link>

        <nav className="hidden items-center gap-9 text-[15px] font-medium text-slate-700 md:flex">
          {menuNames.map((item) => (
            <button
              key={item}
              onMouseEnter={() => setActiveMenu(item)}
              onFocus={() => setActiveMenu(item)}
              className="inline-flex h-16 items-center gap-1.5 transition hover:text-slate-950"
            >
              {item}
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${activeMenu === item ? "rotate-180" : ""}`}
              />
            </button>
          ))}
          <Link href="/pricing" onMouseEnter={() => setActiveMenu(null)} className="transition hover:text-slate-950">
            Pricing
          </Link>
          <Link href="/blog" onMouseEnter={() => setActiveMenu(null)} className="transition hover:text-slate-950">
            Blog
          </Link>
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <button className="px-2 text-[14px] font-extrabold text-slate-800">Sign in</button>
          <Link
            href={APP_VIDEO_GENERATOR}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0f172a] px-5 text-[14px] font-extrabold text-white shadow-sm transition hover:bg-[#111827]"
          >
            <Sparkles size={15} />
            Create Now
          </Link>
        </div>
      </div>
      {activeMenu ? <MegaMenu groups={megaMenus[activeMenu]} /> : null}
    </header>
  );
}

function MegaMenu({
  groups
}: {
  groups: Array<{ title: string; items: Array<{ label: string; href: string }> }>;
}) {
  return (
    <div
      className="absolute left-0 right-0 top-16 z-0 border-t border-white/10 bg-[linear-gradient(180deg,rgba(8,13,20,0.92)_0%,rgba(8,13,20,0.84)_58%,rgba(8,13,20,0.62)_100%)] shadow-[0_26px_80px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl"
      onMouseEnter={() => undefined}
    >
      <div className="pointer-events-none absolute inset-0 bg-black/18" />
      <div className="relative mx-auto flex min-h-[214px] max-w-[1230px] gap-[110px] px-5 py-10">
        {groups.map((group, index) => (
          <div key={`${group.title}-${index}`} className="min-w-[230px]">
            {group.title ? (
              <div className="mb-5 text-[13px] font-black uppercase tracking-[0.19em] text-white/76 drop-shadow-[0_1px_3px_rgba(0,0,0,0.65)]">
                {group.title}
              </div>
            ) : (
              <div className="mb-5 h-[16px]" />
            )}
            <div className="space-y-4">
              {group.items.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block text-[16px] font-semibold text-white/95 drop-shadow-[0_2px_5px_rgba(0,0,0,0.85)] transition hover:translate-x-1 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative h-[920px] overflow-hidden">
      <img
        src="https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/landing/lazykiwi-hero-placeholder.png"
        alt="LazyKiwi floating on turquoise water"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/35 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pt-12 text-center">
        <h1 className="max-w-[760px] text-[58px] font-black leading-[1.08] tracking-normal text-white drop-shadow-[0_3px_14px_rgba(0,0,0,0.22)] md:text-[64px]">
          Create videos with LazyKiwi.
        </h1>
        <p className="mt-6 text-[21px] font-medium leading-8 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
          Turn simple ideas, images, and frames into scroll-stopping AI videos.
        </p>
        <Link
          href={APP_VIDEO_GENERATOR}
          className="mt-10 inline-flex h-14 items-center gap-2 rounded-2xl border border-white/55 bg-white/90 px-9 text-[16px] font-extrabold text-slate-900 shadow-[0_14px_36px_rgba(15,23,42,0.16)] backdrop-blur transition hover:bg-white"
        >
          <Sparkles size={17} className="text-emerald-500" />
          Create Now
          <ArrowRight size={17} className="text-emerald-500" />
        </Link>
      </div>
      <div className="absolute bottom-6 left-1/2 w-[min(525px,calc(100%-40px))] -translate-x-1/2 rounded-xl border border-slate-500/30 bg-white/70 px-5 py-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-center gap-3 text-[15px] text-slate-800">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
            <Sparkles size={15} />
          </span>
          <span>A lazy kiwi floats on turquoise water, enjoying a sunny tropical day.</span>
        </div>
      </div>
    </section>
  );
}

function Showcase() {
  return (
    <section className="bg-white pt-[82px]">
      <div className="mx-auto max-w-[1248px] px-5">
        <h2 className="text-[30px] font-black tracking-normal text-[#06152b]">Create more with LazyKiwi</h2>
        <p className="mt-3 text-[16px] text-slate-600">Every creative tool you need, all in one place.</p>
        <div className="mt-9 overflow-hidden">
          <div className="flex w-max gap-6">
            {showcaseCards.map((card) => (
              <Link key={card.image} href={card.href} className="block w-[340px] shrink-0">
                <img src={card.image} alt={card.title} className="h-[190px] w-full rounded-[14px] object-cover" />
                <h3 className="mt-4 text-[17px] font-black leading-[1.32] text-[#06152b]">{card.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PopularTools() {
  return (
    <section className="bg-white pt-[128px]">
      <div className="mx-auto max-w-[1248px] px-5">
        <h2 className="text-[30px] font-black tracking-normal text-[#06152b]">Popular tools and templates</h2>
        <div className="mt-6 flex gap-8 border-b border-slate-200 pb-5">
          {sections.map((section) => (
            <a key={section.id} href={`#${section.id}`} className="text-[15px] font-extrabold text-slate-600 hover:text-[#06152b]">
              {section.title}
            </a>
          ))}
        </div>

        <div className="space-y-[68px] pt-11">
          {sections.map((section) => (
            <div key={section.id} id={section.id} className="scroll-mt-24">
              <h3 className="mb-6 text-[27px] font-black tracking-normal text-[#06152b]">{section.title}</h3>
              <div className="grid grid-cols-1 gap-x-[18px] gap-y-5 sm:grid-cols-2 lg:grid-cols-5">
                {section.cards.map(([name, image]) => (
                  <Link key={name} href={APP_VIDEO_GENERATOR} className="group block">
                    <img
                      src={image}
                      alt={name}
                      className="h-[128px] w-full rounded-xl object-cover transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg"
                    />
                    <div className="mt-2 text-[14px] font-extrabold text-[#06152b]">{name}</div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Models() {
  return (
    <section className="mt-16 border-t border-slate-100 bg-white py-20 text-center">
      <div className="mx-auto max-w-[1248px] px-5">
        <h2 className="text-[38px] font-black tracking-normal text-[#06152b]">
          All the models you love. <span className="text-emerald-500">One place.</span>
        </h2>
        <p className="mt-4 text-[16px] text-slate-600">Switch between the world's best AI models without leaving LazyKiwi.</p>
        <div className="mx-auto mt-12 flex max-w-[760px] flex-wrap justify-center gap-3">
          {models.map((model) => (
            <button
              key={model}
              className="h-11 rounded-xl border border-slate-200 bg-white px-6 text-[14px] font-extrabold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              {model}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function FloatingActions() {
  return (
    <>
      <button
        aria-label="Translate"
        className="fixed right-2 top-[22%] z-50 flex h-9 w-9 items-center justify-center rounded-full bg-pink-300 text-white shadow-lg ring-4 ring-white/60"
      >
        <Languages size={20} />
      </button>
      <button
        aria-label="Chat"
        className="fixed bottom-[126px] right-0 z-50 flex h-11 w-11 items-center justify-center rounded-l-2xl bg-slate-900 text-emerald-400 shadow-lg"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
          <MessageCircle size={19} />
        </span>
      </button>
    </>
  );
}
