/**
 * videoGeneratorData.js
 * Single source of truth for all Video Generator constants.
 * Imported by FreeCreationPanel, TemplateModal, and VideoGeneratorWorkbench.
 */

import {
  Zap, Crown, Film, Wand2,
  Timer, Globe, ArrowLeftRight, RotateCcw, ZoomIn, MoveHorizontal,
  Eye, RefreshCw, Camera, Plane, Maximize2,
  Cloud, Wind, Waves, Shirt, TrainFront, Sparkles,
  Type, Images,
} from 'lucide-react';

// ─── Templates ───────────────────────────────────────────────────────────────

const TEMPLATE_HLS_BASE = 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/templates/hls';

export const TEMPLATES = [
  // Camera Motion / Spatial Transition
  { id: '1',  templateId: 'pg-a006818b-0847-4de1-bfc9-4c38dedfc978', name: 'Bullet Time',          category: 'Camera Motion', desc: 'Slow-motion bullet time effect',    mode: 'image-to-video', img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/bullet time.png', video: `${TEMPLATE_HLS_BASE}/01_bullet_time.m3u8` },
  { id: '2',  templateId: 'pg-4d015b56-f8dd-4d98-9146-ce10618d23fd', name: 'Earth Zoom Out',        category: 'Camera Motion', desc: 'Zoom from space to ground',         mode: 'image-to-video', img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/earth zoom out.png', video: `${TEMPLATE_HLS_BASE}/02_earth_zoom_out.m3u8` },
  { id: '3',  templateId: 'pg-3baedd0a-da4b-4dca-b2c4-3c60c18312d8', name: 'Seamless Transition',   category: 'Camera Motion', desc: 'Smooth scene transition',           mode: 'start-end',      img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/seamless transition.png', video: `${TEMPLATE_HLS_BASE}/03_seamless_transition.m3u8` },
  { id: '4',  templateId: 'pg-fee13e42-7c9f-4335-bed1-4d70af036c1f', name: 'Crash Zoom',            category: 'Camera Motion', desc: 'Fast dramatic zoom',                mode: 'image-to-video', img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/crash zoom.png', video: `${TEMPLATE_HLS_BASE}/04_crash_zoom.m3u8` },
  { id: '5',  templateId: 'pg-01d181af-5391-49d5-903f-18073a09e4bd', name: 'Rolling Motion',        category: 'Camera Motion', desc: 'Camera roll effect',                mode: 'image-to-video', img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/rolling motion.png', video: `${TEMPLATE_HLS_BASE}/05_rolling_motion.m3u8` },
  { id: '6',  templateId: 'pg-56beca80-6d93-4fc6-bbc8-6bbca76b2f25', name: 'Zoom Out',              category: 'Camera Motion', desc: 'Pull back reveal',                  mode: 'image-to-video', img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/zoom out.png', video: `${TEMPLATE_HLS_BASE}/06_zoom_out.m3u8` },
  { id: '7',  templateId: 'pg-e0ff4b56-eefb-479a-9eb3-e6c315ef8dc7', name: 'Whip Pan',              category: 'Camera Motion', desc: 'Quick pan transition',              mode: 'image-to-video', img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/whip pan.png', video: `${TEMPLATE_HLS_BASE}/07_whip_pan.m3u8` },
  { id: '8',  templateId: 'pg-fdbfb9d0-df8d-45ee-a693-44ba1cb5663e', name: 'Zoom Eyes',             category: 'Camera Motion', desc: 'Eye zoom focus',                    mode: 'image-to-video', img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/zoom eyes.png', video: `${TEMPLATE_HLS_BASE}/08_zoom_eyes_suspense.m3u8` },
  { id: '9',  templateId: 'pg-aea478fd-0c92-4e63-a4e6-d7735e2144c5', name: '360 Rotation',          category: 'Camera Motion', desc: 'Full rotation view',                mode: 'image-to-video', img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/360 rotation.png', video: `${TEMPLATE_HLS_BASE}/09_360_rotation.m3u8` },
  { id: '10', templateId: 'pg-0e9486d3-08fd-48e8-8d5e-e78616f67090', name: 'Eat Camera',            category: 'Camera Motion', desc: 'Camera into mouth',                 mode: 'image-to-video', img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/eat camera.png', video: `${TEMPLATE_HLS_BASE}/10_eat_camera.m3u8` },
  { id: '11', templateId: 'pg-8e310aad-8bb1-4558-8dc8-c66adbed3914', name: 'Flying Cam Transition', category: 'Camera Motion', desc: 'Flying camera move',                mode: 'start-end',      img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/flying cam transition.png', video: `${TEMPLATE_HLS_BASE}/11_flying_cam_transition.m3u8` },
  { id: '12', templateId: 'pg-f679eb21-c711-44e0-807e-cfa3ee45bf9b', name: 'Dolly In Zoom Out',     category: 'Camera Motion', desc: 'Dolly zoom effect',                 mode: 'image-to-video', img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-cameramotion/dolly in zoom out.png', video: `${TEMPLATE_HLS_BASE}/12_dolly_in_zoom_out_hitchcock.m3u8` },
  // Physical Dynamics
  { id: '13', templateId: 'pg-d24a374d-bbd3-414f-9ed1-5f2ff4dd5f4e', name: 'I BE I can fly',        category: 'Physical Dynamics', desc: 'Levitation effect',             mode: 'image-to-video', img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-physicaldynamics/i be i can fly.png', video: `${TEMPLATE_HLS_BASE}/13_i_can_fly.m3u8` },
  { id: '14', templateId: 'pg-f08db530-9872-4ef0-817d-8d3d5329df1c', name: 'Air Bending',           category: 'Physical Dynamics', desc: 'Air control magic',             mode: 'image-to-video', img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-physicaldynamics/ai bending.png', video: `${TEMPLATE_HLS_BASE}/14_air_bending_smoke_transition.m3u8` },
  { id: '15', templateId: 'pg-0bf74278-d995-4565-afd0-c8d6c6509db5', name: 'Facial-Punch',          category: 'Physical Dynamics', desc: 'Punch impact effect',           mode: 'image-to-video', img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-physicaldynamics/facial punch.png', video: `${TEMPLATE_HLS_BASE}/15_facial_punch_natural_left_safe.m3u8` },
  { id: '16', templateId: 'pg-a4300fc6-4bf4-4f72-b603-eef2bdad5644', name: 'Earth Wave',            category: 'Physical Dynamics', desc: 'Ground wave effect',            mode: 'image-to-video', img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-physicaldynamics/earth wave.png', video: `${TEMPLATE_HLS_BASE}/16_earth_wave_ground_transition.m3u8` },
  { id: '17', templateId: 'pg-39a8dba4-c39a-494e-9a1e-a46a7a804460', name: 'Clothes Falling',       category: 'Physical Dynamics', desc: 'Cloth physics',                 mode: 'image-to-video', img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-physicaldynamics/clothes falling.png', video: `${TEMPLATE_HLS_BASE}/17_clothes_falling_rain.m3u8` },
  { id: '18', templateId: 'pg-3186b550-ac98-43c8-9489-ef9fe156c93d', name: 'AI Flip',               category: 'Physical Dynamics', desc: 'Backflip motion',               mode: 'image-to-video', img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-physicaldynamics/ai flip.png', video: `${TEMPLATE_HLS_BASE}/18_ai_flip_backflip_only.m3u8` },
  { id: '19', templateId: 'pg-ebad0c08-8aa7-4865-88e9-6ef2cc1cc4fc', name: 'Rush Train',            category: 'Physical Dynamics', desc: 'Speed train motion',            mode: 'image-to-video', img: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/pic-references/home-physicaldynamics/rush train.png', video: `${TEMPLATE_HLS_BASE}/19_rush_train_wind.m3u8` },
];

/** Lucide icon mapped to each template name for the list-style popup. */
export const TEMPLATE_ICONS = {
  'Bullet Time':          Timer,
  'Earth Zoom Out':       Globe,
  'Seamless Transition':  ArrowLeftRight,
  'Crash Zoom':           Zap,
  'Rolling Motion':       RotateCcw,
  'Zoom Out':             ZoomIn,
  'Whip Pan':             MoveHorizontal,
  'Zoom Eyes':            Eye,
  '360 Rotation':         RefreshCw,
  'Eat Camera':           Camera,
  'Flying Cam Transition':Plane,
  'Dolly In Zoom Out':    Maximize2,
  'I BE I can fly':       Cloud,
  'Air Bending':          Wind,
  'Facial-Punch':         Zap,
  'Earth Wave':           Waves,
  'Clothes Falling':      Shirt,
  'AI Flip':              Sparkles,
  'Rush Train':           TrainFront,
};

// ─── Models ──────────────────────────────────────────────────────────────────

export const MODELS = [
  { id: 'seedance-2', name: 'Seedance 2.0', desc: '~45s ETA', icon: Zap },
  { id: 'veo',        name: 'Veo 3.1 Lite', desc: '~2m ETA',  icon: Film },
  { id: 'kling',      name: 'Kling v3 Omni', desc: '~2m ETA', icon: Crown },
  { id: 'happyhorse', name: 'HappyHorse 1.0', desc: '~60s ETA', icon: Wand2 },
  { id: 'hailuo',     name: 'Hailuo 2.3 Fast', desc: '~60s ETA', icon: Film },
  { id: 'grok',       name: 'Grok Imagine Video', desc: '~2m ETA', icon: Sparkles },
  { id: 'wan',        name: 'Wan 2.7 I2V', desc: '~2m ETA', icon: Film },
];

export const MODEL_ROUTE_ALIASES = {
  seedance: 'seedance-2',
  'seedance-2-0': 'seedance-2',
  'seedance-2': 'seedance-2',
  'veo-3': 'veo',
  'veo-3-1-lite': 'veo',
  'kling-1-6': 'kling',
  'kling-1-6-turbo': 'kling',
  'kling-v3-omni': 'kling',
  'happy-horse': 'happyhorse',
  'happyhorse-1': 'happyhorse',
  'happyhorse-1-0': 'happyhorse',
  'hailuo-ai': 'hailuo',
  'hailuo-2-3-fast': 'hailuo',
  'grok-2': 'grok',
  'grok-imagine-video': 'grok',
  'wan-2-7': 'wan',
  'wan-2-7-i2v': 'wan',
};

// ─── Parameter Options ────────────────────────────────────────────────────────

/** Used by PillGroup for Aspect Ratio selection. */
export const ASPECT_PILL_OPTIONS = [
  { id: '16:9', label: '16:9' },
  { id: '9:16', label: '9:16' },
  { id: '1:1',  label: '1:1'  },
  { id: '4:3',  label: '4:3'  },
  { id: '3:4',  label: '3:4'  },
  { id: '4:5',  label: '4:5'  },
  { id: '21:9', label: '21:9' },
];

/** Used by PillGroup for Duration selection. */
export const DURATION_PILL_OPTIONS = [
  { id: '4s',  label: '4s'  },
  { id: '5s',  label: '5s'  },
  { id: '6s',  label: '6s'  },
  { id: '8s',  label: '8s'  },
  { id: '10s', label: '10s' },
  { id: '15s', label: '15s' },
  { id: '30s', label: '30s' },
  { id: '45s', label: '45s' },
  { id: '60s', label: '60s' },
];

export const LIMITED_DURATION_PILL_OPTIONS = [
  { id: '5s',  label: '5s'  },
  { id: '10s', label: '10s' },
  { id: '15s', label: '15s' },
];

export const QUALITY_PILL_OPTIONS = [
  { id: '480p',  label: '480p'  },
  { id: '768p',  label: '768p'  },
  { id: '720p',  label: '720p'  },
  { id: '1080p', label: '1080p' },
  { id: '4K',    label: '4K'    },
];

const optionSubset = (source, ids) => ids.map((id) => source.find((option) => option.id === id)).filter(Boolean);

export const VIDEO_MODEL_CONFIGS = {
  'seedance-2': {
    providerModel: 'seedance-2',
    modes: ['text-to-video', 'image-to-video'],
    aspectRatios: ['16:9', '9:16', '1:1'],
    durations: ['60s'],
    qualities: ['480p', '720p', '1080p'],
    defaults: { aspectRatio: '16:9', duration: '60s', quality: '720p' },
  },
  veo: {
    providerModel: 'veo',
    modes: ['text-to-video', 'image-to-video'],
    aspectRatios: ['16:9', '9:16'],
    durations: ['4s', '6s', '8s'],
    qualities: ['720p', '1080p'],
    defaults: { aspectRatio: '16:9', duration: '8s', quality: '720p' },
  },
  kling: {
    providerModel: 'kling',
    modes: ['text-to-video', 'image-to-video', 'start-end'],
    aspectRatios: ['16:9', '9:16', '1:1'],
    durations: ['3s', '5s', '8s', '10s', '15s'],
    frameDurations: ['3s', '5s', '8s', '10s', '15s'],
    qualities: ['720p', '1080p'],
    defaults: { aspectRatio: '16:9', duration: '5s', quality: '720p' },
  },
  happyhorse: {
    providerModel: 'happyhorse',
    modes: ['text-to-video', 'image-to-video'],
    aspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    durations: ['3s', '5s', '8s', '10s', '15s'],
    qualities: ['720p', '1080p'],
    defaults: { aspectRatio: '16:9', duration: '5s', quality: '1080p' },
  },
  hailuo: {
    providerModel: 'hailuo',
    modes: ['image-to-video'],
    aspectRatios: [],
    durations: ['6s', '10s'],
    qualities: ['768p', '1080p'],
    defaults: { aspectRatio: '16:9', duration: '6s', quality: '768p' },
  },
  grok: {
    providerModel: 'grok',
    modes: ['text-to-video', 'image-to-video'],
    aspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4', '4:5', '21:9'],
    durations: ['1s', '3s', '5s', '8s', '10s', '15s'],
    qualities: ['480p', '720p'],
    defaults: { aspectRatio: '16:9', duration: '5s', quality: '720p' },
  },
  wan: {
    providerModel: 'wan',
    modes: ['image-to-video', 'start-end'],
    aspectRatios: [],
    durations: ['2s', '4s', '5s', '8s', '10s', '15s'],
    frameDurations: ['2s', '4s', '5s', '8s', '10s', '15s'],
    qualities: ['720p', '1080p'],
    defaults: { aspectRatio: '16:9', duration: '5s', quality: '1080p' },
  },
};

function normalizeModelId(value) {
  const raw = typeof value === 'string' ? value : value?.id;
  const normalized = String(raw || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return MODEL_ROUTE_ALIASES[normalized] || normalized || 'seedance-2';
}

export function getVideoModelById(value) {
  const id = normalizeModelId(value);
  return MODELS.find((model) => model.id === id) || MODELS[0];
}

export function getVideoModelConfig(model) {
  const id = getVideoModelById(model).id;
  return VIDEO_MODEL_CONFIGS[id] || VIDEO_MODEL_CONFIGS['seedance-2'];
}

export function getProviderVideoModel(model) {
  return getVideoModelConfig(model).providerModel;
}

export function getAspectOptionsForModel(model) {
  return optionSubset(ASPECT_PILL_OPTIONS, getVideoModelConfig(model).aspectRatios);
}

export function getDurationOptionsForModel(model, mode) {
  const config = getVideoModelConfig(model);
  const ids = (mode === 'start-end' || mode === 'template') && config.frameDurations
    ? config.frameDurations
    : config.durations;
  return ids.map((id) => ({ id, label: id }));
}

export function getQualityOptionsForModel(model) {
  return optionSubset(QUALITY_PILL_OPTIONS, getVideoModelConfig(model).qualities);
}

export const PROMPT_LIMIT = 1500;

const SEEDANCE_CREDITS = {
  '480p': { '5s': 350, '10s': 700, '15s': 1050, '30s': 2100, '45s': 3150, '60s': 4200 },
  '720p': { '5s': 750, '10s': 1500, '15s': 2250, '30s': 4500, '45s': 6750, '60s': 9000 },
  '1080p': { '5s': 1900, '10s': 3750, '15s': 5650, '30s': 11250, '45s': 16900, '60s': 22500 },
};

const VIDEO_CREDITS = {
  hailuo: {
    '768p': { '6s': 190, '10s': 320 },
    '1080p': { '6s': 330 },
  },
  kling: {
    off: {
      '720p': { '5s': 840, '10s': 1680, '15s': 2520 },
      '1080p': { '5s': 1120, '10s': 2240, '15s': 3360 },
    },
    on: {
      '720p': { '5s': 1120, '10s': 2240, '15s': 3360 },
      '1080p': { '5s': 1400, '10s': 2800, '15s': 4200 },
    },
  },
  happyhorse: {
    '720p': { '5s': 700, '10s': 1400, '15s': 2100 },
    '1080p': { '5s': 1400, '10s': 2800, '15s': 4200 },
  },
  veo: {
    '720p': { '4s': 200, '6s': 300, '8s': 400 },
    '1080p': { '8s': 640 },
  },
  grok: {
    '480p': { '5s': 250, '10s': 500, '15s': 750 },
    '720p': { '5s': 250, '10s': 500, '15s': 750 },
  },
};

function durationSeconds(duration) {
  return Number.parseInt(String(duration || '5s'), 10) || 5;
}

function valueOrFallback(table, duration, creditsPerSecond) {
  const exact = table?.[duration];
  if (exact) return exact;
  return durationSeconds(duration) * creditsPerSecond;
}

export function getVideoCredits(model, duration, quality, sound = 'off') {
  const modelId = getVideoModelById(model).id;
  const audioKey = sound === 'on' ? 'on' : 'off';
  if (modelId === 'kling') {
    const table = VIDEO_CREDITS[modelId][audioKey][quality] || VIDEO_CREDITS[modelId][audioKey]['720p'];
    const fallback = quality === '1080p' ? (audioKey === 'on' ? 280 : 224) : (audioKey === 'on' ? 224 : 168);
    return valueOrFallback(table, duration, fallback);
  }
  if (modelId === 'hailuo') {
    const table = VIDEO_CREDITS[modelId][quality === '1080p' ? '1080p' : '768p'];
    return valueOrFallback(table, duration, quality === '1080p' ? 55 : 32);
  }
  if (modelId === 'happyhorse' || modelId === 'veo' || modelId === 'grok') {
    const table = VIDEO_CREDITS[modelId][quality] || VIDEO_CREDITS[modelId]['720p'];
    const fallback = modelId === 'happyhorse' ? (quality === '1080p' ? 280 : 140)
      : modelId === 'veo' ? (quality === '1080p' ? 80 : 50)
      : 50;
    return valueOrFallback(table, duration, fallback);
  }
  const seedanceTable = SEEDANCE_CREDITS[quality] || SEEDANCE_CREDITS['720p'];
  const fallback = quality === '480p' ? 70 : quality === '1080p' ? 375 : 150;
  return valueOrFallback(seedanceTable, duration, fallback);
}

// ─── Free Creation Modes ──────────────────────────────────────────────────────

/**
 * The three modes available in the Free Creation Panel.
 * Note: image-to-video is also included here for free-form single-image generation,
 * separate from the template-driven image-to-video flow.
 */
export const FREE_MODES = [
  {
    id: 'text-to-video',
    label: 'Generator',
    desc: 'Generate video from a prompt with optional reference images',
    icon: Type,
  },
  {
    id: 'start-end',
    label: 'Start & End Frames',
    desc: 'Transition between two keyframe images',
    icon: Images,
    badge: 'Hot',
  },
  {
    id: 'template',
    label: 'Template',
    desc: 'Use a cinematic template to get started fast',
    icon: Sparkles,
  },
];

// ─── Preset Styles (defined, not yet rendered — reserved for future MVP) ──────

export const PRESET_STYLES = [
  { label: '🎬 Cinematic', suffix: ', cinematic lighting, 8k resolution, highly detailed' },
  { label: '🎨 Anime',     suffix: ', Japanese anime style, vibrant colors, hand-drawn' },
  { label: '🪐 Sci-Fi',    suffix: ', futuristic science fiction, cybernetic, neon glow' },
  { label: '📸 Film 35mm', suffix: ', photorealistic, shot on 35mm lens, film grain' },
  { label: '🕯️ Unreal 5', suffix: ', 3D render, Unreal Engine 5, raytraced shadows' },
  { label: '🌊 Ghibli',    suffix: ', Ghibli art style, watercolor backgrounds, whimsical' },
];

// ─── Mode Presets ─────────────────────────────────────────────────────────────

export const MODE_PRESETS = {
  'text-to-video': [
    {
      id: 'text-01',
      title: 'Suspense Highway',
      thumbnail: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/text-to-video/text-01-porsche-highway.png',
      prompt: 'A Porsche 911 drives alone on an empty highway in a suspenseful cinematic atmosphere, with a moody blue-black color palette.',
      mode: 'text-to-video'
    },
    {
      id: 'text-02',
      title: 'Zombie Ignition',
      thumbnail: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/text-to-video/text-02-zombie-cigarette.png',
      prompt: 'A European man holds a cigarette in his mouth and prepares to light it, while a wave of zombies surges in the background, in a blue-black apocalyptic tone.',
      mode: 'text-to-video'
    },
    {
      id: 'text-03',
      title: 'Battlefield Rescue',
      thumbnail: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/text-to-video/text-03-soldier-rescue.png',
      prompt: 'A male and a female soldier support an injured man between them, while a blurred army stands in the background, creating a tense cinematic war scene.',
      mode: 'text-to-video'
    }
  ],
  'image-to-video': [
    {
      id: 'image-01',
      title: 'K-pop Glow Up',
      thumbnail: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/image-to-video/image-01-girl-kpop-output.png',
      prompt: 'Transform this casual selfie into a polished K-pop stage performance while keeping the same person’s facial identity, but with clearer skin, styled hair, and a glamorous performance vibe.',
      mode: 'image-to-video',
      imageFrame: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/image-to-video/image-01-girl-selfie-input.png'
    },
    {
      id: 'image-02',
      title: 'Farmer to California',
      thumbnail: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/image-to-video/image-02-farmer-california-output.png',
      prompt: 'Transform this natural portrait of an elderly farmer into the same person walking a dog in a relaxed California luxury neighborhood, with fewer wrinkles, better styling, and a chill wealthy vibe.',
      mode: 'image-to-video',
      imageFrame: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/image-to-video/image-02-farmer-field-input.png'
    },
    {
      id: 'image-03',
      title: 'Home to War Reporter',
      thumbnail: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/image-to-video/image-03-man-war-reporter-output.png',
      prompt: 'Transform this casual home portrait into the same person working as a war correspondent on the front line, reporting on camera in a dramatic conflict-zone environment.',
      mode: 'image-to-video',
      imageFrame: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/image-to-video/image-03-man-home-input.png'
    }
  ],
  'start-end': [
    {
      id: 'start-end-01',
      title: 'Paris Turnback',
      thumbnail: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/start-end-frames/startend-01-paris-turnback-preview.png',
      prompt: 'Create a smooth cinematic transition of a woman turning back on a quiet Paris street, with the Eiffel Tower in the background.',
      mode: 'start-end',
      startFrame: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/start-end-frames/startend-01-paris-turnback-start.png',
      endFrame: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/start-end-frames/startend-01-paris-turnback-end.png'
    },
    {
      id: 'start-end-02',
      title: 'Paris Café Flyover',
      thumbnail: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/start-end-frames/startend-02-paris-cafe-preview.png',
      prompt: 'Create a smooth flying camera transition from a Paris café street view to an elegant aerial view above the café.',
      mode: 'start-end',
      startFrame: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/start-end-frames/startend-02-paris-cafe-start.png',
      endFrame: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/start-end-frames/startend-02-paris-cafe-end.png'
    },
    {
      id: 'start-end-03',
      title: 'Pool Dive',
      thumbnail: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/start-end-frames/startend-03-pool-dive-preview.png',
      prompt: 'Create a seamless transition from a poolside dive into a vivid underwater world with coral reefs and tropical fish.',
      mode: 'start-end',
      startFrame: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/start-end-frames/startend-03-pool-dive-start.png',
      endFrame: 'https://lazykiwi.oss-accelerate.aliyuncs.com/web-assets/assets/presets/start-end-frames/startend-03-pool-dive-end.png'
    }
  ]
};
