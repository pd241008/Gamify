'use client';

import { useState } from 'react';
import MatchCard, { Match } from './MatchCard';
import MatchModal from './MatchModal';

interface TournamentSectionProps {
  tournamentName: string;
  matches: Match[];
  defaultOpen?: boolean;
}

export default function TournamentSection({ tournamentName, matches, defaultOpen = true }: TournamentSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  return (
    <div className="mb-8 sm:mb-10">
      {/* Tournament Header — clickable to toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 group cursor-pointer"
        aria-expanded={isOpen}
        aria-controls={`tournament-${tournamentName.replace(/\s+/g, '-').toLowerCase()}`}
      >
        {/* Accent bar */}
        <div className="hidden sm:block w-1 h-8 rounded-full bg-gradient-to-b from-purple-500 to-cyan-500 flex-shrink-0" />

        {/* Tournament name + count */}
        <div className="flex-1 flex items-center gap-2 sm:gap-3 min-w-0">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate group-hover:text-purple-300 transition-colors">
            {tournamentName}
          </h2>
          <span className="flex-shrink-0 text-xs font-semibold text-gray-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
            {matches.length} {matches.length === 1 ? 'match' : 'matches'}
          </span>
        </div>

        {/* Chevron */}
        <svg
          className={`w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-all duration-300 flex-shrink-0 ${isOpen ? 'rotate-0' : '-rotate-90'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Divider line */}
      <div className="h-px bg-gradient-to-r from-purple-500/20 via-white/10 to-transparent mb-4 sm:mb-6" />

      {/* Match Grid — collapsible */}
      <div
        id={`tournament-${tournamentName.replace(/\s+/g, '-').toLowerCase()}`}
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 transition-all duration-300 ${
          isOpen ? 'opacity-100' : 'hidden'
        }`}
      >
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            onClick={setSelectedMatch}
          />
        ))}
      </div>

      {/* Collapsed summary */}
      {!isOpen && (
        <div className="text-sm text-gray-500 italic pl-0 sm:pl-5">
          {matches.length} {matches.length === 1 ? 'match' : 'matches'} hidden — click to expand
        </div>
      )}

      <MatchModal
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
      />
    </div>
  );
}
