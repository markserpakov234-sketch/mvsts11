import {
  Home,
  Calendar,
  Users,
  Gamepad2,
  CheckSquare,
  MoreHorizontal,
  User,
  Globe,
  BookOpen
} from 'lucide-react'

import { NavLink, Link } from 'react-router-dom'
import { useState } from 'react'

const tabs = [
  { to: '/', icon: Home, label: 'Главная' },
  { to: '/day', icon: Calendar, label: 'День' },
  { to: '/city', icon: Users, label: 'Город' },
  { to: '/games', icon: Gamepad2, label: 'Игры' },
  { to: '/checklist', icon: CheckSquare, label: 'Чеклист' },
]

export default function BottomNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Нижний бар */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
        <div className="relative rounded-2xl overflow-hidden shadow-xl">
          <div
            className="relative flex justify-between px-2 py-3 backdrop-blur-xl rounded-2xl transition-colors duration-300"
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              color: 'var(--text)',
            }}
          >
            {tabs.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                style={({ isActive }) => ({
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.2s',
                  color: isActive ? '#84cc16' : 'var(--text)',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                })}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={20} stroke="currentColor" strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-[11px] mt-1">{label}</span>
                  </>
                )}
              </NavLink>
            ))}

            {/* Кнопка Ещё */}
            <button
              onClick={() => setOpen(true)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text)' }}
            >
              <MoreHorizontal size={20} stroke="currentColor" />
              <span className="text-[11px] mt-1">Ещё</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 flex items-end transition-all duration-300 ${
          open ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        style={{ backgroundColor: open ? 'rgba(0,0,0,0.4)' : 'transparent' }}
        onClick={() => setOpen(false)}
      >
        {/* Всплывающее меню */}
        <div
          className="w-full rounded-t-3xl p-6 space-y-4 transform transition-transform duration-300"
          style={{
            backgroundColor: 'var(--menu-bg)',
            border: '1px solid var(--card-border)',
            color: 'var(--text)',
            transform: open ? 'translateY(0)' : 'translateY(100%)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ручка */}
          <div
            className="w-10 h-1 rounded-full mx-auto mb-4 transition-colors duration-300"
            style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
          />

          {/* Элементы меню */}
          {[
            { to: '/profile', label: 'Профиль', Icon: User },
            { to: '/support/TerritoryMap', label: 'Карта', Icon: Globe },
            { to: '/support/Training', label: 'Обучение', Icon: BookOpen },
          ].map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 p-4 rounded-xl transition-colors duration-300"
              style={{
                backgroundColor: 'var(--menu-bg)',
                color: 'var(--text)',
              }}
              onClick={() => setOpen(false)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--menu-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--menu-bg)'}
            >
              <Icon size={20} stroke="currentColor" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}