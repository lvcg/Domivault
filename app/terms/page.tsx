import Link from "next/link";

type TermsSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

const termsSections: TermsSection[] = [
  {
    title: "1. About DomiVault",
    paragraphs: [
      "DomiVault is a secure home management and records vault that helps homeowners organize, store, and manage home-related records, including expenses, appliances, warranties, maintenance tasks, vendors, vehicle service records, receipts, reminders, and important documents.",
      "DomiVault is intended to help users organize information. It does not provide legal, tax, insurance, construction, repair, financial, or professional advice.",
    ],
  },
  {
    title: "2. United States Availability",
    paragraphs: [
      "DomiVault is currently available only in the United States. You may not use the Services if you are located outside the United States or if applicable law prohibits your use of the Services.",
    ],
  },
  {
    title: "3. Eligibility",
    paragraphs: [
      "You must be at least 18 years old, or the age of majority in your jurisdiction, to use DomiVault. By using the Services, you represent and warrant that you meet this requirement and have the legal authority to agree to these Terms.",
    ],
  },
  {
    title: "4. Accounts and Security",
    paragraphs: [
      "You may need to create an account to access certain features. You agree to:",
      "You are responsible for all activity under your account.",
    ],
    bullets: [
      "provide accurate and current information;",
      "keep your login credentials secure;",
      "promptly update account information as needed;",
      "notify us of unauthorized access or suspected security issues.",
    ],
  },
  {
    title: "5. Subscriptions, Trials, Billing, and Refunds",
    paragraphs: [
      "Some features may require a paid subscription or paid access plan.",
      "DomiVault may offer a 7-day free trial for eligible subscriptions. If you cancel before the trial ends, you will not be charged. After a paid subscription begins, monthly payments are generally non-refundable, but you may cancel anytime to prevent future charges.",
      "Annual and lifetime purchases may be refunded within 14 days of the initial purchase if requested through support. Refunds may also be issued for duplicate charges, billing errors, unauthorized transactions, or verified technical issues that prevent use of the Services.",
      "For billing, cancellation, refund, or subscription questions, contact support@domivaultapp.com.",
      "Subscription terms shown at checkout, including price, billing interval, renewal terms, taxes, and cancellation options, control if they differ from summary language shown elsewhere in the Services.",
    ],
  },
  {
    title: "6. User Content and Uploaded Materials",
    paragraphs: [
      "You may upload, scan, enter, or store records, documents, images, receipts, warranties, vendor information, notes, maintenance records, and other materials (\"User Content\").",
      "You retain ownership of your User Content. By using the Services, you grant DomiVault a limited license to host, store, process, display, and transmit User Content solely as needed to operate, secure, support, and improve the Services.",
      "You represent that you have the right to upload and use your User Content. You agree not to upload:",
    ],
    bullets: [
      "unlawful, harmful, abusive, or infringing content;",
      "malware or malicious files;",
      "passwords, full payment card numbers, or highly sensitive credentials;",
      "content that violates another person's privacy or legal rights.",
    ],
  },
  {
    title: "7. Intellectual Property Rights",
    paragraphs: [
      "The Services, including software, design, interfaces, branding, logos, text, graphics, workflows, features, and other content created by DomiVault, are owned by DomiVault or its licensors and are protected by intellectual property laws.",
      "You may not copy, modify, distribute, sell, lease, reverse engineer, or create derivative works from any part of the Services except as expressly permitted by law or these Terms.",
    ],
  },
  {
    title: "8. Limited License",
    paragraphs: [
      "Subject to your compliance with these Terms, DomiVault grants you a limited, non-exclusive, non-transferable, revocable license to access and use the Services for personal household, property, vehicle, and record-management purposes.",
      "This license does not include any right to:",
    ],
    bullets: [
      "resell or commercially exploit the Services;",
      "scrape, harvest, or extract data;",
      "use automated systems to access the Services;",
      "interfere with the operation or security of the Services.",
    ],
  },
  {
    title: "9. Prohibited Activities",
    paragraphs: ["You agree not to:"],
    bullets: [
      "use the Services for unlawful purposes;",
      "bypass, disable, or interfere with security features;",
      "access another user's account or data;",
      "upload malware, harmful code, or deceptive content;",
      "scrape, crawl, harvest, index, or mine data from the Services;",
      "use bots, scripts, automation, or artificial traffic systems without authorization;",
      "reverse engineer or attempt to derive source code from the Services;",
      "overload, disrupt, or impair the Services;",
      "impersonate another person or entity;",
      "use the Services to violate intellectual property, privacy, or contractual rights;",
      "attempt to circumvent paid feature restrictions or subscription controls.",
    ],
  },
  {
    title: "10. Third-Party Services",
    paragraphs: [
      "DomiVault may rely on third-party providers for hosting, authentication, database storage, payment processing, subscription management, analytics, document storage, email, calendar integrations, or other functionality.",
      "Your use of third-party services may be subject to their own terms and privacy policies. DomiVault is not responsible for third-party services outside our control.",
    ],
  },
  {
    title: "11. Privacy",
    paragraphs: [
      "Your use of the Services is governed by our Privacy Policy, available at https://www.domivaultapp.com/privacy. The Privacy Policy explains how we collect, use, store, and protect information.",
    ],
  },
  {
    title: "12. Service Availability",
    paragraphs: [
      "We aim to keep DomiVault reliable, but we do not guarantee uninterrupted or error-free operation. The Services may be unavailable due to maintenance, updates, provider outages, internet issues, security events, or other factors.",
      "We may modify, suspend, or discontinue any part of the Services at any time.",
    ],
  },
  {
    title: "13. Term and Termination",
    paragraphs: [
      "These Terms remain in effect while you use the Services.",
      "We may suspend or terminate your access if we believe you have violated these Terms, created risk for DomiVault or other users, failed to pay applicable fees, or used the Services unlawfully.",
      "You may stop using the Services at any time. Termination does not automatically delete records that must be retained for legal, security, backup, billing, or operational purposes.",
    ],
  },
  {
    title: "14. Disclaimers",
    paragraphs: [
      "The Services are provided \"as is\" and \"as available.\"",
      "To the fullest extent permitted by law, DomiVault disclaims all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, title, non-infringement, availability, accuracy, and reliability.",
      "DomiVault does not guarantee that:",
      "You are responsible for verifying important information and maintaining independent backups of critical records.",
    ],
    bullets: [
      "records, OCR results, reminders, exports, or calculations will be error-free;",
      "uploaded documents will be legally sufficient for insurance, tax, warranty, resale, or repair purposes;",
      "reminders will always be delivered or received;",
      "the Services will meet your specific needs.",
    ],
  },
  {
    title: "15. Limitation of Liability",
    paragraphs: [
      "To the fullest extent permitted by law, DomiVault will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, including lost profits, lost data, loss of goodwill, service interruption, or security-related losses.",
      "To the fullest extent permitted by law, DomiVault's total liability for any claim relating to the Services will not exceed the amount you paid to DomiVault for the Services during the three months before the event giving rise to the claim, or $100, whichever is greater.",
    ],
  },
  {
    title: "16. Indemnification",
    paragraphs: [
      "You agree to defend, indemnify, and hold harmless DomiVault, its owners, employees, contractors, service providers, and affiliates from and against claims, damages, losses, liabilities, costs, and expenses, including reasonable attorneys' fees, arising from:",
    ],
    bullets: [
      "your use of the Services;",
      "your User Content;",
      "your violation of these Terms;",
      "your violation of law;",
      "your infringement or misuse of another party's rights.",
    ],
  },
  {
    title: "17. Informal Dispute Resolution",
    paragraphs: [
      "Before filing a formal claim, you and DomiVault agree to first attempt to resolve the dispute informally.",
      "The party raising the dispute must send written notice describing the issue and requested resolution. The parties will then attempt in good faith to resolve the dispute for 30 days.",
      "Notices to DomiVault should be sent to support@domivaultapp.com.",
    ],
  },
  {
    title: "18. Arbitration Agreement",
    paragraphs: [
      "If a dispute cannot be resolved through informal negotiation, any claim arising out of or relating to these Terms or the Services will be resolved by binding arbitration, except where prohibited by law.",
      "The arbitration will be conducted by one arbitrator. The arbitration will take place in Illinois, unless the parties agree to remote proceedings or another location.",
      "The arbitration will be conducted on an individual basis. You and DomiVault waive the right to participate in a class action, class arbitration, collective action, or representative action to the fullest extent permitted by law.",
      "Either party may bring qualifying claims in small claims court. Either party may also seek injunctive or equitable relief for misuse, security issues, unauthorized access, or intellectual property violations.",
    ],
  },
  {
    title: "19. Governing Law and Jurisdiction",
    paragraphs: [
      "These Terms are governed by the laws of the State of Illinois, United States, without regard to conflict-of-law principles.",
      "For any claim not subject to arbitration, you agree to the exclusive jurisdiction and venue of the state or federal courts located in Illinois.",
    ],
  },
  {
    title: "20. Changes to These Terms",
    paragraphs: [
      "We may update these Terms from time to time. If we make material changes, we may provide notice through the Services, by email, or by posting an updated version.",
      "Your continued use of the Services after updated Terms become effective means you accept the revised Terms.",
    ],
  },
  {
    title: "21. Contact Information",
    paragraphs: [
      "If you have questions about these Terms, contact DomiVault at:",
      "DomiVault, Chicago, Illinois, United States",
      "support@domivaultapp.com",
      "https://www.domivaultapp.com",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <nav className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/70 bg-white/80 p-4 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
          <Link href="/" className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">DomiVault</Link>
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Link href="/login" className="hover:text-slate-950 dark:hover:text-white">Login</Link>
            <Link href="/privacy" className="hover:text-slate-950 dark:hover:text-white">Privacy</Link>
          </div>
        </nav>

        <section className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.05] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">Terms of use</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">Terms for using DomiVault.</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400">
            These Terms govern your access to and use of DomiVault, available at domivaultapp.com and through any related web or mobile applications, features, tools, or services we provide.
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400">
            These Terms are entered into by and between you and DomiVault. By accessing or using the Services, you agree to be bound by these Terms. If you do not agree, you must not access or use the Services.
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Effective date: July 17, 2026</p>
        </section>

        <section className="grid gap-4">
          {termsSections.map((section) => (
            <article key={section.title} className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{section.title}</h2>
              <div className="mt-2 space-y-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets && (
                  <ul className="list-disc space-y-2 pl-5">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
