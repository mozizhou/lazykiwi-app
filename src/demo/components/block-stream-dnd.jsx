"use client";

import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus } from "lucide-react";

const POINTER_ACTIVATION = { distance: 8 };

function InsertionLine() {
  return <div className="my-1 h-1 rounded-full bg-kiwi-green/50 shadow-sm" aria-hidden />;
}

function GhostCard({ label, compact }) {
  return (
    <div
      className={`rounded-2xl border-2 border-dashed border-kiwi-green bg-white shadow-lg ${
        compact ? "px-3 py-2 text-xs font-bold text-gray-700" : "px-4 py-3 text-sm font-bold text-gray-800"
      } opacity-70`}
    >
      {label}
    </div>
  );
}

function useDndSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: POINTER_ACTIVATION }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
}

function resolveInsertIndex(active, over, items, getId) {
  if (!over) return items.length;
  const overId = String(over.id);
  if (overId === "canvas-drop" || overId === "empty-canvas") return items.length;
  const overIndex = items.findIndex((item, index) => getId(item, index) === overId);
  if (overIndex < 0) return items.length;
  const activeId = String(active.id);
  const activeIndex = items.findIndex((item, index) => getId(item, index) === activeId);
  if (activeIndex >= 0 && activeIndex < overIndex) return overIndex;
  return overIndex;
}

export function DragHandle({ setActivatorNodeRef, attributes, listeners, compact }) {
  return (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      title="拖动排序"
      className={`cursor-grab touch-none rounded-lg border border-gray-200 text-gray-400 transition hover:bg-gray-50 hover:text-gray-600 active:cursor-grabbing ${
        compact ? "p-1" : "p-1.5"
      }`}
    >
      <GripVertical size={compact ? 12 : 14} />
    </button>
  );
}

function SortableRow({ id, index, isDragging, insertBefore, children }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } = useSortable({
    id,
    data: { kind: "item", index },
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  };
  return (
    <>
      {insertBefore ? <InsertionLine /> : null}
      <div ref={setNodeRef} style={style}>
        {children({ setActivatorNodeRef, attributes, listeners })}
      </div>
    </>
  );
}

/**
 * Generic sortable list for nested RepeatableList / BlogBlocksEditor.
 */
export function SortableList({ items, onChange, getId, renderItem, ghostLabel }) {
  const list = Array.isArray(items) ? items : [];
  const resolveId = useCallback(
    (item, index) => {
      if (getId) return String(getId(item, index));
      if (item && typeof item === "object" && item.id) return String(item.id);
      return `item-${index}`;
    },
    [getId],
  );
  const ids = useMemo(() => list.map((item, index) => resolveId(item, index)), [list, resolveId]);
  const sensors = useDndSensors();
  const [activeId, setActiveId] = useState(null);
  const [insertIndex, setInsertIndex] = useState(null);

  const activeIndex = activeId ? ids.indexOf(activeId) : -1;
  const activeItem = activeIndex >= 0 ? list[activeIndex] : null;

  const onDragStart = ({ active }) => {
    setActiveId(String(active.id));
    setInsertIndex(null);
  };

  const onDragOver = ({ active, over }) => {
    if (!over) {
      setInsertIndex(null);
      return;
    }
    setInsertIndex(resolveInsertIndex(active, over, list, resolveId));
  };

  const onDragEnd = ({ active, over }) => {
    setActiveId(null);
    setInsertIndex(null);
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = resolveInsertIndex(active, over, list, resolveId);
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;
    const clamped = Math.min(newIndex, list.length - 1);
    if (oldIndex === clamped) return;
    onChange(arrayMove(list, oldIndex, clamped));
  };

  const onDragCancel = () => {
    setActiveId(null);
    setInsertIndex(null);
  };

  if (list.length === 0) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {list.map((item, index) => (
            <SortableRow
              key={ids[index]}
              id={ids[index]}
              index={index}
              isDragging={activeId === ids[index]}
              insertBefore={insertIndex === index}
            >
              {(dnd) => renderItem(item, index, dnd)}
            </SortableRow>
          ))}
          {insertIndex === list.length ? <InsertionLine /> : null}
        </div>
      </SortableContext>
      <DragOverlay dropAnimation={{ duration: 180, easing: "ease-out" }}>
        {activeItem ? <GhostCard label={ghostLabel ? ghostLabel(activeItem, activeIndex) : `#${activeIndex + 1}`} compact /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function PaletteDraggableButton({ id, label, onClick }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { kind: "palette", blockType: id },
  });
  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onClick}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-left text-sm font-semibold text-gray-700 transition hover:border-kiwi-green hover:bg-kiwi-light-green/40 ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <Plus size={13} className="text-kiwi-green-dark" />
      {label}
    </button>
  );
}

function CanvasDropZone({ id, children, isEmpty }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`space-y-4 rounded-2xl transition ${isOver && isEmpty ? "bg-kiwi-light-green/20 ring-2 ring-kiwi-green/30" : ""}`}
    >
      {children}
    </div>
  );
}

function BlockSortableShell({ id, index, isDragging, insertBefore, children }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } = useSortable({
    id,
    data: { kind: "block", index },
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  };
  return (
    <>
      {insertBefore ? <InsertionLine /> : null}
      <div ref={setNodeRef} style={style}>
        {children({ setActivatorNodeRef, attributes, listeners })}
      </div>
    </>
  );
}

/**
 * Page-level block stream editor with palette drag-in and block reorder.
 */
export function BlockStreamDndEditor({
  blocks,
  setBlocks,
  paletteItems,
  getBlockId,
  makeBlock,
  renderBlock,
  emptyHint = "从左侧组件面板选择模块添加到正文，或拖入此处",
  paletteTitle = "组件面板",
}) {
  const list = Array.isArray(blocks) ? blocks : [];
  const resolveBlockId = useCallback(
    (block, index) => {
      if (getBlockId) return String(getBlockId(block, index));
      return String(block?.id || `${block?.type}-${index}`);
    },
    [getBlockId],
  );
  const blockIds = useMemo(() => list.map((block, index) => resolveBlockId(block, index)), [list, resolveBlockId]);
  const sensors = useDndSensors();
  const [activeDrag, setActiveDrag] = useState(null);
  const [insertIndex, setInsertIndex] = useState(null);

  const addToEnd = (blockType) => {
    setBlocks((prev) => [...(prev || []), makeBlock(blockType)]);
  };

  const onDragStart = ({ active }) => {
    const data = active.data.current || {};
    if (data.kind === "palette") {
      setActiveDrag({ kind: "palette", blockType: data.blockType, label: paletteItems.find((p) => p.type === data.blockType)?.label || data.blockType });
    } else {
      const index = blockIds.indexOf(String(active.id));
      const block = list[index];
      setActiveDrag({
        kind: "block",
        index,
        label: paletteItems.find((p) => p.type === block?.type)?.label || block?.type || `#${index + 1}`,
      });
    }
    setInsertIndex(null);
  };

  const onDragOver = ({ active, over }) => {
    if (!over) {
      setInsertIndex(null);
      return;
    }
    const overId = String(over.id);
    if (overId === "canvas-drop" || overId === "empty-canvas") {
      setInsertIndex(list.length);
      return;
    }
    const data = active.data.current || {};
    if (data.kind === "palette") {
      const overIndex = blockIds.indexOf(overId);
      setInsertIndex(overIndex < 0 ? list.length : overIndex);
      return;
    }
    const activeIndex = blockIds.indexOf(String(active.id));
    const overIndex = blockIds.indexOf(overId);
    if (overIndex < 0) {
      setInsertIndex(list.length);
      return;
    }
    setInsertIndex(activeIndex >= 0 && activeIndex < overIndex ? overIndex + 1 : overIndex);
  };

  const onDragEnd = ({ active, over }) => {
    const data = active.data.current || {};
    setActiveDrag(null);
    setInsertIndex(null);
    if (!over) return;

    if (data.kind === "palette") {
      const overId = String(over.id);
      let idx = list.length;
      if (overId !== "canvas-drop" && overId !== "empty-canvas") {
        const overIndex = blockIds.indexOf(overId);
        if (overIndex >= 0) idx = overIndex;
      }
      const newBlock = makeBlock(data.blockType);
      setBlocks((prev) => {
        const next = [...(prev || [])];
        next.splice(Math.min(Math.max(idx, 0), next.length), 0, newBlock);
        return next;
      });
      return;
    }

    const oldIndex = blockIds.indexOf(String(active.id));
    if (oldIndex < 0) return;
    const overId = String(over.id);
    let newIndex = blockIds.indexOf(overId);
    if (newIndex < 0) newIndex = list.length - 1;
    if (oldIndex < newIndex) newIndex -= 1;
    if (oldIndex === newIndex) return;
    setBlocks((prev) => arrayMove([...(prev || [])], oldIndex, newIndex));
  };

  const onDragCancel = () => {
    setActiveDrag(null);
    setInsertIndex(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">{paletteTitle}</p>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              {paletteItems.map((item) => (
                <PaletteDraggableButton
                  key={item.type}
                  id={item.type}
                  label={item.label}
                  onClick={() => addToEnd(item.type)}
                />
              ))}
            </div>
          </div>
        </aside>

        <CanvasDropZone id="canvas-drop" isEmpty={list.length === 0}>
          {list.length === 0 ? (
            <CanvasDropZone id="empty-canvas" isEmpty>
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-400">
                {emptyHint}
              </div>
            </CanvasDropZone>
          ) : null}

          <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
            {list.map((block, index) => (
              <BlockSortableShell
                key={blockIds[index]}
                id={blockIds[index]}
                index={index}
                isDragging={activeDrag?.kind === "block" && activeDrag.index === index}
                insertBefore={insertIndex === index}
              >
                {(dnd) => renderBlock(block, index, dnd, list.length)}
              </BlockSortableShell>
            ))}
          </SortableContext>
          {insertIndex === list.length && list.length > 0 ? <InsertionLine /> : null}
        </CanvasDropZone>
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: "ease-out" }}>
        {activeDrag ? <GhostCard label={activeDrag.label} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
