import { Upload, PlayCircle, Scissors, SplitSquareHorizontal, Undo2, Redo2, Download } from 'lucide-react';
import { WorkbenchHero, WorkbenchPage, WorkbenchShell, Divider } from '../components/workbench/primitives.jsx';

export default function VideoEditor() {
  return (
    <WorkbenchPage>
      <WorkbenchHero
        title="Video Editor"
        subtitle="Trim, preview, and prepare your videos with a lightweight editing workspace."
      >
        <WorkbenchShell fill className="text-gray-900">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
            <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100">
              <Upload size={16} /> Upload Video
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-kiwi-green px-6 py-2.5 text-sm font-bold text-gray-900 shadow-sm transition-colors hover:bg-kiwi-green-dark hover:text-white">
              <Download size={16} /> Export Video
            </button>
          </div>

          <Divider />

          <div className="group relative flex min-h-[240px] flex-1 cursor-pointer items-center justify-center overflow-hidden bg-gradient-to-br from-[#FAFBF4] via-[#F2F6E6] to-[#E7EED5]">
            <div className="absolute inset-0 bg-black/5 transition-colors group-hover:bg-black/10" />
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur transition-transform group-hover:scale-110">
              <PlayCircle size={36} className="text-kiwi-green-dark" />
            </div>
            <span className="absolute bottom-4 left-6 text-sm font-medium text-gray-500">Video Preview Placeholder</span>
          </div>

          <Divider />

          <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-5">
            <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100">
              <Scissors size={16} /> Trim
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100">
              <SplitSquareHorizontal size={16} /> Split
            </button>
            <div className="mx-1 hidden h-8 w-px bg-gray-200 sm:block" />
            <button className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-2 text-gray-700 transition-colors hover:bg-gray-100" title="Undo">
              <Undo2 size={16} />
            </button>
            <button className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-2 text-gray-700 transition-colors hover:bg-gray-100" title="Redo">
              <Redo2 size={16} />
            </button>
          </div>

          <Divider />

          <div className="px-4 py-3 sm:px-5">
            <div className="relative flex h-16 w-full items-center overflow-hidden rounded-[12px] border border-gray-200 bg-gray-50 px-4">
              <div className="absolute bottom-0 left-1/3 top-0 z-20 w-0.5 bg-kiwi-green-dark">
                <div className="absolute -left-1.5 -top-1 h-3.5 w-3.5 rounded-full bg-kiwi-green-dark" />
              </div>
              <div className="relative flex h-9 w-full items-center overflow-hidden rounded-lg border border-indigo-200 bg-indigo-100 px-4">
                <div className="flex h-full w-full items-center justify-between opacity-30">
                  {[...Array(40)].map((_, i) => (
                    <div key={i} className="w-1.5 rounded-full bg-indigo-300" style={{ height: `${Math.max(20, ((i * 37) % 80) + 20)}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </WorkbenchShell>
      </WorkbenchHero>

      <section className="mx-auto w-full max-w-7xl px-4 pt-4 pb-20 sm:px-6 md:px-8">
        <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">How to use Video Editor</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <StepCard step="Step 1" title="Upload your video" desc="Import the video you want to preview and edit.">
            <Upload size={36} className="text-indigo-300" />
          </StepCard>
          <StepCard step="Step 2" title="Trim and adjust" desc="Use basic editing controls like trim and split to prepare your content." gradient="from-emerald-50 to-teal-50">
            <div className="flex gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm"><Scissors size={18} className="text-teal-400" /></div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm"><SplitSquareHorizontal size={18} className="text-teal-400" /></div>
            </div>
          </StepCard>
          <StepCard step="Step 3" title="Export your result" desc="Preview the final version and export the edited video when ready." gradient="from-amber-50 to-orange-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-kiwi-green shadow-sm"><Download size={18} className="text-gray-900" /></div>
          </StepCard>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl space-y-12 px-4 pb-12 text-gray-600 sm:px-6 md:px-8">
        <div>
          <h2 className="mb-5 text-2xl font-bold text-gray-900">What is AI Video Editor?</h2>
          <p className="text-[15px] leading-relaxed">
            AI Video Editor helps users quickly prepare and refine video content with an easy editing interface. It is designed for simple editing workflows such as trimming, splitting, previewing, and exporting.
          </p>
        </div>
        <div>
          <h2 className="mb-5 text-2xl font-bold text-gray-900">Why use LazyKiwi Video Editor?</h2>
          <p className="text-[15px] leading-relaxed">
            LazyKiwi Video Editor offers a clean and approachable editing experience for users who need a lightweight tool instead of a complicated professional editor.
          </p>
        </div>
        <div>
          <h2 className="mb-5 text-2xl font-bold text-gray-900">Common use cases</h2>
          <p className="text-[15px] leading-relaxed">
            Video Editor is useful for short-form content, social media clips, marketing videos, quick previews, and lightweight video cleanup before publishing.
          </p>
        </div>
        <div>
          <h2 className="mb-5 text-2xl font-bold text-gray-900">Why this demo is lightweight</h2>
          <p className="text-[15px] leading-relaxed">
            This demo focuses on the core workflow of upload, preview, trim, and export, making the experience simple while still clearly showing the value of the Video Editor feature.
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
