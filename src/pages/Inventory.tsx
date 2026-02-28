import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Movement {
  id: string;
  item_name: string;
  quantity: number;
  type: 'issue' | 'return';
  created_at: string;
}

export default function Inventory() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInventory() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('inventory_movements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setMovements(data);
      }

      setLoading(false);
    }

    loadInventory();
  }, []);

  const balance = useMemo(() => {
    return movements.reduce<Record<string, number>>((acc, m) => {
      if (!acc[m.item_name]) acc[m.item_name] = 0;

      if (m.type === 'issue') acc[m.item_name] += m.quantity;
      if (m.type === 'return') acc[m.item_name] -= m.quantity;

      return acc;
    }, {});
  }, [movements]);

  const positiveItems = Object.entries(balance).filter(([_, q]) => q > 0);

  if (loading) {
    return <div className="text-white p-6">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      <div className="text-xl font-semibold text-lime-400">Мой инвентарь</div>

      <div className="bg-white/5 p-4 rounded-2xl space-y-2">
        {positiveItems.length === 0 && (
          <div className="text-white/40">Инвентарь пуст</div>
        )}

        {positiveItems.map(([name, quantity]) => (
          <div key={name} className="flex justify-between">
            <span>{name}</span>
            <span>{quantity}</span>
          </div>
        ))}
      </div>

      <div className="bg-white/5 p-4 rounded-2xl space-y-2">
        <div className="font-semibold">История</div>

        {movements.map((m) => (
          <div key={m.id} className="flex justify-between text-sm opacity-70">
            <span>
              {m.type === 'issue' ? 'Выдано' : 'Возврат'} · {m.item_name}
            </span>
            <span>{m.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
