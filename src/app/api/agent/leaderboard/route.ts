import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '10')

  try {
    const { data, error } = await supabase
      .from('sweep_stats')
      .select('wallet, sol_recovered, total_sweeps, sweep_tokens')
      .order('sol_recovered', { ascending: false })
      .limit(Math.min(limit, 20))

    if (error) throw error

    const leaderboard = data.map((row, i) => ({
      rank: i + 1,
      wallet: row.wallet,
      wallet_short: row.wallet.slice(0, 4) + '...' + row.wallet.slice(-4),
      sol_recovered: parseFloat((row.sol_recovered ?? 0).toFixed(4)),
      total_sweeps: row.total_sweeps ?? 0,
      sweep_tokens: row.sweep_tokens ?? 0
    }))

    return NextResponse.json({
      success: true,
      data: {
        leaderboard,
        timestamp: new Date().toISOString(),
        total_entries: data.length
      }
    })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
