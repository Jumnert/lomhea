import Link from "next/link";

const sections = [
  {
    title: "Using Lomhea",
    body: "Lomhea provides map discovery, saved places, reviews, and community-contributed travel information related to Cambodia. You agree to use the service lawfully and not misuse the platform, interfere with its operation, or attempt unauthorized access.",
  },
  {
    title: "Accounts",
    body: "You are responsible for the accuracy of the information you provide when creating an account and for maintaining the security of your login credentials. You are also responsible for activity that occurs under your account.",
  },
  {
    title: "Community Content",
    body: "If you submit reviews, photos, suggestions, or other content, you confirm that you have the right to share it and that it does not violate the rights of others. Lomhea may moderate, remove, or refuse content that is misleading, abusive, unlawful, or harmful to the community.",
  },
  {
    title: "Availability",
    body: "We may update, improve, suspend, or discontinue parts of the service at any time. We try to keep the platform available and accurate, but we do not guarantee uninterrupted access or that all content will always be complete or error-free.",
  },
  {
    title: "Liability",
    body: "Lomhea is provided on an as-is basis. To the fullest extent permitted by law, Lomhea is not liable for indirect, incidental, or consequential damages arising from your use of the platform, travel decisions, or reliance on community-submitted information.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f3f0e8] px-4 py-10 text-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="inline-flex rounded-full border border-zinc-300 bg-white/80 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:text-zinc-900"
        >
          Back to Lomhea
        </Link>

        <div className="mt-6 rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur-sm md:p-12">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">
            Terms of Service
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tighter md:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600 md:text-base">
            These terms govern your use of Lomhea and explain the basic rules
            for accessing the platform, creating an account, and contributing
            content.
          </p>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-2xl font-black tracking-tighter text-zinc-950">
                  {section.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-zinc-600 md:text-base">
                  {section.body}
                </p>
              </section>
            ))}
          </div>

          <div className="mt-10 rounded-[24px] border border-zinc-200 bg-zinc-50 p-5 text-sm leading-7 text-zinc-600">
            By using Lomhea, you agree to these terms. If you do not agree,
            please do not use the service.
          </div>
        </div>
      </div>
    </main>
  );
}
