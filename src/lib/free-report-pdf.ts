import type { LeadPageData, ResearchData } from '@/app/report/[leadId]/page';
import { buildQueryThemeGroups, type QueryThemeGroup } from './query-theme-groups';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

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
const BRAND = {
  nearBlackNavy: [2, 6, 23] as [number, number, number],
  deepNavy: [15, 23, 42] as [number, number, number],
  cyanLight: [34, 211, 238] as [number, number, number],
  cyanIce: [224, 247, 250] as [number, number, number],
  warmLinen: [250, 247, 242] as [number, number, number],
  linenDeep: [242, 237, 228] as [number, number, number],
  slateText: [15, 23, 42] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};
const LOGO_JPEG = { path: join(process.cwd(), 'public', 'logo.jpg'), width: 2048, height: 1152 };

type DrawTextOptions = { size?: number; bold?: boolean; color?: [number, number, number] };

type PdfPage = { stream: string[] };
type PdfImage = { name: 'Logo'; data: Buffer; width: number; height: number } | null;

function loadLogoImage(): PdfImage {
  try {
    return { name: 'Logo', data: readFileSync(LOGO_JPEG.path), width: LOGO_JPEG.width, height: LOGO_JPEG.height };
  } catch {
    return null;
  }
}

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

function drawImage(page: PdfPage, name: string, x: number, y: number, w: number, h: number) {
  page.stream.push(`q ${w} 0 0 ${h} ${x} ${y} cm /${name} Do Q`);
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
  drawText(page, title, MARGIN, y, { size: 20, bold: true, color: BRAND.nearBlackNavy });
  drawLine(page, MARGIN, y - 8, MARGIN + 46, y - 8, BRAND.cyanLight, 2.5);
  return y - 34;
}

function drawHeaderLogo(page: PdfPage, logo: PdfImage) {
  if (logo) {
    drawImage(page, logo.name, MARGIN, PAGE_HEIGHT - 67, 118, 66);
  } else {
    drawText(page, 'VizBiz.ai', MARGIN, PAGE_HEIGHT - 42, { size: 18, bold: true, color: BRAND.cyanLight });
  }
}

function newPage(logo: PdfImage): PdfPage {
  const page = { stream: [] as string[] };
  drawRect(page, 0, 0, PAGE_WIDTH, PAGE_HEIGHT, BRAND.warmLinen);
  drawRect(page, 0, PAGE_HEIGHT - 82, PAGE_WIDTH, 82, BRAND.nearBlackNavy);
  drawHeaderLogo(page, logo);
  drawText(page, 'AI visibility intelligence', MARGIN + 136, PAGE_HEIGHT - 38, { size: 10, color: [203, 213, 225] });
  drawText(page, 'Local trust signals · Recommendation readiness', MARGIN + 136, PAGE_HEIGHT - 56, { size: 8, color: [148, 163, 184] });
  drawLine(page, 0, PAGE_HEIGHT - 83, PAGE_WIDTH, PAGE_HEIGHT - 83, BRAND.cyanLight, 1.2);
  drawLine(page, MARGIN, 46, PAGE_WIDTH - MARGIN, 46, [226, 232, 240]);
  drawText(page, 'vizbiz.ai', MARGIN, 28, { size: 9, color: [71, 85, 105] });
  return page;
}

function metricCard(page: PdfPage, metric: FreeReportPdfMetric, x: number, y: number, w: number) {
  drawRect(page, x, y, w, 84, BRAND.cyanIce);
  drawRect(page, x, y + 80, w, 4, BRAND.cyanLight);
  drawText(page, metric.value, x + 16, y + 48, { size: 23, bold: true, color: BRAND.deepNavy });
  drawText(page, metric.label, x + 16, y + 21, { size: 9, bold: true, color: [51, 65, 85] });
}

function buildPages(model: FreeReportPdfModel, logo: PdfImage) {
  const pages: PdfPage[] = [];

  let page = { stream: [] as string[] };
  drawRect(page, 0, 0, PAGE_WIDTH, PAGE_HEIGHT, BRAND.nearBlackNavy);
  drawRect(page, 0, 0, PAGE_WIDTH, 210, BRAND.deepNavy);
  if (logo) drawImage(page, logo.name, MARGIN, 600, 236, 133);
  else drawText(page, 'VizBiz.ai', MARGIN + 20, 642, { size: 26, bold: true, color: BRAND.cyanLight });
  drawText(page, 'BEFORE SNAPSHOT', MARGIN, 554, { size: 10, bold: true, color: BRAND.cyanLight });
  drawText(page, model.title, MARGIN, 508, { size: 34, bold: true, color: BRAND.white });
  drawText(page, model.preparedBeforeLine, MARGIN, 478, { size: 13, color: [207, 250, 254] });
  drawLine(page, MARGIN, 448, MARGIN + 160, 448, BRAND.cyanLight, 3);
  drawText(page, model.businessName, MARGIN, 384, { size: 22, bold: true, color: BRAND.white });
  drawText(page, model.market, MARGIN, 360, { size: 12, color: [203, 213, 225] });
  drawRect(page, MARGIN, 286, PAGE_WIDTH - MARGIN * 2, 52, BRAND.cyanIce);
  drawText(page, `Snapshot date: ${model.snapshotDate}`, MARGIN + 18, 318, { size: 12, bold: true, color: BRAND.deepNavy });
  drawText(page, `Report ID: ${model.shortReportId} · Live report: vizbiz.ai`, MARGIN + 18, 298, { size: 9, color: [51, 65, 85] });
  addWrappedText(page, 'This is the baseline before any VizBiz fix plan, implementation, or monitoring begins. Use it as the before-photo for your 30-day update and future monthly visibility tracking.', MARGIN, 172, 70, { size: 12, color: [226, 232, 240] }, 18);
  pages.push(page);

  page = newPage(logo);
  let y = sectionTitle(page, 'Executive Summary', 674);
  metricCard(page, model.metrics[0], MARGIN, y - 86, 236);
  metricCard(page, model.metrics[1], MARGIN + 260, y - 86, 236);
  metricCard(page, model.metrics[2], MARGIN, y - 182, 236);
  metricCard(page, model.metrics[3], MARGIN + 260, y - 182, 236);
  y -= 235;
  addWrappedText(page, `${model.businessName} appeared in ${model.metrics[1].value} tested AI buyer-style questions. This snapshot is a starting read, not a full implementation plan.`, MARGIN, y, 82, { size: 12, color: [51, 65, 85] }, 18);
  pages.push(page);

  page = newPage(logo);
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

  page = newPage(logo);
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

  page = newPage(logo);
  y = sectionTitle(page, 'What To Do Next', 674);
  for (const step of model.nextSteps) {
    y = addWrappedText(page, `• ${step}`, MARGIN, y, 78, { size: 12, color: [30, 41, 59] }, 18) - 8;
  }
  drawRect(page, MARGIN, 250, PAGE_WIDTH - MARGIN * 2, 154, BRAND.nearBlackNavy);
  drawText(page, model.ctaPrimary, MARGIN + 24, 350, { size: 15, bold: true, color: BRAND.cyanLight });
  drawText(page, model.ctaSecondary, MARGIN + 24, 296, { size: 11, color: [226, 232, 240] });
  addWrappedText(page, `Live report link: ${model.reportUrl}`, MARGIN + 24, 274, 66, { size: 10, color: [203, 213, 225] }, 14);
  pages.push(page);

  return pages;
}

function pdfObject(body: string): Buffer {
  return Buffer.from(`${body}\n`, 'binary');
}

function pdfStreamObject(dict: string, stream: Buffer): Buffer {
  return Buffer.concat([
    Buffer.from(`<< ${dict} /Length ${stream.length} >>\nstream\n`, 'binary'),
    stream,
    Buffer.from('\nendstream\n', 'binary'),
  ], Buffer.byteLength(`<< ${dict} /Length ${stream.length} >>\nstream\n`, 'binary') + stream.length + Buffer.byteLength('\nendstream\n', 'binary'));
}

function buildPdfBuffer(model: FreeReportPdfModel): Buffer {
  const logo = loadLogoImage();
  const pages = buildPages(model, logo);
  const objects: Buffer[] = [];
  objects.push(pdfObject('<< /Type /Catalog /Pages 2 0 R >>'));

  const fontObjStart = 3;
  objects.push(Buffer.from('PAGES_PLACEHOLDER'));
  objects.push(pdfObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'));
  objects.push(pdfObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'));
  const logoObjNo = logo ? objects.length + 1 : null;
  if (logo) {
    objects.push(pdfStreamObject(`/Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode`, logo.data));
  }

  const pageObjNumbers: number[] = [];
  for (const page of pages) {
    const pageObjNo = objects.length + 1;
    const streamObjNo = objects.length + 2;
    pageObjNumbers.push(pageObjNo);
    const xObjectResource = logoObjNo ? ` /XObject << /Logo ${logoObjNo} 0 R >>` : '';
    objects.push(pdfObject(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontObjStart} 0 R /F2 ${fontObjStart + 1} 0 R >>${xObjectResource} >> /Contents ${streamObjNo} 0 R >>`));
    const stream = Buffer.from(page.stream.join('\n'), 'binary');
    objects.push(pdfStreamObject('', stream));
  }

  objects[1] = pdfObject(`<< /Type /Pages /Kids [${pageObjNumbers.map((n) => `${n} 0 R`).join(' ')}] /Count ${pageObjNumbers.length} >>`);
  const infoObjNo = objects.length + 1;
  objects.push(pdfObject(`<< /Title <${utf16Hex(model.title)}> /Author <${utf16Hex('VizBiz.ai')}> /Subject <${utf16Hex(model.preparedBeforeLine)}> /Creator <${utf16Hex('VizBiz.ai')}> >>`));

  const chunks: Buffer[] = [Buffer.from('%PDF-1.7\n%\xE2\xE3\xCF\xD3\n', 'binary')];
  const offsets: number[] = [0];
  let position = chunks[0].length;
  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(position);
    const prefix = Buffer.from(`${i + 1} 0 obj\n`, 'binary');
    const suffix = Buffer.from('endobj\n', 'binary');
    chunks.push(prefix, objects[i], suffix);
    position += prefix.length + objects[i].length + suffix.length;
  }
  const xrefOffset = position;
  let trailer = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i += 1) {
    trailer += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  trailer += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${infoObjNo} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  chunks.push(Buffer.from(trailer, 'binary'));
  return Buffer.concat(chunks);
}

export function renderFreeReportPdf(model: FreeReportPdfModel): { buffer: Buffer; filename: string; contentType: 'application/pdf' } {
  return {
    buffer: buildPdfBuffer(model),
    filename: model.filename,
    contentType: 'application/pdf',
  };
}
