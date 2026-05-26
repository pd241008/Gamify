import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* 
        TODO: Phase 4 - Full-Stack Polish (Frontend UI)
        - Build out a premium, highly responsive UI.
        - Connect to backend (Cassandra/API) to fetch and display upcoming matches.
        - Create and use custom components: <MatchCard />, <BracketView />, etc.
        - Apply premium styling, dark mode, and micro-animations.
      */}
      <main className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Esports Tracker Dashboard
        </h1>
        
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <p className="text-lg">
            This is the base UI. The implementation steps are outlined below.
          </p>
          
          <div className="mt-8 border border-gray-300 rounded-lg p-6 w-full max-w-2xl bg-white dark:bg-black dark:border-gray-800">
            <h2 className="text-2xl font-semibold mb-4 text-left">Implementation TODOs:</h2>
            <ul className="list-disc text-left space-y-2 pl-6">
              <li>TODO: Fetch match data from Cassandra/Backend API</li>
              <li>TODO: Render list of upcoming matches using custom components</li>
              <li>TODO: Add real-time updates or state management</li>
              <li>TODO: Add Discord/Telegram notification settings (if applicable)</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
