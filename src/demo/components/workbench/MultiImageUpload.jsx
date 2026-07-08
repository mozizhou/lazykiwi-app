import { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

let idCounter = 0;
const genId = () => `img_${++idCounter}_${Date.now()}`;

/**
 * MultiImageUpload
 *
 * Replaces single ImageUploadBox in targeted scenarios (image-to-video,
 * text-to-image ref upload) with Gemini-style multi-image interaction:
 *
 *   • 0 images → single dashed upload box (identical to existing)
 *   • 1 image  → thumbnail; hover reveals a "+" upload box on the right
 *   • ≥2 images → fanned/collapsed stack; hover expands into a horizontal row
 *                  with a trailing "+" box (up to maxImages)
 *
 * The hidden <input type="file"> is rendered ONCE at the root and never
 * unmounts, so file selection always completes regardless of hover/expand
 * state changes.
 *
 * Props:
 *   images        — Array<{ id, file?, previewUrl, displayName, originalName }>
 *   onImagesChange — fn(newArray)
 *   className     — extra classes (typically a width like "w-[80px]" or "w-[72px]")
 *   maxImages     — default 6
 *   accept        — accepted MIME types, default image/*
 */
export default function MultiImageUpload({
  images = [],
  onImagesChange,
  className = '',
  maxImages = 6,
  accept = 'image/png,image/jpeg,image/webp',
}) {
  const inputRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const blobUrlsRef = useRef(new Set());

  // NOTE: No unmount cleanup for blob URLs.
  // Blob URLs are released per-image in removeImage().
  // Parent components handle cleanup on generation-reset.
  // Page navigation handles the rest. This avoids broken previews
  // when mode-switching (e.g. Text-to-Image ↔ Template) unmounts
  // this component temporarily.

  const handleFiles = (fileList) => {
    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      if (typeof window !== 'undefined') console.warn('Up to 6 images');
      return;
    }
    const newItems = Array.from(fileList).slice(0, remaining).map((file, i) => {
      const id = genId();
      const previewUrl = URL.createObjectURL(file);
      blobUrlsRef.current.add(previewUrl);
      return {
        id,
        file,
        previewUrl,
        displayName: `Image ${images.length + i + 1}`,
        originalName: file.name,
      };
    });
    if (newItems.length) onImagesChange([...images, ...newItems]);
  };

  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      handleFiles(e.target.files);
    }
    e.target.value = '';
  };

  const triggerUpload = () => inputRef.current?.click();

  const removeImage = (id) => {
    const target = images.find((i) => i.id === id);
    if (target?.previewUrl?.startsWith('blob:')) {
      blobUrlsRef.current.delete(target.previewUrl);
      URL.revokeObjectURL(target.previewUrl);
    }
    const updated = images
      .filter((i) => i.id !== id)
      .map((img, idx) => ({ ...img, displayName: `Image ${idx + 1}` }));
    onImagesChange(updated);
  };

  const count = images.length;
  const canAddMore = count < maxImages;

  return (
    <>
      {/* ─── Stable file input — always mounted, never inside conditional DOM ─── */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        multiple
        className="hidden"
      />

      {/* ─── Empty state ──────────────────────────────────────────────────── */}
      {count === 0 && (
        <div className={`relative flex-shrink-0 ${className}`}>
          <button
            type="button"
            onClick={triggerUpload}
            className="flex h-full w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white hover:border-gray-400 transition-colors aspect-[3/4]"
            style={{ minHeight: 0 }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <Plus size={18} className="text-gray-400" />
            </div>
          </button>
        </div>
      )}

      {/* ─── Single image ─────────────────────────────────────────────────── */}
      {count === 1 && (
        <SingleImageContent
          images={images}
          isHovered={isHovered}
          setIsHovered={setIsHovered}
          canAddMore={canAddMore}
          onRemove={removeImage}
          onAdd={triggerUpload}
          className={className}
        />
      )}

      {/* ─── Multi-image (≥2) — fan / stack ───────────────────────────────── */}
      {count >= 2 && (
        <MultiImageFan
          images={images}
          canAddMore={canAddMore}
          onRemove={removeImage}
          onAdd={triggerUpload}
        />
      )}
    </>
  );
}

// ─── Single image content (extracted to keep MultiImageUpload's return flat) ─────

function SingleImageContent({
  images,
  isHovered,
  setIsHovered,
  canAddMore,
  onRemove,
  onAdd,
  className,
}) {
  const img = images[0];
  const thumbnailWidth = className.match(/w-\[(\d+)px\]/)?.[1] || '80';

  return (
    <div
      className={`relative flex items-start transition-all duration-200 ${className.replace(/w-\[\d+px\]/g, '').trim()}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ width: isHovered ? `${parseInt(thumbnailWidth) + 80}px` : `${thumbnailWidth}px` }}
    >
      {/* Thumbnail */}
      <div
        className="relative shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm aspect-[3/4]"
        style={{ width: `${thumbnailWidth}px` }}
      >
        <img src={img.previewUrl} alt={img.displayName} className="h-full w-full object-cover" />

        {/* Delete — visible on hover */}
        <div
          className={`absolute inset-0 transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(img.id); }}
            className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/45 hover:bg-red-500 text-white transition-colors z-10"
          >
            <X size={9} />
          </button>
        </div>

        {/* Number badge */}
        <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/45 text-[10px] font-semibold text-white pointer-events-none">
          #1
        </div>
      </div>

      {/* "+" upload box — appears on hover */}
      <div
        className={`shrink-0 transition-all duration-200 ease-out ${
          isHovered
            ? 'opacity-100 translate-x-0 ml-2 pointer-events-auto'
            : 'opacity-0 -translate-x-2 ml-0 pointer-events-none'
        }`}
      >
        {canAddMore ? (
          <button
            type="button"
            onClick={onAdd}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white hover:border-gray-400 transition-colors aspect-[3/4]"
            style={{ width: '72px', minHeight: 0 }}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100">
              <Plus size={14} className="text-gray-400" />
            </div>
          </button>
        ) : null}
      </div>
    </div>
  );
}

// ─── Multi-image fan / stack ──────────────────────────────────────────────────────

function MultiImageFan({
  images,
  canAddMore,
  onRemove,
  onAdd,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const wrapperRef = useRef(null);

  // Close expanded when mouse leaves the entire area
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const onLeave = () => setIsExpanded(false);
    el.addEventListener('mouseleave', onLeave);
    return () => el.removeEventListener('mouseleave', onLeave);
  }, []);

  const N = images.length;

  // ── Expanded: horizontal row ──────────────────────────────────────────────────
  if (isExpanded) {
    return (
      <div
        ref={wrapperRef}
        onMouseEnter={() => setIsExpanded(true)}
        className="relative shrink-0 overflow-visible"
      >
        {/* Floating overlay */}
        <div
          className="absolute top-0 left-0 z-50 flex items-start gap-1.5 p-2 rounded-2xl bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <div
              key={img.id}
              className="relative shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm aspect-[3/4] group"
              style={{ width: '60px', minHeight: 0 }}
            >
              <img src={img.previewUrl} alt={img.displayName} className="h-full w-full object-cover" />
              {/* Delete */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemove(img.id); }}
                  className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/45 hover:bg-red-500 text-white transition-colors"
                >
                  <X size={7} />
                </button>
              </div>
              {/* Number badge */}
              <div className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/45 text-[8px] font-semibold text-white pointer-events-none leading-none">
                #{idx + 1}
              </div>
            </div>
          ))}

          {/* "+" add-more box */}
          {canAddMore && (
            <button
              type="button"
              onClick={onAdd}
              className="flex shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white hover:border-gray-400 transition-colors aspect-[3/4]"
              style={{ width: '60px', minHeight: 0 }}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                <Plus size={12} className="text-gray-400" />
              </div>
            </button>
          )}
        </div>

        {/* Invisible spacer */}
        <div className="shrink-0 pointer-events-none" style={{ width: '80px', height: '106px' }} />
      </div>
    );
  }

  // ── Collapsed: fan / card stack ──────────────────────────────────────────────
  const maxVisible = 3;
  const visible = images.slice(0, maxVisible);
  const excess = N - maxVisible;

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={() => setIsExpanded(true)}
      className="relative shrink-0 cursor-pointer"
      style={{ width: '80px', height: '106px' }}
    >
      {visible.map((img, idx) => {
        const translateX = idx * 8;
        const rotate = idx === 0 ? 0 : idx % 2 === 1 ? -2 : 2;
        return (
          <div
            key={img.id}
            className="absolute inset-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            style={{
              zIndex: visible.length - idx,
              transform: `translateX(${translateX}px) rotate(${rotate}deg)`,
              transformOrigin: 'bottom center',
            }}
          >
            <img src={img.previewUrl} alt="" className="h-full w-full object-cover" />
          </div>
        );
      })}

      {excess > 0 && (
        <div
          className="absolute bottom-1 -right-0.5 px-1.5 py-0.5 rounded-md bg-gray-900/70 text-[9px] font-semibold text-white pointer-events-none"
          style={{ zIndex: visible.length + 1 }}
        >
          +{excess}
        </div>
      )}

      <div
        className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/45 text-[9px] font-semibold text-white pointer-events-none"
        style={{ zIndex: visible.length + 1 }}
      >
        {N} pics
      </div>
    </div>
  );
}
