import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet')
  if (!wallet) return NextResponse.json({ success: false, error: 'wallet required' }, { status: 400 })

  try {
    const { data: stats } = await supabase
      .from('sweep_stats')
      .select('sweep_tokens, total_sweeps')
      .eq('wallet', wallet)
      .single()

    const priceRes = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
      { next: { revalidate: 300 } }
    )
    const priceData = await priceRes.json()
    const solPrice = priceData?.solana?.usd ?? 0

    const sweepEarned = stats?.sweep_tokens ?? 0
    const sweepPending = Math.floor((stats?.total_sweeps ?? 0) * 10) - sweepEarned
    const nextMilestone = 100 - ((stats?.total_sweeps ?? 0) % 100)
    const usdValue = (sweepEarned * 0.001).toFixed(2)

    return NextResponse.json({
      success: true,
      data: {
        wallet,
        wallet_short: wallet.slice(0, 4) + '...' + wallet.slice(-4),
        sweep_earned: sweepEarned,
        sweep_pending: Math.max(0, sweepPending),
        usd_value: usdValue,
        next_milestone: nextMilestone,
        total_sweeps: stats?.total_sweeps ?? 0
      }
    })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
