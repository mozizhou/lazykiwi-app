import { useRef } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';

/**
 * ImageUploadBox
 *
 * Reusable image upload widget used across the Free Creation Panel and
 * the Template Modal. Supports local device upload via a hidden file input.
 *
 * Props:
 *   value     — current image src (blob URL, data URL, or '/'-path). '' = empty.
 *   onChange  — fn(blobUrl: string) called when a new file is selected.
 *   onClear   — fn() called when the user removes the current image.
 *   label     — alt text for the image; also used as the accessible button label.
 *   aspect    — Tailwind aspect-ratio class. Defaults to 'aspect-[3/4]' (portrait).
 *               Pass 'aspect-video' for a landscape box (e.g. in TemplateModal).
 *   showLabel — when true, renders 'Upload media' helper text under the + icon.
 *               Defaults to false so small FreeCreationPanel boxes stay clean.
 *   className — extra classes (typically a width: 'w-full', 'flex-1', 'w-28', etc.).
 */
export default function ImageUploadBox({
  value = '',
  previewValue = '',
  onChange,
  onClear,
  label,
  subtext,
  showSimpleUpload = false,
  aspect = 'aspect-[3/4]',
  className = '',
}) {
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onChange(previewUrl, file);
    }
    // Reset so the same file can be re-selected after a Replace
    e.target.value = '';
  };

  const triggerUpload = () => inputRef.current?.click();

  const hasImage = Boolean(value);
  const isPreview = !hasImage && Boolean(previewValue);

  return (
    <div
      className={`relative flex-shrink-0 overflow-hidden rounded-2xl bg-white transition-all ${aspect} ${className} ${
        hasImage
          ? 'border border-kiwi-green/40'
          : isPreview
          ? 'border border-dashed border-gray-300'
          : 'border border-dashed border-gray-300 hover:border-gray-400'
      }`}
    >
      {hasImage || isPreview ? (
        <>
          {/* Image preview */}
          <img
            src={hasImage ? value : previewValue}
            alt={label || 'Uploaded Image'}
            className={`h-full w-full object-cover transition-all ${isPreview ? 'opacity-60' : ''}`}
          />

          {/* Hover overlay: Delete + Replace actions */}
          <div className={`absolute inset-0 flex items-end justify-end gap-2 p-2.5 bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 ${isPreview ? 'pointer-events-none' : ''}`}>
            {hasImage && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); triggerUpload(); }}
                  title="Replace image"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md backdrop-blur-sm hover:bg-white hover:scale-105 transition-all"
                >
                  <Upload size={13} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onClear(); }}
                  title="Remove image"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-md backdrop-blur-sm hover:bg-red-500 hover:text-white hover:scale-105 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </>
            )}
          </div>
        </>
      ) : (
        /* Empty state — click anywhere to trigger file picker */
        <button
          type="button"
          onClick={triggerUpload}
          className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <Plus size={18} />
          </div>
          {showSimpleUpload ? (
            <span className="text-[12px] font-medium text-gray-500 mt-1">Upload</span>
          ) : (
            (label || subtext) && (
              <div className="text-center px-2 mt-1 w-full">
                {label && (
                  <p className="text-[13px] font-semibold text-gray-700 leading-tight whitespace-normal break-words">
                    {label}
                  </p>
                )}
                {subtext && (
                  <p className="text-sm text-gray-500 mt-0.5 leading-tight whitespace-normal break-words">
                    {subtext}
                  </p>
                )}
              </div>
            )
          )}
        </button>
      )}

      {/* Hidden native file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
