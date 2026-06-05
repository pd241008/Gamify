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
  const [notifMethod, setNotifMethod] = useState<'bot' | 'webhook'>('bot');

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
          <h2 className="text-2xl font-bold mb-4 text-cyan-400">Discord Notifications</h2>
          <p className="text-gray-400 mb-6">Get live match alerts sent directly to your Discord. Choose the method that works best for you.</p>

          {/* Method tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setNotifMethod('bot')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 ${
                notifMethod === 'bot'
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              🤖 Discord Bot (Easy)
            </button>
            <button
              onClick={() => setNotifMethod('webhook')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 ${
                notifMethod === 'webhook'
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              🔗 Custom Webhook (Advanced)
            </button>
          </div>

          {/* Bot method */}
          {notifMethod === 'bot' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#5865F2] flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">Gamify Notifications Bot</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Invite our bot to your Discord server with one click. It will automatically send match alerts to a channel of your choice — no setup required.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href="https://discord.com/oauth2/authorize?client_id=YOUR_BOT_CLIENT_ID&permissions=2048&scope=bot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-sm transition-all shadow-[0_0_15px_rgba(88,101,242,0.3)] hover:shadow-[0_0_25px_rgba(88,101,242,0.5)]"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Invite Bot to Server
                      </a>
                      <span className="text-xs text-gray-500">Requires &quot;Manage Server&quot; permission</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How it works
                </h4>
                <ol className="space-y-2 text-sm text-gray-400">
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">1</span>
                    <span>Click &quot;Invite Bot to Server&quot; and select your Discord server</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">2</span>
                    <span>The bot joins and creates a <code className="text-cyan-300 bg-cyan-500/10 px-1 rounded">#gamify-alerts</code> channel</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">3</span>
                    <span>Use <code className="text-cyan-300 bg-cyan-500/10 px-1 rounded">/gamify follow</code> to pick your games — done!</span>
                  </li>
                </ol>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <span className="text-lg">⚡</span>
                  Bot Slash Commands
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <code className="text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded text-xs font-mono">/gamify follow</code>
                    <span className="text-gray-500">Select games to track</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <code className="text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded text-xs font-mono">/gamify live</code>
                    <span className="text-gray-500">Show live matches</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <code className="text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded text-xs font-mono">/gamify upcoming</code>
                    <span className="text-gray-500">Next scheduled matches</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <code className="text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded text-xs font-mono">/gamify remind</code>
                    <span className="text-gray-500">Set match reminders</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Webhook method */}
          {notifMethod === 'webhook' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="webhook-url" className="block text-sm font-medium text-gray-300 mb-2">Discord Webhook URL</label>
                <input
                  id="webhook-url"
                  type="text"
                  value={webhook}
                  onChange={(e) => setWebhook(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>

              {/* Expandable setup guide */}
              <details className="group rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                <summary className="cursor-pointer px-4 py-3 flex items-center justify-between text-sm font-semibold text-gray-300 hover:text-white transition-colors">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    How to create a Discord Webhook (step-by-step)
                  </span>
                  <svg className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 pt-1 border-t border-white/5">
                  <ol className="space-y-3 text-sm text-gray-400">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold flex items-center justify-center mt-0.5">1</span>
                      <span>Open your Discord server and go to <strong className="text-white">Server Settings</strong> → <strong className="text-white">Integrations</strong></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold flex items-center justify-center mt-0.5">2</span>
                      <span>Click <strong className="text-white">Webhooks</strong> → <strong className="text-white">New Webhook</strong></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold flex items-center justify-center mt-0.5">3</span>
                      <span>Name it something like <code className="text-cyan-300 bg-cyan-500/10 px-1 rounded">Gamify Alerts</code> and pick the channel where you want notifications</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold flex items-center justify-center mt-0.5">4</span>
                      <span>Click <strong className="text-white">Copy Webhook URL</strong> and paste it above</span>
                    </li>
                  </ol>
                  <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs flex items-start gap-2">
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Keep your webhook URL private. Anyone with the URL can send messages to your channel. If compromised, delete and recreate the webhook.</span>
                  </div>
                </div>
              </details>

              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-gray-500 text-xs flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Prefer a simpler setup? Switch to the <button onClick={() => setNotifMethod('bot')} className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 transition-colors">Discord Bot</button> method — no webhook needed.</span>
              </div>
            </div>
          )}
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
