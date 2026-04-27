export type ArsweepPromptTool =
  | 'chat'
  | 'analyze'
  | 'report'
  | 'roast'
  | 'rugcheck'
  | 'planner'
  | 'syraRisk';

export type ArsweepAgentPrompt = {
  id: string;
  title: string;
  description?: string;
  tool: ArsweepPromptTool;
  prompt: string;
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY = 'arsweep_agent_prompts_v1';
const FAVORITES_KEY = 'arsweep_agent_prompt_favorites_v1';
const RECENTS_KEY = 'arsweep_agent_prompt_recents_v1';

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadAgentPrompts(): ArsweepAgentPrompt[] {
  try {
    const prompts = safeJsonParse<ArsweepAgentPrompt[]>(localStorage.getItem(STORAGE_KEY), []);
    if (!Array.isArray(prompts)) return [];
    return prompts
      .filter((p) => p && typeof p.id === 'string' && typeof p.title === 'string' && typeof p.prompt === 'string')
      .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
  } catch {
    return [];
  }
}

export function saveAgentPrompts(prompts: ArsweepAgentPrompt[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts.slice(0, 100)));
  } catch {
    /* ignore */
  }
}

export function loadFavorites(): Set<string> {
  try {
    const arr = safeJsonParse<string[]>(localStorage.getItem(FAVORITES_KEY), []);
    return new Set(Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

export function saveFavorites(favs: Set<string>) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favs).slice(0, 200)));
  } catch {
    /* ignore */
  }
}

export type PromptRecentRow = { id: string; usedAt: number };

export function loadRecents(): PromptRecentRow[] {
  try {
    const rows = safeJsonParse<PromptRecentRow[]>(localStorage.getItem(RECENTS_KEY), []);
    if (!Array.isArray(rows)) return [];
    return rows
      .filter((r) => r && typeof r.id === 'string' && typeof r.usedAt === 'number')
      .sort((a, b) => b.usedAt - a.usedAt)
      .slice(0, 50);
  } catch {
    return [];
  }
}

export function pushRecent(id: string) {
  try {
    const rows = loadRecents();
    const now = Date.now();
    const next = [{ id, usedAt: now }, ...rows.filter((r) => r.id !== id)].slice(0, 50);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function createDefaultLibraryPrompts(): ArsweepAgentPrompt[] {
  const now = Date.now();
  const mk = (p: Omit<ArsweepAgentPrompt, 'createdAt' | 'updatedAt'>): ArsweepAgentPrompt => ({
    ...p,
    createdAt: now,
    updatedAt: now,
  });
  return [
    mk({
      id: 'lib-analyze',
      title: 'AI Wallet Analysis',
      description: 'Deep wallet insights + suggestions',
      tool: 'analyze',
      prompt: 'Analyze my wallet and give actionable suggestions.',
    }),
    mk({
      id: 'lib-report',
      title: 'Quick Sweep Report',
      description: 'Find dust & locked SOL rent fast',
      tool: 'report',
      prompt: 'Show me all dust tokens in my wallet and the estimated SOL I can recover.',
    }),
    mk({
      id: 'lib-rugcheck',
      title: 'Rug Detector',
      description: 'Detect suspicious / dangerous tokens',
      tool: 'rugcheck',
      prompt: 'Check my wallet for scam tokens and highlight the riskiest ones.',
    }),
    mk({
      id: 'lib-planner',
      title: 'Auto-Sweep Planner',
      description: 'Best order to sweep for max recovery',
      tool: 'planner',
      prompt: 'Create an optimal sweep plan for my wallet.',
    }),
    mk({
      id: 'lib-roast',
      title: 'Wallet Roast',
      description: 'Score 0-100 + funny roast',
      tool: 'roast',
      prompt: 'Roast my wallet and give me a score from 0-100.',
    }),
    mk({
      id: 'lib-syra',
      title: 'Syra Token Risk',
      description: 'Premium token risk check via Syra (x402)',
      tool: 'syraRisk',
      prompt: 'Check Syra risk for this token mint: <PASTE_MINT_HERE>',
    }),
  ];
}

