import { useState, useRef } from 'react';
import { Play, Eraser, Settings2 } from 'lucide-react';
import {
  WorkbenchShell,
  Preview,
  ControlDock,
  IdleState,
  GeneratingState,
  ReadyState,
  UploadChip,
  PrimaryButton,
  SliderRow,
  Popup,
} from './primitives.jsx';

const MODES = [
  { value: 'auto', label: 'Auto' },
  { value: 'person', label: 'Person' },
  { value: 'object', label: 'Object' },
];

const BG_OPTIONS = [
  {
    value: 'transparent',
    label: 'Transparent',
    preview: 'bg-[repeating-linear-gradient(45deg,#E5E7EB_0,#E5E7EB_5px,#F9FAFB_5px,#F9FAFB_10px)]',
  },
  { value: 'white', label: 'White', preview: 'bg-white border border-gray-200' },
  { value: 'black', label: 'Black', preview: 'bg-gray-900' },
  { value: 'blur', label: 'Blur', preview: 'bg-gradient-to-br from-blue-200 to-purple-200' },
];

export default function BackgroundRemoverWorkbench({ fill = false }) {
  const [canvasState, setCanvasState] = useState('idle');
  const [uploadedFile, setUploadedFile] = useState('');
  const [mode, setMode] = useState('auto');
  const [edgeSmooth, setEdgeSmooth] = useState(50);
  const [bgColor, setBgColor] = useState('transparent');
  const [showSettings, setShowSettings] = useState(false);
  const fileRef = useRef(null);

  const canGenerate = !!uploadedFile && canvasState !== 'generating';
  const modeLabel = MODES.find((m) => m.value === mode)?.label;
  const bgLabel = BG_OPTIONS.find((b) => b.value === bgColor)?.label;

  const handleGenerate = () => {
    if (!canGenerate) return;
    setCanvasState('generating');
    setTimeout(() => setCanvasState('ready'), 2000);
  };

  return (
    <WorkbenchShell fill={fill}>
      <Preview
        state={canvasState}
        idle={
          <IdleState
            icon={<Eraser className="h-14 w-14" strokeWidth={1.4} />}
            title={uploadedFile ? 'Pick a background and remove' : 'Drop in a photo to cut out'}
            subtitle={uploadedFile ? 'Auto-detect people, products, and more' : 'JPG, PNG, or WEBP'}
          />
        }
        generating={
          <GeneratingState
            title="Removing background"
            subtitle={`${MODES.find((m) => m.value === mode)?.label} mode`}
          />
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
        onChange={(e) => setUploadedFile(e.target.files?.[0]?.name || '')}
        className="hidden"
      />

      <ControlDock>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 sm:px-6">
          <UploadChip filename={uploadedFile} onClick={() => fileRef.current?.click()} label="Upload photo" />
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 shadow-sm"
          >
            <Settings2 className="h-3.5 w-3.5" />
            <span>{modeLabel}</span>
            <span className="hidden text-gray-300 sm:inline">·</span>
            <span className="hidden text-gray-500 sm:inline">{bgLabel}</span>
          </button>
          <div className="ml-auto">
            <PrimaryButton onClick={handleGenerate} disabled={!canGenerate}>
              {canvasState === 'generating' ? 'Removing…' : 'Remove background'}
            </PrimaryButton>
          </div>
        </div>
      </ControlDock>

      <Popup open={showSettings} onClose={() => setShowSettings(false)} title="Cutout settings" maxWidth="max-w-[480px]">
        <div className="space-y-5">
          <div>
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-gray-500">Mode</div>
            <div className="flex flex-wrap gap-1.5">
              {MODES.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMode(opt.value)}
                  className={`inline-flex h-9 items-center rounded-xl px-4 text-[13px] font-medium transition ${
                    mode === opt.value
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
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-gray-500">Background</div>
            <div className="flex flex-wrap items-center gap-2">
              {BG_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBgColor(opt.value)}
                  className={`group flex items-center gap-2 rounded-xl border px-2 py-1 text-[12px] font-medium transition ${
                    bgColor === opt.value
                      ? 'border-kiwi-green-dark bg-kiwi-light-green/40 text-gray-900'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span className={`h-7 w-7 overflow-hidden rounded-lg ${opt.preview}`} />
                  <span className="pr-2">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-gray-500">Edge feather</div>
            <SliderRow label="Smoothness" value={edgeSmooth} onChange={setEdgeSmooth} />
          </div>
        </div>
      </Popup>
    </WorkbenchShell>
  );
}
