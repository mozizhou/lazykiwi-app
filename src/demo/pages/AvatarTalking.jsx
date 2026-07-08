import { PlayCircle } from 'lucide-react';
import AvatarTalkingWorkbench from '../components/workbench/AvatarTalkingWorkbench';
import { WorkbenchHero, WorkbenchPage } from '../components/workbench/primitives.jsx';

export default function AvatarTalking() {
  return (
    <WorkbenchPage>
      <WorkbenchHero
        title="Avatar Talking"
        subtitle="Turn a photo into a talking avatar in seconds."
      >
        <AvatarTalkingWorkbench fill />
      </WorkbenchHero>

      <section className="mx-auto w-full max-w-5xl px-4 pt-4 pb-20 text-center sm:px-6 md:px-8">
        <h2 className="mb-3 text-3xl font-bold text-gray-900">See Avatar Talking in Action</h2>
        <p className="mb-8 text-lg text-gray-500">Create expressive talking avatars from a single image and script.</p>
        <div className="group relative aspect-video w-full cursor-pointer overflow-hidden rounded-[24px] border border-gray-200 shadow-sm">
          <img
            src="https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-apps/ChatGPT Image 2026年5月7日 17_33_07 (1).png"
            alt="Avatar Talking preview"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg backdrop-blur transition-transform group-hover:scale-110">
              <PlayCircle size={48} className="text-kiwi-green-dark" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl space-y-12 px-4 pb-12 text-gray-600 sm:px-6 md:px-8">
        <div>
          <h2 className="mb-5 text-2xl font-bold text-gray-900">What is Avatar Talking?</h2>
          <p className="text-[15px] leading-relaxed">
            Avatar Talking is an AI feature that turns a still image into a speaking avatar. By combining an uploaded portrait, a script, and voice settings, users can generate engaging talking videos for content creation, education, marketing, and communication.
          </p>
        </div>
        <div>
          <h2 className="mb-5 text-2xl font-bold text-gray-900">Why use LazyKiwi Avatar Talking?</h2>
          <p className="mb-5 text-[15px] leading-relaxed">
            LazyKiwi makes it easy to create talking avatar videos without complex editing tools. Simply upload an image, enter a script, choose a voice and emotion, and generate a polished avatar video in minutes.
          </p>
          <p className="text-[15px] leading-relaxed">
            This is useful for creators, marketers, educators, and businesses who want to make explainer videos, short social clips, product introductions, and personalized video content quickly.
          </p>
        </div>
        <div>
          <h2 className="mb-5 text-2xl font-bold text-gray-900">How to get better results</h2>
          <p className="text-[15px] leading-relaxed">
            For better results, use a clear portrait image, write natural spoken dialogue, and choose voice and emotion settings that match your content. Short, focused scripts often produce the most effective avatar videos.
          </p>
        </div>
      </section>
    </WorkbenchPage>
  );
}
