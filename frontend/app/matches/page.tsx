import MatchList from "../components/MatchList";
import { Match } from "../components/MatchCard";
import TournamentFilter from "../components/TournamentFilter";
import GameTabs from "../components/GameTabs";
import GameBackground from "../components/GameBackground";
import GameFollowBanner from "../components/GameFollowBanner";
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from "next/navigation";

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const tournament = typeof resolvedSearchParams.tournament === 'string' ? resolvedSearchParams.tournament : '';
  const game = typeof resolvedSearchParams.game === 'string' ? resolvedSearchParams.game : '';

  const user = await currentUser();
  if (!user) {
    redirect("/"); // Or sign-in
  }

  // Get user's followed games from Clerk metadata
  const userMetadata = user.publicMetadata as { games?: string[] };
  const followedGames = userMetadata.games || [];

  let matches: Match[] = [];
  let tournaments: { id: string, name: string }[] = [];

  try {
    const params = new URLSearchParams();
    if (tournament) {
      params.set('tournament', tournament);
    }

    // Determine API Base URL
    const baseUrl = process.env.API_BASE_URL;
    if (!baseUrl) {
      throw new Error("API_BASE_URL is not configured");
    }

    // Fetch matches
    const res = await fetch(`${baseUrl}/api/matches?${params.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch matches: ${res.status}`);
    }

    matches = await res.json();

    // Fetch tournaments for the filter
    const tRes = await fetch(`${baseUrl}/api/tournaments`, {
      cache: "no-store",
    });

    if (tRes.ok) {
      tournaments = await tRes.json();
    }
  } catch (error) {
    console.error("Failed to fetch matches from Go API:", error);
    throw error; // This will trigger the custom error.tsx boundary
  }

  // Extract unique games from the fetched matches
  const uniqueGames = Array.from(new Set(matches.map(m => m.videogame).filter(Boolean)));

  // Filter matches based on user's followed games
  let filteredMatches = matches;
  if (followedGames.length > 0) {
    filteredMatches = filteredMatches.filter(m => followedGames.includes(m.videogame));
  }

  // Further filter matches based on selected game category from URL
  filteredMatches = game
    ? filteredMatches.filter(m => m.videogame === game)
    : filteredMatches;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      <GameBackground />

      <main className="relative z-10 container mx-auto px-6 py-24">
        <header className="flex flex-col py-10">
          <div className="inline-block self-start mb-4 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm font-semibold tracking-wider">
            LIVE & UPCOMING
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Match Dashboard
          </h1>
        </header>

        {/* Show banner if user hasn't selected any games to follow */}
        {followedGames.length === 0 && <GameFollowBanner />}

        <section className="mb-20">
          <GameTabs games={uniqueGames} />
          <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              Scheduled Events ({filteredMatches.length})
            </h2>
            <TournamentFilter tournaments={tournaments || []} />
          </div>
          <MatchList matches={filteredMatches} />
        </section>
      </main>
    </div>
  );
}
