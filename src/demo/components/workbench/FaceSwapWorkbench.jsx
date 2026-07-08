import { useState, useRef } from 'react';
import { ArrowLeftRight, Play, Settings2 } from 'lucide-react';
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

const BLEND_MODES = [
  { label: 'Seamless', value: 'seamless' },
  { label: 'Sharp', value: 'sharp' },
  { label: 'Smooth', value: 'smooth' },
];

export default function FaceSwapWorkbench({ fill = false }) {
  const [canvasState, setCanvasState] = useState('idle');
  const [sourceFile, setSourceFile] = useState('');
  const [targetFile, setTargetFile] = useState('');
  const [blendMode, setBlendMode] = useState('seamless');
  const [blendStrength, setBlendStrength] = useState(80);
  const [showSettings, setShowSettings] = useState(false);
  const sourceRef = useRef(null);
  const targetRef = useRef(null);

  const canGenerate = !!sourceFile && !!targetFile && canvasState !== 'generating';
  const blendLabel = BLEND_MODES.find((m) => m.value === blendMode)?.label;

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
          <IdleState
            icon={<ArrowLeftRight className="h-14 w-14" strokeWidth={1.4} />}
            title={canGenerate ? 'Ready to swap faces' : 'Upload source and target faces'}
            subtitle={canGenerate ? 'Adjust blend mode and strength' : 'Two clear portrait photos'}
          />
        }
        generating={
          <GeneratingState
            title="Swapping faces"
            subtitle={`${BLEND_MODES.find((m) => m.value === blendMode)?.label} · ${blendStrength}%`}
          />
        }
        ready={
          <ReadyState>
            <Play className="h-9 w-9 fill-kiwi-green-dark text-kiwi-green-dark" />
          </ReadyState>
        }
      />

      <input ref={sourceRef} type="file" accept="image/*" onChange={(e) => setSourceFile(e.target.files?.[0]?.name || '')} className="hidden" />
      <input ref={targetRef} type="file" accept="image/*" onChange={(e) => setTargetFile(e.target.files?.[0]?.name || '')} className="hidden" />

      <ControlDock>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 sm:px-6">
          <UploadChip filename={sourceFile} onClick={() => sourceRef.current?.click()} label="Source face" />
          <ArrowLeftRight className="h-4 w-4 shrink-0 text-gray-300" />
          <UploadChip filename={targetFile} onClick={() => targetRef.current?.click()} label="Target face" />
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 shadow-sm"
          >
            <Settings2 className="h-3.5 w-3.5" />
            <span>{blendLabel}</span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-500 tabular-nums">{blendStrength}%</span>
          </button>
          <div className="ml-auto">
            <PrimaryButton onClick={handleGenerate} disabled={!canGenerate} credits={2}>
              {canvasState === 'generating' ? 'Swapping…' : 'Swap faces'}
            </PrimaryButton>
          </div>
        </div>
      </ControlDock>

      <Popup open={showSettings} onClose={() => setShowSettings(false)} title="Blend settings" maxWidth="max-w-[480px]">
        <div className="space-y-5">
          <div>
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-gray-500">Blend mode</div>
            <div className="flex flex-wrap gap-1.5">
              {BLEND_MODES.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBlendMode(opt.value)}
                  className={`inline-flex h-9 items-center rounded-xl px-4 text-[13px] font-medium transition ${
                    blendMode === opt.value
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
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-gray-500">Strength</div>
            <SliderRow label="Strength" value={blendStrength} onChange={setBlendStrength} />
          </div>
        </div>
      </Popup>
    </WorkbenchShell>
  );
}
