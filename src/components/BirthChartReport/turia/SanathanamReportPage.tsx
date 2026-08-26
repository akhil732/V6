import React, { useState, useEffect } from 'react';
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
import { TuriaReportShell, TuriaSubView } from './TuriaReportShell';
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
  onNavigateHome: () => void;
  onNavigateOverview: () => void;
}

export const SanathanamReportPage: React.FC<SanathanamReportPageProps> = ({
  birthDetails,
  horoscopeData,
  onNavigateHome,
  onNavigateOverview
}) => {
  const [snapshot, setSnapshot] = useState<SanathanamSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [showRawModal, setShowRawModal] = useState<boolean>(false);

  // Focus Area Exploration State
  const [selectedTopic, setSelectedTopic] = useState<string>('Career and Finance');
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [forecast, setForecast] = useState<TwoYearForecast | null>(null);
  const [isForecastLoading, setIsForecastLoading] = useState<boolean>(false);

  // Load the initial 7-part snapshot
  useEffect(() => {
    let isMounted = true;
    async function loadSnapshot() {
      setIsLoading(true);
      try {
        const result = await generateSanathanamSnapshot(birthDetails, horoscopeData, 'en');
        if (isMounted) {
          setSnapshot(result);
          // Pre-load default career forecast
          loadForecast('Career and Finance');
        }
      } catch (err) {
        console.error('Failed to load snapshot:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadSnapshot();
    return () => {
      isMounted = false;
    };
  }, [birthDetails, horoscopeData]);

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

  const handleCopyReport = () => {
    if (!snapshot) return;
    const textToCopy = `Jyothishya Sanathanam AI Reading: Kundali Snapshot
Native: ${birthDetails.name || 'Native'}
Date: ${birthDetails.date || ''} ${birthDetails.time || ''}

1. CHART SNAPSHOT
Ascendant: ${snapshot.snapshot.ascendant}
Moon Sign: ${snapshot.snapshot.moonSign}
Sun Sign: ${snapshot.snapshot.sunSign}
Janma Nakshatra: ${snapshot.snapshot.janmaNakshatra}
Current Mahadasha: ${snapshot.snapshot.currentMahadasha}

2. PANCHANG OF BIRTH
- Weekday: ${snapshot.panchang.weekday.name} - ${snapshot.panchang.weekday.meaning}
- Tithi: ${snapshot.panchang.tithi.name} - ${snapshot.panchang.tithi.meaning}
- Nakshatra: ${snapshot.panchang.nakshatra.name} - ${snapshot.panchang.nakshatra.meaning}
- Yoga: ${snapshot.panchang.yoga.name} - ${snapshot.panchang.yoga.meaning}
- Karana: ${snapshot.panchang.karana.name} - ${snapshot.panchang.karana.meaning}

3. THE STORY OF THIS CHART
${snapshot.storyOfChart}

4. STRENGTHS
${snapshot.strengths.map(s => `• ${s.title} (${s.placement})\n  ${s.phenomenologicalExperience}`).join('\n\n')}

5. CHALLENGES
${snapshot.challenges.map(c => `• ${c.title} (${c.placement})\n  ${c.phenomenologicalExperience}`).join('\n\n')}

6. CURRENT PHASE
Period: ${snapshot.currentPhase.period}
${snapshot.currentPhase.mandate}
`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <TuriaReportShell
      crumb="Report"
      title="Jyothishya Sanathanam AI Reading"
      subtitle="Classical Parashari Vedic Analysis • Effort × Fate Companion"
      onNavigateHome={onNavigateHome}
      onNavigateOverview={onNavigateOverview}
    >
      {/* Philosophy Banner */}
      <div id="sanathanam-philosophy-banner" className="mb-6 rounded-2xl bg-gradient-to-r from-amber-900/40 via-amber-800/30 to-orange-950/40 border border-amber-500/30 p-5 text-amber-100 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">The Philosophy We Read From</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30">Effort × Fate</span>
              </div>
              <p className="mt-1 text-sm text-amber-100/90 leading-relaxed max-w-3xl">
                Vedic astrology does not predict a fixed destiny. It maps the terrain. <strong>Fate defines the landscape</strong> — what was placed before you. <strong>Effort determines how far you travel within it.</strong> You are the agent; this reading is your map.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <button
              id="view-kundali-file-btn"
              onClick={() => setShowRawModal(true)}
              className="px-3 py-2 text-xs font-medium rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 transition-all flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              Kundali Source
            </button>
            <button
              id="copy-report-btn"
              onClick={handleCopyReport}
              className="px-3 py-2 text-xs font-medium rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold shadow-md transition-all flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Summary'}
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div id="sanathanam-loading-state" className="p-12 text-center rounded-2xl bg-neutral-900/60 border border-neutral-800 text-neutral-400 animate-pulse">
          <div className="w-12 h-12 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-neutral-200">Synthesizing Parashari Kundali Snapshot...</p>
          <p className="text-xs text-neutral-500 mt-1">Reading pre-computed planetary coordinates, panchangam, and vimshottari dasha cycles.</p>
        </div>
      ) : snapshot ? (
        <div className="space-y-6">
          {/* Section 1: Chart Snapshot */}
          <section id="chart-snapshot-section" className="rounded-2xl bg-neutral-900/80 border border-neutral-800/80 p-5 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-neutral-800">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-base font-semibold text-neutral-100">1. Chart Snapshot</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/70">
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Ascendant (Lagna)</span>
                <span className="text-sm font-semibold text-amber-300 mt-1 block leading-snug">{snapshot.snapshot.ascendant}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/70">
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Moon Sign (Rasi)</span>
                <span className="text-sm font-semibold text-cyan-300 mt-1 block leading-snug">{snapshot.snapshot.moonSign}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/70">
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Sun Sign (Surya)</span>
                <span className="text-sm font-semibold text-orange-300 mt-1 block leading-snug">{snapshot.snapshot.sunSign}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/70">
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Janma Nakshatra</span>
                <span className="text-sm font-semibold text-emerald-300 mt-1 block leading-snug">{snapshot.snapshot.janmaNakshatra}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/70 sm:col-span-2 lg:col-span-1">
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">Active Mahadasha</span>
                <span className="text-sm font-semibold text-purple-300 mt-1 block leading-snug">{snapshot.snapshot.currentMahadasha}</span>
              </div>
            </div>
          </section>

          {/* Section 2: Panchang of Your Birth */}
          <section id="birth-panchang-section" className="rounded-2xl bg-neutral-900/80 border border-neutral-800/80 p-5 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-neutral-800">
              <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-neutral-100">2. Panchang of Your Birth</h2>
                <p className="text-xs text-neutral-400">The 5 cosmic time markers at the exact moment of birth, translated into psychological tendencies.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-neutral-950/50 border border-neutral-800 hover:border-neutral-700 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wide">Weekday (Vaara)</span>
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">{snapshot.panchang.weekday.name}</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed mt-2">{snapshot.panchang.weekday.meaning}</p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950/50 border border-neutral-800 hover:border-neutral-700 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wide">Tithi (Lunar Day)</span>
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">{snapshot.panchang.tithi.name}</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed mt-2">{snapshot.panchang.tithi.meaning}</p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950/50 border border-neutral-800 hover:border-neutral-700 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wide">Nakshatra (Moon Mansion)</span>
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">{snapshot.panchang.nakshatra.name}</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed mt-2">{snapshot.panchang.nakshatra.meaning}</p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950/50 border border-neutral-800 hover:border-neutral-700 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wide">Nitya Yoga</span>
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">{snapshot.panchang.yoga.name}</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed mt-2">{snapshot.panchang.yoga.meaning}</p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950/50 border border-neutral-800 hover:border-neutral-700 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wide">Karana (Half-Tithi)</span>
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20">{snapshot.panchang.karana.name}</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed mt-2">{snapshot.panchang.karana.meaning}</p>
              </div>
            </div>
          </section>

          {/* Section 3: The Story of This Chart */}
          <section id="story-of-chart-section" className="rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-amber-950/30 border border-amber-500/20 p-6 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2 className="text-base font-semibold text-neutral-100">3. The Story of This Chart</h2>
            </div>
            <p className="text-sm text-neutral-200 leading-relaxed font-serif tracking-wide bg-neutral-950/40 p-4 rounded-xl border border-neutral-800/80">
              "{snapshot.storyOfChart}"
            </p>
          </section>

          {/* Section 4 & 5: Strengths & Challenges Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 4. Strengths */}
            <section id="strengths-section" className="rounded-2xl bg-neutral-900/80 border border-neutral-800/80 p-5 shadow-xl">
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-neutral-800">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-neutral-100">4. Inherent Strengths</h2>
                  <p className="text-xs text-neutral-400">Placements offering genuine advantages — explained from the inside experience.</p>
                </div>
              </div>

              <div className="space-y-3">
                {snapshot.strengths.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-neutral-950/50 border border-emerald-500/20">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-sm font-semibold text-emerald-300">{item.title}</h3>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 shrink-0">{item.placement}</span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">{item.phenomenologicalExperience}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. Challenges */}
            <section id="challenges-section" className="rounded-2xl bg-neutral-900/80 border border-neutral-800/80 p-5 shadow-xl">
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-neutral-800">
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-neutral-100">5. Growth Friction & Challenges</h2>
                  <p className="text-xs text-neutral-400">Placements that generate tension — phenomenological insight without fatalism.</p>
                </div>
              </div>

              <div className="space-y-3">
                {snapshot.challenges.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-neutral-950/50 border border-rose-500/20">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-sm font-semibold text-rose-300">{item.title}</h3>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-500/10 text-rose-400 shrink-0">{item.placement}</span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">{item.phenomenologicalExperience}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Section 6: Current Phase */}
          <section id="current-phase-section" className="rounded-2xl bg-neutral-900/80 border border-neutral-800/80 p-5 shadow-xl">
            <div className="flex items-center gap-2.5 mb-3 pb-2 border-b border-neutral-800">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between w-full">
                <h2 className="text-base font-semibold text-neutral-100">6. Current Phase Mandate</h2>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {snapshot.currentPhase.period}
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed bg-neutral-950/50 p-4 rounded-xl border border-neutral-800">
              {snapshot.currentPhase.mandate}
            </p>
          </section>

          {/* Section 7: What would you like to explore? (Interactive 2-Year Forecast) */}
          <section id="explore-forecast-section" className="rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900/95 to-neutral-950 border border-neutral-700/80 p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-neutral-800">
              <div>
                <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex">
                    <Compass className="w-4 h-4" />
                  </span>
                  7. What would you like to explore?
                </h2>
                <p className="text-xs text-neutral-400 mt-1">Select a domain or enter a specific inquiry to generate a targeted 2-year Vedic forecast.</p>
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
                  className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
                    selectedTopic === topic
                      ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md scale-[1.02]'
                      : 'bg-neutral-800/80 text-neutral-300 border-neutral-700 hover:bg-neutral-700/80 hover:text-neutral-100'
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
                className="flex-1 px-4 py-2.5 text-xs bg-neutral-950 border border-neutral-700 rounded-xl text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="submit"
                id="submit-custom-inquiry-btn"
                disabled={isForecastLoading || !customQuestion.trim()}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
              >
                {isForecastLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Ask
              </button>
            </form>

            {/* 2-Year Forecast Result Card */}
            {isForecastLoading ? (
              <div className="p-8 text-center rounded-xl bg-neutral-950/60 border border-neutral-800 animate-pulse">
                <RefreshCw className="w-6 h-6 animate-spin text-amber-400 mx-auto mb-2" />
                <p className="text-xs font-medium text-neutral-300">Calculating 2-Year Dasha Lens & Planetary Transits for "{selectedTopic}"...</p>
              </div>
            ) : forecast ? (
              <div id="forecast-result-card" className="rounded-xl bg-neutral-950/80 border border-amber-500/30 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">2-Year Forecast Horizon</span>
                    <span className="text-sm font-semibold text-neutral-200">• {forecast.topic}</span>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-medium">Precision-Calibrated 24-Month Window</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Current Dasha Lens */}
                  <div className="p-3.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
                    <span className="text-xs font-semibold text-purple-300 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      The Dasha Lens
                    </span>
                    <p className="text-xs text-neutral-300 leading-relaxed">{forecast.dashaLens}</p>
                  </div>

                  {/* Key Transits */}
                  <div className="p-3.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
                    <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                      <Compass className="w-3.5 h-3.5" />
                      Key Transits (Next 24 Months)
                    </span>
                    <p className="text-xs text-neutral-300 leading-relaxed">{forecast.keyTransits}</p>
                  </div>

                  {/* Effort Prescription */}
                  <div className="p-3.5 rounded-lg bg-neutral-900/60 border border-emerald-500/20">
                    <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      The Effort Prescription
                    </span>
                    <p className="text-xs text-neutral-300 leading-relaxed">{forecast.effortPrescription}</p>
                  </div>

                  {/* What to Watch For */}
                  <div className="p-3.5 rounded-lg bg-neutral-900/60 border border-rose-500/20">
                    <span className="text-xs font-semibold text-rose-300 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      What to Watch For
                    </span>
                    <p className="text-xs text-neutral-300 leading-relaxed">{forecast.whatToWatchFor}</p>
                  </div>
                </div>

                {/* Astrologer Referral Callout for High-Weight Questions */}
                {forecast.requiresAstrologerReferral && (
                  <div id="astrologer-referral-banner" className="mt-4 p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Dedicated Reading Recommended</span>
                      </div>
                      <p className="text-xs text-amber-200/90 leading-relaxed">{forecast.referralReason}</p>
                    </div>
                    <a
                      href="https://jyothishya-sanathanam.app/astrologers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all flex items-center gap-1.5 shrink-0 shadow"
                    >
                      Consult Astrologer
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-neutral-200">Jyothishya Sanathanam Pre-Computed Kundali File</h3>
              </div>
              <button
                onClick={() => setShowRawModal(false)}
                className="text-neutral-400 hover:text-neutral-200 text-xs px-2 py-1 rounded-md bg-neutral-800"
              >
                Close
              </button>
            </div>
            <div className="p-4 overflow-y-auto font-mono text-xs text-neutral-300 whitespace-pre-wrap bg-neutral-950/80 flex-1">
              {snapshot?.rawMarkdown || 'Generating markdown...'}
            </div>
            <div className="p-3 border-t border-neutral-800 bg-neutral-950/50 flex justify-end gap-2">
              <button
                onClick={() => {
                  if (snapshot?.rawMarkdown) {
                    navigator.clipboard.writeText(snapshot.rawMarkdown);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Raw Markdown'}
              </button>
            </div>
          </div>
        </div>
      )}
    </TuriaReportShell>
  );
};
