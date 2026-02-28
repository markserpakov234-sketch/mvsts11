import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Navigate } from 'react-router-dom';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Result } from '@zxing/library';

interface User {
  id: string;
  name: string | null;
  role: string | null;
  email: string | null;
}

interface Movement {
  id: string;
  user_id: string;
  item_name: string;
  quantity: number;
  type: 'issue' | 'return';
  created_at: string;
}

export default function AdminInventory() {
  /* ============================= */
  /* ===== STATE ===== */
  /* ============================= */

  const [adminProfile, setAdminProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userIdInput, setUserIdInput] = useState('');
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loadingUser, setLoadingUser] = useState(false);

  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);

  const [scannerOpen, setScannerOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  /* ============================= */
  /* ===== DERIVED STATE ===== */
  /* ============================= */

  const balance = useMemo(() => {
    return movements.reduce<Record<string, number>>((acc, m) => {
      if (!acc[m.item_name]) acc[m.item_name] = 0;

      if (m.type === 'issue') acc[m.item_name] += m.quantity;
      if (m.type === 'return') acc[m.item_name] -= m.quantity;

      return acc;
    }, {});
  }, [movements]);

  /* ============================= */
  /* ===== Проверка роли ===== */
  /* ============================= */

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      setAdminProfile(data);
      setLoading(false);
    }

    checkAdmin();
  }, []);

  /* ============================= */
  /* ===== QR СКАНЕР ===== */
  /* ============================= */

  useEffect(() => {
    if (!scannerOpen) return;

    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    reader.decodeFromConstraints(
      { video: { facingMode: { ideal: 'environment' } } },
      videoRef.current!,
      async (result: Result | undefined) => {
        if (result) {
          const scannedValue = result.getText().trim();

          reader.reset();
          setScannerOpen(false);

          await openUserProfile(scannedValue);
        }
      }
    );

    return () => {
      reader.reset();
    };
  }, [scannerOpen]);

  /* ============================= */
  /* ===== Открытие профиля ===== */
  /* ============================= */

  async function openUserProfile(value?: string) {
    let query = (value || userIdInput).trim(); // ← меняем const на let
    if (!query) return;
  
    setLoadingUser(true);
    setSelectedUser(null);
    setMovements([]);
  
    // Проверяем UUID
    const isUUID = /^[0-9a-fA-F-]{36}$/.test(query);
  
    // Если нет @ и это не UUID → считаем коротким логином
    if (!query.includes('@') && !isUUID) {
      query = `${query}@tochka.app`;
    }
  
    setUserIdInput(query); // обновляем input уже после возможной подстановки
  
    let userData: User | null = null;
    // ================================
    // ЕСЛИ EMAIL → вызываем RPC
    // ================================
    if (query.includes('@')) {
      const { data, error } = await supabase
        .rpc('get_users_full', { search_email: query })
        .single();

      if (error || !data) {
        alert('Пользователь не найден');
        setLoadingUser(false);
        return;
      }

      userData = data;
    } else {
      // ================================
      // ЕСЛИ UUID
      // ================================
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', query)
        .single();

      if (error || !data) {
        alert('Пользователь не найден');
        setLoadingUser(false);
        return;
      }

      userData = data;
    }

    setSelectedUser(userData);

    const { data: movementData } = await supabase
      .from('inventory_movements')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false });

    if (movementData) {
      setMovements(movementData);
    }

    setLoadingUser(false);
  }

  /* ============================= */
  /* ===== Добавление движения ===== */
  /* ============================= */

  async function addMovement(type: 'issue' | 'return') {
    if (!selectedUser || !itemName || quantity <= 0) return;

    const current = balance[itemName] || 0;

    if (type === 'return' && quantity > current) {
      alert('Нельзя вернуть больше, чем выдано');
      return;
    }

    const { data, error } = await supabase
      .from('inventory_movements')
      .insert([
        {
          user_id: selectedUser.id,
          item_name: itemName,
          quantity,
          type,
        },
      ])
      .select()
      .single();

    if (error || !data) {
      alert('Ошибка сохранения');
      return;
    }

    setMovements((prev) => [data, ...prev]);
    setItemName('');
    setQuantity(1);
  }

  /* ============================= */
  /* ===== GUARDS ===== */
  /* ============================= */

  if (loading) {
    return <div className="text-white p-6">Загрузка...</div>;
  }

  if (adminProfile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  /* ============================= */
  /* ===== UI ===== */
  /* ============================= */

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      <div className="text-xl font-semibold text-lime-400">
        Админка · Инвентарь
      </div>

      <div className="bg-white/5 p-4 rounded-2xl space-y-3">
        <div>Поиск по ID или логину (email)</div>

        <input
          value={userIdInput}
          onChange={(e) => setUserIdInput(e.target.value)}
          className="w-full bg-white/10 p-2 rounded-xl"
          placeholder="Введите user_id или email"
        />

        <div className="flex gap-3">
          <button
            onClick={() => openUserProfile()}
            className="flex-1 bg-lime-500/20 border border-lime-500/40 px-4 py-2 rounded-xl"
          >
            Открыть профиль
          </button>

          <button
            onClick={() => setScannerOpen(true)}
            className="flex-1 bg-blue-500/20 border border-blue-500/40 px-4 py-2 rounded-xl"
          >
            📷 Сканировать
          </button>
        </div>

        {scannerOpen && (
          <div className="mt-3 space-y-3">
            <video
              ref={videoRef}
              className="w-full rounded-xl"
              style={{ aspectRatio: '1 / 1' }}
            />
            <button
              onClick={() => setScannerOpen(false)}
              className="w-full bg-red-500/20 border border-red-500/40 py-2 rounded-xl"
            >
              Закрыть сканер
            </button>
          </div>
        )}
      </div>

      {loadingUser && (
        <div className="text-white/50">Загрузка пользователя...</div>
      )}

      {selectedUser && (
        <>
          <div className="bg-white/5 p-4 rounded-2xl space-y-1">
            <div className="text-lg font-semibold">
              {selectedUser.name || 'Без имени'}
            </div>
            <div className="text-sm opacity-50">ID: {selectedUser.id}</div>
            <div className="text-sm opacity-50">
              Логин: {selectedUser.email}
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl space-y-2">
            <div className="font-semibold">Текущий инвентарь</div>

            {Object.entries(balance)
              .filter(([_, q]) => q > 0)
              .map(([name, q]) => (
                <div key={name} className="flex justify-between">
                  <span>{name}</span>
                  <span>{q}</span>
                </div>
              ))}

            {Object.keys(balance).length === 0 && (
              <div className="text-white/40">Инвентарь пуст</div>
            )}
          </div>

          <div className="bg-white/5 p-4 rounded-2xl space-y-3">
            <div className="font-semibold">Операция</div>

            <input
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full bg-white/10 p-2 rounded-xl"
              placeholder="Название предмета"
            />

            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full bg-white/10 p-2 rounded-xl"
            />

            <div className="flex gap-3">
              <button
                onClick={() => addMovement('issue')}
                className="flex-1 bg-blue-500/20 border border-blue-500/40 py-2 rounded-xl"
              >
                Выдать
              </button>

              <button
                onClick={() => addMovement('return')}
                className="flex-1 bg-orange-500/20 border border-orange-500/40 py-2 rounded-xl"
              >
                Вернуть
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
