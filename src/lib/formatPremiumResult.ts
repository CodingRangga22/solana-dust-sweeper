function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

/** API often wraps as { success, data }; UI should show the inner payload. */
function unwrapApiPayload(data: unknown): unknown {
  if (!isRecord(data)) return data;
  if (typeof data.success === 'boolean' && 'data' in data && data.data !== undefined) return data.data;
  return data;
}

function humanizeKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function fmtWallet(addr: string): string {
  if (addr.length <= 12) return `\`${addr}\``;
  return `\`${addr.slice(0, 4)}…${addr.slice(-4)}\` (${addr})`;
}

function isBase58Like(s: string): boolean {
  // Base58 alphabet without 0,O,I,l. Used for Solana tx signatures.
  return /^[1-9A-HJ-NP-Za-km-z]+$/.test(s);
}

function looksLikeSolanaSignature(s: string): boolean {
  const t = s.trim();
  // Most Solana tx signatures are ~87-88 chars, but can vary; keep a conservative band.
  return t.length >= 70 && t.length <= 120 && isBase58Like(t);
}

function findAnySolscanUrl(payload: unknown): string | null {
  const root = unwrapApiPayload(payload);
  const tryUrl = (v: unknown) => (typeof v === 'string' && v.includes('solscan.io') ? v : null);

  const direct = tryUrl(root);
  if (direct) return direct;
  if (!isRecord(root)) return null;

  for (const v of Object.values(root)) {
    const u = tryUrl(v);
    if (u) return u;
  }
  return null;
}

function walkForSignature(value: unknown, depth: number, out: string[]) {
  if (depth > 6) return;
  if (typeof value === 'string') {
    if (looksLikeSolanaSignature(value)) out.push(value.trim());
    return;
  }
  if (Array.isArray(value)) {
    for (const v of value) walkForSignature(v, depth + 1, out);
    return;
  }
  if (isRecord(value)) {
    for (const v of Object.values(value)) walkForSignature(v, depth + 1, out);
  }
}

function extractWalletAddress(payload: unknown): string | null {
  const root = unwrapApiPayload(payload);
  const candidates: string[] = [];

  const push = (v: unknown) => {
    if (typeof v === 'string') candidates.push(v);
  };

  if (isRecord(root)) {
    push(root.walletAddress);
    push(root.wallet_address);
    push(root.address);
    const nestedKeys = ['summary', 'data', 'result', 'wallet'];
    for (const k of nestedKeys) {
      const v = root[k];
      if (isRecord(v)) {
        push(v.walletAddress);
        push(v.wallet_address);
        push(v.address);
      }
    }
  }

  // Solana pubkeys are base58 32-44 chars
  const pubkey = candidates.find((c) => {
    const t = c.trim();
    return t.length >= 32 && t.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(t);
  });
  return pubkey ?? null;
}

export function extractSolscanTxUrl(payload: unknown): string | null {
  const root = unwrapApiPayload(payload);
  const candidates: string[] = [];

  const pushIfString = (v: unknown) => {
    if (typeof v === 'string') candidates.push(v);
  };

  if (isRecord(root)) {
    // common keys
    pushIfString(root.signature);
    pushIfString(root.tx);
    pushIfString(root.txid);
    pushIfString(root.txId);
    pushIfString(root.transactionId);
    pushIfString(root.transaction_id);
    pushIfString(root.transactionSignature);
    pushIfString(root.transaction_signature);
    pushIfString(root.paymentSignature);
    pushIfString(root.payment_signature);

    // nested common containers
    const nestedKeys = ['payment', 'transaction', 'tx', 'result', 'data'];
    for (const k of nestedKeys) {
      const v = root[k];
      if (isRecord(v)) {
        pushIfString(v.signature);
        pushIfString(v.txid);
        pushIfString(v.txId);
        pushIfString(v.transactionSignature);
        pushIfString(v.paymentSignature);
      }
    }
  }

  // Fallback: recursive scan for any signature-like base58 string
  const deep: string[] = [];
  walkForSignature(root, 0, deep);

  const sig = candidates.find((c) => looksLikeSolanaSignature(c)) ?? deep[0];
  if (sig) return `https://solscan.io/tx/${sig}`;

  // Fallback: if backend already returns a Solscan URL, surface it
  const solscanUrl = findAnySolscanUrl(payload);
  if (solscanUrl) return solscanUrl;

  // Fallback: link to account page if we have wallet address (still builds trust)
  const wallet = extractWalletAddress(payload);
  if (wallet) return `https://solscan.io/account/${wallet}`;

  return null;
}

/** One markdown line for Solscan; label matches URL type (tx vs account). */
export function formatSolscanMarkdownLine(url: string): string {
  if (url.includes('/tx/')) return `**Solscan:** [Lihat transaksi](${url})`;
  if (url.includes('/account/')) return `**Solscan:** [Lihat wallet di explorer](${url})`;
  return `**Solscan:** [Buka di Solscan](${url})`;
}

/** Readable sweep report (typical /premium/report shape). */
function formatReportBody(payload: unknown): string {
  const root = unwrapApiPayload(payload);
  if (!isRecord(root)) return String(payload);
  const lines: string[] = [];
  const w = root.walletAddress;
  if (typeof w === 'string') lines.push(`**Wallet** ${fmtWallet(w)}`);
  const summary = isRecord(root.summary) ? root.summary : null;
  if (summary) {
    lines.push('');
    lines.push('**Ringkasan**');
    const pick = ['totalAccounts', 'emptyAccounts', 'activeAccounts', 'totalReclaimableSOL', 'totalReclaimableUSD'];
    for (const k of pick) {
      if (summary[k] !== undefined && summary[k] !== null)
        lines.push(`- **${humanizeKey(k)}:** ${String(summary[k])}`);
    }
    for (const [k, v] of Object.entries(summary)) {
      if (pick.includes(k)) continue;
      if (v !== null && v !== undefined && typeof v !== 'object') lines.push(`- **${humanizeKey(k)}:** ${String(v)}`);
    }
  }
  const list = root.emptyAccountsList;
  if (Array.isArray(list)) {
    lines.push('');
    lines.push(`**Akun kosong:** ${list.length} entri`);
    if (list.length > 0 && list.length <= 8) {
      list.slice(0, 8).forEach((item, i) => {
        lines.push(`${i + 1}. ${typeof item === 'object' ? JSON.stringify(item) : String(item)}`);
      });
    }
  }
  const gen = root.generatedAt;
  if (typeof gen === 'string') {
    try {
      lines.push('');
      lines.push(`**Dibuat:** ${new Date(gen).toLocaleString()}`);
    } catch {
      lines.push('');
      lines.push(`**Dibuat:** ${gen}`);
    }
  }
  const url = root.sweepUrl;
  if (typeof url === 'string' && url.startsWith('http')) {
    lines.push('');
    lines.push(`**Dashboard:** [Buka Arsweep](${url})`);
  }
  if (lines.length === 0) return objectToReadableMarkdown(root, 0);
  return lines.join('\n');
}

function objectToReadableMarkdown(obj: Record<string, unknown>, depth: number): string {
  if (depth > 5) return '_…_';
  const lines: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue;
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      lines.push(`- **${humanizeKey(k)}:** ${String(v)}`);
    } else if (Array.isArray(v)) {
      if (v.length === 0) lines.push(`- **${humanizeKey(k)}:** _(kosong)_`);
      else if (v.every((x) => typeof x === 'string' || typeof x === 'number' || typeof x === 'boolean'))
        lines.push(`- **${humanizeKey(k)}:** ${v.join(', ')}`);
      else lines.push(`- **${humanizeKey(k)}:** ${v.length} item`);
    } else if (isRecord(v)) {
      lines.push(`- **${humanizeKey(k)}:**`);
      const nested = objectToReadableMarkdown(v, depth + 1);
      nested.split('\n').forEach((ln) => lines.push(`  ${ln}`));
    }
  }
  return lines.length ? lines.join('\n') : '_Tidak ada detail._';
}

function formatGenericPremium(_serviceType: string, data: unknown): string {
  const inner = unwrapApiPayload(data);
  if (typeof inner === 'string') return inner.trim();
  if (typeof inner === 'number' || typeof inner === 'boolean') return String(inner);
  if (Array.isArray(inner)) {
    if (inner.length === 0) return '_Tidak ada data._';
    return inner.map((x, i) => `${i + 1}. ${typeof x === 'object' ? JSON.stringify(x) : String(x)}`).join('\n');
  }
  if (!isRecord(inner)) return String(data);

  const textFields = ['message', 'text', 'analysis', 'roast', 'summary', 'report', 'description', 'result', 'content'];
  for (const f of textFields) {
    const v = inner[f];
    if (typeof v === 'string' && v.trim().length > 0) {
      const rest = { ...inner };
      delete rest[f];
      const tail = Object.keys(rest).length ? `\n\n${objectToReadableMarkdown(rest, 0)}` : '';
      return `${v.trim()}${tail}`;
    }
  }
  const score = inner.score ?? inner.walletScore ?? inner.riskScore;
  if (typeof score === 'number' || typeof score === 'string') {
    const lines = [`**Skor:** ${score}`];
    const roast = inner.roast ?? inner.comment ?? inner.verdict;
    if (typeof roast === 'string') lines.push('', roast);
    const rest = { ...inner };
    delete rest.score;
    delete rest.walletScore;
    delete rest.riskScore;
    delete rest.roast;
    delete rest.comment;
    delete rest.verdict;
    if (Object.keys(rest).length) lines.push('', objectToReadableMarkdown(rest, 0));
    return lines.join('\n');
  }
  return objectToReadableMarkdown(inner, 0);
}

export function formatPremiumResult(
  serviceType: 'analyze' | 'report' | 'roast' | 'rugcheck' | 'planner',
  data: unknown,
): string {
  const title =
    serviceType === 'analyze'
      ? 'AI Wallet Analysis'
      : serviceType === 'report'
        ? 'Sweep Report'
        : serviceType === 'roast'
          ? 'Wallet Roast'
          : serviceType === 'rugcheck'
            ? 'Rug Detector'
            : 'Sweep Planner';

  let body: string;
  if (serviceType === 'report') body = formatReportBody(data);
  else body = formatGenericPremium(serviceType, data);

  if (!body.trim()) body = '_Tidak ada isi respons._';
  const solscanUrl = extractSolscanTxUrl(data);
  const solscanLine = solscanUrl ? `${formatSolscanMarkdownLine(solscanUrl)}\n\n` : '';
  return `### ${title}\n\n${solscanLine}${body}`;
}
