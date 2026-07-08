import { useState, useRef } from 'react';
import { Play, Zap, Video as VideoIcon, Settings2 } from 'lucide-react';
import {
  WorkbenchShell,
  Preview,
  ControlDock,
  IdleState,
  GeneratingState,
  ReadyState,
  UploadChip,
  PrimaryButton,
  Popup,
} from './primitives.jsx';

const SPEED_OPTIONS = [
  { value: 0.5, label: '0.5×' },
  { value: 0.75, label: '0.75×' },
  { value: 1, label: '1×' },
  { value: 1.5, label: '1.5×' },
  { value: 2, label: '2×' },
];

const FILTER_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'vibrant', label: 'Vibrant' },
];

export default function VideoEffectsWorkbench({ fill = false }) {
  const [canvasState, setCanvasState] = useState('idle');
  const [uploadedVideo, setUploadedVideo] = useState('');
  const [speed, setSpeed] = useState(1);
  const [filterStyle, setFilterStyle] = useState('none');
  const [showSettings, setShowSettings] = useState(false);
  const videoRef = useRef(null);

  const canGenerate = !!uploadedVideo && canvasState !== 'generating';
  const speedLabel = SPEED_OPTIONS.find((s) => s.value === speed)?.label;
  const filterLabel = FILTER_OPTIONS.find((f) => f.value === filterStyle)?.label;

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
            icon={<VideoIcon className="h-14 w-14" strokeWidth={1.4} />}
            title={uploadedVideo ? 'Tune speed and filter' : 'Upload a video to apply effects'}
            subtitle={uploadedVideo ? 'Speed and stylized filters supported' : 'MP4, MOV, or WEBM'}
          />
        }
        generating={
          <GeneratingState
            title="Applying video effect"
            subtitle={`${speed}× · ${FILTER_OPTIONS.find((f) => f.value === filterStyle)?.label}`}
          />
        }
        ready={
          <ReadyState>
            <Play className="h-9 w-9 fill-kiwi-green-dark text-kiwi-green-dark" />
          </ReadyState>
        }
      />

      <input
        ref={videoRef}
        type="file"
        accept="video/*"
        onChange={(e) => setUploadedVideo(e.target.files?.[0]?.name || '')}
        className="hidden"
      />

      <ControlDock>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 sm:px-6">
          <UploadChip filename={uploadedVideo} onClick={() => videoRef.current?.click()} label="Upload video" />
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 shadow-sm"
          >
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span>{speedLabel}</span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-500">{filterLabel}</span>
            <Settings2 className="h-3.5 w-3.5 text-gray-400" />
          </button>
          <div className="ml-auto">
            <PrimaryButton onClick={handleGenerate} disabled={!canGenerate} credits={4}>
              {canvasState === 'generating' ? 'Processing…' : 'Apply'}
            </PrimaryButton>
          </div>
        </div>
      </ControlDock>

      <Popup open={showSettings} onClose={() => setShowSettings(false)} title="Video effect settings" maxWidth="max-w-[480px]">
        <div className="space-y-5">
          <div>
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-gray-500">Speed</div>
            <div className="flex flex-wrap gap-1.5">
              {SPEED_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSpeed(opt.value)}
                  className={`inline-flex h-9 items-center rounded-xl px-4 text-[13px] font-medium transition ${
                    speed === opt.value
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
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-gray-500">Filter</div>
            <div className="flex flex-wrap gap-1.5">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFilterStyle(opt.value)}
                  className={`inline-flex h-9 items-center rounded-xl px-4 text-[13px] font-medium transition ${
                    filterStyle === opt.value
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
    </WorkbenchShell>
  );
}
