import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-auto border-t border-white/10 bg-black/60 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Top row: Brand + Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          {/* Brand */}
          <Link
            href="/"
            className="text-lg font-bold tracking-wider text-purple-400 hover:text-purple-300 transition-colors"
          >
            GAMIFY
          </Link>

          {/* Navigation Links — stacked on very small screens, inline on sm+ */}
          <nav className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-sm">
            <Link
              href="/privacy-policy"
              className="text-gray-400 hover:text-purple-300 transition-colors duration-200 py-1 px-2 -mx-2 rounded-md active:bg-white/5"
            >
              Privacy Policy
            </Link>
            <span className="hidden sm:inline text-white/20">|</span>
            <Link
              href="/terms-and-conditions"
              className="text-gray-400 hover:text-purple-300 transition-colors duration-200 py-1 px-2 -mx-2 rounded-md active:bg-white/5"
            >
              Terms &amp; Conditions
            </Link>
          </nav>
        </div>

        {/* Divider */}
        <div className="my-4 sm:my-6 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

        {/* Bottom row: Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-xs text-gray-500 text-center sm:text-left">
          <p>&copy; {currentYear} Gamify. All rights reserved.</p>
          <p className="text-gray-600">
            Real-time esports match tracking platform.
          </p>
        </div>
      </div>
    </footer>
  );
}
