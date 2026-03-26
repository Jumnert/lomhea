import Link from "next/link";

const sections = [
  {
    title: "Information We Collect",
    body: "We may collect information you provide directly, such as your name, email address, profile details, and content you submit to the platform. We may also collect technical information needed to operate the service, such as session and device-related data.",
  },
  {
    title: "How We Use Information",
    body: "We use your information to create and manage your account, authenticate sign-ins, provide core platform features, improve the service, communicate with you, and maintain platform safety and moderation.",
  },
  {
    title: "Sharing",
    body: "We do not sell your personal information. We may share limited information with service providers or infrastructure partners that help us operate Lomhea, and when required by law or to protect the platform and its users.",
  },
  {
    title: "Your Content and Visibility",
    body: "Some content you submit, such as reviews, place suggestions, and public profile information, may be visible to other users depending on how the product is designed. Sensitive account data is not intended to be publicly exposed.",
  },
  {
    title: "Contact",
    body: "If you have questions about this policy or want to request changes related to your account data, you can contact the Lomhea team through the channels provided on the platform.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#eef2f7] px-4 py-10 text-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="inline-flex rounded-full border border-zinc-300 bg-white/80 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:text-zinc-900"
        >
          Back to Lomhea
        </Link>

        <div className="mt-6 rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur-sm md:p-12">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">
            Privacy Policy
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tighter md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600 md:text-base">
            This policy explains what information Lomhea may collect, how it is
            used, and the general principles we follow to handle account and
            platform data responsibly.
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
            Continued use of Lomhea means you understand that information may be
            processed as described here to operate the service.
          </div>
        </div>
      </div>
    </main>
  );
}
