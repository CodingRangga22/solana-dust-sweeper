# Arsweep — Solana Dust Sweeper

Arsweep scans your Solana wallet for **empty/low-value SPL token accounts**, then helps you **reclaim locked rent SOL** by closing them (and optionally swapping dust to SOL when safe).

## Quickstart (local)

### Prerequisites
- Node.js \(recommended: 18+ / 20+\)
- Bun \(recommended\) or npm
- A Solana wallet \(Phantom, Backpack, etc.\)
- Privy App ID \(for auth + embedded wallet session\)

### Setup
1) Install dependencies:

```sh
bun install
```

2) Create `.env` from example:

```sh
cp .env.example .env
```

3) Fill required env vars in `.env`:
- `VITE_PRIVY_APP_ID` \(required\)
- `VITE_NETWORK` or `NEXT_PUBLIC_NETWORK` \(optional, defaults to `devnet`\)
- `VITE_HELIUS_RPC_URL` / `VITE_RPC_ENDPOINT` / `NEXT_PUBLIC_RPC_URL` \(optional\)

4) Run dev server:

```sh
bun run dev
```

## Scripts
- `bun run dev`: start Vite dev server
- `bun run build`: production build
- `bun run build:dev`: dev-mode build
- `bun run lint`: ESLint
- `bun run test`: Vitest run
- `bun run test:watch`: Vitest watch

## Deployment (single build, two subdomains)
Deploy the **same SPA build** to two subdomains:

| Subdomain | Purpose |
|---|---|
| `app.arsweep.xyz` | Main app (Landing, Dashboard) |
| `docs.arsweep.xyz` | Documentation (`/docs`) |

Optional env:
- `VITE_APP_HOST=app.arsweep.xyz`
- `VITE_DOCS_HOST=docs.arsweep.xyz`

## Notes about `solana.new`
`solana.new` installs “skills” into `~/.claude/skills` / `~/.codex/skills` / `~/.agents/skills`. It does **not** modify this repo directly.  
If you ran the installer, it may also update `~/.claude/settings.json` to auto-allow some permission categories.

## Tech
- Vite + React + TypeScript
- Tailwind + shadcn/ui
- Solana \(wallet-adapter + web3.js\)
- Vitest + ESLint

