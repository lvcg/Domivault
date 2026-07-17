import Link from "next/link";

type PrivacySection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

const privacySections: PrivacySection[] = [
  {
    title: "1. Age Restriction",
    paragraphs: [
      "DomiVault is intended only for users who are 18 years of age or older.",
      "We do not knowingly collect personal information from minors. If we learn that we have collected personal information from a person under 18, we will take reasonable steps to delete that information.",
    ],
  },
  {
    title: "2. Information We Collect",
    paragraphs: [
      "We collect information you provide directly, information generated through your use of the Services, and limited technical information needed to operate and secure the app.",
      "Account information may include your name or username, email address, login and authentication details, subscription status, account settings, and preferences.",
      "Home and property records may include maintenance tasks, appliance records, warranty details, service dates, repair history, contractor or vendor information, utility and household expenses, project budgets, vehicle service records, notes, reminders, and task history.",
      "If you use document storage or scanning features, we may collect uploaded receipts, warranty documents, document photos, scanned images, file names, file metadata, OCR-extracted text, dates, vendors, amounts, serial numbers, and related notes you choose to save.",
      "We may collect technical and usage data such as pages or screens viewed, app feature usage, device type, browser type, operating system, approximate location derived from IP address, crash logs, performance diagnostics, error logs, and session activity.",
    ],
  },
  {
    title: "3. Information We Do Not Intentionally Collect",
    paragraphs: [
      "DomiVault does not intentionally collect or process sensitive personal information such as biometric data, racial or ethnic origin, sexual orientation, religious beliefs, precise health data, or full payment card numbers.",
      "You should avoid uploading documents that contain passwords, full credit card numbers, Social Security numbers, or other highly sensitive information unless absolutely necessary.",
    ],
  },
  {
    title: "4. Device Permissions",
    paragraphs: [
      "The DomiVault mobile app may request permission to access certain device features. We only request these permissions when needed to provide app functionality, and you may manage permissions through your device settings.",
    ],
    bullets: [
      "Calendar and Reminders: used to schedule maintenance tasks, create home upkeep reminders, sync recurring service dates, and track deadlines such as warranty expirations.",
      "Camera and Photo Library: used to scan receipts, upload warranty documents, capture appliance labels, store repair photos, and add document images to your vault.",
      "Contacts: used to manage or import home service vendors, contractors, emergency contacts, or repair professionals. DomiVault does not use your contacts for advertising.",
      "Storage: used to save, retrieve, upload, or display files and records you choose to manage through the app.",
      "Push Notifications: used for account alerts, maintenance reminders, task deadlines, warranty expiration reminders, subscription or service updates, and security or product notices.",
    ],
  },
  {
    title: "5. How We Use Your Information",
    paragraphs: ["We use your information to:"],
    bullets: [
      "create and manage your account;",
      "authenticate your login;",
      "store and display your home records;",
      "save uploaded documents and scans;",
      "extract text from receipts or warranty documents;",
      "organize maintenance, appliance, vendor, vehicle, and expense data;",
      "send reminders and notifications;",
      "process subscription status;",
      "provide customer support;",
      "improve app performance and reliability;",
      "detect fraud, abuse, or unauthorized access;",
      "comply with legal obligations;",
      "enforce our Terms of Use.",
      "We do not use uploaded documents, receipts, warranties, or OCR text for advertising profiling.",
    ],
  },
  {
    title: "6. Payments and Subscriptions",
    paragraphs: [
      "DomiVault subscriptions and in-app purchases are processed through RevenueCat, which may manage subscription status through the Apple App Store or Google Play Store, depending on your device and purchase method.",
      "We do not store raw credit card numbers on our servers.",
      "RevenueCat may process information such as app user ID, subscription status, purchase history, entitlement status, renewal or expiration information, and store transaction identifiers.",
      "Your payment activity may also be subject to Apple's or Google's own privacy policies and payment terms.",
    ],
  },
  {
    title: "7. Backend, Database, and Authentication",
    paragraphs: [
      "DomiVault uses backend infrastructure to securely store and sync user records.",
      "Our backend and database infrastructure may include Supabase, PostgreSQL, Supabase Auth, Google Sign-In, and Apple Sign-In where available.",
      "These services help us provide authentication, database storage, file storage, access controls, and account security.",
    ],
  },
  {
    title: "8. Analytics and Diagnostics",
    paragraphs: [
      "We use Google Analytics to understand app usage trends, performance, and reliability.",
      "Google Analytics may collect information such as pages or screens viewed, session duration, device and browser information, general location information, app interactions, and performance events.",
      "We use analytics to improve the Services, diagnose issues, and understand which features are useful. We do not use Google Analytics to sell your personal information.",
    ],
  },
  {
    title: "9. How We Share Information",
    paragraphs: [
      "We do not sell your personal information.",
      "We may share information only when necessary to operate, secure, or support the Services, including with backend hosting and database providers, authentication providers, cloud storage providers, payment and subscription processors, analytics and diagnostics providers, customer support tools, legal and compliance advisors, or law enforcement and government authorities when legally required.",
      "We may share limited information with RevenueCat for subscription and entitlement management; Apple App Store and Google Play Store for app payment processing; Supabase and PostgreSQL for authentication, database, and storage infrastructure; Google Analytics for usage analytics and diagnostics; and Google or Apple Sign-In if you choose those login methods.",
    ],
  },
  {
    title: "10. Data Retention",
    paragraphs: [
      "We keep personal information for as long as needed to provide the Services, maintain your account, store records you choose to save, comply with legal obligations, resolve disputes, enforce agreements, prevent fraud or abuse, and maintain backups and security logs.",
      "You may delete certain records inside the app. Some information may remain temporarily in backups, logs, payment records, or legal compliance systems.",
      "If you request account deletion, we will take reasonable steps to delete or de-identify personal information, subject to legal, billing, security, and operational retention requirements.",
    ],
  },
  {
    title: "11. Security Safeguards",
    paragraphs: [
      "We use reasonable administrative, technical, and organizational safeguards designed to protect your information.",
      "These safeguards may include authentication controls, encrypted connections, database access controls, role-based permissions, private storage rules, monitoring and logging, secure third-party infrastructure, and restricted access to user records.",
      "No system can be guaranteed 100% secure. You are responsible for keeping your login credentials safe and for maintaining separate backups of critical records.",
    ],
  },
  {
    title: "12. Your Privacy Choices",
    paragraphs: [
      "Depending on your location and applicable law, you may have the right to access personal information we hold about you, correct inaccurate information, delete certain personal information, receive a copy of your information, opt out of certain processing, withdraw consent where processing is based on consent, appeal certain privacy decisions, or limit certain uses of sensitive personal information where applicable.",
      "To make a privacy request, contact support@domivaultapp.com. We may need to verify your identity before completing a request.",
    ],
  },
  {
    title: "13. United States State Privacy Rights",
    paragraphs: [
      "Residents of certain U.S. states, including California and other states with consumer privacy laws, may have additional rights.",
      "These may include the right to know the categories of personal information collected, sources of personal information, purposes for collection and use, categories of third parties to whom information is disclosed, specific pieces of personal information collected, and whether personal information is sold or shared.",
      "DomiVault does not sell personal information. DomiVault does not knowingly sell or share personal information of users under 18.",
      "California residents may also have rights under the CCPA/CPRA, including the right to access, delete, correct, and opt out of sale or sharing of personal information. Because DomiVault does not sell user data, there is no sale of personal information to opt out of.",
    ],
  },
  {
    title: "14. International Users",
    paragraphs: [
      "DomiVault is currently intended for users in the United States.",
      "If you access the Services from outside the United States, you understand that your information may be processed in the United States or other locations where our service providers operate.",
    ],
  },
  {
    title: "15. GDPR Notice",
    paragraphs: [
      "Although DomiVault is currently intended for U.S. users, if GDPR or similar laws apply, our legal bases for processing may include your consent, performance of a contract, legitimate interests, compliance with legal obligations, and protection of rights, safety, and security.",
      "You may have the right to access, correct, delete, restrict, object to processing, or request portability of personal data, subject to legal limitations.",
    ],
  },
  {
    title: "16. Children's Privacy",
    paragraphs: [
      "DomiVault is not intended for children or minors.",
      "You must be 18 or older to use the Services. We do not knowingly collect data from minors. If you believe a minor has provided personal information to DomiVault, contact us at support@domivaultapp.com.",
    ],
  },
  {
    title: "17. Changes to This Privacy Policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time. If we make material changes, we may notify you through the Services, by email, or by posting an updated policy.",
      "The Effective Date above indicates when this Privacy Policy was last updated.",
    ],
  },
  {
    title: "18. Contact Us",
    paragraphs: [
      "If you have questions, concerns, or requests about this Privacy Policy or your personal information, contact DomiVault at:",
      "Website: https://www.domivaultapp.com",
      "Email: support@domivaultapp.com",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <nav className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/70 bg-white/80 p-4 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
          <Link href="/" className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">DomiVault</Link>
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Link href="/login" className="hover:text-slate-950 dark:hover:text-white">Login</Link>
            <Link href="/terms" className="hover:text-slate-950 dark:hover:text-white">Terms</Link>
          </div>
        </nav>

        <section className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.05] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">Privacy policy</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">How DomiVault protects your records.</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400">
            This Privacy Policy explains how DomiVault collects, uses, stores, shares, and protects information when you use our website, mobile application, and related services available at domivaultapp.com.
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400">
            DomiVault is a secure home management and records vault that helps homeowners organize expenses, appliances, warranties, maintenance tasks, vendors, vehicle records, receipts, and important documents.
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Effective date: July 17, 2026</p>
        </section>

        <section className="grid gap-4">
          {privacySections.map((section) => (
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
