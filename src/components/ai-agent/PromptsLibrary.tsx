import { useEffect, useMemo, useState } from 'react';
import {
  Heart,
  Plus,
  Search,
  Star,
  Clock,
  Sparkles,
  ShieldAlert,
  FileBarChart,
  Flame,
  WandSparkles,
  LayoutList,
  MessageSquareText,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import type { ArsweepAgentPrompt, ArsweepPromptTool } from '@/lib/agentPrompts';
import { loadFavorites, loadRecents, pushRecent, saveFavorites } from '@/lib/agentPrompts';

const marqueeTrack =
  'Arsweep helps you reclaim SOL rent by closing empty token accounts · scan for dust & suspicious airdrops · one-click cleanup on Solana ·';

type PromptsLibraryProps = {
  libraryPrompts: ArsweepAgentPrompt[];
  myPrompts: ArsweepAgentPrompt[];
  onCreatePrompt: (p: { title: string; description?: string; tool: ArsweepPromptTool; prompt: string }) => void;
  onUsePrompt: (p: ArsweepAgentPrompt) => void;
  onEditPrompt?: (p: ArsweepAgentPrompt) => void;
  onDeletePrompt?: (id: string) => void;
};

function pillBase(active: boolean) {
  return cn(
    'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
    active
      ? 'border-white/18 bg-white/[0.07] text-white/90'
      : 'border-white/[0.08] bg-white/[0.03] text-white/55 hover:bg-white/[0.05] hover:text-white/75',
  );
}

function toolLabel(tool: ArsweepPromptTool): string {
  switch (tool) {
    case 'analyze':
      return 'AI Analysis';
    case 'report':
      return 'Sweep Report';
    case 'roast':
      return 'Wallet Roast';
    case 'rugcheck':
      return 'Rug Detector';
    case 'planner':
      return 'Sweep Planner';
    case 'syraRisk':
      return 'Token Risk';
    default:
      return 'Chat';
  }
}

function toolMeta(tool: ArsweepPromptTool): {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  tone: string;
  premium: boolean;
} {
  switch (tool) {
    case 'analyze':
      return { label: 'AI Analysis', Icon: WandSparkles, tone: 'from-sky-500/12 to-indigo-500/6', premium: true };
    case 'report':
      return { label: 'Sweep Report', Icon: FileBarChart, tone: 'from-emerald-500/12 to-teal-500/6', premium: true };
    case 'roast':
      return { label: 'Wallet Roast', Icon: Flame, tone: 'from-orange-500/12 to-rose-500/6', premium: true };
    case 'rugcheck':
      return { label: 'Rug Detector', Icon: ShieldAlert, tone: 'from-red-500/10 to-amber-500/6', premium: true };
    case 'planner':
      return { label: 'Sweep Planner', Icon: LayoutList, tone: 'from-violet-500/12 to-fuchsia-500/6', premium: true };
    case 'syraRisk':
      return { label: 'Token Risk', Icon: Sparkles, tone: 'from-cyan-500/10 to-slate-500/6', premium: true };
    default:
      return { label: 'Chat', Icon: MessageSquareText, tone: 'from-white/8 to-white/2', premium: false };
  }
}

function toolPrice(tool: ArsweepPromptTool): string | null {
  switch (tool) {
    case 'analyze':
    case 'rugcheck':
      return '$0.10';
    case 'report':
    case 'roast':
    case 'planner':
      return '$0.05';
    case 'syraRisk':
      // Syra uses x402 and can change price per request. Don't show a misleading fixed price.
      return 'Varies';
    default:
      return null;
  }
}

function PromptCard({
  prompt,
  isFavorite,
  isMine,
  onToggleFavorite,
  onRequestDelete,
  onUse,
}: {
  prompt: ArsweepAgentPrompt;
  isFavorite: boolean;
  isMine: boolean;
  onToggleFavorite: () => void;
  onRequestDelete: () => void;
  onUse: () => void;
}) {
  const price = toolPrice(prompt.tool);
  const meta = toolMeta(prompt.tool);
  const Icon = meta.Icon;
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 shadow-sm transition-all hover:border-white/18 hover:bg-white/[0.03]">
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100',
          'bg-gradient-to-br',
          meta.tone,
        )}
      />

      <div className="relative flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.10] bg-white/[0.03]">
          <Icon className="h-5 w-5 text-white/80" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white/92">{prompt.title}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/42">
                {prompt.description || prompt.prompt}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isMine ? (
                <button
                  type="button"
                  onClick={onRequestDelete}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-2 text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white/85"
                  aria-label="Delete template"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={onToggleFavorite}
                className={cn(
                  'rounded-xl border px-2 py-2 transition-colors',
                  isFavorite
                    ? 'border-white/20 bg-white/[0.08] text-white'
                    : 'border-white/[0.08] bg-white/[0.02] text-white/45 hover:text-white/80 hover:bg-white/[0.06]',
                )}
                aria-label="Favorite"
                title={isFavorite ? 'Unfavorite' : 'Favorite'}
              >
                <Star className={cn('h-4 w-4', isFavorite ? 'fill-white/85' : 'fill-transparent')} />
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2 py-1 text-[10px] font-semibold text-white/65">
              {toolLabel(prompt.tool)}
            </span>
            {meta.premium ? (
              <span className="rounded-full border border-white/[0.10] bg-white/[0.03] px-2 py-1 text-[10px] font-semibold text-white/65">
                Paid
              </span>
            ) : (
              <span className="rounded-full border border-white/[0.10] bg-white/[0.03] px-2 py-1 text-[10px] font-semibold text-white/55">
                Free
              </span>
            )}
            {price ? (
              <span
                className="rounded-full border border-white/[0.10] bg-white/[0.03] px-2 py-1 text-[10px] font-bold tabular-nums text-white/75"
                title={
                  prompt.tool === 'syraRisk'
                    ? 'Syra uses x402 and may vary price per request. Final price is shown in your wallet prompt.'
                    : undefined
                }
              >
                {price}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="relative mt-4 flex items-center justify-between gap-2">
        <div className="text-[10px] font-mono text-white/30">Use → adds to input</div>
        <Button onClick={onUse} size="sm" className="h-9 rounded-xl bg-white text-black hover:bg-white/90">
          Use
        </Button>
      </div>
    </div>
  );
}

function CreatePromptDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (p: { title: string; description?: string; tool: ArsweepPromptTool; prompt: string }) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tool, setTool] = useState<ArsweepPromptTool>('chat');
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle('');
    setDescription('');
    setTool('chat');
    setPrompt('');
  }, [open]);

  const canCreate = title.trim().length > 0 && prompt.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border border-white/[0.10] bg-[#0a0c10] text-white">
        <DialogTitle className="text-lg font-semibold">Create prompt</DialogTitle>
        <DialogDescription className="text-sm text-white/45">
          Create your own prompt. Choose a paid tool if you want it to open the payment modal when used.
        </DialogDescription>

        <div className="mt-4 grid gap-3">
          <div className="grid gap-1.5">
            <label className="text-xs font-semibold text-white/65">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 rounded-xl border border-white/[0.12] bg-white/[0.03] px-3 text-sm text-white/90 outline-none focus:border-white/25"
              placeholder="e.g. Check risky airdrops"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-semibold text-white/65">Description (optional)</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-10 rounded-xl border border-white/[0.12] bg-white/[0.03] px-3 text-sm text-white/90 outline-none focus:border-white/25"
              placeholder="Short summary shown on card"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-semibold text-white/65">Tool</label>
            <select
              value={tool}
              onChange={(e) => setTool(e.target.value as ArsweepPromptTool)}
              className="h-10 rounded-xl border border-white/[0.12] bg-white/[0.03] px-3 text-sm text-white/90 outline-none focus:border-white/25"
            >
              <option value="chat">Chat (free)</option>
              <option value="analyze">Premium: AI Analysis</option>
              <option value="report">Premium: Sweep Report</option>
              <option value="rugcheck">Premium: Rug Detector</option>
              <option value="planner">Premium: Sweep Planner</option>
              <option value="roast">Premium: Wallet Roast</option>
              <option value="syraRisk">Premium: Syra Token Risk</option>
            </select>
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-semibold text-white/65">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-28 rounded-xl border border-white/[0.12] bg-white/[0.03] px-3 py-2 text-sm text-white/90 outline-none focus:border-white/25"
              placeholder="Type your prompt here…"
            />
          </div>

          <div className="mt-1 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              className="border border-white/[0.08] bg-white/[0.04] text-white/90 hover:bg-white/[0.07]"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!canCreate}
              onClick={() => {
                onCreate({ title: title.trim(), description: description.trim() || undefined, tool, prompt: prompt.trim() });
                onOpenChange(false);
              }}
            >
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PromptsLibrary({
  libraryPrompts,
  myPrompts,
  onCreatePrompt,
  onUsePrompt,
  onDeletePrompt,
}: PromptsLibraryProps) {
  const [tab, setTab] = useState<'all' | 'mine' | 'recent' | 'favorite'>('all');
  const [q, setQ] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<null | ArsweepAgentPrompt>(null);

  const [favorites, setFavorites] = useState<Set<string>>(() => loadFavorites());
  const [recents, setRecents] = useState(() => loadRecents());

  useEffect(() => {
    // in case other tabs update storage
    setFavorites(loadFavorites());
    setRecents(loadRecents());
  }, [createOpen]);

  const allPrompts = useMemo(() => [...libraryPrompts, ...myPrompts], [libraryPrompts, myPrompts]);
  const myIdSet = useMemo(() => new Set(myPrompts.map((p) => p.id)), [myPrompts]);

  const recentSet = useMemo(() => new Set(recents.map((r) => r.id)), [recents]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const base =
      tab === 'mine'
        ? myPrompts
        : tab === 'favorite'
          ? allPrompts.filter((p) => favorites.has(p.id))
          : tab === 'recent'
            ? allPrompts.filter((p) => recentSet.has(p.id))
            : allPrompts;
    if (!query) return base;
    return base.filter((p) => (p.title + ' ' + (p.description || '') + ' ' + p.prompt).toLowerCase().includes(query));
  }, [q, tab, myPrompts, allPrompts, favorites, recentSet]);

  const onToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveFavorites(next);
      return next;
    });
  };

  const handleUse = (p: ArsweepAgentPrompt) => {
    pushRecent(p.id);
    setRecents(loadRecents());
    onUsePrompt(p);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
              <Sparkles className="h-3.5 w-3.5 text-white/45" />
              Prompt library
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white/95">Arsweep Premium Agent</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/45">
              Pick a template to fill the input. You can also save your own templates.
            </p>
            <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
              <div className="relative flex h-8 items-center">
                <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#0a0c10] to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#0a0c10] to-transparent" />
                <div className="flex min-w-full animate-[arsweep-marquee_18s_linear_infinite] items-center gap-4 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
                  <span className="whitespace-nowrap">{marqueeTrack}</span>
                  <span className="whitespace-nowrap" aria-hidden>
                    {marqueeTrack}
                  </span>
                </div>
              </div>
              <style>{`
                @keyframes arsweep-marquee {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
              `}</style>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCreateOpen(true)}
              className="h-10 rounded-xl border border-white/[0.10] bg-white/[0.06] text-white hover:bg-white/[0.09]"
            >
              <Plus className="mr-2 h-4 w-4" />
              New template
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex w-fit flex-wrap items-center gap-1.5 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-1.5">
            {([
              { id: 'all', label: 'All', Icon: Sparkles, count: allPrompts.length },
              { id: 'mine', label: 'Mine', Icon: Heart, count: myPrompts.length },
              { id: 'recent', label: 'Recent', Icon: Clock, count: recents.length },
              { id: 'favorite', label: 'Starred', Icon: Star, count: favorites.size },
            ] as const).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-semibold transition-colors',
                  tab === t.id
                    ? 'bg-white/[0.10] text-white shadow-sm'
                    : 'text-white/55 hover:bg-white/[0.06] hover:text-white/85',
                )}
              >
                <t.Icon className="h-4 w-4" />
                {t.label}
                <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] font-bold text-white/70">
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-3 py-2">
            <Search className="h-4 w-4 text-white/35" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-8 w-full bg-transparent text-sm text-white/85 outline-none placeholder:text-white/25 lg:w-[360px]"
              placeholder="Search templates…"
            />
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-6 py-6">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] px-6 py-10 text-center">
            <p className="text-sm font-semibold text-white/80">No prompts found</p>
            <p className="mt-1 text-sm text-white/45">Try a different keyword or create a new template.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <PromptCard
                key={p.id}
                prompt={p}
                isFavorite={favorites.has(p.id)}
                isMine={myIdSet.has(p.id)}
                onToggleFavorite={() => onToggleFavorite(p.id)}
                onRequestDelete={() => setDeleteCandidate(p)}
                onUse={() => handleUse(p)}
              />
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteCandidate} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <AlertDialogContent className="border border-white/[0.10] bg-[#0a0c10] text-white">
          <AlertDialogTitle>Delete template?</AlertDialogTitle>
          <AlertDialogDescription className="text-white/50">
            This will remove{' '}
            <span className="font-semibold text-white/80">{deleteCandidate?.title ?? 'this template'}</span> from your saved
            templates on this device.
          </AlertDialogDescription>
          <div className="mt-4 flex items-center justify-end gap-2">
            <AlertDialogCancel
              className="h-10 rounded-xl border border-white/[0.10] bg-white/[0.04] text-white/90 hover:bg-white/[0.07]"
              onClick={() => setDeleteCandidate(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-10 rounded-xl bg-red-500/90 text-white hover:bg-red-500"
              onClick={() => {
                const id = deleteCandidate?.id;
                setDeleteCandidate(null);
                if (id) onDeletePrompt?.(id);
              }}
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <CreatePromptDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={(p) => onCreatePrompt(p)}
      />
    </div>
  );
}

