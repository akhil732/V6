import React from 'react';
import { ArrowLeft, LogIn } from 'lucide-react';
import { SavedPerson } from '../../types/marriageMatch';
import { useAuth } from '../../context/AuthContext';

export type NavPage = 'home' | 'kundali' | 'birth-chart' | 'marriage-match' | 'ai-consultation' | 'profile' | 'panchangam' | 'login';

interface GlobalHeaderProps {
  logo?: string;
  activePage?: NavPage;
  activeProfile?: SavedPerson | null;
  savedProfiles?: SavedPerson[];
  onSelectActiveProfile?: (profile: SavedPerson) => void;
  onCreateNewProfile?: () => void;
  onNavigatePage: (page: NavPage) => void;
  language?: 'en' | 'hi' | 'te';
  onLanguageChange?: (lang: 'en' | 'hi' | 'te') => void;
  rightActions?: React.ReactNode;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  logo,
  activePage = 'home',
  activeProfile,
  onNavigatePage,
  rightActions,
}) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#D4C5B9]/60 shadow-xs h-16 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-full gap-2">
        {/* Left Section: Back Button (if not on home) & Brand Header */}
        <div className="flex items-center gap-2 shrink-0">
          {activePage !== 'home' && (
            <button
              aria-label="Go back to Home"
              onClick={() => onNavigatePage('home')}
              className="text-[#E67E22] hover:bg-[#F5ECE1] transition-colors duration-150 rounded-full p-2 flex items-center justify-center cursor-pointer"
              title="Return to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <button 
            onClick={() => onNavigatePage('home')}
            className="flex items-center gap-2 cursor-pointer group shrink-0 bg-transparent border-none p-0 focus:outline-none rounded-md"
            aria-label="Jyothishya Sanathanam Home"
          >
            {logo && (
              <img 
                src={logo} 
                alt=""
                role="presentation"
                className="w-8 h-8 object-cover rounded-lg border border-[#E67E22]/30 shadow-xs group-hover:scale-105 transition-transform"
              />
            )}
            <div className="flex flex-col text-left truncate">
              <span className="font-serif font-bold text-lg sm:text-[21px] tracking-tight text-[#E67E22] group-hover:text-[#D35400] transition-colors leading-tight truncate">
                Jyothishya Sanathanam
              </span>
            </div>
          </button>
        </div>

        {/* Right Section: Custom Page Actions + Login/User Button */}
        <div className="flex items-center gap-2 shrink-0">
          {rightActions}

          {isAuthenticated && user ? (
            <button
              onClick={() => onNavigatePage('profile')}
              className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#FAF7F2] hover:bg-[#F5ECE1] border border-[#D4C5B9]/60 transition-colors cursor-pointer"
              title="View User Profile"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-[#E67E22]/40"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#E67E22] text-white flex items-center justify-center text-xs font-bold font-serif">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <span className="text-xs font-semibold text-[#2C3E50] hidden sm:inline max-w-[100px] truncate">
                {user.displayName?.split(' ')[0] || 'User'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => onNavigatePage('login')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                activePage === 'login'
                  ? 'bg-[#2C3E50] text-white'
                  : 'bg-[#E67E22] hover:bg-[#D35400] text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
