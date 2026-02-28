import { Home, Calendar, Users, BookOpen, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', icon: Home, label: 'Главная' },
  { to: '/day', icon: Calendar, label: 'День' },
  { to: '/city', icon: Users, label: 'Город' },
  { to: '/support', icon: BookOpen, label: 'Поддержка' },
  { to: '/profile', icon: User, label: 'Профиль' },
];

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
      <div className="relative rounded-2xl overflow-hidden shadow-xl">
        <div className="relative flex justify-between px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
          {tabs.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center flex-1 transition-all duration-200 ${
                  isActive ? 'text-lime-400 scale-105' : 'text-white/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[11px] mt-1">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
