import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, SignInButton, UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import Link from "next/link";
import Footer from "./components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gamify",
  description: "Real-time esports match tracking",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-black text-white">
          <nav className="fixed top-0 left-0 right-0 z-50 px-3 py-3 sm:px-4 sm:py-4 flex justify-between items-center bg-black/50 backdrop-blur-md border-b border-white/10">
            <Link href="/" className="text-lg sm:text-xl font-bold tracking-wider text-purple-400 hover:text-purple-300 transition-colors">
              GAMIFY
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              {userId ? (
                <>
                  <Link href="/settings" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors">
                    Settings
                  </Link>
                  <UserButton />
                </>
              ) : (
                <div className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-sm font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all">
                  <SignInButton mode="modal" />
                </div>
              )}
            </div>
          </nav>
          {children}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
