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
  role?: string | null; // ✅ ДОБАВИЛИ
}

export default function Colleagues() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'name' | 'city'>('name');

  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const { data } = await supabase
      .from('users')
      .select('id, name, city_number, position, phone, role'); // ✅ ДОБАВИЛИ role

    if (data) setUsers(data);
  }

  /* ================= GUBERNIA ================= */

  function getGubernia(
    city: number | null,
    role?: string | null
  ) {
    // 👑 АДМИН
    if (role?.toLowerCase() === 'admin') {
      return {
        name: 'Министерство',
        color: '#f97316',
        icon: <Crown size={18} />,
      };
    }

    // ❗ НЕТ ГОРОДА → просто иконка
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

  /* ================= FILTER + SORT ================= */

  const filteredUsers = useMemo(() => {
    let list = [...users];

    if (search) {
      list = list.filter((u) =>
        (u.name || '').toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sort === 'name') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    if (sort === 'city') {
      list.sort((a, b) => (a.city_number || 0) - (b.city_number || 0));
    }

    return list;
  }, [users, search, sort]);

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

      {/* SEARCH + SORT */}
      <div className="flex gap-2 mb-4">
        <input
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2"
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="bg-white/5 border border-white/10 rounded-xl px-3"
        >
          <option value="name">Имя</option>
          <option value="city">Город</option>
        </select>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {filteredUsers.map((user) => {
          const gubernia = getGubernia(user.city_number, user.role);

          return (
            <div
              key={user.id}
              className="rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-xl flex items-center gap-3"
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
                  {user.role === 'admin'
                    ? 'Министерство'
                    : user.city_number
                    ? `Город ${user.city_number}`
                    : 'Город не указан'}{' '}

                  {gubernia?.name && user.role !== 'admin' && `· ${gubernia.name}`}
                </div>

                {/* 📞 PHONE */}
                {user.phone && (
                  <div className="text-xs mt-1 opacity-70">
                    {user.phone}
                  </div>
                )}
              </div>

              {/* 📞 CALL BUTTON */}
              {user.phone && (
                <a
                  href={`tel:${user.phone}`}
                  className="p-2 rounded-xl bg-lime-500/20 border border-lime-500/40 hover:bg-lime-500/30 transition"
                >
                  <Phone size={16} />
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}