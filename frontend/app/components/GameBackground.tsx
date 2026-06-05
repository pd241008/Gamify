'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Map game names (as they appear in the API data) to background images
const GAME_BACKGROUNDS: Record<string, string> = {
  'Counter-Strike': '/bg_counter_strike.png',
  'CS2': '/bg_counter_strike.png',
  'CS:GO': '/bg_counter_strike.png',
  'Dota 2': '/bg_dota2.png',
  'Valorant': '/bg_valorant.png',
  'League of Legends': '/bg_league_of_legends.png',
  'LoL': '/bg_league_of_legends.png',
  'Rainbow 6 Siege': '/bg_rainbow6.png',
  'R6 Siege': '/bg_rainbow6.png',
};

const DEFAULT_BG = '/bg_gaming_hero.png';

export default function GameBackground() {
  const searchParams = useSearchParams();
  const currentGame = searchParams.get('game') || '';
  const [currentBg, setCurrentBg] = useState(DEFAULT_BG);
  const [nextBg, setNextBg] = useState('');
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const newBg = GAME_BACKGROUNDS[currentGame] || DEFAULT_BG;

    if (newBg !== currentBg) {
      setNextBg(newBg);
      setTransitioning(true);

      const timer = setTimeout(() => {
        setCurrentBg(newBg);
        setNextBg('');
        setTransitioning(false);
      }, 700); // Match the CSS transition duration

      return () => clearTimeout(timer);
    }
  }, [currentGame, currentBg]);

  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      {/* Current background */}
      <Image
        src={currentBg}
        alt=""
        fill
        className="object-cover opacity-20 transition-opacity duration-700"
        style={{ opacity: transitioning ? 0 : 0.2 }}
        priority
        sizes="100vw"
      />

      {/* Next background (crossfade in) */}
      {nextBg && (
        <Image
          src={nextBg}
          alt=""
          fill
          className="object-cover transition-opacity duration-700"
          style={{ opacity: transitioning ? 0.2 : 0 }}
          priority
          sizes="100vw"
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-black" />
    </div>
  );
}
