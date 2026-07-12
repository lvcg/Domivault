import Link from "next/link";

const termsSections = [
  {
    title: "Using DomiVault",
    body: "DomiVault is a home and vehicle records platform for organizing expenses, maintenance tasks, vendors, appliances, receipts, warranties, service records, reminders, and exports. You agree to use the app lawfully and only for records you have permission to manage.",
  },
  {
    title: "United States Availability",
    body: "DomiVault is currently available only in the United States. You may not use the service if you are located outside the United States or if applicable laws prohibit your use of the app.",
  },
  {
    title: "Not Professional Advice",
    body: "DomiVault is an organization tool. It does not provide legal, tax, insurance, construction, electrical, plumbing, financial, or vehicle repair advice. You should consult qualified professionals before making decisions that require licensed expertise.",
  },
  {
    title: "Your Account And Records",
    body: "You are responsible for keeping your login credentials secure and for the accuracy of information you enter, upload, scan, edit, export, or share from DomiVault. You should review OCR text, reminder dates, tax markers, warranty details, and vendor information for accuracy.",
  },
  {
    title: "Documents And Uploads",
    body: "You may upload or scan supported receipts, warranties, photos, and records. You confirm that you have the right to upload those files. Do not upload unlawful content, malware, passwords, complete payment card numbers, or documents that violate another person's privacy.",
  },
  {
    title: "DomiVault Plus And Paid Features",
    body: "Some features may require a paid plan, such as receipt storage, warranty tracking, maintenance history, vehicle records, calendar sync, expiration alerts, OCR extraction, and exports. Paid access and subscription status are managed through the billing provider shown at checkout.",
  },
  {
    title: "Free Trial And Renewal Billing",
    body: "DomiVault offers a 7-day free trial for eligible subscriptions. If you cancel before the trial ends, you will not be charged. After a paid subscription begins, monthly payments are generally non-refundable, but you may cancel anytime to prevent future charges.",
  },
  {
    title: "Cancellation Policy",
    body: "Cancel anytime means you can turn off renewal before the 7-day free trial ends and avoid the renewal charge. You may also cancel after a paid subscription begins to stop future renewals. Cancelling does not automatically delete your account or records, but paid features may become unavailable after the current paid period ends.",
  },
  {
    title: "Refund Policy",
    body: "Annual and lifetime purchases may be refunded within 14 days of the initial purchase if requested through support. Refunds may also be issued for duplicate charges, billing errors, unauthorized transactions, or verified technical issues that prevent use of the service. To request help, contact support@domivaultapp.com with your account email, charge date, and plan details.",
  },
  {
    title: "Exports And Reports",
    body: "Exports may contain sensitive home, financial, vendor, vehicle, and document information. You are responsible for securely storing, sharing, or deleting exported files after download.",
  },
  {
    title: "Service Availability",
    body: "We aim to keep DomiVault reliable, but the service may be interrupted by maintenance, provider outages, network issues, security updates, or changes to third-party services such as Supabase, payment processors, email providers, or browser camera APIs.",
  },
  {
    title: "Acceptable Use",
    body: "You may not misuse DomiVault, attempt to bypass access controls, upload harmful files, scrape the service, interfere with other users, reverse engineer restricted parts of the service, or use the app to store illegal or abusive content.",
  },
  {
    title: "Privacy",
    body: "Your use of DomiVault is also governed by the Privacy and Data Policy. We do not sell your data, and synced app records are stored using Supabase-backed authentication, database, and storage infrastructure.",
  },
  {
    title: "Dispute Resolution And Arbitration",
    body: "Before filing a claim, you and DomiVault agree to try to resolve disputes informally by contacting support with a clear description of the issue. If a dispute cannot be resolved informally, any claim arising from or relating to DomiVault, these terms, or the service will be resolved by binding arbitration on an individual basis to the fullest extent permitted by law, except that either party may bring qualifying claims in small claims court or seek injunctive relief for misuse, security issues, or intellectual property violations. You and DomiVault waive the right to a jury trial and to participate in class, collective, consolidated, or representative actions to the fullest extent permitted by law. Nothing in this section limits rights that cannot be waived under applicable law.",
  },
  {
    title: "Changes To These Terms",
    body: "We may update these terms as DomiVault evolves. Continued use of the app after updated terms are posted means you accept the updated terms.",
  },
  {
    title: "Contact",
    body: "For billing, refund, subscription, privacy, or account support, contact support@domivaultapp.com.",
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
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">Terms of service</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">Clear terms for managing your home records.</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400">
            These terms explain how you may use DomiVault and what responsibilities apply when you store, scan, organize, or export home, vehicle, receipt, warranty, maintenance, and vendor records.
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Effective date: June 25, 2026</p>
        </section>

        <section className="grid gap-4">
          {termsSections.map((section) => (
            <article key={section.title} className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{section.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">{section.body}</p>
            </article>
          ))}
        </section>

      </div>
    </main>
  );
}
