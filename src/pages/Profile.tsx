import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Snowflake,
  Sun,
  Flame,
  Sprout,
  Users,
  Package,
  Shield,
  LogOut,
  Pencil,
  ChevronRight,
  X,
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string | null;
  city_number: number | null;
  birthday: string | null;
  position: string | null;
  role?: string | null;
  active_shift?: string | null;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    city_number: '',
    birthday: '',
    position: 'Вожатый',
  });

  /* ================= LOAD PROFILE ================= */

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data);
        setForm({
          name: data.name || '',
          city_number: data.city_number?.toString() || '',
          birthday: data.birthday || '',
          position: data.position || 'Вожатый',
        });
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  /* ================= GUBERNIA ================= */

  function getGubernia(city: number | null) {
    if (!city) return null;
    const last = city % 10;

    if ([1, 2].includes(last))
      return { name: 'Север', color: '#3b82f6', icon: <Snowflake size={28} /> };

    if ([3, 4].includes(last))
      return { name: 'Центр', color: '#ef4444', icon: <Flame size={28} /> };

    if ([5, 6].includes(last))
      return { name: 'Юг', color: '#22c55e', icon: <Sprout size={28} /> };

    if ([7, 8].includes(last))
      return { name: 'Солнце', color: '#eab308', icon: <Sun size={28} /> };

    return null;
  }

  const gubernia = useMemo(
    () => getGubernia(profile?.city_number ?? null),
    [profile]
  );

  const role = profile?.role || 'user';
  const position = profile?.position || 'Вожатый';

  /* ================= SAVE ================= */

  async function saveProfile() {
    if (!profile) return;

    await supabase
      .from('users')
      .update({
        name: form.name,
        city_number: Number(form.city_number),
        birthday: form.birthday,
        position: form.position || 'Вожатый',
      })
      .eq('id', profile.id);

    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', profile.id)
      .single();

    setProfile(data);
    setShowEdit(false);
  }

  /* ================= LOGOUT ================= */

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden pb-32">
      {/* Blur фон */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-500/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 -right-32 w-96 h-96 bg-lime-500/20 blur-[120px] rounded-full"></div>

      <div className="px-5 pt-8 relative z-10">
        <div className="text-lg font-semibold tracking-wide text-orange-400 mb-6">
          Профиль
        </div>

        {/* PROFILE CARD */}
        <div className="rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl mb-6">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: gubernia
                  ? `${gubernia.color}20`
                  : 'rgba(255,255,255,0.05)',
                color: gubernia?.color,
              }}
            >
              {gubernia?.icon}
            </div>

            <div className="flex-1">
              <div className="text-xl font-semibold">
                {profile?.name || 'Участник'}
              </div>

              <div className="text-sm opacity-60">{position}</div>

              <div className="text-xs opacity-40 mt-1">
                Город {profile?.city_number ?? '—'} · {gubernia?.name}
              </div>

              {profile?.active_shift && (
                <div
                  className="mt-3 inline-block px-3 py-1 text-xs rounded-full border"
                  style={{
                    borderColor: gubernia?.color,
                    color: gubernia?.color,
                  }}
                >
                  {profile.active_shift}
                </div>
              )}
            </div>

            <Pencil
              size={18}
              className="opacity-50 cursor-pointer hover:opacity-100"
              onClick={() => setShowEdit(true)}
            />
          </div>
        </div>

        {/* MENU */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-xl cursor-pointer hover:bg-white/10 transition flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Users size={18} />
              Коллеги
            </div>
            <ChevronRight size={18} />
          </div>

          <div
            onClick={() => navigate('/inventory')}
            className="rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-xl cursor-pointer hover:bg-white/10 active:scale-95 transition flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <Package size={18} />
              Инвентарь
            </div>
            <ChevronRight size={18} />
          </div>

          {role === 'admin' && (
            <div
              onClick={() => navigate('/admin')}
              className="rounded-2xl bg-white/5 border border-lime-500/40 p-4 backdrop-blur-xl cursor-pointer hover:bg-white/10 transition flex justify-between items-center"
            >
              <div className="flex items-center gap-3 text-lime-400">
                <Shield size={18} />
                Админка
              </div>
              <ChevronRight size={18} />
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full mt-6 rounded-2xl bg-red-500/20 border border-red-500/40 p-4 backdrop-blur-xl hover:bg-red-500/30 transition flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Выйти
          </button>
        </div>
      </div>

      {/* EDIT MODAL */}
      {showEdit && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50"
          onClick={() => setShowEdit(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl p-6 border border-white/10 bg-black"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="text-lg font-semibold">
                Редактирование профиля
              </div>
              <X size={18} onClick={() => setShowEdit(false)} />
            </div>

            <div className="space-y-4">
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3"
                placeholder="Имя"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3"
                placeholder="Номер города"
                value={form.city_number}
                onChange={(e) =>
                  setForm({ ...form, city_number: e.target.value })
                }
              />

              <input
                type="date"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3"
                value={form.birthday}
                onChange={(e) => setForm({ ...form, birthday: e.target.value })}
              />

              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3"
                placeholder="Должность"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />

              <button
                onClick={saveProfile}
                className="w-full mt-4 rounded-2xl bg-lime-500/20 border border-lime-500/40 p-3 hover:bg-lime-500/30 transition"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
