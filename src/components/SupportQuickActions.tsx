import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function SupportQuickActions() {
  const navigate = useNavigate();

  const items = [
    { label: 'Обучение', path: '/support/training' },
    { label: 'Игротека', path: '/support/games' },
    { label: 'Чек-листы', path: '/support/checklists' },
    { label: 'Карта территории', path: '/support/map' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4">
      {items.map((item) => (
        <div
          key={item.path}
          onClick={() => navigate(item.path)}
          className="rounded-2xl p-5 border border-white/10 
                     bg-gradient-to-br from-white/5 to-white/10 
                     backdrop-blur-xl 
                     hover:from-orange-500/20 hover:to-lime-500/20 
                     transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">{item.label}</div>

            <ChevronRight className="opacity-50" />
          </div>
        </div>
      ))}
    </div>
  );
}
