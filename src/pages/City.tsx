import { useEffect, useMemo, useState } from 'react';
import { Search, Users, X, Download, RefreshCw } from 'lucide-react';

const CITY_URL =
  'https://script.google.com/macros/s/AKfycbzryiUvfJZsTooiwc34O_K3EEWKngiRtw2m47BAS9jcRvsWsoSt8xu1eHsYiezYh8VP/exec';

const FLOORS = {
  1: [11, 12, 13, 14],
  2: [21, 22, 23, 24, 25, 26],
  3: [31, 32, 33, 34, 35, 36],
  4: [41, 42, 43, 44, 45, 46],
};

interface Child {
  city: string | number;
  number: number;
  name: string;
  birth: string;
  gender: string;
  room: string;
}

export default function City() {
  // ===== PIN =====
  const CORRECT_PIN = '0426';
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  // ===== ОСНОВНЫЕ STATE =====
  const [data, setData] = useState<Child[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<number>(11);

  // ===== PIN EFFECTS =====
  useEffect(() => {
    const unlocked = sessionStorage.getItem('city_unlocked');
    if (unlocked === 'true') {
      setIsUnlocked(true);
    }
  }, []);

  useEffect(() => {
    if (isUnlocked) {
      sessionStorage.setItem('city_unlocked', 'true');
    }
  }, [isUnlocked]);

  const handlePinClick = (digit: string) => {
    if (pin.length >= 4) return;

    const newPin = pin + digit;
    setPin(newPin);

    if (newPin.length === 4) {
      if (newPin === CORRECT_PIN) {
        setTimeout(() => setIsUnlocked(true), 200);
      } else {
        setTimeout(() => setPin(''), 400);
      }
    }
  };

  const removeLastDigit = () => {
    setPin(pin.slice(0, -1));
  };

  // ===== формат даты =====
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('ru-RU');
  };

  // ===== загрузка =====
  const loadData = async (force = false) => {
    try {
      setLoading(true);
      setSearch('');

      const cacheKey = `city_${selectedCity}`;

      if (!force) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          setData(JSON.parse(cached));
          setLoading(false);
          return;
        }
      }

      const res = await fetch(
        `${CITY_URL}?city=${selectedCity}&t=${Date.now()}`
      );

      const json = await res.json();

      const cleaned = json.filter((item: Child) => {
        if (!item.name) return false;
        if (item.name === '#N/A') return false;
        if (!item.room) return false;
        return true;
      });

      setData(cleaned);
      localStorage.setItem(cacheKey, JSON.stringify(cleaned));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      loadData();
    }
  }, [selectedCity, isUnlocked]);

  // ===== ручное обновление =====
  const refreshData = () => {
    const cacheKey = `city_${selectedCity}`;
    localStorage.removeItem(cacheKey);
    loadData(true);
  };

  // ===== поиск =====
  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return data.filter((item) => item.name.toLowerCase().includes(s));
  }, [data, search]);

  // ===== группировка по комнатам =====
  const groupedByRoom = useMemo(() => {
    const groups: Record<string, Child[]> = {};

    filtered.forEach((child) => {
      if (!groups[child.room]) {
        groups[child.room] = [];
      }
      groups[child.room].push(child);
    });

    return Object.entries(groups).sort((a, b) => Number(a[0]) - Number(b[0]));
  }, [filtered]);

  // ===== экспорт =====
  const exportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Город ${selectedCity}</title>
          <style>
            body { font-family: Arial; padding: 30px; }
            h1 { margin-bottom: 20px; }
            h2 { margin-top: 25px; }
            .child { margin-left: 15px; margin-bottom: 4px; }
          </style>
        </head>
        <body>
          <h1>Город ${selectedCity}</h1>
          ${groupedByRoom
            .map(
              ([room, children]) => `
                <h2>Комната ${room}</h2>
                ${children
                  .map(
                    (child) =>
                      `<div class="child">
                        ${child.name} (${formatDate(child.birth)}, ${
                        child.gender || '-'
                      })
                      </div>`
                  )
                  .join('')}
              `
            )
            .join('')}
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-black text-white pb-32 px-5 pt-8">
      {!isUnlocked ? (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-lg font-semibold text-lime-400 mb-2">
            Закрытый раздел
          </div>
          <div className="text-sm opacity-60 mb-10">Введите код смены</div>

          <div className="flex gap-4 mb-10">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full ${
                  pin.length > i ? 'bg-lime-400' : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button
                key={n}
                onClick={() => handlePinClick(String(n))}
                className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 transition text-lg"
              >
                {n}
              </button>
            ))}

            <div />
            <button
              onClick={() => handlePinClick('0')}
              className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 transition text-lg"
            >
              0
            </button>
            <button
              onClick={removeLastDigit}
              className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 transition text-sm"
            >
              ⌫
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* HEADER */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <div className="text-lg font-semibold text-lime-400">
                Лагерная доска расселения
              </div>
              <div className="text-sm opacity-60 mt-1 flex items-center gap-2">
                <Users size={14} />
                Город {selectedCity} · {filtered.length} человек
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={refreshData}
                className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-sm"
              >
                <RefreshCw size={16} />
                Обновить
              </button>

              <button
                onClick={exportPDF}
                className="flex items-center gap-2 bg-lime-400 text-black px-4 py-2 rounded-xl text-sm"
              >
                <Download size={16} />
                PDF
              </button>
            </div>
          </div>

          {/* ЭТАЖИ */}
          {Object.entries(FLOORS).map(([floor, cities]) => (
            <div key={floor} className="mb-4">
              <div className="text-xs opacity-50 mb-2">Этаж {floor}</div>
              <div className="flex gap-2 flex-wrap">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-3 py-1 rounded-lg text-sm border ${
                      selectedCity === city
                        ? 'bg-lime-400 text-black border-lime-400'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* SEARCH */}
          <div className="mb-6 mt-6 bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-3">
            <Search size={18} className="opacity-50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по ФИО..."
              className="bg-transparent outline-none w-full text-sm"
            />
            {search && (
              <button onClick={() => setSearch('')}>
                <X size={16} />
              </button>
            )}
          </div>

          {/* LIST */}
          {loading ? (
            <div className="text-center opacity-40 mt-10">Загрузка...</div>
          ) : (
            <div className="space-y-6">
              {groupedByRoom.map(([room, children]) => (
                <div key={room}>
                  <div className="text-sm text-lime-400 mb-2">
                    Комната {room}
                  </div>

                  <div className="space-y-2">
                    {children.map((child, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-xl bg-white/5 border border-white/10"
                      >
                        <div className="font-medium">{child.name}</div>
                        <div className="text-xs opacity-60">
                          {formatDate(child.birth)} · {child.gender || '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="text-center opacity-40">Ничего не найдено</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
