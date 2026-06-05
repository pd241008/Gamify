'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { updateUserPreferences } from './actions';
import { useRouter } from 'next/navigation';

const AVAILABLE_GAMES = [
  "Dota 2",
  "CS2",
  "CS:GO",
  "League of Legends",
  "Valorant",
  "Overwatch",
  "Rocket League"
];

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  const [games, setGames] = useState<string[]>([]);
  const [webhook, setWebhook] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (isLoaded && user) {
      const publicMetadata = user.publicMetadata as { games?: string[], discordWebhook?: string };
      if (publicMetadata.games) {
        setGames(publicMetadata.games);
      }
      if (publicMetadata.discordWebhook) {
        setWebhook(publicMetadata.discordWebhook);
      }
    }
  }, [isLoaded, user]);

  if (!isLoaded) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  }

  if (!user) {
    router.push('/');
    return null;
  }

  const toggleGame = (game: string) => {
    if (games.includes(game)) {
      setGames(games.filter(g => g !== game));
    } else {
      setGames([...games, game]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      await updateUserPreferences(games, webhook);
      setSaveMessage('Preferences saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setSaveMessage('Failed to save preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
          Account Settings
        </h1>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-6 text-purple-400">Followed Games</h2>
          <p className="text-gray-400 mb-6">Select the games you want to see on your dashboard and receive notifications for.</p>
          
          <div className="flex flex-wrap gap-3">
            {AVAILABLE_GAMES.map(game => (
              <button
                key={game}
                onClick={() => toggleGame(game)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 ${
                  games.includes(game)
                    ? "bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                    : "bg-black text-gray-400 border border-white/20 hover:border-purple-500/50 hover:text-white"
                }`}
              >
                {game}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-6 text-cyan-400">Discord Notifications</h2>
          <p className="text-gray-400 mb-6">Enter your personal Discord Webhook URL to receive live match notifications directly to your server.</p>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Discord Webhook URL</label>
            <input
              type="text"
              value={webhook}
              onChange={(e) => setWebhook(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-lg font-bold shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
          
          {saveMessage && (
            <span className={`text-sm font-medium ${saveMessage.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>
              {saveMessage}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
