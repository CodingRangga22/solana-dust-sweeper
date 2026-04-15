import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Crown,
  ExternalLink,
  LayoutList,
  PieChartIcon,
  ShieldAlert,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { extractSolscanTxUrl, humanizeKey, isRecord, unwrapApiPayload } from '@/lib/formatPremiumResult';
import { sanitizeRoastText } from '@/lib/roastTextSanitize';
import { cn } from '@/lib/utils';

export type PremiumServiceUi = 'analyze' | 'report' | 'roast' | 'rugcheck' | 'planner';

const COLORS = ["#e5e5e5", "#d4d4d4", "#a3a3a3", "#737373", "#525252", "#94a3b8"];

function fmtNum(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

function pickSummary(root: Record<string, unknown>): Record<string, unknown> | null {
  if (isRecord(root.summary)) return root.summary;
  if (isRecord(root.data) && isRecord(root.data.summary)) return root.data.summary;
  if (isRecord(root.result) && isRecord(root.result.summary)) return root.result.summary;
  return null;
}

function collectFlatNumbers(obj: unknown, depth = 0): { key: string; value: number }[] {
  if (depth > 4 || !isRecord(obj)) return [];
  const out: { key: string; value: number }[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const kl = k.toLowerCase();
    if (kl.includes('address') || kl.includes('mint') || kl.includes('signature') || kl.includes('pubkey')) continue;
    if (typeof v === 'number' && !Number.isNaN(v)) out.push({ key: humanizeKey(k), value: v });
    else if (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v.trim())) {
      const n = parseFloat(v);
      if (!Number.isNaN(n)) out.push({ key: humanizeKey(k), value: n });
    }
  }
  return out;
}

function SolscanLinkRow({ payload }: { payload: unknown }) {
  const url = extractSolscanTxUrl(payload);
  if (!url) return null;
  const label = url.includes('/tx/') ? 'Lihat transaksi di Solscan' : 'Lihat wallet di explorer';
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/15"
    >
      <ExternalLink className="h-4 w-4 shrink-0 opacity-80" />
      {label}
    </a>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-transparent p-3 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-white">{value}</p>
      {sub ? <p className="mt-0.5 text-[11px] text-white/40">{sub}</p> : null}
    </div>
  );
}

function ReportView({ data }: { data: unknown }) {
  const root = unwrapApiPayload(data);
  if (!isRecord(root)) return <FallbackJson payload={data} />;

  const summary = pickSummary(root) ?? root;
  const totalAcc = Number(summary.totalAccounts ?? summary.total_accounts ?? 0);
  const empty = Number(summary.emptyAccounts ?? summary.empty_accounts ?? 0);
  const active = Number(summary.activeAccounts ?? summary.active_accounts ?? Math.max(0, totalAcc - empty));
  const sol = Number(summary.totalReclaimableSOL ?? summary.total_reclaimable_sol ?? 0);
  const usd = Number(summary.totalReclaimableUSD ?? summary.total_reclaimable_usd ?? 0);

  const pieData =
    empty + active > 0
      ? [
          { name: 'Kosong', value: empty },
          { name: 'Aktif', value: active },
        ]
      : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25">
          <PieChartIcon className="h-4 w-4 text-white/80" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/85">Sweep report</p>
          <p className="text-[11px] text-white/45">Ringkasan akun & perkiraan SOL yang bisa dikembalikan</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <MetricCard label="Total akun" value={fmtNum(totalAcc || empty + active)} />
        <MetricCard label="Kosong" value={fmtNum(empty)} />
        <MetricCard label="Aktif" value={fmtNum(active)} />
        <MetricCard label="SOL bisa diklaim" value={`${sol.toFixed(5)} SOL`} sub="Perkiraan" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {pieData.length > 0 && (
          <div className="rounded-xl border border-white/[0.08] bg-black/20 p-3">
            <p className="mb-2 text-center text-[11px] font-medium text-white/50">Distribusi akun</p>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="rgba(255,255,255,0.06)" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                    formatter={(v: number) => [fmtNum(v), '']}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="flex flex-col justify-center gap-3 rounded-xl border border-white/[0.08] bg-black/20 p-4">
          <p className="text-center text-[11px] font-medium text-white/50">Perkiraan nilai kembali</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-center">
              <p className="text-[10px] uppercase tracking-wider text-white/45">SOL</p>
              <p className="font-mono text-lg font-semibold text-white/85">{sol.toFixed(5)}</p>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-center">
              <p className="text-[10px] uppercase tracking-wider text-white/45">USD</p>
              <p className="font-mono text-lg font-semibold text-white/90">${usd.toFixed(2)}</p>
            </div>
          </div>
          <p className="text-center text-[10px] text-white/35">Perkiraan · bukan jaminan harga</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {typeof root.sweepUrl === 'string' && root.sweepUrl.startsWith('http') ? (
          <a
            href={root.sweepUrl}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/85 hover:bg-white/[0.07]"
          >
            <Wallet className="h-4 w-4" />
            Buka dashboard Arsweep
            <ExternalLink className="h-3.5 w-3.5 opacity-60" />
          </a>
        ) : null}

        <SolscanLinkRow payload={data} />
      </div>
    </div>
  );
}

function AnalyzeView({ data }: { data: unknown }) {
  const root = unwrapApiPayload(data);
  if (!isRecord(root)) return <FallbackJson payload={data} />;

  const summary = pickSummary(root) ?? root;
  const nums = collectFlatNumbers(summary);
  const text =
    (typeof root.analysis === 'string' && root.analysis) ||
    (typeof root.message === 'string' && root.message) ||
    (typeof root.report === 'string' && root.report) ||
    '';

  const topMetrics = nums.slice(0, 8);
  const chartSlice = topMetrics.slice(0, 6).map((x) => ({ name: x.key.slice(0, 14), full: x.key, value: Math.abs(x.value) }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25">
          <Sparkles className="h-4 w-4 text-white/80" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/85">AI wallet analysis</p>
          <p className="text-[11px] text-white/45">Metrik utama dari respons premium</p>
        </div>
      </div>

      {topMetrics.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
          {topMetrics.map(({ key, value }) => (
            <MetricCard key={key} label={key} value={fmtNum(value)} />
          ))}
        </div>
      ) : null}

      {chartSlice.length >= 2 ? (
        <div className="rounded-xl border border-white/[0.08] bg-black/20 p-3">
          <p className="mb-2 text-[11px] font-medium text-white/50">Visualisasi metrik (nilai absolut)</p>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartSlice} margin={{ bottom: 48 }}>
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, maxWidth: 280 }}
                  formatter={(v: number, _n, item) => {
                    const full = (item?.payload as { full?: string })?.full;
                    return [fmtNum(v), full ?? ''];
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="rgba(148,163,184,0.9)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}

      {text ? (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">Ringkasan teks</p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/80">{text}</p>
        </div>
      ) : null}

      <SolscanLinkRow payload={data} />
    </div>
  );
}

function RoastView({ data }: { data: unknown }) {
  const root = unwrapApiPayload(data);
  let score: number | null = null;
  let body = '';

  if (isRecord(root)) {
    const s = root.score ?? root.walletScore ?? root.rating;
    if (typeof s === 'number') score = s;
    else if (typeof s === 'string' && /^-?\d+(\.\d+)?$/.test(s)) score = parseFloat(s);
    const roast =
      (typeof root.roast === 'string' && root.roast) ||
      (typeof root.message === 'string' && root.message) ||
      (typeof root.text === 'string' && root.text) ||
      (typeof root.verdict === 'string' && root.verdict) ||
      '';
    body = roast ? sanitizeRoastText(roast) : '';
  } else if (typeof root === 'string') {
    body = sanitizeRoastText(root);
  }

  const pct = score != null ? Math.min(100, Math.max(0, Number(score))) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-fuchsia-500/15 ring-1 ring-fuchsia-500/25">
          <Crown className="h-4 w-4 text-fuchsia-300" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-fuchsia-200/90">Wallet roast</p>
          <p className="text-[11px] text-white/45">Kalimat ganda & kata berulang dibersihkan otomatis di tampilan ini</p>
        </div>
      </div>

      {pct != null ? (
        <div className="space-y-3 rounded-xl border border-white/[0.08] bg-black/25 px-4 py-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/45">Skor wallet</p>
              <p className="text-4xl font-bold tabular-nums text-white">{fmtNum(pct)}</p>
              <p className="text-[11px] text-white/35">0 = chaos · 100 = gigachad</p>
            </div>
            <div className="text-right text-[10px] text-white/30">/ 100</div>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-white/70 via-white/45 to-white/25"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ) : null}

      {body ? (
        <blockquote className="rounded-xl border-l-4 border-white/40 bg-white/[0.04] px-4 py-3 text-sm italic leading-relaxed text-white/85">
          {body}
        </blockquote>
      ) : (
        <FallbackJson payload={data} />
      )}

      <SolscanLinkRow payload={data} />
    </div>
  );
}

function RugcheckView({ data }: { data: unknown }) {
  const root = unwrapApiPayload(data);
  const rows: { label: string; value: string; tone: 'ok' | 'mid' | 'bad' }[] = [];

  if (isRecord(root)) {
    const tokens = root.tokens ?? root.results ?? root.flaggedTokens;
    if (Array.isArray(tokens)) {
      tokens.slice(0, 12).forEach((t, i) => {
        if (!isRecord(t)) return;
        const rawSym = (typeof t.symbol === 'string' ? t.symbol : '') || '';
        const mint = typeof t.mint === 'string' ? t.mint.trim() : '';
        const mint4 = mint ? mint.slice(0, 4) : '';
        const sym =
          rawSym && !/^\?+$/.test(rawSym.trim())
            ? rawSym
            : mint4 && !/^\?+$/.test(mint4.trim())
              ? mint4
              : `Unknown token ${i + 1}`;
        const mintShort = mint && mint.length > 12 ? `${mint.slice(0, 4)}…${mint.slice(-4)}` : mint;
        const label = mintShort ? `${sym} (${mintShort})` : sym;
        const risk = String(t.risk ?? t.level ?? t.status ?? t.verdict ?? '—');
        const tone = /high|rug|danger|bad/i.test(risk) ? 'bad' : /med|warn|mid/i.test(risk) ? 'mid' : 'ok';
        rows.push({ label, value: risk, tone });
      });
    }
    if (rows.length === 0) {
      const nums = collectFlatNumbers(root);
      nums.slice(0, 8).forEach((n) => rows.push({ label: n.key, value: fmtNum(n.value), tone: 'mid' }));
    }
  }

  const chartData = rows.slice(0, 6).map((r, i) => ({
    name: r.label.slice(0, 10),
    v: r.tone === 'bad' ? 3 : r.tone === 'mid' ? 2 : 1,
    full: r.label,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/15 ring-1 ring-rose-500/25">
          <ShieldAlert className="h-4 w-4 text-rose-300" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-200/90">Rug detector</p>
          <p className="text-[11px] text-white/45">Prioritas & sinyal risiko (jika tersedia dari API)</p>
        </div>
      </div>

      {chartData.length >= 2 ? (
        <div className="h-[200px] w-full rounded-xl border border-white/[0.08] bg-black/20 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                formatter={(_v, _n, p) => [(p?.payload as { full?: string })?.full, 'Token']}
              />
              <Bar dataKey="v" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : null}

      {rows.length > 0 ? (
        <ul className="space-y-2">
          {rows.map((r, i) => (
            <li
              key={i}
              className={cn(
                'flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm',
                r.tone === 'bad' && 'border-rose-500/30 bg-rose-950/20 text-rose-100',
                r.tone === 'mid' && 'border-white/25 bg-white/10 text-white/90',
                r.tone === 'ok' && 'border-emerald-500/20 bg-emerald-950/15 text-emerald-100',
              )}
            >
              <span className="font-medium">{r.label}</span>
              <span className="font-mono text-xs opacity-90">{r.value}</span>
            </li>
          ))}
        </ul>
      ) : (
        <FallbackJson payload={data} />
      )}

      <SolscanLinkRow payload={data} />
    </div>
  );
}

function PlannerView({ data }: { data: unknown }) {
  const root = unwrapApiPayload(data);
  const steps: string[] = [];

  const maybeExtractSteps = (v: unknown): string[] => {
    if (!v) return [];
    if (typeof v === 'string') {
      const t = v.trim();
      // Sometimes backend returns a stringified JSON.
      if (t.startsWith('{') || t.startsWith('[')) {
        try {
          const parsed = JSON.parse(t) as unknown;
          return maybeExtractSteps(parsed);
        } catch {
          return t ? [t] : [];
        }
      }
      return t ? [t] : [];
    }
    if (Array.isArray(v)) {
      const out: string[] = [];
      v.forEach((x, i) => {
        if (typeof x === 'string') out.push(x);
        else if (isRecord(x) && typeof x.description === 'string') out.push(x.description);
        else if (isRecord(x) && typeof x.action === 'string') out.push(x.action);
        else if (isRecord(x) && typeof x.step === 'string') out.push(x.step);
        else if (isRecord(x) && typeof x.title === 'string') out.push(x.title);
        else out.push(`${i + 1}. ${JSON.stringify(x).slice(0, 160)}`);
      });
      return out.filter((s) => s.trim().length > 0);
    }
    if (isRecord(v)) {
      // Common nested containers for planner output.
      const direct =
        v.steps ??
        v.plan ??
        v.actions ??
        v.order ??
        v.recommendations ??
        v.recommendedSteps ??
        v.instructions ??
        v.tasks;
      const fromDirect = maybeExtractSteps(direct);
      if (fromDirect.length) return fromDirect;

      // Some APIs return a "summary" / "message" with steps embedded.
      const text = v.summary ?? v.message ?? v.text ?? v.description;
      const fromText = maybeExtractSteps(text);
      if (fromText.length) return fromText;
    }
    return [];
  };

  if (isRecord(root)) {
    const raw =
      root.steps ??
      root.plan ??
      root.actions ??
      root.order ??
      root.recommendations ??
      root.recommendedSteps ??
      root.instructions ??
      root.tasks ??
      root.result ??
      root.data;
    if (Array.isArray(raw)) {
      steps.push(...maybeExtractSteps(raw));
    }
    if (steps.length === 0) {
      steps.push(...maybeExtractSteps(raw));
      if (steps.length === 0) steps.push(...maybeExtractSteps(root.summary));
      if (steps.length === 0) steps.push(...maybeExtractSteps(root.message));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 ring-1 ring-indigo-500/25">
          <LayoutList className="h-4 w-4 text-indigo-300" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200/90">Sweep planner</p>
          <p className="text-[11px] text-white/45">Urutan langkah yang disarankan</p>
        </div>
      </div>

      {steps.length > 0 ? (
        <ol className="relative space-y-0 border-l border-white/25 pl-6">
          {steps.map((s, i) => (
            <li key={i} className="relative pb-6 last:pb-0">
              <span className="absolute -left-[25px] top-0 flex h-6 w-6 items-center justify-center rounded-full border border-white/35 bg-[#0a0c10] text-[11px] font-bold text-white/80">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-white/85">{s}</p>
            </li>
          ))}
        </ol>
      ) : (
        <FallbackJson payload={data} />
      )}

      <SolscanLinkRow payload={data} />
    </div>
  );
}

function FallbackJson({ payload }: { payload: unknown }) {
  const inner = unwrapApiPayload(payload);
  const pretty = JSON.stringify(inner, null, 2);
  return (
    <pre className="max-h-64 overflow-auto rounded-lg border border-white/10 bg-black/40 p-3 text-[11px] leading-relaxed text-white/70">
      {pretty}
    </pre>
  );
}

export function PremiumResultRich({ serviceType, payload }: { serviceType: PremiumServiceUi; payload: unknown }) {
  return (
    <div className="not-prose w-full space-y-1">
      <div className="mb-2 flex items-center gap-2 rounded-lg border border-white/[0.06] bg-gradient-to-r from-white/10 via-transparent to-transparent px-3 py-2">
        <BarChart3 className="h-4 w-4 text-white/60" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/55">Premium result</span>
      </div>

      {serviceType === 'report' ? <ReportView data={payload} /> : null}
      {serviceType === 'analyze' ? <AnalyzeView data={payload} /> : null}
      {serviceType === 'roast' ? <RoastView data={payload} /> : null}
      {serviceType === 'rugcheck' ? <RugcheckView data={payload} /> : null}
      {serviceType === 'planner' ? <PlannerView data={payload} /> : null}
    </div>
  );
}
