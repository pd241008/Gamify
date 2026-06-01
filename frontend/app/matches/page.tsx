import Image from "next/image";
import Link from "next/link";
import MatchList from "../components/MatchList";
import { Match } from "../components/MatchCard";

// MatchesPage is now an async Server Component that fetches from the Go Backend API!
export default async function MatchesPage() {
  let matches: Match[] = [];
  let apiError = false;

  try {
    const res = await fetch("http://localhost:8080/api/matches", {
      cache: "no-store", // Always fetch the latest data from the backend
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch matches: ${res.status}`);
    }

    matches = await res.json();
  } catch (error) {
    console.error("Failed to fetch matches from Go API:", error);
    apiError = true;
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
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

      <nav className="relative z-20 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-wider text-purple-400 hover:text-purple-300 transition-colors">
            GAMIFY
          </Link>
          <div className="text-sm flex items-center gap-2 font-medium">
            {apiError ? (
              <>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-400">Backend Disconnected</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-400">Live (Astra DB)</span>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10 container mx-auto px-6 py-12">
        <header className="flex flex-col py-10">
          <div className="inline-block self-start mb-4 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm font-semibold tracking-wider">
            LIVE & UPCOMING
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Match Dashboard
          </h1>
          {apiError && (
            <p className="text-red-400 mb-8 max-w-2xl">
              Unable to connect to the Go backend API at localhost:8080. Please ensure the pipeline is running (`make run-local`).
            </p>
          )}
        </header>

        {!apiError && (
          <section className="mb-20">
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                Scheduled Events ({matches.length})
              </h2>
            </div>
            <MatchList matches={matches} />
          </section>
        )}
      </main>
    </div>
  );
}
