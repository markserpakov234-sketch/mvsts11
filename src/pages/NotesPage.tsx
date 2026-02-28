import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Pencil, Clock } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  description: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
}

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

function isPast(note: Note) {
  const today = new Date(getTodayString());
  const noteDate = new Date(note.date);

  if (noteDate < today) return true;
  if (noteDate > today) return false;

  if (!note.end_time) return false;

  const now = new Date();
  const [h, m] = note.end_time.split(':').map(Number);
  const end = new Date(note.date);
  end.setHours(h);
  end.setMinutes(m);

  return now > end;
}

function isToday(note: Note) {
  return note.date === getTodayString();
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  async function load() {
    const { data } = await supabase
      .from('personal_notes')
      .select('*')
      .order('date', { ascending: false })
      .order('start_time', { ascending: true });

    setNotes(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveNote() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (!title.trim()) return;

    if (editing) {
      await supabase
        .from('personal_notes')
        .update({
          title,
          description: desc,
          date,
          start_time: startTime || null,
          end_time: endTime || null,
        })
        .eq('id', editing.id);
    } else {
      await supabase.from('personal_notes').insert({
        user_id: user.id,
        title,
        description: desc,
        date,
        start_time: startTime || null,
        end_time: endTime || null,
      });
    }

    resetForm();
    load();
  }

  async function deleteNote(id: string) {
    await supabase.from('personal_notes').delete().eq('id', id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  function openEdit(note: Note) {
    setEditing(note);
    setTitle(note.title);
    setDesc(note.description || '');
    setDate(note.date);
    setStartTime(note.start_time || '');
    setEndTime(note.end_time || '');
    setShowModal(true);
  }

  function resetForm() {
    setShowModal(false);
    setEditing(null);
    setTitle('');
    setDesc('');
    setDate(getTodayString());
    setStartTime('');
    setEndTime('');
  }

  return (
    <div className="p-5 pb-32 relative">
      {/* CREATE BUTTON */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full mb-6 bg-violet-500 text-white py-3 rounded-2xl flex justify-center gap-2"
      >
        <Plus size={18} />
        Создать заметку
      </button>

      {/* LIST */}
      <div className="space-y-4">
        <AnimatePresence>
          {notes.map((note) => {
            const past = isPast(note);
            const today = isToday(note);

            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className={`rounded-2xl p-4 border backdrop-blur-xl
                ${
                  past
                    ? 'bg-white/5 border-white/10 opacity-50'
                    : today
                    ? 'bg-violet-500/10 border-violet-400/30'
                    : 'bg-blue-500/10 border-blue-400/30'
                }`}
              >
                <div className="flex justify-between">
                  <div>
                    {/* DATE + TIME */}
                    <div className="text-xs opacity-60 flex items-center gap-2">
                      {note.date}
                      {note.start_time && (
                        <>
                          <Clock size={12} />
                          {note.start_time}
                          {note.end_time && ` – ${note.end_time}`}
                        </>
                      )}
                      {past && ' • прошло'}
                      {!past && today && ' • сегодня'}
                    </div>

                    {/* TITLE */}
                    <div className="font-semibold mt-1">{note.title}</div>

                    {/* DESC */}
                    {note.description && (
                      <div className="text-sm opacity-70 mt-2">
                        {note.description}
                      </div>
                    )}
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(note)}
                      className="opacity-60 hover:opacity-100"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => deleteNote(note.id)}
                      className="opacity-60 hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9 }}
              className="bg-black border border-white/10 p-6 rounded-3xl w-full max-w-sm space-y-4"
            >
              <div className="text-lg font-semibold">
                {editing ? 'Редактировать заметку' : 'Новая заметка'}
              </div>

              <input
                placeholder="Название"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2"
              />

              <textarea
                placeholder="Описание"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2"
              />

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2"
              />

              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2"
              />

              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2"
              />

              <button
                onClick={saveNote}
                className="w-full bg-violet-500 py-2 rounded-xl"
              >
                Сохранить
              </button>

              <button onClick={resetForm} className="w-full opacity-50 text-sm">
                Отмена
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
