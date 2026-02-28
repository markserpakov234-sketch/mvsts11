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
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

function SortableItem({ item, onUpdate, onDelete }: any) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
    >
      <div
        {...listeners}
        className="cursor-grab text-white/40 hover:text-white"
      >
        ☰
      </div>

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        className="flex-1 bg-transparent outline-none text-white"
      />

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

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = localItems.findIndex((i: any) => i.id === active.id);
      const newIndex = localItems.findIndex((i: any) => i.id === over.id);

      const newItems = arrayMove(localItems, oldIndex, newIndex);
      setLocalItems(newItems);

      // обновляем порядок в БД
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

  return (
    <div className="space-y-3">
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
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        onClick={addItem}
        className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-500 transition"
      >
        + Добавить пункт
      </button>
    </div>
  );
}
