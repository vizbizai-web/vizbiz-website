import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'AI Visibility Report | VizBiz.ai',
  description: 'Comprehensive AI Visibility Intelligence Report',
};

/* ── Types ────────────────────────────────────── */
interface Category {
  name: string;
  score: number;
  description: string;
}

interface Competitor {
  name: string;
  score: number;
  isYou?: boolean;
}

interface ProfitAtRisk {
  low: number;
  high: number;
}

interface Recommendation {
  id: number;
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
}

interface LeadData {
  businessName: string;
  contactName: string;
  location: string;
  website: string;
  aviScore: number;
  totalPrompts: number;
  promptsAppeared: number;
  currencySymbol: string;
  currencyCode: string;
  profitAtRisk: ProfitAtRisk;
  categories: Category[];
  visibleQueries: string[];
  invisibleQueries: string[];
  competitors: Competitor[];
  recommendations: Recommendation[];
}

/* ── Helpers ──────────────────────────────────── */
const getScoreLabel = (score: number): string => {
  if (score >= 60) return 'Strong';
  if (score >= 35) return 'Moderate';
  return 'Weak';
};

const getScoreAccent = (score: number): string => {
  if (score >= 60) return '#22C55E';
  if (score >= 35) return '#F59E0B';
  return '#EF4444';
};

const formatCurrency = (val: number, sym: string): string =>
  sym + Math.round(val).toLocaleString();

/* ── SVG Score Ring Component ─────────────────── */
const ScoreRing = ({ score }: { score: number }) => {
  const radius = 70;
  const stroke = 8;
  const normalized = Math.min(100, Math.max(0, score));
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalized / 100) * circumference;
  const accent = getScoreAccent(score);

  return (
    <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
      {/* Background ring */}
      <circle
        cx="90"
        cy="90"
        r={radius}
        fill="none"
        stroke="#111827"
        strokeWidth={stroke}
      />
      {/* Animated progress ring */}
      <circle
        cx="90"
        cy="90"
        r={radius}
        fill="none"
        stroke={accent}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
      {/* Score number */}
      <text
        x="90"
        y="84"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="44"
        fontWeight="800"
        className="rotate-90"
      >
        {score}
      </text>
      <text
        x="90"
        y="106"
        textAnchor="middle"
        fill="#F5F5F7"
        fontSize="12"
        opacity="0.5"
        className="rotate-90"
      >
        /100
      </text>
    </svg>
  );
};

/* ── Category Bar Component ───────────────────── */
const CategoryBar = ({ category }: { category: Category }) => {
  const accent = getScoreAccent(category.score);
  return (
    <div className="mb-6 last:mb-0">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-[14px] text-[#F5F5F7] font-medium">
          {category.name}
        </span>
        <span
          className="text-[18px] font-bold"
          style={{ color: accent }}
        >
          {category.score}
        </span>
      </div>
      <div className="relative w-full h-[6px] bg-[#0D1B2A] rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{
            width: `${category.score}%`,
            background: `linear-gradient(90deg, ${accent}, ${accent}aa)`,
            transition: 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </div>
      <p className="text-[12px] text-[#F5F5F7]/50 mt-1.5 leading-relaxed">
        {category.description}
      </p>
    </div>
  );
};

/* ── Competitor Bar Chart ────────────────────── */
const CompetitorBar = ({
  competitors,
  totalPrompts,
}: {
  competitors: Competitor[];
  totalPrompts: number;
}) => {
  const maxScore = Math.max(...competitors.map((c) => c.score), 1);

  return (
    <div className="space-y-4">
      {competitors.map((comp, i) => {
        const width = (comp.score / maxScore) * 100;
        const isYou = comp.isYou;
        return (
          <div key={i} className="flex items-center gap-4">
            <div className="w-[160px] text-[13px] text-[#F5F5F7] font-medium truncate">
              {comp.name}
            </div>
            <div className="flex-1 h-[8px] bg-[#0D1B2A] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${width}%`,
                  background: isYou
                    ? 'linear-gradient(90deg, #25D1F2, #06B6D4)'
                    : '#374151',
                  transition: 'width 1s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              />
            </div>
            <div className="w-[40px] text-right text-[13px] font-semibold text-[#F5F5F7]">
              {comp.score}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ── Page ─────────────────────────────────────── */
export default async function ReportPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;

  const LEADS: Record<string, LeadData> = {
    'VZB-MOJSCVQM': {
      businessName: 'The Venue Experts',
      contactName: 'Stacey',
      location: 'Melton Mowbray, UK',
      website: 'thevenueexperts.co.uk',
      aviScore: 42,
      totalPrompts: 20,
      promptsAppeared: 8,
      currencySymbol: '£',
      currencyCode: 'GBP',
      profitAtRisk: { low: 300, high: 900 },
      categories: [
        {
          name: 'Brand Discovery',
          score: 65,
          description:
            'How often you appear when venue owners search for consultancy services',
        },
        {
          name: 'Trust & Reviews',
          score: 50,
          description: 'What AI platforms say about your reputation',
        },
        {
          name: 'Consultancy Visibility',
          score: 35,
          description: 'Whether you appear for venue consultancy queries',
        },
        {
          name: 'Competitive Position',
          score: 40,
          description:
            'How you compare to Kelly Chandler and Kelly Mortimer',
        },
        {
          name: 'Content & Authority',
          score: 30,
          description:
            'Whether AI tools see you as an authority in venue consulting',
        },
      ],
      visibleQueries: [
        'venue consultant UK',
        'wedding venue consultant',
        'venue consultancy services',
      ],
      invisibleQueries: [
        'wedding venue sales training',
        'how to increase wedding bookings',
        'venue profitability consulting',
        'venue marketing strategies',
        'hotel wedding sales consultant',
        'rural venue diversification',
        'venue customer experience training',
        'wedding venue business coach',
        'luxury venue consultant UK',
        'venue sales director',
      ],
      competitors: [
        { name: 'The Venue Experts (You)', score: 8, isYou: true },
        { name: 'Kelly Chandler Consulting', score: 13 },
        { name: 'Kelly Mortimer', score: 15 },
      ],
      recommendations: [
        {
          id: 1,
          title: 'Strengthen venue consultancy content',
          description:
            'Create detailed guides and case studies about venue consultancy services to improve visibility for consultancy-related queries.',
          impact: 'High',
        },
        {
          id: 2,
          title: 'Build trust signals',
          description:
            'Encourage more client testimonials and case studies to improve trust and review scores.',
          impact: 'Medium',
        },
        {
          id: 3,
          title: 'Expand competitive positioning',
          description:
            'Highlight what makes The Venue Experts unique compared to Kelly Chandler and Kelly Mortimer.',
          impact: 'Medium',
        },
      ],
    },
    'VZB-MOKMWAAI': {
      businessName: 'E&A Dance Studio',
      contactName: 'Enrique & Amy',
      location: 'Auckland, NZ',
      website: 'eadancestudiosnz.com',
      aviScore: 28,
      totalPrompts: 20,
      promptsAppeared: 4,
      currencySymbol: 'NZ$',
      currencyCode: 'NZD',
      profitAtRisk: { low: 400, high: 1200 },
      categories: [
        {
          name: 'Brand Discovery',
          score: 35,
          description: 'How often you appear in dance studio searches',
        },
        {
          name: 'Trust & Reviews',
          score: 40,
          description: 'What AI platforms say about your reputation',
        },
        {
          name: 'Class & Booking Visibility',
          score: 15,
          description: 'Whether you appear for class-related queries',
        },
        {
          name: 'Competitive Position',
          score: 20,
          description: 'How you compare to Neverland Studios and Ceroc',
        },
      ],
      visibleQueries: [
        'dance studio Auckland',
        'ballroom dancing classes',
        'Auckland dance lessons',
        'best dance school',
      ],
      invisibleQueries: [
        'wedding dance lessons Auckland',
        'salsa dancing Auckland',
        'kids dance classes',
        'adult dance classes',
        'hip hop dance studio',
        'contemporary dance Auckland',
        'dance studio near me',
        'private dance lessons',
        'dance classes for beginners',
        'latin dance Auckland',
      ],
      competitors: [
        { name: 'E&A Dance Studio (You)', score: 4, isYou: true },
        { name: 'Neverland Studios', score: 12 },
        { name: 'Ceroc French Jive', score: 11 },
        { name: 'Viva Dance', score: 9 },
      ],
      recommendations: [
        {
          id: 1,
          title: 'Improve class booking visibility',
          description:
            'Create specific content about dance classes, booking options, and schedules to appear for class-related queries.',
          impact: 'High',
        },
        {
          id: 2,
          title: 'Expand style-specific content',
          description:
            'Add detailed information about different dance styles offered (ballroom, latin, contemporary) to capture more specific searches.',
          impact: 'High',
        },
        {
          id: 3,
          title: 'Build local reputation signals',
          description:
            'Encourage more reviews and testimonials from Auckland-based students to improve local trust scores.',
          impact: 'Medium',
        },
      ],
    },
    'VZB-MOLHDGJK': {
      businessName: 'ARTWOW',
      contactName: 'Liz',
      location: 'London/Essex, UK',
      website: 'artwow.co',
      aviScore: 89,
      totalPrompts: 19,
      promptsAppeared: 17,
      currencySymbol: '£',
      currencyCode: 'GBP',
      profitAtRisk: { low: 400, high: 1250 },
      categories: [
        {
          name: 'Portfolio & Inquiry Visibility',
          score: 92,
          description: 'How often your products appear in art print searches',
        },
        {
          name: 'Brand Discovery',
          score: 88,
          description: 'Whether AI tools recognize your brand',
        },
        {
          name: 'Trust & Reviews',
          score: 85,
          description: 'What AI platforms say about your quality',
        },
        {
          name: 'Content & Authority',
          score: 82,
          description: 'Whether AI tools see you as an authority',
        },
        {
          name: 'Competitive Position',
          score: 95,
          description:
            'How you compare to Redbubble and Eleanor Bowmer',
        },
      ],
      visibleQueries: [
        'art prints UK',
        'unique wall art',
        'independent artist prints',
        'art gifts UK',
        'homeware art prints',
        'buy art prints online UK',
        'modern art prints',
        'affordable art UK',
      ],
      invisibleQueries: [
        'unique wedding gifts UK',
        'personalized housewarming presents',
        'art prints for living room',
        'best art print marketplace UK',
      ],
      competitors: [
        { name: 'Redbubble', score: 18 },
        { name: 'ARTWOW (You)', score: 17, isYou: true },
        { name: 'Eleanor Bowmer', score: 10 },
      ],
      recommendations: [
        {
          id: 1,
          title: 'Maintain strong portfolio visibility',
          description:
            'Continue showcasing your unique art prints and maintain the strong portfolio presence that is working well.',
          impact: 'Low',
        },
        {
          id: 2,
          title: 'Expand into gift markets',
          description:
            'Create content targeting gift-related searches like wedding gifts and housewarming presents to capture additional market share.',
          impact: 'Medium',
        },
        {
          id: 3,
          title: 'Leverage competitive advantage',
          description:
            'Highlight what makes ARTWOW unique compared to larger marketplaces like Redbubble to maintain your strong competitive position.',
          impact: 'Medium',
        },
      ],
    },
    'VZB-MOO1ESDC': {
      businessName: 'GoalCraft',
      contactName: 'Akchhat',
      location: 'Kapurthala, India',
      website: 'goalcraft.in',
      aviScore: 35,
      totalPrompts: 18,
      promptsAppeared: 6,
      currencySymbol: '₹',
      currencyCode: 'INR',
      profitAtRisk: { low: 5600, high: 45000 },
      categories: [
        {
          name: 'Brand Discovery',
          score: 30,
          description: 'How often you appear in restaurant consulting searches',
        },
        {
          name: 'Trust & Authority',
          score: 25,
          description: 'What AI platforms say about your expertise',
        },
        {
          name: 'Service Offering Visibility',
          score: 40,
          description: 'Whether you appear for Zomato/Swiggy consulting queries',
        },
        {
          name: 'Competitive Position',
          score: 35,
          description: 'How you compare to Restrosol',
        },
        {
          name: 'Content & Authority',
          score: 20,
          description: 'Whether AI tools see you as an authority',
        },
      ],
      visibleQueries: [
        'restaurant consultant India',
        'Zomato optimization',
        'online food delivery consulting',
      ],
      invisibleQueries: [
        'how to increase Zomato orders',
        'Swiggy listing optimization',
        'restaurant menu engineering India',
        'cloud kitchen consultant',
        'restaurant growth consulting',
        'food delivery app optimization',
        'restaurant online order consultant',
      ],
      competitors: [
        { name: 'GoalCraft (You)', score: 6, isYou: true },
        { name: 'Restrosol', score: 9 },
      ],
      recommendations: [
        {
          id: 1,
          title: 'Improve brand discovery',
          description:
            'Create more content about your restaurant consulting services and expertise to appear in more searches.',
          impact: 'High',
        },
        {
          id: 2,
          title: 'Build trust and authority signals',
          description:
            'Showcase client testimonials, case studies, and credentials to improve trust scores.',
          impact: 'High',
        },
        {
          id: 3,
          title: 'Expand service offering visibility',
          description:
            'Create specific content about Zomato and Swiggy optimization services to capture platform-specific searches.',
          impact: 'High',
        },
      ],
    },
    'VZB-MOO57ZGT': {
      businessName: 'Old Touch Spices',
      contactName: 'Chaitanya',
      location: 'Delhi, India',
      website: 'oldtouchspices.com',
      aviScore: 32,
      totalPrompts: 22,
      promptsAppeared: 7,
      currencySymbol: '₹',
      currencyCode: 'INR',
      profitAtRisk: { low: 1400, high: 8600 },
      categories: [
        {
          name: 'Brand Discovery',
          score: 28,
          description: 'How often you appear in spice brand searches',
        },
        {
          name: 'Trust & Reviews',
          score: 35,
          description: 'What AI platforms say about your quality',
        },
        {
          name: 'Product Visibility',
          score: 30,
          description: 'Whether your products appear in spice searches',
        },
        {
          name: 'Competitive Position',
          score: 25,
          description: 'How you compare to Zoff, Catch, and MDH',
        },
        {
          name: 'Content & Authority',
          score: 20,
          description: 'Whether AI tools see you as an authority',
        },
      ],
      visibleQueries: [
        'premium spices online India',
        'quality masala brand',
        'buy spices online Delhi',
      ],
      invisibleQueries: [
        'best masala brand India',
        'premium garam masala',
        'organic spices India',
        'best spice for biryani',
        'whole spices online',
        'spice gift set India',
        'authentic Indian spices online',
        'certified spice brand India',
        'BRCGS certified spices',
      ],
      competitors: [
        { name: 'MDH Masala', score: 20 },
        { name: 'Catch', score: 17 },
        { name: 'Zoff', score: 14 },
        { name: 'Old Touch Spices (You)', score: 7, isYou: true },
      ],
      recommendations: [
        {
          id: 1,
          title: 'Improve brand recognition',
          description:
            'Create more content about your spice brand, quality standards, and unique offerings to appear in more brand searches.',
          impact: 'High',
        },
        {
          id: 2,
          title: 'Expand product visibility',
          description:
            'Add detailed product information, usage guides, and recipes to capture more specific spice-related searches.',
          impact: 'High',
        },
        {
          id: 3,
          title: 'Build competitive differentiation',
          description:
            'Highlight what makes Old Touch Spices unique compared to established brands like MDH, Catch, and Zoff.',
          impact: 'Medium',
        },
      ],
    },
  };

  const leadData = LEADS[leadId];

  if (!leadData) {
    return (
      <div className="min-h-screen bg-[#02091F] text-white font-[Poppins] flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-[#25D1F2] text-[80px] font-extralight mb-4">404</div>
          <h1 className="text-2xl font-bold mb-3">Report not found</h1>
          <p className="text-[#F5F5F7]/50 mb-8 text-[14px]">
            The report you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <a
            href="https://vizbiz.ai"
            className="inline-block bg-[#25D1F2] text-[#02091F] px-8 py-3 text-[14px] font-semibold hover:bg-[#06B6D4] transition-colors"
          >
            Return to VizBiz.ai
          </a>
        </div>
      </div>
    );
  }

  const {
    businessName,
    contactName,
    location,
    aviScore,
    totalPrompts,
    promptsAppeared,
    currencySymbol,
    profitAtRisk,
    categories,
    visibleQueries,
    invisibleQueries,
    competitors,
    recommendations,
  } = leadData;

  const dateGenerated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const competitorsBeating = competitors.filter(
    (c) => !c.isYou && c.score > promptsAppeared
  ).length;

  const gapsFound = invisibleQueries.length;

  /* ── Subtle noise texture SVG ── */
  const noiseSvg = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E`;

  return (
    <div className="min-h-screen bg-[#02091F] text-white font-[Poppins] antialiased">
      {/* Noise overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50"
        style={{
          backgroundImage: `url("${noiseSvg}")`,
          backgroundRepeat: 'repeat',
          opacity: 0.6,
        }}
      />

      {/* ── 1. Header ── */}
      <header className="relative z-10 border-b border-[#25D1F2]/8">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-[64px]">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo.jpg"
                alt="VizBiz.ai"
                width={28}
                height={28}
                className="rounded-sm"
              />
              <span className="text-[14px] font-semibold tracking-tight">
                VizBiz<span className="text-[#25D1F2]">.ai</span>
              </span>
            </div>
            <div className="hidden md:block text-center">
              <div className="text-[11px] uppercase tracking-[0.15em] text-[#F5F5F7]/40 font-medium">
                AI Visibility Report
              </div>
            </div>
            <div className="text-right">
              <div className="text-[13px] font-medium text-[#F5F5F7]">
                {businessName}
              </div>
              <div className="text-[11px] text-[#F5F5F7]/40">
                {dateGenerated}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── 2. Hero Score Card ── */}
      <section className="relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#22D3EE]/10 via-transparent to-[#06B6D4]/5" />
        <div className="relative max-w-[1200px] mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            {/* Left: score + label */}
            <div className="lg:col-span-2 flex flex-col items-start">
              <div className="text-[11px] uppercase tracking-[0.2em] text-[#F5F5F7]/40 font-medium mb-4">
                Your AI Visibility Score
              </div>
              <div className="flex items-center gap-6 mb-6">
                <ScoreRing score={aviScore} />
                <div>
                  <div
                    className="text-[13px] font-semibold uppercase tracking-wider"
                    style={{ color: getScoreAccent(aviScore) }}
                  >
                    {getScoreLabel(aviScore)}
                  </div>
                  <div className="text-[11px] text-[#F5F5F7]/30 mt-1">
                    Benchmark: 60+
                  </div>
                </div>
              </div>
            </div>

            {/* Right: stat pills */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#111118]/60 backdrop-blur-sm border border-[#25D1F2]/8 rounded-xl px-5 py-5 text-center">
                  <div className="text-[28px] font-bold text-[#25D1F2]">
                    {promptsAppeared}
                    <span className="text-[14px] text-[#F5F5F7]/30">
                      /{totalPrompts}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#F5F5F7]/40 mt-1 uppercase tracking-wider">
                    Prompts appeared
                  </div>
                </div>
                <div className="bg-[#111118]/60 backdrop-blur-sm border border-[#25D1F2]/8 rounded-xl px-5 py-5 text-center">
                  <div className="text-[28px] font-bold text-[#EF4444]">
                    {competitorsBeating}
                  </div>
                  <div className="text-[11px] text-[#F5F5F7]/40 mt-1 uppercase tracking-wider">
                    Competitors ahead
                  </div>
                </div>
                <div className="bg-[#111118]/60 backdrop-blur-sm border border-[#25D1F2]/8 rounded-xl px-5 py-5 text-center">
                  <div className="text-[28px] font-bold text-[#F59E0B]">
                    {gapsFound}
                  </div>
                  <div className="text-[11px] text-[#F5F5F7]/40 mt-1 uppercase tracking-wider">
                    Gaps found
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Profit at Risk ── */}
      <section className="relative z-10 py-16 lg:py-24 bg-[#0A0F1E]">
        <div className="max-w-[720px] mx-auto px-6 lg:px-8 text-center">
          <div className="text-[11px] uppercase tracking-[0.2em] text-[#EF4444]/60 font-medium mb-4">
            Estimated Impact
          </div>
          <div className="text-[48px] lg:text-[64px] font-extralight tracking-tight mb-3 leading-none">
            <span className="text-[#25D1F2]">
              {formatCurrency(profitAtRisk.low, currencySymbol)}
            </span>
            <span className="text-[#F5F5F7]/20 mx-2">—</span>
            <span className="text-[#25D1F2]">
              {formatCurrency(profitAtRisk.high, currencySymbol)}
            </span>
            <span className="text-[#F5F5F7]/30 text-[18px] font-normal ml-2">
              /mo
            </span>
          </div>
          <p className="text-[14px] text-[#F5F5F7]/40 max-w-[480px] mx-auto leading-relaxed">
            This is the estimated profit going to competitors who appear in AI
            recommendations when your business does not. It is based on your
            industry, location, and competitive landscape.
          </p>
        </div>
      </section>

      {/* ── 4. Category Breakdown ── */}
      <section className="relative z-10 py-16 lg:py-24">
        <div className="max-w-[720px] mx-auto px-6 lg:px-8">
          <div className="text-[11px] uppercase tracking-[0.2em] text-[#F5F5F7]/30 font-medium mb-10">
            Category Breakdown
          </div>
          {categories.map((cat, i) => (
            <CategoryBar key={i} category={cat} />
          ))}
        </div>
      </section>

      {/* ── 5. Visibility Map ── */}
      <section className="relative z-10 py-16 lg:py-24 bg-[#0A0F1E]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="text-[11px] uppercase tracking-[0.2em] text-[#F5F5F7]/30 font-medium mb-10">
            Visibility Map
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Visible */}
            <div className="bg-[#111118]/60 backdrop-blur-sm border border-[#22C55E]/10 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
                <h3 className="text-[13px] font-semibold text-[#22C55E] uppercase tracking-wider">
                  Where you appear
                </h3>
                <span className="text-[11px] text-[#F5F5F7]/20 ml-auto">
                  {visibleQueries.length}
                </span>
              </div>
              <ul className="space-y-2.5">
                {visibleQueries.map((q, i) => (
                  <li
                    key={i}
                    className="text-[13px] text-[#F5F5F7]/70 pl-4 border-l border-[#22C55E]/20"
                  >
                    {q}
                  </li>
                ))}
              </ul>
            </div>

            {/* Invisible */}
            <div className="bg-[#111118]/60 backdrop-blur-sm border border-[#EF4444]/10 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
                <h3 className="text-[13px] font-semibold text-[#EF4444] uppercase tracking-wider">
                  Where you&apos;re invisible
                </h3>
                <span className="text-[11px] text-[#F5F5F7]/20 ml-auto">
                  {invisibleQueries.length}
                </span>
              </div>
              <ul className="space-y-2.5">
                {invisibleQueries.map((q, i) => (
                  <li
                    key={i}
                    className="text-[13px] text-[#F5F5F7]/40 pl-4 border-l border-[#EF4444]/10"
                  >
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Competitor Comparison ── */}
      <section className="relative z-10 py-16 lg:py-24">
        <div className="max-w-[720px] mx-auto px-6 lg:px-8">
          <div className="text-[11px] uppercase tracking-[0.2em] text-[#F5F5F7]/30 font-medium mb-10">
            Competitor Comparison
          </div>
          <CompetitorBar
            competitors={competitors}
            totalPrompts={totalPrompts}
          />
        </div>
      </section>

      {/* ── 7. Pricing ── */}
      <section className="relative z-10 py-16 lg:py-24 bg-[#0A0F1E]">
        <div className="max-w-[920px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-[11px] uppercase tracking-[0.2em] text-[#F5F5F7]/30 font-medium mb-3">
              Pricing
            </div>
            <h2 className="text-[28px] lg:text-[36px] font-extralight leading-tight">
              We found {recommendations.length} specific gaps costing you
              visibility
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[800px] mx-auto">
            {/* Fix */}
            <div className="bg-[#111118]/60 backdrop-blur-sm border border-[#25D1F2]/10 rounded-xl p-8 hover:border-[#25D1F2]/25 transition-colors">
              <div className="text-[11px] uppercase tracking-[0.2em] text-[#25D1F2] font-medium mb-4">
                Fix
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-[36px] font-light">$299</span>
                <span className="text-[13px] text-[#F5F5F7]/30">/mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Full AI visibility audit (80+ queries)',
                  'We implement every fix for you',
                  'Monthly re-audit included',
                ].map((item, i) => (
                  <li
                    key={i}
                    className="text-[13px] text-[#F5F5F7]/60 flex items-start gap-3"
                  >
                    <span className="text-[#25D1F2] mt-0.5">—</span>
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:alex@vizbiz.ai"
                className="block w-full text-center bg-[#25D1F2] text-[#02091F] py-3 text-[13px] font-semibold hover:bg-[#06B6D4] transition-colors rounded-lg"
              >
                Get Started
              </a>
            </div>

            {/* Fix + Monitor */}
            <div className="relative bg-[#111118]/80 backdrop-blur-sm border border-[#25D1F2]/30 rounded-xl p-8">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#22D3EE] to-[#06B6D4] text-[#02091F] px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Most Popular
              </div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-[#25D1F2] font-medium mb-4">
                Fix + Monitor
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-[36px] font-light">$499</span>
                <span className="text-[13px] text-[#F5F5F7]/30">/mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Fix',
                  'Competitor tracking',
                  'Ongoing optimization as AI tools change',
                  'Priority support',
                ].map((item, i) => (
                  <li
                    key={i}
                    className="text-[13px] text-[#F5F5F7]/80 flex items-start gap-3"
                  >
                    <span className="text-[#25D1F2] mt-0.5">—</span>
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:alex@vizbiz.ai"
                className="block w-full text-center bg-gradient-to-r from-[#22D3EE] to-[#06B6D4] text-white py-3 text-[13px] font-semibold hover:opacity-90 transition-opacity rounded-lg"
              >
                Get Started
              </a>
            </div>
          </div>

          <p className="text-center text-[11px] text-[#F5F5F7]/20 mt-8">
            Both plans include the full audit report. Cancel anytime. No setup
            fee.
          </p>
        </div>
      </section>

      {/* ── 8. Bottom CTA ── */}
      <section className="relative z-10 py-16 text-center">
        <div className="max-w-[600px] mx-auto px-6 lg:px-8">
          <h3 className="text-[22px] font-light mb-3">
            Prefer to talk first?
          </h3>
          <p className="text-[13px] text-[#F5F5F7]/40 mb-8">
            Book a free 15-minute audit review call. No pressure, no
            obligation.
          </p>
          <a
            href="mailto:alex@vizbiz.ai"
            className="inline-block border border-[#25D1F2]/30 text-[#25D1F2] px-8 py-3 text-[13px] font-medium hover:bg-[#25D1F2]/10 transition-colors rounded-lg"
          >
            Book a Free Call
          </a>
        </div>
      </section>

      {/* ── 9. Footer ── */}
      <footer className="relative z-10 border-t border-[#25D1F2]/8 py-10">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Image
              src="/logo.jpg"
              alt="VizBiz.ai"
              width={22}
              height={22}
              className="rounded-sm"
            />
            <span className="text-[14px] font-semibold">
              VizBiz<span className="text-[#25D1F2]">.ai</span>
            </span>
          </div>
          <p className="text-[11px] text-[#F5F5F7]/20">
            Generated by VizBiz.ai — AI Visibility Intelligence
          </p>
          <a
            href="https://vizbiz.ai"
            className="text-[11px] text-[#25D1F2]/50 hover:text-[#25D1F2] transition-colors"
          >
            vizbiz.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
