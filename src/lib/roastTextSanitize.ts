/**
 * Reduces repetitive phrasing in roast copy (client-side polish; paid feature UX).
 * — Deduplicates identical sentences (case-insensitive).
 * — Deduplicates repeated paragraphs.
 * — Collapses stuttered repeats of the same word (4+ chars), e.g. "really really really".
 */
export function sanitizeRoastText(input: string): string {
  if (!input.trim()) return input;

  let s = input.replace(/\r\n/g, '\n').trim();

  const paras = s
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const seenPara = new Set<string>();
  const uniqueParas: string[] = [];
  for (const p of paras) {
    const k = p.toLowerCase().replace(/\s+/g, ' ');
    if (seenPara.has(k)) continue;
    seenPara.add(k);
    uniqueParas.push(p);
  }
  s = uniqueParas.join('\n\n');

  const outParas = s.split(/\n\n/).map((para) => dedupeSentences(para));
  s = outParas.join('\n\n');

  s = collapseStutteredWords(s);

  return s.trim();
}

function dedupeSentences(block: string): string {
  const parts = block
    .split(/(?<=[.!?])\s+/)
    .map((x) => x.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  const kept: string[] = [];
  for (const p of parts) {
    const k = p.toLowerCase().replace(/\s+/g, ' ');
    if (k.length < 4) {
      kept.push(p);
      continue;
    }
    if (seen.has(k)) continue;
    seen.add(k);
    kept.push(p);
  }
  return kept.join(' ');
}

function collapseStutteredWords(text: string): string {
  return text.replace(/\b(\w{4,})(\s+\1\b)+/gi, '$1');
}
