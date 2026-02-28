import { useMemo, useState } from 'react';
import DaySchedule from './DaySchedule';
import DayExcursions from './DayExcursions';
import NotesPage from './NotesPage';
import { CalendarDays, Map, Notebook } from 'lucide-react';

type Tab = 'schedule' | 'excursions' | 'notes';

const MSK_TIMEZONE = 'Europe/Moscow';

/**
 * Получает текущую дату строго по Москве
 */
function getMoscowDate(offsetDays: number = 0): Date {
  const now = new Date();

  const moscowString = now.toLocaleString('en-US', {
    timeZone: MSK_TIMEZONE,
  });

  const moscowDate = new Date(moscowString);
  moscowDate.setDate(moscowDate.getDate() + offsetDays);

  return moscowDate;
}

/**
 * Формат для кнопок Сегодня / Завтра
 */
function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    timeZone: MSK_TIMEZONE,
  });
}

export default function Day() {
  const [activeTab, setActiveTab] = useState<Tab>('schedule');

  // 🔥 Получаем даты строго по МСК
  const today = useMemo(() => getMoscowDate(0), []);
  const tomorrow = useMemo(() => getMoscowDate(1), []);

  const [selectedDate, setSelectedDate] = useState<Date>(today);

  /**
   * Сравнение дат строго по Москве
   */
  function isSameMoscowDay(a: Date, b: Date): boolean {
    const aStr = a.toLocaleDateString('sv-SE', {
      timeZone: MSK_TIMEZONE,
    });

    const bStr = b.toLocaleDateString('sv-SE', {
      timeZone: MSK_TIMEZONE,
    });

    return aStr === bStr;
  }

  const isToday = isSameMoscowDay(selectedDate, today);
  const isTomorrow = isSameMoscowDay(selectedDate, tomorrow);

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* ===== HEADER ===== */}
      <div className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-black/80 border-b border-white/10">
        {/* ===== TABS ===== */}
        <div className="flex justify-around py-3 text-sm">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-1 transition-all ${
              activeTab === 'schedule'
                ? 'text-violet-400'
                : 'opacity-50 hover:opacity-100'
            }`}
          >
            <CalendarDays size={16} />
            План дня
          </button>

          <button
            onClick={() => setActiveTab('excursions')}
            className={`flex items-center gap-1 transition-all ${
              activeTab === 'excursions'
                ? 'text-violet-400'
                : 'opacity-50 hover:opacity-100'
            }`}
          >
            <Map size={16} />
            Экскурсии
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-1 transition-all ${
              activeTab === 'notes'
                ? 'text-violet-400'
                : 'opacity-50 hover:opacity-100'
            }`}
          >
            <Notebook size={16} />
            Заметки
          </button>
        </div>

        {/* ===== DAY SWITCHER ===== */}
        <div className="flex justify-center gap-4 pb-4">
          <button
            onClick={() => setSelectedDate(today)}
            className={`px-4 py-2 rounded-xl text-sm transition-all ${
              isToday
                ? 'bg-violet-500/20 text-violet-300 border border-violet-400/30'
                : 'bg-white/5 border border-white/10 opacity-60 hover:opacity-100'
            }`}
          >
            Сегодня · {formatDateLabel(today)}
          </button>

          <button
            onClick={() => setSelectedDate(tomorrow)}
            className={`px-4 py-2 rounded-xl text-sm transition-all ${
              isTomorrow
                ? 'bg-violet-500/20 text-violet-300 border border-violet-400/30'
                : 'bg-white/5 border border-white/10 opacity-60 hover:opacity-100'
            }`}
          >
            Завтра · {formatDateLabel(tomorrow)}
          </button>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="pt-32">
        {activeTab === 'schedule' && <DaySchedule date={selectedDate} />}
        {activeTab === 'excursions' && <DayExcursions date={selectedDate} />}
        {activeTab === 'notes' && <NotesPage />}
      </div>
    </div>
  );
}
