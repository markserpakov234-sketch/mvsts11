import { useState, useRef, useEffect } from 'react';
import mapImage from '../../assets/vita_big_map.svg';
import { campPoints } from '../../data/campPoints';

import {
  Flame,
  Home,
  Dumbbell,
  Utensils,
  Hospital,
  DoorOpen,
  Palette,
  Settings,
  Search,
} from 'lucide-react';

import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export default function TerritoryMap() {
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const wrapperRef = useRef<any>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // ================= ICONS =================

  const getIcon = (type: string) => {
    switch (type) {
      case 'republic':
        return Home;
      case 'gubernia':
        return Flame;
      case 'building':
        return Home;
      case 'sport':
        return Dumbbell;
      case 'food':
        return Utensils;
      case 'medical':
        return Hospital;
      case 'gate':
        return DoorOpen;
      case 'mk':
        return Palette;
      default:
        return Settings;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'republic':
        return 'text-orange-400';
      case 'gubernia':
        return 'text-yellow-300';
      case 'building':
        return 'text-lime-400';
      case 'sport':
        return 'text-violet-400';
      case 'food':
        return 'text-orange-300';
      case 'medical':
        return 'text-red-400';
      case 'gate':
        return 'text-emerald-400';
      case 'mk':
        return 'text-fuchsia-400';
      default:
        return 'text-gray-300';
    }
  };

  // ================= SEARCH =================

  const filtered = campPoints.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filtered.length > 0) {
      focusPoint(filtered[0]);
      setSearch('');
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ================= FOCUS =================

  const focusPoint = (point: any) => {
    if (!wrapperRef.current) return;

    const scale = window.innerWidth < 768 ? 1.6 : 2.2;

    const x = point.x / 100;
    const y = point.y / 100;

    const container = wrapperRef.current.instance.wrapperComponent;

    const width = container.offsetWidth;
    const height = container.offsetHeight;

    const newX = -width * x * scale + width / 2;
    const newY = -height * y * scale + height / 2;

    wrapperRef.current.setTransform(newX, newY, scale, 500, 'easeOut');

    setActiveId(point.id);

    // Авто-сброс пульса через 2 секунды
    setTimeout(() => {
      setActiveId(null);
    }, 2000);
  };

  // ================= RENDER =================

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col items-center px-4 py-4">
      {/* SEARCH */}
      <div ref={searchRef} className="w-full max-w-[600px] relative mb-4">
        <Search className="absolute left-4 top-3 text-gray-400" size={18} />

        <input
          type="text"
          placeholder="Поиск объекта..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
        />

        {showDropdown && search && (
          <div className="absolute top-full mt-2 w-full bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl max-h-64 overflow-y-auto z-50">
            {filtered.slice(0, 8).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  focusPoint(item);
                  setSearch('');
                  setShowDropdown(false);
                }}
                className="px-4 py-3 hover:bg-white/10 cursor-pointer transition"
              >
                {item.title}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MAP */}
      <div className="w-full max-w-[1400px] h-[70vh] border border-white/10 rounded-2xl overflow-hidden bg-neutral-900">
        <TransformWrapper
          ref={wrapperRef}
          minScale={0.6}
          maxScale={6}
          wheel={{ step: 0.1 }}
          doubleClick={{ disabled: true }}
        >
          <TransformComponent>
            <div className="relative">
              <img
                src={mapImage}
                alt="Карта"
                className="w-full h-auto block select-none pointer-events-none"
              />

              {campPoints.map((point) => {
                const Icon = getIcon(point.type);
                const isActive = activeId === point.id;

                return (
                  <div
                    key={point.id}
                    onClick={() => focusPoint(point)}
                    className="absolute -translate-x-1/2 -translate-y-full cursor-pointer group"
                    style={{
                      left: `${point.x}%`,
                      top: `${point.y}%`,
                    }}
                  >
                    {/* PULSE RING */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-full animate-ping bg-orange-400 opacity-40" />
                    )}

                    {/* MARKER */}
                    <div
                      className={`
                        relative flex items-center justify-center
                        w-4 h-4
                        rounded-full
                        bg-black/80
                        border border-white/20
                        shadow-lg
                        transition
                        ${isActive ? 'scale-125 ring-2 ring-orange-400' : ''}
                        group-hover:scale-110
                      `}
                    >
                      <Icon size={6} className={`${getColor(point.type)}`} />
                    </div>

                    {/* TOOLTIP */}
                    <div
                      className="
                        absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                        opacity-0 group-hover:opacity-100
                        transition
                        pointer-events-none
                        bg-black/80
                        border border-white/20
                        text-xs
                        px-3 py-1 rounded-lg
                        whitespace-nowrap
                      "
                    >
                      {point.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  );
}
