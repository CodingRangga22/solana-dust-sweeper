# Arsweep — AI-Powered Solana Dust Sweeper

> **Colosseum Frontier Hackathon 2026 Submission**

Arsweep is an AI-powered Solana wallet analyzer and dust sweeper. It scans your wallet for empty/low-value SPL token accounts, helps you reclaim locked rent SOL, and provides deep AI analysis of your on-chain activity — all in one interface.

---

## 🔗 Links

| | |
|---|---|
| 🌐 Live App | https://arsweep.fun |
| 📖 Docs | https://arsweep.fun/docs |
| 🤖 Backend API | https://api.arsweep.fun |
| 🪙 Token ($ARSWP) | `dTMaF2F97BWo6s416JqsDrpzdwa1uarKngSwf25pump` |
| 💬 Telegram | https://t.me/ArsweepAI |

---

## ✨ Features

### 🧹 Dust Sweeper
- Scans Solana wallet for empty/low-value SPL token accounts
- Reclaims locked rent SOL by closing dust accounts
- Optionally swaps dust tokens to SOL when safe
- Real-time sweep stats (total swept, SOL reclaimed, users)

### 🤖 AI Agent (/agent)
- Chat-based AI wallet analyst powered by Groq (LLaMA 3.3 70B)
- Natural language wallet scanning — just paste your address
- Understands Solana ecosystem: tokens, NFTs, DeFi positions
- Trigger sweeps directly from chat via "KONFIRMASI" keyword

### 💳 x402 Premium Endpoints
Pay-per-use AI analysis powered by the x402 micropayment protocol (Base/EVM):

| Endpoint | Price | Description |
|---|---|---|
| `POST /v1/x402/analyze` | $0.10 | Deep wallet analysis |
| `POST /v1/x402/report` | $0.05 | Wallet health report |
| `POST /v1/x402/roast` | $0.05 | Brutal wallet roast 🔥 |
| `POST /v1/x402/rugcheck` | $0.10 | Token rug risk check |
| `POST /v1/x402/planner` | $0.05 | Portfolio rebalance planner |

### 📊 Live Dashboard
- Real-time leaderboard (Season 1)
- Referral system with unique links
- Sweep simulation mode
- SOL Calculator

### 🪙 $ARSWP Token
- Native utility token on Solana
- CA: `dTMaF2F97BWo6s416JqsDrpzdwa1uarKngSwf25pump`
- Live on pump.fun

---

## 🏗 Architecture

```text
Frontend (Vercel)          Backend (Render)
arsweep.fun          →    api.arsweep.fun
  │                              │
  ├── /app (Sweeper)             ├── /v1/analyze
  ├── /agent (AI Chat)           ├── /v1/x402/* (premium)
  ├── /token ($ARSWP)            ├── Groq LLaMA 3.3 70B
  ├── /leaderboard               ├── Helius RPC
  └── /docs                      └── Supabase
```

**Frontend repo** (this repo): React + Vite + TypeScript
**Backend repo**: https://github.com/CodingRangga22/arsweep-agent

---

## 🚀 Quickstart (local)

### Prerequisites

- Node.js 18+ / 20+
- Bun (recommended) or npm
- Solana wallet (Phantom, Backpack, etc.)
- Privy App ID

### Setup

1. Install dependencies:

```bash
bun install
```

2. Create `.env` from example:

```bash
cp .env.example .env
```

3. Fill required env vars:

```env
VITE_PRIVY_APP_ID=your_privy_app_id
VITE_HELIUS_RPC_URL=your_helius_rpc_url
VITE_NETWORK=mainnet-beta
```

4. Run dev server:

```bash
bun run dev
```

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Vite + React + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Wallet | Solana wallet-adapter + web3.js |
| Auth | Privy |
| AI | Groq (LLaMA 3.3 70B) |
| Database | Supabase |
| RPC | Helius |
| Payments | x402 protocol (Base/EVM) |
| Backend | Express + TypeScript (Render) |
| Frontend Deploy | Vercel |

---

## 📜 Scripts

```bash
bun run dev          # start dev server
bun run build        # production build
bun run lint         # ESLint
bun run test         # Vitest
```

---

## ⚠️ x402 Payment Note

Premium endpoints use HTTP `402 Payment Required` with x402 headers.
This repo uses a same-origin proxy at `/syra` in dev and `server/index.ts` in production to handle CORS correctly.

---

Built with ❤️ by [@CodingRangga22](https://github.com/CodingRangga22) — Bondowoso, East Java, Indonesia 🇮🇩
