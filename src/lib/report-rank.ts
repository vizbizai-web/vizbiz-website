export interface ReportRankCompetitor {
  name: string;
  score: number;
  isYou?: boolean;
  isYours?: boolean;
}

export interface ReportRankDisplay {
  rank: number | null;
  value: string;
  label: string;
  colorState: 'positive' | 'negative' | 'neutral';
  yourScore: number;
}

/**
 * Returns a client-safe rank display for AI visibility reports.
 *
 * Critical rule: a business with zero appearances is not "#1" just because
 * every other measured/placeholder row also has zero. Zero presence means not
 * ranked / not visible, not first place.
 */
export function getReportRankDisplay(competitors: ReportRankCompetitor[], options: { clientOnly?: boolean } = {}): ReportRankDisplay {
  const you = competitors.find((competitor) => competitor.isYou);
  const yourScore = Math.max(0, you?.score ?? 0);

  if (options.clientOnly || competitors.length <= 1) {
    return {
      rank: null,
      value: 'Client-only',
      label: 'Benchmark',
      colorState: 'neutral',
      yourScore,
    };
  }

  if (!you || yourScore <= 0) {
    return {
      rank: null,
      value: 'Not ranked',
      label: 'AI Presence',
      colorState: 'negative',
      yourScore,
    };
  }

  const betterVisibleCompetitors = competitors.filter((competitor) => {
    if (competitor.isYou) return false;
    return Math.max(0, competitor.score ?? 0) > yourScore;
  }).length;

  const rank = betterVisibleCompetitors + 1;

  return {
    rank,
    value: `#${rank}`,
    label: 'Your Rank',
    colorState: rank === 1 ? 'positive' : 'negative',
    yourScore,
  };
}
