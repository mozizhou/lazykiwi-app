import { useState, useRef } from 'react';
import { Search, Play, ChevronDown } from 'lucide-react';
import {
  WorkbenchShell,
  Preview,
  ControlDock,
  GeneratingState,
  ReadyState,
  Divider,
  UploadChip,
  PrimaryButton,
  Toggle,
  Popup,
  GalleryCard,
} from './primitives.jsx';

const CHARACTER_TEMPLATES = [
  { id: '1', name: 'Anime Hero', category: 'Anime', emoji: '⚔️', desc: 'Anime protagonist', gradient: 'from-blue-100 to-cyan-100' },
  { id: '2', name: 'Magical Girl', category: 'Anime', emoji: '✨', desc: 'Magical girl style', gradient: 'from-pink-100 to-purple-100' },
  { id: '3', name: 'Cyberpunk', category: 'Anime', emoji: '🤖', desc: 'Cyberpunk look', gradient: 'from-purple-100 to-fuchsia-100' },
  { id: '4', name: 'Superhero', category: 'Movie', emoji: '🦸', desc: 'Comic superhero', gradient: 'from-red-100 to-orange-100' },
  { id: '5', name: 'Sci-Fi', category: 'Movie', emoji: '🚀', desc: 'Sci-fi character', gradient: 'from-indigo-100 to-blue-100' },
  { id: '6', name: 'Fantasy', category: 'Movie', emoji: '🧙', desc: 'Fantasy character', gradient: 'from-emerald-100 to-teal-100' },
  { id: '7', name: 'RPG Warrior', category: 'Game', emoji: '🗡️', desc: 'Warrior class', gradient: 'from-amber-100 to-orange-100' },
  { id: '8', name: 'Mage', category: 'Game', emoji: '🔮', desc: 'Mage class', gradient: 'from-violet-100 to-purple-100' },
  { id: '9', name: 'Assassin', category: 'Game', emoji: '🥷', desc: 'Stealth class', gradient: 'from-slate-100 to-gray-200' },
  { id: '10', name: 'Pixel Art', category: 'Game', emoji: '🎮', desc: 'Pixel-art style', gradient: 'from-yellow-100 to-green-100' },
  { id: '11', name: 'Viking', category: 'Historical', emoji: '⚓', desc: 'Viking warrior', gradient: 'from-stone-100 to-zinc-200' },
  { id: '12', name: 'Samurai', category: 'Historical', emoji: '🎌', desc: 'Samurai warrior', gradient: 'from-red-100 to-gray-200' },
  { id: '13', name: 'Custom', category: 'Custom', emoji: '✏️', desc: 'Describe your own', gradient: 'from-zinc-100 to-slate-200' },
];

const CATEGORIES = ['All', 'Anime', 'Movie', 'Game', 'Historical', 'Custom'];

export default function CharacterSwapWorkbench({ fill = false }) {
  const [showCharacters, setShowCharacters] = useState(false);
  const [selectedChar, setSelectedChar] = useState(CHARACTER_TEMPLATES[0]);
  const [uploadedPhoto, setUploadedPhoto] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [styleMatch, setStyleMatch] = useState(true);
  const [canvasState, setCanvasState] = useState('idle');
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');
  const photoRef = useRef(null);

  const filteredChars = CHARACTER_TEMPLATES.filter((c) => {
    const matchesCategory = activeCategory === 'All' || c.category === activeCategory;
    const matchesQuery =
      !query ||
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.desc.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const isCustom = selectedChar.id === '13';
  const canGenerate = !!uploadedPhoto && (isCustom ? !!customDesc.trim() : true) && canvasState !== 'generating';

  const handleGenerate = () => {
    if (!canGenerate) return;
    setCanvasState('generating');
    setTimeout(() => setCanvasState('ready'), 2400);
  };

  return (
    <WorkbenchShell fill={fill}>
      <Preview
        state={canvasState}
        idle={
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 text-[64px] leading-none">{selectedChar.emoji}</div>
            <div className="text-lg font-semibold text-gray-800">
              {canGenerate ? 'Ready to transform' : 'Upload a photo and pick a character'}
            </div>
            <div className="mt-1.5 text-[13px] text-gray-500">Target: {selectedChar.desc}</div>
          </div>
        }
        generating={<GeneratingState title="Transforming character" subtitle={selectedChar.desc} />}
        ready={
          <ReadyState>
            <Play className="h-9 w-9 fill-kiwi-green-dark text-kiwi-green-dark" />
          </ReadyState>
        }
      />

      <input
        ref={photoRef}
        type="file"
        accept="image/*"
        onChange={(e) => setUploadedPhoto(e.target.files?.[0]?.name || '')}
        className="hidden"
      />

      <ControlDock>
        {isCustom && (
          <>
            <div className="flex items-center gap-2.5 px-5 py-4 sm:px-6">
              <span className="w-20 shrink-0 text-[12px] font-medium text-gray-500">Describe</span>
              <input
                type="text"
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                placeholder="A glowing celestial knight in flowing robes…"
                className="flex-1 border-0 bg-transparent text-[14px] text-gray-800 placeholder-gray-400 outline-none"
              />
            </div>
            <Divider />
          </>
        )}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 sm:px-6">
          <UploadChip filename={uploadedPhoto} onClick={() => photoRef.current?.click()} label="Upload photo" />
          <button
            type="button"
            onClick={() => setShowCharacters(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gray-900 px-4 text-[13px] font-medium text-white transition hover:bg-gray-800 shadow-sm"
          >
            <span className="text-base leading-none">{selectedChar.emoji}</span>
            <span>{selectedChar.name}</span>
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>
          <Toggle checked={styleMatch} onChange={setStyleMatch} label="Style match" />
          <div className="ml-auto">
            <PrimaryButton onClick={handleGenerate} disabled={!canGenerate}>
              {canvasState === 'generating' ? 'Transforming…' : 'Generate'}
            </PrimaryButton>
          </div>
        </div>
      </ControlDock>

      <Popup open={showCharacters} onClose={() => setShowCharacters(false)} title="Choose a character" maxWidth="max-w-[720px]">
        <div className="mb-4 flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-[12px] font-medium transition ${
                activeCategory === cat
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search characters"
            className="h-10 w-full rounded-xl bg-gray-100 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:bg-gray-50 focus:ring-2 focus:ring-kiwi-green/40"
          />
        </div>

        <div className="grid max-h-[440px] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-4">
          {filteredChars.map((c) => (
            <GalleryCard
              key={c.id}
              selected={selectedChar.id === c.id}
              onClick={() => {
                setSelectedChar(c);
                setShowCharacters(false);
              }}
              preview={
                <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${c.gradient}`}>
                  <div className="text-3xl">{c.emoji}</div>
                </div>
              }
              name={c.name}
              desc={c.desc}
              aspect="aspect-square"
            />
          ))}
        </div>
      </Popup>
    </WorkbenchShell>
  );
}
