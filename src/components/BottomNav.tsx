import React from 'react';
import { Home, Map, PlusCircle, Store, User } from 'lucide-react';
import { AppTab } from '../types';

interface BottomNavProps {
  activeTab: AppTab;
  onChangeTab: (tab: AppTab) => void;
  pendingAbuseCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  pendingAbuseCount = 0,
}) => {
  const tabs: { id: AppTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'accueil', label: 'Accueil', icon: Home },
    { id: 'carte', label: 'Carte', icon: Map },
    { id: 'signaler', label: 'Signaler', icon: PlusCircle },
    { id: 'commerces', label: 'Commerces', icon: Store },
    { id: 'profil', label: 'Profil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const isSignaler = tab.id === 'signaler';

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className="relative flex flex-col items-center justify-center min-h-[48px] min-w-[48px] text-center transition-colors group focus:outline-none"
              aria-label={tab.label}
            >
              {isSignaler ? (
                <div className="flex flex-col items-center -mt-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-700 text-amber-300 flex items-center justify-center shadow-md group-active:scale-95 transition-transform border-2 border-white">
                    <Icon className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <span className={`text-[11px] font-bold mt-0.5 ${isActive ? 'text-emerald-800' : 'text-slate-600'}`}>
                    {tab.label}
                  </span>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Icon
                      className={`w-5 h-5 transition-transform group-active:scale-95 ${
                        isActive ? 'text-emerald-800 stroke-[2.5]' : 'text-slate-500'
                      }`}
                    />
                    {tab.id === 'profil' && pendingAbuseCount > 0 && (
                      <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] bg-rose-600 text-[9px] font-bold text-white rounded-full flex items-center justify-center">
                        {pendingAbuseCount}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium tracking-tight mt-1 transition-colors ${
                      isActive ? 'text-emerald-800 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {tab.label}
                  </span>
                  {isActive && !isSignaler && (
                    <span className="w-1 h-1 rounded-full bg-emerald-700 mt-0.5" />
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
