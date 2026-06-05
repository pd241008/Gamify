'use client'
import Image from "next/image";
import { useState, useEffect } from "react";

export interface Match {
  id: string;
  name: string;
  tournament: string;
  videogame: string;
  status: "not_started" | "running" | "finished" | "canceled";
  scheduledAt: string;
  teamA: {
    name: string;
    logoUrl?: string; // Optional
  };
  teamB: {
    name: string;
    logoUrl?: string; // Optional
  };
}

// Internal component to handle image errors and fallbacks securely
function TeamLogo({ src, alt, fallbackSrc }: { src?: string; alt: string; fallbackSrc: string }) {
  const [error, setError] = useState(false);
  const imageSrc = !src || error ? fallbackSrc : src;

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={80}
      height={80}
      sizes="(max-width: 768px) 80px, 80px"
      loading="lazy"
      className="object-cover w-full h-full"
      onError={() => setError(true)}
    />
  );
}

// Check if a reminder exists for a match (localStorage)
function useHasReminder(matchId: string): boolean {
  const [has, setHas] = useState(false);
  useEffect(() => {
    setHas(localStorage.getItem(`gamify_reminder_${matchId}`) !== null);
  }, [matchId]);
  return has;
}

interface MatchCardProps {
  match: Match;
  onClick?: (match: Match) => void;
}

export default function MatchCard({ match, onClick }: MatchCardProps) {
  const date = new Date(match.scheduledAt);
  const timeString = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateString = date.toLocaleDateString();
  const reminderSet = useHasReminder(match.id);

  return (
    <div
      onClick={() => onClick?.(match)}
      className="relative group overflow-hidden rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md p-6 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-purple-500/20 cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(match); }}
      aria-label={`${match.teamA.name} vs ${match.teamB.name} — click for details`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Reminder indicator */}
      {reminderSet && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30">
          <svg className="w-3.5 h-3.5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">Reminder</span>
        </div>
      )}

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2 items-center">
            {match.videogame && (
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                {match.videogame}
              </span>
            )}
            <span className="text-xs font-semibold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20">
              {match.tournament}
            </span>
          </div>
          <span className="text-sm text-gray-400 flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <time suppressHydrationWarning dateTime={match.scheduledAt}>
              {dateString} • {timeString}
            </time>
          </span>
        </div>

        <div className="flex items-center justify-between mb-4 mt-8">
          <div className="flex flex-col items-center flex-1">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white/5 bg-gray-900 group-hover:border-cyan-400/50 transition-colors duration-300 flex items-center justify-center">
              <TeamLogo
                src={match.teamA.logoUrl}
                alt={match.teamA.name}
                fallbackSrc="/team_logo_alpha_1780293006977.png"
              />
            </div>
            <span className="mt-3 font-bold text-lg text-white text-center">{match.teamA.name}</span>
          </div>

          <div className="flex flex-col items-center px-4">
            <span className="text-sm font-bold text-gray-500 mb-1">VS</span>
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>

          <div className="flex flex-col items-center flex-1">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white/5 bg-gray-900 group-hover:border-fuchsia-400/50 transition-colors duration-300 flex items-center justify-center">
              <TeamLogo
                src={match.teamB.logoUrl}
                alt={match.teamB.name}
                fallbackSrc="/team_logo_beta_1780293024477.png"
              />
            </div>
            <span className="mt-3 font-bold text-lg text-white text-center">{match.teamB.name}</span>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <span className="text-xs text-center px-4 py-1.5 rounded-full bg-white/5 text-gray-300 border border-white/10 uppercase tracking-wide">
            {match.status.replace("_", " ")}
          </span>
        </div>
      </div>
    </div>
  );
}
