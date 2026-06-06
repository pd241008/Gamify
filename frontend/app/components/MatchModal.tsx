'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Match } from './MatchCard';

interface MatchModalProps {
  match: Match | null;
  onClose: () => void;
}

interface ReminderOption {
  label: string;
  minutes: number;
}

const REMINDER_OPTIONS: ReminderOption[] = [
  { label: 'At match start', minutes: 0 },
  { label: '15 min before', minutes: 15 },
  { label: '30 min before', minutes: 30 },
  { label: '1 hour before', minutes: 60 },
];

// Prefix for localStorage keys
const REMINDER_STORAGE_PREFIX = 'gamify_reminder_';

function getStoredReminder(matchId: string): number | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(`${REMINDER_STORAGE_PREFIX}${matchId}`);
  return stored !== null ? parseInt(stored, 10) : null;
}

function setStoredReminder(matchId: string, minutes: number): void {
  localStorage.setItem(`${REMINDER_STORAGE_PREFIX}${matchId}`, String(minutes));
}

function removeStoredReminder(matchId: string): void {
  localStorage.removeItem(`${REMINDER_STORAGE_PREFIX}${matchId}`);
}

// Team logo with error fallback
function ModalTeamLogo({ src, alt, fallbackSrc }: { src?: string; alt: string; fallbackSrc: string }) {
  const [error, setError] = useState(false);
  const imageSrc = !src || error ? fallbackSrc : src;

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={64}
      height={64}
      sizes="64px"
      loading="lazy"
      className="object-cover w-full h-full"
      onError={() => setError(true)}
    />
  );
}

export default function MatchModal({ match, onClose }: MatchModalProps) {
  const [selectedReminder, setSelectedReminder] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [notificationGranted, setNotificationGranted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Animate in on mount
  useEffect(() => {
    if (match) {
      requestAnimationFrame(() => setIsVisible(true));

      // Load existing reminder
      const existing = getStoredReminder(match.id);
      if (existing !== null) {
        setSelectedReminder(existing);
        setSaved(true);
      } else {
        setSelectedReminder(null);
        setSaved(false);
      }

      // Check notification permission
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setNotificationGranted(Notification.permission === 'granted');
      }
    }
  }, [match]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 200); // Wait for animation
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleClose]);

  if (!match) return null;

  const date = new Date(match.scheduledAt);
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationGranted(permission === 'granted');
      return permission === 'granted';
    }
    return false;
  };

  const scheduleReminder = (minutes: number) => {
    const matchTime = new Date(match.scheduledAt).getTime();
    const reminderTime = matchTime - minutes * 60 * 1000;
    const now = Date.now();
    const delay = reminderTime - now;

    if (delay > 0) {
      setTimeout(() => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🎮 Gamify Match Reminder', {
            body: `${match.teamA.name} vs ${match.teamB.name} ${minutes === 0 ? 'is starting now!' : `starts in ${minutes} minutes!`}`,
            icon: '/favicon.ico',
          });
        }
      }, delay);
    }
  };

  const handleSetReminder = async (minutes: number) => {
    setSelectedReminder(minutes);

    // Request notification permission if not granted
    let hasPermission = notificationGranted;
    if (!hasPermission) {
      hasPermission = await requestNotificationPermission();
    }

    // Store reminder
    setStoredReminder(match.id, minutes);

    // Schedule the notification (only works while tab is open)
    if (hasPermission) {
      scheduleReminder(minutes);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRemoveReminder = () => {
    removeStoredReminder(match.id);
    setSelectedReminder(null);
    setSaved(false);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 200ms ease-out',
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
        role="presentation"
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-black/80 backdrop-blur-xl shadow-2xl shadow-purple-500/10 overflow-hidden"
        style={{
          transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
          transition: 'transform 200ms ease-out',
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`Match details: ${match.teamA.name} vs ${match.teamB.name}`}
      >
        {/* Header glow bar */}
        <div className="h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-fuchsia-500" />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
          aria-label="Close modal"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-4 sm:p-6 md:p-8">
          {/* Game & Tournament tags */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
            {match.videogame && (
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/20">
                {match.videogame}
              </span>
            )}
            <span className="text-xs font-semibold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20">
              {match.tournament}
            </span>
          </div>

          {/* Teams */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex flex-col items-center flex-1">
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-cyan-400/30 bg-gray-900 flex items-center justify-center">
                <ModalTeamLogo
                  src={match.teamA.logoUrl}
                  alt={match.teamA.name}
                  fallbackSrc="/team_logo_alpha_1780293006977.png"
                />
              </div>
              <span className="mt-2 font-bold text-white text-center text-sm">{match.teamA.name}</span>
            </div>

            <div className="flex flex-col items-center px-3 sm:px-6">
              <span className="text-2xl font-black text-gray-500">VS</span>
            </div>

            <div className="flex flex-col items-center flex-1">
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-fuchsia-400/30 bg-gray-900 flex items-center justify-center">
                <ModalTeamLogo
                  src={match.teamB.logoUrl}
                  alt={match.teamB.name}
                  fallbackSrc="/team_logo_beta_1780293024477.png"
                />
              </div>
              <span className="mt-2 font-bold text-white text-center text-sm">{match.teamB.name}</span>
            </div>
          </div>

          {/* Schedule */}
          <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/10">
            <svg className="w-5 h-5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-white font-semibold text-sm" suppressHydrationWarning>{dateString}</p>
              <p className="text-gray-400 text-xs" suppressHydrationWarning>{timeString}</p>
            </div>
            <span className="ml-auto text-xs px-3 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10 uppercase tracking-wide">
              {match.status.replace('_', ' ')}
            </span>
          </div>

          {/* Reminder section */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Set Reminder
            </h3>
            <p className="text-gray-500 text-sm mb-4">Get notified before this match starts</p>

            {!notificationGranted && typeof window !== 'undefined' && 'Notification' in window && (
              <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Browser notifications will be requested when you set a reminder
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {REMINDER_OPTIONS.map((option) => (
                <button
                  key={option.minutes}
                  onClick={() => handleSetReminder(option.minutes)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    selectedReminder === option.minutes
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] ring-1 ring-purple-400/30'
                      : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Status messages */}
            <div className="mt-4 flex items-center justify-between">
              {saved && (
                <span className="text-sm text-green-400 flex items-center gap-1 animate-pulse">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Reminder set!
                </span>
              )}

              {selectedReminder !== null && !saved && (
                <span className="text-sm text-gray-400">
                  Reminder active
                </span>
              )}

              {selectedReminder !== null && (
                <button
                  onClick={handleRemoveReminder}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors ml-auto"
                >
                  Remove reminder
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export utility for other components to check if a reminder exists
export function hasReminder(matchId: string): boolean {
  return getStoredReminder(matchId) !== null;
}
