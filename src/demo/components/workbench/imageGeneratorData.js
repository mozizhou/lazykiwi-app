/**
 * imageGeneratorData.js
 * Single source of truth for all Image Generator constants.
 * Imported by ImageGeneratorWorkbench and ImageCreationPanel.
 */

import { Sparkles, Zap, Crown } from 'lucide-react';

// ─── Image Models ──────────────────────────────────────────────────────────────

export const IMAGE_MODELS = [
  { id: 'gpt-image-2',       name: 'GPT Image 2',       desc: '~45s ETA', icon: Crown,    badge: 'Popular' },
  { id: 'flux-schnell',      name: 'FLUX.1 Schnell',    desc: '~15s ETA', icon: Zap,      badge: 'Fast' },
  { id: 'wan-2-7-image-pro', name: 'Wan 2.7 Image Pro', desc: '~40s ETA', icon: Sparkles  },
  { id: 'nano-banana',       name: 'Nano Banana',       desc: '~30s ETA', icon: Sparkles  },
  { id: 'midjourney-blend',  name: 'Midjourney Blend',  desc: '~60s ETA', icon: Sparkles  },
  { id: 'seedream-5',        name: 'Seedream 5.0',      desc: '~40s ETA', icon: Sparkles  },
];

// ─── Credits table ────────────────────────────────────────────────────────────
// Keyed by model id, value is array indexed by (count - 1).
// e.g. IMAGE_CREDITS['gpt-image-2'][0] = cost for 1 image

export const IMAGE_CREDITS = {
  'flux-schnell': 10,
  'midjourney-blend': 10,
  'wan-2-7-image-pro': 30,
  'seedream-5': 40,
  'nano-banana': 70,
  'gpt-image-2': 130,
};

export function getImageCredits(model, countStr) {
  const quantity = parseInt(countStr) || 1;
  const modelId = typeof model === 'string' ? model : model?.id;
  const baseCredit = IMAGE_CREDITS[modelId] || 10;
  return baseCredit * quantity;
}

// ─── Parameter Options ────────────────────────────────────────────────────────

export const IMAGE_ASPECT_OPTIONS = [
  { id: '16:9', label: '16:9' },
  { id: '9:16', label: '9:16' },
  { id: '1:1',  label: '1:1'  },
  { id: '4:3',  label: '4:3'  },
];

export const IMAGE_COUNT_OPTIONS = [
  { id: '1x', label: '1x' },
  { id: '2x', label: '2x' },
  { id: '3x', label: '3x' },
];

export const IMAGE_QUALITY_OPTIONS = [
  { id: '512', label: '512' },
  { id: '1K',  label: '1K'  },
  { id: '2K',  label: '2K'  },
  { id: '4K',  label: '4K'  },
];

export const IMAGE_PROMPT_LIMIT = 1500;

// ─── Text-to-Image Presets ────────────────────────────────────────────────────

export const TEXT_TO_IMAGE_PRESETS = [
  {
    id: 'selfie-aurora',
    title: 'Selfie Aurora',
    cardImage: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/text-to-image/image-01-girl-selfie-output.png',
    referenceImage: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/text-to-image/image-01-girl-selfie-input.png',
    prompt: 'Transform this casual indoor selfie into a cinematic outdoor portrait under the northern lights, preserving the same woman\'s facial identity and natural appearance.',
  },
  {
    id: 'grandma-cat',
    title: 'Grandma & Cat',
    cardImage: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/text-to-image/image-02.png',
    referenceImage: null,
    prompt: 'A heartwarming, realistic scene of an elderly woman sitting at a dining table while a fluffy cat gently feeds her porridge with a spoon.',
  },
  {
    id: 'classroom',
    title: 'Classroom',
    cardImage: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/text-to-image/image-03.png',
    referenceImage: null,
    prompt: 'A realistic classroom scene with students sitting at desks facing the blackboard, bright overhead fluorescent lights, documentary-style photography.',
  },
];

// ─── Photo Effects Templates (for Image Generator Template tab) ──────────────

export const IMAGE_TEMPLATES = [
  {
    id: 'selfies-with-celebrities',
    templateId: 1,
    name: 'selfies with celebrities',
    img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/image-templates/selfies-with-celebrities.png',
    desc: 'Transform into a celebrity-style selfie',
    uploadCount: 2,
  },
  {
    id: 'ghibli-art-ai',
    templateId: 2,
    name: 'ghibli art ai',
    img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/image-templates/gible-art-ai.png',
    desc: 'Studio-inspired anime portrait look',
  },
  {
    id: 'chubby-filter',
    templateId: 3,
    name: 'chubby filter',
    img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/image-templates/chubby-filter.png',
    desc: 'Playful fuller-face makeover',
  },
  {
    id: 'polaroid-family-photo',
    templateId: 4,
    name: 'polaroid family photo',
    img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/image-templates/polaroid-family-photo.png',
    desc: 'Vintage family snapshot aesthetic',
    uploadCount: 2,
  },
  {
    id: 'ai-action-figure-generator',
    templateId: 5,
    name: 'ai action figure generator',
    img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/image-templates/ai-action-figure-generator.png',
    desc: 'Turn yourself into a boxed collectible toy',
  },
  {
    id: 'pixar-ai-generator-free',
    templateId: 6,
    name: 'pixar ai generator free',
    img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/image-templates/pixar-ai-generator-free.png',
    desc: 'Bright animated movie character style',
  },
  {
    id: 'pregnant-ai-generator',
    templateId: 7,
    name: 'pregnant ai generator',
    img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/image-templates/pregnant-ai-generator.png',
    desc: 'Soft future maternity portrait look',
  },
  {
    id: 'simpsons-ai',
    templateId: 8,
    name: 'simpsons ai',
    img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/image-templates/simpsons-ai.png',
    desc: 'Yellow sitcom cartoon transformation',
  },
  {
    id: 'caricature-generator-free',
    templateId: 9,
    name: 'caricature generator free',
    img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/image-templates/caricature-generator-free.png',
    desc: 'Expressive hand-drawn caricature style',
  },
  {
    id: 'pixar-style-3d-animation-look',
    templateId: 10,
    name: 'pixar-style 3d animation look',
    img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/image-templates/pixar-style-3d-animation-look.png',
    desc: 'Polished 3D animated portrait finish',
  },
  {
    id: 'convert-pic-into-cartoon',
    templateId: 11,
    name: 'convert pic into cartoon',
    img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/image-templates/convert-pic-into-cartoon.png',
    desc: 'Convert a photo into a clean cartoon',
  },
  {
    id: 'see-yourself-as-a-baby-ai',
    templateId: 12,
    name: 'see yourself as a baby ai',
    img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/image-templates/see-yourself-as-a-baby-ai.png',
    desc: 'Reimagine your face as a baby portrait',
  },
  {
    id: 'ai-gta',
    templateId: 13,
    name: 'ai gta',
    img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/image-templates/ai-gta.png',
    desc: 'Open-world game poster makeover',
  },
  {
    id: 'beardless-filter',
    templateId: 14,
    name: 'beardless filter',
    img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/image-templates/beardless-filter.png',
    desc: 'Preview a clean-shaven face edit',
  },
  {
    id: 'bylo-ai-age-filter',
    templateId: 15,
    name: 'bylo ai age filter',
    img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/image-templates/bylo-ai-age-filter.png',
    desc: 'Try a quick age-shift portrait filter',
  },
];

/** Visible templates shown in the UI (excludes any with hidden: true) */
export const IMAGE_TEMPLATES_VISIBLE = IMAGE_TEMPLATES.filter((t) => !t.hidden);
