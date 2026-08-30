import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Loader2, 
  AlertCircle, 
  Sparkles, 
  ShieldAlert, 
  Layers, 
  BarChart3, 
  Edit3, 
  User, 
  Search, 
  Calendar, 
  MapPin, 
  Check, 
  ArrowRight,
  ArrowLeft,
  UserCheck
} from 'lucide-react';
import PersonBirthForm from '../components/PersonBirthForm';
import PersonSummaryCard from '../components/PersonSummaryCard';
import LagnaChartCard from '../components/LagnaChartCard';
import CompatibilityRulesCard from '../components/CompatibilityRulesCard';
import KutaBreakdownCard from '../components/KutaBreakdownCard';
import { DoshasView } from '../components/DoshasView';
import { checkMarriageMatch } from '../lib/marriageMatchAPI';
import { PersonFormData, MarriageMatchResult, ChartStyle, SavedPerson } from '../types/marriageMatch';
import { safeSetLocalStorageItem } from '../lib/storageUtils';
import { Button } from '../components/design-system/Button';
import { ProfileStorageService } from '../lib/profileStorageService';

const defaultFormData: PersonFormData = {
  name: '',
  gender: 'Male',
  date: '1995-01-01',
  time: '12:00:00',
  place: '',
  latitude: 0,
  longitude: 0,
  timezone: 0,
};

const labels = {
  en: {
    title: "Compatibility Check",
    subtitle: "Enter details below or select from your saved Kundalis to perform a comprehensive Ashtakoota and Dasakoota matching analysis.",
    tabBoy: "Boy's Details",
    tabGirl: "Girl's Details",
    checkBtn: "Check Compatibility",
    checking: "Calculating Astrological Alignment...",
    boyDetails: "Groom's Profile",
    girlDetails: "Bride's Profile",
    retry: "Retry Calculation",
    errorTitle: "Calculation Notice",
    boyChartTitle: "Groom's Lagna Chart (D-1)",
    girlChartTitle: "Bride's Lagna Chart (D-1)",
    editForms: "Modify Input Data",
    tabRules: "Compatibility Rules",
    tabCharts: "Birth Charts (D-1)",
    tabKuta: "Ashta Kuta Breakdown",
    tabDoshas: "Doshas & Remedies",
    savedProfiles: "Saved Profiles",
    searchPlaceholder: "Search saved profiles...",
    setAsBoy: "Set as Boy",
    setAsGirl: "Set as Girl",
    activeLabel: "Active",
    noMaleProfiles: "No saved male profiles found.",
    noFemaleProfiles: "No saved female profiles found.",
    maleListSubtitle: "Saved Male Kundalis",
    femaleListSubtitle: "Saved Female Kundalis",
    boyFilled: "Boy profile set",
    girlFilled: "Girl profile set",
    fillNextGirl: "Next: Enter Girl's Details →",
    readyToMatch: "Both profiles are ready for compatibility analysis"
  },
  hi: {
    title: "विवाह अनुकूलता मिलान",
    subtitle: "अष्टकूट और दशाकूट मिलान विश्लेषण के लिए विवरण दर्ज करें या सहेजी गई कुंडलियों में से चुनें।",
    tabBoy: "वर का विवरण",
    tabGirl: "वधू का विवरण",
    checkBtn: "अनुकूलता की जांच करें",
    checking: "ज्योतिषीय संरेखण की गणना हो रही है...",
    boyDetails: "वर प्रोफ़ाइल",
    girlDetails: "वधू प्रोफ़ाइल",
    retry: "पुनः प्रयास करें",
    errorTitle: "गणना सूचना",
    boyChartTitle: "वर लग्न कुंडली (D-1)",
    girlChartTitle: "वधू लग्न कुंडली (D-1)",
    editForms: "विवरण संपादित करें",
    tabRules: "अनुकूलता नियम",
    tabCharts: "जन्म कुंडली (D-1)",
    tabKuta: "अष्टकूट ब्रेकडाउन",
    tabDoshas: "दोष और उपचार",
    savedProfiles: "सहेजे गए प्रोफाइल",
    searchPlaceholder: "प्रोफ़ाइल खोजें...",
    setAsBoy: "वर के रूप में चुनें",
    setAsGirl: "वधू के रूप में चुनें",
    activeLabel: "सक्रिय",
    noMaleProfiles: "कोई सहेजी गई पुरुष प्रोफाइल नहीं मिली।",
    noFemaleProfiles: "कोई सहेजी गई महिला प्रोफाइल नहीं मिली।",
    maleListSubtitle: "सहेजी गई पुरुष कुंडलियां",
    femaleListSubtitle: "सहेजी गई महिला कुंडलियां",
    boyFilled: "वर प्रोफ़ाइल सेट है",
    girlFilled: "वधू प्रोफ़ाइल सेट है",
    fillNextGirl: "आगे: वधू का विवरण दर्ज करें →",
    readyToMatch: "दोनों प्रोफाइल मिलान के लिए तैयार हैं"
  },
  te: {
    title: "వివాహ పొంతన విశ్లేషణ",
    subtitle: "అష్టకూట మరియు దశకూట జాతక పొంతన విశ్లేషణ కోసం వివరాలు నమోదు చేయండి లేదా సేవ్ చేసిన ప్రొఫైల్స్ నుండి ఎంచుకోండి.",
    tabBoy: "వరుడి వివరాలు",
    tabGirl: "వధువు వివరాలు",
    checkBtn: "వివాహ అనుకూలతను తనిఖీ చేయండి",
    checking: "జాతక పొంతన తనిఖీ చేస్తున్నాము...",
    boyDetails: "వరుడి ప్రొఫైల్",
    girlDetails: "వధువు ప్రొఫైల్",
    retry: "మళ్లీ ప్రయత్నించండి",
    errorTitle: "లోపం సమాచారం",
    boyChartTitle: "వరుడి లగ్న కుండలి (D-1)",
    girlChartTitle: "వధువు లగ్న కుండలి (D-1)",
    editForms: "వివరాలను సవరించండి",
    tabRules: "అనుకూలత సూత్రాలు",
    tabCharts: "జాతక చక్రాలు (D-1)",
    tabKuta: "అష్టకూట విశ్లేషణ",
    tabDoshas: "దోషాలు & పరిహారాలు",
    savedProfiles: "సేవ్ చేసిన ప్రొఫైల్స్",
    searchPlaceholder: "ప్రొఫైల్స్ వెతకండి...",
    setAsBoy: "వరుడిగా ఎంచుకోండి",
    setAsGirl: "వధువుగా ఎంచుకోండి",
    activeLabel: "ఎంచుకోబడింది",
    noMaleProfiles: "సేవ్ చేసిన పురుషుల ప్రొఫైల్స్ లేవు.",
    noFemaleProfiles: "సేవ్ చేసిన మహిళల ప్రొఫైల్స్ లేవు.",
    maleListSubtitle: "సేవ్ చేసిన పురుషుల జాతకాలు",
    femaleListSubtitle: "సేవ్ చేసిన మహిళల జాతకాలు",
    boyFilled: "వరుడి వివరాలు పూర్తయ్యాయి",
    girlFilled: "వధువు వివరాలు పూర్తయ్యాయి",
    fillNextGirl: "తరువాత: వధువు వివరాలు నమోదు చేయండి →",
    readyToMatch: "రెండు ప్రొఫైల్స్ పొంతన విశ్లేషణకు సిద్ధంగా ఉన్నాయి"
  }
};

interface MarriageMatchProps {
  language?: 'en' | 'hi' | 'te';
  savedProfiles?: SavedPerson[];
  onBack?: () => void;
  onNavigatePage?: (page: string) => void;
}

export const MarriageMatch: React.FC<MarriageMatchProps> = ({ 
  language = 'en',
  savedProfiles: propSavedProfiles,
  onBack,
  onNavigatePage
}) => {
  const l = labels[language] || labels.en;

  // Active form tab: 'boy' (Groom) | 'girl' (Bride)
  const [activeFormTab, setActiveFormTab] = useState<'boy' | 'girl'>('boy');

  // Form states
  const [boyFormData, setBoyFormData] = useState<PersonFormData>({
    ...defaultFormData,
    gender: 'Male'
  });
  const [girlFormData, setGirlFormData] = useState<PersonFormData>({
    ...defaultFormData,
    gender: 'Female'
  });

  // Saved profiles state
  const [allProfiles, setAllProfiles] = useState<SavedPerson[]>(propSavedProfiles || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const [chartStyle, setChartStyle] = useState<ChartStyle>('east-indian');
  const [matchResult, setMatchResult] = useState<MarriageMatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active Deep-Dive Tab (defaulting to Birth Charts as first tab)
  const [activeTab, setActiveTab] = useState<'charts' | 'kuta' | 'doshas'>('charts');

  // Form Collapse state when results are generated
  const [showForms, setShowForms] = useState(true);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Subscribe to profile storage
  useEffect(() => {
    const unsub = ProfileStorageService.subscribe((profiles) => {
      if (profiles && profiles.length > 0) {
        setAllProfiles(profiles);
      }
    });
    const current = ProfileStorageService.getProfiles();
    if (current && current.length > 0) {
      setAllProfiles(current);
    }
    return unsub;
  }, []);

  // Update when propSavedProfiles changes
  useEffect(() => {
    if (propSavedProfiles && propSavedProfiles.length > 0) {
      setAllProfiles(propSavedProfiles);
    }
  }, [propSavedProfiles]);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sanathanam_last_marriage_match');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.boy) setBoyFormData(parsed.boy);
        if (parsed.girl) setGirlFormData(parsed.girl);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Save to local storage when form changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      safeSetLocalStorageItem('sanathanam_last_marriage_match', JSON.stringify({ boy: boyFormData, girl: girlFormData }));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [boyFormData, girlFormData]);

  const isFormComplete = (data: PersonFormData) => {
    return !!(data.name && data.name.trim() && data.date && data.time && data.place && data.place.trim());
  };

  const isBoyReady = isFormComplete(boyFormData);
  const isGirlReady = isFormComplete(girlFormData);
  const isSubmitDisabled = loading || !isBoyReady || !isGirlReady;

  const handleCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isBoyReady || !isGirlReady) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await checkMarriageMatch({ boy: boyFormData, girl: girlFormData });
      setMatchResult(result);
      setShowForms(false); // Collapse forms so results are front-and-center
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during calculation.");
    } finally {
      setLoading(false);
    }
  };

  // Select profile for active tab
  const handleSelectProfileForActiveTab = (profile: SavedPerson) => {
    const profileData: PersonFormData = {
      name: profile.name,
      gender: profile.gender,
      date: profile.date,
      time: profile.time,
      place: profile.place,
      latitude: profile.latitude,
      longitude: profile.longitude,
      timezone: profile.timezone,
    };

    if (activeFormTab === 'boy') {
      setBoyFormData(profileData);
    } else {
      setGirlFormData(profileData);
    }
  };

  // Filter profiles based on current active tab gender and search query
  const relevantGender = activeFormTab === 'boy' ? 'Male' : 'Female';
  const displayedProfiles = allProfiles
    .filter((p) => p.gender === relevantGender)
    .filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (p.name || '').toLowerCase().includes(q) || (p.place || '').toLowerCase().includes(q);
    });

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

  // Check if a saved profile is currently active in the form
  const isProfileActive = (p: SavedPerson) => {
    const currentData = activeFormTab === 'boy' ? boyFormData : girlFormData;
    return (
      (p.name || '').trim().toLowerCase() === (currentData.name || '').trim().toLowerCase() &&
      p.date === currentData.date &&
      p.time === currentData.time
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C3E50] pb-28 font-sans selection:bg-[#FFDDB3] selection:text-[#684300]">
      {matchResult && (
        <div className="bg-[#FAF7F2] border-b border-[#D4C5B9]/40 py-2.5 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs">
            <span className="font-serif font-semibold text-[#2C3E50]">Marriage Matching Result</span>
            <Button
              variant="secondary"
              size="sm"
              icon={<Edit3 className="w-4 h-4" />}
              onClick={() => setShowForms(!showForms)}
            >
              {showForms ? "Hide Input Forms" : l.editForms}
            </Button>
          </div>
        </div>
      )}

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 animate-fade-in max-w-6xl mx-auto space-y-6">

      {/* INPUTS & PROFILES SECTION */}
      {showForms && (
        <div className="space-y-6">
          
          {/* Main Form & Saved Profiles Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Form Card with Two-Tab Navigation Pill */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#D4C5B9]/40 shadow-[0px_4px_20px_rgba(26,35,126,0.04)] overflow-hidden">
              
              {/* TWO TAB NAVIGATION PILL */}
              <div className="flex border-b border-[#D4C5B9]/30 bg-[#FDFBF7]">
                <button
                  type="button"
                  onClick={() => setActiveFormTab('boy')}
                  className={`flex-1 py-3.5 px-4 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeFormTab === 'boy'
                      ? 'text-[#2C3E50] border-b-2 border-[#2C3E50] bg-white shadow-2xs font-bold'
                      : 'text-[#767683] hover:text-[#071E27] hover:bg-white/50'
                  }`}
                >
                  <span className="text-base">♂</span>
                  <span>{l.tabBoy}</span>
                  {isBoyReady && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFormTab('girl')}
                  className={`flex-1 py-3.5 px-4 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeFormTab === 'girl'
                      ? 'text-[#E67E22] border-b-2 border-[#E67E22] bg-white shadow-2xs font-bold'
                      : 'text-[#767683] hover:text-[#071E27] hover:bg-white/50'
                  }`}
                >
                  <span className="text-base">♀</span>
                  <span>{l.tabGirl}</span>
                  {isGirlReady && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </button>
              </div>

              {/* Form Content */}
              <div className="p-5 sm:p-6">
                {activeFormTab === 'boy' ? (
                  <div key="boy-form-container" className="animate-in fade-in duration-200">
                    <PersonBirthForm
                      gender="Male"
                      language={language}
                      value={boyFormData}
                      onUpdate={setBoyFormData}
                      isLoading={loading}
                      embedded={true}
                    />
                  </div>
                ) : (
                  <div key="girl-form-container" className="animate-in fade-in duration-200">
                    <PersonBirthForm
                      gender="Female"
                      language={language}
                      value={girlFormData}
                      onUpdate={setGirlFormData}
                      isLoading={loading}
                      embedded={true}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Saved Profiles Sidebar (Kundali Page Style) */}
            <aside className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#D4C5B9]/40 shadow-[0px_4px_20px_rgba(26,35,126,0.04)]">
                
                {/* Header with search toggle */}
                <div className="flex items-center justify-between pb-3 border-b border-[#D4C5B9]/30 mb-3">
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#071E27] flex items-center gap-2">
                      <span className="text-[#E67E22]">✦</span>
                      <span>{l.savedProfiles}</span>
                    </h3>
                    <p className="text-[11px] text-[#767683] mt-0.5">
                      {activeFormTab === 'boy' ? l.maleListSubtitle : l.femaleListSubtitle} ({displayedProfiles.length})
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSearch(!showSearch)}
                    className={`p-2 rounded-full transition-colors cursor-pointer ${
                      showSearch ? 'bg-[#E67E22]/15 text-[#E67E22]' : 'text-[#767683] hover:bg-[#F5ECE1]'
                    }`}
                    title="Search profiles"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>

                {/* Search Input Bar */}
                {showSearch && (
                  <div className="mb-3 relative animate-in fade-in duration-150">
                    <input
                      type="text"
                      placeholder={l.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-[#FDFBF7] border border-[#C6C5D4] rounded-xl text-xs sm:text-sm text-[#071E27] focus:outline-none focus:border-[#E67E22]"
                    />
                    <Search className="w-4 h-4 text-[#767683] absolute left-3 top-2.5 pointer-events-none" />
                  </div>
                )}

                {/* Profiles List (Kundali Page Style) */}
                <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
                  {displayedProfiles.map((profile) => {
                    const isActive = isProfileActive(profile);

                    return (
                      <div
                        key={profile.id}
                        onClick={() => handleSelectProfileForActiveTab(profile)}
                        className={`group relative p-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 shadow-2xs hover:shadow-sm cursor-pointer active:scale-[0.99] ${
                          isActive
                            ? 'border-[#E67E22] ring-1 ring-[#E67E22]/30 bg-[#FFFDF9]'
                            : 'border-[#D4C5B9]/30 hover:border-[#E67E22]/50 hover:bg-[#FDFBF7]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Avatar Icon */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                            profile.gender === 'Male'
                              ? 'bg-[#2C3E50]/10 text-[#2C3E50] border-[#2C3E50]/20'
                              : 'bg-[#E67E22]/10 text-[#E67E22] border-[#E67E22]/20'
                          }`}>
                            <span className="font-bold text-sm">
                              {profile.gender === 'Male' ? '♂' : '♀'}
                            </span>
                          </div>

                          {/* Profile Information */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-sans font-semibold text-xs sm:text-sm text-[#071E27] truncate">
                                {profile.name}
                              </h4>
                              {isActive && (
                                <span className="text-[9px] uppercase font-bold bg-[#E67E22]/15 text-[#E67E22] px-1.5 py-0.5 rounded-full shrink-0">
                                  {l.activeLabel}
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-[#767683] font-mono mt-0.5 truncate flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#767683] shrink-0" />
                              <span>{formatDateDisplay(profile.date)}</span>
                              <span>•</span>
                              <span className="truncate">{profile.place || 'Unknown'}</span>
                            </p>
                          </div>
                        </div>

                        {/* Action Pill */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectProfileForActiveTab(profile);
                          }}
                          className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-[#E67E22]/10 text-[#E67E22] hover:bg-[#E67E22] hover:text-white'
                          }`}
                        >
                          {isActive ? (
                            <span className="flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>{l.activeLabel}</span>
                            </span>
                          ) : (
                            <span>{activeFormTab === 'boy' ? l.setAsBoy : l.setAsGirl}</span>
                          )}
                        </button>
                      </div>
                    );
                  })}

                  {displayedProfiles.length === 0 && (
                    <div className="bg-[#FDFBF7] p-6 rounded-xl border border-[#D4C5B9]/30 border-dashed text-center">
                      <p className="text-xs text-[#767683]">
                        {activeFormTab === 'boy' ? l.noMaleProfiles : l.noFemaleProfiles}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>

          {/* Primary Action Button Section */}
          <div className="bg-white rounded-2xl p-5 border border-[#D4C5B9]/40 shadow-2xs space-y-3">
            {error && (
              <div className="p-4 bg-error-container/30 border border-error-container rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-error">{l.errorTitle}</p>
                  <p className="text-xs text-error/90 mt-1">{error}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-error"
                    onClick={handleCheck}
                  >
                    {l.retry}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs sm:text-sm text-[#767683]">
                {isBoyReady && isGirlReady ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{l.readyToMatch}</span>
                  </span>
                ) : (
                  <span>
                    {!isBoyReady ? "• Fill boy details " : "✓ Boy ready "}
                    {!isGirlReady ? "• Fill girl details" : "✓ Girl ready"}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleCheck}
                disabled={isSubmitDisabled}
                className={`px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  isSubmitDisabled
                    ? 'bg-[#D4C5B9]/50 text-[#767683] cursor-not-allowed opacity-60'
                    : 'bg-[#E67E22] hover:bg-[#D35400] text-white hover:shadow-lg active:scale-[0.98]'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{l.checking}</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5 fill-white" />
                    <span>{l.checkBtn}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating CTA (Mobile Only - Thumb Zone) */}
      {showForms && (
        <div className="lg:hidden fixed bottom-[76px] right-4 left-4 z-40">
          <button
            type="button"
            onClick={handleCheck}
            disabled={isSubmitDisabled}
            className={`w-full font-bold text-sm py-3.5 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
              isSubmitDisabled
                ? 'bg-[#D4C5B9] text-[#767683] cursor-not-allowed opacity-80'
                : 'bg-[#E67E22] text-white hover:bg-[#D35400] active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{l.checking}</span>
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 fill-white" />
                <span>{l.checkBtn}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Loading Placeholder */}
      {loading && (
        <div className="w-full min-h-[360px] flex flex-col items-center justify-center text-[#E67E22] border-2 border-dashed border-[#D4C5B9]/40 rounded-3xl p-8 text-center bg-white shadow-md">
          <Loader2 className="w-12 h-12 mb-4 animate-spin text-[#E67E22]" />
          <p className="text-sm font-semibold tracking-wider uppercase text-[#071E27] animate-pulse">
            {l.checking}
          </p>
        </div>
      )}

      {/* RESULTS PRESENTATION */}
      {matchResult && !loading && (
        <div ref={resultsRef} className="space-y-8 animate-fade-in w-full">
          
          {/* TIER 1: HERO VERDICT BANNER */}
          <div className="w-full">
            <div className="w-full rounded-2xl">
              <CompatibilityRulesCard
                kutas={matchResult.kutas}
                totalScore={matchResult.totalScore}
                maxScore={matchResult.maxScore}
                language={language}
              />
            </div>
          </div>

          {/* TIER 2: PROFILES SIDE BY SIDE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <PersonSummaryCard
              cardTitle={l.boyDetails}
              borderColor="blue"
              manglikDoshaPresent={matchResult.manglik?.boy}
              person={{
                name: boyFormData.name,
                date: boyFormData.date,
                time: boyFormData.time,
                place: boyFormData.place,
                nakshatra: matchResult.boyInfo?.nakshatra || "Unknown",
                rasi: matchResult.boyInfo?.rasi || "Unknown",
                lagna: matchResult.boyInfo?.lagna || "Unknown",
              }}
            />
            <PersonSummaryCard
              cardTitle={l.girlDetails}
              borderColor="purple"
              manglikDoshaPresent={matchResult.manglik?.girl}
              person={{
                name: girlFormData.name,
                date: girlFormData.date,
                time: girlFormData.time,
                place: girlFormData.place,
                nakshatra: matchResult.girlInfo?.nakshatra || "Unknown",
                rasi: matchResult.girlInfo?.rasi || "Unknown",
                lagna: matchResult.girlInfo?.lagna || "Unknown",
              }}
            />
          </div>

          {/* TIER 3: TECHNICAL DEEP-DIVES (Tab Navigation) */}
          <div className="space-y-6 pt-4">
            
            {/* Tab Selector Bar */}
            <div className="flex items-center gap-2 p-1.5 overflow-x-auto custom-scrollbar">
              <Button
                variant={activeTab === 'charts' ? 'primary' : 'ghost'}
                size="sm"
                icon={<Layers className="w-4 h-4" />}
                onClick={() => setActiveTab('charts')}
              >
                {l.tabCharts}
              </Button>

              <Button
                variant={activeTab === 'kuta' ? 'primary' : 'ghost'}
                size="sm"
                icon={<BarChart3 className="w-4 h-4" />}
                onClick={() => setActiveTab('kuta')}
              >
                {l.tabKuta}
              </Button>

              <Button
                variant={activeTab === 'doshas' ? 'primary' : 'ghost'}
                size="sm"
                icon={<ShieldAlert className="w-4 h-4" />}
                onClick={() => setActiveTab('doshas')}
              >
                {l.tabDoshas}
              </Button>
            </div>

            {/* TAB CONTENT PANELS */}
            {activeTab === 'charts' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                <LagnaChartCard
                  horoscope={matchResult.boyHoroscope}
                  cardTitle={l.boyChartTitle}
                  borderColor="blue"
                  chartStyle={chartStyle}
                  onChartStyleChange={setChartStyle}
                />
                <LagnaChartCard
                  horoscope={matchResult.girlHoroscope}
                  cardTitle={l.girlChartTitle}
                  borderColor="purple"
                  chartStyle={chartStyle}
                  onChartStyleChange={setChartStyle}
                />
              </div>
            )}

            {activeTab === 'kuta' && (
              matchResult.kutas.map((kuta, index) => (
                <KutaBreakdownCard
                  key={index}
                  kuta={{
                    name: kuta.name,
                    maxPoints: kuta.max,
                    obtainedPoints: kuta.boyValue,
                    status: kuta.isUnfavourable ? 'unfavorable' : (kuta.boyValue < kuta.max ? 'moderate' : 'favorable'),
                    description: kuta.description || kuta.details || ''
                  }}
                />
              ))
            )}

            {activeTab === 'doshas' && (
              <DoshasView
                doshas={matchResult.doshas || {}}
                boyHoroscope={matchResult.boyHoroscope}
                girlHoroscope={matchResult.girlHoroscope}
                language={language}
              />
            )}

          </div>

        </div>
      )}

      </div>
    </div>
  );
};

export default MarriageMatch;

