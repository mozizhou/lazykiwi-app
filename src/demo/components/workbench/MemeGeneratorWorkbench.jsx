import { useState, useRef } from 'react';
import { Search, Play, ChevronDown, Type } from 'lucide-react';
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

const MEME_TEMPLATES = [
  { id: '1', name: 'Drake', emoji: '🦆', desc: 'Drake choosing', gradient: 'from-yellow-100 to-orange-100' },
  { id: '2', name: 'Distracted', emoji: '👀', desc: 'Distracted boyfriend', gradient: 'from-pink-100 to-red-100' },
  { id: '3', name: 'Two Buttons', emoji: '🔘', desc: 'Two-button choice', gradient: 'from-blue-100 to-cyan-100' },
  { id: '4', name: 'Change My Mind', emoji: '💭', desc: 'Change my mind', gradient: 'from-purple-100 to-pink-100' },
  { id: '5', name: 'Expanding Brain', emoji: '🧠', desc: 'Expanding brain', gradient: 'from-indigo-100 to-purple-100' },
  { id: '6', name: 'Surprised Pikachu', emoji: '⚡', desc: 'Surprised Pikachu', gradient: 'from-yellow-100 to-amber-100' },
  { id: '7', name: 'Woman Yelling', emoji: '😤', desc: 'Woman yelling at cat', gradient: 'from-red-100 to-orange-100' },
  { id: '8', name: 'Bernie Sanders', emoji: '🪑', desc: 'Bernie sitting', gradient: 'from-blue-100 to-teal-100' },
  { id: '9', name: 'Always Has Been', emoji: '🌍', desc: 'Always has been', gradient: 'from-slate-100 to-blue-100' },
];

export default function MemeGeneratorWorkbench({ fill = false }) {
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(MEME_TEMPLATES[0]);
  const [uploadedImage, setUploadedImage] = useState('');
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [canvasState, setCanvasState] = useState('idle');
  const [query, setQuery] = useState('');
  const fileRef = useRef(null);

  const filteredTemplates = MEME_TEMPLATES.filter(
    (t) =>
      !query ||
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.desc.toLowerCase().includes(query.toLowerCase()),
  );

  const hasContent = uploadedImage || topText || bottomText;
  const canGenerate = hasContent && canvasState !== 'generating';

  const handleGenerate = () => {
    if (!canGenerate) return;
    setCanvasState('generating');
    setTimeout(() => setCanvasState('ready'), 1800);
  };

  return (
    <WorkbenchShell fill={fill}>
      <Preview
        state={canvasState}
        idle={
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 text-[64px] leading-none">{selectedTemplate.emoji}</div>
            <div className="text-lg font-semibold text-gray-800">
              {hasContent ? 'Ready to generate' : 'Pick a template and add captions'}
            </div>
            <div className="mt-1.5 text-[13px] text-gray-500">Template: {selectedTemplate.desc}</div>
          </div>
        }
        generating={
          <GeneratingState title="Generating meme" subtitle={selectedTemplate.desc} />
        }
        ready={
          <ReadyState>
            <Play className="h-9 w-9 fill-kiwi-green-dark text-kiwi-green-dark" />
          </ReadyState>
        }
      />

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={(e) => setUploadedImage(e.target.files?.[0]?.name || '')}
        className="hidden"
      />

      <ControlDock>
        <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
          <div className="flex flex-1 items-center gap-2.5">
            <Type className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="w-12 shrink-0 text-[12px] font-medium text-gray-500">Top</span>
            <input
              type="text"
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
              placeholder="One does not simply…"
              className="flex-1 border-0 bg-transparent text-[14px] text-gray-800 placeholder-gray-400 outline-none"
            />
          </div>
          <div className="hidden h-6 w-px bg-gray-100 sm:block" />
          <div className="flex flex-1 items-center gap-2.5">
            <Type className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="w-12 shrink-0 text-[12px] font-medium text-gray-500">Bottom</span>
            <input
              type="text"
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
              placeholder="…close the modal"
              className="flex-1 border-0 bg-transparent text-[14px] text-gray-800 placeholder-gray-400 outline-none"
            />
          </div>
        </div>

        <Divider />

        <div className="flex flex-wrap items-center gap-3 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => setShowTemplates(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gray-900 px-4 text-[13px] font-medium text-white transition hover:bg-gray-800 shadow-sm"
          >
            <span className="text-base leading-none">{selectedTemplate.emoji}</span>
            <span>{selectedTemplate.name}</span>
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>
          <UploadChip filename={uploadedImage} onClick={() => fileRef.current?.click()} label="Custom image" />
          <div className="ml-auto">
            <PrimaryButton onClick={handleGenerate} disabled={!canGenerate}>
              {canvasState === 'generating' ? 'Generating…' : 'Generate meme'}
            </PrimaryButton>
          </div>
        </div>
      </ControlDock>

      <Popup open={showTemplates} onClose={() => setShowTemplates(false)} title="Choose a meme template" maxWidth="max-w-[600px]">
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates"
            className="h-10 w-full rounded-xl bg-gray-100 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:bg-gray-50 focus:ring-2 focus:ring-kiwi-green/40"
          />
        </div>

        <div className="grid max-h-[440px] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
          {filteredTemplates.map((t) => (
            <GalleryCard
              key={t.id}
              selected={selectedTemplate.id === t.id}
              onClick={() => {
                setSelectedTemplate(t);
                setShowTemplates(false);
              }}
              preview={
                <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${t.gradient}`}>
                  <div className="text-4xl">{t.emoji}</div>
                </div>
              }
              name={t.name}
              desc={t.desc}
            />
          ))}
        </div>
      </Popup>
    </WorkbenchShell>
  );
}
