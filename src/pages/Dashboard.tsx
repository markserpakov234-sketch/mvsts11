import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import QRCode from 'react-qr-code';
import {
  Bell,
  Clock,
  MapPin,
  ChevronRight,
  QrCode,
  CheckCircle2,
  Snowflake,
  Sun,
  Flame,
  Sprout,
  X,
  Crown,
  User,
} from 'lucide-react';

const SCHEDULE_URL =
  'https://script.google.com/macros/s/AKfycbwY7Ddk6Wahkcq4ZtED4sQ61mvQdr5EJ03GINAlRHNpDd9GgpqH8r5OCxu0tcTYUZbo9g/exec';

interface UserProfile {
  id: string;
  name: string | null;
  city_number: number | null;
  birthday: string | null;
  position: string | null;
  telegram_chat_id?: string | null;
  role?: string | null;
}

interface ScheduleItem {
  date: string;
  start: string;
  end: string;
  title: string;
  place: string;
  note: string;
}

interface Note {
  id: string;
  title: string;
  description: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [time, setTime] = useState(new Date());
  const [user, setUser] = useState<UserProfile | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [weather, setWeather] = useState<number | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [authEmail, setAuthEmail] = useState(null);

useEffect(() => {
  const getEmail = async () => {
    const { data } = await supabase.auth.getUser();
    setAuthEmail(data?.user?.email);
  };

  getEmail();
}, []);


  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user: supaUser },
      } = await supabase.auth.getUser();

      if (!supaUser) return;

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', supaUser.id)
        .single();

      setUser(data);
      setLoading(false);
    }

    loadProfile();
  }, []);

  useEffect(() => {
    async function loadWeather() {
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=45&longitude=37.28&current_weather=true'
        );
        const data = await res.json();
        setWeather(Math.round(data.current_weather.temperature));
      } catch {}
    }

    loadWeather();
  }, []);

  useEffect(() => {
    async function loadSchedule() {
      try {
        const cached = localStorage.getItem('schedule');
        if (cached) setSchedule(JSON.parse(cached));

        const res = await fetch(SCHEDULE_URL);
        const data = await res.json();

        setSchedule(data);
        localStorage.setItem('schedule', JSON.stringify(data));
      } catch {}
    }

    loadSchedule();
  }, []);

  useEffect(() => {
    async function loadNotes() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from('personal_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      setNotes(data || []);
    }

    loadNotes();
  }, []);

  const timeToMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const nowMin = time.getHours() * 60 + time.getMinutes();
  const today = time.toLocaleDateString('ru-RU');

  const todaySchedule = useMemo(
    () =>
      schedule.filter(
        (i) => new Date(i.date).toLocaleDateString('ru-RU') === today
      ),
    [schedule, today]
  );

  const current = todaySchedule.find(
    (i) => nowMin >= timeToMin(i.start) && nowMin <= timeToMin(i.end)
  );

  const next = todaySchedule
    .filter((i) => timeToMin(i.start) > nowMin)
    .sort((a, b) => timeToMin(a.start) - timeToMin(b.start))[0];

  let progress = 0;

  if (current) {
    const start = timeToMin(current.start);
    const end = timeToMin(current.end);
    progress = ((nowMin - start) / (end - start)) * 100;
  }

  function getGubernia(
    city: number | null,
    role?: string | null
  ) {
    // 👑 АДМИН = министерство
    if (role === 'admin') {
      return {
        name: 'Министерство',
        color: '#f97316',
        icon: <Crown size={18} />,
      };
    }
  
    // ❗ НЕТ ГОРОДА → просто человечек
    if (!city) {
      return {
        name: 'Без губернии',
        color: '#6b7280',
        icon: <User size={18} />,
      };
    }
  
    const last = city % 10;
  
    if ([1, 2].includes(last))
      return { name: 'Север', color: '#3b82f6', icon: <Snowflake size={18} /> };
  
    if ([3, 4].includes(last))
      return { name: 'Центр', color: '#ef4444', icon: <Flame size={18} /> };
  
    if ([5, 6].includes(last))
      return { name: 'Юг', color: '#22c55e', icon: <Sprout size={18} /> };
  
    if ([7, 8].includes(last))
      return { name: 'Солнце', color: '#eab308', icon: <Sun size={18} /> };
  
    return {
      name: 'Без губернии',
      color: '#6b7280',
      icon: <User size={18} />,
    };
  }
  const gubernia = getGubernia(
    user?.city_number ?? null,
    user?.role
  );

  const checklist = [
    {
      label: 'Укажи город',
      done: !!user?.city_number,
      action: () => navigate('/profile'),
    },
    {
      label: 'Укажи дату рождения',
      done: !!user?.birthday,
      action: () => navigate('/profile'),
    },
    {
      label: 'Укажи должность',
      done: !!user?.position,
      action: () => navigate('/profile'),
    },
  ];

  const hasUnfinished = checklist.some((i) => !i.done);

  function isActive(note: Note) {
    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const noteDate = new Date(note.date);

    if (noteDate > now) return true;
    if (noteDate < todayStart) return false;

    if (!note.end_time) return true;

    const [h, m] = note.end_time.split(':').map(Number);
    const end = new Date(note.date);
    end.setHours(h);
    end.setMinutes(m);

    return now <= end;
  }

  const activeNotes = notes.filter(isActive);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden pb-32">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-500/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 -right-32 w-96 h-96 bg-lime-500/20 blur-[120px] rounded-full" />

      <div className="px-5 pt-8 relative z-10">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-lg font-semibold tracking-wide text-orange-400">
              Республика Виталия
            </div>

            <div className="text-xl font-semibold mt-2 flex items-center gap-2">
              Привет,
              <span className="text-lime-400">{user?.name ?? 'Участник'}</span>
              {gubernia && (
                <span style={{ color: gubernia.color }}>{gubernia.icon}</span>
              )}
            </div>

            <div className="text-sm opacity-60 mt-1">
  {user?.role === 'admin'
    ? 'Министерство'
    : `Город ${user?.city_number ?? '—'}`} · {user?.position ?? '—'}
</div>

            <div className="mt-4 flex items-center gap-4">
              {weather !== null && (
                <div className="text-2xl font-bold bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
                  {weather}°C
                </div>
              )}
              <div className="text-sm opacity-70">Витязево</div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <Bell size={20} />
            <button onClick={() => setShowQR(true)}>
              <QrCode size={24} />
            </button>
          </div>
        </div>

        {/* CHECKLIST */}
        {hasUnfinished && (
          <div className="mb-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4">
            <div className="text-sm mb-3 opacity-70">
              Заверши настройку профиля
            </div>

            {checklist.map((item, i) => (
              <div
                key={i}
                onClick={() => !item.done && item.action?.()}
                className={`flex items-center justify-between gap-2 py-2 text-sm transition ${
                  item.done
                    ? 'opacity-40'
                    : 'hover:text-lime-400 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={16}
                    className={item.done ? 'text-lime-400' : 'text-white/20'}
                  />
                  {item.label}
                </div>

                {!item.done && (
                  <ChevronRight size={16} className="opacity-40" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* CURRENT */}
        {current && (
          <div className="mb-6 rounded-2xl bg-gradient-to-br from-orange-500/20 to-lime-500/20 border border-white/10 p-5 backdrop-blur-xl">
            <div className="text-xs opacity-60 mb-1">Сейчас проходит</div>
            <div className="text-lg font-semibold">{current.title}</div>

            <div className="flex items-center gap-2 text-sm opacity-70 mt-1">
              <Clock size={14} />
              {current.start} — {current.end}
            </div>

            <div className="flex items-center gap-2 text-sm opacity-70">
              <MapPin size={14} />
              {current.place}
            </div>

            {current.note && (
              <div className="text-sm opacity-60 mt-2">{current.note}</div>
            )}

            <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-lime-400 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* NEXT */}
        {next && (
          <div className="mb-6 rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-xl">
            <div className="text-xs opacity-60 mb-1">Далее</div>

            <div className="text-base font-semibold text-lime-400">
              {next.title}
            </div>

            <div className="flex items-center gap-2 text-sm opacity-70 mt-1">
              <Clock size={14} />
              {next.start} — {next.end}
            </div>

            <div className="flex items-center gap-2 text-sm opacity-70">
              <MapPin size={14} />
              {next.place}
            </div>

            {next.note && (
              <div className="text-sm opacity-60 mt-2">{next.note}</div>
            )}

            <div className="text-xs opacity-50 mt-2">
              Через {timeToMin(next.start) - nowMin} мин
            </div>
          </div>
        )}

        {/* NOTES */}
        {activeNotes.length > 0 && (
          <div className="mb-10">
            <div className="text-sm opacity-60 mb-3">Активные заметки</div>

            <div className="space-y-3">
              {activeNotes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-2xl p-4 border border-violet-400/20 
          bg-gradient-to-br from-violet-500/20 
          to-purple-600/20 backdrop-blur-xl"
                >
                  <div className="text-xs opacity-60">
                    {note.date}
                    {note.start_time && ` • ${note.start_time}`}
                    {note.end_time && ` – ${note.end_time}`}
                  </div>

                  <div className="font-semibold text-violet-300 mt-1">
                    {note.title}
                  </div>

                  {note.description && (
                    <div className="text-sm opacity-80 mt-2">
                      {note.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QR MODAL */}
{showQR && (
  <div
    className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50"
    onClick={() => setShowQR(false)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-sm rounded-3xl p-6 border border-white/10 bg-black"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-xl font-semibold">{user?.name}</div>
          <div className="text-sm opacity-60">
            Город {user?.city_number}
          </div>
          <div className="text-sm opacity-60">{user?.position}</div>
        </div>

        <button onClick={() => setShowQR(false)}>
          <X size={20} />
        </button>
      </div>

      <div className="flex justify-center mb-6">
        <QRCode
          value={JSON.stringify({
            id: user?.id,
            name: user?.name,
            city: user?.city_number,
            position: user?.position,
          })}
          size={220}
          bgColor="transparent"
          fgColor={gubernia?.color ?? '#84cc16'}
        />
      </div>

      <div className="text-center text-xs opacity-50">
  @{authEmail ? authEmail.split('@')[0] : ''}
</div>
        </div> 
        </div> 
        )} 
        </div> 
        </div> 
        );
       }