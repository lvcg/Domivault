export type BlogArticle = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readingTime: string;
  category: string;
  keywords: string[];
  intro: string;
  sections: Array<{
    heading: string;
    body: string[];
  }>;
  takeaway: string;
};

export const blogArticles: BlogArticle[] = [
  {
    slug: "home-maintenance-tracker-guide",
    title: "How to Use a Home Maintenance Tracker Before Repairs Get Expensive",
    description:
      "Learn how a home maintenance tracker helps homeowners organize recurring tasks, service dates, repair notes, and reminders before small problems become costly.",
    publishedAt: "2026-09-07",
    readingTime: "5 min read",
    category: "Maintenance",
    keywords: ["home maintenance tracker", "home maintenance app", "home repair reminders", "house maintenance checklist"],
    intro:
      "A home maintenance tracker gives every recurring task a place to live, from HVAC filters and gutter cleaning to water heater flushes and appliance service dates.",
    sections: [
      {
        heading: "Why maintenance tracking matters",
        body: [
          "Most home maintenance problems start small. A clogged filter, missed inspection, or forgotten warranty deadline can turn into a much larger repair if it is not tracked.",
          "A useful tracker should show what is due, what is overdue, what was completed, and who handled the work.",
        ],
      },
      {
        heading: "What to track",
        body: [
          "Start with seasonal maintenance, recurring service intervals, appliance checks, safety inspections, and repair follow-ups.",
          "Add due dates, notes, service providers, cost estimates, priority, and completion history so the record is useful later.",
        ],
      },
      {
        heading: "How DomiVault helps",
        body: [
          "DomiVault gives homeowners a home command center for maintenance tasks, reminders, appliance records, vendor details, and supporting documents.",
          "Instead of trying to remember what happened last year, users can open one workspace and see the next priority.",
        ],
      },
    ],
    takeaway: "The best time to document home maintenance is before something breaks.",
  },
  {
    slug: "organize-home-receipts-warranties",
    title: "How to Organize Home Receipts and Warranties in One Secure Vault",
    description:
      "A practical guide to organizing receipts, warranties, appliance manuals, serial numbers, and repair documents for homeowners.",
    publishedAt: "2026-09-07",
    readingTime: "6 min read",
    category: "Document Vault",
    keywords: ["receipt organizer for homeowners", "warranty tracker app", "home document vault", "organize home receipts"],
    intro:
      "Receipts and warranties are easy to lose until a repair, insurance claim, return, or resale question makes them suddenly important.",
    sections: [
      {
        heading: "Create one source of truth",
        body: [
          "Keep purchase receipts, warranty cards, service invoices, photos, and document notes together instead of spreading them across email, drawers, and cloud folders.",
          "A home document vault should make each file searchable and connected to the appliance, expense, project, or repair it belongs to.",
        ],
      },
      {
        heading: "Capture useful metadata",
        body: [
          "For every receipt or warranty, save the vendor, purchase date, amount, item name, serial number, warranty expiration date, and notes.",
          "Those details make the document useful even before you open the original file.",
        ],
      },
      {
        heading: "Use OCR to reduce manual typing",
        body: [
          "OCR scan extraction can help pull text from receipt and warranty images so users have a faster starting point.",
          "The best OCR results come from sharp images, clean lighting, and flat documents.",
        ],
      },
    ],
    takeaway: "Organized documents save time when repairs, warranties, taxes, or claims need proof.",
  },
  {
    slug: "home-expense-tracker-for-renovations",
    title: "Home Expense Tracker: What to Record During Renovations and Repairs",
    description:
      "Track renovation expenses, bills, vendors, receipts, budgets, and project costs with a home expense tracker built for real household records.",
    publishedAt: "2026-09-07",
    readingTime: "5 min read",
    category: "Expenses",
    keywords: ["home expense tracker", "renovation budget tracker", "home improvement expenses", "project budget planner"],
    intro:
      "A home expense tracker helps homeowners understand what they spent, where the money went, and which records should be saved for future planning.",
    sections: [
      {
        heading: "Separate real expenses from planned budgets",
        body: [
          "Actual spending and project planning are related, but they should not be the same number.",
          "A project planner can estimate budgets, while expense records should show what was actually paid.",
        ],
      },
      {
        heading: "Record the details that matter",
        body: [
          "Useful expense records include vendor, category, project, amount, date, receipt, notes, and whether the item may need review later.",
          "Categories like materials, labor, permits, utilities, and repairs make reporting easier.",
        ],
      },
      {
        heading: "Use reports for decision-making",
        body: [
          "Clean exports can help with resale prep, insurance documentation, contractor handoffs, and year-end review.",
          "DomiVault keeps expense records connected to projects, documents, and vendors so the context is not lost.",
        ],
      },
    ],
    takeaway: "Good expense tracking turns scattered receipts into useful home records.",
  },
  {
    slug: "appliance-warranty-tracker",
    title: "Appliance Warranty Tracker: Dates, Service Records, and Replacement Planning",
    description:
      "Learn how to track appliance age, warranty expiration dates, service records, serial numbers, and repair vendors in one place.",
    publishedAt: "2026-09-07",
    readingTime: "5 min read",
    category: "Appliances",
    keywords: ["appliance warranty tracker", "appliance service records", "appliance maintenance app", "warranty expiration alerts"],
    intro:
      "Appliance records are more useful when age, warranty coverage, service history, and preferred repair contacts are connected.",
    sections: [
      {
        heading: "Start with the basics",
        body: [
          "Track appliance name, brand, model, serial number, install date, expected lifespan, location, and warranty expiration date.",
          "These details are especially helpful when calling a repair provider or checking warranty coverage.",
        ],
      },
      {
        heading: "Add service history",
        body: [
          "Save service dates, repair notes, vendor information, parts replaced, and the next recommended checkup.",
          "A clear history can help decide whether another repair is worth it or replacement makes more sense.",
        ],
      },
      {
        heading: "Prepare for expiration dates",
        body: [
          "Warranty expiration alerts give homeowners time to inspect issues before coverage ends.",
          "DomiVault Plus is designed to support warranty tracking, alerts, and document storage for appliance records.",
        ],
      },
    ],
    takeaway: "A few appliance details saved today can make future repairs much easier.",
  },
  {
    slug: "home-vendor-address-book",
    title: "Why Every Homeowner Needs a Vendor Address Book",
    description:
      "Build a home vendor address book for contractors, repair providers, emergency contacts, service notes, and preferred vendors.",
    publishedAt: "2026-09-07",
    readingTime: "4 min read",
    category: "Vendors",
    keywords: ["home vendor address book", "contractor contact list", "home service vendors", "emergency vendor list"],
    intro:
      "When something breaks, the last thing a homeowner wants is to search old texts for the plumber, electrician, HVAC provider, or appliance repair company.",
    sections: [
      {
        heading: "Keep vendor details ready",
        body: [
          "Save names, phone numbers, emails, addresses, specialties, emergency availability, and notes from past work.",
          "A vendor address book is most useful when it connects providers to expenses, maintenance tasks, appliances, and service events.",
        ],
      },
      {
        heading: "Record performance notes",
        body: [
          "Add notes about pricing, response time, quality of work, warranties, and whether you would hire the provider again.",
          "That context helps homeowners make faster decisions during urgent repairs.",
        ],
      },
      {
        heading: "Use vendors as part of the home record",
        body: [
          "DomiVault treats vendor management as a core home organization feature, not a side note.",
          "The goal is to keep repair contacts close to the records they helped create.",
        ],
      },
    ],
    takeaway: "A strong vendor list turns past repair experience into future preparedness.",
  },
  {
    slug: "first-time-homeowner-records-checklist",
    title: "First-Time Homeowner Records Checklist",
    description:
      "A practical records checklist for first-time homeowners covering maintenance, appliances, warranties, receipts, vendors, utilities, and repairs.",
    publishedAt: "2026-09-07",
    readingTime: "6 min read",
    category: "Homeownership",
    keywords: ["first-time homeowner checklist", "home records checklist", "new homeowner maintenance", "home organization app"],
    intro:
      "Buying a home creates a flood of new records, dates, responsibilities, and decisions. A simple checklist helps new homeowners stay organized from day one.",
    sections: [
      {
        heading: "Save your core property records",
        body: [
          "Start with closing documents, insurance information, utility account details, HOA notes, inspection reports, and major system details.",
          "Keep public legal and financial documents in appropriate secure storage, and use DomiVault for operational home records.",
        ],
      },
      {
        heading: "Track every major system",
        body: [
          "Document HVAC, roof, water heater, electrical panel, plumbing, appliances, windows, doors, and major improvements.",
          "Add install dates, service dates, warranty information, and vendor notes when available.",
        ],
      },
      {
        heading: "Build the first maintenance calendar",
        body: [
          "Create recurring reminders for filters, gutters, smoke detectors, water heater flushing, seasonal inspections, and appliance checks.",
          "Even a basic maintenance calendar can prevent surprises.",
        ],
      },
    ],
    takeaway: "The first year is the best time to build a clean home record system.",
  },
  {
    slug: "digital-home-inventory-documents",
    title: "Digital Home Inventory: What Documents and Records Should You Keep?",
    description:
      "Create a digital home inventory with appliance records, receipts, warranties, repairs, photos, vendors, and important household documents.",
    publishedAt: "2026-09-07",
    readingTime: "5 min read",
    category: "Home Inventory",
    keywords: ["digital home inventory", "home inventory app", "home document organizer", "household records"],
    intro:
      "A digital home inventory is more than a list of belongings. It is a record of what you own, what it cost, where it was serviced, and where proof is stored.",
    sections: [
      {
        heading: "Track assets with proof",
        body: [
          "For major items, save photos, receipts, model numbers, serial numbers, purchase dates, warranty details, and replacement estimates.",
          "This can help with planning, repairs, resale, and documentation.",
        ],
      },
      {
        heading: "Connect records to real workflows",
        body: [
          "A useful inventory connects documents to appliances, expenses, vendors, and maintenance tasks.",
          "That structure makes records easier to find when something needs action.",
        ],
      },
      {
        heading: "Keep it lightweight",
        body: [
          "Start with the big items and recurring responsibilities first. You can always add more detail over time.",
          "DomiVault is designed to grow from a simple home tracker into a deeper records vault.",
        ],
      },
    ],
    takeaway: "A digital home inventory is most valuable when it is easy to update and search.",
  },
  {
    slug: "vehicle-maintenance-records-for-households",
    title: "Vehicle Maintenance Records for Households: What to Track",
    description:
      "Organize vehicle repair records, maintenance reminders, service dates, vendors, receipts, and exportable history alongside household records.",
    publishedAt: "2026-09-07",
    readingTime: "4 min read",
    category: "Vehicles",
    keywords: ["vehicle maintenance records", "car repair tracker", "vehicle service history", "auto maintenance reminders"],
    intro:
      "Vehicles are part of many household budgets, yet repair records often live separately from home expenses and maintenance planning.",
    sections: [
      {
        heading: "Track service events",
        body: [
          "Save oil changes, tire rotations, brake work, inspections, repairs, mileage, cost, vendor, and next service date.",
          "This helps families understand vehicle costs and prepare for future maintenance.",
        ],
      },
      {
        heading: "Keep documents with the record",
        body: [
          "Receipts, warranty details, service reports, and inspection paperwork are easier to use when linked to the vehicle record.",
          "Exportable service history can also help during resale or insurance review.",
        ],
      },
      {
        heading: "Use reminders",
        body: [
          "Recurring reminders for oil, tires, registration, insurance, and inspections reduce the chance of missing routine maintenance.",
          "DomiVault Plus includes vehicle maintenance records as part of the broader home records vault.",
        ],
      },
    ],
    takeaway: "Vehicle records belong near the rest of the household maintenance plan.",
  },
  {
    slug: "prepare-home-records-for-insurance-claims",
    title: "How to Prepare Home Records Before an Insurance Claim",
    description:
      "Learn which home records, receipts, photos, warranties, vendor notes, and repair documents can help homeowners prepare before an insurance claim.",
    publishedAt: "2026-09-07",
    readingTime: "6 min read",
    category: "Preparedness",
    keywords: ["home insurance claim documents", "home repair records", "receipt storage app", "home records vault"],
    intro:
      "Insurance claims are stressful enough without searching for receipts, repair history, vendor details, and warranty paperwork at the same time.",
    sections: [
      {
        heading: "Collect proof before you need it",
        body: [
          "Save receipts, photos, serial numbers, warranties, repair records, and service invoices for major home systems and appliances.",
          "A well-organized record can make conversations with insurers, contractors, and adjusters less chaotic.",
        ],
      },
      {
        heading: "Keep repair context",
        body: [
          "Document who performed work, when it happened, what was fixed, what it cost, and whether there were warranties or follow-up instructions.",
          "That context can matter when reviewing damage, maintenance, or replacement history.",
        ],
      },
      {
        heading: "Export when needed",
        body: [
          "DomiVault Plus supports export-ready reports so users can gather records into cleaner packets.",
          "DomiVault does not replace professional insurance advice, but it can help keep records organized.",
        ],
      },
    ],
    takeaway: "Prepared records cannot prevent emergencies, but they can make recovery more organized.",
  },
  {
    slug: "google-calendar-home-maintenance-reminders",
    title: "Using Google Calendar for Home Maintenance Reminders",
    description:
      "Use Google Calendar home maintenance reminders to track seasonal tasks, appliance service dates, warranty deadlines, and recurring upkeep.",
    publishedAt: "2026-09-07",
    readingTime: "4 min read",
    category: "Reminders",
    keywords: ["Google Calendar home maintenance", "home maintenance reminders", "maintenance calendar app", "recurring home tasks"],
    intro:
      "Calendar reminders are one of the simplest ways to keep home maintenance visible before tasks become overdue.",
    sections: [
      {
        heading: "Choose useful reminder types",
        body: [
          "Add recurring reminders for HVAC filters, gutters, smoke detectors, water heater service, seasonal checks, and warranty deadlines.",
          "Use clear titles, due dates, notes, and vendor details where possible.",
        ],
      },
      {
        heading: "Keep the record behind the reminder",
        body: [
          "A calendar event tells you when something is due. A records vault explains what happened last time and what proof is attached.",
          "DomiVault connects tasks, appliance details, service history, and documents so reminders have context.",
        ],
      },
      {
        heading: "Sync as a premium workflow",
        body: [
          "Google Calendar sync is planned as a DomiVault Plus feature for users who want reminders connected to their existing calendar workflow.",
          "The goal is to reduce missed maintenance while keeping the home record organized in DomiVault.",
        ],
      },
    ],
    takeaway: "The calendar is the reminder layer; DomiVault is the record layer.",
  },
];

export function getBlogArticle(slug: string) {
  return blogArticles.find((article) => article.slug === slug);
}
