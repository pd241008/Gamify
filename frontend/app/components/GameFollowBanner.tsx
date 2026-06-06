'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const DISMISS_KEY = 'gamify_follow_banner_dismissed';

export default function GameFollowBanner() {
  const [dismissed, setDismissed] = useState(true); // Start hidden to avoid flash

  useEffect(() => {
    const wasDismissed = localStorage.getItem(DISMISS_KEY);
    if (!wasDismissed) {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, 'true');
  };

  if (dismissed) return null;

  return (
    <div className="mb-8 relative overflow-hidden rounded-xl border border-purple-500/20 bg-gradient-to-r from-purple-500/10 via-cyan-500/5 to-fuchsia-500/10 p-4 backdrop-blur-sm">
      {/* Animated glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-cyan-500/5 animate-pulse" />

      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl" role="img" aria-label="gamepad">🎮</span>
          <div>
            <p className="text-white font-semibold text-sm">
              {"You're seeing all games"}
            </p>
            <p className="text-gray-400 text-xs mt-0.5">
              Customize your feed by selecting the games you follow
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 ml-9 sm:ml-0">
          <Link
            href="/settings"
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]"
          >
            Go to Settings
          </Link>
          <button
            onClick={handleDismiss}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            aria-label="Dismiss banner"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
