import CharacterSwapWorkbench from '../components/workbench/CharacterSwapWorkbench';
import { WorkbenchHero, WorkbenchPage } from '../components/workbench/primitives.jsx';

const TEMPLATES = [
  { name: "Outfit Change",     img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-face&character/outfit change.png" },
  { name: "Outfit Change Alt", img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-face&character/outfit change alt.png" },
  { name: "Dress Balon",       img: "https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-face&character/dress balon.png" },
];

export default function CharacterSwap() {
  return (
    <WorkbenchPage>
      <WorkbenchHero
        title="Character Swap"
        subtitle="Transform people into different characters with AI templates."
      >
        <CharacterSwapWorkbench fill />
      </WorkbenchHero>

      <section className="mx-auto w-full max-w-7xl px-4 pt-4 pb-24 sm:px-6 md:px-8">
        <h2 className="mb-8 text-2xl font-bold text-gray-900">Popular Character Swap Templates</h2>
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
