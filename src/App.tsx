import React, { useState, useEffect } from 'react';
import { GlobalHeader } from './components/GlobalShell/Header';
import { BottomNav } from './components/GlobalShell/BottomNav';
import { HomePage } from './pages/HomePage';
import { HomePageV1 } from './pages/HomePageV1';
import { BirthChartPage } from './pages/BirthChartPage';
import MarriageMatch from './pages/MarriageMatch';
import { AIConsultationPage } from './pages/AIConsultationPage';
import { ProfilePage } from './pages/ProfilePage';
import { KundaliPage } from './pages/KundaliPage';
import { PanchangamPage } from './pages/PanchangamPage';
import { LoginPage } from './pages/LoginPage';
import { BirthForm } from './components/BirthForm';
import { BirthDetails } from './types';
import { SavedPerson } from './types/marriageMatch';
import { ProfileStorageService } from './lib/profileStorageService';
import { DriveSyncService } from './lib/driveSyncService';
import { jhoraAPI } from './lib/jhoraAPI';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { X } from 'lucide-react';

const API_BASE_URL = '/api/jhora-proxy';

const AKHIL_DEFAULT_PROFILE: SavedPerson = {
  id: 'satyam-family-10',
  name: 'I. Akhil',
  gender: 'Male',
  date: '1996-11-11',
  time: '13:50:00',
  place: 'Jaggampeta, Andhra Pradesh, India',
  latitude: 17.17,
  longitude: 82.0611,
  timezone: 5.5
};

export default function App() {
  const { isAuthenticated } = useAuth();
  const { language, setLanguage } = useLanguage();

  // Navigation State
  const [activePage, setActivePage] = useState<'home' | 'kundali' | 'birth-chart' | 'marriage-match' | 'ai-consultation' | 'profile' | 'panchangam' | 'login'>('home');

  const [isFormSubmitting, setIsFormSubmitting] = useState<boolean>(false);

  // Profile and Horoscope Data State
  const [savedProfiles, setSavedProfiles] = useState<SavedPerson[]>([AKHIL_DEFAULT_PROFILE]);
  const [activeProfile, setActiveProfile] = useState<SavedPerson | null>(AKHIL_DEFAULT_PROFILE);
  const [horoscopeReport, setHoroscopeReport] = useState<any | null>(null);
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Profile Edit Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingProfile, setEditingProfile] = useState<SavedPerson | null>(null);

  // Today's Panchangam and Gochara State
  const [todayPanchangam, setTodayPanchangam] = useState<any | null>(null);
  const [todayGochara, setTodayGochara] = useState<any | null>(null);
  const [todayPanchangamLoading, setTodayPanchangamLoading] = useState<boolean>(false);
  const [todayPanchangamError, setTodayPanchangamError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodayPanchangamAndGochara = async () => {
      const todayStr = new Date().toISOString().split('T')[0];
      
      try {
        const cached = localStorage.getItem('sanathanam_today_panchangam');
        const cachedGochara = localStorage.getItem('sanathanam_today_gochara');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.date === todayStr && parsed.data) {
            setTodayPanchangam(parsed.data);
          }
        }
        if (cachedGochara) {
          const parsedG = JSON.parse(cachedGochara);
          if (parsedG.date === todayStr && parsedG.data) {
            setTodayGochara(parsedG.data);
          }
        }
      } catch (err) {
        console.error('Cache read error:', err);
      }

      setTodayPanchangamLoading(true);
      try {
        // Fetch real-time planetary transits and panchangam for today via POST /gochara
        const gocharaRes = await jhoraAPI.getGochara({
          date: activeProfile?.date || '1996-11-11',
          time: activeProfile?.time || '13:50:00',
          place: activeProfile?.place || 'Hyderabad',
          latitude: activeProfile?.latitude || 17.3850,
          longitude: activeProfile?.longitude || 78.4867,
          timezone: activeProfile?.timezone || 5.5,
          target_date: todayStr,
          target_time: '12:00:00',
          event_place: activeProfile?.place || 'Hyderabad',
          event_latitude: activeProfile?.latitude || 17.3850,
          event_longitude: activeProfile?.longitude || 78.4867,
          event_timezone: activeProfile?.timezone || 5.5,
          ayanamsa_mode: 'LAHIRI'
        });

        if (gocharaRes?.gochara) {
          const gData = gocharaRes.gochara;
          setTodayGochara(gData);
          localStorage.setItem('sanathanam_today_gochara', JSON.stringify({
            date: todayStr,
            data: gData
          }));

          if (gData.panchanga) {
            const formatTimeInterval = (val: any, fallback: string = '') => {
              if (!val) return fallback;
              if (typeof val === 'string') return val;
              if (typeof val === 'object' && val.start && val.end) return `${val.start} - ${val.end}`;
              if (typeof val === 'object' && val.start_time && val.end_time) return `${val.start_time} - ${val.end_time}`;
              return fallback;
            };

            const pInfo = {
              ...gData.panchanga,
              ...gData.muhurta,
              Tithi: `${gData.panchanga.paksha || ''} Paksha ${gData.panchanga.tithi?.name || (typeof gData.panchanga.tithi === 'string' ? gData.panchanga.tithi : '')}`.trim(),
              Nakshatram: gData.panchanga.nakshatra?.name || (typeof gData.panchanga.nakshatra === 'string' ? gData.panchanga.nakshatra : ''),
              Yoga: gData.panchanga.yoga?.name || (typeof gData.panchanga.yoga === 'string' ? gData.panchanga.yoga : ''),
              Karana: gData.panchanga.karana?.name || (typeof gData.panchanga.karana === 'string' ? gData.panchanga.karana : ''),
              Vaara: gData.panchanga.vara || (typeof gData.panchanga.vara === 'string' ? gData.panchanga.vara : ''),
              'Sun Rise': typeof gData.muhurta?.sunrise === 'string' ? gData.muhurta.sunrise : (gData.muhurta?.sunrise?.start || '06:04 AM'),
              'Sun Set': typeof gData.muhurta?.sunset === 'string' ? gData.muhurta.sunset : (gData.muhurta?.sunset?.start || '06:32 PM'),
              RahuKalam: formatTimeInterval(gData.muhurta?.rahu_kalam, '01:30 PM - 03:00 PM'),
              Abhijit: formatTimeInterval(gData.muhurta?.abhijit, undefined),
              Gulika: formatTimeInterval(gData.muhurta?.gulika, undefined),
              Yamagandam: formatTimeInterval(gData.muhurta?.yamagandam, undefined)
            };
            setTodayPanchangam(pInfo);
            localStorage.setItem('sanathanam_today_panchangam', JSON.stringify({
              date: todayStr,
              data: pInfo
            }));
          }
        } else {
          // Fallback to horoscope endpoint
          const response = await fetch(`${API_BASE_URL}/horoscope`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              date: todayStr,
              time: '06:00:00',
              place: 'Hyderabad',
              latitude: 17.3850,
              longitude: 78.4867,
              timezone: 5.5
            }),
          });

          if (!response.ok) throw new Error('Failed to fetch panchangam');

          const data = await response.json();
          const calInfo = data?.horoscope?.calendar_info || data?.calendar_info;
          if (calInfo) {
            setTodayPanchangam(calInfo);
            localStorage.setItem('sanathanam_today_panchangam', JSON.stringify({
              date: todayStr,
              data: calInfo
            }));
          }
        }
      } catch (err: any) {
        console.warn('Warning fetching today panchangam & gochara:', err);
        setTodayPanchangamError(err?.message || 'Error fetching panchangam');
      } finally {
        setTodayPanchangamLoading(false);
      }
    };

    fetchTodayPanchangamAndGochara();
  }, [activeProfile]);

  // Subscribe to profile storage
  useEffect(() => {
    const unsubscribe = ProfileStorageService.subscribe((loaded) => {
      if (loaded && loaded.length > 0) {
        setSavedProfiles([AKHIL_DEFAULT_PROFILE, ...loaded.filter(p => p.id !== AKHIL_DEFAULT_PROFILE.id)]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch horoscope report for active profile when changed
  useEffect(() => {
    if (!activeProfile) return;

    const fetchReport = async () => {
      setHoroscopeReport(null);
      setReportLoading(true);
      setReportError(null);
      try {
        const payload = {
          date: activeProfile.date,
          time: activeProfile.time,
          place: activeProfile.place,
          latitude: activeProfile.latitude,
          longitude: activeProfile.longitude,
          timezone: activeProfile.timezone
        };

        const res = await fetch(`${API_BASE_URL}/horoscope`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          throw new Error('Failed to generate horoscope data from Jagannatha Hora engine.');
        }

        const data = await res.json();
        const hasUsableChart = data?.horoscope?.divisional_charts?.['D-1_rasi']
          || data?.divisional_charts?.['D-1_rasi'];
        if (!hasUsableChart) {
          throw new Error('Horoscope response missing chart data (divisional_charts).');
        }
        setHoroscopeReport(data);
      } catch (err: any) {
        console.warn('Warning fetching horoscope report:', err);
        setReportError(err.message || 'Error generating horoscope');
      } finally {
        setReportLoading(false);
      }
    };

    fetchReport();
  }, [activeProfile]);

  // Save/Update profile from BirthForm modal
  const handleFormSubmit = async (details: BirthDetails) => {
    setIsFormSubmitting(true);
    const newPerson: SavedPerson = {
      id: editingProfile?.id || `person_${Date.now()}`,
      name: details.name,
      gender: details.gender,
      date: details.date,
      time: details.time,
      place: details.place,
      latitude: details.latitude,
      longitude: details.longitude,
      timezone: details.timezone,
    };

    await ProfileStorageService.saveProfile(newPerson);
    setActiveProfile(newPerson);
    setIsFormModalOpen(false);
    setEditingProfile(null);
    setActivePage('birth-chart');
    setIsFormSubmitting(false);
  };

  const handleCreateNewProfile = () => {
    setEditingProfile(null);
    setIsFormModalOpen(true);
  };

  const handleEditProfile = (profile?: SavedPerson) => {
    setEditingProfile(profile || activeProfile);
    setIsFormModalOpen(true);
  };

  const handleDeleteProfile = async (id: string) => {
    if (id === AKHIL_DEFAULT_PROFILE.id) {
      alert("Default profile cannot be deleted.");
      return;
    }
    const confirmed = window.confirm("Are you sure you want to delete this birth chart profile?");
    if (confirmed) {
      await ProfileStorageService.deleteProfile(id);
      if (activeProfile?.id === id) {
        setActiveProfile(AKHIL_DEFAULT_PROFILE);
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface-cream text-on-surface flex flex-col font-sans selection:bg-deep-saffron/20">
      
      {/* GLOBAL HEADER */}
      <GlobalHeader
        activePage={activePage}
        activeProfile={activeProfile}
        savedProfiles={savedProfiles}
        onSelectActiveProfile={(p) => setActiveProfile(p)}
        onCreateNewProfile={handleCreateNewProfile}
        onNavigatePage={(page) => setActivePage(page)}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* MAIN VIEWPORT CANVAS */}
      <main className={`flex-1 w-full ${activePage === 'home' || activePage === 'birth-chart' || activePage === 'marriage-match' ? 'pb-0' : 'pb-16'}`}>
        {activePage === 'home' && (
          <HomePageV1
            activeProfile={activeProfile}
            savedProfiles={savedProfiles}
            onSelectActiveProfile={(p) => setActiveProfile(p)}
            onNavigatePage={(page) => setActivePage(page as any)}
            onCreateNewProfile={handleCreateNewProfile}
            language={language}
            todayPanchangam={todayPanchangam}
            todayGochara={todayGochara}
            todayPanchangamLoading={todayPanchangamLoading}
            todayPanchangamError={todayPanchangamError}
          />
        )}

        {activePage === 'kundali' && (
          <KundaliPage
            savedProfiles={savedProfiles}
            activeProfile={activeProfile}
            onGenerateNewKundali={handleFormSubmit}
            onSelectSavedProfile={(p) => {
              setActiveProfile(p);
              setActivePage('birth-chart');
            }}
            onDeleteProfile={handleDeleteProfile}
            onBack={() => setActivePage('home')}
            language={language}
            loading={isFormSubmitting || reportLoading}
          />
        )}

        {activePage === 'birth-chart' && (
          <BirthChartPage
            horoscopeReport={horoscopeReport}
            activeProfile={activeProfile}
            onEditProfile={() => handleEditProfile()}
            language={language}
            reportLoading={reportLoading}
            onSelectProfile={(p) => setActiveProfile(p)}
            onNavigatePage={(page) => setActivePage(page as any)}
            onBack={() => setActivePage('home')}
          />
        )}

        {activePage === 'marriage-match' && (
          <MarriageMatch
            language={language}
            savedProfiles={savedProfiles}
            onBack={() => setActivePage('home')}
            onNavigatePage={(page) => setActivePage(page as any)}
          />
        )}

        {activePage === 'ai-consultation' && (
          <AIConsultationPage
            activeProfile={activeProfile}
            horoscopeReport={horoscopeReport}
            language={language}
            savedProfiles={savedProfiles}
            onSelectProfile={(p) => setActiveProfile(p)}
          />
        )}

        {activePage === 'profile' && (
          <ProfilePage
            savedProfiles={savedProfiles}
            activeProfile={activeProfile}
            onSelectActiveProfile={(p) => setActiveProfile(p)}
            onCreateNewProfile={handleCreateNewProfile}
            onEditProfile={(p) => handleEditProfile(p)}
            onDeleteProfile={handleDeleteProfile}
            onNavigatePage={(page) => setActivePage(page as any)}
            language={language}
            onLanguageChange={setLanguage}
          />
        )}

        {activePage === 'panchangam' && (
          <PanchangamPage
            todayPanchangam={todayPanchangam}
            todayGochara={todayGochara}
            activeProfile={activeProfile}
            language={language}
            onBack={() => setActivePage('home')}
            onNavigatePage={(page) => setActivePage(page)}
          />
        )}

        {activePage === 'login' && (
          <LoginPage
            onBack={() => setActivePage('home')}
            onNavigatePage={(page) => setActivePage(page as any)}
          />
        )}
      </main>

      {/* GLOBAL BOTTOM NAVIGATION BAR (Hidden on home as HomePageV1 renders its exact design bar, and hidden on login) */}
      {activePage !== 'home' && activePage !== 'login' && (
        <BottomNav
          activePage={activePage}
          onNavigatePage={(page) => setActivePage(page)}
        />
      )}

      {/* PROFILE CREATE / EDIT MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-royal-navy/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white dark:bg-ds-surface border border-royal-navy/20 dark:border-white/10 rounded-2xl w-full max-w-xl p-4 sm:p-6 space-y-4 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsFormModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-surface-container-low dark:hover:bg-surface-container-high text-on-surface-variant dark:text-ds-on-surface transition-colors cursor-pointer focus-ring"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-playfair font-bold text-title-lg text-royal-navy dark:text-white border-b border-royal-navy/10 dark:border-white/10 pb-2">
              {editingProfile ? 'Edit Birth Profile' : 'Create New Birth Profile'}
            </h2>

            <BirthForm
              onSubmit={handleFormSubmit}
              initialValues={editingProfile ? {
                name: editingProfile.name,
                gender: editingProfile.gender || 'Male',
                date: editingProfile.date,
                time: editingProfile.time,
                approximateTime: false,
                place: editingProfile.place,
                latitude: editingProfile.latitude || 17.17,
                longitude: editingProfile.longitude || 82.0611,
                timezone: editingProfile.timezone || 5.5,
              } : null}
              loading={isFormSubmitting}
              error={null}
              language={language}
              embedded={true}
              hideHeader={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
