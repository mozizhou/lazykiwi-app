import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import VideoGeneratorWorkbench from '../components/workbench/VideoGeneratorWorkbench';
import ImageGeneratorWorkbench from '../components/workbench/ImageGeneratorWorkbench';

const MODELS = ["Flux", "Midjourney", "Stable Diffusion", "Ideogram", "Sora", "Veo", "Runway", "Kling", "Pika", "Luma", "Hailuo"];

const POPULAR_SECTIONS = [
  {
    id: "gpt-image-2", title: "GPT Image 2", targetPage: "image-generator",
    images: [
      "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-gptimage2/ChatGPT Image 2026年5月7日 15_07_46 (1).png",
      "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-gptimage2/ChatGPT Image 2026年5月7日 15_07_47 (2).png",
      "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-gptimage2/ChatGPT Image 2026年5月7日 15_07_47 (3).png",
      "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-gptimage2/ChatGPT Image 2026年5月7日 15_07_47 (4).png",
      "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-gptimage2/ChatGPT Image 2026年5月7日 15_07_48 (5).png",
      "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-gptimage2/ChatGPT Image 2026年5月7日 15_07_48 (6).png",
    ]
  },
  {
    id: "photo-effects", title: "Photo Effects",
    cards: [
      { name: "X-Ray Image Online", img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-photoeffects/x-ray.png" },
      { name: "Dirty Lens",         img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-photoeffects/dirty lens.png" },
      { name: "Metallic Filter",    img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-photoeffects/metallic filter.png" },
      { name: "Face Aging",         img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-photoeffects/face aging.png" },
    ]
  },
  {
    id: "video-effects", title: "Video Effects",
    cards: [
      { name: "Disintegration",  img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/disintegration.png" },
      { name: "Exploded View",   img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/exploded view.png" },
      { name: "Head Explode",    img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/head explode.png" },
      { name: "Explosion",       img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/explosion.png" },
      { name: "Car Explosion",   img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/car explosion.png" },
      { name: "Melting",         img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/melting.png" },
      { name: "Money Rain",      img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/money rain.png" },
      { name: "Wings Angel",     img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/wings angel.png" },
      { name: "Lightning God",   img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/lightening god.png" },
      { name: "Splash Of Paint", img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/splash of paint.png" },
      { name: "Splash",          img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/splash.png" },
      { name: "Shadow Smoke",    img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/shadowsmoke.png" },
      { name: "Cottoncloud",     img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/cottoncloud.png" },
      { name: "Firelava",        img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/firelava.png" },
      { name: "Ahegao",          img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/ahegao.png" },
      { name: "AI Werewolf",     img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/ai werewolf.png" },
      { name: "AI Raven",        img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/ai raven.png" },
      { name: "Tattoo Motion",   img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/tattoo motion.png" },
      { name: "Tentacles",       img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/tentacles.png" },
    ]
  },
  {
    id: "camera-motion", title: "Camera Motion",
    cards: [
      { name: "Bullet Time",          img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/bullet time.png" },
      { name: "Earth Zoom Out",        img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/earth zoom out.png" },
      { name: "Seamless Transition",   img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/seamless transition.png" },
      { name: "Crash Zoom",            img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/crash zoom.png" },
      { name: "Rolling Motion",        img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/rolling motion.png" },
      { name: "Zoom Out",              img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/zoom out.png" },
      { name: "Whip Pan",              img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/whip pan.png" },
      { name: "Zoom Eyes",             img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/zoom eyes.png" },
      { name: "360 Rotation",          img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/360 rotation.png" },
      { name: "Eat Camera",            img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/eat camera.png" },
      { name: "Flying Cam Transition", img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/flying cam transition.png" },
      { name: "Dolly In Zoom Out",     img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/dolly in zoom out.png" },
    ]
  },
  {
    id: "physical-dynamics", title: "Physical Dynamics",
    cards: [
      { name: "I BE I can fly",  img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-physicaldynamics/i be i can fly.png" },
      { name: "Air Bending",     img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-physicaldynamics/ai bending.png" },
      { name: "Facial-Punch",    img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-physicaldynamics/facial punch.png" },
      { name: "Earth Wave",      img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-physicaldynamics/earth wave.png" },
      { name: "Clothes Falling", img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-physicaldynamics/clothes falling.png" },
      { name: "AI Flip",         img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-physicaldynamics/ai flip.png" },
      { name: "Rush Train",      img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-physicaldynamics/rush train.png" },
    ]
  },
  {
    id: "meme-generator", title: "Meme Generator",
    cards: [
      { name: "Instant Explosion", img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-meme/instant explosion.png" },
      { name: "Force Squash",      img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-meme/force squash.png" },
      { name: "Forced Hug",        img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-meme/forced hug.png" },
      { name: "Melt Down",         img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-meme/melt down.png" },
      { name: "Funny Dance",       img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-meme/funny dance.png" },
      { name: "Spiral Launch",     img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-meme/spiral launch.png" },
    ]
  },
  {
    id: "face-character", title: "Face & Character",
    cards: [
      { name: "Face Swap",        img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-face&character/face swap.png" },
      { name: "Outfit Change",    img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-face&character/outfit change.png" },
      { name: "Outfit Change Alt",img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-face&character/outfit change alt.png" },
      { name: "Dress Balon",      img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-face&character/dress balon.png" },
    ]
  },
  {
    id: "apps", title: "Apps", targetPage: "avatar-talking",
    images: [
      "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-apps/ChatGPT Image 2026年5月7日 17_33_07 (1).png",
      "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-apps/ChatGPT Image 2026年5月7日 17_33_08 (2).png",
      "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-apps/ChatGPT Image 2026年5月7日 17_33_08 (3).png",
    ]
  },
  {
    id: "tools", title: "Tools",
    cards: [
      { name: "Background Remover", img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-tools/background remover.png" },
      { name: "Image Editor",       img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-tools/image editor.png" },
      { name: "Video Editor",       img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-tools/video editor.png" },
      { name: "Photo Enhancement",  img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-tools/photo enhancement.png" },
    ]
  },
];


const handleCardClick = (cardName, tabName, setActivePage) => {
  if (tabName === "GPT Image 2") setActivePage("image-generator");
  else if (tabName === "Photo Effects") setActivePage("photo-effects");
  else if (tabName === "Video Effects") setActivePage("video-effects");
  else if (tabName === "Camera Motion" || tabName === "Physical Dynamics") setActivePage("video-generator");
  else if (tabName === "Meme Generator") setActivePage("meme-generator");
  else if (tabName === "Face & Character") {
    if (cardName === "Face Swap") setActivePage("face-swap");
    else setActivePage("character-swap");
  }
  else if (tabName === "Apps") setActivePage("avatar-talking");
  else if (tabName === "Tools") {
    if (cardName === "Background Remover") setActivePage("background-remover");
    else if (cardName === "Video Editor") setActivePage("video-editor");
    else setActivePage("image-editor");
  }
};

const CAROUSEL_CARDS = [
  { id: "image-generator", img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/resources1/01-gpt-image-2.png", title: "Sharper. Faster. Next-Level Image Creation." },
  { id: "video-effects", img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/resources1/02-video-effects.png", title: "From Explosion to Magic — All in One Place." },
  { id: "video-generator", img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/resources1/03-camera-motion.png", title: "Cinematic Moves in Just One Click." },
  { id: "meme-generator", img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/resources1/04-meme-generator.png", title: "Turn One Image into Viral Motion." },
  { id: "avatar-talking", img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/resources1/05-avatar-talking.png", title: "Make Avatars Speak in Seconds." },
  { id: "photo-effects", img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/resources1/06-photo-effects.png", title: "From Simple Photos to Scroll-Stopping Visuals." },
  { id: "face-swap", img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/resources1/07-face-swap.png", title: "Swap Faces Naturally and Fast." },
  { id: "character-swap", img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/resources1/08-character-swap.png", title: "Change Outfits, Roles, and Characters." },
];


const FAQ = [
  { q: "What is LazyKiwi?", a: "LazyKiwi is an AI creative studio." },
  { q: "How many credits do I get?", a: "You get 28 credits on the free tier." },
  { q: "Can I use it for commercial projects?", a: "Yes, Pro members have full commercial rights." }
];

export default function Home({ setActivePage }) {
  const [toggleMode, setToggleMode] = useState('Video');
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="flex flex-col min-w-0 overflow-x-hidden">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center pt-16 sm:pt-24 pb-12 sm:pb-16 px-4">
        <h1 className="text-4xl sm:text-6xl font-bold mb-8 tracking-tight text-center">
          Create with <span className="text-kiwi-green-dark">Kiwi.</span>
        </h1>

        <div className="w-full max-w-3xl">
          <div className="inline-flex gap-1 rounded-xl bg-gray-100 p-1 mb-5">
            <button
              type="button"
              onClick={() => setToggleMode('Video')}
              className={`px-5 py-1.5 rounded-lg font-bold text-sm transition-all ${
                toggleMode === 'Video'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Video
            </button>
            <button
              type="button"
              onClick={() => setToggleMode('Image')}
              className={`px-5 py-1.5 rounded-lg font-bold text-sm transition-all ${
                toggleMode === 'Image'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Image
            </button>
          </div>

          {toggleMode === 'Video' ? <VideoGeneratorWorkbench /> : <ImageGeneratorWorkbench />}
        </div>
      </div>

      {/* Create more with LazyKiwi Carousel */}
      <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full py-12 overflow-hidden min-w-0">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Create more with LazyKiwi</h2>
        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8" style={{ scrollbarWidth: 'none' }}>
          {CAROUSEL_CARDS.map(card => (
            <div
              key={card.id}
              onClick={() => setActivePage(card.id)}
              className="w-[85vw] max-w-full sm:w-[380px] flex-none cursor-pointer group"
            >
              <div className="w-full aspect-video max-h-[220px] rounded-[16px] overflow-hidden bg-gray-100 mb-4 shadow-sm group-hover:shadow-md transition-all border border-gray-100">
                <img
                  src={card.img}
                  alt={card.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="font-bold text-lg text-gray-900 leading-snug">{card.title}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Popular tools and templates Navigation */}
      <div className="max-w-7xl mx-auto w-full pt-8 sm:pt-12 pb-4 sticky top-0 bg-white sm:bg-[#F9FAFB] z-30 px-4 sm:px-6 md:px-8 border-b border-gray-100/50 min-w-0">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Popular tools and templates</h2>
        </div>
        <div className="flex gap-4 sm:gap-8 overflow-x-auto pb-px border-b border-gray-200 min-w-0" style={{ scrollbarWidth: 'none' }}>
          {POPULAR_SECTIONS.map(section => (
            <button
              key={section.id}
              onClick={() => {
                document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="pb-4 font-semibold text-base whitespace-nowrap transition-colors text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-900 cursor-pointer"
            >
              {section.title}
            </button>
          ))}
        </div>
      </div>

      {/* All Sections Displayed Vertically */}
      <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full pb-12 space-y-16 mt-8 min-w-0">
        {POPULAR_SECTIONS.map(section => (
          <div key={section.id} id={section.id} className="scroll-mt-32">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{section.title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap gap-5 min-w-0">
              {section.images ? (
                section.images.map((imgSrc, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActivePage(section.targetPage)}
                    className="w-full md:w-[260px] lg:w-[280px] max-w-full h-[160px] rounded-[16px] overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200"
                  >
                    <img src={imgSrc} alt={section.title} className="w-full h-full object-cover" />
                  </div>
                ))
              ) : (
                section.cards.map(card => (
                  <div
                    key={card.name}
                    onClick={() => handleCardClick(card.name, section.title, setActivePage)}
                    className="w-full md:w-[260px] lg:w-[280px] max-w-full group cursor-pointer"
                  >
                    <div className="w-full h-[158px] rounded-[16px] mb-3 overflow-hidden shadow-sm group-hover:shadow-md transition-all relative border border-gray-200">
                      <img src={card.img} alt={card.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm px-1 truncate">{card.name}</h4>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Models Section */}
      <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full py-16 sm:py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-12 tracking-tight text-gray-900">
          All the models you love. <span className="text-kiwi-green-dark italic">One place.</span>
        </h2>
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {MODELS.map(model => (
            <div key={model} className="px-7 py-3.5 bg-white border border-gray-200 shadow-sm rounded-2xl font-bold text-gray-700 hover:border-kiwi-green hover:text-kiwi-green-dark hover:bg-kiwi-light-green/20 transition-all cursor-pointer text-sm">
              {model}
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="px-4 sm:px-6 md:px-8 max-w-3xl mx-auto w-full py-16">
        <h2 className="text-3xl font-bold mb-10 text-center text-gray-900">Questions?</h2>
        <div className="space-y-4">
          {FAQ.map((item, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-5 sm:px-8 py-5 flex items-center justify-between gap-4 font-bold text-left hover:bg-gray-50 transition-colors text-gray-900"
              >
                {item.q}
                {openFaq === i ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
              </button>
              {openFaq === i && (
                <div className="px-5 sm:px-8 pb-6 text-gray-600 border-t border-gray-100 pt-4 text-sm leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
