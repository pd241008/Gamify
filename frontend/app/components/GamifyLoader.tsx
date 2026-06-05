'use client';

import { useEffect, useState } from 'react';

export default function GamifyLoader() {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Animate progress bar
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressTimer);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Animate dots
    const dotTimer = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);

    return () => {
      clearInterval(progressTimer);
      clearInterval(dotTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(6,182,212,0.2) 40%, transparent 70%)',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated ring */}
        <div className="relative mb-8">
          <div className="w-20 h-20 rounded-full border-2 border-white/5 flex items-center justify-center">
            {/* Spinning arc */}
            <svg
              className="absolute inset-0 w-20 h-20"
              viewBox="0 0 80 80"
              style={{ animation: 'spin 1.2s linear infinite' }}
            >
              <circle
                cx="40"
                cy="40"
                r="38"
                fill="none"
                stroke="url(#loaderGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="80 160"
              />
              <defs>
                <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center icon — gamepad */}
            <svg
              className="w-8 h-8 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ animation: 'pulse 2s ease-in-out infinite' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z"
              />
            </svg>
          </div>
        </div>

        {/* Brand text */}
        <h2
          className="text-2xl font-extrabold tracking-[0.3em] uppercase mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-400"
        >
          GAMIFY
        </h2>
        <p className="text-gray-500 text-sm tracking-wide mb-8">
          Loading{dots}
        </p>

        {/* Progress bar */}
        <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-fuchsia-500 transition-all duration-300 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
