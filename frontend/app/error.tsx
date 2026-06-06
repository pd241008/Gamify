'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 flex flex-col">
      <div className="fixed inset-0 z-0">
        <Image
          src="/esports_hero_bg_1780292991411.png"
          alt="Abstract Esports Background"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-black" />
      </div>



      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl bg-black/40 border border-purple-500/20 backdrop-blur-md p-5 sm:p-8 text-center shadow-lg shadow-purple-500/10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-6 border border-red-500/20">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-white">
            Connection Lost
          </h2>

          <p className="text-gray-400 mb-8">
            {error.message || "We couldn't connect to the backend services. The pipeline may not be running."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold tracking-wide transition-all border border-white/10"
            >
              Go Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
