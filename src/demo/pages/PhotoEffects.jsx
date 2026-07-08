import PhotoEffectsWorkbench from '../components/workbench/PhotoEffectsWorkbench';
import { WorkbenchHero, WorkbenchPage } from '../components/workbench/primitives.jsx';

const PHOTO_EFFECTS = [
  { name: "X-Ray Image Online", img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-photoeffects/x-ray.png" },
  { name: "Dirty Lens",         img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-photoeffects/dirty lens.png" },
  { name: "Metallic Filter",    img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-photoeffects/metallic filter.png" },
  { name: "Face Aging",         img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-photoeffects/face aging.png" },
];

export default function PhotoEffects() {
  return (
    <WorkbenchPage>
      <WorkbenchHero
        title="Photo Effects"
        subtitle="Transform your photos with creative AI effects in seconds."
      >
        <PhotoEffectsWorkbench fill />
      </WorkbenchHero>

      <section className="mx-auto w-full max-w-7xl px-4 pt-4 pb-20 sm:px-6 md:px-8">
        <h2 className="mb-8 text-2xl font-bold text-gray-900">Popular Photo Effects</h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {PHOTO_EFFECTS.map((effect) => (
            <div key={effect.name} className="group flex cursor-pointer flex-col">
              <div className="mb-4 aspect-video w-full overflow-hidden rounded-[16px] border border-gray-200 shadow-sm transition-all group-hover:shadow-md">
                <img
                  src={effect.img}
                  alt={effect.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h4 className="truncate px-1 text-sm font-bold text-gray-900">{effect.name}</h4>
            </div>
          ))}
        </div>
      </section>
    </WorkbenchPage>
  );
}
