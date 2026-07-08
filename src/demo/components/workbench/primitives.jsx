import { useState } from 'react';
import { Check, Upload as UploadIcon, LoaderCircle, Send, X, Eraser } from 'lucide-react';

export function WorkbenchShell({ children, className = '', fill = false }) {
  const layout = fill
    ? 'flex flex-1 min-h-0 w-full rounded-none border-0'
    : 'h-[520px] sm:h-[560px] rounded-[28px] border border-gray-200/80 mb-16';
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-[#FAFBF4] via-[#F2F6E6] to-[#E7EED5] ${layout} ${className}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(163,230,53,0.20),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_90%,rgba(132,204,22,0.12),transparent_50%)]" />
      <div className="relative flex h-full w-full flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}

export function Preview({ state, idle, generating, ready }) {
  return (
    <div className="flex flex-1 min-h-0 items-center justify-center px-4 pt-6 pb-2 sm:pt-10">
      {state === 'ready' ? ready : state === 'generating' ? generating : idle}
    </div>
  );
}

export function ControlDock({ children, maxWidth = 'max-w-4xl' }) {
  return (
    <div className="relative z-10 px-3 pb-3 sm:px-5 sm:pb-5">
      <div className={`mx-auto w-full ${maxWidth} overflow-hidden rounded-[24px] border border-gray-200/70 bg-white/95 shadow-[0_8px_32px_rgba(15,23,42,0.10)] backdrop-blur-md`}>
        {children}
      </div>
    </div>
  );
}

export function WorkbenchHero({ eyebrow, title, subtitle, children }) {
  return (
    <section
      className="relative flex flex-col flex-1 min-h-0"
    >
      {(title || eyebrow || subtitle) && (
        <div className="absolute left-0 top-0 z-20 px-5 pt-4 sm:px-8 sm:pt-5">
          {eyebrow && (
            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-kiwi-green/40 bg-kiwi-light-green/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-kiwi-green-dark">
              {eyebrow}
            </div>
          )}
          {title && (
            <h1 className="text-lg font-bold tracking-tight text-gray-900">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="mt-0.5 text-[13px] text-gray-500 max-w-md">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className="flex w-full flex-1 flex-col min-h-0">
        {children}
      </div>
    </section>
  );
}

export function WorkbenchPage({ children, className = '' }) {
  return <div className={`flex-1 min-h-0 flex flex-col ${className}`}>{children}</div>;
}

export function GeneratingState({ title, subtitle }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-[0_4px_24px_rgba(132,204,22,0.18)]">
        <LoaderCircle className="h-9 w-9 animate-spin text-kiwi-green-dark" />
      </div>
      <div className="text-lg font-semibold text-gray-900">{title}</div>
      {subtitle && <div className="mt-1.5 text-[13px] text-gray-500">{subtitle}</div>}
    </div>
  );
}

export function IdleState({ icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center text-center">
      {icon && <div className="mb-4 text-gray-300">{icon}</div>}
      <div className="text-lg font-semibold text-gray-800">{title}</div>
      {subtitle && <div className="mt-1.5 text-[13px] text-gray-500">{subtitle}</div>}
    </div>
  );
}

export function ReadyState({ children }) {
  return (
    <button
      type="button"
      className="group flex h-24 w-24 items-center justify-center rounded-full bg-white/85 shadow-[0_8px_32px_rgba(132,204,22,0.30)] backdrop-blur-sm transition hover:scale-105 hover:bg-white"
    >
      {children}
    </button>
  );
}

export function Divider() {
  return <div className="h-px w-full bg-gray-100" />;
}

export function UploadChip({ filename, onClick, label = 'Upload', icon: Icon, size = 'md' }) {
  const has = !!filename;
  const sizes = {
    sm: 'h-9 px-3 text-[12px]',
    md: 'h-10 px-4 text-[13px]',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center gap-2 rounded-xl font-medium transition ${sizes[size]} ${
        has
          ? 'bg-kiwi-light-green text-kiwi-green-dark hover:bg-kiwi-light-green/80'
          : 'border border-dashed border-gray-300 bg-white text-gray-600 hover:border-kiwi-green hover:text-kiwi-green-dark'
      }`}
    >
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${has ? 'bg-kiwi-green text-gray-900' : 'text-gray-400 group-hover:text-kiwi-green-dark'}`}>
        {has ? <Check className="h-3 w-3" strokeWidth={3} /> : Icon ? <Icon className="h-3.5 w-3.5" /> : <UploadIcon className="h-3.5 w-3.5" />}
      </span>
      <span className="max-w-[140px] truncate">{has ? filename : label}</span>
    </button>
  );
}

export function PrimaryButton({ onClick, disabled, children, label, busyLabel = 'Working…', credits, loading, className = '' }) {
  const isGenerating = typeof children === 'string' && (children.includes('Generating') || children.includes('Working'));
  const busy = loading || label === busyLabel || isGenerating;
  const defaultClasses = "group inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-b from-kiwi-green to-kiwi-green-dark px-7 text-sm font-bold text-gray-900 shadow-[0_6px_20px_rgba(132,204,22,0.35)] transition hover:shadow-[0_8px_24px_rgba(132,204,22,0.45)] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:bg-none disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:shadow-none";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={className ? `${defaultClasses} ${className}` : defaultClasses}
    >
      {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      <span>{children || label}</span>
      {credits !== undefined && !busy && (
        <span className="text-[11px] font-bold opacity-60 ml-0.5">
          · {credits}cr
        </span>
      )}
    </button>
  );
}

export function SliderRow({ label, value, min = 0, max = 100, suffix = '%', onChange, format }) {
  const display = format ? format(value) : `${value}${suffix}`;
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-[12px] font-medium text-gray-500">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="workbench-slider flex-1"
      />
      <span className="w-12 text-right text-[12px] font-semibold text-gray-700 tabular-nums">{display}</span>
    </div>
  );
}

export function Popup({ open, onClose, title, children, maxWidth = 'max-w-[640px]' }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`workbench-popup w-full ${maxWidth} rounded-[28px] bg-white p-6 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="text-[17px] font-bold text-gray-900">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ClearableTextarea({ value, onChange, placeholder, rows, className = '', containerClassName = '', maxLength, showCounter = true, counterThreshold = 0, counterClassName = 'bottom-0 right-0' }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <div className={`relative ${containerClassName}`}>
        <textarea
          value={value}
          onChange={(e) => {
            const val = maxLength ? e.target.value.slice(0, maxLength) : e.target.value;
            onChange(val);
          }}
          placeholder={placeholder}
          rows={rows}
          className={`w-full resize-none border-0 bg-transparent outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:[box-shadow:none] pr-9 ${className}`}
        />
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
        {maxLength && showCounter && value.length > counterThreshold && (
          <div className={`pointer-events-none absolute text-[10px] tabular-nums text-gray-300 ${counterClassName}`}>
            {value.length}/{maxLength}
          </div>
        )}
      </div>

      <Popup open={showConfirm} onClose={() => setShowConfirm(false)} title="Clear text?" maxWidth="max-w-[320px]">
        <p className="text-[14px] text-gray-600 mb-6">
          Do you want to remove all text in this field?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setShowConfirm(false)}
            className="px-4 py-2 text-[13px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onChange('');
              setShowConfirm(false);
            }}
            className="px-4 py-2 text-[13px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition shadow-sm"
          >
            Confirm
          </button>
        </div>
      </Popup>
    </>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex h-10 items-center gap-2.5 rounded-full px-1 text-[13px] font-medium text-gray-700 transition hover:text-gray-900"
    >
      <span className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${checked ? 'bg-kiwi-green' : 'bg-gray-200'}`}>
        <span className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </span>
      {label && <span>{label}</span>}
    </button>
  );
}

export function GalleryCard({ selected, onClick, preview, name, desc, aspect = 'aspect-[4/3]' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col overflow-hidden rounded-2xl text-left transition ${
        selected
          ? 'bg-kiwi-light-green/40 ring-2 ring-kiwi-green'
          : 'bg-white ring-1 ring-gray-200 hover:ring-gray-300'
      }`}
    >
      <div className={`${aspect} w-full overflow-hidden`}>{preview}</div>
      <div className="px-3 py-2.5">
        <div className="text-[13px] font-semibold text-gray-900 truncate">{name}</div>
        {desc && <div className="mt-0.5 text-[11px] text-gray-500 truncate">{desc}</div>}
      </div>
    </button>
  );
}

/**
 * PillGroup
 *
 * A flat segmented pill selector. Used for Aspect Ratio and Duration in the
 * Free Creation Panel and Template Modal, replacing the hidden settings popover.
 *
 * Props:
 *   options — array of { id: string, label: string }
 *   value   — the currently selected id
 *   onChange — fn(id: string)
 */
export function PillGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => {
        const isSelected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`h-7 rounded-lg px-2.5 text-[11.5px] font-medium transition-all duration-150 ${
              isSelected
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
