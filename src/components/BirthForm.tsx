import React, { useState, useEffect, useRef } from 'react';
import { BirthDetails, LocationSuggestion } from '../types';
import { SavedPerson } from '../types/marriageMatch';
import { getSavedPersons } from '../lib/savedPersons';
import { MapPin, Clock, Calendar, Search, RefreshCw, AlertCircle, ChevronDown, SlidersHorizontal, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { TimeWheelPicker } from './WheelPicker';

interface BirthFormProps {
  onSubmit: (details: BirthDetails) => void;
  initialValues?: BirthDetails | null;
  loading?: boolean;
  error?: string | null;
  language?: 'en' | 'hi' | 'te';
  embedded?: boolean;
  hideHeader?: boolean;
  title?: string;
  subtitle?: string;
  submitButtonText?: string;
  onCancel?: () => void;
}

const formLabels = {
  en: {
    title: "New Kundali",
    subtitle: "Enter birth details for precise calculation.",
    fullName: "Native's Name",
    namePlaceholder: "Enter full name",
    genderSelection: "Gender",
    male: "Male",
    female: "Female",
    other: "Other",
    dob: "Date of Birth",
    tob: "Time of Birth",
    approxTime: "Unsure / Approximate time",
    pob: "Place of Birth (City)",
    pobPlaceholder: "Search city (e.g. Hyderabad, New Delhi)",
    coordsTz: "Coordinates & Timezone (Auto-detected)",
    coordsSub: "Auto-detected from place search. Edit manually only if needed.",
    lat: "Latitude",
    lng: "Longitude",
    utcOffset: "UTC Offset (Hrs)",
    genFailed: "Calculation Notice",
    calculating: "Generating...",
    next: "Next",
    back: "Back",
    startHoroscope: "Generate",
    updateHoroscope: "Update Kundali",
    noMatchingPlaces: "No matching places found. Enter details manually below.",
    connectionFailed: "Connection failed. Please specify coordinates manually.",
    step1Title: "Step 1: Identity & Time",
    step2Title: "Step 2: Place & Gender",
  },
  hi: {
    title: "नई कुंडली",
    subtitle: "सटीक वैदिक कुंडली गणना के लिए जन्म डेटा दर्ज करें।",
    fullName: "जातक का नाम",
    namePlaceholder: "पूरा नाम दर्ज करें",
    genderSelection: "लिंग",
    male: "पुरुष",
    female: "महिला",
    other: "अन्य",
    dob: "जन्म तिथि",
    tob: "जन्म का समय",
    approxTime: "अनुमानित समय",
    pob: "जन्म स्थान (शहर)",
    pobPlaceholder: "शहर खोजें (उदा. हैदराबाद, नई दिल्ली)",
    coordsTz: "उन्नत निर्देशांक और समयक्षेत्र",
    coordsSub: "स्थान खोज से स्वतः पता लगाया गया।",
    lat: "अक्षांश",
    lng: "रेखांश",
    utcOffset: "यूटीसी ऑफसेट",
    genFailed: "गणना सूचना",
    calculating: "कुंडली तैयार हो रही है...",
    next: "आगे",
    back: "पीछे",
    startHoroscope: "कुंडली बनाएं",
    updateHoroscope: "कुंडली अपडेट करें",
    noMatchingPlaces: "कोई मिलान स्थान नहीं मिला।",
    connectionFailed: "कनेक्शन विफल रहा।",
    step1Title: "चरण 1: पहचान और समय",
    step2Title: "चरण 2: स्थान और लिंग",
  },
  te: {
    title: "కొత్త కుండలి",
    subtitle: "ఖచ్చితమైన జాతక విశ్లేషణ కోసం జనన వివరాలు అందించండి.",
    fullName: "వ్యక్తి పేరు",
    namePlaceholder: "పూర్తి పేరు నమోదు చేయండి",
    genderSelection: "లింగం",
    male: "పురుషుడు",
    female: "స్త్రీ",
    other: "ఇతర",
    dob: "పుట్టిన తేదీ",
    tob: "పుట్టిన సమయం",
    approxTime: "సుమారు సమయం",
    pob: "పుట్టిన స్థలం (నగరం)",
    pobPlaceholder: "నగరం వెతకండి (ఉదా. హైదరాబాద్, ఢిల్లీ)",
    coordsTz: "అక్షాంశ రేఖాంశాల వివరాలు",
    coordsSub: "స్వయంచాలకంగా తీసుకోబడింది.",
    lat: "అక్షాంశం",
    lng: "రేఖాంశం",
    utcOffset: "టైమ్ జోన్",
    genFailed: "గమనిక",
    calculating: "కుండలి లెక్కిస్తున్నాము...",
    next: "తరువాత",
    back: "వెనుకకు",
    startHoroscope: "కుండలి రూపొందించండి",
    updateHoroscope: "కుండలిని అప్‌డేట్ చేయండి",
    noMatchingPlaces: "సరిపోలే స్థలాలు లేవు.",
    connectionFailed: "కనెక్షన్ విఫలమైంది.",
    step1Title: "దశ 1: గుర్తింపు & సమయం",
    step2Title: "దశ 2: స్థలం & లింగం",
  }
};

export const BirthForm: React.FC<BirthFormProps> = ({
  onSubmit,
  initialValues,
  loading = false,
  error = null,
  language = 'en',
  embedded = false,
  hideHeader = false,
  title,
  subtitle,
  submitButtonText,
  onCancel
}) => {
  const l = formLabels[language] || formLabels.en;

  // Progressive Step State (1 or 2)
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [approximateTime, setApproximateTime] = useState(false);
  const [place, setPlace] = useState('');
  const [latitude, setLatitude] = useState('17.3850');
  const [longitude, setLongitude] = useState('78.4867');
  const [timezone, setTimezone] = useState('5.5');

  // UI States
  const [showAdvancedCoords, setShowAdvancedCoords] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Autocomplete state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Time Picker Popover state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const timePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name || '');
      setGender((initialValues.gender as any) || 'Male');
      setDate(initialValues.date || '');
      setTime(initialValues.time || '');
      setApproximateTime(initialValues.approximateTime || false);
      setPlace(initialValues.place || '');
      setLatitude(initialValues.latitude ? initialValues.latitude.toString() : '17.3850');
      setLongitude(initialValues.longitude ? initialValues.longitude.toString() : '78.4867');
      setTimezone(initialValues.timezone ? initialValues.timezone.toString() : '5.5');
      setSearchQuery(initialValues.place || '');
    } else {
      // Clean defaults
      setName('');
      setGender('Male');
      setDate('1996-11-11');
      setTime('13:50:00');
      setApproximateTime(false);
      setPlace('Hyderabad');
      setLatitude('17.3850');
      setLongitude('78.4867');
      setTimezone('5.5');
      setSearchQuery('Hyderabad');
    }
  }, [initialValues]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (timePickerRef.current && !timePickerRef.current.contains(event.target as Node)) {
        setShowTimePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced location search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    if (searchQuery === place) return;

    const delayDebounce = setTimeout(async () => {
      setSearching(true);
      setSearchError(null);
      try {
        const res = await fetch(`/api/jhora-proxy/location/autocomplete?q=${encodeURIComponent(searchQuery)}`);
        if (!res.ok) {
          const fallbackRes = await fetch(`https://jagannatha-hora-359167915530.europe-west1.run.app/location/autocomplete?q=${encodeURIComponent(searchQuery)}`);
          if (!fallbackRes.ok) throw new Error('Failed to retrieve location results');
          const fbData = await fallbackRes.json();
          if (fbData.results && fbData.results.length > 0) {
            setSuggestions(fbData.results);
            setShowDropdown(true);
            return;
          }
        }
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setSuggestions(data.results);
          setShowDropdown(true);
        } else {
          setSuggestions([]);
          setSearchError(l.noMatchingPlaces);
          setShowDropdown(true);
        }
      } catch (err: any) {
        console.warn('Location lookup fallback:', err);
        setSearchError(l.connectionFailed);
        setSuggestions([]);
        setShowDropdown(true);
      } finally {
        setSearching(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, place, l.noMatchingPlaces, l.connectionFailed]);

  const handleSelectSuggestion = (item: LocationSuggestion) => {
    setPlace(item.place);
    setSearchQuery(item.displayName);
    setLatitude(item.latitude.toString());
    setLongitude(item.longitude.toString());
    setTimezone(item.timezone.toString());
    setSuggestions([]);
    setShowDropdown(false);
    setSearchError(null);
  };

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim()) {
      setValidationError("Please enter the native's name.");
      return;
    }
    if (!date) {
      setValidationError("Please select the date of birth.");
      return;
    }
    if (!time && !approximateTime) {
      setValidationError("Please enter the time of birth or select approximate time.");
      return;
    }

    setStep(2);
  };

  const handlePrevStep = () => {
    setValidationError(null);
    setStep(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim()) {
      setStep(1);
      setValidationError("Please enter the native's name.");
      return;
    }
    if (!date) {
      setStep(1);
      setValidationError("Please select the date of birth.");
      return;
    }
    if (!place.trim()) {
      setValidationError("Please enter the place of birth (city).");
      return;
    }

    const latVal = parseFloat(latitude);
    const lngVal = parseFloat(longitude);
    const tzVal = parseFloat(timezone);

    if (isNaN(latVal) || isNaN(lngVal) || isNaN(tzVal)) {
      setValidationError("Coordinates and timezone must be valid numbers.");
      return;
    }

    const finalTime = approximateTime && !time ? '12:00:00' : (time || '12:00:00');

    onSubmit({
      name: name.trim(),
      gender: gender as any,
      date,
      time: finalTime,
      approximateTime,
      place: place.trim(),
      latitude: latVal,
      longitude: lngVal,
      timezone: tzVal
    });
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className={`w-full ${embedded ? '' : 'bg-white rounded-2xl p-5 sm:p-6 border border-[#D4C5B9]/40 shadow-[0px_4px_20px_rgba(26,35,126,0.04)]'}`}>
      {/* Header Section */}
      {!hideHeader && (
        <div className="mb-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl sm:text-[28px] font-semibold text-[#071E27] tracking-tight">
              {title || l.title}
            </h2>
            {/* Step Pill Indicator */}
            <div className="inline-flex items-center gap-1 bg-[#F5ECE1] px-2.5 py-1 rounded-full text-xs font-semibold text-[#E67E22]">
              <span>Step {step} of 2</span>
            </div>
          </div>
          <p className="text-sm text-[#767683] mt-1">
            {subtitle || l.subtitle}
          </p>
        </div>
      )}

      {/* Validation / Error Banner */}
      {(validationError || error) && (
        <div className="mb-4 p-3.5 rounded-xl border border-[#BA1A1A]/30 bg-[#FFDAD6]/30 text-[#BA1A1A] text-xs flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">{validationError || error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* STEP 1: IDENTITY & TIME */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-left duration-200">
            {/* Native's Name Input */}
            <div className="relative">
              <input
                id="native-name-input"
                type="text"
                required
                placeholder=" "
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="peer w-full pt-5 pb-1.5 px-3 bg-transparent border-0 border-b border-[#C6C5D4] text-base text-[#071E27] focus:outline-none focus:border-[#E67E22] transition-colors"
              />
              <label
                htmlFor="native-name-input"
                className="absolute left-3 top-4 text-sm text-[#767683] transition-all duration-200 pointer-events-none peer-focus:-top-0.5 peer-focus:text-[11px] peer-focus:text-[#E67E22] peer-focus:font-semibold peer-[:not(:placeholder-shown)]:-top-0.5 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:text-[#E67E22] peer-[:not(:placeholder-shown)]:font-semibold"
              >
                {l.fullName}
              </label>
            </div>

            {/* Date & Time of Birth (2 Columns) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Date of Birth */}
              <div className="relative">
                <input
                  id="native-dob-input"
                  type="date"
                  required
                  max={todayStr}
                  placeholder=" "
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="peer w-full pt-5 pb-1.5 px-3 pr-8 bg-transparent border-0 border-b border-[#C6C5D4] text-sm sm:text-base text-[#071E27] font-mono focus:outline-none focus:border-[#E67E22] transition-colors"
                />
                <label
                  htmlFor="native-dob-input"
                  className="absolute left-3 top-4 text-sm text-[#767683] transition-all duration-200 pointer-events-none peer-focus:-top-0.5 peer-focus:text-[11px] peer-focus:text-[#E67E22] peer-focus:font-semibold peer-[:not(:placeholder-shown)]:-top-0.5 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:text-[#E67E22] peer-[:not(:placeholder-shown)]:font-semibold"
                >
                  {l.dob}
                </label>
                <span className="material-symbols-outlined absolute right-2 top-4 text-[#C6C5D4] text-[18px] pointer-events-none">
                  calendar_today
                </span>
              </div>

              {/* Time of Birth */}
              <div className="relative" ref={timePickerRef}>
                <input
                  id="native-tob-input"
                  type="time"
                  step="1"
                  required={!approximateTime}
                  placeholder=" "
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="peer w-full pt-5 pb-1.5 px-3 pr-8 bg-transparent border-0 border-b border-[#C6C5D4] text-sm sm:text-base text-[#071E27] font-mono focus:outline-none focus:border-[#E67E22] transition-colors"
                />
                <label
                  htmlFor="native-tob-input"
                  className="absolute left-3 top-4 text-sm text-[#767683] transition-all duration-200 pointer-events-none peer-focus:-top-0.5 peer-focus:text-[11px] peer-focus:text-[#E67E22] peer-focus:font-semibold peer-[:not(:placeholder-shown)]:-top-0.5 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:text-[#E67E22] peer-[:not(:placeholder-shown)]:font-semibold"
                >
                  {l.tob}
                </label>
                <button
                  type="button"
                  onClick={() => setShowTimePicker(!showTimePicker)}
                  className="absolute right-2 top-4 text-[#C6C5D4] hover:text-[#E67E22] transition-colors cursor-pointer"
                  title="Open Time Picker"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    schedule
                  </span>
                </button>

                {/* Popover Wheel Picker */}
                {showTimePicker && (
                  <div className="absolute right-0 w-72 mt-2 z-50 shadow-xl">
                    <TimeWheelPicker
                      value={time || '12:00:00'}
                      onChange={(newTime24) => setTime(newTime24)}
                      onClose={() => setShowTimePicker(false)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Approximate Time Checkbox (Optional) */}
            <div className="flex items-center gap-2 pt-0.5">
              <input
                id="approx-time-check"
                type="checkbox"
                checked={approximateTime}
                onChange={(e) => setApproximateTime(e.target.checked)}
                className="w-4 h-4 rounded text-[#E67E22] focus:ring-[#E67E22] border-[#C6C5D4] cursor-pointer"
              />
              <label htmlFor="approx-time-check" className="text-xs text-[#767683] cursor-pointer">
                {l.approxTime}
              </label>
            </div>

            {/* Step 1 Actions */}
            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={handleNextStep}
                className="bg-[#E67E22] hover:bg-[#E67E22]/90 text-white px-8 py-2.5 rounded-full font-semibold text-sm shadow-sm transition-all flex items-center gap-1.5 cursor-pointer hover:shadow"
              >
                <span>{l.next}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: GENDER, LOCATION & GENERATE */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right duration-200">
            {/* Gender Select */}
            <div className="relative">
              <select
                id="native-gender-select"
                required
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="peer w-full pt-5 pb-1.5 px-3 bg-transparent border-0 border-b border-[#C6C5D4] text-base text-[#071E27] focus:outline-none focus:border-[#E67E22] transition-colors cursor-pointer appearance-none"
              >
                <option value="Male">{l.male}</option>
                <option value="Female">{l.female}</option>
                <option value="Other">{l.other}</option>
              </select>
              <label
                htmlFor="native-gender-select"
                className="absolute left-3 -top-0.5 text-[11px] text-[#E67E22] font-semibold transition-all duration-200 pointer-events-none"
              >
                {l.genderSelection}
              </label>
              <ChevronDown className="w-4 h-4 absolute right-3 top-4 text-[#767683] pointer-events-none" />
            </div>

            {/* Place of Birth Input (with Autocomplete) */}
            <div className="relative" ref={dropdownRef}>
              <input
                id="native-place-input"
                type="text"
                required
                placeholder=" "
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0 || searchError) setShowDropdown(true);
                }}
                className="peer w-full pt-5 pb-1.5 px-3 pr-8 bg-transparent border-0 border-b border-[#C6C5D4] text-base text-[#071E27] focus:outline-none focus:border-[#E67E22] transition-colors"
              />
              <label
                htmlFor="native-place-input"
                className="absolute left-3 top-4 text-sm text-[#767683] transition-all duration-200 pointer-events-none peer-focus:-top-0.5 peer-focus:text-[11px] peer-focus:text-[#E67E22] peer-focus:font-semibold peer-[:not(:placeholder-shown)]:-top-0.5 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:text-[#E67E22] peer-[:not(:placeholder-shown)]:font-semibold"
              >
                {l.pob}
              </label>
              <div className="absolute right-2 top-4 text-[#C6C5D4] pointer-events-none">
                {searching ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#E67E22]" />
                ) : (
                  <MapPin className="w-4 h-4 text-[#767683]" />
                )}
              </div>

              {/* Autocomplete Dropdown List */}
              {showDropdown && (searchQuery.length >= 3) && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#D4C5B9]/40 rounded-xl shadow-xl overflow-hidden z-50 max-h-52 overflow-y-auto animate-in fade-in duration-150">
                  {suggestions.map((item, idx) => (
                    <button
                      type="button"
                      key={item.displayName + idx}
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#F5ECE1] border-b border-[#D4C5B9]/20 last:border-0 transition-colors flex flex-col cursor-pointer"
                    >
                      <span className="text-xs font-semibold text-[#071E27]">{item.place}</span>
                      <span className="text-[10px] text-[#767683] mt-0.5">
                        📍 {item.displayName} (UTC {item.timezone >= 0 ? `+${item.timezone}` : item.timezone})
                      </span>
                    </button>
                  ))}
                  {searchError && (
                    <div className="p-3 text-xs text-[#767683] bg-[#FDFBF7] flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-[#E67E22] shrink-0 mt-0.5" />
                      <span>{searchError}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Collapsible Coordinates & Timezone */}
            <div className="border border-[#D4C5B9]/30 rounded-xl overflow-hidden bg-[#FDFBF7]">
              <button
                type="button"
                onClick={() => setShowAdvancedCoords(!showAdvancedCoords)}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-semibold text-[#071E27] hover:text-[#E67E22] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#E67E22]">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{l.coordsTz}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#767683] font-mono">
                    {latitude ? `${latitude}°, ${longitude}°` : 'Auto'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAdvancedCoords ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {showAdvancedCoords && (
                <div className="p-3.5 border-t border-[#D4C5B9]/20 space-y-3 bg-white">
                  <p className="text-[10px] text-[#767683]">{l.coordsSub}</p>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[10px] uppercase font-mono text-[#767683] block mb-1">{l.lat}</label>
                      <input
                        type="text"
                        required
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        className="w-full bg-[#FDFBF7] border border-[#C6C5D4] rounded-lg px-2 py-1 text-xs text-[#071E27] font-mono focus:outline-none focus:border-[#E67E22]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-mono text-[#767683] block mb-1">{l.lng}</label>
                      <input
                        type="text"
                        required
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        className="w-full bg-[#FDFBF7] border border-[#C6C5D4] rounded-lg px-2 py-1 text-xs text-[#071E27] font-mono focus:outline-none focus:border-[#E67E22]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-mono text-[#767683] block mb-1">{l.utcOffset}</label>
                      <input
                        type="text"
                        required
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full bg-[#FDFBF7] border border-[#C6C5D4] rounded-lg px-2 py-1 text-xs text-[#071E27] font-mono focus:outline-none focus:border-[#E67E22]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2 Actions: Back & Generate */}
            <div className="flex justify-between items-center pt-3">
              <button
                type="button"
                onClick={handlePrevStep}
                className="text-[#E67E22] font-semibold text-sm hover:bg-[#F5ECE1] px-5 py-2 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{l.back}</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="bg-[#E67E22] hover:bg-[#E67E22]/90 text-white px-8 py-2.5 rounded-full font-semibold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer hover:shadow disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 fill-white" />
                )}
                <span>{loading ? l.calculating : (submitButtonText || (initialValues ? l.updateHoroscope : l.startHoroscope))}</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
