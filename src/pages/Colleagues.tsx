import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  ChevronLeft,
  Snowflake,
  Sun,
  Flame,
  Sprout,
  Crown,
  Phone,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string | null;
  city_number: number | null;
  position: string | null;
  phone?: string | null;
  role?: string | null;
}

export default function Colleagues() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'name' | 'city'>('name');
  const [guberniaFilter, setGuberniaFilter] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const { data } = await supabase
      .from('users')
      .select('id, name, city_number, position, phone, role');

    if (data) setUsers(data);
  }

  /* ================= GUBERNIA ================= */

  function getGubernia(city: number | null, role?: string | null) {
    if (role?.toLowerCase() === 'admin') {
      return {
        name: 'Министерство',
        color: '#f97316',
        icon: <Crown size={18} />,
      };
    }

    if (!city) {
      return {
        name: null,
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

    return null;
  }

  /* ================= GUBERNIA LIST ================= */

  const GUBERNIAS = [
    { key: 'Север', color: '#3b82f6', icon: <Snowflake size={14} /> },
    { key: 'Центр', color: '#ef4444', icon: <Flame size={14} /> },
    { key: 'Юг', color: '#22c55e', icon: <Sprout size={14} /> },
    { key: 'Солнце', color: '#eab308', icon: <Sun size={14} /> },
    { key: 'Министерство', color: '#f97316', icon: <Crown size={14} /> },
  ];

  /* ================= FILTER + SORT ================= */

  const filteredUsers = useMemo(() => {
    let list = [...users];

    // ✅ только с телефоном
    list = list.filter((u) => u.phone && u.phone.trim() !== '');

    if (search) {
      list = list.filter((u) =>
        (u.name || '').toLowerCase().includes(search.toLowerCase())
      );
    }

    if (guberniaFilter) {
      list = list.filter((u) => {
        const g = getGubernia(u.city_number, u.role);
        return g?.name === guberniaFilter;
      });
    }

    if (sort === 'name') {
      list = [...list].sort((a, b) =>
        (a.name || '').localeCompare(b.name || '')
      );
    }

    if (sort === 'city') {
      list = [...list].sort(
        (a, b) => (a.city_number || 0) - (b.city_number || 0)
      );
    }

    return list;
  }, [users, search, sort, guberniaFilter]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-5">
      
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <ChevronLeft
          className="cursor-pointer"
          onClick={() => navigate(-1)}
        />
        <div className="text-xl font-semibold">Коллеги</div>
      </div>

      {/* SEARCH */}
      <div className="mb-3">
        <input
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
        />
      </div>

      {/* SORT CHIPS */}
      <div className="flex gap-2 mb-3">
        {['name', 'city'].map((type) => (
          <button
            key={type}
            onClick={() => setSort(type as any)}
            className={`px-3 py-1 rounded-full text-sm ${
              sort === type
                ? 'bg-white/20'
                : 'bg-white/5 border border-white/10'
            }`}
          >
            {type === 'name' ? 'По имени' : 'По городу'}
          </button>
        ))}
      </div>

      {/* GUBERNIA FILTER */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
        <button
          onClick={() => setGuberniaFilter(null)}
          className={`px-3 py-1 rounded-full text-sm ${
            !guberniaFilter
              ? 'bg-white/20'
              : 'bg-white/5 border border-white/10'
          }`}
        >
          Все
        </button>

        {GUBERNIAS.map((g) => (
          <button
            key={g.key}
            onClick={() =>
              setGuberniaFilter((prev) =>
                prev === g.key ? null : g.key
              )
            }
            className="px-3 py-1 rounded-full text-sm flex items-center gap-1"
            style={{
              background:
                guberniaFilter === g.key
                  ? `${g.color}30`
                  : 'rgba(255,255,255,0.05)',
              border: `1px solid ${g.color}40`,
              color: g.color,
            }}
          >
            {g.icon}
            {g.key}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {filteredUsers.map((user) => {
          const gubernia = getGubernia(user.city_number, user.role);
          const isAdmin = user.role?.toLowerCase() === 'admin';

          return (
            <div
              key={user.id}
              onClick={() => navigate(`/colleagues/${user.id}`)}
              className="cursor-pointer rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-xl flex items-center gap-3"
            >
              {/* ICON */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: gubernia
                    ? `${gubernia.color}20`
                    : 'rgba(255,255,255,0.05)',
                  color: gubernia?.color,
                }}
              >
                {gubernia?.icon}
              </div>

              {/* INFO */}
              <div className="flex-1">
                <div className="font-medium">
                  {user.name || 'Без имени'}
                </div>

                <div className="text-sm opacity-60">
                  {user.position || 'Без должности'}
                </div>

                <div className="text-xs opacity-40">
                  {isAdmin
                    ? 'Министерство'
                    : user.city_number
                    ? `Город ${user.city_number}`
                    : 'Город не указан'}{' '}
                  {gubernia?.name && !isAdmin && `· ${gubernia.name}`}
                </div>

                <div className="text-xs mt-1 opacity-70">
                  {user.phone}
                </div>
              </div>

              {/* CALL */}
              <a
                href={`tel:${user.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-xl bg-lime-500/20 border border-lime-500/40 hover:bg-lime-500/30 transition"
              >
                <Phone size={16} />
              </a>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="text-center opacity-50 mt-10">
            Никого не найдено
          </div>
        )}
      </div>
    </div>
  );
}