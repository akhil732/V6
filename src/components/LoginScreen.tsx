import React from 'react';
import { GoogleSignInButton } from './GoogleSignInButton';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ShieldCheck, Heart, ArrowLeft, LogOut, CheckCircle } from 'lucide-react';

interface LoginScreenProps {
  onBack?: () => void;
  onNavigatePage?: (page: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onBack, onNavigatePage }) => {
  const { user, isAuthenticated, signOut, error } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0E17] relative overflow-hidden px-4 py-12 selection:bg-[#F5A623]/20 selection:text-[#F5A623]">
      {/* Top back button if available */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-xs font-semibold text-[#9CA3AF] hover:text-[#F5A623] bg-[#10141F]/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#1E2433] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      )}

      {/* Cosmic background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-purple-900/20 via-[#F5A623]/10 to-indigo-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
      
      {/* Decorative stars / zodiac subtle hints */}
      <div className="absolute inset-0 bg-[radial-gradient(#F5A623_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.04] pointer-events-none" />

      {/* Main Card */}
      <div className="relative z-10 bg-[#10141F]/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-[440px] border border-[#1E2433] text-center flex flex-col items-center">
        
        {/* App Logo */}
        <div className="relative mb-6 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#F5A623] to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
          <div className="relative w-20 h-20 rounded-2xl border-2 border-[#F5A623]/60 bg-gradient-to-br from-[#F5A623] to-amber-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            🕉
          </div>
        </div>

        {/* Brand Header */}
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#F5A623] font-mono font-semibold mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" /> Vedic Astrology Engine
        </span>
        
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F5F7] tracking-wide mb-2">
          JYOTHISHYA SANATHANAM
        </h1>
        
        <p className="text-sm text-[#9CA3AF] mb-6 font-medium">
          Marriage Compatibility & Horoscope Matching
        </p>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#1E2433] to-transparent mb-6" />

        {isAuthenticated && user ? (
          /* Authenticated State */
          <div className="w-full space-y-4 mb-4">
            <div className="p-4 bg-[#181F30] rounded-2xl border border-[#2A344A] flex flex-col items-center text-center gap-2">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-full border-2 border-[#F5A623] object-cover shadow-md"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#F5A623] text-[#0A0E17] flex items-center justify-center font-bold text-xl font-serif">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
              )}
              
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Signed In Successfully</span>
              </div>

              <h3 className="font-bold text-base text-[#F5F5F7]">{user.displayName || 'Google User'}</h3>
              <p className="text-xs text-[#9CA3AF] font-mono">{user.email}</p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              {onNavigatePage && (
                <button
                  onClick={() => onNavigatePage('home')}
                  className="w-full py-3 bg-[#F5A623] hover:bg-[#e0951d] text-[#0A0E17] font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-md"
                >
                  Go to Home Dashboard
                </button>
              )}
              <button
                onClick={() => signOut()}
                className="w-full py-2.5 bg-transparent hover:bg-red-500/10 border border-red-500/30 text-red-400 font-semibold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* Unauthenticated State */
          <>
            {/* Action Callout */}
            <p className="text-xs text-[#D1D5DB] mb-6 leading-relaxed px-2">
              Sign in with your Google account to save birth profiles, calculate Ashta Kuta compatibility, and sync reports securely.
            </p>

            {/* Error Alert if any */}
            {error && (
              <div className="w-full mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-left leading-relaxed flex items-start gap-2">
                <span className="text-red-400 shrink-0 font-bold">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Sign In Button */}
            <div className="w-full mb-6">
              <GoogleSignInButton />
            </div>
          </>
        )}

        {/* Feature Badges */}
        <div className="grid grid-cols-2 gap-2.5 w-full text-left pt-3 border-t border-[#1E2433]/60 text-[11px] text-[#9CA3AF]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#F5A623]" />
            <span>Secure Cloud Sync</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-pink-400" />
            <span>36 Kuta Matching</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-[11px] text-[#6B7280] flex flex-col gap-1">
          <div className="flex items-center justify-center gap-3">
            <a href="#" className="hover:text-[#9CA3AF] transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-[#9CA3AF] transition-colors">Terms of Service</a>
          </div>
          <p className="text-[10px] opacity-60 mt-1">© {new Date().getFullYear()} Jyothishya Sanathanam</p>
        </div>

      </div>
    </div>
  );
};


