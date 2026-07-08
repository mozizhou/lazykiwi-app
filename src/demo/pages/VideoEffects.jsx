import VideoEffectsWorkbench from '../components/workbench/VideoEffectsWorkbench';
import { WorkbenchHero, WorkbenchPage } from '../components/workbench/primitives.jsx';

const CATEGORIES = [
  {
    title: "Destructive",
    templates: [
      { name: "Disintegration", img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/disintegration.png" },
      { name: "Exploded View",  img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/exploded view.png" },
      { name: "Head Explode",   img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/head explode.png" },
      { name: "Explosion",      img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/explosion.png" },
      { name: "Car Explosion",  img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/car explosion.png" },
      { name: "Melting",        img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/melting.png" },
    ]
  },
  {
    title: "Environmental",
    templates: [
      { name: "Money Rain",      img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/money rain.png" },
      { name: "Wings Angel",     img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/wings angel.png" },
      { name: "Lightning God",   img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/lightening god.png" },
      { name: "Splash Of Paint", img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/splash of paint.png" },
      { name: "Splash",          img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/splash.png" },
      { name: "Shadow Smoke",    img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/shadowsmoke.png" },
      { name: "Cottoncloud",     img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/cottoncloud.png" },
      { name: "Firelava",        img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/firelava.png" },
    ]
  },
  {
    title: "Biological",
    templates: [
      { name: "Ahegao",        img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/ahegao.png" },
      { name: "AI Werewolf",   img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/ai werewolf.png" },
      { name: "AI Raven",      img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/ai raven.png" },
      { name: "Tattoo Motion", img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/tattoo motion.png" },
      { name: "Tentacles",     img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-videoeffects/tentacles.png" },
    ]
  }
];

export default function VideoEffects() {
  return (
    <WorkbenchPage>
      <WorkbenchHero
        title="Video Effects"
        subtitle="Create dramatic AI video effects with ready-to-use templates."
      >
        <VideoEffectsWorkbench fill />
      </WorkbenchHero>

      <section className="mx-auto w-full max-w-7xl space-y-16 px-4 pt-4 pb-24 sm:px-6 md:px-8">
        {CATEGORIES.map(category => (
          <div key={category.title}>
            <h2 className="mb-8 text-2xl font-bold text-gray-900">{category.title}</h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {category.templates.map(template => (
                <div key={template.name} className="group flex cursor-pointer flex-col">
                  <div className="mb-4 aspect-video w-full overflow-hidden rounded-[16px] border border-gray-200 shadow-sm transition-all group-hover:shadow-md">
                    <img
                      src={template.img}
                      alt={template.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h4 className="truncate px-1 text-sm font-bold text-gray-900">{template.name}</h4>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </WorkbenchPage>
  );
}
