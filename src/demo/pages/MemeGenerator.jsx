import MemeGeneratorWorkbench from '../components/workbench/MemeGeneratorWorkbench';
import { WorkbenchHero, WorkbenchPage } from '../components/workbench/primitives.jsx';

const TEMPLATES = [
  { name: "Instant Explosion", img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-meme/instant explosion.png" },
  { name: "Force Squash",      img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-meme/force squash.png" },
  { name: "Forced Hug",        img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-meme/forced hug.png" },
  { name: "Melt Down",         img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-meme/melt down.png" },
  { name: "Funny Dance",       img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-meme/funny dance.png" },
  { name: "Spiral Launch",     img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-meme/spiral launch.png" },
];

export default function MemeGenerator() {
  return (
    <WorkbenchPage>
      <WorkbenchHero
        title="Meme Generator"
        subtitle="Create viral meme-style visuals with ready-to-use AI templates."
      >
        <MemeGeneratorWorkbench fill />
      </WorkbenchHero>

      <section className="mx-auto w-full max-w-7xl px-4 pt-4 pb-24 sm:px-6 md:px-8">
        <h2 className="mb-8 text-2xl font-bold text-gray-900">Popular Meme Templates</h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {TEMPLATES.map((template) => (
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
      </section>
    </WorkbenchPage>
  );
}
