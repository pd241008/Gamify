'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

export default function TournamentFilter({ tournaments }: { tournaments: { id: string, name: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTournament = searchParams.get('tournament') || '';
  const [isOpen, setIsOpen] = useState(false);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleSelect = (id: string) => {
    router.push('?' + createQueryString('tournament', id));
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left z-30">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex w-full justify-between gap-x-1.5 rounded-md bg-purple-500/10 px-3 py-2 text-sm font-semibold text-purple-400 shadow-sm ring-1 ring-inset ring-purple-500/30 hover:bg-purple-500/20"
          id="menu-button"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {currentTournament 
            ? tournaments.find(t => t.id === currentTournament)?.name || `Tournament ${currentTournament}`
            : 'All Tournaments'}
          <svg
            className="-mr-1 h-5 w-5 text-purple-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-black border border-purple-500/30 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          tabIndex={-1}
        >
          <div className="py-1" role="none">
            <button
              onClick={() => handleSelect('')}
              className={`block w-full text-left px-4 py-2 text-sm ${
                currentTournament === '' ? 'bg-purple-500/20 text-white' : 'text-gray-300 hover:bg-purple-500/10 hover:text-white'
              }`}
              role="menuitem"
            >
              All Tournaments
            </button>
            {tournaments.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelect(t.id)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  currentTournament === t.id ? 'bg-purple-500/20 text-white' : 'text-gray-300 hover:bg-purple-500/10 hover:text-white'
                }`}
                role="menuitem"
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
