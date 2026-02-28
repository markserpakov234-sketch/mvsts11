import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  GraduationCap,
  Gamepad2,
  ClipboardList,
  Map,
  Settings,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

import AIHintBox from '../components/AIHintBox';
import Training from './support/Training';
import Games from './support/Games';
import Checklists from './support/Checklists';
import TerritoryMap from './support/TerritoryMap';

type Tab = 'ai' | 'training' | 'games' | 'checklists' | 'map';

export default function Support() {
  const [activeTab, setActiveTab] = useState<Tab>('ai');
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    console.log('USER ID:', user.id);
    console.log('ROLE DATA:', data);
    console.log('ROLE ERROR:', error);

    if (data?.role === 'admin') {
      setIsAdmin(true);
    }
  };

  const tabs = [
    { id: 'ai', label: 'ИИ', icon: Sparkles },
    { id: 'training', label: 'Знанания', icon: GraduationCap },
    { id: 'games', label: 'Игры', icon: Gamepad2 },
    { id: 'checklists', label: 'Чек', icon: ClipboardList },
    { id: 'map', label: 'Карта', icon: Map },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'training':
        return <Training />;
      case 'games':
        return <Games />;
      case 'checklists':
        return <Checklists />;
      case 'map':
        return <TerritoryMap />;
      default:
        return <AIHintBox />;
    }
  };

  return (
    <div className="relative px-6 py-10 max-w-6xl mx-auto overflow-hidden">
      {/* Admin button */}
      {isAdmin && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate('/admin/checklists')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl 
                       bg-gradient-to-r from-violet-600 to-lime-400 
                       text-black hover:opacity-90 transition shadow-lg"
          >
            <Settings size={16} />
            Редактор чек-листов
          </button>
        </div>
      )}

      {/* Glass panel */}
      <div className="relative z-10 backdrop-blur-3xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
        {/* TAB BAR */}
        <div className="relative flex w-full mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className="relative flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition text-white/60 hover:text-white"
              >
                <Icon size={16} />
                {tab.label}

                {isActive && (
                  <>
                    <motion.div
                      layoutId="activeGlow"
                      className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-violet-500 to-lime-400"
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                    />

                    <motion.div
                      layoutId="activeBackground"
                      className="absolute inset-0 rounded-xl bg-white/5"
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Animated content */}
        <div className="relative min-h-[420px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
              transition={{ duration: 0.35 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
