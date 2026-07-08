import { ImagePlus, Scissors, Image as ImageIcon, SlidersHorizontal, Send } from 'lucide-react';
import BackgroundRemoverWorkbench from '../components/workbench/BackgroundRemoverWorkbench';
import { WorkbenchHero, WorkbenchPage } from '../components/workbench/primitives.jsx';

export default function BackgroundRemover() {
  return (
    <WorkbenchPage>
      <WorkbenchHero
        title="Background Remover"
        subtitle="Remove backgrounds from images in seconds with clean AI cutouts."
      >
        <BackgroundRemoverWorkbench fill />
      </WorkbenchHero>

      <section className="mx-auto w-full max-w-7xl px-4 pt-4 pb-20 sm:px-6 md:px-8">
        <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">How to use Background Remover</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <StepCard step="Step 1" title="Upload your image" desc="Upload the image you want to cut out or clean up.">
            <ImagePlus size={36} className="text-indigo-300" />
          </StepCard>
          <StepCard step="Step 2" title="Adjust cutout settings" desc="Choose the cutout mode, background option, and smoothness level for the result you want." gradient="from-emerald-50 to-teal-50">
            <div className="flex gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm"><Scissors size={14} className="text-teal-400" /></div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm"><ImageIcon size={14} className="text-teal-400" /></div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm"><SlidersHorizontal size={14} className="text-teal-400" /></div>
            </div>
          </StepCard>
          <StepCard step="Step 3" title="Generate and download" desc="Generate the cutout and get a clean background-free image in seconds." gradient="from-amber-50 to-orange-50">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-kiwi-green shadow-sm"><Send size={14} className="text-gray-900" /></div>
          </StepCard>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl space-y-12 px-4 pb-12 text-gray-600 sm:px-6 md:px-8">
        <div>
          <h2 className="mb-5 text-2xl font-bold text-gray-900">What is AI Background Remover?</h2>
          <p className="text-[15px] leading-relaxed">
            AI Background Remover helps users automatically separate the main subject from the background. It is useful for product photos, profile pictures, ecommerce visuals, social media content, and marketing assets.
          </p>
        </div>
        <div>
          <h2 className="mb-5 text-2xl font-bold text-gray-900">Why use LazyKiwi Background Remover?</h2>
          <p className="mb-5 text-[15px] leading-relaxed">
            LazyKiwi makes background removal simple and fast. Upload an image, adjust a few settings, and generate a clean cutout without manual editing.
          </p>
          <p className="text-[15px] leading-relaxed">
            This tool is ideal for creators, marketers, ecommerce sellers, and anyone who needs polished transparent or isolated subject images quickly.
          </p>
        </div>
        <div>
          <h2 className="mb-5 text-2xl font-bold text-gray-900">Use cases for Background Remover</h2>
          <p className="text-[15px] leading-relaxed">
            You can use Background Remover for product listings, fashion cutouts, profile images, ad creatives, thumbnail design, and presentation materials.
          </p>
        </div>
        <div>
          <h2 className="mb-5 text-2xl font-bold text-gray-900">How to get better results</h2>
          <p className="text-[15px] leading-relaxed">
            For better results, use images with clear subject edges, good lighting, and enough contrast between the subject and the background. This helps produce cleaner and more natural cutouts.
          </p>
        </div>
      </section>
    </WorkbenchPage>
  );
}

function StepCard({ step, title, desc, children, gradient = 'from-blue-50 to-indigo-50' }) {
  return (
    <div className="flex h-full flex-col rounded-[20px] border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className={`mb-6 flex h-40 w-full items-center justify-center rounded-xl border border-gray-100 bg-gradient-to-br ${gradient}`}>
        {children}
      </div>
      <div className="mb-2 text-xs font-bold uppercase tracking-wider text-kiwi-green-dark">{step}</div>
      <h3 className="mb-3 text-xl font-bold text-gray-900">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
    </div>
  );
}
