import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout/Layout';
import AuthGate from './guards/AuthGate';

import Auth from './pages/Auth';
import Intro from './pages/Intro';
import Dashboard from './pages/Dashboard';
import Day from './pages/Day';
import City from './pages/City';
import Support from './pages/Support';
import Profile from './pages/Profile';
import DayExcursions from './pages/DayExcursions';
import AdminInventory from './pages/AdminInventory';
import AdminChecklists from './pages/admin/AdminChecklists';
import Inventory from './pages/Inventory';

// SUPPORT PAGES
import Training from './pages/support/Training';
import Games from './pages/support/Games';
import Checklists from './pages/support/Checklists';
import TerritoryMap from './pages/support/TerritoryMap';

export default function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/intro" element={<Intro />} />

      {/* PROTECTED ROUTES */}
      <Route
        path="/"
        element={
          <AuthGate>
            <Layout />
          </AuthGate>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="day" element={<Day />} />
        <Route path="city" element={<City />} />

        {/* NEW MAIN NAV PAGES */}
        <Route path="games" element={<Games />} />
        <Route path="checklist" element={<Checklists />} />
        <Route path="support/map" element={<TerritoryMap />} />
        <Route path="support/training" element={<Training />} />

        {/* MAIN PAGES */}
        <Route path="profile" element={<Profile />} />
        <Route path="excursions" element={<DayExcursions />} />
        <Route path="inventory" element={<Inventory />} />

        {/* ADMIN SECTION */}
        <Route path="admin">
          <Route index element={<Navigate to="inventory" replace />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="checklists" element={<AdminChecklists />} />
        </Route>
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}