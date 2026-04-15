import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ExternalLink, Loader2 } from "lucide-react";
import ArsweepLogo from "@/components/ArsweepLogo";
import BrandWordmark from "@/components/BrandWordmark";
import AswpPremiumNotice from "@/components/AswpPremiumNotice";
import { useBanner } from "@/components/BannerProvider";
import type { X402HealthResponse } from "@/services/arsweepApi";
import { priceUsdcFor } from "@/hooks/useX402Payment";

const X402SCAN_SERVER_URL = "https://www.x402scan.com/server/02e3af55-8ecc-4d78-a82e-077fbc1cf790";

const API_BASE = (import.meta.env.VITE_ARSWEEP_API_BASE?.trim() || "https://api.arsweep.fun/v1").replace(/\/$/, "");

function normalizeX402Prefix(raw: string | undefined): string {
  let p = (raw?.trim() || "/x402").replace(/\/$/, "") || "/x402";
  if (!p.startsWith("/")) p = `/${p}`;
  const lower = p.toLowerCase();
  if (lower === "/a402") return "/x402";
  return p;
}

type FilterId = "all" | "ai" | "report" | "safety";

type Row = {
  id: string;
  title: string;
  description: string;
  priceLabel: string;
  method: "POST" | "GET";
  pathDisplay: string;
  filter: FilterId;
  filterLabel: string;
};

function inferFilterFromPath(path: string): FilterId {
  const p = path.toLowerCase();
  if (p.includes("rugcheck") || p.includes("rug")) return "safety";
  if (p.includes("report") || p.includes("roast")) return "report";
  return "ai";
}

function filterToLabel(f: FilterId): string {
  if (f === "safety") return "Safety";
  if (f === "report") return "Reports";
  return "Analysis";
}

function buildStaticRows(prefix: string): Row[] {
  const rows: Array<{
    id: string;
    title: string;
    slug: "analyze" | "report" | "roast" | "rugcheck" | "planner";
    description: string;
    filter: FilterId;
  }> = [
    {
      id: "analyze",
      title: "AI Analysis",
      slug: "analyze",
      description:
        "Portfolio depth pass: holdings, dust exposure, and practical notes. Charged once per successful request.",
      filter: "ai",
    },
    {
      id: "report",
      title: "Sweep Report",
      slug: "report",
      description: "Compact reclaim overview for a wallet — good when you want numbers without the chat thread.",
      filter: "report",
    },
    {
      id: "roast",
      title: "Wallet Roast",
      slug: "roast",
      description: "Tongue-in-cheek score plus commentary on how “clean” the wallet looks on-chain.",
      filter: "report",
    },
    {
      id: "rugcheck",
      title: "Rug Detector",
      slug: "rugcheck",
      description: "Heuristic pass on risky or spam-like patterns in context of what you asked.",
      filter: "safety",
    },
    {
      id: "planner",
      title: "Sweep Planner",
      slug: "planner",
      description: "Suggested batching and ordering so you reclaim rent with fewer signatures.",
      filter: "ai",
    },
  ];

  return rows.map((r) => {
    const usd = priceUsdcFor(r.slug);
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      priceLabel: `$${usd.toFixed(2)}`,
      method: "POST",
      pathDisplay: `${prefix}/${r.slug}`,
      filter: r.filter,
      filterLabel: filterToLabel(r.filter),
    };
  });
}

function slugToTitle(slug: string): string {
  const map: Record<string, string> = {
    analyze: "AI Analysis",
    report: "Sweep Report",
    roast: "Wallet Roast",
    rugcheck: "Rug Detector",
    planner: "Sweep Planner",
  };
  return map[slug] ?? slug.replace(/-/g, " ").replace(/\b\w/g, (x) => x.toUpperCase());
}

function shortenPathForDisplay(full: string, prefix: string): string {
  const p = full.startsWith("/") ? full : `/${full}`;
  const idx = p.indexOf(prefix);
  if (idx >= 0) return p.slice(idx);
  const x402 = p.indexOf("/x402");
  if (x402 >= 0) return p.slice(x402);
  return p;
}

function healthToRows(data: X402HealthResponse, prefix: string): Row[] {
  return data.endpoints.map((e, i) => {
    const p = e.path.startsWith("/") ? e.path : `/${e.path}`;
    const slug = p.split("/").filter(Boolean).pop() ?? `ep-${i}`;
    const filt = inferFilterFromPath(p);
    return {
      id: `api-${slug}-${i}`,
      title: slugToTitle(slug),
      description: e.description,
      priceLabel: e.price?.startsWith("$") ? e.price : `$${e.price}`,
      method: "POST",
      pathDisplay: shortenPathForDisplay(p, prefix),
      filter: filt,
      filterLabel: filterToLabel(filt),
    };
  });
}

const FILTERS: Array<{ id: FilterId; label: string }> = [
  { id: "all", label: "Everything" },
  { id: "ai", label: "Analysis" },
  { id: "report", label: "Reports" },
  { id: "safety", label: "Safety" },
];

const M: React.CSSProperties = { fontFamily: "var(--font-mono)" };

export default function X402Resources() {
  const navigate = useNavigate();
  const { bannerHeight } = useBanner();
  const [filter, setFilter] = useState<FilterId>("all");
  const [rows, setRows] = useState<Row[]>(() => buildStaticRows(normalizeX402Prefix(import.meta.env.VITE_ARSWEEP_X402_PATH_PREFIX)));
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState<string | null>(null);

  const prefix = useMemo(() => normalizeX402Prefix(import.meta.env.VITE_ARSWEEP_X402_PATH_PREFIX), []);

  const loadHealth = useCallback(async () => {
    setHealthLoading(true);
    setHealthError(null);
    try {
      const res = await fetch(`${API_BASE}/x402/health`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as X402HealthResponse;
      if (data.endpoints?.length) {
        setRows(healthToRows(data, prefix));
      } else {
        setRows(buildStaticRows(prefix));
      }
    } catch {
      setHealthError("Showing bundled catalog — live discovery was unavailable.");
      setRows(buildStaticRows(prefix));
    } finally {
      setHealthLoading(false);
    }
  }, [prefix]);

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  const visible = useMemo(
    () => (filter === "all" ? rows : rows.filter((c) => c.filter === filter)),
    [rows, filter],
  );

  return (
    <div className="arsweep-page-shell font-sans antialiased pb-28">
      <header
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          zIndex: 50,
          top: bannerHeight,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(2,6,15,0.88)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 20px",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/")}>
            <ArsweepLogo className="h-7 w-7 shrink-0" />
            <BrandWordmark />
          </div>
          <div className="hidden sm:flex" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", alignItems: "center", gap: 8 }}>
            {[
              ["Docs", "/docs"],
              ["$ASWP", "/token"],
              ["Agent", "/agent"],
              ["x402", "/x402"],
            ].map(([label, path]) => (
              <button
                key={path}
                type="button"
                onClick={() => navigate(path)}
                style={{
                  fontSize: 14,
                  color: path === "/x402" ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.5)",
                  background: path === "/x402" ? "rgba(255,255,255,0.08)" : "transparent",
                  border: "none",
                  borderRadius: 8,
                  padding: "6px 12px",
                  cursor: "pointer",
                  transition: "background 0.2s, color 0.2s",
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => navigate("/app")}
            style={{
              ...M,
              fontSize: 13,
              color: "#f4fbfb",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(34,211,238,0.18)",
              borderRadius: 8,
              padding: "6px 14px",
              cursor: "pointer",
            }}
          >
            Launch App
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto border-t border-white/[0.06] px-4 py-2.5 sm:hidden" style={{ maxWidth: 1200, margin: "0 auto" }}>
          {[
            ["Docs", "/docs"],
            ["$ASWP", "/token"],
            ["Agent", "/agent"],
            ["x402", "/x402"],
          ].map(([label, path]) => (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className="shrink-0 rounded-lg px-3 py-1.5 text-[13px]"
              style={{
                color: path === "/x402" ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.5)",
                background: path === "/x402" ? "rgba(255,255,255,0.08)" : "transparent",
                border: "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="arsweep-dot-grid" aria-hidden />
      <div className="arsweep-vignette-fade" aria-hidden />

      <main className="relative z-[2] mx-auto max-w-[900px] px-5" style={{ paddingTop: `${88 + bannerHeight}px` }}>
        {/* Hero — serif + mono, distinct from generic “resources marketplace” pages */}
        <header className="mb-12 border-b border-white/[0.07] pb-10">
          <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-white/38" style={M}>
            Solana · USDC · x402
          </p>
          <h1
            className="text-[clamp(1.75rem,4.5vw,2.75rem)] font-normal leading-[1.12] text-white"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            Paid agent endpoints
          </h1>
          <p className="mt-5 max-w-[34rem] text-[15px] leading-[1.7] text-white/42">
            Each call below is billed per request through the{" "}
            <a className="text-white/75 underline-offset-[5px] hover:underline" href="https://www.x402.org/" target="_blank" rel="noreferrer">
              x402
            </a>{" "}
            payment flow on mainnet (USDC). Trigger them from{" "}
            <button type="button" className="text-white/75 underline-offset-4 hover:underline" onClick={() => navigate("/agent")}>
              Agent
            </button>{" "}
            once your wallet is connected — no separate “app store” checkout.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-white/38" style={M}>
            <a
              href={X402SCAN_SERVER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-white/70 transition-colors hover:text-white"
            >
              Registry: x402scan
              <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden />
            </a>
            <span className="hidden text-white/20 sm:inline">·</span>
            <span className="text-white/30">Facilitator settles on-chain after 402 + proof</span>
          </div>
        </header>

        <div className="mb-10">
          <AswpPremiumNotice />
        </div>

        {/* CTA strip — narrow rail, not a fat marketplace banner */}
        <div className="mb-10 flex flex-col gap-3 border-l-2 border-white/20 bg-white/[0.02] py-3 pl-4 pr-4 sm:flex-row sm:items-center sm:justify-between sm:pl-5">
          <p className="text-[14px] leading-relaxed text-white/55">
            Ready to run a tool? Agent holds the wallet session and signs the USDC leg for you.
          </p>
          <button
            type="button"
            onClick={() => navigate("/agent")}
            className="shrink-0 self-start rounded-lg px-4 py-2 text-[13px] font-medium text-[#040506] sm:self-auto"
            style={{ ...M, background: "#e8fdf9", border: "1px solid rgba(34,211,238,0.35)" }}
          >
            Go to Agent
          </button>
        </div>

        {/* Underline tabs — not pill chips */}
        <div className="mb-2 flex flex-wrap gap-0 border-b border-white/[0.08]">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className="-mb-px border-b-2 px-4 py-3 text-[13px] transition-colors sm:px-5"
              style={{
                ...M,
                borderColor: filter === f.id ? "rgba(34,211,238,0.75)" : "transparent",
                color: filter === f.id ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.38)",
                fontWeight: filter === f.id ? 500 : 400,
              }}
            >
              {f.label}
            </button>
          ))}
          {healthLoading && (
            <span className="ml-auto inline-flex items-center gap-1.5 self-center py-2 pr-1 text-[11px] text-white/30">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Refreshing…
            </span>
          )}
        </div>

        {healthError && <p className="mb-6 text-[12px] text-amber-200/65">{healthError}</p>}

        {/* Single-column list — not a 2-up card grid */}
        <div className="overflow-hidden rounded-lg border border-white/[0.07] bg-[#050708]/90">
          {visible.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-white/40">Nothing in this filter.</p>
          ) : (
            visible.map((c, i) => (
              <article
                key={c.id}
                className={`border-b border-white/[0.06] px-5 py-7 last:border-b-0 ${i % 2 === 1 ? "bg-white/[0.015]" : ""}`}
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-10">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-white/32" style={M}>
                      {c.filterLabel}
                    </p>
                    <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-white">{c.title}</h2>
                    <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-white/42">{c.description}</p>
                    <code className="mt-4 block text-[12px] leading-relaxed text-white/45" style={M}>
                      {c.method} {API_BASE}
                      {c.pathDisplay.startsWith("/") ? c.pathDisplay : `/${c.pathDisplay}`}
                    </code>
                  </div>
                  <div className="flex shrink-0 flex-row items-baseline justify-between gap-6 border-t border-white/[0.05] pt-4 md:w-44 md:flex-col md:items-end md:border-t-0 md:pt-0">
                    <span className="text-xl tabular-nums tracking-tight text-white/90" style={M}>
                      {c.priceLabel}
                    </span>
                    <Link
                      to="/agent"
                      className="text-[13px] text-white/80 transition-colors hover:text-white"
                      style={M}
                    >
                      Use in Agent →
                    </Link>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <section className="mt-12 border-t border-white/[0.07] pt-10">
          <h3 className="text-base font-semibold text-white" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
            Payment mechanics
          </h3>
          <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-white/42">
            The server may respond with <code className="rounded bg-white/[0.06] px-1 py-0.5 text-[12px] text-white/65" style={M}>402 Payment Required</code>{" "}
            and instructions; after USDC settles on Solana you retry with the proof header. Base{" "}
            <code className="rounded bg-white/[0.06] px-1 py-0.5 text-[12px] text-white/70" style={M}>
              {API_BASE}
            </code>
            , paid routes under{" "}
            <code className="rounded bg-white/[0.06] px-1 py-0.5 text-[12px] text-white/70" style={M}>
              {prefix}
            </code>
            .
          </p>
          <p className="mt-4 text-[13px] text-white/38">
            Public listing:{" "}
            <a
              href={X402SCAN_SERVER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-white/75 underline-offset-4 hover:underline"
            >
              Arsweep on x402scan
              <ExternalLink className="h-3 w-3 opacity-70" aria-hidden />
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}
