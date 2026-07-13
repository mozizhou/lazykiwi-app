/**
 * ImageGeneratorWorkbench.jsx
 *
 * Full Video-Generator-style orchestrator for the Image Generator page.
 *
 * Structure:
 *   - top-right "My Image" / "Back" buttons
 *   - canvas area (preset cards  OR  My Image history)
 *   - floating bottom dock: ImageCreationPanel
 *
 * Two modes inside the bottom dock:
 *   - text-to-image   鈥?optional reference upload + prompt + controls
 *   - template        鈥?photo effects template grid, then upload + prompt + controls
 */

import { useState, useRef, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react';
import {
  ArrowLeft, Play, RefreshCw, Trash2, LoaderCircle, ImageIcon,
  ArrowUp, X, Plus, HelpCircle, AlertCircle, Download,
} from 'lucide-react';
import { Dropdown } from './Dropdown.jsx';
import { PrimaryButton, PillGroup, ClearableTextarea } from './primitives.jsx';
import ImageUploadBox from './ImageUploadBox.jsx';
import MultiImageUpload from './MultiImageUpload.jsx';
import ImageMentionTextarea from './ImageMentionTextarea.jsx';
import {
  IMAGE_MODELS,
  IMAGE_ASPECT_OPTIONS,
  IMAGE_COUNT_OPTIONS,
  IMAGE_QUALITY_OPTIONS,
  IMAGE_PROMPT_LIMIT,
  IMAGE_TEMPLATES,
  IMAGE_TEMPLATES_VISIBLE,
  TEXT_TO_IMAGE_PRESETS,
  getImageCredits,
} from './imageGeneratorData.js';
import {
  getImageTemplates,
  getMyImageGenerationTasks,
  submitImageGeneration,
  uploadImageFile,
  waitForImageGeneration,
} from '../../lib/imageGenerator.js';
import { isAuthenticated } from '../../lib/auth.js';

// 鈹€鈹€鈹€ Demo seed history 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
const SEED_HISTORY = [
  { id: 1, prompt: 'Selfie under the northern lights', model: 'GPT Image 2', aspect: '1:1', count: 1, date: 'May 25', images: [{id: '1-1'}] },
  { id: 2, prompt: 'Elderly woman fed by a cat',       model: 'FLUX.1 Schnell', aspect: '4:3', count: 2, date: 'May 25', images: [{id: '2-1'}, {id: '2-2'}] },
  { id: 3, prompt: 'Classroom documentary shot',       model: 'Seedream 5.0',  aspect: '16:9', count: 1, date: 'May 24', images: [{id: '3-1'}] },
];

/**
 * Parse @[Image N] mentions from prompt and map to image entries.
 */
function extractImagesMentions(prompt, images) {
  const refs = [];
  const regex = /@\[(Image \d+)\]/g;
  let match;
  while ((match = regex.exec(prompt)) !== null) {
    const displayName = match[1];
    const img = images.find((i) => i.displayName === displayName);
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

function modelSlug(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const IMAGE_MODEL_ROUTE_ALIASES = {
  'wan-2-7-image': 'wan-2-7-image-pro',
  'flux-1-schnell': 'flux-schnell',
};

function getImageTemplateByRouteValue(requested) {
  if (!requested) return null;
  const normalized = modelSlug(requested).replace(/^image-/, '');
  return findTemplateByRouteValue(IMAGE_TEMPLATES_VISIBLE, normalized);
}

function findTemplateByRouteValue(templates, requested) {
  if (!requested) return null;
  const normalized = modelSlug(requested).replace(/^image-/, '');
  return templates.find((template) => {
    const candidates = [
      template.id,
      template.name,
      template.slug,
      modelSlug(template.name),
    ].map(modelSlug);
    return candidates.includes(normalized);
  }) || null;
}

function getQueryImageTemplate() {
  if (typeof window === 'undefined') return null;
  return getImageTemplateByRouteValue(getQueryImageTemplateValue());
}

function getQueryImageTemplateValue() {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('template');
}

function getQueryImageModel() {
  if (typeof window === 'undefined') return null;
  const requested = new URLSearchParams(window.location.search).get('model');
  if (!requested) return null;
  const normalized = IMAGE_MODEL_ROUTE_ALIASES[modelSlug(requested)] || modelSlug(requested);
  return IMAGE_MODELS.find((model) => model.id === requested || modelSlug(model.id) === normalized || modelSlug(model.name) === normalized) || null;
}

function templateTitleFromSlug(slug = '') {
  return String(slug)
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toUiTemplate(remoteTemplate) {
  const slug = remoteTemplate.slug || String(remoteTemplate.id || '');
  const local = IMAGE_TEMPLATES.find((template) =>
    template.id === slug ||
    template.templateId === remoteTemplate.id ||
    modelSlug(template.name) === modelSlug(slug)
  );
  const imageUrl = remoteTemplate.imageUrl || remoteTemplate.image_url || '';
  const imageBeforeUrl = remoteTemplate.imageBeforeUrl || remoteTemplate.image_before_url || '';
  const imageAfterUrl = remoteTemplate.imageAfterUrl || remoteTemplate.image_after_url || '';
  const uploadCount = remoteTemplate.imageCount || remoteTemplate.image_count || local?.uploadCount || local?.requiredImageCount || 1;

  return {
    ...(local || {}),
    id: slug,
    templateId: remoteTemplate.id || local?.templateId,
    name: local?.name || templateTitleFromSlug(slug),
    desc: local?.desc || '',
    img: imageUrl || imageAfterUrl || imageBeforeUrl || local?.img || '',
    imageUrl,
    imageBeforeUrl,
    imageAfterUrl,
    uploadCount,
    requiredImageCount: uploadCount,
  };
}

function quantityToNumber(quantity) {
  return parseInt(String(quantity || '1x'), 10) || 1;
}

function TemplateThumbnail({ template, className = "h-full w-full" }) {
  if (template.imageBeforeUrl && template.imageAfterUrl) {
    return (
      <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
        <img
          src={encodeURI(template.imageAfterUrl)}
          alt={template.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute bottom-2 left-2 flex items-start">
          <div className="h-11 w-11 -rotate-3 overflow-hidden rounded-lg border-2 border-white bg-white shadow-md sm:h-12 sm:w-12">
            <img
              src={encodeURI(template.imageBeforeUrl)}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <svg
            viewBox="0 0 42 30"
            aria-hidden="true"
            className="-ml-0.5 mt-0.5 h-6 w-8 text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.22)]"
          >
            <path
              d="M2 26C8 10 20 5 33 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M30 1L40 8L29 14Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <img
      src={encodeURI(template.img)}
      alt={template.name}
      className={`${className} object-cover transition-transform duration-500 group-hover:scale-[1.04]`}
    />
  );
}

function getDisplayResultUrls(task) {
  const inputUrls = new Set(task.inputImageUrls || []);
  const expectedCount = Number(task.imageCount) || 0;
  const resultUrls = task.resultImageUrls?.length
    ? task.resultImageUrls
    : (task.coverUrl ? [task.coverUrl] : []);
  const outputUrls = [...new Set(resultUrls)].filter((url) => url && !inputUrls.has(url));
  return expectedCount > 0 ? outputUrls.slice(0, expectedCount) : outputUrls;
}

function taskToHistoryItem(task) {
  const resultUrls = getDisplayResultUrls(task);
  const template = task.templateId
    ? IMAGE_TEMPLATES.find((item) => item.templateId === task.templateId)
    : null;
  return {
    id: task.id,
    taskId: task.id,
    type: 'image',
    sourceType: task.generateType === 1 ? 'template' : 'free',
    entryTab: task.generateType === 1 ? 'template' : 'text-to-image',
    prompt: task.prompt || '(no prompt)',
    model: task.modelName || IMAGE_MODELS[0].name,
    aspect: task.ratio || '1:1',
    count: `${task.imageCount || Math.max(resultUrls.length, 1)}x`,
    quality: task.resolution || '1K',
    quantity: `${task.imageCount || Math.max(resultUrls.length, 1)}x`,
    images: resultUrls.length
      ? resultUrls.map((url, index) => ({ id: `${task.id}-${index}`, url }))
      : Array.from({ length: task.imageCount || 1 }).map((_, index) => ({ id: `${task.id}-${index}` })),
    referenceImage: task.inputImageUrls?.[0] || '',
    referenceImages: (task.inputImageUrls || []).map((url, index) => ({
      id: `${task.id}-ref-${index}`,
      previewUrl: url,
      displayName: `Image ${index + 1}`,
      originalName: '',
    })),
    template: template?.name || null,
    status: task.status,
    errorMessage: task.errorMessage,
    date: new Date(task.createTime || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  };
}

// 鈹€鈹€鈹€ ImageCreationPanel 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

const ImageCreationPanel = forwardRef(function ImageCreationPanel({
  hoveredPreset,
  activeTemplateForTab,   // null | template object (for template mode tab)
  routeMode,
  onClearTemplate,
  onGenerateStart,
  onGenerated,
  onModeChange,
  isHistoryView,          // true when the canvas is showing My Image history
  onRestoreLastTemplate,
  onExitHistoryView,
}, ref) {
  // Mode: 'text-to-image' | 'template'
  const getInitialMode = () => {
    if (routeMode === 'template') return 'template';
    if (routeMode === 'text') return 'text-to-image';
    if (typeof window === 'undefined') return 'text-to-image';
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'template') return 'template';
    if (params.get('mode') === 'text') return 'text-to-image';
    return 'text-to-image';
  };
  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    const syncModeFromRoute = () => {
      setMode(getInitialMode());
    };
    window.addEventListener('lazykiwi:route-change', syncModeFromRoute);
    return () => window.removeEventListener('lazykiwi:route-change', syncModeFromRoute);
  }, []);

  useEffect(() => {
    setMode(getInitialMode());
  }, [routeMode]);

  // Report mode changes to parent
  useEffect(() => {
    onModeChange?.(mode);
  }, [mode, onModeChange]);

  // 鈹€鈹€鈹€ Isolated Draft States 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  const [textDraft, setTextDraft] = useState({
    prompt: '',
    refImage: '',
    referenceImages: [],
    selectedModel: IMAGE_MODELS[0],
    aspect: '1:1',
    quality: '1K',
    quantity: '1x',
  });

  const [templateDraft, setTemplateDraft] = useState({
    prompt: '',
    refImage: '',
    activeTemplate: null,
    selectedModel: IMAGE_MODELS[0],
    aspect: '1:1',
    quality: '1K',
    quantity: '1x',
  });

  useEffect(() => {
    const requestedModel = getQueryImageModel();
    if (!requestedModel) return;
    setTextDraft((d) => ({ ...d, selectedModel: requestedModel }));
    setTemplateDraft((d) => ({ ...d, selectedModel: requestedModel }));
  }, []);

  const isTemplate = mode === 'template';

  // State Proxies
  const prompt = isTemplate ? templateDraft.prompt : textDraft.prompt;
  const setPrompt = (val) =>
    isTemplate ? setTemplateDraft((d) => ({ ...d, prompt: val })) : setTextDraft((d) => ({ ...d, prompt: val }));

  const refImage = isTemplate ? templateDraft.refImage : textDraft.refImage;
  const setRefImage = (val) =>
    isTemplate ? setTemplateDraft((d) => ({ ...d, refImage: val })) : setTextDraft((d) => ({ ...d, refImage: val }));

  const referenceImages = isTemplate ? (templateDraft.referenceImages || []) : (textDraft.referenceImages || []);
  const setReferenceImages = (val) =>
    isTemplate ? setTemplateDraft((d) => ({ ...d, referenceImages: val })) : setTextDraft((d) => ({ ...d, referenceImages: val }));

  const handleRefImagesChange = useCallback((newFrames) => {
    const fn = isTemplate ? setTemplateDraft : setTextDraft;
    fn((d) => ({
      ...d,
      referenceImages: newFrames,
      refImage: newFrames[0]?.previewUrl || '',
    }));
  }, [isTemplate]);

  const selectedModel = isTemplate ? templateDraft.selectedModel : textDraft.selectedModel;
  const setSelectedModel = (val) =>
    isTemplate ? setTemplateDraft((d) => ({ ...d, selectedModel: val })) : setTextDraft((d) => ({ ...d, selectedModel: val }));

  const aspect = isTemplate ? templateDraft.aspect : textDraft.aspect;
  const setAspect = (val) =>
    isTemplate ? setTemplateDraft((d) => ({ ...d, aspect: val })) : setTextDraft((d) => ({ ...d, aspect: val }));

  const quality = isTemplate ? templateDraft.quality : textDraft.quality;
  const setQuality = (val) =>
    isTemplate ? setTemplateDraft((d) => ({ ...d, quality: val })) : setTextDraft((d) => ({ ...d, quality: val }));

  const quantity = isTemplate ? templateDraft.quantity : textDraft.quantity;
  const setQuantity = (val) =>
    isTemplate ? setTemplateDraft((d) => ({ ...d, quantity: val })) : setTextDraft((d) => ({ ...d, quantity: val }));

  const activeTemplate = templateDraft.activeTemplate;
  const setActiveTemplate = (val) =>
    setTemplateDraft((d) => ({ ...d, activeTemplate: val }));
  const templateUploadCount = activeTemplate?.uploadCount ?? activeTemplate?.requiredImageCount ?? 1;
  const templateRequiredImageCount = activeTemplate?.requiredImageCount ?? templateUploadCount;
  const isMultiTemplateUpload = templateUploadCount > 1;
  const templateUploadedImageCount = isMultiTemplateUpload
    ? Array.from({ length: templateRequiredImageCount }).filter((_, index) => referenceImages[index]?.previewUrl).length
    : (refImage ? 1 : 0);
  const hasRequiredTemplateImages = templateUploadedImageCount >= templateRequiredImageCount;
  const getTemplateUploadValue = (index) =>
    isMultiTemplateUpload ? (referenceImages[index]?.previewUrl || '') : refImage;
  const setTemplateUploadValue = (index, value, file) => {
    if (!isMultiTemplateUpload) {
      setRefImage(value);
      setTemplateDraft((d) => ({
        ...d,
        referenceImages: value
          ? [{
              id: d.referenceImages?.[0]?.id || 'template_ref_1',
              file,
              previewUrl: value,
              displayName: 'Image 1',
              originalName: file?.name || d.referenceImages?.[0]?.originalName || '',
            }]
          : [],
      }));
      return;
    }
    setTemplateDraft((d) => {
      const nextImages = [...(d.referenceImages || [])];
      nextImages[index] = {
        ...(nextImages[index] || {}),
        id: nextImages[index]?.id || `template_ref_${index + 1}`,
        file,
        previewUrl: value,
        displayName: `Image ${index + 1}`,
        originalName: file?.name || nextImages[index]?.originalName || '',
      };
      const firstImage = nextImages.find((img) => img?.previewUrl)?.previewUrl || '';
      return { ...d, referenceImages: nextImages, refImage: firstImage };
    });
  };
  const clearTemplateUploadValue = (index) => {
    if (!isMultiTemplateUpload) {
      setRefImage('');
      setTemplateDraft((d) => ({ ...d, referenceImages: [] }));
      return;
    }
    setTemplateDraft((d) => {
      const nextImages = [...(d.referenceImages || [])];
      nextImages[index] = null;
      const firstImage = nextImages.find((img) => img?.previewUrl)?.previewUrl || '';
      return { ...d, referenceImages: nextImages, refImage: firstImage };
    });
  };

  // 鈹€鈹€ History View Auto-Fallback 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
  useEffect(() => {
    if (isHistoryView && isTemplate && !activeTemplate) {
      if (onRestoreLastTemplate) {
        const restored = onRestoreLastTemplate();
        if (restored) return;
      }
      setMode('text-to-image');
    }
  }, [isHistoryView, isTemplate, activeTemplate, onRestoreLastTemplate, setMode]);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');

  const effectiveQuantity = mode === 'template' ? '1x' : quantity;
  const credits = getImageCredits(selectedModel, effectiveQuantity);

  // 鈹€鈹€ Derived hover preview 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
  const previewPrompt      = hoveredPreset?.prompt       ?? null;
  const previewRefImage    = hoveredPreset?.referenceImage ?? null;

  // 鈹€鈹€ Imperative API (apply preset on click) 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
  useImperativeHandle(ref, () => ({
    applyPreset: (preset) => {
      setGenerationError('');
      const presetRef = preset.referenceImage || '';
      setTextDraft((d) => ({
        ...d,
        prompt: preset.prompt || '',
        refImage: presetRef,
        referenceImages: presetRef
          ? [{ id: 'img_preset_1', previewUrl: presetRef, displayName: 'Image 1', originalName: '' }]
          : [],
      }));
      // Stay in text-to-image mode
      setMode('text-to-image');
    },
    applyHistory: (item) => {
      const m = IMAGE_MODELS.find((x) => x.name === item.model) || IMAGE_MODELS[0];
      const historyRef = item.referenceImage || '';
      const historyFrames = item.referenceImages || (historyRef
        ? [{ id: 'img_hist_1', previewUrl: historyRef, displayName: 'Image 1', originalName: '' }]
        : []);
      if (item.template) {
        const restoredTemplate = IMAGE_TEMPLATES.find((template) => template.name === item.template) || {
          name: item.template,
          img: item.referenceImage || '',
        };
        setTemplateDraft((d) => ({
          ...d,
          prompt: item.prompt || '',
          refImage: historyRef,
          referenceImages: historyFrames,
          activeTemplate: restoredTemplate,
          selectedModel: m,
          aspect: item.aspect || '1:1',
          quality: item.quality || '1K',
          quantity: item.quantity || '1x',
        }));
        setMode('template');
      } else {
        setTextDraft((d) => ({
          ...d,
          prompt: item.prompt || '',
          refImage: historyRef,
          referenceImages: historyFrames,
          selectedModel: m,
          aspect: item.aspect || '1:1',
          quality: item.quality || '1K',
          quantity: item.quantity || '1x',
        }));
        setMode('text-to-image');
      }
      setGenerationError(item.status === 40 ? (item.errorMessage || 'Generation failed') : '');
    }
  }));

  // 鈹€鈹€ Sync template from parent (when template tab logic passes template in) 鈹€鈹€鈹€
  useEffect(() => {
    if (activeTemplateForTab) {
      setActiveTemplate(activeTemplateForTab);
      setMode('template');
    }
  }, [activeTemplateForTab]);

  // 鈹€鈹€ Generate 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
  const resolveInputImageUrls = async () => {
    const activeImages = (referenceImages || []).filter((img) => img?.previewUrl);
    const urls = [];
    for (const image of activeImages) {
      if (image.file) {
        urls.push(await uploadImageFile(image.file));
      } else if (/^https?:\/\//.test(image.previewUrl)) {
        urls.push(image.previewUrl);
      } else if (image.previewUrl?.startsWith('/') && typeof window !== 'undefined') {
        urls.push(`${window.location.origin}${image.previewUrl}`);
      }
    }
    return urls;
  };

  const handleGenerate = async () => {
    if (!isAuthenticated()) {
      window.dispatchEvent(new CustomEvent('lazykiwi:open-auth'));
      return;
    }
    if (isGenerating) return;
    setGenerationError('');
    setIsGenerating(true);
    onGenerateStart?.();

    // Debug payload for text-to-image mode
    if (mode === 'text-to-image') {
      const refs = extractImagesMentions(prompt, referenceImages);
      console.log('[Generate Debug]', {
        mode: 'text-to-image',
        prompt: prompt.trim() || '(no prompt)',
        images: referenceImages.map((img) => ({
          id: img.id,
          displayName: img.displayName,
          originalName: img.originalName || '',
        })),
        referencedImages: refs,
      });
    }

    try {
      const inputImageUrls = await resolveInputImageUrls();
      const imageCount = mode === 'template' ? 1 : quantityToNumber(effectiveQuantity);
      const generateType = mode === 'template'
        ? 1
        : inputImageUrls.length > 0
          ? 3
          : 2;
      const task = await submitImageGeneration({
        generateType,
        templateId: mode === 'template' ? activeTemplate?.templateId : undefined,
        prompt: prompt.trim(),
        modelName: selectedModel.name,
        ratio: aspect,
        resolution: quality,
        imageCount,
        imageUrls: inputImageUrls,
      });
      const item = {
        id: task.id,
        taskId: task.id,
        type: 'image',
        sourceType: activeTemplate ? 'template' : 'free',
        entryTab: mode,
        prompt: prompt || '(no prompt)',
        model: selectedModel.name,
        aspect,
        count: effectiveQuantity,
        quality,
        quantity: effectiveQuantity,
        images: Array.from({ length: imageCount }).map((_, i) => ({
          id: `${task.id}-${i}`,
        })),
        referenceImage: inputImageUrls[0] || refImage || '',
        referenceImages: referenceImages.map((img, index) => ({
          ...img,
          previewUrl: inputImageUrls[index] || img.previewUrl,
        })),
        template: activeTemplate?.name ?? null,
        status: task.status,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      };
      onGenerated?.(item);
      waitForImageGeneration(task.id, (latest) => {
        if (!latest) return;
        onGenerated?.(taskToHistoryItem(latest));
      }).finally(() => setIsGenerating(false));
    } catch (error) {
      console.error('[Image Generate Failed]', error);
      const message = error.message || 'Generation failed';
      setGenerationError(message);
      onGenerated?.({
        id: Date.now(),
        type: 'image',
        sourceType: activeTemplate ? 'template' : 'free',
        entryTab: mode,
        prompt: prompt || '(no prompt)',
        model: selectedModel.name,
        aspect,
        count: effectiveQuantity,
        quality,
        quantity: effectiveQuantity,
        images: [],
        referenceImage: refImage || '',
        referenceImages,
        template: activeTemplate?.name ?? null,
        status: 40,
        errorMessage: message,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });
      setIsGenerating(false);
    }
  };

  const canGenerate = (
    mode === 'text-to-image'
      ? !!prompt.trim()
      : !!activeTemplate && hasRequiredTemplateImages
  );

  // 鈹€鈹€ Mode change 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
  const handleModeChange = (newMode) => {
    setMode(newMode);
    
    if (newMode === 'template') {
      // If we are on the history page and don't currently have a template,
      // try to restore the last template session.
      // If no session exists, we must exit history view back to the gallery.
      if (isHistoryView && !activeTemplate) {
        if (onRestoreLastTemplate) {
          const restored = onRestoreLastTemplate();
          if (restored) {
            setMode('template');
            return;
          }
        }
        if (onExitHistoryView) onExitHistoryView();
      }
      setMode('template');
    }
    
    if (newMode === 'text-to-image') {
      // On the My Image history page, keep the active template alive so
      // clicking back to Template tab restores the session instead of going idle.
      if (!isHistoryView) {
        setActiveTemplate(null);
        onClearTemplate?.();
      }
    }
  };

  // 鈹€鈹€ Tab definitions 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
  const TABS = [
    { id: 'text-to-image', label: 'Generator' },
    { id: 'template',      label: 'Template' },
  ];

  return (
    <div className="max-w-5xl w-[calc(100%-32px)] md:w-full mx-auto rounded-[28px] bg-white border border-gray-200/80 shadow-xl flex flex-col">

      {/* 鈹€鈹€ Tab bar 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */}
      <div className="flex items-center gap-0.5 border-b border-gray-100 px-4 pt-3 pb-0 relative">
        {TABS.map((tab) => {
          const isActive = mode === tab.id;

          // Tab always shows its fixed label 鈥?template name appears below the preview card
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleModeChange(tab.id)}
              className={`relative inline-flex h-10 items-center gap-1.5 rounded-t-lg px-4 text-[13px] font-semibold transition-all duration-200 border-b-2 -mb-px ${
                isActive
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 鈹€鈹€ Template mode: no template chosen 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */}
      {mode === 'template' && !activeTemplate && !isHistoryView && (
        <div className="flex items-center gap-2 px-5 py-3.5">
          <ArrowUp size={14} strokeWidth={2} className="text-gray-400 shrink-0" />
          <span className="text-[13px] font-medium text-gray-500">
            Choose a template above to continue
          </span>
        </div>
      )}

      {/* 鈹€鈹€ Template mode: template chosen 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */}
      {mode === 'template' && activeTemplate && (
        <div className="flex flex-col px-4 py-2.5 sm:px-6 sm:py-3 gap-2">
          <div className="flex items-center gap-5 min-h-[88px]">
            {/* Template preview thumbnail + name below 鈥?centred vertically */}
            <div className="shrink-0 flex flex-col items-start gap-1.5 self-center">
              <div className="relative w-[88px] bg-gray-100 rounded-xl overflow-hidden shadow-sm">
                <TemplateThumbnail template={activeTemplate} className="h-[58px] w-full" />
                {/* 脳 to dismiss 鈥?top-right of card */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setActiveTemplate(null); onClearTemplate?.(); }}
                  className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/45 hover:bg-black/75 text-white transition-colors z-10"
                  aria-label="Remove template"
                >
                  <X size={9} />
                </button>
              </div>
              <p className="text-[11px] font-semibold text-gray-800 truncate max-w-[88px]">{activeTemplate.name}</p>
              {activeTemplate.desc && (
                <p className="text-[10px] text-gray-400 truncate max-w-[88px] -mt-1">{activeTemplate.desc}</p>
              )}
            </div>

            {/* Upload + prompt for template */}
            <div className="flex-1 flex flex-col gap-2 py-1">
              <p className="text-[12px] text-gray-500">
                Upload {isMultiTemplateUpload ? 'reference photos' : 'a reference photo'} for this effect.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-1">
                <div className="flex gap-3 shrink-0">
                  {Array.from({ length: templateUploadCount }).map((_, index) => (
                    <div key={index} className="flex flex-col gap-1 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-gray-600">
                          {isMultiTemplateUpload ? `Photo ${index + 1}` : 'Photo'}
                        </span>
                      </div>
                      <ImageUploadBox
                        value={getTemplateUploadValue(index)}
                        onChange={(value, file) => setTemplateUploadValue(index, value, file)}
                        onClear={() => clearTemplateUploadValue(index)}
                        className="w-[72px]"
                      />
                    </div>
                  ))}
                </div>

                {/* Prompt textarea */}
                <div className="flex-1 relative flex flex-col">
                  <ClearableTextarea
                    value={prompt}
                    onChange={(val) => setPrompt(val.slice(0, IMAGE_PROMPT_LIMIT))}
                    placeholder={`Describe how to apply ${activeTemplate.name}...`}
                    className="flex-1 w-full bg-gray-50 rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 transition min-h-[96px]"
                    containerClassName="flex-1"
                    maxLength={IMAGE_PROMPT_LIMIT}
                    showCounter={true}
                    counterThreshold={1000}
                    counterClassName="bottom-1.5 right-1.5"
                  />
                </div>

                {/* Generate on the same row as the upload box so the template
                    panel isn't a row taller than the other modes. */}
                <div className="flex shrink-0 items-end sm:self-stretch">
                  <GenerateButton
                    onGenerate={handleGenerate}
                    canGenerate={canGenerate}
                    credits={credits}
                    isRetrying={Boolean(generationError)}
                  />
                </div>
              </div>
            </div>
          </div>

          {generationError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-600">
              <AlertCircle size={13} className="shrink-0" />
              <span className="min-w-0 truncate">{generationError}. Credits were not charged.</span>
            </div>
          )}
        </div>
      )}

      {/* 鈹€鈹€ Text-to-image mode 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */}
      {mode === 'text-to-image' && (
        <div className="flex flex-col px-4 py-2.5 sm:px-6 sm:py-3 gap-2">
          <div className="flex gap-4 items-start">
            {/* Optional reference upload 鈥?multi-image */}
            <div className="flex flex-col gap-1 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-gray-600">Ref</span>
                <span className="text-[9px] font-medium text-gray-400 bg-gray-100 px-1.5 py-[1px] rounded-full">Optional</span>
              </div>
              <MultiImageUpload
                images={referenceImages}
                onImagesChange={handleRefImagesChange}
                className="w-[72px]"
              />
            </div>

            {/* Prompt textarea with @-mention */}
            <div className="flex-1 min-w-0 relative">
              <ImageMentionTextarea
                value={prompt}
                onChange={(val) => setPrompt(val.slice(0, IMAGE_PROMPT_LIMIT))}
                placeholder={
                  !prompt && previewPrompt
                    ? previewPrompt
                    : 'Describe the image you want - the more detail, the better.'
                }
                rows={3}
                className="w-full bg-transparent text-[13px] text-gray-800 placeholder-gray-400 leading-relaxed pt-1"
                maxLength={IMAGE_PROMPT_LIMIT}
                showCounter={true}
                counterThreshold={1000}
                counterClassName="bottom-1 right-0"
                images={referenceImages}
              />
            </div>
          </div>

          {generationError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-600">
              <AlertCircle size={13} className="shrink-0" />
              <span className="min-w-0 truncate">{generationError}. Credits were not charged.</span>
            </div>
          )}

          {/* Controls row */}
          <ControlsRow
            mode={mode}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            aspect={aspect}
            onAspectChange={setAspect}
            quality={quality}
            onQualityChange={setQuality}
            quantity={quantity}
            onQuantityChange={setQuantity}
            credits={credits}
            onGenerate={handleGenerate}
            canGenerate={canGenerate}
            isGenerating={isGenerating}
            isRetrying={Boolean(generationError)}
          />
        </div>
      )}

    </div>
  );
});

// 鈹€鈹€鈹€ ControlsRow 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

function ControlsRow({ mode, selectedModel, onModelChange, aspect, onAspectChange, quality, onQualityChange, quantity, onQuantityChange, credits, onGenerate, canGenerate, isGenerating, isRetrying = false }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-2.5 mt-0.5">
      {mode !== 'template' && (
        <>
          {/* Model selector */}
          <Dropdown
            options={IMAGE_MODELS}
            selected={selectedModel}
            onChange={onModelChange}
            showIcons={false}
          />

          {/* Aspect ratio pills */}
          <div className="flex items-center gap-1">
            {IMAGE_ASPECT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onAspectChange(opt.id)}
                className={`h-7 rounded-lg px-2.5 text-[11px] font-medium transition ${
                  aspect === opt.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="h-4 w-px bg-gray-200 shrink-0 mx-1 hidden sm:block" />
        </>
      )}

      {mode !== 'template' && (
        <>
          {/* Quality pills */}
          <div className="flex items-center gap-1">
            {IMAGE_QUALITY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onQualityChange(opt.id)}
                className={`h-7 rounded-lg px-2.5 text-[11px] font-medium transition ${
                  quality === opt.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="h-4 w-px bg-gray-200 shrink-0 mx-1 hidden sm:block" />

          {/* Quantity pills */}
          <div className="flex items-center gap-1">
            {IMAGE_COUNT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onQuantityChange(opt.id)}
                className={`h-7 rounded-lg px-2.5 text-[11px] font-medium transition ${
                  quantity === opt.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Generate button */}
      <div className="ml-auto">
        <GenerateButton
          onGenerate={onGenerate}
          canGenerate={canGenerate}
          credits={credits}
          isRetrying={isRetrying}
        />
      </div>
    </div>
  );
}

function GenerateButton({ onGenerate, canGenerate, credits, isRetrying = false }) {
  return (
    <button
      type="button"
      onClick={onGenerate}
      disabled={!canGenerate}
      className={`inline-flex h-9 items-center gap-2 rounded-xl px-5 text-[13px] font-bold transition-all shadow-sm ${
        canGenerate
          ? 'bg-kiwi-green text-gray-900 hover:bg-kiwi-green-dark hover:shadow-md active:scale-95'
          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
      }`}
    >
      {isRetrying ? 'Retry' : 'Generate'}
      <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-[1px] text-[10px] font-bold ${
        canGenerate ? 'bg-gray-900/15 text-gray-900' : 'bg-gray-200 text-gray-400'
      }`}>
        {credits} cr
      </span>
    </button>
  );
}

// 鈹€鈹€鈹€ Main Orchestrator 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

export default function ImageGeneratorWorkbench({ routeMode, routeTemplate }) {
  const [canvasTab, setCanvasTab]     = useState('templates'); // 'templates' | 'history'
  const [history, setHistory]         = useState(SEED_HISTORY);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageTemplates, setImageTemplates] = useState(IMAGE_TEMPLATES_VISIBLE);
  const [previewImage, setPreviewImage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Active mode inside the dock (mirrors what ImageCreationPanel reports via callback)
  const [activeMode, setActiveMode]   = useState('text-to-image');

  // Hovered preset for ghost-preview
  const [hoveredPreset, setHoveredPreset] = useState(null);

  // Track hovered sub-card in fanned history stacks
  const [hoveredSubCardId, setHoveredSubCardId] = useState(null);

  // Selected template to inject into the dock
  const [selectedTemplate, setSelectedTemplate] = useState(() => getImageTemplateByRouteValue(routeTemplate) || getQueryImageTemplate());
  const [lastSelectedTemplate, setLastSelectedTemplate] = useState(() => getImageTemplateByRouteValue(routeTemplate) || getQueryImageTemplate());

  const handleSetTemplate = (t) => {
    setSelectedTemplate(t);
    if (t) setLastSelectedTemplate(t);
  };

  const panelRef = useRef(null);

  useEffect(() => {
    if (!previewImage && !deleteTarget) return undefined;
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (deleteTarget) {
        setDeleteTarget(null);
      } else {
        setPreviewImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewImage, deleteTarget]);

  const handleDownloadImage = async (image) => {
    const pathname = new URL(image.url, window.location.href).pathname;
    const extension = pathname.match(/\.(png|jpe?g|webp|gif)$/i)?.[0] || '.png';
    const filename = `lazykiwi-image-${image.id || Date.now()}${extension}`;
    try {
      const response = await fetch(image.url);
      if (!response.ok) throw new Error('Image download failed');
      const objectUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      link.click();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch {
      const link = document.createElement('a');
      link.href = image.url;
      link.download = filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
    }
  };

  useEffect(() => {
    getImageTemplates()
      .then((templates) => {
        if (!Array.isArray(templates) || templates.length === 0) return;
        const nextTemplates = templates.map(toUiTemplate).filter((template) => template.templateId && template.img);
        if (nextTemplates.length === 0) return;
        setImageTemplates(nextTemplates);
        const requestedTemplate = findTemplateByRouteValue(nextTemplates, routeTemplate || getQueryImageTemplateValue());
        if (requestedTemplate) {
          setCanvasTab('templates');
          handleSetTemplate(requestedTemplate);
        }
      })
      .catch((error) => {
        console.warn('[Image Template Load Failed]', error);
      });
  }, [routeTemplate]);

  useEffect(() => {
    const requestedTemplate = getImageTemplateByRouteValue(routeTemplate);
    if (!requestedTemplate) return;
    setCanvasTab('templates');
    handleSetTemplate(requestedTemplate);
  }, [routeTemplate]);

  useEffect(() => {
    const handleRouteChange = () => {
      const requestedTemplate = findTemplateByRouteValue(imageTemplates, getQueryImageTemplateValue());
      if (!requestedTemplate) return;
      setCanvasTab('templates');
      handleSetTemplate(requestedTemplate);
    };
    window.addEventListener('lazykiwi:route-change', handleRouteChange);
    return () => window.removeEventListener('lazykiwi:route-change', handleRouteChange);
  }, [imageTemplates]);

  useEffect(() => {
    if (!isAuthenticated()) return;
    getMyImageGenerationTasks({ pageNo: 1, pageSize: 50 })
      .then((page) => {
        const list = page?.list || [];
        if (list.length) {
          setHistory(list.map(taskToHistoryItem));
        }
      })
      .catch((error) => {
        console.warn('[Image History Load Failed]', error);
      });
  }, []);

  // 鈹€鈹€ Callbacks 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

  const handleGenerateStart = () => {
    setIsGenerating(true);
    setCanvasTab('history');
  };

  const handleGenerated = (item) => {
    setHistory((prev) => {
      const index = prev.findIndex((existing) => existing.id === item.id);
      if (index === -1) return [item, ...prev];
      const next = [...prev];
      next[index] = { ...next[index], ...item };
      return next;
    });
    setIsGenerating(false);
    if (item.status === 40) {
      setCanvasTab('history');
      if (item.template) {
        const t = imageTemplates.find((x) => x.name === item.template) || null;
        setSelectedTemplate(t);
        if (t) setLastSelectedTemplate(t);
      } else {
        setSelectedTemplate(null);
      }
      setTimeout(() => {
        panelRef.current?.applyHistory(item);
      }, 0);
    }
  };

  const handleRemoveHistory = (id) =>
    setHistory((prev) => prev.filter((h) => h.id !== id));

  const handleDeleteSubImage = (itemId, subId) => {
    setHistory((prev) => prev.map(item => {
      if (item.id === itemId && item.images) {
        const newImages = item.images.filter(img => img.id !== subId);
        return { ...item, images: newImages };
      }
      return item;
    }).filter(item => !item.images || item.images.length > 0));
  };

  const handleRegenerate = (item) => {
    setCanvasTab('templates');
    if (item.template) {
      const t = imageTemplates.find(x => x.name === item.template) || null;
      setSelectedTemplate(t);
      if (t) setLastSelectedTemplate(t);
    } else {
      setSelectedTemplate(null);
    }
    setTimeout(() => {
      panelRef.current?.applyHistory(item);
    }, 0);
  };

  const handleSelectTemplate = (t) => {
    setSelectedTemplate(t);
    // Switch canvas to templates view so the dock shows template workbench
  };

  // 鈹€鈹€ Group history by date 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
  const groupedHistory = history.reduce((acc, item) => {
    (acc[item.date] ??= []).push(item);
    return acc;
  }, {});
  const uniqueDates = [...new Set(history.map((h) => h.date))];

  // 鈹€鈹€ Render 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
  return (
    <div className="relative flex flex-col flex-1 min-h-0 bg-gray-50">

      {/* 鈹€鈹€ Top-right: My Image / Back 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */}
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
          <ImageIcon size={13} /> My Image
        </button>
      </div>

      {/* 鈹€鈹€ Scrollable canvas area 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */}
      <div className="flex-1 overflow-y-auto pt-14 pb-[300px]">

        {/* 鈹€鈹€ Preset / Template grid 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */}
        {canvasTab === 'templates' && (
          <>
            {activeMode === 'template' ? (
              /* Template mode: show photo-effects template cards */
              <div className="max-w-7xl mx-auto px-6 py-6 sm:px-8 sm:py-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
                  {imageTemplates.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSetTemplate(t)}
                      className="group flex flex-col text-left focus:outline-none"
                    >
                      <div className="w-full aspect-video overflow-hidden rounded-xl bg-gray-100 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md">
                        <TemplateThumbnail template={t} />
                      </div>
                      <p className="mt-2 px-0.5 text-[13px] font-medium text-gray-600 truncate transition-colors group-hover:text-gray-900">
                        {t.name}
                      </p>
                      <p className="px-0.5 text-[11px] text-gray-400 truncate">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Text-to-image mode: show 3 preset cards */
              <div className="max-w-[960px] mx-auto px-6 pt-12 pb-6 sm:px-8 sm:pt-16 sm:pb-8 flex justify-center">
                <div className="grid grid-cols-3 gap-4 sm:gap-5 w-full">
                  {TEXT_TO_IMAGE_PRESETS.map((preset) => {
                    const isHovered    = hoveredPreset?.id === preset.id;
                    const isOtherDimmed = hoveredPreset && !isHovered;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          panelRef.current?.applyPreset(preset);
                          setHoveredPreset(null);
                        }}
                        onMouseEnter={() => setHoveredPreset(preset)}
                        onMouseLeave={() => setHoveredPreset(null)}
                        className={`group focus:outline-none transition-opacity duration-300 ${isOtherDimmed ? 'opacity-40' : 'opacity-100'}`}
                      >
                        <div className="w-full aspect-video overflow-hidden rounded-xl bg-gray-100 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md">
                          <img
                            src={encodeURI(preset.cardImage)}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* 鈹€鈹€ My Image / History panel 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */}
        {canvasTab === 'history' && (
          <div className="max-w-7xl mx-auto w-full px-6 py-6 sm:px-8 sm:py-8 space-y-12">

            {/* Empty state */}
            {history.length === 0 && !isGenerating && (
              <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                  <ImageIcon size={22} className="text-gray-300" />
                </div>
                <p className="text-[14px] text-gray-400 font-medium">No images yet</p>
                <p className="text-[12px] text-gray-300">Click a preset to get started</p>
              </div>
            )}

            {/* In-flight card */}
            {isGenerating && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-[16px] font-bold text-gray-900 tracking-tight shrink-0">Generating</h3>
                  <div className="h-[1px] flex-1 bg-gray-200/80 animate-pulse" />
                  <span className="text-[11px] text-kiwi-green-dark bg-kiwi-light-green/45 border border-kiwi-green/20 font-bold px-2.5 py-0.5 rounded-full">
                    1 image
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                  <div className="group flex flex-col gap-2.5">
                    <div className="relative aspect-square w-full rounded-2xl bg-white border border-dashed border-gray-300 overflow-hidden flex flex-col items-center justify-center shadow-sm">
                      <LoaderCircle size={24} className="animate-spin text-kiwi-green-dark mb-1.5" />
                      <div className="text-[11px] font-bold text-gray-600">Creating image...</div>
                    </div>
                    <p className="text-[13px] font-medium text-gray-400 px-0.5 italic">Processing...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Date-grouped history */}
            {uniqueDates.map((date) => (
              <div key={date} className="space-y-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-[16px] font-bold text-gray-900 tracking-tight shrink-0">{date}</h3>
                  <div className="h-[1px] flex-1 bg-gray-200/80" />
                  <span className="text-[11px] text-gray-400 font-semibold px-2 py-0.5 rounded-full bg-gray-100">
                    {groupedHistory[date].reduce((sum, item) => sum + (item.images ? item.images.length : 1), 0)} image(s)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                  {groupedHistory[date].map((item) => {
                    const imgs = item.images && item.images.length > 0 ? item.images : [{id: item.id}];
                    const isMulti = imgs.length > 1;
                    const isPending = item.status === 10 || item.status === 20;
                    return (
                      <div key={item.id} className="group flex flex-col gap-2.5">
                        <div className="relative aspect-square w-full flex items-center justify-center">
                          {imgs.map((subImg, idx) => {
                            const center = (imgs.length - 1) / 2;
                            const offset = idx - center;
                            const rotation = isMulti ? offset * 6 : 0;
                            const transX = isMulti ? offset * 12 : 0;
                            const isHovered = hoveredSubCardId === subImg.id;

                            return (
                              <div
                                key={subImg.id}
                                onMouseEnter={() => setHoveredSubCardId(subImg.id)}
                                onMouseLeave={() => setHoveredSubCardId(null)}
                                onClick={() => {
                                  if (subImg.url) setPreviewImage({ ...subImg, prompt: item.prompt });
                                }}
                                onKeyDown={(event) => {
                                  if (subImg.url && (event.key === 'Enter' || event.key === ' ')) {
                                    event.preventDefault();
                                    setPreviewImage({ ...subImg, prompt: item.prompt });
                                  }
                                }}
                                role={subImg.url ? 'button' : undefined}
                                tabIndex={subImg.url ? 0 : undefined}
                                className={`absolute w-full h-full rounded-2xl overflow-hidden border shadow-sm transition-all duration-300 ease-out group/sub ${
                                  isHovered ? 'border-gray-300 bg-white' : 'border-gray-200/40 bg-gray-100'
                                } ${subImg.url ? 'cursor-zoom-in' : ''}`}
                                style={{
                                  zIndex: isHovered ? 50 : idx,
                                  transform: isHovered
                                    ? `translateY(-12px) scale(1.03)`
                                    : `translateX(${transX}px) rotate(${rotation}deg)`,
                                  transformOrigin: 'bottom center',
                                }}
                              >
                                {subImg.url ? (
                                  <img
                                    src={subImg.url}
                                    alt={item.prompt || 'Generated image'}
                                    className="absolute inset-0 h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${isHovered ? 'from-gray-50 to-gray-100' : 'from-gray-100 to-gray-200'}`}>
                                    {item.status === 40 ? (
                                      <span className="px-3 text-center text-[12px] font-semibold text-red-400">
                                        Failed
                                      </span>
                                    ) : isPending ? (
                                      <div className="flex flex-col items-center gap-2 text-kiwi-green-dark">
                                        <LoaderCircle size={24} className="animate-spin" />
                                        <span className="text-[11px] font-semibold">Generating...</span>
                                      </div>
                                    ) : (
                                      <ImageIcon size={20} className="text-gray-300" />
                                    )}
                                  </div>
                                )}

                                {/* Hover actions */}
                                <div className={`absolute top-2 right-2 flex items-center gap-1.5 transition-opacity duration-200 z-10 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleRegenerate(item); }}
                                    title="Regenerate"
                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-black/45 hover:bg-kiwi-green text-white hover:text-gray-900 backdrop-blur-md transition-all shadow active:scale-95"
                                  >
                                    <RefreshCw size={11} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteTarget({ itemId: item.id, subId: subImg.id });
                                    }}
                                    title="Delete"
                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-black/45 hover:bg-red-500 text-white backdrop-blur-md transition-all shadow active:scale-95"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <p
                          className="text-[13px] font-medium text-gray-600 px-0.5 line-clamp-2 leading-relaxed transition-colors group-hover:text-gray-900"
                          title={item.prompt}
                        >
                          {item.prompt}
                        </p>
                        {item.errorMessage && (
                          <p className="px-0.5 text-[11px] font-medium text-red-400 line-clamp-1" title={item.errorMessage}>
                            {item.errorMessage}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {deleteTarget && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDeleteTarget(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-image-title"
            className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500">
              <Trash2 size={20} />
            </div>
            <h3 id="delete-image-title" className="mt-4 text-lg font-bold text-gray-900">Delete image?</h3>
            <p className="mt-2 text-[13px] leading-5 text-gray-500">This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="h-10 rounded-xl border border-gray-200 px-4 text-[13px] font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDeleteSubImage(deleteTarget.itemId, deleteTarget.subId);
                  setDeleteTarget(null);
                }}
                className="h-10 rounded-xl bg-red-500 px-4 text-[13px] font-bold text-white transition hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPreviewImage(null);
          }}
        >
          <div className="relative flex max-h-full max-w-full flex-col items-center gap-4">
            <img
              src={previewImage.url}
              alt={previewImage.prompt || 'Generated image preview'}
              className="max-h-[calc(100vh-120px)] max-w-[calc(100vw-32px)] rounded-2xl object-contain shadow-2xl"
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleDownloadImage(previewImage)}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-kiwi-green px-4 text-[13px] font-bold text-gray-900 transition hover:bg-kiwi-green-dark"
              >
                <Download size={16} /> Download
              </button>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/15 px-4 text-[13px] font-semibold text-white transition hover:bg-white/25"
              >
                <X size={16} /> Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 鈹€鈹€ Floating dock 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-5 pb-5 pt-2">
        <ImageCreationPanel
          ref={panelRef}
          hoveredPreset={hoveredPreset}
          activeTemplateForTab={selectedTemplate}
          routeMode={routeMode}
          isHistoryView={canvasTab === 'history'}
          onExitHistoryView={() => setCanvasTab('templates')}
          onClearTemplate={() => setSelectedTemplate(null)}
          onRestoreLastTemplate={() => {
            if (lastSelectedTemplate) {
              setSelectedTemplate(lastSelectedTemplate);
              return true;
            }
            return false;
          }}
          onGenerateStart={handleGenerateStart}
          onGenerated={handleGenerated}
          onModeChange={setActiveMode}
        />
      </div>

    </div>
  );
}
