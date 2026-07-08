import { ImagePlus, Maximize, Settings2, Send } from 'lucide-react';
import PhotoEnhancementWorkbench from '../components/workbench/PhotoEnhancementWorkbench';
import { WorkbenchHero, WorkbenchPage } from '../components/workbench/primitives.jsx';

export default function ImageEditor() {
  return (
    <WorkbenchPage>
      <WorkbenchHero
        title="Image Editor"
        subtitle="Edit and enhance your images with simple AI-powered controls."
      >
        <PhotoEnhancementWorkbench fill />
      </WorkbenchHero>

      <section className="mx-auto w-full max-w-7xl px-4 pt-4 pb-20 sm:px-6 md:px-8">
        <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">How to use Image Editor</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <StepCard step="Step 1" title="Upload your image" desc="Upload the image you want to enhance or adjust.">
            <ImagePlus size={36} className="text-indigo-300" />
          </StepCard>
          <StepCard step="Step 2" title="Adjust editing options" desc="Turn on enhancement, adjust the canvas, and fine-tune the settings for your result." gradient="from-emerald-50 to-teal-50">
            <div className="flex gap-2">
              <div className="h-8 w-8 rounded-lg bg-kiwi-green shadow-sm" />
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm"><Maximize size={14} className="text-teal-400" /></div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm"><Settings2 size={14} className="text-teal-400" /></div>
            </div>
          </StepCard>
          <StepCard step="Step 3" title="Generate and download" desc="Generate the edited image and download the polished result in seconds." gradient="from-amber-50 to-orange-50">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-kiwi-green shadow-sm"><Send size={14} className="text-gray-900" /></div>
          </StepCard>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl space-y-12 px-4 pb-12 text-gray-600 sm:px-6 md:px-8">
        <div>
          <h2 className="mb-5 text-2xl font-bold text-gray-900">What is AI Image Editor?</h2>
          <p className="text-[15px] leading-relaxed">
            AI Image Editor helps users improve and refine images with quick automated editing tools. It can be used to enhance quality, adjust layout, and prepare visuals for content, ecommerce, and marketing use.
          </p>
        </div>
        <div>
          <h2 className="mb-5 text-2xl font-bold text-gray-900">Why use LazyKiwi Image Editor?</h2>
          <p className="text-[15px] leading-relaxed">
            LazyKiwi Image Editor makes image editing easier for everyday users. Instead of using complicated editing software, users can upload an image, adjust a few settings, and generate a cleaner final result quickly.
          </p>
        </div>
        <div>
          <h2 className="mb-5 text-2xl font-bold text-gray-900">Common use cases</h2>
          <p className="text-[15px] leading-relaxed">
            Image Editor is useful for social media content, ecommerce product images, promotional creatives, thumbnails, profile images, and general design cleanup.
          </p>
        </div>
        <div>
          <h2 className="mb-5 text-2xl font-bold text-gray-900">How to get better results</h2>
          <p className="text-[15px] leading-relaxed">
            For best results, upload a clear image with enough detail and use enhancement and settings adjustments according to your editing goal.
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
