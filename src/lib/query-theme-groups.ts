export type QueryThemeGroup = {
  key: string;
  label: string;
  count: number;
  example: string;
  rawExamples: string[];
};

type PromptInput = {
  businessName?: string;
  location?: string;
  nicheLabel?: string;
};

const stripAccents = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function normalize(value: string): string {
  return stripAccents(value || '')
    .toLowerCase()
    .replace(/https?:\/\//g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(mejor|mejores|best|top|rated|reputable|trusted|near|nearby|in|en|the|a|an|is|are|que|qué|donde|dónde|tengo|problema|necesito|solucion|solución|confiable)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function looksSpanish(prompt: string): boolean {
  return /\b(mejor|mejores|servicios|tengo|necesito|soluci[oó]n|confiable|cl[ií]nica|veterinaria|recomiendas|qu[eé])\b/i.test(prompt);
}

function extractLocation(prompt: string, fallback?: string): string {
  const match = prompt.match(/\b(?:in|en)\s+([^?.,]+)$/i);
  const value = (match?.[1] || fallback || '').trim();
  return value || 'your area';
}

function cleanServicePhrase(prompt: string, location: string): string {
  const locationPattern = location ? new RegExp(`\\s+(?:in|en)\\s+${location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i') : /\s+(?:in|en)\s+[^?.,]+$/i;
  return prompt
    .replace(locationPattern, '')
    .replace(/^\s*(mejor(?:es)?|best|top[- ]rated|recommended)\s+/i, '')
    .replace(/^\s*tengo un problema con\s+/i, '')
    .replace(/,?\s*y necesito una soluci[oó]n confiable\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function humanizePrompt(prompt: string, input: PromptInput, key: string): string {
  const businessName = (input.businessName || '').trim();
  const location = extractLocation(prompt, input.location);
  const spanish = looksSpanish(prompt);
  const service = cleanServicePhrase(prompt, location);

  if (key === 'reputation') {
    return spanish
      ? `¿${businessName || 'este negocio'} tiene buena reputación?`
      : `Is ${businessName || 'this business'} reputable?`;
  }

  if (key === 'brand') {
    return businessName && location ? `${businessName} ${location}` : prompt.trim();
  }

  if (key === 'urgent_trust') {
    return spanish
      ? `Necesito una solución confiable para ${service.toLowerCase()} en ${location}. ¿A quién me recomiendas?`
      : `I need a trustworthy option for ${service.toLowerCase()} in ${location}. Who should I choose?`;
  }

  if (spanish) {
    if (/servicios veterinarios/i.test(service)) {
      return `¿Qué clínicas veterinarias en ${location} ofrecen consulta general, exámenes, hospitalización y farmacia?`;
    }
    return `¿Qué negocios en ${location} recomiendan para ${service.toLowerCase()}?`;
  }

  return `Which businesses in ${location} are recommended for ${service.toLowerCase()}?`;
}

function classifyPrompt(prompt: string, input: PromptInput): { key: string; label: string } {
  const normalizedPrompt = normalize(prompt);
  const normalizedBusiness = normalize(input.businessName || '');
  const spanish = looksSpanish(prompt);

  if (normalizedBusiness && normalizedPrompt.includes(normalizedBusiness)) {
    if (/reputable|review|rating|trusted|trust|buena reputaci[oó]n|reputaci[oó]n/i.test(prompt)) {
      return { key: 'reputation', label: spanish ? 'Reputación y confianza' : 'Reputation and trust checks' };
    }
    return { key: 'brand', label: spanish ? 'Búsquedas directas de marca' : 'Direct brand searches' };
  }

  if (/reputable|review|rating|trusted|trust|buena reputaci[oó]n|reputaci[oó]n/i.test(prompt)) {
    return { key: 'reputation', label: spanish ? 'Reputación y confianza' : 'Reputation and trust checks' };
  }

  if (/tengo un problema|necesito|confiable|emergency|urgent|near me now|tonight/i.test(prompt)) {
    return { key: 'urgent_trust', label: spanish ? 'Necesidad confiable / urgente' : 'Trust-driven need searches' };
  }

  return { key: 'service_category', label: spanish ? 'Servicios y categoría local' : 'Service/category searches' };
}

export function buildQueryThemeGroups(prompts: string[], input: PromptInput = {}): QueryThemeGroup[] {
  const groups = new Map<string, QueryThemeGroup>();
  const seenRaw = new Set<string>();

  for (const rawPrompt of prompts || []) {
    const prompt = (rawPrompt || '').trim();
    if (!prompt) continue;
    const rawKey = normalize(prompt);
    if (!rawKey) continue;
    // Preserve frequency but avoid identical raw lines taking over example lists.
    const { key, label } = classifyPrompt(prompt, input);
    const current = groups.get(key) || { key, label, count: 0, example: humanizePrompt(prompt, input, key), rawExamples: [] };
    current.count += 1;
    if (!seenRaw.has(`${key}:${rawKey}`) && current.rawExamples.length < 3) {
      current.rawExamples.push(prompt);
      seenRaw.add(`${key}:${rawKey}`);
    }
    if (!current.example || current.example.length > humanizePrompt(prompt, input, key).length + 30) {
      current.example = humanizePrompt(prompt, input, key);
    }
    groups.set(key, current);
  }

  const order = ['service_category', 'urgent_trust', 'reputation', 'brand'];
  return Array.from(groups.values()).sort((a, b) => {
    const countDelta = b.count - a.count;
    if (countDelta !== 0) return countDelta;
    return (order.indexOf(a.key) === -1 ? 99 : order.indexOf(a.key)) - (order.indexOf(b.key) === -1 ? 99 : order.indexOf(b.key));
  });
}
