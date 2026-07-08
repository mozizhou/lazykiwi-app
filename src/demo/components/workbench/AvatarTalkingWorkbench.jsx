import { useState, useRef } from 'react';
import { Mic, Play, UserCircle, ChevronDown, Settings2 } from 'lucide-react';
import {
  WorkbenchShell,
  Preview,
  ControlDock,
  GeneratingState,
  ReadyState,
  Divider,
  UploadChip,
  PrimaryButton,
  Popup,
  GalleryCard,
} from './primitives.jsx';

const ACTION_TEMPLATES = [
  { id: '1', name: 'Speech', emoji: '🎤', desc: 'Formal speaking pose', gradient: 'from-blue-100 to-indigo-100' },
  { id: '2', name: 'Conversation', emoji: '💬', desc: 'Casual chat', gradient: 'from-emerald-100 to-teal-100' },
  { id: '3', name: 'News Anchor', emoji: '📰', desc: 'Professional broadcast', gradient: 'from-slate-100 to-gray-200' },
  { id: '4', name: 'Teaching', emoji: '👨‍🏫', desc: 'Lecturer style', gradient: 'from-amber-100 to-orange-100' },
  { id: '5', name: 'Customer Service', emoji: '🙋', desc: 'Friendly support', gradient: 'from-pink-100 to-rose-100' },
  { id: '6', name: 'Product Pitch', emoji: '📦', desc: 'Showcase & sell', gradient: 'from-yellow-100 to-amber-100' },
  { id: '7', name: 'Emotional', emoji: '😊', desc: 'Expressive delivery', gradient: 'from-fuchsia-100 to-pink-100' },
  { id: '8', name: 'Singing', emoji: '🎵', desc: 'Musical performance', gradient: 'from-violet-100 to-purple-100' },
];

const VOICE_OPTIONS = [
  { value: 'male-calm', label: 'Male · Calm' },
  { value: 'male-energetic', label: 'Male · Energy' },
  { value: 'female-warm', label: 'Female · Warm' },
  { value: 'female-clear', label: 'Female · Clear' },
];

const EMOTION_OPTIONS = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'happy', label: 'Happy' },
  { value: 'serious', label: 'Serious' },
  { value: 'gentle', label: 'Gentle' },
];

const SCRIPT_LIMIT = 1000;

export default function AvatarTalkingWorkbench({ fill = false }) {
  const [showActions, setShowActions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedAction, setSelectedAction] = useState(ACTION_TEMPLATES[0]);
  const [uploadedAvatar, setUploadedAvatar] = useState('');
  const [voice, setVoice] = useState(VOICE_OPTIONS[0].value);
  const [emotion, setEmotion] = useState(EMOTION_OPTIONS[0].value);
  const [script, setScript] = useState('');
  const [canvasState, setCanvasState] = useState('idle');
  const avatarRef = useRef(null);

  const voiceLabel = VOICE_OPTIONS.find((v) => v.value === voice)?.label;
  const emotionLabel = EMOTION_OPTIONS.find((e) => e.value === emotion)?.label;

  const canGenerate = !!uploadedAvatar && !!script.trim() && canvasState !== 'generating';

  const handleGenerate = () => {
    if (!canGenerate) return;
    setCanvasState('generating');
    setTimeout(() => setCanvasState('ready'), 2800);
  };

  return (
    <WorkbenchShell fill={fill}>
      <Preview
        state={canvasState}
        idle={
          <div className="flex flex-col items-center text-center">
            {uploadedAvatar ? (
              <div className="mb-3 text-[64px] leading-none">{selectedAction.emoji}</div>
            ) : (
              <UserCircle className="mb-4 h-14 w-14 text-gray-300" strokeWidth={1.4} />
            )}
            <div className="text-lg font-semibold text-gray-800">
              {canGenerate ? 'Ready to render' : 'Upload an avatar and write a script'}
            </div>
            <div className="mt-1.5 text-[13px] text-gray-500">Action: {selectedAction.desc}</div>
          </div>
        }
        generating={
          <GeneratingState
            title="Rendering avatar video"
            subtitle={`${selectedAction.name} · ${VOICE_OPTIONS.find((v) => v.value === voice)?.label}`}
          />
        }
        ready={
          <ReadyState>
            <Play className="h-9 w-9 fill-kiwi-green-dark text-kiwi-green-dark" />
          </ReadyState>
        }
      />

      <input
        ref={avatarRef}
        type="file"
        accept="image/*"
        onChange={(e) => setUploadedAvatar(e.target.files?.[0]?.name || '')}
        className="hidden"
      />

      <ControlDock>
        <div className="relative px-5 py-4 sm:px-6">
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value.slice(0, SCRIPT_LIMIT))}
            placeholder="Write what your avatar should say…"
            rows={2}
            className="w-full resize-none border-0 bg-transparent text-[14px] text-gray-800 placeholder-gray-400 outline-none"
          />
          <div className="pointer-events-none absolute bottom-4 right-6 text-[11px] tabular-nums text-gray-400">
            {script.length}/{SCRIPT_LIMIT}
          </div>
        </div>

        <Divider />

        <div className="flex flex-wrap items-center gap-3 px-5 py-4 sm:px-6">
          <UploadChip filename={uploadedAvatar} onClick={() => avatarRef.current?.click()} label="Upload avatar" />
          <button
            type="button"
            onClick={() => setShowActions(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gray-900 px-4 text-[13px] font-medium text-white transition hover:bg-gray-800 shadow-sm"
          >
            <span className="text-base leading-none">{selectedAction.emoji}</span>
            <span>{selectedAction.name}</span>
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 shadow-sm"
          >
            <Settings2 className="h-3.5 w-3.5" />
            <span>Voice & Emotion</span>
            <span className="hidden text-[12px] text-gray-400 sm:inline">·</span>
            <span className="hidden text-[12px] text-gray-500 sm:inline">{voiceLabel} · {emotionLabel}</span>
          </button>
          <div className="ml-auto">
            <PrimaryButton onClick={handleGenerate} disabled={!canGenerate}>
              {canvasState === 'generating' ? 'Rendering…' : 'Generate'}
            </PrimaryButton>
          </div>
        </div>
      </ControlDock>

      <Popup open={showSettings} onClose={() => setShowSettings(false)} title="Voice & Emotion" maxWidth="max-w-[480px]">
        <div className="space-y-5">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-gray-500">
              <Mic className="h-3.5 w-3.5 text-blue-500" />
              Voice
            </div>
            <div className="flex flex-wrap gap-1.5">
              {VOICE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setVoice(opt.value)}
                  className={`inline-flex h-9 items-center rounded-xl px-4 text-[13px] font-medium transition ${
                    voice === opt.value
                      ? 'bg-gray-900 text-white'
                      : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-gray-500">Emotion</div>
            <div className="flex flex-wrap gap-1.5">
              {EMOTION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setEmotion(opt.value)}
                  className={`inline-flex h-9 items-center rounded-xl px-4 text-[13px] font-medium transition ${
                    emotion === opt.value
                      ? 'bg-gray-900 text-white'
                      : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Popup>

      <Popup open={showActions} onClose={() => setShowActions(false)} title="Choose an action" maxWidth="max-w-[640px]">
        <div className="grid max-h-[440px] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-4">
          {ACTION_TEMPLATES.map((a) => (
            <GalleryCard
              key={a.id}
              selected={selectedAction.id === a.id}
              onClick={() => {
                setSelectedAction(a);
                setShowActions(false);
              }}
              preview={
                <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${a.gradient}`}>
                  <div className="text-3xl">{a.emoji}</div>
                </div>
              }
              name={a.name}
              desc={a.desc}
              aspect="aspect-square"
            />
          ))}
        </div>
      </Popup>
    </WorkbenchShell>
  );
}
