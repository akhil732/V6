import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Sun, 
  Moon, 
  Compass, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  Star 
} from 'lucide-react';
import { 
  computeLiveTransitSnapshot, 
  LiveTransitSnapshot, 
  PlanetKey, 
  SIGN_NAMES,
  PLANET_NAMES_TELUGU,
  SIGN_NAMES_TELUGU 
} from '../lib/engines/LiveTransitEngine';
import { SavedPerson } from '../types/marriageMatch';

interface PanchangamPageProps {
  todayPanchangam?: any | null;
  todayGochara?: any | null;
  transitSnapshot?: LiveTransitSnapshot;
  activeProfile?: SavedPerson | null;
  language?: 'en' | 'hi' | 'te';
  onBack: () => void;
  onNavigatePage?: (page: 'home' | 'kundali' | 'birth-chart' | 'marriage-match' | 'ai-consultation' | 'profile' | 'panchangam') => void;
}

const SIGN_DATA: Record<string, { code: string; nameTe: string; nameHi: string; lord: string; element: string }> = {
  "Aries": { code: "Ar", nameTe: "మేషం", nameHi: "मेष", lord: "Mars", element: "Fire" },
  "Taurus": { code: "Ta", nameTe: "వృషభం", nameHi: "वृषभ", lord: "Venus", element: "Earth" },
  "Gemini": { code: "Ge", nameTe: "మిథునం", nameHi: "मिथुन", lord: "Mercury", element: "Air" },
  "Cancer": { code: "Cn", nameTe: "కర్కాటకం", nameHi: "कर्क", lord: "Moon", element: "Water" },
  "Leo": { code: "Le", nameTe: "సింహం", nameHi: "सिंह", lord: "Sun", element: "Fire" },
  "Virgo": { code: "Vi", nameTe: "కన్య", nameHi: "कन्या", lord: "Mercury", element: "Earth" },
  "Libra": { code: "Li", nameTe: "తుల", nameHi: "तुला", lord: "Venus", element: "Air" },
  "Scorpio": { code: "Sc", nameTe: "వృశ్చికం", nameHi: "वृश्चिक", lord: "Mars", element: "Water" },
  "Sagittarius": { code: "Sg", nameTe: "ధనుస్సు", nameHi: "धनु", lord: "Jupiter", element: "Fire" },
  "Capricorn": { code: "Cp", nameTe: "మకరం", nameHi: "मकर", lord: "Saturn", element: "Earth" },
  "Aquarius": { code: "Aq", nameTe: "కుంభం", nameHi: "कुंभ", lord: "Saturn", element: "Air" },
  "Pisces": { code: "Pi", nameTe: "మీనం", nameHi: "मीन", lord: "Jupiter", element: "Water" }
};

const SOUTH_INDIAN_LAYOUT: Record<number, { name: string; row: number; col: number; code: string }> = {
  12: { name: "Pisces", row: 0, col: 0, code: "Pi" },
  1:  { name: "Aries", row: 0, col: 1, code: "Ar" },
  2:  { name: "Taurus", row: 0, col: 2, code: "Ta" },
  3:  { name: "Gemini", row: 0, col: 3, code: "Ge" },
  11: { name: "Aquarius", row: 1, col: 0, code: "Aq" },
  4:  { name: "Cancer", row: 1, col: 3, code: "Cn" },
  10: { name: "Capricorn", row: 2, col: 0, code: "Cp" },
  5:  { name: "Leo", row: 2, col: 3, code: "Le" },
  9:  { name: "Sagittarius", row: 3, col: 0, code: "Sg" },
  8:  { name: "Scorpio", row: 3, col: 1, code: "Sc" },
  7:  { name: "Libra", row: 3, col: 2, code: "Li" },
  6:  { name: "Virgo", row: 3, col: 3, code: "Vi" }
};

const EAST_INDIAN_LAYOUT: Record<number, {
  type: 'triangle' | 'rect';
  points?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name: string;
  code: string;
  label: { x: number; y: number };
  center: { x: number; y: number };
}> = {
  1: { type: 'rect', x: 133.33, y: 0, width: 133.34, height: 133.33, name: "Aries", code: "Ar", label: { x: 200, y: 22 }, center: { x: 200, y: 70 } },
  2: { type: 'triangle', points: "0,0 133.33,0 133.33,133.33", name: "Taurus", code: "Ta", label: { x: 88, y: 22 }, center: { x: 88, y: 65 } },
  3: { type: 'triangle', points: "0,0 0,133.33 133.33,133.33", name: "Gemini", code: "Ge", label: { x: 35, y: 115 }, center: { x: 65, y: 88 } },
  4: { type: 'rect', x: 0, y: 133.33, width: 133.33, height: 133.34, name: "Cancer", code: "Cn", label: { x: 66.66, y: 155 }, center: { x: 66.66, y: 205 } },
  5: { type: 'triangle', points: "0,266.67 0,400 133.33,266.67", name: "Leo", code: "Le", label: { x: 35, y: 285 }, center: { x: 65, y: 311 } },
  6: { type: 'triangle', points: "0,400 133.33,400 133.33,266.67", name: "Virgo", code: "Vi", label: { x: 88, y: 378 }, center: { x: 88, y: 335 } },
  7: { type: 'rect', x: 133.33, y: 266.67, width: 133.34, height: 133.33, name: "Libra", code: "Li", label: { x: 200, y: 378 }, center: { x: 200, y: 320 } },
  8: { type: 'triangle', points: "266.67,266.67 266.67,400 400,400", name: "Scorpio", code: "Sc", label: { x: 312, y: 378 }, center: { x: 312, y: 335 } },
  9: { type: 'triangle', points: "266.67,266.67 400,266.67 400,400", name: "Sagittarius", code: "Sg", label: { x: 365, y: 285 }, center: { x: 335, y: 311 } },
  10: { type: 'rect', x: 266.67, y: 133.33, width: 133.33, height: 133.34, name: "Capricorn", code: "Cp", label: { x: 333.33, y: 155 }, center: { x: 333.33, y: 205 } },
  11: { type: 'triangle', points: "266.67,133.33 400,0 400,133.33", name: "Aquarius", code: "Aq", label: { x: 365, y: 115 }, center: { x: 335, y: 88 } },
  12: { type: 'triangle', points: "266.67,0 266.67,133.33 400,0", name: "Pisces", code: "Pi", label: { x: 312, y: 22 }, center: { x: 312, y: 65 } }
};

const NORTH_INDIAN_HOUSES: Record<number, { points: string; label: { x: number; y: number }; center: { x: number; y: number } }> = {
  1: { points: "150,0 75,75 150,150 225,75", label: { x: 150, y: 35 }, center: { x: 150, y: 75 } },
  2: { points: "0,0 150,0 75,75", label: { x: 75, y: 25 }, center: { x: 75, y: 40 } },
  3: { points: "0,0 0,150 75,75", label: { x: 25, y: 75 }, center: { x: 40, y: 75 } },
  4: { points: "0,150 75,75 150,150 75,225", label: { x: 75, y: 150 }, center: { x: 75, y: 150 } },
  5: { points: "0,300 0,150 75,225", label: { x: 25, y: 225 }, center: { x: 40, y: 225 } },
  6: { points: "0,300 150,300 75,225", label: { x: 75, y: 275 }, center: { x: 75, y: 260 } },
  7: { points: "150,300 75,225 150,150 225,225", label: { x: 150, y: 265 }, center: { x: 150, y: 225 } },
  8: { points: "150,300 300,300 225,225", label: { x: 225, y: 275 }, center: { x: 225, y: 260 } },
  9: { points: "300,150 300,300 225,225", label: { x: 275, y: 225 }, center: { x: 260, y: 225 } },
  10: { points: "300,150 225,225 150,150 225,75", label: { x: 225, y: 150 }, center: { x: 225, y: 150 } },
  11: { points: "300,0 300,150 225,75", label: { x: 275, y: 75 }, center: { x: 260, y: 75 } },
  12: { points: "150,0 300,0 225,75", label: { x: 225, y: 25 }, center: { x: 225, y: 40 } }
};

const PLANET_ABBR: Record<string, string> = {
  Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju",
  Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke"
};

const PLANET_COLORS: Record<string, string> = {
  Sun: "#D97706",
  Moon: "#2563EB",
  Mars: "#DC2626",
  Mercury: "#059669",
  Jupiter: "#D97706",
  Venus: "#DB2777",
  Saturn: "#4B5563",
  Rahu: "#7C3AED",
  Ketu: "#9333EA"
};

const NAKSHATRA_NAMES = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const NAKSHATRA_LORDS = [
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu",
  "Jupiter", "Saturn", "Mercury", "Ketu", "Venus", "Sun",
  "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu",
  "Jupiter", "Saturn", "Mercury"
];

const YOGA_NAMES = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
  "Sukarma", "Dhriti", "Shoola", "Ganda", "Vriddhi", "Dhruva",
  "Vyaghata", "Harshana", "Vajra", "Asiddhi", "Vyatipata", "Variyan",
  "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla",
  "Brahma", "Indra", "Vaidhriti"
];

const KARANA_NAMES = [
  "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti (Bhadra)",
  "Shakuni", "Chatushpada", "Naga", "Kimstughna"
];

const SAMVATSARA_LIST = [
  { en: "Prabhava", te: "ప్రభవ" },
  { en: "Vibhava", te: "విభవ" },
  { en: "Shukla", te: "శుక్ల" },
  { en: "Pramodoota", te: "ప్రమోదూత" },
  { en: "Prajopatthi", te: "ప్రజోత్పత్తి" },
  { en: "Angirasa", te: "అంగీరస" },
  { en: "Srimukha", te: "శ్రీముఖ" },
  { en: "Bhava", te: "భావ" },
  { en: "Yuva", te: "యువ" },
  { en: "Dhatri", te: "ధాత" },
  { en: "Eeshwara", te: "ఈశ్వర" },
  { en: "Bahudhanya", te: "బహుధాన్య" },
  { en: "Pramathi", te: "ప్రమాతి" },
  { en: "Vikrama", te: "విక్రమ" },
  { en: "Vrisha", te: "వృష" },
  { en: "Chitrabhanu", te: "చిత్రభాను" },
  { en: "Svabhanu", te: "స్వభాను" },
  { en: "Tharana", te: "తారణ" },
  { en: "Parthiva", te: "పార్థివ" },
  { en: "Vyaya", te: "వ్యయ" },
  { en: "Sarvajit", te: "సర్వజిత్" },
  { en: "Sarvadhari", te: "సర్వధారి" },
  { en: "Virodhi", te: "విరోధి" },
  { en: "Vikruthi", te: "వికృతి" },
  { en: "Khara", te: "ఖర" },
  { en: "Nandana", te: "నందన" },
  { en: "Vijaya", te: "విజయ" },
  { en: "Jaya", te: "జయ" },
  { en: "Manmatha", te: "మన్మథ" },
  { en: "Durmukhi", te: "దుర్ముఖి" },
  { en: "Hevilambi", te: "హేవిలంబి" },
  { en: "Vilambi", te: "విలంబి" },
  { en: "Vikari", te: "వికారి" },
  { en: "Sharvari", te: "శార్వరి" },
  { en: "Plava", te: "ప్లవ" },
  { en: "Shubhakruth", te: "శుభకృత్" },
  { en: "Shobhakruth", te: "శోభకృత్" },
  { en: "Krodhi", te: "క్రోధి" },
  { en: "Viswavasu", te: "విశ్వావసు" },
  { en: "Parabhava", te: "పరాభవ" },
  { en: "Plavanga", te: "ప్లవంగ" },
  { en: "Kilaka", te: "కీలక" },
  { en: "Saumya", te: "సౌమ్య" },
  { en: "Sadharana", te: "సాధారణ" },
  { en: "Virodhikruth", te: "విరోధికృత్" },
  { en: "Paridhavi", te: "పరిధావి" },
  { en: "Pramadhee", te: "ప్రమాదీచ" },
  { en: "Ananda", te: "ఆనంద" },
  { en: "Rakshasa", te: "రాక్షస" },
  { en: "Nala", te: "నల" },
  { en: "Pingala", te: "పింగళ" },
  { en: "Kalayukthi", te: "కాళయుక్తి" },
  { en: "Siddharthi", te: "సిద్ధార్థి" },
  { en: "Raudri", te: "రౌద్రి" },
  { en: "Durmathi", te: "దుర్మతి" },
  { en: "Dundubhi", te: "దుందుభి" },
  { en: "Rudhirodgari", te: "రుధిరోద్గారి" },
  { en: "Raktakshi", te: "రక్తాక్షి" },
  { en: "Krodhana", te: "క్రోధన" },
  { en: "Kshaya", te: "క్షయ" }
];

const MASA_LIST = [
  { en: "Chaitra", te: "చైత్ర" },
  { en: "Vaisakha", te: "వైశాఖ" },
  { en: "Jyeshtha", te: "జ్యేష్ఠ" },
  { en: "Ashadha", te: "ఆషాఢ" },
  { en: "Shravana", te: "శ్రావణ" },
  { en: "Bhadrapada", te: "భాద్రపద" },
  { en: "Ashwayuja", te: "ఆశ్వయుజ" },
  { en: "Kartika", te: "కార్తీక" },
  { en: "Margashira", te: "మార్గశిర" },
  { en: "Pushya", te: "పుష్య" },
  { en: "Magha", te: "మాఘ" },
  { en: "Phalguna", te: "ఫాల్గుణ" }
];

const CHOGHADIYA_ORDER = ["Udveg", "Chal", "Labh", "Amrit", "Kaal", "Shubh", "Rog"];
const DAY_CHOGHADIYA_START = [0, 3, 6, 2, 5, 1, 4];
const NIGHT_CHOGHADIYA_START = [5, 1, 4, 0, 3, 6, 2];

const CHOGHADIYA_TYPES: Record<string, { type: 'Auspicious' | 'Neutral' | 'Inauspicious'; color: string; labelTe: string }> = {
  Amrit: { type: 'Auspicious', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', labelTe: 'అమృత (శ్రేష్టం)' },
  Shubh: { type: 'Auspicious', color: 'bg-teal-100 text-teal-800 border-teal-300', labelTe: 'శుభ (ఉత్తమం)' },
  Labh: { type: 'Auspicious', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', labelTe: 'లాభ (ధనప్రాప్తి)' },
  Chal: { type: 'Neutral', color: 'bg-blue-50 text-blue-700 border-blue-200', labelTe: 'చర (సాధారణం)' },
  Rog: { type: 'Inauspicious', color: 'bg-amber-100 text-amber-900 border-amber-300', labelTe: 'రోగ (వర్జ్యం)' },
  Kaal: { type: 'Inauspicious', color: 'bg-rose-100 text-rose-900 border-rose-300', labelTe: 'కాల (అశుభం)' },
  Udveg: { type: 'Inauspicious', color: 'bg-orange-100 text-orange-900 border-orange-300', labelTe: 'ఉద్వేగ (ఆందోళన)' }
};

export const PanchangamPage: React.FC<PanchangamPageProps> = ({
  todayPanchangam,
  todayGochara,
  activeProfile,
  language = 'en',
  onBack,
}) => {
  // Selected Date State
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [chartStyle, setChartStyle] = useState<'south' | 'north' | 'east'>('east');
  const [selectedSign, setSelectedSign] = useState<{ signName: string; planets: string[] } | null>(null);

  // Live real-time clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute live transit snapshot based on selected date and active native's moon sign
  const transitSnapshot = useMemo(() => {
    const moonSign = activeProfile?.moonSign || 'Pisces';
    return computeLiveTransitSnapshot(moonSign, selectedDate);
  }, [selectedDate, activeProfile]);

  // Handle Date Shifts
  const handleShiftDate = (days: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    setSelectedDate(next);
  };

  const handleResetToToday = () => {
    setSelectedDate(new Date());
  };

  // Safe formatting helper
  const formatField = (val: any, fallback: string = ''): string => {
    if (!val) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      if (val.start && val.end) return `${val.start} - ${val.end}`;
      if (val.start_time && val.end_time) return `${val.start_time} - ${val.end_time}`;
      if (val.name) return String(val.name);
      if (val.value) return String(val.value);
    }
    return fallback;
  };

  // Group planets by sign index 1..12
  const planetsBySignIndex = useMemo(() => {
    const map: Record<number, { abbr: string; full: PlanetKey; deg: number }[]> = {};
    for (let i = 1; i <= 12; i++) map[i] = [];

    const order: PlanetKey[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    order.forEach((p) => {
      const pos = transitSnapshot.positions[p];
      if (pos) {
        const signIdx = SIGN_NAMES.indexOf(pos.sign as any) + 1;
        if (signIdx >= 1 && signIdx <= 12) {
          map[signIdx].push({
            abbr: PLANET_ABBR[p] || p.substring(0, 2),
            full: p,
            deg: pos.degreeInSign
          });
        }
      }
    });
    return map;
  }, [transitSnapshot]);

  // Derived Astrological Panchanga values
  const sunPos = transitSnapshot.positions.Sun;
  const moonPos = transitSnapshot.positions.Moon;

  const panchangDetails = useMemo(() => {
    // Sidereal longitudes
    const sunSidereal = sunPos ? sunPos.siderealLongitude : 0;
    const moonSidereal = moonPos ? moonPos.siderealLongitude : 0;

    // Tithi calculation
    const diff = ((moonSidereal - sunSidereal) % 360 + 360) % 360;
    const tithiNum = Math.floor(diff / 12) + 1;
    const isShukla = tithiNum <= 15;
    const paksha = isShukla ? "Shukla Paksha" : "Krishna Paksha";
    const tithiNames = [
      "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
      "Shasthi", "Saptami", "Ashtami", "Navami", "Dashami",
      "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", isShukla ? "Purnima" : "Amavasya"
    ];
    const tithiNameIndex = isShukla ? tithiNum - 1 : tithiNum - 16;
    const calculatedTithi = tithiNames[Math.max(0, Math.min(14, tithiNameIndex))];

    // Nakshatra calculation
    const nakIndex = Math.floor(moonSidereal / (360 / 27));
    const calculatedNak = NAKSHATRA_NAMES[nakIndex] || "Ashwini";
    const nakPada = Math.floor((moonSidereal % (360 / 27)) / (360 / 108)) + 1;
    const nakLord = NAKSHATRA_LORDS[nakIndex] || "Ketu";

    // Yoga calculation
    const yogaSum = (sunSidereal + moonSidereal) % 360;
    const yogaIndex = Math.floor(yogaSum / (360 / 27));
    const calculatedYoga = YOGA_NAMES[yogaIndex] || "Siddhi";

    // Karana calculation
    const karanaNum = Math.floor(diff / 6) + 1;
    let calculatedKarana = "Bava";
    if (karanaNum === 1) calculatedKarana = "Kimstughna";
    else if (karanaNum >= 58) calculatedKarana = karanaNum === 58 ? "Shakuni" : karanaNum === 59 ? "Chatushpada" : "Naga";
    else calculatedKarana = KARANA_NAMES[(karanaNum - 2) % 7];

    // Day of Week (Vaara)
    const weekdaysEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const weekdaysTe = ["ఆదివారం (రవి)", "సోమవారం (చంద్ర)", "మంగళవారం (కుజ)", "బుధవారం (బుధ)", "గురువారం (గురు)", "శుక్రవారం (శుక్ర)", "శనివారం (శని)"];
    const weekdayIdx = selectedDate.getDay();
    const vaara = weekdaysEn[weekdayIdx];
    const vaaraTe = weekdaysTe[weekdayIdx];

    // Merge with API data if today
    const isTodaySelected = selectedDate.toDateString() === new Date().toDateString();
    const rawTithi = isTodaySelected && todayPanchangam ? formatField(todayPanchangam.Tithi || todayPanchangam.tithi?.name, calculatedTithi) : calculatedTithi;
    const rawNakshatra = isTodaySelected && todayPanchangam ? formatField(todayPanchangam.Nakshatram || todayPanchangam.nakshatra?.name, calculatedNak) : calculatedNak;
    const rawYoga = isTodaySelected && todayPanchangam ? formatField(todayPanchangam.Yoga || todayPanchangam.yoga?.name, calculatedYoga) : calculatedYoga;
    const rawKarana = isTodaySelected && todayPanchangam ? formatField(todayPanchangam.Karana || todayPanchangam.karana?.name, calculatedKarana) : calculatedKarana;
    const rawSunrise = isTodaySelected && todayPanchangam ? formatField(todayPanchangam['Sun Rise'] || todayPanchangam.sunrise, "06:05 AM") : "06:05 AM";
    const rawSunset = isTodaySelected && todayPanchangam ? formatField(todayPanchangam['Sun Set'] || todayPanchangam.sunset, "06:30 PM") : "06:30 PM";
    const rawRahuKalam = isTodaySelected && todayPanchangam ? formatField(todayPanchangam.RahuKalam || todayPanchangam.rahu_kalam, "01:30 PM - 03:00 PM") : "01:30 PM - 03:00 PM";
    const rawAbhijit = isTodaySelected && todayPanchangam ? formatField(todayPanchangam.Abhijit || todayPanchangam.abhijit, "11:52 AM - 12:44 PM") : "11:52 AM - 12:44 PM";
    const rawGulika = isTodaySelected && todayPanchangam ? formatField(todayPanchangam.Gulika || todayPanchangam.gulika, "06:00 AM - 07:30 AM") : "06:00 AM - 07:30 AM";
    const rawYamagandam = isTodaySelected && todayPanchangam ? formatField(todayPanchangam.Yamagandam || todayPanchangam.yamagandam, "03:00 PM - 04:30 PM") : "03:00 PM - 04:30 PM";

    // Dynamic Samvatsara calculation
    const gYear = selectedDate.getFullYear();
    const gMonth = selectedDate.getMonth();
    const gDay = selectedDate.getDate();
    // Ugadi cutoff (typically late March)
    const isBeforeUgadi = gMonth < 2 || (gMonth === 2 && gDay < 22);
    const vYear = isBeforeUgadi ? gYear - 1 : gYear;
    const samvatIdx = ((vYear - 1987) % 60 + 60) % 60;
    const samvatItem = SAMVATSARA_LIST[samvatIdx] || SAMVATSARA_LIST[0];

    const apiSamvatsara = isTodaySelected && todayPanchangam ? formatField(todayPanchangam.Samvatsara || todayPanchangam.samvatsara, '') : '';
    const calculatedSamvatsara = `${samvatItem.en} (${samvatItem.te} నామ సంవత్సరం)`;
    const samvatsara = apiSamvatsara || calculatedSamvatsara;

    // Dynamic Masa calculation
    // Amanta lunar month: calculate Sun's position at the preceding new moon
    const sunNewMoon = ((sunSidereal - (diff / 12.37)) % 360 + 360) % 360;
    const sunSignIdxAtNewMoon = Math.floor(sunNewMoon / 30);
    const masaIdx = (sunSignIdxAtNewMoon + 1) % 12;
    const masaItem = MASA_LIST[masaIdx] || MASA_LIST[0];

    const apiMasa = isTodaySelected && todayPanchangam ? formatField(todayPanchangam.Masa || todayPanchangam.masa, '') : '';
    const calculatedMasa = `${masaItem.en} Masa (${masaItem.te} మాసము)`;
    const masa = apiMasa || calculatedMasa;

    // Dynamic Ayana calculation
    const isUttarayana = sunSidereal >= 270 || sunSidereal < 90;
    const ayana = isUttarayana ? "Uttarayana (ఉత్తరాయణం)" : "Dakshinayana (దక్షిణాయనం)";

    // Dynamic Ritu calculation
    const rituNames = [
      "Vasantha Ritu (వసంత ఋతువు)",
      "Vasantha Ritu (వసంత ఋతువు)",
      "Greeshma Ritu (గ్రీష్మ ఋతువు)",
      "Greeshma Ritu (గ్రీష్మ ఋతువు)",
      "Varsha Ritu (వర్ష ఋతువు)",
      "Varsha Ritu (వర్ష ఋతువు)",
      "Sharad Ritu (శరద్ ఋతువు)",
      "Sharad Ritu (శరద్ ఋతువు)",
      "Hemanta Ritu (హేమంత ఋతువు)",
      "Hemanta Ritu (హేమంత ఋతువు)",
      "Shishira Ritu (శిశిర ఋతువు)",
      "Shishira Ritu (శిశిర ఋతువు)"
    ];
    const ritu = rituNames[masaIdx] || "Varsha Ritu (వర్ష ఋతువు)";

    return {
      paksha,
      tithi: rawTithi,
      nakshatra: rawNakshatra,
      nakPada,
      nakLord,
      yoga: rawYoga,
      karana: rawKarana,
      vaara,
      vaaraTe,
      sunrise: rawSunrise,
      sunset: rawSunset,
      moonrise: "06:45 PM",
      moonset: "07:12 AM",
      rahuKalam: rawRahuKalam,
      abhijit: rawAbhijit,
      gulika: rawGulika,
      yamagandam: rawYamagandam,
      brahmaMuhurta: "04:29 AM - 05:17 AM",
      amritKalam: "08:15 AM - 09:48 AM",
      durmuhurtham: "06:05 AM - 06:55 AM, 04:50 PM - 05:40 PM",
      varjyam: "02:10 PM - 03:40 PM",
      sunSign: sunPos ? `${sunPos.sign} (${sunPos.signTelugu})` : "Leo",
      moonSign: moonPos ? `${moonPos.sign} (${moonPos.signTelugu})` : "Pisces",
      ayana,
      ritu,
      masa,
      samvatsara
    };
  }, [sunPos, moonPos, selectedDate, todayPanchangam]);

  // Compute 8 Daytime and 8 Nighttime Choghadiyas for the selected weekday
  const choghadiyaSlots = useMemo(() => {
    const dayIdx = selectedDate.getDay();
    const dayStartIdx = DAY_CHOGHADIYA_START[dayIdx];
    const nightStartIdx = NIGHT_CHOGHADIYA_START[dayIdx];

    const dayTimes = [
      "06:00 AM - 07:30 AM", "07:30 AM - 09:00 AM", "09:00 AM - 10:30 AM", "10:30 AM - 12:00 PM",
      "12:00 PM - 01:30 PM", "01:30 PM - 03:00 PM", "03:00 PM - 04:30 PM", "04:30 PM - 06:00 PM"
    ];
    const nightTimes = [
      "06:00 PM - 07:30 PM", "07:30 PM - 09:00 PM", "09:00 PM - 10:30 PM", "10:30 PM - 12:00 AM",
      "12:00 AM - 01:30 AM", "01:30 AM - 03:00 AM", "03:00 AM - 04:30 AM", "04:30 AM - 06:00 AM"
    ];

    const daySlots = dayTimes.map((time, i) => {
      const name = CHOGHADIYA_ORDER[(dayStartIdx + i) % 7];
      return { time, name, ...CHOGHADIYA_TYPES[name] };
    });

    const nightSlots = nightTimes.map((time, i) => {
      const name = CHOGHADIYA_ORDER[(nightStartIdx + i) % 7];
      return { time, name, ...CHOGHADIYA_TYPES[name] };
    });

    return { daySlots, nightSlots };
  }, [selectedDate]);

  // Compute 24 Hourly Dina Horas
  const horaSlots = useMemo(() => {
    const HORA_LORDS = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"];
    const DAY_HORA_START = [0, 3, 6, 2, 5, 1, 4];
    const dayIdx = selectedDate.getDay();
    const startLordIdx = DAY_HORA_START[dayIdx];

    const hours = [];
    for (let h = 0; h < 24; h++) {
      const lord = HORA_LORDS[(startLordIdx + h) % 7];
      const startH = (6 + h) % 24;
      const endH = (7 + h) % 24;
      const fmtH = (hour: number) => {
        const p = hour >= 12 ? 'PM' : 'AM';
        const num = hour % 12 === 0 ? 12 : hour % 12;
        return `${String(num).padStart(2, '0')}:00 ${p}`;
      };
      hours.push({
        time: `${fmtH(startH)} - ${fmtH(endH)}`,
        lord,
        nature: ["Jupiter", "Venus", "Mercury", "Moon"].includes(lord) ? 'Auspicious' : 'Inauspicious',
        planetNameTe: PLANET_NAMES_TELUGU[lord as PlanetKey] || lord
      });
    }
    return hours;
  }, [selectedDate]);

  const formattedSelectedDate = useMemo(() => {
    return selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, [selectedDate]);

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C3E50] pb-28 font-sans selection:bg-[#E67E22]/20">
      
      {/* ──────────────────────────────────────────────────────────── */}
      {/* TOP APP BAR / HEADER */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="bg-white/95 backdrop-blur-md border-b border-[#D4C5B9]/40 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-lg sm:text-xl text-[#2C3E50] leading-tight">
                  Panchangam & Transit Chart
                </h1>
                <span className="bg-[#FFDDB3]/60 text-[#8C4A00] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
                  Live Gochara
                </span>
              </div>
              <p className="text-xs text-[#8A7B6E] flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#E67E22]" />
                <span>{activeProfile?.place || "Hyderabad, India (17.38° N, 78.48° E)"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isToday && (
              <button
                onClick={handleResetToToday}
                className="px-3 py-1.5 text-xs font-semibold text-[#E67E22] bg-[#F5ECE1] hover:bg-[#E67E22]/15 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Today</span>
              </button>
            )}
          </div>
        </div>

        {/* Date Selector Navigation Strip */}
        <div className="bg-[#FDFBF7] border-t border-[#D4C5B9]/20 px-4 py-2">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
            <button
              onClick={() => handleShiftDate(-1)}
              className="p-1.5 rounded-lg hover:bg-[#F5ECE1] text-[#564337] transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev Day</span>
            </button>

            <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-[#D4C5B9]/40 shadow-2xs">
              <Calendar className="w-4 h-4 text-[#E67E22]" />
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  if (e.target.value) {
                    const [y, m, d] = e.target.value.split('-').map(Number);
                    setSelectedDate(new Date(y, m - 1, d, 12, 0, 0));
                  }
                }}
                className="bg-transparent text-xs sm:text-sm font-semibold text-[#2C3E50] cursor-pointer outline-none font-sans"
              />
            </div>

            <button
              onClick={() => handleShiftDate(1)}
              className="p-1.5 rounded-lg hover:bg-[#F5ECE1] text-[#564337] transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium"
            >
              <span className="hidden sm:inline">Next Day</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MAIN CONTAINER */}
      {/* ──────────────────────────────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 space-y-6 animate-in fade-in duration-200">
        
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 1. TOP SECTION: TRANSIT CHART (REAL-TIME GOCHARA) */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <section className="bg-white rounded-2xl shadow-[0px_2px_12px_rgba(44,62,80,0.06)] border border-[#D4C5B9]/50 overflow-hidden flex flex-col">
          
          {/* Header of Transit Chart */}
          <div className="px-4 sm:px-5 py-3.5 border-b border-[#D4C5B9]/30 flex flex-wrap justify-between items-center bg-[#FDFBF7] gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FFDDB3] text-[#E67E22] flex items-center justify-center font-bold text-sm">
                ☸
              </div>
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2C3E50]">
                  Gochara Chakra (Transit Chart)
                </h2>
                <p className="text-[11px] text-[#8A7B6E]">
                  Lahiri Ayanamsha • Ephemeris Ground Truth ({transitSnapshot.ayanamsa.toFixed(2)}°)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#F5ECE1] px-2.5 py-1 rounded-full border border-[#D4C5B9]/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BA1A1A] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#BA1A1A]"></span>
                </span>
                <span className="text-[10px] font-bold text-[#684300] uppercase tracking-wider">
                  {isToday ? `LIVE · ${currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : `TRANSIT FOR ${formattedSelectedDate}`}
                </span>
              </div>
            </div>
          </div>

          {/* Chart Style Switcher Buttons */}
          <div className="px-4 py-2.5 bg-[#FDFBF7]/50 border-b border-[#D4C5B9]/20 flex justify-between items-center flex-wrap gap-2">
            <span className="text-xs font-semibold text-[#8A7B6E]">Chart Format:</span>
            <div className="inline-flex bg-[#F5ECE1] p-1 rounded-xl border border-[#D4C5B9]/40 text-xs font-semibold gap-1">
              <button
                onClick={() => setChartStyle('south')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  chartStyle === 'south'
                    ? 'bg-white text-[#E67E22] shadow-xs font-bold'
                    : 'text-[#8A7B6E] hover:text-[#2C3E50]'
                }`}
              >
                South Indian
              </button>
              <button
                onClick={() => setChartStyle('north')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  chartStyle === 'north'
                    ? 'bg-white text-[#E67E22] shadow-xs font-bold'
                    : 'text-[#8A7B6E] hover:text-[#2C3E50]'
                }`}
              >
                North Indian
              </button>
              <button
                onClick={() => setChartStyle('east')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  chartStyle === 'east'
                    ? 'bg-white text-[#E67E22] shadow-xs font-bold'
                    : 'text-[#8A7B6E] hover:text-[#2C3E50]'
                }`}
              >
                East Indian
              </button>
            </div>
          </div>

          {/* Chart Display Area */}
          <div className="p-4 sm:p-6 flex flex-col md:flex-row items-center justify-center gap-6 bg-[#F7F1E8]/20">
            
            {/* SVG Visual Representation */}
            <div className="w-full max-w-[320px] sm:max-w-[340px] aspect-square shrink-0">
              {chartStyle === 'south' ? (
                /* South Indian Layout */
                <svg 
                  viewBox="0 0 280 280" 
                  className="w-full h-full bg-white select-none shadow-[inset_0px_0px_2px_rgba(230,126,34,0.15)] rounded-xl overflow-hidden border border-[#E67E22]/30"
                >
                  {/* Center 2x2 Area */}
                  <rect 
                    x="70" 
                    y="70" 
                    width="140" 
                    height="140" 
                    fill="#FDFBF7" 
                    stroke="rgba(230, 126, 34, 0.25)" 
                    strokeWidth="1" 
                  />

                  {/* Center Emblem: Sun Icon + GOCHARA */}
                  <g className="opacity-90">
                    <circle 
                      cx="140" 
                      cy="126" 
                      r="12" 
                      fill="none" 
                      stroke="#E67E22" 
                      strokeWidth="1.8" 
                    />
                    <g stroke="#E67E22" strokeWidth="1.8" strokeLinecap="round">
                      <line x1="140" y1="106" x2="140" y2="101" />
                      <line x1="140" y1="146" x2="140" y2="151" />
                      <line x1="120" y1="126" x2="115" y2="126" />
                      <line x1="160" y1="126" x2="165" y2="126" />
                    </g>
                    <text 
                      x="140" 
                      y="160" 
                      textAnchor="middle" 
                      fill="#E67E22" 
                      fontSize="10" 
                      fontWeight="700" 
                      letterSpacing="0.2em" 
                      fontFamily="Inter, sans-serif"
                    >
                      GOCHARA
                    </text>
                    <text 
                      x="140" 
                      y="176" 
                      textAnchor="middle" 
                      fill="#8A7B6E" 
                      fontSize="8" 
                      fontWeight="500" 
                      fontFamily="Inter, sans-serif"
                    >
                      {panchangDetails.sunSign.split(' ')[0]} Sun
                    </text>
                  </g>

                  {/* 12 Outer Sign Cells in South Indian Order */}
                  {Object.entries(SOUTH_INDIAN_LAYOUT).map(([sStr, layout]) => {
                    const sNum = parseInt(sStr);
                    const planets = planetsBySignIndex[sNum] || [];
                    const x = layout.col * 70;
                    const y = layout.row * 70;
                    const isSelected = selectedSign?.signName === layout.name;

                    return (
                      <g 
                        key={sNum}
                        className="cursor-pointer group"
                        onClick={() => setSelectedSign({ signName: layout.name, planets: planets.map(p => p.abbr) })}
                      >
                        <rect 
                          x={x} 
                          y={y} 
                          width="70" 
                          height="70" 
                          fill={isSelected ? "#FFF3E0" : "#FFFFFF"} 
                          stroke="rgba(230, 126, 34, 0.25)" 
                          strokeWidth="1" 
                          className="hover:fill-[#F7F1E8] transition-colors"
                        />

                        {/* Sign Code */}
                        <text 
                          x={x + 6} 
                          y={y + 14} 
                          fill="#8A7B6E" 
                          fontSize="9" 
                          fontWeight="700" 
                          letterSpacing="0.05em" 
                          fontFamily="Inter, sans-serif"
                        >
                          {layout.code}
                        </text>

                        {/* Transiting Planet Pills in this sign */}
                        {planets.map((p, pIdx) => {
                          const px = x + 16 + (pIdx % 2) * 26;
                          const py = y + 26 + Math.floor(pIdx / 2) * 16;
                          return (
                            <g key={p.abbr}>
                              <text
                                x={px}
                                y={py}
                                fill={PLANET_COLORS[p.full] || "#E67E22"}
                                fontSize="11"
                                fontWeight="800"
                                fontFamily="Inter, sans-serif"
                              >
                                {p.abbr}
                              </text>
                              <text
                                x={px + 14}
                                y={py - 3}
                                fill="#8A7B6E"
                                fontSize="6.5"
                                fontWeight="600"
                              >
                                {p.deg.toFixed(0)}°
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    );
                  })}
                </svg>
              ) : chartStyle === 'north' ? (
                /* North Indian Diamond Layout */
                <svg 
                  viewBox="0 0 300 300" 
                  className="w-full h-full bg-white select-none shadow-[inset_0px_0px_2px_rgba(230,126,34,0.15)] rounded-xl overflow-hidden border border-[#E67E22]/30"
                >
                  {Object.entries(NORTH_INDIAN_HOUSES).map(([hStr, layout]) => {
                    const houseNum = parseInt(hStr);
                    const signName = SIGN_NAMES[houseNum - 1];
                    const planets = planetsBySignIndex[houseNum] || [];

                    return (
                      <g 
                        key={houseNum}
                        className="cursor-pointer group"
                        onClick={() => setSelectedSign({ signName, planets: planets.map(p => p.abbr) })}
                      >
                        <polygon
                          points={layout.points}
                          fill="#FFFFFF"
                          stroke="rgba(230, 126, 34, 0.35)"
                          strokeWidth="1.2"
                          className="hover:fill-[#F7F1E8] transition-colors"
                        />
                        <text
                          x={layout.label.x}
                          y={layout.label.y}
                          textAnchor="middle"
                          fill="#8A7B6E"
                          fontSize="9"
                          fontWeight="700"
                        >
                          {houseNum}
                        </text>

                        {planets.map((p, pIdx) => {
                          const px = layout.center.x + (pIdx % 2 === 0 ? -12 : 12);
                          const py = layout.center.y + (pIdx < 2 ? 0 : 14);
                          return (
                            <text
                              key={p.abbr}
                              x={px}
                              y={py}
                              textAnchor="middle"
                              fill={PLANET_COLORS[p.full] || "#E67E22"}
                              fontSize="11"
                              fontWeight="800"
                            >
                              {p.abbr}
                            </text>
                          );
                        })}
                      </g>
                    );
                  })}
                  <line x1="0" y1="0" x2="300" y2="300" stroke="rgba(230, 126, 34, 0.35)" strokeWidth="1.2" pointerEvents="none" />
                  <line x1="300" y1="0" x2="0" y2="300" stroke="rgba(230, 126, 34, 0.35)" strokeWidth="1.2" pointerEvents="none" />
                </svg>
              ) : (
                /* East Indian Style */
                <svg 
                  viewBox="0 0 400 400" 
                  className="w-full h-full bg-white select-none shadow-[inset_0px_0px_2px_rgba(230,126,34,0.15)] rounded-xl overflow-hidden border border-[#E67E22]/30"
                >
                  {/* Center Box */}
                  <rect 
                    x="133.33" 
                    y="133.33" 
                    width="133.34" 
                    height="133.34" 
                    fill="#FDFBF7" 
                    stroke="rgba(230, 126, 34, 0.25)" 
                    strokeWidth="1.5" 
                  />
                  <text 
                    x="200" 
                    y="190" 
                    textAnchor="middle" 
                    fill="#E67E22" 
                    fontSize="12" 
                    fontWeight="700" 
                    letterSpacing="0.2em" 
                    fontFamily="Inter, sans-serif"
                  >
                    GOCHARA
                  </text>
                  <text 
                    x="200" 
                    y="210" 
                    textAnchor="middle" 
                    fill="#8A7B6E" 
                    fontSize="10" 
                    fontWeight="500" 
                    fontFamily="Inter, sans-serif"
                  >
                    {panchangDetails.sunSign.split(' ')[0]} Sun
                  </text>

                  {/* 12 Signs in East Indian Layout */}
                  {Object.entries(EAST_INDIAN_LAYOUT).map(([sStr, layout]) => {
                    const sNum = parseInt(sStr);
                    const planets = planetsBySignIndex[sNum] || [];
                    const isSelected = selectedSign?.signName === layout.name;

                    return (
                      <g 
                        key={sNum}
                        className="cursor-pointer group"
                        onClick={() => setSelectedSign({ signName: layout.name, planets: planets.map(p => p.abbr) })}
                      >
                        {layout.type === 'rect' ? (
                          <rect 
                            x={layout.x} 
                            y={layout.y} 
                            width={layout.width} 
                            height={layout.height} 
                            fill={isSelected ? "#FFF3E0" : "#FFFFFF"} 
                            stroke="rgba(230, 126, 34, 0.25)" 
                            strokeWidth="1.2" 
                            className="hover:fill-[#F7F1E8] transition-colors"
                          />
                        ) : (
                          <polygon 
                            points={layout.points} 
                            fill={isSelected ? "#FFF3E0" : "#FFFFFF"} 
                            stroke="rgba(230, 126, 34, 0.25)" 
                            strokeWidth="1.2" 
                            className="hover:fill-[#F7F1E8] transition-colors"
                          />
                        )}

                        <text 
                          x={layout.label.x} 
                          y={layout.label.y} 
                          textAnchor="middle" 
                          fill="#8A7B6E" 
                          fontSize="10" 
                          fontWeight="700" 
                          fontFamily="Inter, sans-serif"
                        >
                          {layout.code}
                        </text>

                        {planets.map((p, pIdx) => {
                          const px = layout.center.x + (pIdx % 2 === 0 ? -12 : 12);
                          const py = layout.center.y + (pIdx < 2 ? 0 : 14);
                          return (
                            <g key={p.abbr + pIdx}>
                              <text
                                x={px}
                                y={py}
                                textAnchor="middle"
                                fill={PLANET_COLORS[p.full] || "#E67E22"}
                                fontSize="11"
                                fontWeight="800"
                                fontFamily="Inter, sans-serif"
                              >
                                {p.abbr}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>

            {/* Transiting Grahas Summary Cards (All 9 Planets) */}
            <div className="flex-1 w-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8A7B6E] uppercase tracking-wider">
                  Planetary Transit Positions (గ్రహ సంచారము)
                </span>
                <span className="text-[11px] text-[#E67E22] font-semibold">
                  Chandra: {panchangDetails.moonSign.split(' ')[0]}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                {(Object.keys(transitSnapshot.positions) as PlanetKey[]).map((planet) => {
                  const pos = transitSnapshot.positions[planet];
                  return (
                    <div 
                      key={planet}
                      className="p-2 bg-white rounded-xl border border-[#D4C5B9]/40 hover:border-[#E67E22]/50 transition-all flex flex-col justify-between shadow-2xs group"
                    >
                      <div className="flex items-center justify-between">
                        <span 
                          className="font-mono font-bold text-xs px-1.5 py-0.5 rounded-md"
                          style={{ color: PLANET_COLORS[planet], backgroundColor: `${PLANET_COLORS[planet]}15` }}
                        >
                          {PLANET_ABBR[planet]}
                        </span>
                        <span className="text-[10px] text-[#8A7B6E] font-medium truncate ml-1">
                          {pos.degreeInSign.toFixed(1)}°
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="font-semibold text-[#2C3E50] block text-[11px]">
                          {planet}
                        </span>
                        <span className="text-[10px] text-[#E67E22] font-medium block truncate">
                          {pos.sign} ({SIGN_DATA[pos.sign]?.code || ''})
                        </span>
                      </div>
                      <div className="mt-1 pt-1 border-t border-[#D4C5B9]/20 text-[9px] text-[#8A7B6E] flex justify-between">
                        <span>H{pos.houseFromMoon} Moon</span>
                        <span className={pos.classification === 'Supportive' ? 'text-emerald-700 font-bold' : pos.classification === 'Challenging' ? 'text-rose-700 font-bold' : 'text-amber-700'}>
                          {pos.classification[0]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 2. THE FIVE SACRED LIMBS (PANCHA-ANGA) & CALENDAR DETAILS */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        
        {/* Vedic Almanac Header Card */}
        <section className="bg-gradient-to-br from-[#FFF7ED] via-[#FDFBF7] to-[#F5ECE1] rounded-2xl p-5 sm:p-6 border border-[#E67E22]/30 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E67E22]/20 pb-3">
            <div>
              <span className="text-xs font-bold text-[#E67E22] uppercase tracking-widest block">
                Vedic Almanac • దిన పంచాంగ విశేషాలు
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C3E50] mt-0.5">
                {formattedSelectedDate}
              </h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-white/80 border border-[#E67E22]/30 rounded-full text-xs font-bold text-[#E67E22] shadow-2xs">
                {panchangDetails.samvatsara}
              </span>
              <span className="px-3 py-1 bg-white/80 border border-[#D4C5B9]/40 rounded-full text-xs font-medium text-[#2C3E50]">
                {panchangDetails.masa}
              </span>
            </div>
          </div>

          {/* Sub almanac details: Ayana, Ritu, Masa */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="bg-white/70 p-2.5 rounded-xl border border-[#D4C5B9]/30">
              <span className="text-[10px] text-[#8A7B6E] font-medium block">Ayana (ఆయనం)</span>
              <span className="font-semibold text-[#2C3E50]">{panchangDetails.ayana}</span>
            </div>
            <div className="bg-white/70 p-2.5 rounded-xl border border-[#D4C5B9]/30">
              <span className="text-[10px] text-[#8A7B6E] font-medium block">Ritu (ఋతువు)</span>
              <span className="font-semibold text-[#2C3E50]">{panchangDetails.ritu}</span>
            </div>
            <div className="bg-white/70 p-2.5 rounded-xl border border-[#D4C5B9]/30">
              <span className="text-[10px] text-[#8A7B6E] font-medium block">Surya Rasi (సూర్య రాశి)</span>
              <span className="font-semibold text-[#2C3E50]">{panchangDetails.sunSign}</span>
            </div>
            <div className="bg-white/70 p-2.5 rounded-xl border border-[#D4C5B9]/30">
              <span className="text-[10px] text-[#8A7B6E] font-medium block">Chandra Rasi (చంద్ర రాశి)</span>
              <span className="font-semibold text-[#2C3E50]">{panchangDetails.moonSign}</span>
            </div>
          </div>
        </section>

        {/* 5 Core Angas Grid */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📜</span>
            <h3 className="font-serif text-lg font-bold text-[#2C3E50]">
              The Five Sacred Limbs (పంచాంగ ప్రధానాంగాలు)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            
            {/* 1. TITHI */}
            <div className="bg-white rounded-2xl p-4 border border-[#D4C5B9]/40 shadow-xs hover:border-[#E67E22]/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E67E22] flex items-center gap-1.5">
                    <Moon className="w-4 h-4" /> 1. Tithi (తిథి)
                  </span>
                  <span className="text-[10px] font-semibold bg-[#F5ECE1] text-[#684300] px-2 py-0.5 rounded-full">
                    {panchangDetails.paksha}
                  </span>
                </div>
                <h4 className="font-serif text-lg font-bold text-[#2C3E50]">
                  {panchangDetails.tithi}
                </h4>
                <p className="text-xs text-[#8A7B6E] mt-1">
                  Lunar phase determining auspicious energy for rites and daily ceremonies.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#D4C5B9]/20 flex justify-between text-[11px]">
                <span className="text-[#8A7B6E]">Paksha:</span>
                <span className="font-semibold text-[#2C3E50]">{panchangDetails.paksha}</span>
              </div>
            </div>

            {/* 2. VAARA */}
            <div className="bg-white rounded-2xl p-4 border border-[#D4C5B9]/40 shadow-xs hover:border-[#E67E22]/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E67E22] flex items-center gap-1.5">
                    <Sun className="w-4 h-4" /> 2. Vaara (వారం)
                  </span>
                  <span className="text-[10px] font-semibold bg-[#F5ECE1] text-[#684300] px-2 py-0.5 rounded-full">
                    Solar Day
                  </span>
                </div>
                <h4 className="font-serif text-lg font-bold text-[#2C3E50]">
                  {panchangDetails.vaara}
                </h4>
                <p className="text-xs text-[#8A7B6E] mt-1">
                  {panchangDetails.vaaraTe} — governed by primary planetary energy.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#D4C5B9]/20 flex justify-between text-[11px]">
                <span className="text-[#8A7B6E]">Day Lord:</span>
                <span className="font-semibold text-[#2C3E50]">{panchangDetails.vaara.split(' ')[0]}</span>
              </div>
            </div>

            {/* 3. NAKSHATRA */}
            <div className="bg-white rounded-2xl p-4 border border-[#D4C5B9]/40 shadow-xs hover:border-[#E67E22]/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E67E22] flex items-center gap-1.5">
                    <Star className="w-4 h-4" /> 3. Nakshatra (నక్షత్రం)
                  </span>
                  <span className="text-[10px] font-semibold bg-[#F5ECE1] text-[#684300] px-2 py-0.5 rounded-full">
                    Pada {panchangDetails.nakPada}
                  </span>
                </div>
                <h4 className="font-serif text-lg font-bold text-[#2C3E50]">
                  {panchangDetails.nakshatra}
                </h4>
                <p className="text-xs text-[#8A7B6E] mt-1">
                  Lunar constellation steering emotional mind and subconscious instincts.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#D4C5B9]/20 flex justify-between text-[11px]">
                <span className="text-[#8A7B6E]">Star Lord:</span>
                <span className="font-semibold text-[#E67E22]">{panchangDetails.nakLord}</span>
              </div>
            </div>

            {/* 4. YOGA */}
            <div className="bg-white rounded-2xl p-4 border border-[#D4C5B9]/40 shadow-xs hover:border-[#E67E22]/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E67E22] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> 4. Yoga (యోగం)
                  </span>
                  <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                    Shubha
                  </span>
                </div>
                <h4 className="font-serif text-lg font-bold text-[#2C3E50]">
                  {panchangDetails.yoga}
                </h4>
                <p className="text-xs text-[#8A7B6E] mt-1">
                  Harmonious mathematical combination of the solar and lunar longitudes.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#D4C5B9]/20 flex justify-between text-[11px]">
                <span className="text-[#8A7B6E]">Category:</span>
                <span className="font-semibold text-emerald-700">Auspicious (శుభ యోగం)</span>
              </div>
            </div>

            {/* 5. KARANA */}
            <div className="bg-white rounded-2xl p-4 border border-[#D4C5B9]/40 shadow-xs hover:border-[#E67E22]/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E67E22] flex items-center gap-1.5">
                    <Compass className="w-4 h-4" /> 5. Karana (కరణం)
                  </span>
                  <span className="text-[10px] font-semibold bg-[#F5ECE1] text-[#684300] px-2 py-0.5 rounded-full">
                    Half-Tithi
                  </span>
                </div>
                <h4 className="font-serif text-lg font-bold text-[#2C3E50]">
                  {panchangDetails.karana}
                </h4>
                <p className="text-xs text-[#8A7B6E] mt-1">
                  Active division of lunar energy shaping the fruition of immediate deeds.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#D4C5B9]/20 flex justify-between text-[11px]">
                <span className="text-[#8A7B6E]">Type:</span>
                <span className="font-semibold text-[#2C3E50]">Chara Karana (చర కరణం)</span>
              </div>
            </div>

            {/* Solar & Lunar Timings Card */}
            <div className="bg-white rounded-2xl p-4 border border-[#D4C5B9]/40 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#E67E22] flex items-center gap-1.5 mb-2">
                  <Clock className="w-4 h-4" /> Solar & Lunar Timings
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#FDFBF7] p-2 rounded-lg border border-[#D4C5B9]/30">
                    <span className="text-[10px] text-[#8A7B6E] block">🌅 Sunrise</span>
                    <span className="font-bold text-[#2C3E50]">{panchangDetails.sunrise}</span>
                  </div>
                  <div className="bg-[#FDFBF7] p-2 rounded-lg border border-[#D4C5B9]/30">
                    <span className="text-[10px] text-[#8A7B6E] block">🌇 Sunset</span>
                    <span className="font-bold text-[#2C3E50]">{panchangDetails.sunset}</span>
                  </div>
                  <div className="bg-[#FDFBF7] p-2 rounded-lg border border-[#D4C5B9]/30">
                    <span className="text-[10px] text-[#8A7B6E] block">🌙 Moonrise</span>
                    <span className="font-bold text-[#2C3E50]">{panchangDetails.moonrise}</span>
                  </div>
                  <div className="bg-[#FDFBF7] p-2 rounded-lg border border-[#D4C5B9]/30">
                    <span className="text-[10px] text-[#8A7B6E] block">🌑 Moonset</span>
                    <span className="font-bold text-[#2C3E50]">{panchangDetails.moonset}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 3. AUSPICIOUS & INAUSPICIOUS MUHURTHAS */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Shubha Samayam (Auspicious Timings) */}
          <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 border-b border-emerald-100 pb-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-emerald-950">
                  Shubha Samayam (శుభ ముహూర్తములు)
                </h3>
                <p className="text-[11px] text-emerald-700">
                  Favorable celestial windows for starting ventures, travels, and pujas.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-950 block text-sm">Abhijit Muhurtham (అభిజిత్ ముహూర్తం)</span>
                  <span className="text-[11px] text-emerald-700">Most auspicious midday window; eliminates all doshas.</span>
                </div>
                <span className="font-mono font-bold text-emerald-800 text-xs px-2.5 py-1 bg-white rounded-lg border border-emerald-300">
                  {panchangDetails.abhijit}
                </span>
              </div>

              <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-200/40 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-950 block">Amrit Kalam (అమృత కాలం)</span>
                  <span className="text-[11px] text-emerald-700">Nectar time for success in high-priority works.</span>
                </div>
                <span className="font-mono font-bold text-emerald-800 text-xs px-2 py-1 bg-white rounded-lg border border-emerald-300">
                  {panchangDetails.amritKalam}
                </span>
              </div>

              <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-200/40 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-950 block">Brahma Muhurtham (బ్రహ్మ ముహూర్తం)</span>
                  <span className="text-[11px] text-emerald-700">Pre-dawn window ideal for meditation and spiritual focus.</span>
                </div>
                <span className="font-mono font-bold text-emerald-800 text-xs px-2 py-1 bg-white rounded-lg border border-emerald-300">
                  {panchangDetails.brahmaMuhurta}
                </span>
              </div>
            </div>
          </div>

          {/* Ashubha Samayam (Inauspicious Timings) */}
          <div className="bg-white rounded-2xl p-5 border border-rose-200 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 border-b border-rose-100 pb-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-rose-950">
                  Ashubha Samayam (వర్జిత / అశుభ కాలాలు)
                </h3>
                <p className="text-[11px] text-rose-700">
                  Inauspicious intervals to be avoided for new beginnings and signatures.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-rose-950 block text-sm">Rahu Kalam (రాహు కాలం)</span>
                  <span className="text-[11px] text-rose-700">Avoid purchasing new assets or starting contracts.</span>
                </div>
                <span className="font-mono font-bold text-rose-800 text-xs px-2.5 py-1 bg-white rounded-lg border border-rose-300">
                  {panchangDetails.rahuKalam}
                </span>
              </div>

              <div className="p-3 bg-rose-50/40 rounded-xl border border-rose-200/40 flex items-center justify-between">
                <div>
                  <span className="font-bold text-rose-950 block">Yamagandam (యమగండం)</span>
                  <span className="text-[11px] text-rose-700">Associated with loss of energy and unwarranted delays.</span>
                </div>
                <span className="font-mono font-bold text-rose-800 text-xs px-2 py-1 bg-white rounded-lg border border-rose-300">
                  {panchangDetails.yamagandam}
                </span>
              </div>

              <div className="p-3 bg-rose-50/40 rounded-xl border border-rose-200/40 flex items-center justify-between">
                <div>
                  <span className="font-bold text-rose-950 block">Gulika Kalam (గుళిక కాలం)</span>
                  <span className="text-[11px] text-rose-700">Saturnian influence; repetition of initial results.</span>
                </div>
                <span className="font-mono font-bold text-rose-800 text-xs px-2 py-1 bg-white rounded-lg border border-rose-300">
                  {panchangDetails.gulika}
                </span>
              </div>

              <div className="p-3 bg-rose-50/40 rounded-xl border border-rose-200/40 flex items-center justify-between">
                <div>
                  <span className="font-bold text-rose-950 block">Durmuhurtham (దుర్ముహూర్తం)</span>
                  <span className="text-[11px] text-rose-700">Malefic time slot of the day.</span>
                </div>
                <span className="font-mono font-bold text-rose-800 text-xs px-2 py-1 bg-white rounded-lg border border-rose-300">
                  {panchangDetails.durmuhurtham.split(',')[0]}
                </span>
              </div>
            </div>
          </div>

        </section>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 4. CHOGHADIYA MUHURTHA TABLE (DAY & NIGHT) */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <section className="bg-white rounded-2xl p-5 border border-[#D4C5B9]/40 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D4C5B9]/30 pb-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2C3E50]">
                Choghadiya Muhurthas (దిన & రాత్రి చోఘడియా)
              </h3>
              <p className="text-xs text-[#8A7B6E]">
                Traditional 8-part daytime and 8-part nighttime Vedic action guide.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">Amrit / Shubh (Best)</span>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">Chal (Neutral)</span>
              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 border border-rose-300">Kaal / Rog (Avoid)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Day Choghadiya */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#E67E22] uppercase tracking-wider flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5" /> Day Choghadiya (Sunrise to Sunset)
              </span>
              <div className="space-y-1.5 text-xs">
                {choghadiyaSlots.daySlots.map((slot, i) => (
                  <div key={i} className={`p-2.5 rounded-xl border flex items-center justify-between ${slot.color}`}>
                    <span className="font-mono text-[11px] font-semibold">{slot.time}</span>
                    <div className="text-right">
                      <span className="font-bold block">{slot.name}</span>
                      <span className="text-[10px] opacity-80">{slot.labelTe}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Night Choghadiya */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5" /> Night Choghadiya (Sunset to Sunrise)
              </span>
              <div className="space-y-1.5 text-xs">
                {choghadiyaSlots.nightSlots.map((slot, i) => (
                  <div key={i} className={`p-2.5 rounded-xl border flex items-center justify-between ${slot.color}`}>
                    <span className="font-mono text-[11px] font-semibold">{slot.time}</span>
                    <div className="text-right">
                      <span className="font-bold block">{slot.name}</span>
                      <span className="text-[10px] opacity-80">{slot.labelTe}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 5. 24 DINA HORAS (PLANETARY HOURS) */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <section className="bg-white rounded-2xl p-5 border border-[#D4C5B9]/40 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#D4C5B9]/30 pb-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2C3E50]">
                Dina Hora (గ్రహ హోరలు — 24 Planetary Hours)
              </h3>
              <p className="text-xs text-[#8A7B6E]">
                Successive planetary rulers governing each hour of the solar day and night.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
            {horaSlots.slice(0, 12).map((hora, idx) => (
              <div 
                key={idx}
                className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                  hora.nature === 'Auspicious' 
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' 
                    : 'bg-amber-50/40 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-[#8A7B6E]">Hora {idx + 1}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${hora.nature === 'Auspicious' ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'}`}>
                    {hora.nature}
                  </span>
                </div>
                <div className="mt-1.5">
                  <span className="font-bold text-sm block" style={{ color: PLANET_COLORS[hora.lord] }}>
                    {hora.lord} Hora
                  </span>
                  <span className="text-[10px] text-[#8A7B6E] block font-mono">
                    {hora.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* SIGN INSPECTOR MODAL */}
      {/* ──────────────────────────────────────────────────────────── */}
      {selectedSign && (
        <div className="fixed inset-0 z-50 bg-[#2C3E50]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4C5B9]/40 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-xl relative animate-in fade-in zoom-in duration-150">
            <button 
              onClick={() => setSelectedSign(null)}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full hover:bg-[#F5ECE1] text-[#564337] transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="border-b border-[#D4C5B9]/30 pb-2">
              <h4 className="font-serif font-bold text-lg text-[#2C3E50]">
                {selectedSign.signName} ({SIGN_DATA[selectedSign.signName]?.nameTe || ''})
              </h4>
              <p className="text-xs text-[#E67E22] font-semibold">
                Lord: {SIGN_DATA[selectedSign.signName]?.lord} • Element: {SIGN_DATA[selectedSign.signName]?.element}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-[#8A7B6E] font-medium block">Transiting Planets in this Sign:</span>
              {selectedSign.planets.length === 0 ? (
                <p className="text-xs text-[#8A7B6E] italic py-2">No planets currently transiting in {selectedSign.signName}.</p>
              ) : (
                <div className="space-y-2">
                  {selectedSign.planets.map((abbr) => {
                    const fullPlanet = (Object.keys(PLANET_ABBR) as PlanetKey[]).find(
                      k => PLANET_ABBR[k] === abbr
                    );
                    const pos = fullPlanet ? transitSnapshot.positions[fullPlanet] : null;
                    return (
                      <div key={abbr} className="p-2.5 bg-[#FDFBF7] rounded-xl border border-[#D4C5B9]/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span 
                            className="font-mono font-bold text-sm px-2 py-0.5 rounded-md"
                            style={{ color: fullPlanet ? PLANET_COLORS[fullPlanet] : '#E67E22', backgroundColor: '#F5ECE1' }}
                          >
                            {abbr}
                          </span>
                          <div>
                            <span className="font-semibold text-xs text-[#2C3E50] block">{fullPlanet}</span>
                            <span className="text-[10px] text-[#8A7B6E]">Degree: {pos?.degreeInSign.toFixed(2)}°</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#E67E22]">
                          H{pos?.houseFromMoon} from Moon
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedSign(null)}
              className="w-full py-2 bg-[#E67E22] text-white rounded-xl font-semibold text-xs hover:bg-[#E67E22]/90 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
