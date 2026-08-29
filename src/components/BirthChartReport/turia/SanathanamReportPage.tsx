import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Compass,
  Calendar,
  Layers,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  FileText,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Send,
  HelpCircle,
  Star,
  Flame,
  Sun,
  Moon
} from 'lucide-react';
import { BirthDetails } from '../../../types';
import {
  generateSanathanamSnapshot,
  generateSanathanamForecast,
  SanathanamSnapshot,
  TwoYearForecast
} from '../../../lib/services/SanathanamReportService';

interface SanathanamReportPageProps {
  birthDetails: BirthDetails;
  horoscopeData: any;
  onNavigateHome?: () => void;
  onNavigateOverview?: () => void;
}

export const SanathanamReportPage: React.FC<SanathanamReportPageProps> = ({
  birthDetails,
  horoscopeData,
  onNavigateHome,
  onNavigateOverview
}) => {
  const [snapshot, setSnapshot] = useState<SanathanamSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showRawModal, setShowRawModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Focus Area Exploration State
  const [selectedTopic, setSelectedTopic] = useState<string>('Career and Finance');
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [forecast, setForecast] = useState<TwoYearForecast | null>(null);
  const [isForecastLoading, setIsForecastLoading] = useState<boolean>(false);

  // Profile cache key to prevent re-fetching for the same chart
  const profileKey = `${birthDetails.name}_${birthDetails.date}_${birthDetails.time}_${birthDetails.place}`;
  const loadedKeyRef = useRef<string>('');

  // Load the initial 7-part snapshot and default forecast seamlessly
  useEffect(() => {
    let isMounted = true;
    if (loadedKeyRef.current === profileKey && snapshot) {
      return;
    }

    async function loadInitialReport() {
      setIsLoading(true);
      try {
        const [snapResult, forecastResult] = await Promise.all([
          generateSanathanamSnapshot(birthDetails, horoscopeData, 'en'),
          generateSanathanamForecast('Career and Finance', birthDetails, horoscopeData, 'en')
        ]);
        if (isMounted) {
          setSnapshot(snapResult);
          setForecast(forecastResult);
          setSelectedTopic('Career and Finance');
          loadedKeyRef.current = profileKey;
        }
      } catch (err) {
        console.error('Failed to load snapshot:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadInitialReport();
    return () => {
      isMounted = false;
    };
  }, [birthDetails, horoscopeData, profileKey]);

  const loadForecast = async (topic: string) => {
    setSelectedTopic(topic);
    setIsForecastLoading(true);
    try {
      const result = await generateSanathanamForecast(topic, birthDetails, horoscopeData, 'en');
      setForecast(result);
    } catch (err) {
      console.error('Failed to load forecast:', err);
    } finally {
      setIsForecastLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;
    loadForecast(customQuestion.trim());
  };

  return (
    <div className="w-full space-y-6">
      {isLoading ? (
        <div id="sanathanam-loading-state" className="p-12 text-center rounded-2xl bg-white border border-[#D4C5B9]/60 text-[#8A7B6E] shadow-xs">
          <div className="w-10 h-10 rounded-full border-2 border-[#E67E22] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-[#2C3E50]">Synthesizing Parashari Kundali Snapshot...</p>
          <p className="text-xs text-[#8A7B6E] mt-1">Reading pre-computed planetary coordinates, panchangam, and vimshottari dasha cycles.</p>
        </div>
      ) : snapshot ? (
        <div className="space-y-6">
          {/* Top Banner: Turia Companion & Philosophy */}
          <div className="rounded-2xl bg-gradient-to-r from-[#FFF8EE] via-white to-[#FAF7F2] border border-[#E67E22]/30 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-[#E67E22]/10 text-[#E67E22] border border-[#E67E22]/20">
                  Turia Vedic Astrology Companion
                </span>
                <span className="text-xs text-[#8A7B6E] font-medium font-serif italic">Parashari Classical Reading</span>
              </div>
              <h1 className="font-serif text-lg sm:text-xl font-bold text-[#2C3E50]">
                Philosophy: Effort × Fate
              </h1>
              <p className="text-xs text-[#556575] leading-relaxed max-w-3xl">
                Fate defines the landscape — what was placed before you. Effort determines how far you travel within it. Every placement is information; you are the agent, we map the terrain.
              </p>
            </div>
            <button
              onClick={() => setShowRawModal(true)}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#D4C5B9]/80 text-[#2C3E50] transition-all flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#E67E22]" />
              <span>View Kundali .md File</span>
            </button>
          </div>

          {/* Section 1: Chart Snapshot */}
          <section id="chart-snapshot-section" className="rounded-2xl bg-white border border-[#D4C5B9]/60 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#D4C5B9]/30">
              <div className="p-1.5 rounded-lg bg-[#E67E22]/10 text-[#E67E22]">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#2C3E50]">1. Chart Snapshot</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EADCCF]/80">
                <span className="text-[11px] font-bold text-[#8A7B6E] uppercase tracking-wider block">Ascendant (Lagna)</span>
                <span className="text-sm font-bold text-[#BA1A1A] mt-1 block leading-snug">{snapshot.snapshot.ascendant}</span>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EADCCF]/80">
                <span className="text-[11px] font-bold text-[#8A7B6E] uppercase tracking-wider block">Moon Sign (Rasi)</span>
                <span className="text-sm font-bold text-[#0D74CE] mt-1 block leading-snug">{snapshot.snapshot.moonSign}</span>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EADCCF]/80">
                <span className="text-[11px] font-bold text-[#8A7B6E] uppercase tracking-wider block">Sun Sign (Surya)</span>
                <span className="text-sm font-bold text-[#D35400] mt-1 block leading-snug">{snapshot.snapshot.sunSign}</span>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EADCCF]/80">
                <span className="text-[11px] font-bold text-[#8A7B6E] uppercase tracking-wider block">Janma Nakshatra</span>
                <span className="text-sm font-bold text-[#2E7D32] mt-1 block leading-snug">{snapshot.snapshot.janmaNakshatra}</span>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EADCCF]/80 sm:col-span-2 lg:col-span-1">
                <span className="text-[11px] font-bold text-[#8A7B6E] uppercase tracking-wider block">Active Mahadasha</span>
                <span className="text-sm font-bold text-[#8E24AA] mt-1 block leading-snug">{snapshot.snapshot.currentMahadasha}</span>
              </div>
            </div>
          </section>

          {/* Section 2: Panchang of Your Birth */}
          <section id="birth-panchang-section" className="rounded-2xl bg-white border border-[#D4C5B9]/60 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#D4C5B9]/30">
              <div className="p-1.5 rounded-lg bg-[#E67E22]/10 text-[#E67E22]">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif text-base sm:text-lg font-bold text-[#2C3E50]">2. Panchang of Your Birth</h2>
                <p className="text-xs text-[#8A7B6E] mt-0.5">The 5 cosmic time markers at the exact moment of birth, translated into psychological tendencies.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EADCCF]/80 hover:border-[#D4C5B9] transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#8A7B6E] uppercase tracking-wide">Weekday (Vaara)</span>
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-[#E67E22]/10 text-[#E67E22] border border-[#E67E22]/20">{snapshot.panchang.weekday.name}</span>
                </div>
                <p className="text-xs text-[#556575] leading-relaxed mt-2">{snapshot.panchang.weekday.meaning}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EADCCF]/80 hover:border-[#D4C5B9] transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#8A7B6E] uppercase tracking-wide">Tithi (Lunar Day)</span>
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-[#0D74CE]/10 text-[#0D74CE] border border-[#0D74CE]/20">{snapshot.panchang.tithi.name}</span>
                </div>
                <p className="text-xs text-[#556575] leading-relaxed mt-2">{snapshot.panchang.tithi.meaning}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EADCCF]/80 hover:border-[#D4C5B9] transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#8A7B6E] uppercase tracking-wide">Nakshatra (Moon Mansion)</span>
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20">{snapshot.panchang.nakshatra.name}</span>
                </div>
                <p className="text-xs text-[#556575] leading-relaxed mt-2">{snapshot.panchang.nakshatra.meaning}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EADCCF]/80 hover:border-[#D4C5B9] transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#8A7B6E] uppercase tracking-wide">Nitya Yoga</span>
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-[#8E24AA]/10 text-[#8E24AA] border border-[#8E24AA]/20">{snapshot.panchang.yoga.name}</span>
                </div>
                <p className="text-xs text-[#556575] leading-relaxed mt-2">{snapshot.panchang.yoga.meaning}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EADCCF]/80 hover:border-[#D4C5B9] transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#8A7B6E] uppercase tracking-wide">Karana (Half-Tithi)</span>
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-[#C2185B]/10 text-[#C2185B] border border-[#C2185B]/20">{snapshot.panchang.karana.name}</span>
                </div>
                <p className="text-xs text-[#556575] leading-relaxed mt-2">{snapshot.panchang.karana.meaning}</p>
              </div>
            </div>
          </section>

          {/* Section 3: The Story of This Chart */}
          <section id="story-of-chart-section" className="rounded-2xl bg-white border border-[#D4C5B9]/60 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-1.5 rounded-lg bg-[#E67E22]/10 text-[#E67E22]">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#2C3E50]">3. The Story of This Chart</h2>
            </div>
            <div className="bg-[#FAF7F2] p-5 rounded-xl border border-[#EADCCF]/80">
              <p className="text-sm text-[#2C3E50] leading-relaxed font-serif tracking-wide italic">
                "{snapshot.storyOfChart}"
              </p>
            </div>
          </section>

          {/* Section 4 & 5: Strengths & Challenges Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 4. Strengths */}
            <section id="strengths-section" className="rounded-2xl bg-white border border-[#D4C5B9]/60 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#D4C5B9]/30">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-serif text-base font-bold text-[#2C3E50]">4. Inherent Strengths</h2>
                  <p className="text-xs text-[#8A7B6E]">Placements offering genuine advantages — explained from the inside experience.</p>
                </div>
              </div>

              <div className="space-y-3">
                {snapshot.strengths.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-sm font-bold text-emerald-800">{item.title}</h3>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">{item.placement}</span>
                    </div>
                    <p className="text-xs text-[#374151] leading-relaxed">{item.phenomenologicalExperience}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. Challenges */}
            <section id="challenges-section" className="rounded-2xl bg-white border border-[#D4C5B9]/60 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#D4C5B9]/30">
                <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-serif text-base font-bold text-[#2C3E50]">5. Growth Friction & Challenges</h2>
                  <p className="text-xs text-[#8A7B6E]">Placements that generate tension — phenomenological insight without fatalism.</p>
                </div>
              </div>

              <div className="space-y-3">
                {snapshot.challenges.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-rose-50/50 border border-rose-200/80">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-sm font-bold text-rose-800">{item.title}</h3>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-100 text-rose-800 border border-rose-200 shrink-0">{item.placement}</span>
                    </div>
                    <p className="text-xs text-[#374151] leading-relaxed">{item.phenomenologicalExperience}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Section 6: Current Phase */}
          <section id="current-phase-section" className="rounded-2xl bg-white border border-[#D4C5B9]/60 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-3 pb-2 border-b border-[#D4C5B9]/30">
              <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2">
                <h2 className="font-serif text-base font-bold text-[#2C3E50]">6. Current Phase Mandate</h2>
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-800 border border-purple-200 w-fit">
                  {snapshot.currentPhase.period}
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#2C3E50] leading-relaxed bg-[#FAF7F2] p-4 rounded-xl border border-[#EADCCF]/80">
              {snapshot.currentPhase.mandate}
            </p>
          </section>

          {/* Section 7: What would you like to explore? (Interactive 2-Year Forecast) */}
          <section id="explore-forecast-section" className="rounded-2xl bg-white border border-[#D4C5B9]/60 p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#D4C5B9]/30">
              <div>
                <h2 className="font-serif text-base sm:text-lg font-bold text-[#2C3E50] flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#E67E22]/10 text-[#E67E22] inline-flex">
                    <Compass className="w-4 h-4" />
                  </span>
                  7. What would you like to explore?
                </h2>
                <p className="text-xs text-[#8A7B6E] mt-0.5">Select a domain or enter a specific inquiry to generate a targeted 2-year Vedic forecast.</p>
              </div>
            </div>

            {/* Suggested Topic Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {snapshot.suggestedTopics.map((topic, i) => (
                <button
                  key={i}
                  type="button"
                  id={`topic-pill-${i}`}
                  onClick={() => loadForecast(topic)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedTopic === topic
                      ? 'bg-[#E67E22] text-white border-[#E67E22] shadow-xs'
                      : 'bg-[#FAF7F2] text-[#2C3E50] border-[#D4C5B9]/60 hover:bg-[#F5ECE1] hover:border-[#D4C5B9]'
                  }`}
                >
                  {topic}
                  <ChevronRight className="w-3 h-3 opacity-60" />
                </button>
              ))}
            </div>

            {/* Custom Question Bar */}
            <form onSubmit={handleCustomSubmit} className="flex gap-2 mb-6">
              <input
                id="custom-inquiry-input"
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Or ask a specific question (e.g. 'Looking to launch a venture this winter' or 'Moving cities')"
                className="flex-1 px-4 py-2.5 text-xs bg-white border border-[#D4C5B9]/80 rounded-xl text-[#2C3E50] placeholder-[#8A7B6E] focus:outline-none focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22] transition-colors"
              />
              <button
                type="submit"
                id="submit-custom-inquiry-btn"
                disabled={isForecastLoading || !customQuestion.trim()}
                className="px-4 py-2.5 text-xs font-bold rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isForecastLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Ask</span>
              </button>
            </form>

            {/* 2-Year Forecast Result Card */}
            {isForecastLoading ? (
              <div className="p-8 text-center rounded-xl bg-[#FAF7F2] border border-[#EADCCF]/80 animate-pulse">
                <RefreshCw className="w-6 h-6 animate-spin text-[#E67E22] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#2C3E50]">Calculating 2-Year Dasha Lens & Planetary Transits for "{selectedTopic}"...</p>
              </div>
            ) : forecast ? (
              <div id="forecast-result-card" className="rounded-xl bg-[#FAF7F2] border border-[#EADCCF] p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D4C5B9]/40 pb-3 gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#E67E22]">2-Year Forecast Horizon</span>
                    <span className="text-sm font-bold text-[#2C3E50]">• {forecast.topic}</span>
                  </div>
                  <span className="text-[11px] text-[#8A7B6E] font-medium">Precision-Calibrated 24-Month Window</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Current Dasha Lens */}
                  <div className="p-4 rounded-xl bg-white border border-[#EADCCF]/80 shadow-2xs">
                    <span className="text-xs font-bold text-purple-800 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      The Dasha Lens
                    </span>
                    <p className="text-xs text-[#374151] leading-relaxed">{forecast.dashaLens}</p>
                  </div>

                  {/* Key Transits */}
                  <div className="p-4 rounded-xl bg-white border border-[#EADCCF]/80 shadow-2xs">
                    <span className="text-xs font-bold text-cyan-800 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                      <Compass className="w-3.5 h-3.5" />
                      Key Transits (Next 24 Months)
                    </span>
                    <p className="text-xs text-[#374151] leading-relaxed">{forecast.keyTransits}</p>
                  </div>

                  {/* Effort Prescription */}
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 shadow-2xs">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      The Effort Prescription
                    </span>
                    <p className="text-xs text-[#374151] leading-relaxed">{forecast.effortPrescription}</p>
                  </div>

                  {/* What to Watch For */}
                  <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200/80 shadow-2xs">
                    <span className="text-xs font-bold text-rose-800 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      What to Watch For
                    </span>
                    <p className="text-xs text-[#374151] leading-relaxed">{forecast.whatToWatchFor}</p>
                  </div>
                </div>

                {/* Astrologer Referral Callout for High-Weight Questions */}
                {forecast.requiresAstrologerReferral && (
                  <div id="astrologer-referral-banner" className="mt-4 p-4 rounded-xl bg-[#FFF8EE] border border-[#E67E22]/30 text-[#2C3E50] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#E67E22]/10 text-[#E67E22] border border-[#E67E22]/20">Dedicated Reading Recommended</span>
                      </div>
                      <p className="text-xs text-[#556575] leading-relaxed">{forecast.referralReason}</p>
                    </div>
                    <a
                      href="https://jyothishya-sanathanam.app/astrologers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-white transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                    >
                      <span>Consult Astrologer</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ) : null}
          </section>
        </div>
      ) : null}

      {/* Raw Kundali Markdown Modal */}
      {showRawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C3E50]/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white border border-[#D4C5B9]/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-[#D4C5B9]/40 flex items-center justify-between bg-[#FAF7F2]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#E67E22]" />
                <h3 className="text-sm font-bold text-[#2C3E50]">Pre-Computed Kundali Markdown</h3>
              </div>
              <button
                onClick={() => setShowRawModal(false)}
                className="text-[#8A7B6E] hover:text-[#2C3E50] text-xs px-2.5 py-1 rounded-md bg-[#F5ECE1] cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="p-4 overflow-y-auto font-mono text-xs text-[#2C3E50] whitespace-pre-wrap bg-white flex-1">
              {snapshot?.rawMarkdown || 'Generating markdown...'}
            </div>
            <div className="p-3 border-t border-[#D4C5B9]/40 bg-[#FAF7F2] flex justify-end gap-2">
              <button
                onClick={() => {
                  if (snapshot?.rawMarkdown) {
                    navigator.clipboard.writeText(snapshot.rawMarkdown);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }
                }}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-white flex items-center gap-1 cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Raw Markdown'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
