import { useCallback, useEffect, useRef, useState } from 'react';
import { Link2 } from 'lucide-react';

const LINK_PATTERN = /^\[([^\]]+)\]\(([^)]+)\)$/;

export function isAllowedLinkUrl(url) {
  const trimmed = String(url || '').trim();
  return /^\/[^\s]*$/.test(trimmed) || /^https?:\/\/[^\s]+$/i.test(trimmed);
}

export default function LinkableTextarea({
  value = '',
  onChange,
  placeholder = '',
  rows,
  className = '',
  ...rest
}) {
  const textareaRef = useRef(null);
  const toolbarRef = useRef(null);
  const popoverRef = useRef(null);
  const urlInputRef = useRef(null);
  const toolbarStateRef = useRef(null);

  const [toolbar, setToolbar] = useState(null);
  const [linkPanel, setLinkPanel] = useState(null);
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  const closeAll = useCallback(() => {
    setToolbar(null);
    toolbarStateRef.current = null;
    setLinkPanel(null);
    setUrl('');
    setUrlError('');
  }, []);

  const detectSelection = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start == null || end == null || start === end) {
      setToolbar(null);
      if (!linkPanel) closeAll();
      return;
    }

    const selectedText = value.slice(start, end);
    const linkMatch = selectedText.match(LINK_PATTERN);
    const isEdit = Boolean(linkMatch);

    const rect = el.getBoundingClientRect();
    const lineHeight = parseInt(window.getComputedStyle(el).lineHeight, 10) || 20;
    const linesBefore = value.slice(0, start).split('\n').length - 1;
    const top = Math.min(rect.top + linesBefore * lineHeight + lineHeight, rect.bottom - 32);
    const left = Math.min(rect.left + 12, rect.right - 120);

    setToolbar({
      top,
      left,
      start,
      end,
      selectedText,
      isEdit,
      existingUrl: linkMatch ? linkMatch[2] : '',
    });
  }, [value, linkPanel, closeAll]);

  useEffect(() => {
    toolbarStateRef.current = toolbar;
  }, [toolbar]);

  const openLinkPanel = useCallback(() => {
    const t = toolbarStateRef.current;
    if (!t) return;
    setLinkPanel({ start: t.start, end: t.end, selectedText: t.selectedText, isEdit: t.isEdit });
    setUrl(t.existingUrl || '');
    setUrlError('');
    setToolbar(null);
    toolbarStateRef.current = null;
    requestAnimationFrame(() => urlInputRef.current?.focus());
  }, []);

  const applyLink = useCallback(() => {
    if (!linkPanel) return;
    const trimmedUrl = url.trim();
    if (!isAllowedLinkUrl(trimmedUrl)) {
      setUrlError('请输入站内路径（/...）或 http(s):// 外链');
      return;
    }

    const { start, end, selectedText, isEdit } = linkPanel;
    let label = selectedText;
    if (isEdit) {
      const match = selectedText.match(LINK_PATTERN);
      label = match ? match[1] : selectedText;
    }

    const linked = `[${label}](${trimmedUrl})`;
    const next = value.slice(0, start) + linked + value.slice(end);
    onChange?.({ target: { value: next } });

    closeAll();
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      const pos = start + linked.length;
      el.setSelectionRange(pos, pos);
    });
  }, [linkPanel, url, value, onChange, closeAll]);

  useEffect(() => {
    if (!toolbar && !linkPanel) return;
    const onDocMouseDown = (e) => {
      if (popoverRef.current?.contains(e.target)) return;
      if (toolbarRef.current?.contains(e.target)) return;
      if (textareaRef.current?.contains(e.target)) return;
      closeAll();
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeAll();
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [toolbar, linkPanel, closeAll]);

  const panelStyle = linkPanel && textareaRef.current
    ? (() => {
        const rect = textareaRef.current.getBoundingClientRect();
        return { top: rect.top + 8, left: rect.left + 8, minWidth: Math.min(280, rect.width - 16) };
      })()
    : null;

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onMouseUp={detectSelection}
        onKeyUp={(e) => {
          if (e.key === 'Shift' || e.key.startsWith('Arrow') || e.key === 'Home' || e.key === 'End') {
            detectSelection();
          }
        }}
        placeholder={placeholder}
        rows={rows}
        className={className}
        {...rest}
      />

      {toolbar && (
        <button
          ref={toolbarRef}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openLinkPanel();
          }}
          style={{ position: 'fixed', top: toolbar.top, left: toolbar.left, zIndex: 9999 }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-lg transition hover:border-kiwi-green hover:text-kiwi-green-dark"
        >
          <Link2 size={12} />
          {toolbar.isEdit ? '编辑链接' : '添加链接'}
        </button>
      )}

      {linkPanel && panelStyle && (
        <div
          ref={popoverRef}
          style={{ position: 'fixed', ...panelStyle, zIndex: 9999 }}
          className="rounded-xl border border-gray-200 bg-white p-3 shadow-xl"
        >
          <p className="mb-2 text-xs font-semibold text-gray-600">
            {linkPanel.isEdit ? '编辑链接' : '添加链接'}
            <span className="ml-1 font-normal text-gray-400">（站内 / 或 https://）</span>
          </p>
          <input
            ref={urlInputRef}
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setUrlError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                applyLink();
              }
            }}
            placeholder="/tools 或 https://example.com"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-kiwi-green"
          />
          {urlError ? <p className="mt-1.5 text-xs text-red-500">{urlError}</p> : null}
          <div className="mt-2.5 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeAll}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100"
            >
              取消
            </button>
            <button
              type="button"
              onClick={applyLink}
              className="rounded-lg bg-kiwi-green px-3 py-1.5 text-xs font-bold text-gray-950 hover:bg-kiwi-green-dark hover:text-white"
            >
              确认
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
