import { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';

type ChecklistItem = {
  id: string;
  text: string;
  completed_dates: string[];
};

type Checklist = {
  id: string;
  title: string;
  description: string;
  checklist_items: ChecklistItem[];
};

type Category = {
  id: string;
  title: string;
  subtitle: string;
  checklists: Checklist[];
};

export default function Checklists() {
  const today = new Date().toISOString().split('T')[0];

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [openLists, setOpenLists] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(today);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;
    setUser(user);

    // профиль
    const { data: profileData } = await supabase
      .from('users')
      .select('name, city_number')
      .eq('id', user.id)
      .single();

    setProfile(profileData);

    // 1️⃣ Загружаем структуру БЕЗ progress
    const { data: categoriesData } = await supabase.from('checklist_categories')
      .select(`
    id,
    title,
    subtitle,
    checklists (
      id,
      title,
      description,
      checklist_items (
        id,
        text
      )
    )
  `);

    if (!categoriesData) return;

    // 2️⃣ Загружаем прогресс отдельно
    const { data: progressData } = await supabase
      .from('user_checklist_progress')
      .select('checklist_item_id, completed_at')
      .eq('user_id', user.id);

    // 3️⃣ Собираем Map прогресса
    const progressMap = new Map<string, string[]>();

    progressData?.forEach((p) => {
      const date = p.completed_at.split('T')[0];

      if (!progressMap.has(p.checklist_item_id)) {
        progressMap.set(p.checklist_item_id, []);
      }

      progressMap.get(p.checklist_item_id)!.push(date);
    });

    // 4️⃣ Соединяем данные
    const processed = categoriesData.map((category) => ({
      ...category,
      checklists: category.checklists.map((list) => ({
        ...list,
        checklist_items: list.checklist_items.map((item) => ({
          id: item.id,
          text: item.text,
          completed_dates: progressMap.get(item.id) || [],
        })),
      })),
    }));

    setCategories(processed);
    setActiveTab(processed[0]?.id || null);
    setLoading(false);
  }

  // ⚡ OPTIMISTIC TOGGLE
  const toggleItem = useCallback(
    async (itemId: string, completed: boolean) => {
      if (!user) return;

      // мгновенное обновление UI
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          checklists: cat.checklists.map((list) => ({
            ...list,
            checklist_items: list.checklist_items.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    completed_dates: completed
                      ? item.completed_dates.filter((d) => d !== today)
                      : [...item.completed_dates, today],
                  }
                : item
            ),
          })),
        }))
      );

      // сервер в фоне
      // сервер
      if (completed) {
        const { error } = await supabase
          .from('user_checklist_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('checklist_item_id', itemId)
          .gte('completed_at', today)
          .lt('completed_at', today + 'T23:59:59');

        if (error) {
          console.error('DELETE ERROR:', error);
        }
      } else {
        const { error } = await supabase
          .from('user_checklist_progress')
          .insert({
            user_id: user.id,
            checklist_item_id: itemId,
            completed_at: new Date().toISOString(),
          });

        if (error) {
          console.error('INSERT ERROR:', error);
        }
      }
    },
    [user, today]
  );

  // ===== 7 ДНЕЙ =====
  const last7Days = useMemo(() => {
    const base = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() - 3 + i);
      return d;
    });
  }, []);

  // ===== КОЛИЧЕСТВО ЗАВЕРШЁННЫХ СПИСКОВ ПО ДНЯМ =====
  const completedMap = useMemo(() => {
    const map: Record<string, number> = {};

    last7Days.forEach((d) => {
      const iso = d.toISOString().split('T')[0];

      const count = categories
        .flatMap((c) => c.checklists)
        .filter((list) => {
          const done = list.checklist_items.filter((i) =>
            i.completed_dates.includes(iso)
          ).length;

          return done === list.checklist_items.length && done > 0;
        }).length;

      map[iso] = count;
    });

    return map;
  }, [categories, last7Days]);

  // ===== СПИСОК ЗА ВЫБРАННЫЙ ДЕНЬ =====
  const completedListsForSelectedDate = useMemo(() => {
    return categories
      .flatMap((cat) =>
        cat.checklists.map((list) => {
          const done = list.checklist_items.filter((i) =>
            i.completed_dates.includes(selectedDate)
          ).length;

          const total = list.checklist_items.length;

          return {
            ...list,
            categoryTitle: cat.title,
            done,
            total,
          };
        })
      )
      .filter((list) => list.done === list.total && list.total > 0);
  }, [categories, selectedDate]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Загрузка...
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* 👤 ШАПКА */}
      <div className="mb-8">
        <div className="text-xl font-bold">{profile?.name}</div>
        <div className="opacity-60 text-sm">Город № {profile?.city_number}</div>
      </div>

      <h1 className="text-3xl font-bold mb-6">Чеклисты</h1>

      {/* ТАБЫ */}
      <div className="flex gap-3 mb-8 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`px-4 py-2 rounded-xl ${
              activeTab === cat.id ? 'bg-lime-500 text-black' : 'bg-white/10'
            }`}
          >
            {cat.title}
          </button>
        ))}

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl ${
            activeTab === 'completed' ? 'bg-lime-500 text-black' : 'bg-white/10'
          }`}
        >
          🔥 Выполненные
        </button>
      </div>

      {/* COMPLETED */}
      {activeTab === 'completed' && (
        <div>
          {/* КАЛЕНДАРЬ */}
          <div className="flex justify-between mb-8">
            {last7Days.map((date) => {
              const iso = date.toISOString().split('T')[0];
              const isSelected = iso === selectedDate;

              return (
                <button
                  key={iso}
                  onClick={() => setSelectedDate(iso)}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="text-sm opacity-60">{date.getDate()}</div>

                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center relative transition ${
                      isSelected
                        ? 'bg-lime-500 text-black scale-110'
                        : 'bg-white/10'
                    }`}
                  >
                    <Flame size={18} />

                    {completedMap[iso] > 0 && (
                      <span className="absolute -top-1 -right-1 bg-lime-400 text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {completedMap[iso]}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* СПИСОК ЗА ВЫБРАННЫЙ ДЕНЬ */}
          <div className="space-y-4">
            {completedListsForSelectedDate.length === 0 && (
              <div className="opacity-50">
                В этот день нет полностью завершённых чеклистов
              </div>
            )}

            {completedListsForSelectedDate.map((list) => (
              <div
                key={list.id}
                className="p-5 rounded-2xl bg-lime-500/15 border border-lime-500/30"
              >
                <div className="text-xs opacity-60 mb-1">
                  {list.categoryTitle}
                </div>

                <div className="font-semibold mb-2">{list.title}</div>

                <div className="text-xs opacity-60 mb-3">
                  {list.done} / {list.total}
                </div>

                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-lime-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* КАТЕГОРИИ */}
      {categories.map((cat) =>
        activeTab === cat.id ? (
          <div key={cat.id}>
            {cat.checklists.map((list) => {
              const done = list.checklist_items.filter((i) =>
                i.completed_dates.includes(today)
              ).length;

              const progress = Math.round(
                (done / list.checklist_items.length) * 100
              );

              return (
                <div
                  key={list.id}
                  className="mb-6 border border-white/10 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setOpenLists((prev) =>
                        prev.includes(list.id)
                          ? prev.filter((l) => l !== list.id)
                          : [...prev, list.id]
                      )
                    }
                    className="w-full p-4 text-left bg-white/5"
                  >
                    <div className="flex justify-between mb-2">
                      <span>{list.title}</span>
                      <span className="text-xs opacity-60">{progress}%</span>
                    </div>

                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                        className="h-full bg-lime-500"
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {openLists.includes(list.id) && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-4 space-y-3"
                      >
                        {list.checklist_items.map((item) => {
                          const completed =
                            item.completed_dates.includes(today);

                          return (
                            <button
                              key={item.id}
                              onClick={() => toggleItem(item.id, completed)}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl ${
                                completed
                                  ? 'bg-lime-500/20 text-lime-400'
                                  : 'bg-white/5'
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded border ${
                                  completed
                                    ? 'bg-lime-500 border-lime-500'
                                    : 'border-white/40'
                                }`}
                              />
                              {item.text}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ) : null
      )}
    </div>
  );
}
