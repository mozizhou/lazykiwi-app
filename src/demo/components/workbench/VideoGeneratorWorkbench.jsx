/**
 * VideoGeneratorWorkbench.jsx
 *
 * Slim orchestrator — owns shared state (history, activeTemplate, canvasTab)
 * and wires together three self-contained children:
 *
 *   FreeCreationPanel  — always-visible floating bottom dock
 *   TemplateModal      — overlay opened when a template card is clicked
 *   History panel      — date-grouped grid of past generations
 *
 * State ownership rules:
 *   All generation input state (prompt, images, model, ratio, duration)
 *   lives inside FreeCreationPanel or TemplateModal respectively.
 *   The orchestrator only knows about the *output* (history items).
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Sparkles, Play, RefreshCw, Trash2, LoaderCircle, ArrowLeft, X,
} from 'lucide-react';

import FreeCreationPanel from './FreeCreationPanel.jsx';
import { TEMPLATES, MODE_PRESETS } from './videoGeneratorData.js';
import {
  getMyVideoGenerationTasks,
  waitForVideoGeneration,
} from '../../lib/videoGenerator.js';
import { isAuthenticated } from '../../lib/auth.js';

const HLS_SCRIPT_URL = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
let hlsScriptPromise = null;

function slugifyTemplate(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getTemplateByRouteValue(requested) {
  const normalized = slugifyTemplate(requested).replace(/^video-/, '');
  return TEMPLATES.find((template) => {
    const candidates = [
      template.id,
      template.templateId,
      template.name,
      slugifyTemplate(template.name),
    ].map(slugifyTemplate);
    return candidates.includes(normalized);
  }) || null;
}

function getQueryTemplate() {
  if (typeof window === 'undefined') return null;
  const requested = new URLSearchParams(window.location.search).get('template');
  if (!requested) return null;
  return getTemplateByRouteValue(requested);
}

function loadHlsScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('window is not available'));
  if (window.Hls) return Promise.resolve(window.Hls);
  if (!hlsScriptPromise) {
    hlsScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = HLS_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve(window.Hls);
      script.onerror = () => reject(new Error('Failed to load HLS player'));
      document.head.appendChild(script);
    });
  }
  return hlsScriptPromise;
}

function TemplatePreviewMedia({ template }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !template.video) return undefined;

    let hls = null;
    let cancelled = false;
    const source = encodeURI(template.video);
    const play = () => {
      const request = video.play();
      if (request?.catch) request.catch(() => {});
    };

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', play, { once: true });
      return () => {
        video.removeEventListener('loadedmetadata', play);
        video.removeAttribute('src');
        video.load();
      };
    }

    loadHlsScript()
      .then((Hls) => {
        if (cancelled || !Hls?.isSupported?.()) return;
        hls = new Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, play);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (hls) hls.destroy();
      video.removeAttribute('src');
      video.load();
    };
  }, [template.video]);

  if (template.video) {
    return (
      <video
        ref={videoRef}
        poster={encodeURI(template.img)}
        aria-label={template.name}
        muted
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
    );
  }

  return (
    <img
      src={encodeURI(template.img)}
      alt={template.name}
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
    />
  );
}

function PresetPreviewMedia({ preset }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !preset.video) return undefined;
    const play = () => {
      const request = video.play();
      if (request?.catch) request.catch(() => {});
    };
    video.addEventListener('loadedmetadata', play, { once: true });
    return () => {
      video.removeEventListener('loadedmetadata', play);
      video.removeAttribute('src');
      video.load();
    };
  }, [preset.video]);

  if (preset.video) {
    return (
      <video
        ref={videoRef}
        src={encodeURI(preset.video)}
        aria-label={preset.title || 'Preset preview'}
        muted
        loop
        playsInline
        preload="metadata"
        className="h-full w-auto object-contain transition-transform duration-500 group-hover:scale-[1.03]"
      />
    );
  }

  return (
    <img
      src={encodeURI(preset.thumbnail)}
      alt=""
      className="h-full w-auto object-contain transition-transform duration-500 group-hover:scale-[1.03]"
    />
  );
}

function taskToHistoryItem(task) {
  return {
    id: task.id,
    taskId: task.id,
    type: 'video',
    sourceType: task.generateType === 4 ? 'template' : 'free',
    entryTab: task.generateType === 4 ? 'template' : (
      task.generateType === 3 ? 'start-end' :
      task.generateType === 2 ? 'image-to-video' :
      'text-to-video'
    ),
    prompt: task.prompt || task.templateName || '(no prompt)',
    template: task.templateName || null,
    date: new Date(task.createTime || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mode: task.generateType === 3 ? 'start-end' : task.generateType === 2 ? 'image-to-video' : 'text-to-video',
    model: task.model,
    aspectRatio: task.aspectRatio,
    duration: `${task.duration || 5}s`,
    quality: task.resolution,
    videoUrl: task.videoUrl || task.videoUrls?.[0] || '',
    status: task.status,
    progress: task.progress,
    errorMessage: task.errorMessage,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export default function VideoGeneratorWorkbench({ routeMode, routeTemplate }) {
  // ── Shared orchestrator state ────────────────────────────────────────────
  const [canvasTab, setCanvasTab] = useState('templates');
  const [history, setHistory]             = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  
  // Currently active template in the free-creation panel
  const [activeTemplate, setActiveTemplate] = useState(() => getTemplateByRouteValue(routeTemplate) || getQueryTemplate());
  const [lastActiveTemplate, setLastActiveTemplate] = useState(() => getTemplateByRouteValue(routeTemplate) || getQueryTemplate());

  // Whether the template selection modal/grid is open
  const [isSelectingTemplate, setIsSelectingTemplate] = useState(false);
  const [isGenerating, setIsGenerating]   = useState(false);
  const [playingVideo, setPlayingVideo]   = useState(null);

  const [activeMode, setActiveMode]       = useState('text-to-video');
  const [hoveredPreset, setHoveredPreset] = useState(null);
  const freeCreationRef = useRef(null);

  /**
   * When the user clicks Regenerate on a history card, we store the full
   * history item as a "restore snapshot". FreeCreationPanel reads this via
   * a useEffect and restores its internal state, then calls onSnapshotRestored
   * to clear the snapshot so it isn't re-applied on future renders.
   */
  const [restoreSnapshot, setRestoreSnapshot] = useState(null);

  // ── Callbacks ────────────────────────────────────────────────────────────

  /**
   * Called immediately when FreeCreationPanel's Generate button is clicked,
   * before the 2.2s mock completes. Switches view to history and shows the
   * animated "Creating video…" placeholder card.
   */
  const handleFreeCreationStart = () => {
    setIsGenerating(true);
    setCanvasTab('history');
  };

  const handleGenerated = (historyItem) => {
    setHistory((prev) => {
      const key = historyItem.taskId || historyItem.id;
      const existingIndex = prev.findIndex((item) => (item.taskId || item.id) === key);
      if (existingIndex === -1) return [historyItem, ...prev];

      const previous = prev[existingIndex];
      const merged = {
        ...previous,
        ...historyItem,
        imageFrame: historyItem.imageFrame || previous.imageFrame,
        imageFrames: historyItem.imageFrames?.length ? historyItem.imageFrames : previous.imageFrames,
        startFrame: historyItem.startFrame || previous.startFrame,
        endFrame: historyItem.endFrame || previous.endFrame,
      };
      const next = [...prev];
      next[existingIndex] = merged;
      return next;
    });
    setIsGenerating(false);
    if (historyItem.status === 40) {
      if (historyItem.template) {
        const failedTemplate = TEMPLATES.find((item) => item.name === historyItem.template);
        if (failedTemplate) {
          setActiveTemplate(failedTemplate);
          setLastActiveTemplate(failedTemplate);
        }
      }
      setRestoreSnapshot(historyItem);
    }
  };

  /** Selects a template from the grid to use in the FreeCreationPanel. */
  const handleSelectTemplate = (t) => {
    setActiveTemplate(t);
    if (t) setLastActiveTemplate(t);
    setIsSelectingTemplate(false);
  };

  useEffect(() => {
    const requestedTemplate = getTemplateByRouteValue(routeTemplate);
    if (!requestedTemplate) return;
    setCanvasTab('templates');
    handleSelectTemplate(requestedTemplate);
  }, [routeTemplate]);

  useEffect(() => {
    const handleRouteChange = () => {
      const requestedTemplate = getQueryTemplate();
      if (!requestedTemplate) return;
      setCanvasTab('templates');
      handleSelectTemplate(requestedTemplate);
    };
    window.addEventListener('lazykiwi:route-change', handleRouteChange);
    return () => window.removeEventListener('lazykiwi:route-change', handleRouteChange);
  }, []);

  /** Clears the active template, returning to free creation mode. */
  const handleClearTemplate = () => setActiveTemplate(null);

  /**
   * Regenerate: restore the workbench to the state when that item was created.
   * Does NOT re-trigger generation — just fills the panel back with the snapshot.
   */
  const handleRestoreHistory = useCallback((item) => {
    // Find the full template object if this item used one
    const templateObj = item.template
      ? TEMPLATES.find((t) => t.name === item.template) ?? null
      : null;

    setRestoreSnapshot({ ...item, templateObj });

    // Switch to templates tab so the panel dock is in view
    setCanvasTab('templates');

    // If it was a template job, also pre-load the template chip
    if (templateObj) {
      setActiveTemplate(templateObj);
      setLastActiveTemplate(templateObj);
    } else {
      setActiveTemplate(null);
    }
    setIsSelectingTemplate(false);
  }, []);

  const handleRemoveHistory = (id) =>
    setHistory((prev) => prev.filter((h) => h.id !== id));

  const handlePlayVideo = useCallback((item) => {
    if (!item.videoUrl) return;
    setPlayingVideo(item);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const mergeHistoryItem = (historyItem) => {
      setHistory((prev) => {
        const key = historyItem.taskId || historyItem.id;
        const existingIndex = prev.findIndex((item) => (item.taskId || item.id) === key);
        if (existingIndex === -1) return [historyItem, ...prev];

        const previous = prev[existingIndex];
        const next = [...prev];
        next[existingIndex] = {
          ...previous,
          ...historyItem,
          imageFrame: historyItem.imageFrame || previous.imageFrame,
          imageFrames: historyItem.imageFrames?.length ? historyItem.imageFrames : previous.imageFrames,
          startFrame: historyItem.startFrame || previous.startFrame,
          endFrame: historyItem.endFrame || previous.endFrame,
        };
        return next;
      });
    };

    const loadHistory = async () => {
      if (!isAuthenticated()) {
        setIsHistoryLoading(false);
        return;
      }
      setIsHistoryLoading(true);
      try {
        const page = await getMyVideoGenerationTasks({ pageNo: 1, pageSize: 50 });
        if (cancelled) return;

        const records = page?.list || page?.records || page?.data?.list || page?.data?.records || [];
        const items = records.map(taskToHistoryItem);
        setHistory(items);

        records
          .filter((task) => ![30, 40, 50].includes(task?.status))
          .forEach((task) => {
            waitForVideoGeneration(task.id, (latest) => {
              if (!cancelled && latest) mergeHistoryItem(taskToHistoryItem(latest));
            });
          });
      } catch (error) {
        console.warn('[Video History Load Failed]', error);
      } finally {
        if (!cancelled) setIsHistoryLoading(false);
      }
    };

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Derived ──────────────────────────────────────────────────────────────
  const groupedHistory = history.reduce((acc, item) => {
    (acc[item.date] ??= []).push(item);
    return acc;
  }, {});
  const uniqueDates = [...new Set(history.map((item) => item.date))];

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="relative flex flex-col flex-1 min-h-0 bg-gray-50">

      {/* ── Tab Switcher — floated top-right ──────────────────────────── */}
      <div className="absolute top-2 right-6 z-30 flex items-center gap-1 bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-xl p-1 shadow-sm h-10">
        {canvasTab === 'history' && (
          <button
            type="button"
            onClick={() => setCanvasTab('templates')}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200"
          >
            <ArrowLeft size={14} /> Back
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            if (!isAuthenticated()) {
              window.dispatchEvent(new CustomEvent('lazykiwi:open-auth'));
              return;
            }
            setCanvasTab('history');
          }}
          className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-4 text-[13px] font-semibold transition-all duration-200 ${
            canvasTab === 'history'
              ? 'bg-gray-900 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Play size={13} /> My Video
        </button>
      </div>

      {/* ── Scrollable Canvas Area ─────────────────────────────────────── */}
      {/* pb-[360px] reserves space for the floating FreeCreationPanel dock  */}
      <div className="flex-1 overflow-y-auto pt-14 pb-[360px]">

        {/* ── Template / Preset Grid ──────────────────────────────────────── */}
        {canvasTab === 'templates' && (
          <>
            {activeMode === 'template' ? (
              // ── Show Templates ──
              <div className="max-w-7xl mx-auto px-6 py-6 sm:px-8 sm:py-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectTemplate(t)}
                      className="group flex flex-col text-left focus:outline-none"
                    >
                      <div className="w-full aspect-video overflow-hidden rounded-xl bg-gray-100 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md">
                        <TemplatePreviewMedia template={t} />
                      </div>
                      <p className="mt-2 px-0.5 text-[13px] font-medium text-gray-600 truncate transition-colors group-hover:text-gray-900">
                        {t.name}
                      </p>
                      <p className="px-0.5 text-[11px] text-gray-400 truncate">
                        {t.mode === 'start-end' ? 'Start & End' : 'Image to Video'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // ── Show Presets ──
              <div className={`max-w-[960px] mx-auto px-6 pb-6 sm:px-8 sm:pb-8 flex justify-center overflow-x-auto ${activeMode === 'text-to-video' ? 'pt-12 sm:pt-16' : 'pt-6 sm:pt-8'}`}>
                <div className={`flex flex-row justify-center items-center gap-4 sm:gap-6 ${activeMode === 'text-to-video' ? 'h-[160px] sm:h-[180px]' : 'h-[200px] sm:h-[230px]'}`}>
                  {(MODE_PRESETS[activeMode] || []).map((preset) => {
                    const isHovered = hoveredPreset?.id === preset.id;
                    const isAnotherHovered = hoveredPreset && !isHovered;
                    
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          freeCreationRef.current?.applyPreset(preset);
                          setHoveredPreset(null);
                        }}
                        onMouseEnter={() => setHoveredPreset(preset)}
                        onMouseLeave={() => setHoveredPreset(null)}
                        className={`group relative h-full flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 focus:outline-none transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md ${isAnotherHovered ? 'opacity-40' : 'opacity-100'}`}
                      >
                        <PresetPreviewMedia preset={preset} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── My Video / History Panel ───────────────────────────────────── */}
        {canvasTab === 'history' && (
          <div className="max-w-7xl mx-auto w-full px-6 py-6 sm:px-8 sm:py-8 space-y-12">

            {/* Empty state */}
            {isHistoryLoading && history.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                  <LoaderCircle size={22} className="animate-spin text-kiwi-green-dark" />
                </div>
                <p className="text-[14px] text-gray-400 font-medium">Loading videos...</p>
              </div>
            )}

            {history.length === 0 && !isGenerating && !isHistoryLoading && (
              <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                  <Play size={22} className="text-gray-300" />
                </div>
                <p className="text-[14px] text-gray-400 font-medium">No videos yet</p>
                <p className="text-[12px] text-gray-300">Click a template to get started</p>
              </div>
            )}

            {/* In-flight generating card (FreeCreationPanel only) */}
            {isGenerating && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-[16px] font-bold text-gray-900 tracking-tight shrink-0">
                    Generating
                  </h3>
                  <div className="h-[1px] flex-1 bg-gray-200/80 animate-pulse" />
                  <span className="text-[11px] text-kiwi-green-dark bg-kiwi-light-green/45 border border-kiwi-green/20 font-bold px-2.5 py-0.5 rounded-full">
                    1 video
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  <div className="group flex flex-col gap-2.5">
                    <div className="relative aspect-video w-full rounded-2xl bg-white border border-dashed border-gray-300 overflow-hidden flex flex-col items-center justify-center shadow-sm">
                      <LoaderCircle size={24} className="animate-spin text-kiwi-green-dark mb-1.5" />
                      <div className="text-[11px] font-bold text-gray-600">Creating video…</div>
                    </div>
                    <p className="text-[13px] font-medium text-gray-400 px-0.5 leading-relaxed italic">
                      Processing…
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Date-grouped history */}
            {uniqueDates.map((date) => (
              <div key={date} className="space-y-6">
                {/* Section header */}
                <div className="flex items-center gap-3">
                  <h3 className="text-[16px] font-bold text-gray-900 tracking-tight shrink-0">
                    {date}
                  </h3>
                  <div className="h-[1px] flex-1 bg-gray-200/80" />
                  <span className="text-[11px] text-gray-400 font-semibold px-2 py-0.5 rounded-full bg-gray-100">
                    {groupedHistory[date].length} video{groupedHistory[date].length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Video card grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {groupedHistory[date].map((item) => {
                    const templateImg = item.template
                      ? TEMPLATES.find((t) => t.name === item.template)?.img
                      : null;
                    const isProcessing = Boolean(item.taskId)
                      && item.status !== 30
                      && item.status !== 40
                      && item.status !== 50;
                    const progress = Math.max(0, Math.min(100, item.progress ?? 0));

                    return (
                      <div key={item.id} className="group flex flex-col gap-2.5">
                        {/* Thumbnail */}
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-gray-200/40 shadow-sm bg-gray-100">
                          {isProcessing ? (
                            <div className="absolute inset-0 overflow-hidden bg-gray-950">
                              <div className="absolute inset-0 bg-[linear-gradient(110deg,#111827_0%,#1f2937_35%,#7ee11d_48%,#1f2937_61%,#111827_100%)] opacity-30 animate-pulse" />
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
                                <LoaderCircle size={22} className="animate-spin text-kiwi-green" />
                                <span className="text-[11px] font-bold">Generating</span>
                                <div className="h-1 w-24 overflow-hidden rounded-full bg-white/20">
                                  <div
                                    className="h-full rounded-full bg-kiwi-green transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-semibold text-white/70">{progress}%</span>
                              </div>
                            </div>
                          ) : item.videoUrl ? (
                            <video
                              src={item.videoUrl}
                              className="absolute inset-0 h-full w-full object-cover"
                              muted
                              loop
                              playsInline
                              preload="metadata"
                            />
                          ) : templateImg ? (
                            <img
                              src={encodeURI(templateImg)}
                              alt={item.prompt}
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            />
                          ) : (
                            // Free-creation items have no template thumbnail
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <Play size={18} className="text-gray-300" />
                            </div>
                          )}

                          {/* Play overlay */}
                          {!isProcessing && item.videoUrl && (
                            <button
                              type="button"
                              onClick={() => handlePlayVideo(item)}
                              className="absolute inset-0 bg-black/10 flex items-center justify-center transition-colors group-hover:bg-black/20"
                              aria-label="Play video"
                            >
                              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-gray-900 shadow-md backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-kiwi-green">
                                <Play size={15} className="fill-current ml-0.5" />
                              </span>
                            </button>
                          )}

                          {isProcessing && (
                            <div className="absolute left-2 top-2 rounded-full border border-white/15 bg-black/45 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
                              Processing
                            </div>
                          )}

                          {item.status === 40 && (
                            <div className="absolute inset-x-2 bottom-2 rounded-lg bg-red-500/90 px-2 py-1 text-[11px] font-semibold text-white">
                              {item.errorMessage || 'Generation failed'}
                            </div>
                          )}

                          {/* Hover action buttons */}
                          <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 z-10">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRestoreHistory(item); }}
                              title="Regenerate"
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-black/45 hover:bg-white text-white hover:text-gray-900 backdrop-blur-md transition-all shadow shadow-black/10 active:scale-95"
                            >
                              <RefreshCw size={11} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRemoveHistory(item.id); }}
                              title="Delete"
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-black/45 hover:bg-red-500 text-white hover:text-white backdrop-blur-md transition-all shadow shadow-black/10 active:scale-95"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>

                        {/* Prompt label */}
                        <p
                          className="text-[13px] font-medium text-gray-600 px-0.5 line-clamp-2 leading-relaxed transition-colors group-hover:text-gray-900"
                          title={item.prompt}
                        >
                          {item.prompt}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── FreeCreationPanel — fixed floating dock ─────────────────────── */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-black shadow-2xl">
            <button
              type="button"
              onClick={() => setPlayingVideo(null)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-white hover:text-gray-900"
              aria-label="Close video"
            >
              <X size={16} />
            </button>
            <video
              src={playingVideo.videoUrl}
              className="max-h-[82vh] w-full bg-black"
              controls
              autoPlay
              playsInline
            />
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-20 px-5 pb-5 pt-2">
        <FreeCreationPanel
          ref={freeCreationRef}
          template={activeTemplate}
          isSelectingTemplate={isSelectingTemplate}
          isHistoryView={canvasTab === 'history'}
          onExitHistoryView={() => setCanvasTab('templates')}
          onToggleSelectTemplate={() => setIsSelectingTemplate(!isSelectingTemplate)}
          onClearTemplate={handleClearTemplate}
          onRestoreLastTemplate={() => {
            if (lastActiveTemplate) {
              setActiveTemplate(lastActiveTemplate);
              return true;
            }
            return false;
          }}
          onGenerateStart={handleFreeCreationStart}
          onGenerated={handleGenerated}
          restoreSnapshot={restoreSnapshot}
          onSnapshotRestored={() => setRestoreSnapshot(null)}
          onModeChange={setActiveMode}
          hoveredPreset={hoveredPreset}
          routeMode={routeMode}
        />
      </div>

    </div>
  );
}
