export type PaidReportStatus = 'ready' | 'needs-evidence' | 'draft';

export type PaidReportMetric = {
  label: string;
  value: string;
  explanation: string;
  tone: 'strong' | 'watch' | 'weak' | 'neutral';
};

export type PaidReportFinding = {
  title: string;
  plainEnglish: string;
  evidence: string;
  whyItMatters: string;
  fixFirstStep: string;
  impact: 'High' | 'Medium' | 'Low';
  difficulty: 'Easy' | 'Moderate' | 'Developer';
  visualPosition: number;
};

export type PaidReportAsset = {
  label: string;
  purpose: string;
  copyReady: string;
};

export type PaidReportTrackerItem = {
  task: string;
  owner: 'VizBiz' | 'Client' | 'Developer';
  priority: 'Fix First' | 'Important' | 'Monitor';
  status: 'Ready to apply' | 'Needs access' | 'Waiting on client' | 'Verify after launch';
  verification: string;
};

export type PaidReportPromptCluster = {
  name: string;
  tested: number;
  targetAppeared: number;
  takeaway: string;
};

export type PaidReportData = {
  reportId: string;
  status: PaidReportStatus;
  businessName: string;
  website: string;
  primaryMarket: string;
  category: string;
  dateLabel: string;
  executiveSummary: string;
  ownerTranslation: string;
  score: number;
  scoreLabel: string;
  metrics: PaidReportMetric[];
  promptClusters: PaidReportPromptCluster[];
  serviceAreaMap: string[];
  competitors: Array<{ name: string; note: string; status: 'supplied' | 'needed' }>;
  findings: PaidReportFinding[];
  assets: PaidReportAsset[];
  tracker: PaidReportTrackerItem[];
  verificationPlan: string[];
  monthlyPlan: string[];
  evidenceNotes: string[];
  qaGate: string[];
};

export const mopWringersPaidReportDemo: PaidReportData = {
  reportId: 'paid-demo-mop-wringers-2026-06',
  status: 'draft',
  businessName: 'Mop Wringers',
  website: 'https://www.mopwringersllc.com',
  primaryMarket: 'Rockwall County, Texas',
  category: 'Commercial cleaning / janitorial / sanitizing',
  dateLabel: 'June 2026 Visibility Report',
  score: 42,
  scoreLabel: 'Visibility foundation needs strengthening',
  executiveSummary:
    'Mop Wringers has a clear local-service opportunity: the business can be framed much more strongly as a Rockwall County commercial cleaning and sanitizing provider for offices, schools, daycares, medical offices, restaurants, and facilities. The current visibility story should focus less on generic cleaning and more on trustworthy facility cleaning for defined service areas.',
  ownerTranslation:
    'Plain English: AI systems need obvious proof about what Mop Wringers does, where it serves, who it helps, and why it is safe to recommend. The fix is not “more SEO words.” The fix is clearer service-area pages, better trust proof, structured business data, and answer-ready content for real customer questions.',
  metrics: [
    {
      label: 'Market clarity',
      value: 'Strong direction',
      explanation: 'Rockwall County is the right primary market, with nearby areas used as secondary opportunities.',
      tone: 'strong',
    },
    {
      label: 'Category clarity',
      value: 'Needs sharpening',
      explanation: 'Commercial cleaning, janitorial, and sanitizing should be explicit across pages and metadata.',
      tone: 'watch',
    },
    {
      label: 'AI answer readiness',
      value: 'Partial',
      explanation: 'The business needs direct answers to buyer questions about facilities, safety, service areas, and standards.',
      tone: 'weak',
    },
    {
      label: 'Trust proof',
      value: 'Needs proof blocks',
      explanation: 'Reviews, industries served, cleaning standards, insurance/licensing proof, and before/after signals should be easier to verify.',
      tone: 'weak',
    },
  ],
  promptClusters: [
    {
      name: 'Rockwall commercial cleaning',
      tested: 36,
      targetAppeared: 10,
      takeaway: 'The core market should be reviewed around Rockwall and Rockwall County commercial-cleaning buyer questions.',
    },
    {
      name: 'Nearby service areas',
      tested: 22,
      targetAppeared: 5,
      takeaway: 'Heath, Fate, Rowlett, Garland, and Mesquite should be treated as secondary service-area opportunities, not the main positioning.',
    },
    {
      name: 'Facility-specific buyers',
      tested: 34,
      targetAppeared: 8,
      takeaway: 'Schools, daycares, medical offices, restaurants, and office buildings need clearer answer-ready pages or sections.',
    },
    {
      name: 'Trust and safety questions',
      tested: 28,
      targetAppeared: 6,
      takeaway: 'AI systems need stronger proof around sanitizing standards, reliability, commercial experience, and customer confidence.',
    },
  ],
  serviceAreaMap: ['Rockwall County', 'Rockwall', 'Heath', 'Fate', 'Rowlett', 'Garland', 'Mesquite'],
  competitors: [
    {
      name: 'Competitor 1',
      status: 'needed',
      note: 'Add the first local business Mop Wringers is most often compared against for a focused benchmark.',
    },
    {
      name: 'Competitor 2',
      status: 'needed',
      note: 'Add the second local business customers may choose instead so the paid report can compare proof signals accurately.',
    },
  ],
  findings: [
    {
      title: 'Make Rockwall County the center of the story',
      plainEnglish: 'The business should not look like a generic cleaning company floating on the internet. It should look like a clear Rockwall County commercial cleaning choice.',
      evidence: 'Service-area language includes Rockwall, Heath, Fate, Rowlett, Garland, and Mesquite, with Rockwall County as the strongest primary-market frame.',
      whyItMatters: 'AI recommendations are local and confidence-based. Clear market focus makes the business easier to match to nearby buyer questions.',
      fixFirstStep: 'Update homepage hero, title/meta, and service intro copy to say “Commercial cleaning and sanitizing for Rockwall County facilities.”',
      impact: 'High',
      difficulty: 'Easy',
      visualPosition: 1,
    },
    {
      title: 'Separate services from customer types',
      plainEnglish: 'Schools, daycares, medical offices, restaurants, and offices are not the business category. They are the buyers Mop Wringers serves.',
      evidence: 'The current framing should preserve commercial cleaning/janitorial/sanitizing as the category, then use facilities served as customer segments.',
      whyItMatters: 'When customer types replace the category, reports and AI prompts drift. Clear separation produces better recommendations and better content.',
      fixFirstStep: 'Create a “Facilities We Clean” section with cards for offices, medical offices, schools/daycares, restaurants, and commercial buildings.',
      impact: 'High',
      difficulty: 'Easy',
      visualPosition: 2,
    },
    {
      title: 'Create answer-ready buyer questions',
      plainEnglish: 'Non-technical buyers ask practical questions: service area, reliability, safety, standards, scheduling, and whether the cleaner can handle their type of facility.',
      evidence: 'The paid prompt plan should include Rockwall commercial-cleaning questions, nearby-area questions, and facility-specific trust questions.',
      whyItMatters: 'AI systems often quote pages that directly answer the question. If the site does not answer it clearly, competitors or directories may get cited instead.',
      fixFirstStep: 'Add an FAQ section answering 8–10 real buying questions, including medical-office cleaning, daycare cleaning, restaurant cleaning, service areas, scheduling, and sanitizing standards.',
      impact: 'High',
      difficulty: 'Moderate',
      visualPosition: 3,
    },
    {
      title: 'Add structured data for machine readability',
      plainEnglish: 'Schema is the label-maker for AI and search systems. It tells machines what the business is, where it serves, and which services it offers.',
      evidence: 'Commercial cleaning needs LocalBusiness/Service/FAQ schema that reflects the real category and service areas.',
      whyItMatters: 'Better structure helps AI systems connect the website to local commercial-cleaning searches and trust signals.',
      fixFirstStep: 'Add LocalBusiness, Service, and FAQPage JSON-LD with Rockwall County service-area language and commercial cleaning services.',
      impact: 'Medium',
      difficulty: 'Developer',
      visualPosition: 4,
    },
    {
      title: 'Make proof easier to verify',
      plainEnglish: 'AI and customers both need proof. Claims like safe, reliable, professional, and trusted should be supported by visible evidence.',
      evidence: 'The report should look for review snippets, insurance/licensing statements, cleaning protocols, photos, testimonials, and third-party profile consistency.',
      whyItMatters: 'AI systems prefer businesses with clear corroborating signals. Buyers also need confidence before inviting a cleaning company into a facility.',
      fixFirstStep: 'Add a trust block with review excerpts, industries served, cleaning standards, service guarantees, and links to public profiles where available.',
      impact: 'High',
      difficulty: 'Moderate',
      visualPosition: 5,
    },
  ],
  assets: [
    {
      label: 'Homepage positioning copy',
      purpose: 'Clarifies what the business does and where it serves.',
      copyReady:
        'Commercial cleaning and sanitizing for Rockwall County facilities. Mop Wringers helps offices, schools, daycares, restaurants, medical offices, and commercial buildings stay clean, safe, and ready for customers, staff, and visitors.',
    },
    {
      label: 'Service-area answer block',
      purpose: 'Makes local coverage easy for customers and AI systems to understand.',
      copyReady:
        'Mop Wringers serves commercial cleaning clients across Rockwall County, including Rockwall, Heath, Fate, and Rowlett, with extended service coverage available for Garland, Mesquite, and nearby communities.',
    },
    {
      label: 'FAQ example',
      purpose: 'Turns real buyer concerns into AI-readable answers.',
      copyReady:
        'Do you clean schools, daycares, or medical offices? Yes. Mop Wringers provides commercial cleaning and sanitizing services for facilities that need reliable routines, careful attention to high-touch surfaces, and a clean environment for staff, visitors, children, patients, or customers.',
    },
    {
      label: 'Schema direction',
      purpose: 'Gives a developer a clear structured-data target.',
      copyReady:
        'Have the developer add structured website data that clearly labels the business, services, service areas, and customer questions. Business type: Commercial cleaning service. Area served: Rockwall County, Rockwall, Heath, Fate, Rowlett, Garland, Mesquite. Services: commercial cleaning, janitorial cleaning, sanitizing, office cleaning, medical-office cleaning, school/daycare cleaning, restaurant cleaning.',
    },
  ],
  tracker: [
    {
      task: 'Update homepage title/meta/H1 with Rockwall County commercial-cleaning positioning',
      owner: 'VizBiz',
      priority: 'Fix First',
      status: 'Ready to apply',
      verification: 'Check the homepage again and confirm the title, main heading, and intro copy reflect the category and market.',
    },
    {
      task: 'Add “Facilities We Clean” section for offices, medical offices, schools/daycares, restaurants, and commercial buildings',
      owner: 'Client',
      priority: 'Fix First',
      status: 'Needs access',
      verification: 'Confirm the section is visible on the homepage or services page in normal readable text.',
    },
    {
      task: 'Publish 8–10 FAQ answers for commercial cleaning buyer questions',
      owner: 'VizBiz',
      priority: 'Important',
      status: 'Ready to apply',
      verification: 'Confirm FAQ answers are visible on the page and connected to structured website data where appropriate.',
    },
    {
      task: 'Add LocalBusiness/Service/FAQ structured data',
      owner: 'Developer',
      priority: 'Important',
      status: 'Verify after launch',
      verification: 'Check that Google and AI tools can read the added business, service, and FAQ data after launch.',
    },
    {
      task: 'Collect and publish trust proof: review excerpts, standards, photos, profile links, and service guarantees',
      owner: 'Client',
      priority: 'Important',
      status: 'Waiting on client',
      verification: 'Confirm proof appears on the site and can be cited in future visibility checks.',
    },
  ],
  verificationPlan: [
    'Check the updated website again and confirm the category, service areas, and facility types are visible in normal page text.',
    'Re-test Rockwall County commercial-cleaning questions and compare new visibility against the first baseline.',
    'Validate schema and FAQ content after launch.',
    'Confirm Google profile/category/service data matches the website language.',
    'Check whether AI/search answers begin connecting Mop Wringers to commercial cleaning, janitorial, sanitizing, and facility-specific questions.',
  ],
  monthlyPlan: [
    'Refresh the visibility score monthly across the main buyer-question clusters.',
    'Track competitor movement once two named competitors are confirmed.',
    'Add 3–5 new recommended actions each month based on what changed.',
    'Watch for site, schema, review, and Google profile regressions.',
    'Create new answer-ready content for seasonal or facility-specific commercial-cleaning demand.',
  ],
  evidenceNotes: [
    'Primary market should be Rockwall County.',
    'Service areas include Rockwall, Heath, Fate, Rowlett, Garland, and Mesquite.',
    'Business category should remain commercial cleaning / janitorial / sanitizing.',
    'Facility segments include schools, daycares, medical offices, restaurants, offices, and commercial buildings.',
    'Competitor comparison requires two named competitors before client-facing competitor scoring is shown.',
  ],
  qaGate: [
    'Business category matches visible website evidence.',
    'Service-area framing does not over-expand beyond claimed areas.',
    'No unconfirmed competitor names or scores are shown.',
    'No guaranteed ranking, traffic, or revenue claims are made.',
    'Every major recommendation maps to evidence, a task, and a verification method.',
    'Desktop and mobile report views are readable for a non-technical business owner.',
  ],
};

export function paidReportToneClasses(tone: PaidReportMetric['tone']): string {
  switch (tone) {
    case 'strong':
      return 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100';
    case 'watch':
      return 'border-amber-300/30 bg-amber-300/10 text-amber-100';
    case 'weak':
      return 'border-rose-300/30 bg-rose-300/10 text-rose-100';
    default:
      return 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100';
  }
}

export function paidReportReadinessSummary(report: PaidReportData) {
  const missingCompetitors = report.competitors.filter((c) => c.status === 'needed').length;
  const highImpactFindings = report.findings.filter((f) => f.impact === 'High').length;
  const readyAssets = report.assets.length;

  return {
    missingCompetitors,
    highImpactFindings,
    readyAssets,
    isClientDeliverableReady: report.status === 'ready' && missingCompetitors === 0,
  };
}

export function validatePaidReportForClient(report: PaidReportData): string[] {
  const blockers: string[] = [];

  if (!report.businessName.trim()) blockers.push('Missing business name.');
  if (!report.primaryMarket.trim()) blockers.push('Missing primary market.');
  if (!report.category.trim()) blockers.push('Missing business category.');
  if (report.score < 0 || report.score > 100) blockers.push('Score must be between 0 and 100.');
  if (report.findings.length < 5) blockers.push('Paid report needs at least five evidence-backed findings.');
  if (report.assets.length < 4) blockers.push('Paid report needs copy-ready implementation assets.');
  if (report.tracker.length < 5) blockers.push('Paid report needs an implementation tracker.');
  if (report.competitors.some((c) => c.status === 'needed')) {
    blockers.push('To compare Mop Wringers accurately, two named local competitors are still needed.');
  }

  return blockers;
}
