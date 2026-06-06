import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 flex flex-col items-center justify-center">
      <div className="fixed inset-0 z-0">
        <Image
          src="/bg_gaming_hero.webp"
          alt="Epic Gaming Arena Background"
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      <main className="relative z-10 container mx-auto px-4 sm:px-6 py-12 flex flex-col items-center text-center">
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-extrabold tracking-tight mb-6 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-400">
          Gamify Pipeline
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-8 sm:mb-12">
          The ultimate zero-maintenance, serverless pipeline for real-time esports match tracking. Never miss a critical moment again.
        </p>
        
        <Link 
          href="/matches" 
          className="group relative inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 font-bold text-white transition-all duration-300 bg-purple-600 rounded-full hover:bg-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
        >
          <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black" />
          <span className="relative flex items-center gap-2">
            Enter Dashboard
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </span>
        </Link>
      </main>
    </div>
  );
}
