'use client';

import { useRouter, useSearchParams } from "next/navigation";

interface GameTabsProps {
  games: string[];
}

export default function GameTabs({ games }: GameTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentGame = searchParams.get("game") || "";

  const handleSelect = (game: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (game) {
      params.set("game", game);
    } else {
      params.delete("game");
    }
    // Maintain tournament filter if it exists
    router.push(`/matches?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
      <button
        onClick={() => handleSelect("")}
        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 ${
          currentGame === ""
            ? "bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
        }`}
      >
        All Games
      </button>
      
      {games.map((game) => (
        <button
          key={game}
          onClick={() => handleSelect(game)}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 ${
            currentGame === game
              ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          {game}
        </button>
      ))}
    </div>
  );
}
