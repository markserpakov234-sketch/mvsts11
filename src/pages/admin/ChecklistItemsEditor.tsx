import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

function SortableItem({ item, onUpdate, onDelete, onToggleHidden }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [value, setValue] = useState(item.title);

  const save = async () => {
    await supabase
      .from('checklist_items')
      .update({ title: value })
      .eq('id', item.id);

    onUpdate();
  };

  const toggleHidden = async () => {
    await supabase
      .from('checklist_items')
      .update({ hidden: !item.hidden })
      .eq('id', item.id);

    onToggleHidden(item.id);
    onUpdate();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex items-center gap-3 p-3 rounded-xl border
      ${item.hidden ? 'bg-white/2 border-white/5 opacity-60' : 'bg-white/5 border-white/10'}`}
    >
      {/* drag */}
      <div {...listeners} className="cursor-grab text-white/40 hover:text-white">
        ☰
      </div>

      {/* текст */}
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        className="flex-1 bg-transparent outline-none text-white"
      />

      {/* индикатор скрыт */}
      {item.hidden && (
        <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
          скрыт
        </span>
      )}

      {/* скрыть / показать */}
      <button
        onClick={toggleHidden}
        className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20"
      >
        {item.hidden ? 'Показать' : 'Скрыть'}
      </button>

      {/* удалить */}
      <button
        onClick={() => onDelete(item.id)}
        className="text-red-400 hover:text-red-300"
      >
        ✕
      </button>
    </div>
  );
}

export default function ChecklistItemsEditor({
  checklistId,
  items,
  reload,
}: any) {

  const [localItems, setLocalItems] = useState(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = localItems.findIndex((i: any) => i.id === active.id);
      const newIndex = localItems.findIndex((i: any) => i.id === over.id);

      const newItems = arrayMove(localItems, oldIndex, newIndex);

      setLocalItems(newItems);

      for (let i = 0; i < newItems.length; i++) {
        await supabase
          .from('checklist_items')
          .update({ sort_order: i + 1 })
          .eq('id', newItems[i].id);
      }

      reload();
    }
  };

  const addItem = async () => {
    await supabase.from('checklist_items').insert({
      checklist_id: checklistId,
      title: 'Новый пункт',
      sort_order: localItems.length + 1,
    });

    reload();
  };

  const deleteItem = async (id: string) => {
    await supabase.from('checklist_items').delete().eq('id', id);
    reload();
  };

  const toggleHiddenLocal = (id: string) => {
    setLocalItems((prev: any) =>
      prev.map((i: any) =>
        i.id === id ? { ...i, hidden: !i.hidden } : i
      )
    );
  };

  return (
    <div className="space-y-3 pb-32">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localItems.map((i: any) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {localItems.map((item: any) => (
            <SortableItem
              key={item.id}
              item={item}
              onUpdate={reload}
              onDelete={deleteItem}
              onToggleHidden={toggleHiddenLocal}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* кнопка теперь не прячется */}
      <button
        onClick={addItem}
        className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 transition"
      >
        + Добавить пункт
      </button>
    </div>
  );
}