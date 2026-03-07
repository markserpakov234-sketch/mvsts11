import { Outlet } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      <div className="flex-1 pb-20">
        <Outlet />
      </div>

      <BottomNav />
    </div>
  );
}