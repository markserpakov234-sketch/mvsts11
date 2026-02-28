import { Outlet } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function Layout() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1 pb-20">
        <Outlet />
      </div>

      <BottomNav />
    </div>
  );
}
