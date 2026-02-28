import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Users,
  Flame,
  Zap,
  Theater,
  Heart,
  UserPlus,
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Game = {
  id: string;
  title: string;
  description: string;
  min_age: number;
  max_age: number;
  duration_min: number | null;
  category: { id: string; name: string } | null;
};

const categoryIcons: Record<string, any> = {
  Знакомство: UserPlus,
  Команда: Users,
  КТД: Theater,
  Взбодряки: Zap,
  Сплочение: Flame,
};

const ageOptions = [7, 9, 11, 13, 15];

export default function Games() {
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [ageFilter, setAgeFilter] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [openedId, setOpenedId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);

    const [catRes, gamesRes, favRes] = await Promise.all([
      supabase.from('game_categories').select('*').order('sort_order'),
      supabase
        .from('games')
        .select(
          `
          id,
          title,
          description,
          min_age,
          max_age,
          duration_min,
          category:game_categories(id, name)
        `
        )
        .eq('is_active', true),
      user
        ? supabase
            .from('favorite_games')
            .select('game_id')
            .eq('user_id', user.id)
        : Promise.resolve({ data: [] }),
    ]);

    setCategories(catRes.data || []);
    setGames(gamesRes.data || []);
    setFavorites(favRes.data?.map((f: any) => f.game_id) || []);

    setLoading(false);
  }

  async function toggleFavorite(gameId: string) {
    if (!user) return;

    const isFav = favorites.includes(gameId);

    // ⚡ оптимистичное обновление
    if (isFav) {
      setFavorites((prev) => prev.filter((id) => id !== gameId));

      await supabase
        .from('favorite_games')
        .delete()
        .eq('user_id', user.id)
        .eq('game_id', gameId);
    } else {
      setFavorites((prev) => [...prev, gameId]);

      await supabase.from('favorite_games').insert({
        user_id: user.id,
        game_id: gameId,
      });
    }
  }

  const filteredGames = useMemo(() => {
    return games
      .filter((g) =>
        activeCategory === 'favorites'
          ? favorites.includes(g.id)
          : activeCategory
          ? g.category?.id === activeCategory
          : true
      )
      .filter((g) =>
        ageFilter ? g.min_age <= ageFilter && g.max_age >= ageFilter : true
      )
      .filter((g) =>
        search ? g.title.toLowerCase().includes(search.toLowerCase()) : true
      );
  }, [games, activeCategory, ageFilter, favorites, search]);

  if (loading)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Загрузка...
      </div>
    );

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* blur фон */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-lime-500 opacity-20 blur-[140px] rounded-full" />
      <div className="absolute top-32 -right-40 w-[500px] h-[500px] bg-orange-500 opacity-20 blur-[140px] rounded-full" />
      <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-yellow-400 opacity-20 blur-[140px] rounded-full" />

      <div className="relative z-10 max-w-6xl mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-extrabold">Игровая библиотека</h1>

        {/* Поиск */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            placeholder="Поиск игры..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
          />
        </div>

        {/* Категории */}
        <div className="flex flex-wrap gap-3">
          {user && (
            <button
              onClick={() => setActiveCategory('favorites')}
              className={`px-4 py-2 rounded-2xl flex items-center gap-2 transition ${
                activeCategory === 'favorites'
                  ? 'bg-lime-400 text-black'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              <Heart size={18} />
              Избранное
            </button>
          )}

          {categories.map((cat) => {
            const Icon = categoryIcons[cat.name];
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl flex items-center gap-2 transition ${
                  activeCategory === cat.id
                    ? 'bg-orange-400 text-black'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                {Icon && <Icon size={18} />}
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Возраст */}
        <div className="flex gap-3 flex-wrap">
          {ageOptions.map((age) => (
            <button
              key={age}
              onClick={() => setAgeFilter(age)}
              className={`px-3 py-1 rounded-xl text-sm transition ${
                ageFilter === age
                  ? 'bg-yellow-400 text-black'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              {age}+
            </button>
          ))}

          <button
            onClick={() => setAgeFilter(null)}
            className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-sm"
          >
            Все
          </button>
        </div>

        {/* Карточки */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGames.map((game) => {
            const open = openedId === game.id;
            const fav = favorites.includes(game.id);

            return (
              <motion.div
                key={game.id}
                layout
                className="rounded-3xl bg-white/5 backdrop-blur-2xl p-6 border border-white/10"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg">{game.title}</h3>

                  {user && (
                    <button
                      onClick={() => toggleFavorite(game.id)}
                      className="text-gray-400 hover:text-lime-400 transition"
                    >
                      <Heart size={20} fill={fav ? 'currentColor' : 'none'} />
                    </button>
                  )}
                </div>

                <div className="text-sm text-lime-400 mt-2">
                  {game.category?.name}
                </div>

                {!open && (
                  <p className="mt-3 text-sm text-gray-400 line-clamp-3">
                    {game.description}
                  </p>
                )}

                <button
                  onClick={() => setOpenedId(open ? null : game.id)}
                  className="mt-3 text-sm text-orange-400"
                >
                  {open ? 'Скрыть' : 'Подробнее'}
                </button>

                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-gray-300 whitespace-pre-line mt-3">
                        {game.description}
                      </p>

                      <div className="mt-4 text-xs text-gray-500">
                        {game.min_age}-{game.max_age} лет
                        {game.duration_min && ` • ${game.duration_min} мин`}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
