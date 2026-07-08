import { useState, useRef } from 'react';
import { ImageIcon, Play, RotateCcw, Settings2, Sparkles } from 'lucide-react';
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

const ENHANCEMENT_TYPES = [
  { value: 'auto', label: 'Auto' },
  { value: 'upscale', label: 'Upscale' },
  { value: 'denoise', label: 'Denoise' },
  { value: 'deblur', label: 'Deblur' },
];

export default function PhotoEnhancementWorkbench({ fill = false }) {
  const [canvasState, setCanvasState] = useState('idle');
  const [uploadedFile, setUploadedFile] = useState('');
  const [enhancementType, setEnhancementType] = useState('auto');
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const fileRef = useRef(null);

  const hasAdjustments = brightness !== 0 || contrast !== 0 || saturation !== 0;
  const canGenerate = !!uploadedFile && canvasState !== 'generating';
  const enhancementLabel = ENHANCEMENT_TYPES.find((t) => t.value === enhancementType)?.label;

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
            icon={<ImageIcon className="h-14 w-14" strokeWidth={1.4} />}
            title={uploadedFile ? 'Adjust and enhance' : 'Upload a photo to begin'}
            subtitle={uploadedFile ? 'Brightness · Contrast · Saturation' : 'JPG, PNG, or WEBP'}
          />
        }
        generating={
          <GeneratingState
            title="Enhancing your photo"
            subtitle={ENHANCEMENT_TYPES.find((t) => t.value === enhancementType)?.label}
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
            <Sparkles className="h-3.5 w-3.5 text-kiwi-green-dark" />
            <span>{enhancementLabel}</span>
            <span className="hidden text-gray-300 sm:inline">·</span>
            <Settings2 className="hidden h-3.5 w-3.5 text-gray-400 sm:inline" />
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setBrightness(0);
                setContrast(0);
                setSaturation(0);
              }}
              disabled={!hasAdjustments}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl px-4 text-[13px] font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
            <PrimaryButton onClick={handleGenerate} disabled={!canGenerate}>
              {canvasState === 'generating' ? 'Enhancing…' : 'Enhance'}
            </PrimaryButton>
          </div>
        </div>
      </ControlDock>

      <Popup open={showSettings} onClose={() => setShowSettings(false)} title="Enhancement settings" maxWidth="max-w-[480px]">
        <div className="space-y-5">
          <div>
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-gray-500">Mode</div>
            <div className="flex flex-wrap gap-1.5">
              {ENHANCEMENT_TYPES.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setEnhancementType(opt.value)}
                  className={`inline-flex h-9 items-center rounded-xl px-4 text-[13px] font-medium transition ${
                    enhancementType === opt.value
                      ? 'bg-gray-900 text-white'
                      : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-gray-500">Adjustments</div>
            <SliderRow
              label="Brightness"
              value={brightness}
              min={-50}
              max={50}
              suffix=""
              format={(v) => (v > 0 ? `+${v}` : `${v}`)}
              onChange={setBrightness}
            />
            <SliderRow
              label="Contrast"
              value={contrast}
              min={-50}
              max={50}
              suffix=""
              format={(v) => (v > 0 ? `+${v}` : `${v}`)}
              onChange={setContrast}
            />
            <SliderRow
              label="Saturation"
              value={saturation}
              min={-50}
              max={50}
              suffix=""
              format={(v) => (v > 0 ? `+${v}` : `${v}`)}
              onChange={setSaturation}
            />
          </div>
        </div>
      </Popup>
    </WorkbenchShell>
  );
}
