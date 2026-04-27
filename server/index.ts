import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// ─── SYRA PROXY (x402 CORS helper) ─────────────────────
// In browsers, Syra's 402 payment requirement headers may not be readable due to CORS.
// Proxying through our server makes it same-origin so @x402/fetch can parse + retry with proof.
const SYRA_UPSTREAM = (process.env.SYRA_UPSTREAM || 'https://api.syraa.fun').replace(/\/$/, '')
const X402_EXPOSE = [
  'x402-payment-required',
  'x402-payment',
  'x402-version',
  'x402-network',
  'x402-scheme',
  'x402-schemes',
  'x402-price',
  'x402-resource',
  'x402-accept',
  'x402-error',
]

function mergeExpose(existing: string | null, add: string[]): string {
  const set = new Set<string>()
  for (const s of (existing || '').split(',')) {
    const t = s.trim()
    if (t) set.add(t)
  }
  for (const s of add) set.add(s)
  return Array.from(set).join(', ')
}

app.all('/syra/*', async (req, res) => {
  try {
    const upstreamPath = req.originalUrl.replace(/^\/syra/, '')
    const upstreamUrl = `${SYRA_UPSTREAM}${upstreamPath}`

    // Forward request headers, but avoid hop-by-hop headers.
    const headers: Record<string, string> = {}
    for (const [k, v] of Object.entries(req.headers)) {
      if (v == null) continue
      const key = k.toLowerCase()
      if (key === 'host' || key === 'connection' || key === 'content-length') continue
      if (Array.isArray(v)) headers[k] = v.join(', ')
      else headers[k] = String(v)
    }

    const hasBody = req.method !== 'GET' && req.method !== 'HEAD'
    const body =
      hasBody && req.body != null && Object.keys(req.body).length
        ? JSON.stringify(req.body)
        : hasBody
          ? (req as any).rawBody
          : undefined

    const r = await fetch(upstreamUrl, {
      method: req.method,
      headers,
      body: hasBody ? body : undefined,
    })

    // Copy status + headers
    res.status(r.status)
    r.headers.forEach((value, key) => {
      // Express will manage these; skip to avoid conflicts.
      if (key.toLowerCase() === 'transfer-encoding') return
      res.setHeader(key, value)
    })

    // Ensure x402 headers are exposed to the browser
    res.setHeader(
      'Access-Control-Expose-Headers',
      mergeExpose(String(r.headers.get('access-control-expose-headers') || ''), X402_EXPOSE),
    )
    res.setHeader('Access-Control-Allow-Origin', '*')

    const buf = Buffer.from(await r.arrayBuffer())
    res.send(buf)
  } catch (e: any) {
    res.status(502).json({ success: false, error: e?.message ?? 'Syra proxy failed' })
  }
})

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const HELIUS_RPC = process.env.VITE_HELIUS_RPC_URL!

// ─── PRICE ───────────────────────────────────────────
app.get('/api/agent/price', async (req, res) => {
  try {
    const r = await fetch(
      'https://api.coingecko.com/api/v3/coins/solana?localization=false&tickers=false&community_data=false&developer_data=false'
    )
    const data = await r.json()
    const m = data.market_data
    res.json({
      success: true,
      data: {
        sol_price: m.current_price.usd.toFixed(2),
        change_24h: m.price_change_percentage_24h.toFixed(2),
        change_7d: m.price_change_percentage_7d.toFixed(2),
        market_cap: (m.market_cap.usd / 1e9).toFixed(2) + 'B',
        volume_24h: (m.total_volume.usd / 1e6).toFixed(0) + 'M',
        timestamp: new Date().toLocaleTimeString('id-ID')
      }
    })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Price fetch failed' })
  }
})

// ─── LEADERBOARD ─────────────────────────────────────
app.get('/api/agent/leaderboard', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string ?? '10'), 20)
  try {
    const { data, error } = await supabase
      .from('sweep_stats')
      .select('wallet, sol_recovered, total_sweeps, sweep_tokens')
      .order('sol_recovered', { ascending: false })
      .limit(limit)

    if (error) { console.error("Leaderboard error:", error); throw error }

    res.json({
      success: true,
      data: {
        leaderboard: data.map((row, i) => ({
          rank: i + 1,
          wallet_short: row.wallet.slice(0, 4) + '...' + row.wallet.slice(-4),
          sol_recovered: parseFloat((row.sol_recovered ?? 0).toFixed(4)),
          total_sweeps: row.total_sweeps ?? 0,
          sweep_tokens: row.sweep_tokens ?? 0
        })),
        timestamp: new Date().toISOString()
      }
    })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Internal error' })
  }
})

// ─── STATS ───────────────────────────────────────────
app.get('/api/agent/stats', async (req, res) => {
  const wallet = req.query.wallet as string
  if (!wallet) return res.status(400).json({ success: false, error: 'wallet required' })

  try {
    const { data: stats, error } = await supabase
      .from('sweep_stats')
      .select('*')
      .eq('wallet', wallet)
      .single()

    if (error || !stats) return res.status(404).json({ success: false, error: 'Wallet not found' })

    const { count } = await supabase
      .from('sweep_stats')
      .select('*', { count: 'exact', head: true })
      .gt('sol_recovered', stats.sol_recovered)

    res.json({
      success: true,
      data: {
        wallet,
        wallet_short: wallet.slice(0, 4) + '...' + wallet.slice(-4),
        total_sweeps: stats.total_sweeps ?? 0,
        tokens_cleaned: stats.tokens_cleaned ?? 0,
        sol_recovered: parseFloat((stats.sol_recovered ?? 0).toFixed(4)),
        sweep_tokens: stats.sweep_tokens ?? 0,
        leaderboard_rank: (count ?? 0) + 1,
        last_sweep_date: stats.updated_at
          ? new Date(stats.updated_at).toLocaleDateString('id-ID')
          : 'Never'
      }
    })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Internal error' })
  }
})

// ─── REWARDS ─────────────────────────────────────────
app.get('/api/agent/rewards', async (req, res) => {
  const wallet = req.query.wallet as string
  if (!wallet) return res.status(400).json({ success: false, error: 'wallet required' })

  try {
    const { data: stats } = await supabase
      .from('sweep_stats')
      .select('sweep_tokens, total_sweeps')
      .eq('wallet', wallet)
      .single()

    const sweepEarned = stats?.sweep_tokens ?? 0
    const sweepPending = Math.floor((stats?.total_sweeps ?? 0) * 10) - sweepEarned
    const nextMilestone = 100 - ((stats?.total_sweeps ?? 0) % 100)

    res.json({
      success: true,
      data: {
        wallet,
        wallet_short: wallet.slice(0, 4) + '...' + wallet.slice(-4),
        sweep_earned: sweepEarned,
        sweep_pending: Math.max(0, sweepPending),
        usd_value: (sweepEarned * 0.001).toFixed(2),
        next_milestone: nextMilestone,
        total_sweeps: stats?.total_sweeps ?? 0
      }
    })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Internal error' })
  }
})

// ─── DUST ─────────────────────────────────────────────
app.get('/api/agent/dust', async (req, res) => {
  const wallet = req.query.wallet as string
  if (!wallet) return res.status(400).json({ success: false, error: 'wallet required' })

  try {
    const rpcRes = await fetch(HELIUS_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenAccountsByOwner',
        params: [
          wallet,
          { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
          { encoding: 'jsonParsed' }
        ]
      })
    })

    const rpcData = await rpcRes.json()
    const accounts = rpcData.result?.value ?? []

    const dustTokens = accounts
      .filter((acc: any) => {
        const amount = acc.account.data.parsed.info.tokenAmount
        return amount.uiAmount > 0 && amount.uiAmount < 1
      })
      .map((acc: any) => {
        const info = acc.account.data.parsed.info
        return {
          mint_short: info.mint.slice(0, 4) + '...' + info.mint.slice(-4),
          amount: info.tokenAmount.uiAmount
        }
      })
      .slice(0, 10)

    const tokenList = dustTokens
      .slice(0, 5)
      .map((t: any, i: number) => `  ${i + 1}. ${t.mint_short} — ${t.amount}`)
      .join('\n')

    res.json({
      success: true,
      data: {
        wallet,
        wallet_short: wallet.slice(0, 4) + '...' + wallet.slice(-4),
        dust_count: dustTokens.length,
        recoverable_sol: (dustTokens.length * 0.002).toFixed(4),
        token_list: tokenList || '  (none found)',
        tokens: dustTokens
      }
    })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Dust scan failed' })
  }
})

// ─── START ────────────────────────────────────────────
const PORT = process.env.AGENT_PORT || 3001
app.listen(PORT, () => {
  console.log(`🤖 Arsweep Agent API running on http://localhost:${PORT}`)
})
