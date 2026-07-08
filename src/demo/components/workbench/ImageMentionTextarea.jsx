import { useState, useRef, useCallback, useEffect } from 'react';
import { Eraser } from 'lucide-react';

/**
 * ImageMentionTextarea
 *
 * A textarea that extends the visual language of ClearableTextarea with
 * @-mention support for referencing uploaded images.
 *
 * Props — same contract as ClearableTextarea:
 *   value, onChange, placeholder, rows, className, containerClassName,
 *   maxLength, showCounter, counterThreshold, counterClassName
 *
 * Plus:
 *   images — Array<{ id, previewUrl, displayName }> — used for the mention dropdown
 */
export default function ImageMentionTextarea({
  value = '',
  onChange,
  placeholder = '',
  rows,
  className = '',
  containerClassName = '',
  maxLength,
  showCounter = true,
  counterThreshold = 0,
  counterClassName = 'bottom-0 right-0',
  images = [],
}) {
  const textareaRef = useRef(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Mention state ──────────────────────────────────────────────────────────────
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(-1); // position of '@' in value
  const dropdownRef = useRef(null);
  const prevValueRef = useRef(value);

  // Detect new '@' being typed
  useEffect(() => {
    const prev = prevValueRef.current;
    const curr = value;
    prevValueRef.current = curr;

    // If the value got longer and the new character(s) contain '@'
    if (curr.length > prev.length) {
      const newChars = curr.slice(prev.length);
      if (newChars.includes('@')) {
        // Find the last '@' in the current value (closest to cursor)
        const atIdx = curr.lastIndexOf('@');
        if (atIdx >= 0) {
          // Don't re-open if we just inserted a mention
          const afterAt = curr.slice(atIdx);
          if (!afterAt.startsWith('@[')) {
            setMentionIndex(atIdx);
            setMentionOpen(true);
            return;
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Close mention on outside click
  useEffect(() => {
    if (!mentionOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMentionOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [mentionOpen]);

  const insertMention = useCallback(
    (image) => {
      if (mentionIndex < 0) return;
      const before = value.slice(0, mentionIndex);
      const after = value.slice(mentionIndex + 1); // skip the '@'
      const mention = `@[${image.displayName}]`;
      const newVal = before + mention + after;
      onChange(newVal);
      setMentionOpen(false);

      // Restore cursor position after the inserted mention
      requestAnimationFrame(() => {
        const ta = textareaRef.current;
        if (ta) {
          const pos = before.length + mention.length;
          ta.focus();
          ta.setSelectionRange(pos, pos);
        }
      });
    },
    [mentionIndex, value, onChange],
  );

  const handleChange = useCallback(
    (e) => {
      const val = maxLength ? e.target.value.slice(0, maxLength) : e.target.value;
      onChange(val);
    },
    [maxLength, onChange],
  );

  const handleClear = useCallback(() => {
    onChange('');
    setShowConfirm(false);
  }, [onChange]);

  const hasImages = images.length > 0;

  return (
    <>
      <div className={`relative ${containerClassName}`}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          rows={rows}
          className={`w-full resize-none border-0 bg-transparent outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:[box-shadow:none] pr-9 ${className}`}
        />

        {/* Clear button */}
        {value && (
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            title="Clear text"
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded text-gray-300 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <Eraser size={15} />
          </button>
        )}

        {/* Character counter */}
        {maxLength && showCounter && value.length > counterThreshold && (
          <div
            className={`pointer-events-none absolute text-[10px] tabular-nums text-gray-300 ${counterClassName}`}
          >
            {value.length}/{maxLength}
          </div>
        )}

        {/* ── @ Mention dropdown ──────────────────────────────────────────── */}
        {mentionOpen && (
          <div
            ref={dropdownRef}
            className="absolute left-2 top-2 z-50 min-w-[200px] max-w-[280px] rounded-xl border border-gray-200 bg-white/98 backdrop-blur-sm shadow-xl"
          >
            {hasImages ? (
              <div className="py-1 max-h-[120px] overflow-y-auto">
                {images.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => insertMention(img)}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <img
                      src={img.previewUrl}
                      alt=""
                      className="h-8 w-8 shrink-0 rounded-lg object-cover border border-gray-200"
                    />
                    <span className="font-medium">{img.displayName}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-3 py-2.5 text-[12px] text-gray-400 italic">
                Upload images to reference them.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Clear confirmation popup ──────────────────────────────────────── */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 backdrop-blur-sm"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="w-full max-w-[320px] rounded-[28px] bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="text-[17px] font-bold text-gray-900">Clear text?</div>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-[14px] text-gray-600 mb-6">
              Do you want to remove all text in this field?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-[13px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 text-[13px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition shadow-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
