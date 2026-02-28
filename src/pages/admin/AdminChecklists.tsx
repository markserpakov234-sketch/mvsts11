import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Pencil, Trash2, Plus, X } from 'lucide-react';

type Category = {
  id: string;
  title: string;
  subtitle: string;
};

type ChecklistItem = {
  id?: string;
  text: string;
  sort_order: number;
};

type Checklist = {
  id: string; // slug
  uuid: string; // PRIMARY KEY
  title: string;
  description: string | null;
  category_id: string | null;
  sort_order: number | null;
  checklist_items: ChecklistItem[];
};

export default function AdminChecklists() {
  const [lists, setLists] = useState<Checklist[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Checklist | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    sort_order: 0,
    items: [] as ChecklistItem[],
  });

  // ================= LOAD =================

  const load = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('checklists')
      .select(
        `
        id,
        uuid,
        title,
        description,
        category_id,
        sort_order,
        checklist_items (
          id,
          text,
          sort_order
        )
      `
      )
      .order('sort_order');

    if (error) {
      console.error(error);
      alert(error.message);
    }

    const { data: catData } = await supabase
      .from('checklist_categories')
      .select('id,title,subtitle')
      .order('sort_order');

    setLists((data as Checklist[]) || []);
    setCategories(catData || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // ================= OPEN MODAL =================

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: '',
      description: '',
      category_id: '',
      sort_order: 0,
      items: [],
    });
    setIsOpen(true);
  };

  const openEdit = (list: Checklist) => {
    setEditing(list);
    setForm({
      title: list.title,
      description: list.description || '',
      category_id: list.category_id || '',
      sort_order: list.sort_order || 0,
      items: list.checklist_items || [],
    });
    setIsOpen(true);
  };

  // ================= SAVE =================

  const save = async () => {
    if (!form.title.trim()) {
      alert('Введите название');
      return;
    }

    if (form.items.some((i) => !i.text.trim())) {
      alert('Заполните все пункты');
      return;
    }

    try {
      let checklistUuid: string | undefined = editing?.uuid;

      // ===== CREATE =====
      if (!editing) {
        const { data, error } = await supabase
          .from('checklists')
          .insert({
            title: form.title.trim(),
            description: form.description || null,
            category_id: form.category_id || null,
            sort_order: form.sort_order ?? 0,
          })
          .select()
          .single();

        if (error) {
          alert(error.message);
          return;
        }

        checklistUuid = data?.uuid;

        if (!checklistUuid) {
          alert('UUID не получен после создания');
          return;
        }
      }

      // ===== UPDATE =====
      else {
        const { data, error } = await supabase
          .from('checklists')
          .update({
            title: form.title.trim(),
            description: form.description || null,
            category_id: form.category_id || null,
            sort_order: form.sort_order ?? 0,
          })
          .eq('uuid', editing.uuid)
          .select()
          .single();

        if (error) {
          alert(error.message);
          return;
        }

        if (!data) {
          alert('Чеклист не обновлён');
          return;
        }

        checklistUuid = data.uuid;

        // удаляем старые пункты
        const { error: deleteError } = await supabase
          .from('checklist_items')
          .delete()
          .eq('checklist_uuid', checklistUuid);

        if (deleteError) {
          alert(deleteError.message);
          return;
        }
      }

      // ===== SAVE ITEMS =====
      if (checklistUuid && form.items.length > 0) {
        const { error } = await supabase.from('checklist_items').insert(
          form.items.map((item, index) => ({
            checklist_uuid: checklistUuid,
            text: item.text.trim(),
            sort_order: index,
          }))
        );

        if (error) {
          alert(error.message);
          return;
        }
      }

      setIsOpen(false);
      setEditing(null);
      await load();
    } catch (err: any) {
      alert(err.message || 'Ошибка сохранения');
    }
  };

  // ================= DELETE =================

  const remove = async (uuid: string) => {
    if (!confirm('Удалить чеклист?')) return;
    await supabase.from('checklists').delete().eq('uuid', uuid);
    load();
  };

  if (loading)
    return <div style={{ padding: 40, color: 'white' }}>Загрузка...</div>;

  return (
    <div style={wrapper}>
      <div style={blurGreen} />
      <div style={blurOrange} />

      <button onClick={openCreate} style={btnPrimary}>
        <Plus size={18} /> Новый чеклист
      </button>

      <div style={{ marginTop: 40 }}>
        {lists.map((list) => (
          <div key={list.uuid} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <h3>{list.title}</h3>
                <p style={{ opacity: 0.6 }}>{list.description}</p>
                <small>
                  Категория:{' '}
                  {categories.find((c) => c.id === list.category_id)?.title ||
                    '—'}
                </small>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button style={iconBtn} onClick={() => openEdit(list)}>
                  <Pencil size={18} />
                </button>
                <button style={iconBtnDanger} onClick={() => remove(list.uuid)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isOpen && (
        <div style={modal}>
          <div style={modalContent}>
            <h2>{editing ? 'Редактирование' : 'Создание'}</h2>

            <input
              placeholder="Название"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={input}
            />

            <textarea
              placeholder="Описание"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              style={input}
            />

            <select
              value={form.category_id}
              onChange={(e) =>
                setForm({ ...form, category_id: e.target.value })
              }
              style={{ ...input, backgroundColor: '#111', color: 'white' }}
            >
              <option value="">Выберите категорию</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>

            <h4>Пункты</h4>

            {form.items.map((item, index) => (
              <div key={item.id ?? index} style={{ display: 'flex', gap: 10 }}>
                <input
                  value={item.text}
                  onChange={(e) => {
                    const updated = [...form.items];
                    updated[index].text = e.target.value;
                    setForm({ ...form, items: updated });
                  }}
                  style={input}
                />
                <button
                  style={iconBtnDanger}
                  onClick={() =>
                    setForm({
                      ...form,
                      items: form.items.filter((_, i) => i !== index),
                    })
                  }
                >
                  <X size={16} />
                </button>
              </div>
            ))}

            <button
              style={btnSecondary}
              onClick={() =>
                setForm({
                  ...form,
                  items: [...form.items, { text: '', sort_order: 0 }],
                })
              }
            >
              <Plus size={16} /> Добавить пункт
            </button>

            <div style={{ marginTop: 20 }}>
              <button onClick={save} style={btnPrimary}>
                Сохранить
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{ ...btnSecondary, marginLeft: 10 }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================= STYLES =================

const wrapper = {
  minHeight: '100vh',
  background: '#050505',
  padding: 40,
  color: 'white',
  position: 'relative' as const,
  overflow: 'hidden',
  zIndex: 1,
};

const blurGreen = {
  position: 'absolute' as const,
  width: 400,
  height: 400,
  background: '#a3ff12',
  filter: 'blur(200px)',
  top: -100,
  left: -100,
  opacity: 0.4,
  pointerEvents: 'none' as const, // ✅ не блокирует клики
  zIndex: 0,
};

const blurOrange = {
  position: 'absolute' as const,
  width: 400,
  height: 400,
  background: '#ff7a00',
  filter: 'blur(200px)',
  bottom: -100,
  right: -100,
  opacity: 0.3,
  pointerEvents: 'none' as const, // ✅ не блокирует клики
  zIndex: 0,
};

const card = {
  position: 'relative' as const,
  zIndex: 2,
  backdropFilter: 'blur(20px)',
  background: 'rgba(255,255,255,0.05)',
  padding: 20,
  borderRadius: 16,
  marginBottom: 20,
  border: '1px solid rgba(255,255,255,0.1)',
};

const modal = {
  position: 'fixed' as const,
  inset: 0,
  background: 'rgba(0,0,0,0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000, // ✅ всегда поверх всего
};

const modalContent = {
  background: 'rgba(20,20,20,0.95)',
  backdropFilter: 'blur(30px)',
  padding: 30,
  borderRadius: 20,
  width: 500,
};

const input = {
  width: '100%',
  padding: 10,
  marginBottom: 10,
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.05)',
  color: 'white',
};

const btnPrimary = {
  padding: '10px 16px',
  background: '#b4ff00',
  color: '#000',
  border: 'none',
  borderRadius: 10,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  fontWeight: 600,
  position: 'relative' as const,
  zIndex: 2,
};

const btnSecondary = {
  padding: '10px 16px',
  background: '#222',
  color: 'white',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  position: 'relative' as const,
  zIndex: 2,
};

const iconBtn = {
  background: '#222',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: 8,
  borderRadius: 8,
  cursor: 'pointer',
  color: 'white',
};

const iconBtnDanger = {
  ...iconBtn,
  background: '#ff7a0020',
  color: '#ff7a00',
};

const title = {
  fontSize: 28,
  marginBottom: 20,
};
