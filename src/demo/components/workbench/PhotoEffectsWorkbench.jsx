import { useState, useRef } from 'react';
import { Sparkles, Search, Play, ImageIcon, ChevronDown } from 'lucide-react';
import {
  WorkbenchShell,
  Preview,
  ControlDock,
  IdleState,
  GeneratingState,
  ReadyState,
  Divider,
  UploadChip,
  PrimaryButton,
  SliderRow,
  Popup,
  GalleryCard,
} from './primitives.jsx';

const FILTER_PACKS = [
  { id: '1', name: 'Vintage Film', category: 'Vintage', intensity: 70, desc: 'Warm vintage tones', color: 'from-amber-100 to-orange-100' },
  { id: '2', name: 'Kodak Gold', category: 'Film', intensity: 65, desc: 'Classic Kodak Gold', color: 'from-yellow-100 to-amber-100' },
  { id: '3', name: 'Fuji Velvia', category: 'Film', intensity: 80, desc: 'Saturated Fuji look', color: 'from-red-100 to-pink-100' },
  { id: '4', name: 'Black & White', category: 'B&W', intensity: 100, desc: 'Classic monochrome', color: 'from-gray-200 to-slate-200' },
  { id: '5', name: 'High Contrast', category: 'B&W', intensity: 90, desc: 'Bold contrast B&W', color: 'from-zinc-200 to-gray-300' },
  { id: '6', name: 'Watercolor', category: 'Artistic', intensity: 60, desc: 'Watercolor painting', color: 'from-blue-100 to-cyan-100' },
  { id: '7', name: 'Oil Painting', category: 'Artistic', intensity: 75, desc: 'Oil painting texture', color: 'from-purple-100 to-pink-100' },
  { id: '8', name: 'Neon Glow', category: 'Neon', intensity: 85, desc: 'Glowing neon edges', color: 'from-fuchsia-100 to-cyan-100' },
  { id: '9', name: 'Cyberpunk', category: 'Neon', intensity: 95, desc: 'Cyberpunk vibes', color: 'from-pink-100 to-purple-100' },
];

const CATEGORIES = ['All', 'Vintage', 'Film', 'B&W', 'Artistic', 'Neon'];

export default function PhotoEffectsWorkbench({ fill = false }) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(FILTER_PACKS[0]);
  const [uploadedImage, setUploadedImage] = useState('');
  const [intensity, setIntensity] = useState(70);
  const [canvasState, setCanvasState] = useState('idle');
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');
  const fileRef = useRef(null);

  const filteredFilters = FILTER_PACKS.filter((f) => {
    const matchesCategory = activeCategory === 'All' || f.category === activeCategory;
    const matchesQuery =
      !query ||
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.desc.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const canGenerate = !!uploadedImage && canvasState !== 'generating';

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
          <IdleState
            icon={<ImageIcon className="h-14 w-14" strokeWidth={1.4} />}
            title={uploadedImage ? `Apply ${selectedFilter.name}` : 'Upload a photo to filter'}
            subtitle={uploadedImage ? `Filter: ${selectedFilter.desc}` : `Filter: ${selectedFilter.name}`}
          />
        }
        generating={
          <GeneratingState title={`Applying ${selectedFilter.name}`} subtitle={`Intensity ${intensity}%`} />
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
        <div className="px-5 py-3.5 sm:px-6">
          <SliderRow label="Intensity" value={intensity} onChange={setIntensity} />
        </div>
        <Divider />
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 sm:px-6">
          <UploadChip filename={uploadedImage} onClick={() => fileRef.current?.click()} label="Upload photo" />
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gray-900 px-4 text-[13px] font-medium text-white transition hover:bg-gray-800 shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{selectedFilter.name}</span>
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>
          <div className="ml-auto">
            <PrimaryButton onClick={handleGenerate} disabled={!canGenerate}>
              {canvasState === 'generating' ? 'Applying…' : 'Apply filter'}
            </PrimaryButton>
          </div>
        </div>
      </ControlDock>

      <Popup open={showFilters} onClose={() => setShowFilters(false)} title="Choose a filter">
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
            placeholder="Search filters"
            className="h-10 w-full rounded-xl bg-gray-100 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:bg-gray-50 focus:ring-2 focus:ring-kiwi-green/40"
          />
        </div>

        <div className="grid max-h-[420px] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
          {filteredFilters.map((f) => (
            <GalleryCard
              key={f.id}
              selected={selectedFilter.id === f.id}
              onClick={() => {
                setSelectedFilter(f);
                setIntensity(f.intensity);
                setShowFilters(false);
              }}
              preview={
                <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${f.color}`}>
                  <Sparkles className="h-7 w-7 text-gray-700/50" />
                </div>
              }
              name={f.name}
              desc={f.desc}
            />
          ))}
        </div>
      </Popup>
    </WorkbenchShell>
  );
}
