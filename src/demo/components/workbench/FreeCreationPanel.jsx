import { forwardRef, useState, useRef, useEffect, useImperativeHandle } from 'react';
import {
  X, ArrowRight, ArrowUp, LoaderCircle,
  SlidersHorizontal, Clock3, Check, AlertCircle,
} from 'lucide-react';

import { Dropdown } from './Dropdown.jsx';
import { PrimaryButton, PillGroup, ClearableTextarea } from './primitives.jsx';
import ImageUploadBox from './ImageUploadBox.jsx';
import MultiImageUpload from './MultiImageUpload.jsx';
import ImageMentionTextarea from './ImageMentionTextarea.jsx';
import {
  submitVideoGeneration,
  uploadVideoImageFile,
  waitForVideoGeneration,
} from '../../lib/videoGenerator.js';
import { isAuthenticated } from '../../lib/auth.js';
import {
  MODELS,
  FREE_MODES,
  ASPECT_PILL_OPTIONS,
  LIMITED_DURATION_PILL_OPTIONS,
  QUALITY_PILL_OPTIONS,
  PROMPT_LIMIT,
  getVideoCredits,
  getAspectOptionsForModel,
  getDurationOptionsForModel,
  getProviderVideoModel,
  getQualityOptionsForModel,
  getVideoModelById,
  getVideoModelConfig,
} from './videoGeneratorData.js';

function ParameterPicker({ label, value, options, onChange, icon: Icon, columns = 3 }) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  return (
    <div ref={pickerRef} className="relative flex h-8 shrink-0 items-stretch">
      <div className="flex min-w-[50px] items-center rounded-l-lg border border-r-0 border-gray-200 bg-gray-900 px-3 text-[12px] font-semibold text-white shadow-sm">
        {value}
      </div>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-8 items-center justify-center rounded-r-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
        aria-label={`Adjust ${label}`}
        aria-expanded={isOpen}
      >
        <Icon size={14} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 z-50 mb-3 w-[220px] rounded-2xl border border-gray-200/80 bg-white p-3 shadow-xl">
          <div className="mb-2.5 flex items-center gap-2 px-1">
            <Icon size={13} className="text-gray-400" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
              {label}
            </span>
          </div>
          <div
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {options.map((option) => {
              const selected = value === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                  className={`relative flex h-9 items-center justify-center rounded-lg text-[12px] font-semibold transition ${
                    selected
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {option.label}
                  {selected && <Check size={10} className="absolute right-1.5 top-1.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Parse @[Image N] mentions from the prompt and map them to image entries.
 */
function extractReferencedImages(prompt, imageFrames) {
  const refs = [];
  const regex = /@\[(Image \d+)\]/g;
  let match;
  while ((match = regex.exec(prompt)) !== null) {
    const displayName = match[1];
    const img = imageFrames.find((i) => i.displayName === displayName);
    if (img) {
      refs.push({
        mention: `@[${displayName}]`,
        imageId: img.id,
        displayName,
      });
    }
  }
  return refs;
}

function durationToSeconds(duration) {
  return Number.parseInt(String(duration || '5s'), 10) || 5;
}

function modelToProviderModel(mode, selectedModel) {
  return getProviderVideoModel(selectedModel);
}

function modelSlug(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getQueryModel() {
  if (typeof window === 'undefined') return null;
  const requested = new URLSearchParams(window.location.search).get('model');
  if (!requested) return null;
  const normalized = modelSlug(requested);
  return MODELS.find((model) => model.id === requested || modelSlug(model.name) === normalized) || getVideoModelById(requested);
}

function taskToHistoryItem(task, template) {
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
    prompt: task.prompt || template?.desc || '(no prompt)',
    template: task.templateName || template?.name || null,
    date: new Date(task.createTime || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mode: task.generateType === 3 ? 'start-end' : task.generateType === 2 ? 'image-to-video' : 'text-to-video',
    model: task.model,
    aspectRatio: task.aspectRatio,
    duration: `${task.duration || 5}s`,
    quality: task.resolution,
    imageFrame: '',
    imageFrames: [],
    startFrame: '',
    endFrame: '',
    videoUrl: task.videoUrl || task.videoUrls?.[0] || '',
    status: task.status,
    progress: task.progress,
    errorMessage: task.errorMessage,
  };
}

/**
 * FreeCreationPanel
 *
 * The always-visible floating creation dock rendered at the bottom of the
 * VideoGeneratorWorkbench canvas area. Supports three independent creation modes:
 *
 *   • text-to-video   — large textarea only
 *   • image-to-video  — single image upload + textarea (free-form, no template)
 *   • start-end       — start & end frame uploads + optional textarea
 *
 * All generation parameters (Model, Aspect Ratio, Duration) are exposed as flat
 * UI controls — no collapsed settings popover.
 */
const FreeCreationPanel = forwardRef(function FreeCreationPanel({
  template,
  isSelectingTemplate,
  onToggleSelectTemplate,
  onClearTemplate,
  onRestoreLastTemplate,
  onGenerateStart,
  onGenerated,
  restoreSnapshot,
  onSnapshotRestored,
  onModeChange,
  hoveredPreset,
  routeMode,
  isHistoryView,   // true when the canvas is showing My Video history
  onExitHistoryView,
}, ref) {
  // ── Mode ────────────────────────────────────────────────────────────────────
  // 'text-to-video' | 'image-to-video' | 'start-end' | 'template'
  const getInitialMode = () => {
    if (routeMode === 'image') return 'image-to-video';
    if (routeMode === 'start-end') return 'start-end';
    if (routeMode === 'template') return 'template';
    if (routeMode === 'text') return 'text-to-video';
    if (typeof window === 'undefined') return 'text-to-video';
    const params = new URLSearchParams(window.location.search);
    const m = params.get('mode');
    if (m === 'image') return 'image-to-video';
    if (m === 'start-end') return 'start-end';
    if (m === 'template') return 'template';
    return 'text-to-video';
  };
  const [mode, setMode] = useState(getInitialMode);
  // Track previous non-template mode so we can restore it when user picks
  // a real mode tab after being in template-selection state.
  const prevModeRef = useRef('text-to-video');

  useEffect(() => {
    const nextMode = getInitialMode();
    setMode(nextMode);
    if (nextMode === 'template' && !template && !isHistoryView && !isSelectingTemplate) {
      onToggleSelectTemplate?.();
    }
  }, [routeMode]);

  useEffect(() => {
    const syncModeFromRoute = () => {
      const nextMode = getInitialMode();
      setMode(nextMode);
      if (nextMode === 'template' && !template && !isHistoryView && !isSelectingTemplate) {
        onToggleSelectTemplate?.();
      }
    };
    window.addEventListener('lazykiwi:route-change', syncModeFromRoute);
    return () => window.removeEventListener('lazykiwi:route-change', syncModeFromRoute);
  }, [template, isHistoryView, isSelectingTemplate, onToggleSelectTemplate]);

  // ── Inputs & Parameters: Isolated Drafts ────────────────────────────────────

  const [textDraft, setTextDraft] = useState({
    prompt: '',
    imageFrame: '',
    imageFrameFile: null,
    imageFrames: [],
    selectedModel: MODELS[0],
    aspectRatio: '16:9',
    duration: '5s',
    quality: '720p',
  });

  const [imageDraft, setImageDraft] = useState({
    prompt: '',
    imageFrame: '',
    imageFrameFile: null,
    imageFrames: [],
    selectedModel: MODELS[0],
    aspectRatio: '16:9',
    duration: '5s',
    quality: '720p',
  });

  const [framesDraft, setFramesDraft] = useState({
    prompt: '',
    startFrame: '',
    startFrameFile: null,
    endFrame: '',
    endFrameFile: null,
    selectedModel: MODELS[0],
    aspectRatio: '16:9',
    duration: '5s',
    quality: '720p',
  });

  const [templateDraft, setTemplateDraft] = useState({
    prompt: '',
    imageFrame: '',
    imageFrameFile: null,
    startFrame: '',
    startFrameFile: null,
    endFrame: '',
    endFrameFile: null,
    selectedModel: MODELS[0],
    aspectRatio: '16:9',
    duration: '5s',
    quality: '720p',
  });

  useEffect(() => {
    const requestedModel = getQueryModel();
    if (!requestedModel) return;
    setTextDraft((d) => ({ ...d, selectedModel: requestedModel }));
    setImageDraft((d) => ({ ...d, selectedModel: requestedModel }));
    setFramesDraft((d) => ({ ...d, selectedModel: requestedModel }));
    setTemplateDraft((d) => ({ ...d, selectedModel: requestedModel }));
  }, []);

  const currentDraft =
    mode === 'text-to-video' ? textDraft :
    mode === 'image-to-video' ? imageDraft :
    mode === 'start-end' ? framesDraft :
    templateDraft;

  const updateDraft = (targetMode, updater) => {
    if (targetMode === 'text-to-video') setTextDraft(updater);
    else if (targetMode === 'image-to-video') setImageDraft(updater);
    else if (targetMode === 'start-end') setFramesDraft(updater);
    else setTemplateDraft(updater);
  };

  const updateCurrentDraft = (updater) => updateDraft(mode, updater);

  const prompt = currentDraft.prompt;
  const setPrompt = (val) => updateCurrentDraft((d) => ({ ...d, prompt: typeof val === 'function' ? val(d.prompt) : val }));

  const imageFrame = currentDraft.imageFrame;
  const setImageFrame = (val) => updateCurrentDraft((d) => ({ ...d, imageFrame: typeof val === 'function' ? val(d.imageFrame) : val }));
  const imageFrameFile = currentDraft.imageFrameFile;
  const setImageFrameFile = (val) => updateCurrentDraft((d) => ({ ...d, imageFrameFile: typeof val === 'function' ? val(d.imageFrameFile) : val }));

  const imageFrames = currentDraft.imageFrames || [];
  const setImageFrames = (val) => updateCurrentDraft((d) => ({ ...d, imageFrames: typeof val === 'function' ? val(d.imageFrames) : val }));

  // Sync handler for MultiImageUpload: updates array + keeps imageFrame for backward compat
  const handleImagesChange = (newFrames) => {
    updateCurrentDraft((d) => ({
      ...d,
      imageFrames: newFrames,
      imageFrame: newFrames[0]?.previewUrl || '',
    }));
  };

  const startFrame = currentDraft.startFrame;
  const setStartFrame = (val) => updateCurrentDraft((d) => ({ ...d, startFrame: typeof val === 'function' ? val(d.startFrame) : val }));
  const startFrameFile = currentDraft.startFrameFile;
  const setStartFrameFile = (val) => updateCurrentDraft((d) => ({ ...d, startFrameFile: typeof val === 'function' ? val(d.startFrameFile) : val }));

  const endFrame = currentDraft.endFrame;
  const setEndFrame = (val) => updateCurrentDraft((d) => ({ ...d, endFrame: typeof val === 'function' ? val(d.endFrame) : val }));
  const endFrameFile = currentDraft.endFrameFile;
  const setEndFrameFile = (val) => updateCurrentDraft((d) => ({ ...d, endFrameFile: typeof val === 'function' ? val(d.endFrameFile) : val }));

  const selectedModel = currentDraft.selectedModel;
  const setSelectedModel = (val) => {
    const nextModel = typeof val === 'function' ? val(selectedModel) : val;
    setTextDraft((d) => ({ ...d, selectedModel: nextModel }));
    setImageDraft((d) => ({ ...d, selectedModel: nextModel }));
    setFramesDraft((d) => ({ ...d, selectedModel: nextModel }));
    setTemplateDraft((d) => ({ ...d, selectedModel: nextModel }));
  };

  const aspectRatio = currentDraft.aspectRatio;
  const setAspectRatio = (val) => updateCurrentDraft((d) => ({ ...d, aspectRatio: typeof val === 'function' ? val(d.aspectRatio) : val }));

  const duration = currentDraft.duration;
  const setDuration = (val) => updateCurrentDraft((d) => ({ ...d, duration: typeof val === 'function' ? val(d.duration) : val }));

  const quality = currentDraft.quality;
  const setQuality = (val) => updateCurrentDraft((d) => ({ ...d, quality: typeof val === 'function' ? val(d.quality) : val }));

  const modelConfig = getVideoModelConfig(selectedModel);
  const modelOptions = mode === 'start-end'
    ? MODELS.filter((model) => getVideoModelConfig(model).modes.includes('start-end'))
    : MODELS;
  const aspectOptions = mode === 'template' ? ASPECT_PILL_OPTIONS : getAspectOptionsForModel(selectedModel);
  const durationOptions = mode === 'template'
    ? LIMITED_DURATION_PILL_OPTIONS
    : getDurationOptionsForModel(selectedModel, mode);
  const qualityOptions = mode === 'template' ? QUALITY_PILL_OPTIONS : getQualityOptionsForModel(selectedModel);

  useEffect(() => {
    if (mode === 'template') return;
    if (modelConfig.modes.includes(mode)) return;
    const compatibleModel = mode === 'start-end'
      ? MODELS.find((model) => getVideoModelConfig(model).modes.includes(mode))
      : null;
    if (compatibleModel) {
      setSelectedModel(compatibleModel);
      return;
    }
    const fallbackMode = modelConfig.modes.includes('image-to-video') ? 'image-to-video' : modelConfig.modes[0];
    if (fallbackMode) {
      setMode(fallbackMode);
    }
  }, [mode, modelConfig]);

  useEffect(() => {
    const nextAspect = aspectOptions.some((option) => option.id === aspectRatio)
      ? aspectRatio
      : (aspectOptions[0]?.id || modelConfig.defaults.aspectRatio);
    const nextDuration = durationOptions.some((option) => option.id === duration)
      ? duration
      : (durationOptions.find((option) => option.id === modelConfig.defaults.duration)?.id || durationOptions[0]?.id);
    const nextQuality = qualityOptions.some((option) => option.id === quality)
      ? quality
      : (qualityOptions.find((option) => option.id === modelConfig.defaults.quality)?.id || qualityOptions[0]?.id);
    if (nextAspect !== aspectRatio || nextDuration !== duration || nextQuality !== quality) {
      updateCurrentDraft((d) => ({
        ...d,
        aspectRatio: nextAspect,
        duration: nextDuration,
        quality: nextQuality,
      }));
    }
  }, [selectedModel, mode, aspectOptions, durationOptions, qualityOptions, aspectRatio, duration, quality, modelConfig]);

  // Compute dynamic credits
  const credits = getVideoCredits(selectedModel, duration, quality, mode === 'template' ? 'on' : 'off');

  // ── Generation state ────────────────────────────────────────────────────────
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptError, setPromptError]   = useState(false); // over-limit warning
  const [generationError, setGenerationError] = useState('');

  // ── Report mode to parent ───────────────────────────────────────────────────
  useEffect(() => {
    onModeChange?.(mode);
  }, [mode, onModeChange]);

  useEffect(() => {
    if (mode === 'template' && !template && !isHistoryView && !isSelectingTemplate) {
      onToggleSelectTemplate?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Imperative API for Parent (apply preset) ────────────────────────────────
  useImperativeHandle(ref, () => ({
    applyPreset: (preset) => {
      const targetMode = preset.mode;
      const presetImageFrame = targetMode === 'image-to-video' ? (preset.imageFrame || '') : '';
      updateDraft(targetMode, (d) => ({
        ...d,
        prompt: preset.prompt || '',
        imageFrame: presetImageFrame,
        imageFrameFile: null,
        imageFrames: targetMode === 'image-to-video' && presetImageFrame
          ? [{ id: 'img_preset_1', previewUrl: presetImageFrame, displayName: 'Image 1', originalName: '' }]
          : [],
        startFrame: targetMode === 'start-end' ? (preset.startFrame || '') : '',
        startFrameFile: null,
        endFrame: targetMode === 'start-end' ? (preset.endFrame || '') : '',
        endFrameFile: null,
      }));
      setPromptError(false);
      setMode(targetMode);

      // Exit template selection if active
      if (template) onClearTemplate();
      if (isSelectingTemplate) onToggleSelectTemplate();
    }
  }));

  // ── Snapshot restore ─────────────────────────────────────────────────────────
  // Triggered by the orchestrator when Regenerate is clicked on a history card.
  // Restores mode, prompt, model, aspect ratio, duration and uploaded media.
  useEffect(() => {
    if (!restoreSnapshot) return;

    const snap = restoreSnapshot;

    // 1. Mode — default to text-to-video if somehow missing
    const snapMode = snap.entryTab || snap.mode || 'text-to-video';
    const snapModel = MODELS.find((m) => m.name === snap.model) ?? MODELS[0];

    const snapImageFrame = snap.imageFrame || '';
    const initialFrames = snapImageFrame
      ? [{ id: 'img_restore_1', previewUrl: snapImageFrame, displayName: 'Image 1', originalName: '' }]
      : [];

    updateDraft(snapMode, (d) => ({
      ...d,
      prompt: snap.prompt === '(no prompt)' ? '' : (snap.prompt || ''),
      selectedModel: snapModel,
      aspectRatio: snap.aspectRatio || '16:9',
      duration: snap.duration || '5s',
      quality: snap.quality || '720p',
      imageFrame: snapImageFrame,
      imageFrameFile: null,
      imageFrames: initialFrames,
      startFrame: snap.startFrame || '',
      startFrameFile: null,
      endFrame: snap.endFrame || '',
      endFrameFile: null,
    }));

    setGenerationError(snap.status === 40 ? (snap.errorMessage || 'Generation failed') : '');
    setPromptError(false);
    setMode(snapMode);

    // Tell the orchestrator the snapshot has been consumed
    onSnapshotRestored?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restoreSnapshot]);

  // ── History View Auto-Fallback ──────────────────────────────────────────────
  // If we enter the My Video history view, and we are in template mode but have
  // no template loaded, we must fallback to a valid free-creation tab.
  useEffect(() => {
    if (isHistoryView && mode === 'template' && !template) {
      if (onRestoreLastTemplate) {
        const restored = onRestoreLastTemplate();
        if (restored) return;
      }
      // If restore failed, fallback!
      const fallbackMode = (prevModeRef.current && prevModeRef.current !== 'template') 
        ? prevModeRef.current 
        : 'text-to-video';
      setMode(fallbackMode);
    }
  }, [isHistoryView, mode, template, onRestoreLastTemplate]);

  // ── Prompt character limits ──────────────────────────────────────────────────
  // PROMPT_WARN: threshold above which the counter becomes visible
  // PROMPT_LIMIT: hard max; Generate is blocked above this
  const PROMPT_WARN = 1000;
  const promptLen      = prompt.length;
  const promptNearLimit = promptLen > PROMPT_WARN;
  const promptOverLimit = promptLen > PROMPT_LIMIT;

  // ── Helpers ─────────────────────────────────────────────────────────────────

  /**
   * Smart mode-change handler.
   *
   * When the new mode is 'template':
   *   - Remember the current real mode in prevModeRef
   *   - Call the orchestrator toggle so isSelectingTemplate becomes true
   *
   * When switching away from template mode to a real mode:
   *   - Just switch mode and clear template selection. Data isolation means
   *     no cross-tab pollution occurs.
   */
  const handleModeChange = (newMode) => {
    if (newMode === 'template') {
      if (isHistoryView && !template) {
        if (onRestoreLastTemplate) {
          const restored = onRestoreLastTemplate();
          if (restored) {
            prevModeRef.current = mode === 'template' ? prevModeRef.current : mode;
            setMode('template');
            return;
          }
        }
        if (onExitHistoryView) onExitHistoryView();
      }

      prevModeRef.current = mode === 'template' ? prevModeRef.current : mode;
      setMode('template');
      
      if (!isSelectingTemplate) onToggleSelectTemplate();
      return;
    }

    if (newMode === 'start-end' && !getVideoModelConfig(selectedModel).modes.includes(newMode)) {
      const compatibleModel = MODELS.find((model) => getVideoModelConfig(model).modes.includes(newMode));
      if (compatibleModel) setSelectedModel(compatibleModel);
    }

    // Leaving template mode (clicking a real mode tab)
    setMode(newMode);

    // Clear template chip and exit template-selection if we were in either.
    // BUT: if we're on the My Video history page, keep the template alive so
    // clicking back to Template tab restores the session (not idle).
    if (template && !isHistoryView) onClearTemplate();
    if (isSelectingTemplate) onToggleSelectTemplate();
  };

  const resolveMediaUrl = async (value, file) => {
    if (file) return uploadVideoImageFile(file);
    if (/^https?:\/\//.test(value || '')) return value;
    if (value?.startsWith('/') && typeof window !== 'undefined') return `${window.location.origin}${value}`;
    return '';
  };

  const resolveImageFrameUrls = async () => {
    const urls = [];
    const frames = (imageFrames || []).filter((img) => img?.previewUrl);
    if (frames.length > 0) {
      for (const frame of frames) {
        const url = await resolveMediaUrl(frame.previewUrl, frame.file);
        if (url) urls.push(url);
      }
      return urls;
    }
    const single = await resolveMediaUrl(imageFrame, imageFrameFile);
    return single ? [single] : [];
  };

  const handleGenerate = async () => {
    if (!isAuthenticated()) {
      window.dispatchEvent(new CustomEvent('lazykiwi:open-auth'));
      return;
    }
    if (isGenerating) return;
    if (promptOverLimit) {
      setPromptError(true);
      return;
    }
    setGenerationError('');
    setPromptError(false);
    setIsGenerating(true);
    onGenerateStart?.();

    // Capture the current uploads NOW (before the 2.2s delay clears them).
    const snapImageFrame = imageFrame;
    const snapImageFrames = imageFrames;
    const snapStartFrame = startFrame;
    const snapEndFrame   = endFrame;
    const snapPrompt     = prompt.trim() || '(no prompt)';
    const snapMode       = mode;
    const snapModel      = selectedModel;
    const snapAspect     = aspectRatio;
    const snapDuration   = duration;
    const snapQuality    = quality;
    const hasReferenceImages =
      (snapImageFrames || []).some((img) => img?.previewUrl) || !!snapImageFrame;
    const submitMode = mode === 'text-to-video' && hasReferenceImages ? 'image-to-video' : mode;

    // Debug payload — console.log for API integration
    if (submitMode === 'image-to-video') {
      const referencedImages = extractReferencedImages(prompt, snapImageFrames);
      console.log('[Generate Debug]', {
        mode: submitMode,
        prompt: snapPrompt,
        images: snapImageFrames.map((img) => ({
          id: img.id,
          displayName: img.displayName,
          originalName: img.originalName || '',
        })),
        referencedImages,
      });
    }

    try {
      const imageUrls = submitMode === 'image-to-video' ? await resolveImageFrameUrls() : [];
      const firstFrameImage = mode === 'start-end' ? await resolveMediaUrl(startFrame, startFrameFile) : '';
      const lastFrameImage = mode === 'start-end' ? await resolveMediaUrl(endFrame, endFrameFile) : '';
      const task = await submitVideoGeneration({
        generateType: submitMode === 'text-to-video' ? 1 : submitMode === 'image-to-video' ? 2 : 3,
        model: modelToProviderModel(submitMode, selectedModel),
        prompt: snapPrompt === '(no prompt)' ? '' : snapPrompt,
        duration: durationToSeconds(snapDuration),
        aspectRatio: snapAspect,
        resolution: snapQuality,
        imageUrls,
        firstFrameImage,
        lastFrameImage,
      });
      onGenerated?.({
        ...taskToHistoryItem(task),
        imageFrame: imageUrls[0] || snapImageFrame,
        imageFrames: snapImageFrames.map((img, index) => ({ ...img, previewUrl: imageUrls[index] || img.previewUrl })),
        startFrame: firstFrameImage || snapStartFrame,
        endFrame: lastFrameImage || snapEndFrame,
      });
      waitForVideoGeneration(task.id, (latest) => {
        if (!latest) return;
        onGenerated?.(taskToHistoryItem(latest));
      }).finally(() => setIsGenerating(false));
      setPrompt('');
      setImageFrame('');
      setImageFrameFile(null);
      setImageFrames([]);
      setStartFrame('');
      setStartFrameFile(null);
      setEndFrame('');
      setEndFrameFile(null);
    } catch (error) {
      console.error('[Video Generate Failed]', error);
      const message = error.message || 'Generation failed';
      setGenerationError(message);
      onGenerated?.({
        id: Date.now(),
        type: 'video',
        sourceType: 'free',
        entryTab: snapMode,
        prompt: snapPrompt,
        template: null,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mode: snapMode,
        model: snapModel.name,
        aspectRatio: snapAspect,
        duration: snapDuration,
        quality: snapQuality,
        imageFrame: snapImageFrame,
        imageFrames: snapImageFrames,
        startFrame: snapStartFrame,
        endFrame: snapEndFrame,
        status: 40,
        errorMessage: message,
      });
      setIsGenerating(false);
    }
  };

  /**
   * Media inheritance rules when a template is active.
   * These are computed at render time from existing state — no state mutation needed.
   *
   *   template.mode === 'image-to-video':
   *     effectiveImage = imageFrame  (from image-to-video mode)
   *                   || startFrame  (from start-end mode — use Start as the single image)
   *
   *   template.mode === 'start-end':
   *     effectiveStart = startFrame  (from start-end mode)
   *                   || imageFrame  (from image-to-video — goes into Start slot)
   *     effectiveEnd   = endFrame    (only from start-end mode)
   */
  const effectiveImage = imageFrame || startFrame;
  const effectiveStart = startFrame || imageFrame;
  const effectiveEnd   = endFrame;
  const effectiveImageFile = imageFrame ? imageFrameFile : startFrameFile;
  const effectiveStartFile = startFrame ? startFrameFile : imageFrameFile;

  // \u2500\u2500 Render \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  return (
    <div className="max-w-5xl w-[calc(100%-32px)] md:w-full mx-auto rounded-[28px] bg-white border border-gray-200/80 shadow-xl flex flex-col">

      {/* ════════════════════════════════════════════════════════════════════
          TAB BAR — always visible, regardless of mode or template state
          ════════════════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-0.5 border-b border-gray-100 px-4 pt-3 pb-0 relative">
        {FREE_MODES.map((m) => {
          const isActive = mode === m.id;

          // Template tab always shows "Template" — name appears below the preview card
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => handleModeChange(m.id)}
              className={`relative inline-flex h-10 items-center gap-1.5 rounded-t-lg px-4 text-[13px] font-semibold transition-all duration-200 border-b-2 -mb-px ${
                isActive
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {m.label}
              {m.badge && (
                <span className="rounded bg-lime-100 border border-lime-200 px-1.5 py-px text-[9px] font-bold italic text-lime-700 leading-none">
                  {m.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          CONTENT AREA — switches based on mode / template state
          ════════════════════════════════════════════════════════════════════ */}

      {/* ── A. Template-selection hint (no prompt, no params, no upload slots) ── */}
      {mode === 'template' && !template && !isHistoryView && (
        <div className="flex items-center gap-2 px-5 py-3.5">
          <ArrowUp size={14} strokeWidth={2} className="text-gray-400 shrink-0" />
          <span className="text-[13px] font-medium text-gray-500">
            Choose a template above to continue
          </span>
        </div>
      )}

      {/* ── B. Active Template workbench (preview + upload + generate) ─────── */}
      {mode === 'template' && template && (
        <div className="flex flex-col px-4 py-2.5 sm:px-6 sm:py-3 gap-2">
          <div className="flex items-center gap-5 min-h-[105px]">
            {/* Left: Template Preview thumbnail + name/category below — centred vertically */}
            <div className="shrink-0 flex flex-col items-start gap-1.5 self-center">
              <div className="relative w-[108px] bg-zinc-950 rounded-xl overflow-hidden flex items-center justify-center shadow-inner" style={{minHeight: '88px'}}>
                <img
                  src={encodeURI(template.img)}
                  alt={template.name}
                  className="w-full h-full object-contain"
                />
                {/* × to dismiss template — in card top-right corner */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearTemplate();
                    setMode('template');
                    if (!isSelectingTemplate) onToggleSelectTemplate();
                  }}
                  className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white transition-colors z-10"
                  aria-label="Remove template"
                >
                  <X size={10} />
                </button>
              </div>
              <p className="text-[12px] font-semibold text-gray-800 truncate max-w-[108px]">{template.name}</p>
              {template.category && (
                <p className="text-[10px] text-gray-400 truncate max-w-[108px] -mt-1">{template.category}</p>
              )}
            </div>

            {/* Right: Upload requirements */}
            <div className="flex-1 flex flex-col gap-3 py-1">
              <p className="text-[12px] text-gray-500">Upload media to apply this template.</p>

              <div className="flex items-center gap-3">
                {template.mode === 'image-to-video' && (
                  <ImageUploadBox
                    value={effectiveImage}
                    onChange={(value, file) => {
                      setImageFrame(value);
                      setImageFrameFile(file || null);
                    }}
                    onClear={() => {
                      setImageFrame('');
                      setImageFrameFile(null);
                    }}
                    className="w-[80px]"
                  />
                )}
                {template.mode === 'start-end' && (
                  <>
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-gray-600 pl-1">Start</span>
                      <ImageUploadBox
                        value={effectiveStart}
                        previewValue={hoveredPreset?.startFrame}
                        onChange={(value, file) => {
                          setStartFrame(value);
                          setStartFrameFile(file || null);
                        }}
                        onClear={() => {
                          setStartFrame('');
                          setStartFrameFile(null);
                        }}
                        className="w-[72px]"
                      />
                    </div>
                    <div className="flex flex-col items-center justify-center pt-7 px-0.5 text-gray-300">
                      <ArrowRight size={16} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 pl-1">
                        <span className="text-[11px] font-semibold text-gray-600">End</span>
                        <span className="text-[9px] font-medium text-gray-400 bg-gray-100 px-1.5 py-[1px] rounded-full">Optional</span>
                      </div>
                      <ImageUploadBox
                        value={effectiveEnd}
                        previewValue={hoveredPreset?.endFrame}
                        onChange={(value, file) => {
                          setEndFrame(value);
                          setEndFrameFile(file || null);
                        }}
                        onClear={() => {
                          setEndFrame('');
                          setEndFrameFile(null);
                        }}
                        className="w-[72px]"
                      />
                    </div>
                  </>
                )}

                <div className="flex-1 min-w-0" />

                <div className="self-end mt-auto flex items-center gap-2">
                  <ParameterPicker
                    label="Duration"
                    options={durationOptions}
                    value={duration}
                    onChange={setDuration}
                    icon={Clock3}
                    columns={3}
                  />
                  <PrimaryButton
                    onClick={async () => {
                      if (!isAuthenticated()) {
                        window.dispatchEvent(new CustomEvent('lazykiwi:open-auth'));
                        return;
                      }
                      if (isGenerating) return;
                      setGenerationError('');
                      setIsGenerating(true);
                      onGenerateStart?.();
                      const snapImage = effectiveImage;
                      const snapStart = effectiveStart;
                      const snapEnd   = effectiveEnd;
                      const snapDuration = duration;
                      try {
                        const inputImage = template.mode === 'image-to-video'
                          ? await resolveMediaUrl(effectiveImage, effectiveImageFile)
                          : await resolveMediaUrl(effectiveStart, effectiveStartFile);
                        const task = await submitVideoGeneration({
                          generateType: 4,
                          templateId: template.templateId,
                          templateName: template.name,
                          prompt: template.desc,
                          duration: durationToSeconds(snapDuration),
                          aspectRatio,
                          resolution: quality,
                          sound: 'on',
                          imageUrls: inputImage ? [inputImage] : [],
                        });
                        onGenerated?.({
                          ...taskToHistoryItem(task, template),
                          imageFrame:  template.mode === 'image-to-video' ? (inputImage || snapImage) : '',
                          startFrame:  template.mode === 'start-end' ? (inputImage || snapStart) : '',
                          endFrame:    template.mode === 'start-end' ? snapEnd : '',
                        });
                        waitForVideoGeneration(task.id, (latest) => {
                          if (!latest) return;
                          onGenerated?.(taskToHistoryItem(latest, template));
                        }).finally(() => setIsGenerating(false));
                        // Do NOT call onClearTemplate() — keep the template selected
                        // so the bottom dock stays in the template workbench state
                        // (State C: generation done, template still visible)
                      } catch (error) {
                        console.error('[Video Template Generate Failed]', error);
                        const message = error?.message || 'Video generation failed';
                        setGenerationError(message);
                        onGenerated?.({
                          id:          Date.now(),
                          type:        'video',
                          sourceType:  'template',
                          entryTab:    'template',
                          prompt:      template.desc,
                          template:    template.name,
                          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                          mode:        template.mode,
                          model:       'template',
                          aspectRatio,
                          duration:    snapDuration,
                          quality,
                          imageFrame:  template.mode === 'image-to-video' ? snapImage : '',
                          startFrame:  template.mode === 'start-end' ? snapStart : '',
                          endFrame:    template.mode === 'start-end' ? snapEnd : '',
                          status:      40,
                          errorMessage: message,
                        });
                        setIsGenerating(false);
                      }
                    }}
                    disabled={false}
                    credits={isGenerating ? undefined : credits}
                  >
                    {generationError ? 'Retry' : 'Generate'}
                  </PrimaryButton>
                </div>
              </div>
              {generationError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-600">
                  <AlertCircle size={13} className="shrink-0" />
                  <span className="min-w-0 truncate">{generationError}. Credits were not charged.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── C. Free-creation panel (text / image-to-video / start-end) ────── */}
      {mode !== 'template' && (
        <div className="flex flex-col px-4 py-2.5 sm:px-6 sm:py-3 gap-2">
          <div className="min-h-[105px]">

            {/* Generator */}
            {(mode === 'text-to-video' || mode === 'image-to-video') && (
              <div className="flex items-start gap-4 h-full">
                <div className="flex w-[80px] shrink-0 flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 pl-1">
                    <span className="text-[11px] font-semibold text-gray-600">Ref</span>
                    <span className="rounded-full bg-gray-100 px-1.5 py-[1px] text-[9px] font-medium text-gray-400">
                      Optional
                    </span>
                  </div>
                  <MultiImageUpload
                    images={imageFrames}
                    onImagesChange={handleImagesChange}
                    className="w-full"
                  />
                </div>
                <div className="flex-1 relative h-full">
                  <ImageMentionTextarea
                    value={prompt}
                    onChange={(val) => { setPrompt(val); setPromptError(false); }}
                    placeholder={(!prompt && hoveredPreset?.prompt) ? hoveredPreset.prompt : "Describe the scene or motion you want to generate..."}
                    className="w-full h-[105px] bg-transparent text-[15px] text-gray-800 placeholder-gray-400 leading-relaxed transition-all"
                    containerClassName="h-full"
                    maxLength={PROMPT_LIMIT}
                    showCounter={false}
                    images={imageFrames}
                  />
                  {promptNearLimit && (
                    <span className={`absolute bottom-2 right-0 text-[11px] tabular-nums ${
                      promptOverLimit ? 'text-red-500 font-semibold' : 'text-gray-400'
                    }`}>
                      {promptLen} / {PROMPT_LIMIT}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Start & End Frames */}
            {mode === 'start-end' && (
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 h-full">
                <div className="flex items-start gap-2 sm:gap-3 shrink-0">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-gray-600 pl-1">Start</span>
                    <ImageUploadBox
                      value={startFrame}
                      previewValue={hoveredPreset?.startFrame}
                      onChange={(value, file) => {
                        setStartFrame(value);
                        setStartFrameFile(file || null);
                      }}
                      onClear={() => {
                        setStartFrame('');
                        setStartFrameFile(null);
                      }}
                      className="w-[72px]"
                    />
                  </div>
                  <div className="flex flex-col items-center justify-center pt-7 px-0.5 text-gray-300">
                    <ArrowRight size={16} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 pl-1">
                      <span className="text-[11px] font-semibold text-gray-600">End</span>
                      <span className="text-[9px] font-medium text-gray-400 bg-gray-100 px-1.5 py-[1px] rounded-full">Optional</span>
                    </div>
                    <ImageUploadBox
                      value={endFrame}
                      previewValue={hoveredPreset?.endFrame}
                      onChange={(value, file) => {
                        setEndFrame(value);
                        setEndFrameFile(file || null);
                      }}
                      onClear={() => {
                        setEndFrame('');
                        setEndFrameFile(null);
                      }}
                      className="w-[72px]"
                    />
                  </div>
                </div>
                <div className="flex-1 w-full sm:w-auto h-full mt-2 sm:mt-0 relative">
                  <ClearableTextarea
                    value={prompt}
                    onChange={(val) => { setPrompt(val); setPromptError(false); }}
                    placeholder={(!prompt && hoveredPreset?.prompt) ? hoveredPreset.prompt : "Describe the transition..."}
                    className="w-full h-[60px] sm:h-[105px] bg-transparent text-[15px] text-gray-800 placeholder-gray-400 leading-relaxed transition-all"
                    containerClassName="h-full"
                    maxLength={PROMPT_LIMIT}
                    showCounter={false}
                  />
                  {promptNearLimit && (
                    <span className={`absolute bottom-2 right-0 text-[11px] tabular-nums ${
                      promptOverLimit ? 'text-red-500 font-semibold' : 'text-gray-400'
                    }`}>
                      {promptLen} / {PROMPT_LIMIT}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Parameters + Generate — single nowrap row */}
          {generationError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-600">
              <AlertCircle size={13} className="shrink-0" />
              <span className="min-w-0 truncate">{generationError}. Credits were not charged.</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 min-w-0 border-t border-gray-100 pt-2.5 mt-0.5">
            {/* Left side: parameters */}
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0 overflow-visible pb-0.5">
              <Dropdown
                options={modelOptions}
                selected={selectedModel}
                onChange={setSelectedModel}
                showIcons={false}
              />
              {aspectOptions.length > 0 && (
                <>
                  <div className="h-4 w-px bg-gray-200 shrink-0" />
                  <ParameterPicker
                    label="Aspect ratio"
                    options={aspectOptions}
                    value={aspectRatio}
                    onChange={setAspectRatio}
                    icon={SlidersHorizontal}
                    columns={3}
                  />
                </>
              )}
              <div className="h-4 w-px bg-gray-200 shrink-0" />
              <ParameterPicker
                label="Duration"
                options={durationOptions}
                value={duration}
                onChange={setDuration}
                icon={Clock3}
                columns={3}
              />
              <div className="h-4 w-px bg-gray-200 shrink-0" />
              <PillGroup
                options={qualityOptions}
                value={quality}
                onChange={setQuality}
              />

              {promptError && (
                <span className="text-[11px] font-medium text-red-500 shrink-0 ml-1">
                  Prompt must be 1500 characters or less.
                </span>
              )}
            </div>

            {/* Right side: Generate button */}
            <div className="shrink-0 pl-1">
              <PrimaryButton
                onClick={handleGenerate}
                disabled={false}
                credits={credits}
                className="h-9 px-5 text-[13px]"
              >
                {generationError ? 'Retry' : 'Generate'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default FreeCreationPanel;
