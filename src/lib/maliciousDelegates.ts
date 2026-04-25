import { supabase } from "@/lib/supabase";

export type MaliciousDelegateLabel = {
  address: string;
  label: string;
  source?: string | null;
};

function featureEnabled(): boolean {
  // Default OFF to avoid noisy 404s if table is not created yet.
  return (import.meta.env.VITE_REVOKE_USE_SUPABASE_LABELS ?? "").toString() === "true";
}

// Small built-in list as fallback (can be empty; Supabase can override/extend).
const BUILTIN: MaliciousDelegateLabel[] = [];

function norm(addr: string) {
  return addr.trim();
}

export function isKnownMaliciousDelegate(delegate: string, labels: Record<string, MaliciousDelegateLabel>): MaliciousDelegateLabel | null {
  const hit = labels[norm(delegate)];
  return hit ?? null;
}

export async function fetchMaliciousDelegateLabels(): Promise<Record<string, MaliciousDelegateLabel>> {
  const map: Record<string, MaliciousDelegateLabel> = {};
  for (const e of BUILTIN) map[norm(e.address)] = e;

  if (!featureEnabled()) return map;

  // Optional Supabase table: malicious_delegates(address text primary key, label text, source text, updated_at timestamptz)
  try {
    const { data, error } = await supabase
      .from("malicious_delegates")
      .select("address,label,source")
      .limit(5000);
    if (error || !data) return map;

    for (const row of data as any[]) {
      if (!row?.address || !row?.label) continue;
      map[norm(row.address)] = { address: norm(row.address), label: row.label, source: row.source ?? null };
    }
  } catch {
    // ignore
  }

  return map;
}

