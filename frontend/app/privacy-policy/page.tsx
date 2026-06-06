import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Gamify",
  description:
    "Learn how Gamify collects, uses, and protects your personal information on our real-time esports match tracking platform.",
};

export default function PrivacyPolicyPage() {
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
            Privacy Policy
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
              Introduction
            </h2>
            <p>
              Welcome to Gamify (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to
              protecting your privacy and ensuring the security of your personal
              information. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our real-time
              esports match tracking platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="inline-block w-1 h-6 bg-purple-500 rounded-full" />
              Information We Collect
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-purple-300 mb-2">
                  Personal Information
                </h3>
                <p>
                  When you create an account or use our services, we may collect
                  information such as your name, email address, profile picture,
                  and authentication credentials provided through third-party
                  services like Clerk.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-300 mb-2">
                  Usage Data
                </h3>
                <p>
                  We automatically collect information about how you interact
                  with our platform, including pages visited, matches followed,
                  tournament preferences, notification settings, and
                  device/browser information.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-300 mb-2">
                  Cookies &amp; Tracking Technologies
                </h3>
                <p>
                  We use cookies and similar technologies to maintain your
                  session, remember your preferences, and improve your
                  experience. You can manage cookie preferences through your
                  browser settings.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="inline-block w-1 h-6 bg-purple-500 rounded-full" />
              How We Use Your Information
            </h2>
            <ul className="space-y-3 list-none">
              {[
                "Provide and maintain our esports match tracking services",
                "Personalize your experience with match recommendations and notifications",
                "Process your match follow preferences and alert settings",
                "Communicate with you about service updates and new features",
                "Analyze usage patterns to improve platform performance and features",
                "Detect and prevent fraudulent or unauthorized activity",
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
              Data Sharing &amp; Third Parties
            </h2>
            <p className="mb-4">
              We do not sell your personal information. We may share data with:
            </p>
            <ul className="space-y-3 list-none">
              {[
                "Authentication providers (e.g., Clerk) for secure sign-in",
                "Cloud infrastructure providers for hosting and data storage",
                "Analytics services to improve platform performance",
                "Law enforcement when required by applicable law",
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
              Data Security
            </h2>
            <p>
              We implement industry-standard security measures to protect your
              data, including encryption in transit (TLS) and at rest, secure
              authentication through Clerk, and regular security audits.
              However, no method of transmission over the Internet is 100%
              secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="inline-block w-1 h-6 bg-purple-500 rounded-full" />
              Data Retention
            </h2>
            <p>
              We retain your personal data only as long as necessary to provide
              our services or as required by law. You may request deletion of
              your account and associated data at any time through your account
              settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="inline-block w-1 h-6 bg-purple-500 rounded-full" />
              Your Rights
            </h2>
            <p className="mb-4">
              Depending on your jurisdiction, you may have the following rights:
            </p>
            <ul className="space-y-3 list-none">
              {[
                "Access and receive a copy of your personal data",
                "Rectify inaccurate or incomplete information",
                "Request deletion of your personal data",
                "Object to or restrict the processing of your data",
                "Data portability — receive your data in a structured format",
                "Withdraw consent at any time where processing is consent-based",
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
              Children&apos;s Privacy
            </h2>
            <p>
              Our platform is not intended for users under the age of 13. We do
              not knowingly collect personal information from children. If we
              become aware that we have collected data from a child under 13, we
              will take steps to delete such information promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="inline-block w-1 h-6 bg-purple-500 rounded-full" />
              Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of material changes by posting the updated policy on
              this page and updating the &quot;Last updated&quot; date. We encourage you
              to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="inline-block w-1 h-6 bg-purple-500 rounded-full" />
              Contact Us
            </h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or
              our data practices, please contact us at{" "}
              <a
                href="mailto:privacy@gamify.gg"
                className="text-purple-400 hover:text-purple-300 underline underline-offset-4 transition-colors"
              >
                privacy@gamify.gg
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
