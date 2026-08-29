import React, { useState } from 'react';
import { BirthForm } from '../components/BirthForm';
import { BirthDetails } from '../types';
import { SavedPerson } from '../types/marriageMatch';
import { ArrowLeft, User, MoreVertical, Trash2, Check, Sparkles } from 'lucide-react';

interface KundaliPageProps {
  savedProfiles: SavedPerson[];
  activeProfile: SavedPerson | null;
  onGenerateNewKundali: (details: BirthDetails) => void;
  onSelectSavedProfile: (profile: SavedPerson) => void;
  onDeleteProfile?: (id: string) => void;
  onBack: () => void;
  language?: 'en' | 'hi' | 'te';
  loading?: boolean;
}

export const KundaliPage: React.FC<KundaliPageProps> = ({
  savedProfiles,
  activeProfile,
  onGenerateNewKundali,
  onSelectSavedProfile,
  onDeleteProfile,
  onBack,
  language = 'en',
  loading = false,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const formatDateDisplay = (dateStr: string) => {
    try {
      if (!dateStr) return '';
      const d = new Date(dateStr + 'T00:00:00');
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#071E27] pb-24 font-sans selection:bg-[#E67E22]/20">
      {/* Main Container */}
      <main className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
        {/* Section A: Progressive Birth Details Form */}
        <section className="bg-white rounded-2xl p-5 sm:p-6 border border-[#D4C5B9]/40 shadow-[0px_4px_20px_rgba(26,35,126,0.04)]">
          <BirthForm
            onSubmit={onGenerateNewKundali}
            loading={loading}
            language={language}
            embedded={true}
            title="New Kundali"
            subtitle="Enter birth details for precise calculation."
            submitButtonText="Generate"
          />
        </section>

        {/* Section B: Saved Kundali Profiles */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#071E27] tracking-tight">
              Saved Profiles
            </h3>
            <span className="text-xs text-[#767683] font-medium">
              {savedProfiles.length} {savedProfiles.length === 1 ? 'Profile' : 'Profiles'}
            </span>
          </div>

          <div className="space-y-2.5">
            {savedProfiles.map((profile) => {
              const isCurrent = activeProfile?.id === profile.id;
              const isMenuOpen = activeMenuId === profile.id;

              return (
                <div
                  key={profile.id}
                  className={`group relative bg-white p-3.5 sm:p-4 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 shadow-2xs hover:shadow-sm cursor-pointer active:scale-[0.99] ${
                    isCurrent
                      ? 'border-[#E67E22] ring-1 ring-[#E67E22]/30 bg-[#FFFDF9]'
                      : 'border-[#D4C5B9]/30 hover:border-[#E67E22]/50 hover:bg-[#FDFBF7]'
                  }`}
                  onClick={() => onSelectSavedProfile(profile)}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Avatar Icon */}
                    <div className="w-11 h-11 rounded-full bg-[#E67E22]/10 flex items-center justify-center text-[#E67E22] shrink-0 border border-[#E67E22]/20">
                      <User className="w-5 h-5" />
                    </div>

                    {/* Profile Information */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-sans font-semibold text-sm sm:text-base text-[#071E27] truncate">
                          {profile.name}
                        </h4>
                        {isCurrent && (
                          <span className="text-[10px] uppercase font-bold bg-[#E67E22]/15 text-[#E67E22] px-1.5 py-0.5 rounded-full shrink-0">
                            Active
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#767683] font-mono mt-0.5 truncate flex items-center gap-1.5">
                        <span>
                          {profile.gender === 'Female' ? '♀' : '♂'} {formatDateDisplay(profile.date)}
                        </span>
                        <span>•</span>
                        <span className="truncate">{profile.place || 'Unknown'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions / Menu */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectSavedProfile(profile)}
                      className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#E67E22]/10 hover:bg-[#E67E22] text-[#E67E22] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>View Chart</span>
                    </button>

                    {onDeleteProfile && profile.id !== 'satyam-family-10' && (
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuId(isMenuOpen ? null : profile.id)}
                          className="text-[#767683] hover:text-[#071E27] p-2 rounded-full hover:bg-[#F5ECE1] transition-colors cursor-pointer"
                          title="Options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-[#D4C5B9]/40 rounded-xl shadow-xl py-1 z-30 animate-in fade-in">
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onDeleteProfile(profile.id);
                              }}
                              className="w-full px-3 py-2 text-left text-xs text-[#BA1A1A] hover:bg-[#FFDAD6]/30 flex items-center gap-2 cursor-pointer font-medium"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Profile</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {savedProfiles.length === 0 && (
              <div className="bg-white p-8 rounded-xl border border-[#D4C5B9]/30 border-dashed text-center">
                <p className="text-sm text-[#767683]">No saved Kundalis yet. Fill in the form above to generate your first chart.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
