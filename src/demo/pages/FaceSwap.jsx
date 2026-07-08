import { ImagePlus, Send, Layers } from 'lucide-react';
import FaceSwapWorkbench from '../components/workbench/FaceSwapWorkbench';
import { WorkbenchHero, WorkbenchPage } from '../components/workbench/primitives.jsx';

export default function FaceSwap() {
  return (
    <WorkbenchPage>
      <WorkbenchHero
        title="Face Swap"
        subtitle="Swap faces between two images in seconds."
      >
        <FaceSwapWorkbench fill />
      </WorkbenchHero>

      <section className="mx-auto w-full max-w-7xl px-4 pt-4 pb-24 sm:px-6 md:px-8">
        <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">How to use Face Swap</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <StepCard step="Step 1" title="Upload the source face" desc="Upload the image that contains the face you want to replace.">
            <ImagePlus size={36} className="text-indigo-300" />
          </StepCard>
          <StepCard step="Step 2" title="Upload the target face" desc="Upload the image containing the face you want to swap in." gradient="from-emerald-50 to-teal-50">
            <ImagePlus size={36} className="text-teal-300" />
          </StepCard>
          <StepCard step="Step 3" title="Generate the result" desc="Choose the model and generate your swapped image in seconds." gradient="from-amber-50 to-orange-50">
            <div className="flex gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm"><Layers size={14} className="text-gray-400" /></div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-kiwi-green shadow-sm"><Send size={14} className="text-gray-900" /></div>
            </div>
          </StepCard>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl space-y-12 px-4 pb-12 text-gray-600 sm:px-6 md:px-8">
        <div>
          <h2 className="mb-5 text-2xl font-bold text-gray-900">What is AI Face Swap?</h2>
          <p className="text-[15px] leading-relaxed">
            AI Face Swap allows users to replace one face with another by uploading two images. It can be used for creative edits, content production, social media visuals, and entertainment use cases.
          </p>
        </div>
        <div>
          <h2 className="mb-5 text-2xl font-bold text-gray-900">Why use LazyKiwi Face Swap?</h2>
          <p className="mb-5 text-[15px] leading-relaxed">
            LazyKiwi makes face swapping simple and fast. Upload a source face, upload a target face, and generate a polished result without complex manual editing.
          </p>
          <p className="text-[15px] leading-relaxed">
            This is useful for creators, marketers, meme makers, and anyone who wants to experiment with visual identity changes quickly.
          </p>
        </div>
        <div>
          <h2 className="mb-5 text-2xl font-bold text-gray-900">How to get better results</h2>
          <p className="text-[15px] leading-relaxed">
            For better results, use clear front-facing photos with good lighting and visible facial details. Similar head angles and image quality can help produce more natural-looking swaps.
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
