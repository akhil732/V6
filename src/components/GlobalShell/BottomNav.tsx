import React from 'react';
import { Home, LayoutGrid, Heart, Bot, User } from 'lucide-react';

export type ActivePage = 'home' | 'kundali' | 'birth-chart' | 'marriage-match' | 'ai-consultation' | 'profile' | 'panchangam' | 'login';

interface BottomNavProps {
  activePage: ActivePage;
  onNavigatePage: (page: ActivePage) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activePage, onNavigatePage }) => {
  const navItems: Array<{
    id: ActivePage;
    label: string;
    icon: React.FC<{ className?: string }>;
  }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'kundali', label: 'Kundali', icon: LayoutGrid },
    { id: 'marriage-match', label: 'Matching', icon: Heart },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#FDFBF7]/95 dark:bg-ds-surface/95 backdrop-blur-md border-t border-[#D4C5B9]/30 flex justify-around items-center px-3 z-40 shadow-sm select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePage === item.id || (item.id === 'kundali' && activePage === 'birth-chart');

        return (
          <button
            key={item.id}
            onClick={() => onNavigatePage(item.id)}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-150 cursor-pointer relative focus-ring ${
              isActive
                ? 'text-[#E67E22] font-bold'
                : 'text-[#564337] dark:text-ds-on-surface-variant hover:text-[#E67E22] hover:bg-[#F5ECE1]/50'
            }`}
          >
            {/* Icon */}
            <div className={`p-1 rounded-lg transition-transform ${isActive ? 'scale-110' : ''}`}>
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#E67E22]' : 'text-[#767683]'}`} />
            </div>

            {/* Label */}
            <span className={`text-[11px] leading-none mt-0.5 tracking-tight ${isActive ? 'font-bold text-[#E67E22]' : 'font-medium'}`}>
              {item.label}
            </span>

            {/* Active Indicator Dot / Pill */}
            {isActive && (
              <div className="w-1 h-1 bg-[#E67E22] rounded-full mt-1 animate-in fade-in zoom-in duration-150" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
