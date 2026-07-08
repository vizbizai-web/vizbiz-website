import type { LeadPageData, ResearchData } from '@/app/report/[leadId]/page';
import { buildQueryThemeGroups, type QueryThemeGroup } from './query-theme-groups';

export type FreeReportPdfMetric = { label: string; value: string };

export type FreeReportPdfModel = {
  brand: 'VizBiz.ai';
  title: string;
  preparedBeforeLine: string;
  snapshotDate: string;
  generatedAtIso: string;
  businessName: string;
  market: string;
  shortReportId: string;
  metrics: FreeReportPdfMetric[];
  appearedThemes: QueryThemeGroup[];
  invisibleThemes: QueryThemeGroup[];
  localTrust: string[];
  competitorBenchmarks: string[];
  nextSteps: string[];
  ctaPrimary: string;
  ctaSecondary: string;
  reportUrl: string;
  filename: string;
};

type BuildPdfInput = {
  leadId: string;
  leadData: LeadPageData;
  researchData: ResearchData;
  now?: Date;
};

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function asciiSlug(value: string) {
  return (value || 'report')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 54) || 'report';
}

function ratingLine(name: string, rating: number | null | undefined, reviews: number | null | undefined) {
  const ratingText = typeof rating === 'number' ? `${rating}⭐` : 'Rating unavailable';
  const reviewText = typeof reviews === 'number' ? `${reviews} reviews` : 'review count unavailable';
  return `${name} — ${ratingText}, ${reviewText}`;
}

export function buildFreeReportPdfModel(input: BuildPdfInput): FreeReportPdfModel {
  const { leadId, leadData, researchData } = input;
  const now = input.now || new Date();
  const total = Math.max(researchData.totalPrompts || researchData.promptResults.length || 0, 1);
  const appeared = Math.max(0, researchData.appearedCount || 0);
  const score = Math.round((appeared / total) * 100);
  const gap = Math.max(0, 100 - score);
  const visiblePrompts = (researchData.promptResults || []).filter((row) => row.businessAppeared).map((row) => row.prompt);
  const invisiblePrompts = (researchData.promptResults || []).filter((row) => !row.businessAppeared).map((row) => row.prompt);
  const themeInput = { businessName: researchData.businessName || leadData.businessName, location: researchData.city || leadData.location, nicheLabel: researchData.nicheLabel || researchData.niche };
  const gpe = researchData.googlePlaceEnrichment;
  const localTrust = [
    `Google rating: ${typeof gpe?.rating === 'number' ? gpe.rating : 'not verified'}`,
    `Google reviews: ${typeof gpe?.userReviewCount === 'number' ? gpe.userReviewCount : 'not verified'}`,
    `Google profile: ${gpe?.validationStatus === 'validated' || gpe?.confidence === 'high' ? 'found and matched' : 'needs review'}`,
    `Trust score: ${typeof researchData.localEntityTrustScore === 'number' ? `${researchData.localEntityTrustScore}/100` : 'not scored in this snapshot'}`,
  ];
  const competitorBenchmarks = (researchData.competitorValidations || [])
    .slice(0, 2)
    .map((competitor) => ratingLine(competitor.name, competitor.rating, competitor.userReviewCount));

  return {
    brand: 'VizBiz.ai',
    title: 'AI Visibility Before Snapshot',
    preparedBeforeLine: 'Prepared before optimization work began',
    snapshotDate: formatDate(now),
    generatedAtIso: now.toISOString(),
    businessName: researchData.businessName || leadData.businessName,
    market: researchData.city || leadData.location || 'Local market',
    shortReportId: leadId.slice(0, 8),
    metrics: [
      { label: 'Snapshot Visibility Score', value: `${score}/100` },
      { label: 'AI appearances', value: `${appeared}/${total}` },
      { label: 'Visibility gap', value: `${gap}%` },
      { label: 'Snapshot status', value: researchData.statusBand || leadData.visibilityBand || 'Recorded' },
    ],
    appearedThemes: buildQueryThemeGroups(visiblePrompts, themeInput).slice(0, 4),
    invisibleThemes: buildQueryThemeGroups(invisiblePrompts, themeInput).slice(0, 3),
    localTrust,
    competitorBenchmarks: competitorBenchmarks.length ? competitorBenchmarks : ['Competitor benchmark available in the full report when competitors are supplied.'],
    nextSteps: [
      'Use this dated PDF as the baseline before any VizBiz fix plan, implementation, or monitoring begins.',
      'The full report expands the test, prioritizes exact fixes, and includes one 30-day re-test/update.',
      'Monthly monitoring tracks movement, competitor changes, and new recommendation gaps over time.',
    ],
    ctaPrimary: 'Get the Full Report + Fix Plan + 30-Day Update — $88',
    ctaSecondary: 'Monthly Growth Plan — $188/mo for ongoing monitoring',
    reportUrl: `https://vizbiz.ai/report/${encodeURIComponent(leadId)}/`,
    filename: `vizbiz-before-snapshot-${asciiSlug(researchData.businessName || leadData.businessName)}-${asciiSlug(leadId).slice(0, 9)}.pdf`,
  };
}

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 54;

type DrawTextOptions = { size?: number; bold?: boolean; color?: [number, number, number] };

type PdfPage = { stream: string[] };

function rgb([r, g, b]: [number, number, number]) {
  return `${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)}`;
}

function utf16Hex(text: string) {
  const encoded = Buffer.from(`\uFEFF${text}`, 'utf16le');
  for (let i = 0; i < encoded.length; i += 2) {
    const first = encoded[i];
    encoded[i] = encoded[i + 1];
    encoded[i + 1] = first;
  }
  return encoded.toString('hex').toUpperCase();
}

function pdfLiteral(text: string) {
  const normalized = String(text || '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/•/g, '-')
    .replace(/⭐/g, ' stars')
    .replace(/✅/g, 'validated')
    .replace(/⚠️?/g, 'review')
    .split('')
    .map((char) => char.charCodeAt(0) <= 255 ? char : '?')
    .join('');
  return `(${normalized.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')})`;
}

function drawText(page: PdfPage, text: string, x: number, y: number, options: DrawTextOptions = {}) {
  const size = options.size || 11;
  const font = options.bold ? 'F2' : 'F1';
  const color = rgb(options.color || [15, 23, 42]);
  page.stream.push(`BT /${font} ${size} Tf ${color} rg 1 0 0 1 ${x} ${y} Tm ${pdfLiteral(text)} Tj ET`);
}

function drawRect(page: PdfPage, x: number, y: number, w: number, h: number, color: [number, number, number]) {
  page.stream.push(`${rgb(color)} rg ${x} ${y} ${w} ${h} re f`);
}

function drawLine(page: PdfPage, x1: number, y1: number, x2: number, y2: number, color: [number, number, number] = [34, 211, 238], width = 1) {
  page.stream.push(`${rgb(color)} RG ${width} w ${x1} ${y1} m ${x2} ${y2} l S`);
}

function wrapText(text: string, maxChars: number) {
  const words = String(text || '').replace(/\s+/g, ' ').trim().split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function addWrappedText(page: PdfPage, text: string, x: number, y: number, maxChars: number, options: DrawTextOptions = {}, lineHeight = 15) {
  let cursor = y;
  for (const line of wrapText(text, maxChars)) {
    drawText(page, line, x, cursor, options);
    cursor -= lineHeight;
  }
  return cursor;
}

function sectionTitle(page: PdfPage, title: string, y: number) {
  drawText(page, title, MARGIN, y, { size: 20, bold: true, color: [2, 6, 23] });
  drawLine(page, MARGIN, y - 8, MARGIN + 40, y - 8, [34, 211, 238], 2);
  return y - 34;
}

function newPage(): PdfPage {
  const page = { stream: [] as string[] };
  drawRect(page, 0, 0, PAGE_WIDTH, PAGE_HEIGHT, [248, 250, 252]);
  drawRect(page, 0, PAGE_HEIGHT - 72, PAGE_WIDTH, 72, [2, 6, 23]);
  drawText(page, 'VizBiz.ai', MARGIN, PAGE_HEIGHT - 44, { size: 18, bold: true, color: [34, 211, 238] });
  drawText(page, 'AI visibility, local trust signals, and recommendation readiness', MARGIN + 92, PAGE_HEIGHT - 44, { size: 9, color: [203, 213, 225] });
  drawLine(page, MARGIN, 46, PAGE_WIDTH - MARGIN, 46, [226, 232, 240]);
  drawText(page, 'vizbiz.ai', MARGIN, 28, { size: 9, color: [71, 85, 105] });
  return page;
}

function metricCard(page: PdfPage, metric: FreeReportPdfMetric, x: number, y: number, w: number) {
  drawRect(page, x, y, w, 76, [255, 255, 255]);
  drawLine(page, x, y + 76, x + w, y + 76, [34, 211, 238], 2);
  drawText(page, metric.value, x + 14, y + 43, { size: 22, bold: true, color: [2, 6, 23] });
  drawText(page, metric.label, x + 14, y + 19, { size: 9, color: [71, 85, 105] });
}

function buildPages(model: FreeReportPdfModel) {
  const pages: PdfPage[] = [];

  let page = newPage();
  drawText(page, model.title, MARGIN, 650, { size: 30, bold: true, color: [2, 6, 23] });
  drawText(page, model.preparedBeforeLine, MARGIN, 620, { size: 13, color: [6, 182, 212] });
  drawText(page, model.businessName, MARGIN, 560, { size: 22, bold: true, color: [15, 23, 42] });
  drawText(page, model.market, MARGIN, 536, { size: 13, color: [71, 85, 105] });
  drawText(page, `Snapshot date: ${model.snapshotDate}`, MARGIN, 500, { size: 12, bold: true, color: [15, 23, 42] });
  drawText(page, `Report ID: ${model.shortReportId}`, MARGIN, 480, { size: 10, color: [100, 116, 139] });
  addWrappedText(page, 'This free snapshot records what AI-search systems surfaced before any VizBiz fix plan, implementation, or monitoring began. Keep it as the baseline for future before/after comparison.', MARGIN, 430, 78, { size: 12, color: [51, 65, 85] }, 18);
  pages.push(page);

  page = newPage();
  let y = sectionTitle(page, 'Executive Summary', 674);
  metricCard(page, model.metrics[0], MARGIN, y - 86, 236);
  metricCard(page, model.metrics[1], MARGIN + 260, y - 86, 236);
  metricCard(page, model.metrics[2], MARGIN, y - 182, 236);
  metricCard(page, model.metrics[3], MARGIN + 260, y - 182, 236);
  y -= 235;
  addWrappedText(page, `${model.businessName} appeared in ${model.metrics[1].value} tested AI buyer-style questions. This snapshot is a starting read, not a full implementation plan.`, MARGIN, y, 82, { size: 12, color: [51, 65, 85] }, 18);
  pages.push(page);

  page = newPage();
  y = sectionTitle(page, 'Query Findings Summary', 674);
  drawText(page, 'Where You Appear', MARGIN, y, { size: 14, bold: true, color: [15, 23, 42] });
  y -= 28;
  for (const theme of model.appearedThemes) {
    drawText(page, `${theme.label} — ${theme.count} mentions`, MARGIN, y, { size: 11, bold: true, color: [15, 23, 42] });
    y = addWrappedText(page, `Example: “${theme.example}”`, MARGIN + 16, y - 16, 76, { size: 10, color: [71, 85, 105] }, 14) - 12;
  }
  y -= 8;
  drawText(page, 'Where You’re Invisible', MARGIN, y, { size: 14, bold: true, color: [15, 23, 42] });
  y -= 28;
  for (const theme of model.invisibleThemes) {
    drawText(page, `${theme.label} — ${theme.count} missed`, MARGIN, y, { size: 11, bold: true, color: [15, 23, 42] });
    y = addWrappedText(page, `Example: “${theme.example}”`, MARGIN + 16, y - 16, 76, { size: 10, color: [71, 85, 105] }, 14) - 12;
  }
  pages.push(page);

  page = newPage();
  y = sectionTitle(page, 'Local Trust Snapshot', 674);
  for (const line of model.localTrust) {
    drawText(page, `• ${line}`, MARGIN, y, { size: 12, color: [30, 41, 59] });
    y -= 22;
  }
  y -= 18;
  drawText(page, 'Competitor Benchmarks', MARGIN, y, { size: 14, bold: true, color: [15, 23, 42] });
  y -= 30;
  for (const competitor of model.competitorBenchmarks) {
    drawText(page, `• ${competitor}`, MARGIN, y, { size: 12, color: [30, 41, 59] });
    y -= 22;
  }
  y -= 20;
  addWrappedText(page, 'Public rating, review volume, profile consistency, and proof signals help customers and AI systems understand whether a local business looks credible and active.', MARGIN, y, 78, { size: 11, color: [71, 85, 105] }, 16);
  pages.push(page);

  page = newPage();
  y = sectionTitle(page, 'What To Do Next', 674);
  for (const step of model.nextSteps) {
    y = addWrappedText(page, `• ${step}`, MARGIN, y, 78, { size: 12, color: [30, 41, 59] }, 18) - 8;
  }
  drawRect(page, MARGIN, 260, PAGE_WIDTH - MARGIN * 2, 136, [2, 6, 23]);
  drawText(page, model.ctaPrimary, MARGIN + 24, 350, { size: 16, bold: true, color: [34, 211, 238] });
  drawText(page, model.ctaSecondary, MARGIN + 24, 322, { size: 11, color: [226, 232, 240] });
  addWrappedText(page, `Live report link: ${model.reportUrl}`, MARGIN + 24, 294, 66, { size: 10, color: [203, 213, 225] }, 14);
  pages.push(page);

  return pages;
}

function pdfObject(body: string) {
  return `${body}\n`;
}

function buildPdfBuffer(model: FreeReportPdfModel): Buffer {
  const pages = buildPages(model);
  const objects: string[] = [];
  objects.push(pdfObject('<< /Type /Catalog /Pages 2 0 R >>'));

  const fontObjStart = 3;
  objects.push('PAGES_PLACEHOLDER');
  objects.push(pdfObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'));
  objects.push(pdfObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'));

  const pageObjNumbers: number[] = [];
  for (const page of pages) {
    const pageObjNo = objects.length + 1;
    const streamObjNo = objects.length + 2;
    pageObjNumbers.push(pageObjNo);
    objects.push(pdfObject(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontObjStart} 0 R /F2 ${fontObjStart + 1} 0 R >> >> /Contents ${streamObjNo} 0 R >>`));
    const stream = page.stream.join('\n');
    objects.push(pdfObject(`<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`));
  }

  objects[1] = pdfObject(`<< /Type /Pages /Kids [${pageObjNumbers.map((n) => `${n} 0 R`).join(' ')}] /Count ${pageObjNumbers.length} >>`);
  const infoObjNo = objects.length + 1;
  objects.push(pdfObject(`<< /Title <${utf16Hex(model.title)}> /Author <${utf16Hex('VizBiz.ai')}> /Subject <${utf16Hex(model.preparedBeforeLine)}> /Creator <${utf16Hex('VizBiz.ai')}> >>`));

  let pdf = '%PDF-1.7\n%\xE2\xE3\xCF\xD3\n';
  const offsets: number[] = [0];
  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(Buffer.byteLength(pdf, 'binary'));
    pdf += `${i + 1} 0 obj\n${objects[i]}endobj\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf, 'binary');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${infoObjNo} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, 'binary');
}

export function renderFreeReportPdf(model: FreeReportPdfModel): { buffer: Buffer; filename: string; contentType: 'application/pdf' } {
  return {
    buffer: buildPdfBuffer(model),
    filename: model.filename,
    contentType: 'application/pdf',
  };
}
