import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Edit3, Compass, LayoutGrid, Shield, Sparkles, Clock, Calendar, 
  Layers, Printer, ArrowLeft, MessageSquare, BookOpen, Orbit
} from 'lucide-react';
import { SavedPerson } from '../types/marriageMatch';
import { BirthDetails } from '../types';
import { UnifiedAstrologyChart } from '../components/UnifiedAstrologyChart';
import { PlanetTable } from '../components/PlanetTable';
import { NavamshaTable } from '../components/NavamshaTable';
import { TransitAnalysisView } from '../components/TransitAnalysisView';
import { VimshottariDashaView } from '../components/VimshottariDashaView';
import { PanchangamView } from '../components/PanchangamView';
import { RVATripleCharts } from '../components/KP/RVATripleCharts';
import { AdvancedAITab } from '../components/AdvancedAITab';
import { SanathanamReportPage } from '../components/BirthChartReport/turia/SanathanamReportPage';
import { Button } from '../components/design-system/Button';
import { Card } from '../components/design-system/Card';
import { SaveToDriveButton } from '../components/SaveToDriveButton';
import { addSavedPerson } from '../lib/savedPersons';
import { ProfileStorageService } from '../lib/profileStorageService';
import { generateVedicBirthChartMarkdown } from '../lib/vedicMarkdownGenerator';
import { calculateActiveDasha } from '../lib/engines/DashaEngine';
import { useKPChart } from '../hooks/useKPChart';
import { computeLiveTransitSnapshot } from '../lib/engines/LiveTransitEngine';

export type BirthChartTab = 'overview' | 'd1' | 'transit' | 'd9' | 'dasha' | 'report' | 'ai';

interface BirthChartPageProps {
  horoscopeReport: any | null;
  activeProfile: SavedPerson | null;
  onEditProfile: () => void;
  language: 'en' | 'hi' | 'te';
  reportLoading?: boolean;
  onSelectProfile: (profile: SavedPerson) => void;
  savedProfiles?: SavedPerson[];
  initialTab?: BirthChartTab;
  onNavigatePage?: (page: string) => void;
  onBack?: () => void;
}

export const SIGN_LORDS: Record<string, string> = {
  Aries: 'Mars', 
  Taurus: 'Venus', 
  Gemini: 'Mercury', 
  Cancer: 'Moon',
  Leo: 'Sun', 
  Virgo: 'Mercury', 
  Libra: 'Venus', 
  Scorpio: 'Mars',
  Sagittarius: 'Jupiter', 
  Capricorn: 'Saturn', 
  Aquarius: 'Saturn', 
  Pisces: 'Jupiter'
};

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const formatRemainingTime = (endDate: Date): string => {
  try {
    const now = new Date();
    if (now >= endDate) return 'Completed';
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const remainingDaysAfterYears = diffDays % 365;
    const months = Math.floor(remainingDaysAfterYears / 30.4375);
    const days = Math.round(remainingDaysAfterYears % 30.4375);

    let text = "";
    if (years > 0) text += `${years}y `;
    if (months > 0) text += `${months}m `;
    if (days > 0 || text === "") text += `${days}d `;
    return `${text} remaining`;
  } catch (e) {
    return '—';
  }
};

export const extractSignFromData = (obj: any, defaultIndex: number = 0): string => {
  if (!obj) return ZODIAC_SIGNS[defaultIndex % 12];
  if (obj.sign && typeof obj.sign === 'string') return obj.sign;
  if (typeof obj.sign === 'number') return ZODIAC_SIGNS[obj.sign % 12];
  if (typeof obj.longitude === 'number') {
    const signIndex = Math.floor(obj.longitude / 30) % 12;
    return ZODIAC_SIGNS[signIndex];
  }
  return ZODIAC_SIGNS[defaultIndex % 12];
};

export const BirthChartPage: React.FC<BirthChartPageProps> = ({
  horoscopeReport,
  activeProfile,
  onEditProfile,
  language,
  reportLoading,
  onSelectProfile,
  savedProfiles = [],
  initialTab = 'overview',
  onNavigatePage,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<BirthChartTab>(initialTab);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Keep live time updated for Transit
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Safe fallback values
  const name = activeProfile?.name || horoscopeReport?.birthData?.name || 'Native';
  const date = activeProfile?.date || horoscopeReport?.birthData?.date || '1996-11-11';
  const time = activeProfile?.time || horoscopeReport?.birthData?.time || '13:50:00';
  const place = activeProfile?.place || horoscopeReport?.birthData?.place || 'Jaggampeta';

  const birthDetails: BirthDetails = useMemo(() => {
    if (activeProfile) {
      return {
        name: activeProfile.name,
        gender: (activeProfile.gender === 'Female' ? 'Female' : 'Male') as ('Male' | 'Female'),
        date: activeProfile.date,
        time: activeProfile.time,
        approximateTime: false,
        place: activeProfile.place,
        latitude: activeProfile.latitude || 17.17,
        longitude: activeProfile.longitude || 82.06,
        timezone: activeProfile.timezone || 5.5
      };
    }
    return {
      name: horoscopeReport?.birthData?.name || 'Native',
      gender: (horoscopeReport?.birthData?.gender === 'Female' ? 'Female' : 'Male') as ('Male' | 'Female'),
      date: horoscopeReport?.birthData?.date || '1996-11-11',
      time: horoscopeReport?.birthData?.time || '13:50:00',
      approximateTime: false,
      place: horoscopeReport?.birthData?.place || 'Jaggampeta',
      latitude: horoscopeReport?.birthData?.latitude || 17.17,
      longitude: horoscopeReport?.birthData?.longitude || 82.06,
      timezone: horoscopeReport?.birthData?.timezone || 5.5
    };
  }, [
    activeProfile?.name,
    activeProfile?.gender,
    activeProfile?.date,
    activeProfile?.time,
    activeProfile?.place,
    activeProfile?.latitude,
    activeProfile?.longitude,
    activeProfile?.timezone,
    horoscopeReport?.birthData?.name,
    horoscopeReport?.birthData?.gender,
    horoscopeReport?.birthData?.date,
    horoscopeReport?.birthData?.time,
    horoscopeReport?.birthData?.place,
    horoscopeReport?.birthData?.latitude,
    horoscopeReport?.birthData?.longitude,
    horoscopeReport?.birthData?.timezone
  ]);

  const kpChart = useKPChart(birthDetails, horoscopeReport);

  const transitSnapshot = useMemo(() => {
    const moonSign = activeProfile?.place ? 'Aries' : 'Aries';
    return computeLiveTransitSnapshot(moonSign, currentDate);
  }, [currentDate, activeProfile]);

  if (reportLoading) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-4">
        <div className="animate-spin w-16 h-16 rounded-2xl bg-[#FFDDB3] text-[#E67E22] flex items-center justify-center mx-auto text-2xl font-bold">
          🕉
        </div>
        <h2 className="font-serif font-bold text-xl text-[#2C3E50]">Generating Birth Chart...</h2>
        <p className="text-sm text-[#8A7B6E]">
          Calculating precise Parashari divisional coordinates, Vimshottari dasha cycles, and planetary dignities.
        </p>
      </div>
    );
  }

  if (!horoscopeReport && !activeProfile) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#FFDDB3] text-[#E67E22] flex items-center justify-center mx-auto text-2xl font-bold">
          🕉
        </div>
        <h2 className="font-serif font-bold text-xl text-[#2C3E50]">No Active Chart Selected</h2>
        <p className="text-sm text-[#8A7B6E]">
          Please select or create a profile on the Home or Profile page to view the Birth Chart.
        </p>
      </div>
    );
  }

  // Extract Natal D1 and Dasha
  const divCharts = horoscopeReport?.horoscope?.divisional_charts || horoscopeReport?.divisional_charts || {};
  const d1 = divCharts['D-1_rasi'] || horoscopeReport?.rasi || horoscopeReport?.horoscope?.d1 || {};
  const cal = horoscopeReport?.horoscope?.calendar_info || horoscopeReport?.calendar_info || horoscopeReport?.panchangam || {};

  const lagnaObj = d1?.Ascendant || d1?.Lagna || {};
  const lagnaSign = lagnaObj.sign || extractSignFromData(lagnaObj) || 'Mesha (Aries)';
  const lagnaLord = lagnaSign !== 'Unknown' ? (SIGN_LORDS[lagnaSign] || 'Mars') : 'Mars';

  const moonObj = d1?.Moon || {};
  const moonSign = moonObj.sign || extractSignFromData(moonObj) || (cal.Raasi ? cal.Raasi.split(' ')[0] : 'Cancer');

  const sunObj = d1?.Sun || {};
  const sunSign = sunObj.sign || extractSignFromData(sunObj) || 'Libra';

  const moonNakObj = horoscopeReport?.horoscope?.nakshatra_pada?.Moon || horoscopeReport?.nakshatra_pada?.Moon || {};
  const rawNakName = moonNakObj.nakshatra || moonNakObj.nakshatra_name || '';
  const pada = moonNakObj.pada;
  const nakshatraText = rawNakName
    ? `${rawNakName}${pada ? ` - Pada ${pada}` : ''}`
    : (cal.Nakshatram ? cal.Nakshatram.split('  ')[0].split(' ')[0] : 'Pushya');

  const activeDasha = calculateActiveDasha(horoscopeReport, date, new Date());
  const activeMd = activeDasha?.mahadasha?.lord || 'Venus';
  const activeAd = activeDasha?.antardasha?.lord || 'Sun';
  const activePd = activeDasha?.pratyantardasha?.lord || 'Venus';

  // Avakhada Chakra Data
  const avakhada = horoscopeReport?.avakhadaChakra || {
    Varna: 'Kshatriya',
    Yoni: 'Gaja (Elephant)',
    Gana: 'Deva',
    Nadi: 'Madhya',
    SignLord: lagnaLord,
    Charan: pada ? String(pada) : '2',
    Lagna: lagnaSign,
    Rasi: moonSign,
    Nakshatra: rawNakName || 'Pushya'
  };

  const tabs: { key: BirthChartTab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <Compass className="w-4 h-4" /> },
    { key: 'd1', label: 'D1', icon: <LayoutGrid className="w-4 h-4" /> },
    { key: 'transit', label: 'Transit', icon: <Orbit className="w-4 h-4" /> },
    { key: 'd9', label: 'D9', icon: <Sparkles className="w-4 h-4" /> },
    { key: 'dasha', label: 'Vimsottara Dasha', icon: <Clock className="w-4 h-4" /> },
    { key: 'report', label: 'Report', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'ai', label: 'AI', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C3E50] pb-24 font-sans selection:bg-[#FFDDB3] selection:text-[#684300]">
      {/* Top Action Bar */}
      <div className="bg-[#FAF7F2] border-b border-[#D4C5B9]/40 py-2.5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-end gap-3 text-xs">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<FileText className="w-3.5 h-3.5 text-ds-tertiary" />}
              onClick={() => {
                const mdContent = generateVedicBirthChartMarkdown(birthDetails, horoscopeReport);
                const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Vedic Birth Chart — ${birthDetails.name.trim()}.md`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              title="Download Vedic Birth Chart Markdown (.md) for AI parsing"
            />
            <Button
              variant="secondary"
              size="sm"
              icon={<Printer className="w-3.5 h-3.5" />}
              onClick={() => window.print()}
              title="Print Report"
            />
            <SaveToDriveButton
              birthDetails={birthDetails}
              horoscopeData={horoscopeReport}
              language={language}
              onSaveLocally={() => {
                addSavedPerson({
                  name: name,
                  date: date,
                  time: time,
                  place: place,
                  latitude: birthDetails.latitude,
                  longitude: birthDetails.longitude,
                  timezone: birthDetails.timezone,
                  gender: birthDetails.gender
                });
              }}
            />
            <Button
              variant="secondary"
              size="sm"
              icon={<Edit3 className="w-3.5 h-3.5" />}
              onClick={onEditProfile}
              title="Edit Details"
            />
          </div>
        </div>
      </div>

        {/* Selected Native Summary Bar */}
        <div className="bg-[#F7F1E8]/60 border-t border-[#D4C5B9]/40 py-2 px-4">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
              <span className="text-[#8A7B6E] font-medium">Native:</span>
              <strong className="font-serif text-[#2C3E50] font-bold text-sm">{name}</strong>
              <span className="text-[#8A7B6E]">({birthDetails.gender})</span>
            </div>

            <div className="flex items-center gap-4 flex-wrap text-[#564337]">
              <div>
                <span className="text-[#8A7B6E]">Born:</span>{' '}
                <strong className="font-mono font-bold text-[#2C3E50]">{date} @ {time}</strong>
              </div>
              <div>
                <span className="text-[#8A7B6E]">Place:</span>{' '}
                <strong className="font-semibold text-[#2C3E50]">{place}</strong>
              </div>
              <div className="flex items-center gap-1.5 bg-[#FFF8EE] border border-[#E67E22]/30 px-2.5 py-0.5 rounded-lg text-[#E67E22] font-bold">
                <Clock className="w-3 h-3 text-[#E67E22]" />
                <span>{activeMd} MD → {activeAd} AD</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. THE 7-TAB NAVIGATION BAR */}
        <div className="bg-white border-t border-[#D4C5B9]/40 px-4 shadow-2xs">
          <div className="max-w-6xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-1.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#E67E22] text-white shadow-xs font-bold'
                      : 'text-[#564337] hover:text-[#2C3E50] hover:bg-[#F5ECE1]/60'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      {/* 3. MAIN TAB CONTENT */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Executive Vector Summary Card */}
            <div className="bg-white rounded-2xl border border-[#D4C5B9]/50 shadow-[0px_2px_12px_rgba(44,62,80,0.06)] p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#D4C5B9]/30 pb-3">
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#2C3E50] flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#E67E22]" />
                  <span>Executive Natal Coordinates</span>
                </h3>
                <span className="text-xs text-[#8A7B6E] font-mono font-bold">Parashari Classical Core</span>
              </div>

              {/* 4 Pillars Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#D4C5B9]/40">
                  <span className="text-[11px] text-[#8A7B6E] font-bold uppercase tracking-wider block">Ascendant (Lagna)</span>
                  <span className="font-serif font-bold text-sm text-[#E67E22] mt-1 block">{lagnaSign}</span>
                  <span className="text-[10px] text-[#564337] mt-0.5 block font-medium">Lord: {lagnaLord}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#D4C5B9]/40">
                  <span className="text-[11px] text-[#8A7B6E] font-bold uppercase tracking-wider block">Moon Sign (Rasi)</span>
                  <span className="font-serif font-bold text-sm text-[#2C3E50] mt-1 block">{moonSign}</span>
                  <span className="text-[10px] text-[#564337] mt-0.5 block font-medium">{nakshatraText}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#D4C5B9]/40">
                  <span className="text-[11px] text-[#8A7B6E] font-bold uppercase tracking-wider block">Sun Sign (Surya)</span>
                  <span className="font-serif font-bold text-sm text-[#E67E22] mt-1 block">{sunSign}</span>
                  <span className="text-[10px] text-[#564337] mt-0.5 block font-medium">Soul Identity</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#D4C5B9]/40">
                  <span className="text-[11px] text-[#8A7B6E] font-bold uppercase tracking-wider block">Active Dasha</span>
                  <span className="font-serif font-bold text-sm text-[#BA1A1A] mt-1 block">{activeMd} MD</span>
                  <span className="text-[10px] text-[#564337] mt-0.5 block font-medium">{activeAd} AD • {activePd} PD</span>
                </div>
              </div>

              <div className="text-xs sm:text-sm leading-relaxed text-[#564337] pt-1">
                You are born with a <strong className="text-[#E67E22]">{lagnaSign} Ascendant</strong> ruled by <strong className="text-[#E67E22]">{lagnaLord}</strong>, establishing your foundational constitution and primary behavioral tendencies. Your emotional mind is anchored in <strong className="text-[#2C3E50]">Moon in {moonSign}</strong> ({nakshatraText}), while your core vitality and soul trajectory align with <strong className="text-[#E67E22]">Sun in {sunSign}</strong>.
              </div>
            </div>

            {/* Current Vimshottari Life Phase Card */}
            <div className="bg-white rounded-2xl border border-[#D4C5B9]/50 shadow-[0px_2px_12px_rgba(44,62,80,0.06)] p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between border-b border-[#D4C5B9]/30 pb-3">
                <h3 className="font-serif font-bold text-base text-[#2C3E50] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#E67E22]" />
                  <span>Current Vimshottari Life Phase</span>
                </h3>
                <button
                  onClick={() => setActiveTab('dasha')}
                  className="text-xs font-bold text-[#E67E22] hover:underline cursor-pointer"
                >
                  View Full Dasha →
                </button>
              </div>

              <div className="p-4 bg-[#FFF8EE] rounded-xl border border-[#E67E22]/30 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm font-semibold gap-2">
                  <span className="text-[#2C3E50] font-serif font-bold text-base">
                    {activeMd} Mahadasha → {activeAd} Antardasha {activePd !== 'Unknown' ? `→ ${activePd} Pratyantardasha` : ''}
                  </span>
                  <span className="text-[#E67E22] font-mono flex items-center gap-1.5 font-bold">
                    <span className="bg-white px-2 py-0.5 rounded-md border border-[#E67E22]/20">
                      {activeDasha?.antardasha?.endDate ? formatRemainingTime(new Date(activeDasha.antardasha.endDate)) : '—'}
                    </span>
                    <span className="text-[11px] text-[#8A7B6E]">
                      (Ends {activeDasha?.antardasha?.endDate ? new Date(activeDasha.antardasha.endDate).toLocaleDateString() : '—'})
                    </span>
                  </span>
                </div>

                <div className="w-full bg-[#E8DDD1] h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#E67E22] to-[#BA1A1A] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${activeDasha?.antardasha?.percentComplete ?? 45}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Birth Panchangam View */}
            <PanchangamView
              calendarInfo={horoscopeReport?.panchangam || horoscopeReport?.calendar_info}
            />

            {/* Natal Triple Charts */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-[#D4C5B9]/30 pb-2">
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#2C3E50] flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-[#E67E22]" />
                  <span>Natal Triple Charts (Rasi, Moon & Bhava)</span>
                </h3>
              </div>
              {kpChart ? (
                <RVATripleCharts
                  kpChart={kpChart}
                  horoscopeData={horoscopeReport}
                />
              ) : (
                <div className="p-8 text-center text-sm text-[#8A7B6E] bg-white rounded-2xl border border-[#D4C5B9]/40">
                  Loading Triple Charts...
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: D1 RASI CHART */}
        {activeTab === 'd1' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Master D1 Chart */}
            <UnifiedAstrologyChart
              chartType="D1"
              horoscopeData={horoscopeReport}
              title="D1 Rasi Natal Chart"
              subtitle="Lagna Chart • Physical Incarnation, Bodily Constitution & Lifelong Blueprint"
            />

            {/* Planetary Coordinates & Insights Table */}
            <PlanetTable
              horoscopeData={horoscopeReport}
              language={language}
            />
          </div>
        )}

        {/* TAB 3: TRANSIT (GOCHARA) */}
        {activeTab === 'transit' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Live Transit Chart */}
            <UnifiedAstrologyChart
              chartType="Transit"
              horoscopeData={horoscopeReport}
              transitSnapshot={transitSnapshot}
              title="Live Gochara Transit Chart"
              subtitle="Real-Time Planetary Transits • Current Astronomical Sky Position"
            />

            {/* Transit Analysis & Natal Impact Table */}
            <TransitAnalysisView
              transitSnapshot={transitSnapshot}
              horoscopeData={horoscopeReport}
              language={language}
            />
          </div>
        )}

        {/* TAB 4: D9 NAVAMSHA */}
        {activeTab === 'd9' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Master D9 Chart */}
            <UnifiedAstrologyChart
              chartType="D9"
              horoscopeData={horoscopeReport}
              title="D9 Navamsha Chart"
              subtitle="9th Harmonic Division • Dharma, Inner Soul Strength & Marital Harmony"
            />

            {/* D9 Navamsha Analysis Table & Vargottama Highlights */}
            <NavamshaTable
              horoscopeData={horoscopeReport}
              language={language}
            />
          </div>
        )}

        {/* TAB 5: VIMSOTTARA DASHA */}
        {activeTab === 'dasha' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <VimshottariDashaView
              horoscopeData={horoscopeReport}
              birthDateStr={date}
              language={language}
            />
          </div>
        )}

        {/* TAB 6: REPORT (TURIA / SANATHANAM V6 READING) - Pre-loaded along with birth chart page */}
        <div className={activeTab === 'report' ? 'space-y-6 animate-in fade-in duration-200' : 'hidden'}>
          <SanathanamReportPage
            birthDetails={birthDetails}
            horoscopeData={horoscopeReport}
            onNavigateHome={() => setActiveTab('overview')}
            onNavigateOverview={() => setActiveTab('overview')}
          />
        </div>

        {/* TAB 7: AI (AI CONSULTATION) */}
        {activeTab === 'ai' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <AdvancedAITab
              birthDetails={birthDetails}
              horoscopeData={horoscopeReport}
              language={language}
              profiles={savedProfiles}
              onSelectProfile={onSelectProfile}
            />
          </div>
        )}

      </main>
    </div>
  );
};

export default BirthChartPage;
