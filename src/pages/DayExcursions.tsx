import { useEffect, useMemo, useRef, useState } from 'react';
import { Clock, Bus, CheckCircle, XCircle } from 'lucide-react';

const API_URL =
  'https://script.google.com/macros/s/AKfycbwVrJY0yFWnt9mB376U9gXRmwa4nlRJpe9JS74_31IfIUrC_g8VUl_imuScD9ieKH4n/exec';

type ExcursionRow = {
  child_name: string;
  squad: string;
  food_block: string;
  event_title: string;
  date: string;
  start_time: string;
  meeting_offset_min: number;
};

type EventGroup = {
  eventTitle: string;
  squad: string;
  startTime: string;
  meetingTime: Date;
  startDateTime: Date;
  endDateTime: Date;
  children: string[];
};

/* 🔥 ГЛАВНЫЙ ФИКС — ВСЁ В МСК */
const MSK = 'Europe/Moscow';

function toMoscowDateString(date: Date | string) {
  return new Date(date).toLocaleDateString('sv-SE', {
    timeZone: MSK,
  });
}

/* 🔥 теперь вместо slice(0,10) */
function normalizeDateISO(dateString: string) {
  return toMoscowDateString(dateString);
}

/* 🔥 вместо локального getFullYear */
function formatLocalISO(d: Date) {
  return toMoscowDateString(d);
}

function normalizeTime(time: string) {
  return time.trim().slice(0, 5);
}

function buildDateTime(dateISO: string, time: string) {
  const [year, month, day] = dateISO.split('-').map(Number);
  const [h, m] = time.split(':').map(Number);

  return new Date(year, month - 1, day, h, m, 0);
}

function minutesDiff(target: Date) {
  return Math.ceil((target.getTime() - Date.now()) / 60000);
}

export default function DayExcursions({ date }: { date: Date }) {
  /* 🔥 ФИКС: selectedISO теперь в МСК */
  const selectedISO = formatLocalISO(date);
  const todayISO = formatLocalISO(new Date());
  const isToday = selectedISO === todayISO;

  const [rows, setRows] = useState<ExcursionRow[]>([]);
  const [city, setCity] = useState('ВСЕ');
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'soon' | 'going' | 'done'
  >('all');

  const currentRef = useRef<HTMLDivElement | null>(null);
  const [, forceTick] = useState(0);

  /* обновление каждую минуту */
  useEffect(() => {
    const t = setInterval(() => forceTick((v) => v + 1), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch(API_URL)
      .then((r) => r.json())
      .then((data: ExcursionRow[]) =>
        setRows(
          data.map((r) => ({ ...r, start_time: normalizeTime(r.start_time) }))
        )
      );
  }, []);

  /* группировка */
  const events = useMemo(() => {
    const map = new Map<string, EventGroup>();
    const cityNorm = city.trim().toLowerCase();

    rows
      .filter((r) => r.food_block === 'Вита')
      .filter((r) => normalizeDateISO(r.date) === selectedISO) // 🔥 ВОТ ТУТ БЫЛ БАГ
      .filter((r) => {
        const squadStr = String(r.squad ?? '').toLowerCase();
        return cityNorm === 'все' || squadStr.includes(cityNorm);
      })
      .forEach((r) => {
        const dateISO = normalizeDateISO(r.date);

        const start = buildDateTime(dateISO, r.start_time);
        const end = new Date(start.getTime() + 60 * 60000);
        const meeting = new Date(
          start.getTime() - (r.meeting_offset_min || 60) * 60000
        );

        const key = `${r.start_time}|${r.event_title}|${r.squad}`;

        if (!map.has(key)) {
          map.set(key, {
            eventTitle: r.event_title,
            squad: r.squad,
            startTime: r.start_time,
            startDateTime: start,
            endDateTime: end,
            meetingTime: meeting,
            children: [],
          });
        }

        map.get(key)!.children.push(r.child_name);
      });

    return Array.from(map.values()).sort(
      (a, b) => a.startDateTime.getTime() - b.startDateTime.getTime()
    );
  }, [rows, city, selectedISO]);

  /* фильтр по статусу */
  const filteredEvents = useMemo(() => {
    if (!isToday) {
      return statusFilter === 'all' ? events : [];
    }

    const now = Date.now();

    return events.filter((e) => {
      const isBefore = now < e.startDateTime.getTime();
      const isGoing =
        now >= e.startDateTime.getTime() && now <= e.endDateTime.getTime();
      const isDone = now > e.endDateTime.getTime();

      if (statusFilter === 'soon') return isBefore;
      if (statusFilter === 'going') return isGoing;
      if (statusFilter === 'done') return isDone;

      return true;
    });
  }, [events, statusFilter, isToday]);

  /* автоскролл */
  useEffect(() => {
    currentRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [filteredEvents]);

  let nextFound = false;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden pb-24">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-500/10 blur-[80px] rounded-full" />
      <div className="absolute bottom-0 -right-32 w-96 h-96 bg-violet-500/10 blur-[80px] rounded-full" />

      <div className="relative z-10 px-5 pt-6 space-y-6">
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-wide text-white/40">
            Поиск по городу
          </div>

          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Введите город или ВСЕ"
            className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-base
                       focus:outline-none focus:ring-1 focus:ring-violet-400/40
                       placeholder:text-white/40 transition-all"
          />
        </div>

        <div className="flex gap-2">
          {[
            { id: 'all', label: 'Все' },
            { id: 'soon', label: 'Впереди' },
            { id: 'going', label: 'Идёт' },
            { id: 'done', label: 'Завершено' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id as any)}
              className={`flex-1 rounded-2xl py-2 text-sm border transition-all ${
                statusFilter === s.id
                  ? 'bg-violet-500/20 border-violet-400/30 text-violet-300'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredEvents.map((e, idx) => {
            const now = Date.now();
            const start = e.startDateTime.getTime();
            const end = e.endDateTime.getTime();

            const isBefore = isToday && now < start;
            const isGoing = isToday && now >= start && now <= end;
            const isDone = isToday && now > end;

            const minsToStart = minutesDiff(e.startDateTime);

            const isNext = !isGoing && !nextFound && now < start;
            if (isNext) nextFound = true;

            let progress = 0;

            if (isBefore && minsToStart <= 60) {
              progress = Math.min(100, ((60 - minsToStart) / 60) * 100);
            }

            if (isGoing) {
              progress = ((now - start) / (end - start)) * 100;
            }

            return (
              <div
                key={idx}
                ref={isGoing || isNext ? currentRef : null}
                className={`rounded-2xl border backdrop-blur-xl p-5 bg-white/5 border-white/10
                  transition-all hover:bg-white/10
                  ${
                    isGoing
                      ? 'ring-1 ring-lime-400/40 shadow-lg shadow-lime-400/10'
                      : ''
                  }
                `}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-medium">
                        {e.startTime} · {e.eventTitle}
                      </p>
                      <p className="text-sm text-white/40">Город {e.squad}</p>
                    </div>

                    <Bus className="text-violet-300 opacity-70" />
                  </div>

                  <div className="space-y-2">
                    {e.children.map((child, index) => {
                      const key = `${e.eventTitle}-${e.startTime}-${child}-${index}`;
                      const present = attendance[key];

                      return (
                        <div
                          key={key}
                          className="flex justify-between items-center bg-white/5 rounded-xl px-3 py-2 text-sm"
                        >
                          <span>{child}</span>

                          <button
                            onClick={() =>
                              setAttendance((a) => ({
                                ...a,
                                [key]: !a[key],
                              }))
                            }
                            className={
                              present ? 'text-lime-400' : 'text-white/40'
                            }
                          >
                            {present ? (
                              <CheckCircle size={18} />
                            ) : (
                              <XCircle size={18} />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-sm flex items-center gap-2 text-white/60">
                    <Clock size={16} />
                    {isBefore && `Начало через ${minsToStart} мин`}
                    {isGoing && 'Экскурсия идёт'}
                    {isDone && 'Завершено'}
                  </div>

                  {(isBefore || isGoing) && (
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-400 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredEvents.length === 0 && (
            <div className="text-center text-white/40 text-sm py-10">
              Ничего не найдено
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
