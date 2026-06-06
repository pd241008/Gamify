import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Gamify",
  description:
    "Read the terms and conditions governing the use of Gamify, the real-time esports match tracking platform.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-20 sm:pt-24 pb-12 sm:pb-16">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-purple-950/20 via-black to-black" />

      <main className="relative z-10 container mx-auto px-4 sm:px-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors mb-4 sm:mb-6 py-2 -my-2 active:text-purple-200"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-400 mb-3 sm:mb-4">
            Terms &amp; Conditions
          </h1>
          <p className="text-gray-400 text-sm">
            Last updated: June 6, 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 sm:space-y-10 text-gray-300 leading-relaxed text-sm sm:text-base">
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
              <span className="inline-block w-1 h-6 bg-purple-500 rounded-full" />
              Acceptance of Terms
            </h2>
            <p>
              By accessing or using the Gamify platform (&quot;Service&quot;), you agree
              to be bound by these Terms and Conditions (&quot;Terms&quot;). If you do not
              agree with any part of these Terms, you must not access or use our
              Service. These Terms apply to all visitors, users, and others who
              access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="inline-block w-1 h-6 bg-purple-500 rounded-full" />
              Description of Service
            </h2>
            <p>
              Gamify is a real-time esports match tracking platform that
              provides users with live match data, tournament information,
              notifications, and analytics for competitive gaming events. The
              Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="inline-block w-1 h-6 bg-purple-500 rounded-full" />
              User Accounts
            </h2>
            <div className="space-y-4">
              <p>
                When you create an account with us, you must provide accurate,
                complete, and current information. Failure to do so constitutes a
                breach of these Terms.
              </p>
              <ul className="space-y-3 list-none">
                {[
                  "You are responsible for safeguarding your account credentials",
                  "You must notify us immediately of any unauthorized use of your account",
                  "You may not use another person's account without permission",
                  "You must be at least 13 years of age to create an account",
                  "We reserve the right to suspend or terminate accounts that violate these Terms",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-purple-500/60 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="inline-block w-1 h-6 bg-purple-500 rounded-full" />
              Acceptable Use
            </h2>
            <p className="mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="space-y-3 list-none">
              {[
                "Violate any applicable laws, regulations, or third-party rights",
                "Transmit harmful, threatening, abusive, or objectionable content",
                "Attempt to gain unauthorized access to any part of the Service",
                "Interfere with or disrupt the Service or its underlying infrastructure",
                "Use automated systems (bots, scrapers) to access the Service without permission",
                "Impersonate any person or entity, or misrepresent your affiliation",
                "Collect or harvest user data without consent",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-purple-500/60 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="inline-block w-1 h-6 bg-purple-500 rounded-full" />
              Intellectual Property
            </h2>
            <p>
              The Service and its original content, features, and functionality
              are and will remain the exclusive property of Gamify. The Service
              is protected by copyright, trademark, and other laws. Our
              trademarks and trade dress may not be used in connection with any
              product or service without prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="inline-block w-1 h-6 bg-purple-500 rounded-full" />
              Third-Party Services
            </h2>
            <p>
              Our Service may contain links to or integrations with third-party
              websites, services, or content that are not owned or controlled by
              Gamify. We assume no responsibility for the content, privacy
              policies, or practices of any third-party services. You
              acknowledge and agree that Gamify shall not be liable for any
              damage or loss arising from your use of third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="inline-block w-1 h-6 bg-purple-500 rounded-full" />
              Match Data &amp; Content
            </h2>
            <p>
              Match data, scores, and related esports content displayed on
              Gamify are sourced from publicly available information and
              third-party APIs. While we strive for accuracy, we do not
              guarantee that all match data is complete, current, or error-free.
              The Service should not be relied upon as the sole source for
              competitive gaming results.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="inline-block w-1 h-6 bg-purple-500 rounded-full" />
              Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, Gamify and its directors,
              employees, partners, agents, and affiliates shall not be liable
              for any indirect, incidental, special, consequential, or punitive
              damages, including but not limited to loss of profits, data, or
              goodwill, arising from your use of or inability to use the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="inline-block w-1 h-6 bg-purple-500 rounded-full" />
              Disclaimer of Warranties
            </h2>
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without
              warranties of any kind, whether express or implied, including but
              not limited to implied warranties of merchantability, fitness for
              a particular purpose, and non-infringement. We do not warrant that
              the Service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="inline-block w-1 h-6 bg-purple-500 rounded-full" />
              Termination
            </h2>
            <p>
              We may terminate or suspend your account and access to the Service
              immediately, without prior notice or liability, for any reason,
              including breach of these Terms. Upon termination, your right to
              use the Service will immediately cease. Provisions that by their
              nature should survive termination shall survive.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="inline-block w-1 h-6 bg-purple-500 rounded-full" />
              Governing Law
            </h2>
            <p>
              These Terms shall be governed and construed in accordance with
              applicable laws, without regard to conflict of law provisions.
              Our failure to enforce any right or provision of these Terms will
              not be considered a waiver of those rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="inline-block w-1 h-6 bg-purple-500 rounded-full" />
              Changes to Terms
            </h2>
            <p>
              We reserve the right to modify or replace these Terms at any time.
              If a revision is material, we will provide reasonable notice prior
              to the new terms taking effect. By continuing to access or use
              the Service after revisions become effective, you agree to be
              bound by the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="inline-block w-1 h-6 bg-purple-500 rounded-full" />
              Contact Us
            </h2>
            <p>
              If you have any questions about these Terms, please contact us at{" "}
              <a
                href="mailto:legal@gamify.gg"
                className="text-purple-400 hover:text-purple-300 underline underline-offset-4 transition-colors"
              >
                legal@gamify.gg
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
