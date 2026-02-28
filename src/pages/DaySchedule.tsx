import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Clock, MapPin, Info, Star, Plus, X, Trash2 } from 'lucide-react';

/* ===================== ТИПЫ ===================== */

interface ScheduleItem {
  date: string;
  start: string;
  end: string;
  title: string;
  place: string;
  note?: string;
}

interface PersonalNote {
  id: string;
  user_id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  title: string;
  description: string | null;
}

type CombinedItem = {
  id?: string;
  type: 'official' | 'personal';
  date: string;
  start: string;
  end?: string | null;
  title: string;
  place?: string;
  note?: string | null;
};

/* ===================== API ===================== */

const SCHEDULE_API =
  'https://script.google.com/macros/s/AKfycbwY7Ddk6Wahkcq4ZtED4sQ61mvQdr5EJ03GINAlRHNpDd9GgpqH8r5OCxu0tcTYUZbo9g/exec';

const CACHE_KEY = 'schedule_cache_v2';

/* ===================== HELPERS ===================== */

function timeToMinutes(t?: string | null) {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

const MSK = 'Europe/Moscow';

function formatShortDate(d: Date | string) {
  return new Date(d).toLocaleDateString('sv-SE', {
    timeZone: MSK,
  });
}

function formatCountdown(diff: number) {
  if (diff <= 0) return 'начинается';

  const h = Math.floor(diff / 60);
  const m = diff % 60;

  if (h > 0) return `через ${h} ч ${m.toString().padStart(2, '0')} мин`;
  return `через ${m} мин`;
}

/* ===================== COMPONENT ===================== */

interface Props {
  date: Date;
}

export default function DaySchedule({ date }: Props) {
  const selectedDate = formatShortDate(date);
  const today = formatShortDate(new Date());
  const isToday = selectedDate === today;

  const [official, setOfficial] = useState<ScheduleItem[]>([]);
  const [personal, setPersonal] = useState<PersonalNote[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const currentRef = useRef<HTMLDivElement | null>(null);

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  /* ===================== ЗАГРУЗКА GOOGLE ===================== */

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);

    if (cached) {
      setOfficial(JSON.parse(cached));
      setLoading(false);
    }

    fetch(SCHEDULE_API)
      .then((r) => r.json())
      .then((data: ScheduleItem[]) => {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        setOfficial(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* ===================== ЗАГРУЗКА ЗАМЕТОК ===================== */

  useEffect(() => {
    async function loadNotes() {
      const { data } = await supabase
        .from('personal_notes')
        .select('*')
        .eq('date', selectedDate)
        .order('start_time', { ascending: true });

      setPersonal(data || []);
    }

    loadNotes();
  }, [selectedDate]);

  /* ===================== ОБЪЕДИНЕНИЕ ===================== */

  const merged: CombinedItem[] = useMemo(() => {
    const officialFiltered = official
      .filter((i) => formatShortDate(new Date(i.date)) === selectedDate)
      .map((i) => ({
        type: 'official' as const,
        date: i.date,
        start: i.start,
        end: i.end,
        title: i.title,
        place: i.place,
        note: i.note,
      }));

    const personalMapped = personal.map((n) => ({
      id: n.id,
      type: 'personal' as const,
      date: n.date,
      start: n.start_time || '00:00',
      end: n.end_time,
      title: n.title,
      note: n.description,
    }));

    return [...officialFiltered, ...personalMapped].sort(
      (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start)
    );
  }, [official, personal, selectedDate]);

  /* ===================== СКРОЛЛ ===================== */

  useEffect(() => {
    currentRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [merged]);

  /* ===================== ДОБАВЛЕНИЕ ===================== */

  async function addNote() {
    if (!newTitle) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from('personal_notes').insert({
      user_id: user.id,
      date: selectedDate,
      start_time: newStart || null,
      end_time: newEnd || null,
      title: newTitle,
      description: newDesc,
    });

    setShowModal(false);
    setNewTitle('');
    setNewStart('');
    setNewEnd('');
    setNewDesc('');

    const { data } = await supabase
      .from('personal_notes')
      .select('*')
      .eq('date', selectedDate)
      .order('start_time', { ascending: true });

    setPersonal(data || []);
  }

  async function deleteNote(id: string) {
    await supabase.from('personal_notes').delete().eq('id', id);

    setPersonal((prev) => prev.filter((n) => n.id !== id));
  }

  /* ===================== RENDER ===================== */

  let nextFound = false;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden pb-32">
      {/* blur */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-500/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 -right-32 w-96 h-96 bg-violet-500/20 blur-[120px] rounded-full"></div>

      <div className="relative z-10 px-5 pt-6 space-y-6">
        <button
          onClick={() => setShowModal(true)}
          className="w-full rounded-2xl bg-violet-500/20 border border-violet-400/30 p-4 flex items-center justify-center gap-2 text-violet-300"
        >
          <Plus size={16} />
          Добавить заметку
        </button>

        {loading && (
          <div className="opacity-50 text-sm">Загружаю расписание…</div>
        )}

        {!loading &&
          merged.map((item, i) => {
            const start = timeToMinutes(item.start);
            const end = timeToMinutes(item.end);
            const isCurrent =
              isToday && currentMinutes >= start && currentMinutes <= end;

            const isNext =
              isToday && !isCurrent && !nextFound && currentMinutes < start;

            if (isNext) nextFound = true;

            const diff = start - currentMinutes;

            const progress =
              isNext && diff <= 60
                ? Math.min(100, ((60 - diff) / 60) * 100)
                : isCurrent
                ? ((currentMinutes - start) / (end - start)) * 100
                : 0;

            return (
              <div
                key={i}
                ref={isCurrent ? currentRef : null}
                className={`
                rounded-2xl border backdrop-blur-xl p-4 transition
                ${
                  item.type === 'personal'
                    ? 'bg-violet-500/10 border-violet-400/30'
                    : 'bg-white/5 border-white/10'
                }
              `}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 text-xs opacity-60">
                      <Clock size={14} />
                      {item.start}
                      {item.end && ` – ${item.end}`}
                    </div>

                    <div className="mt-1 text-base font-semibold flex items-center gap-2">
                      {item.type === 'personal' && (
                        <Star size={14} className="text-violet-400" />
                      )}
                      {item.title}
                    </div>

                    {item.place && (
                      <div className="flex items-center gap-2 text-sm opacity-60 mt-1">
                        <MapPin size={14} />
                        {item.place}
                      </div>
                    )}

                    {item.note && (
                      <div className="flex items-start gap-2 text-xs mt-3 bg-white/5 rounded-xl px-3 py-2">
                        <Info size={14} />
                        {item.note}
                      </div>
                    )}
                  </div>

                  {item.type === 'personal' && item.id && (
                    <button
                      onClick={() => deleteNote(item.id!)}
                      className="opacity-50 hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {(isNext || isCurrent) && (
                  <>
                    <div className="mt-3 text-xs opacity-60">
                      {isNext && `Начнётся ${formatCountdown(diff)}`}
                      {isCurrent && 'Идёт сейчас'}
                    </div>

                    <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          item.type === 'personal'
                            ? 'bg-gradient-to-r from-violet-400 to-purple-500'
                            : 'bg-lime-400'
                        }`}
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            );
          })}
      </div>

      {/* ===================== MODAL ===================== */}

      {showModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl p-6 border border-white/10 bg-black space-y-4"
          >
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold">Новая заметка</div>
              <button onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <input
              placeholder="Название"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
            />

            <input
              type="time"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
            />

            <input
              type="time"
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
            />

            <textarea
              placeholder="Описание"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
            />

            <button
              onClick={addNote}
              className="w-full bg-violet-500 text-white rounded-xl py-2"
            >
              Сохранить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
