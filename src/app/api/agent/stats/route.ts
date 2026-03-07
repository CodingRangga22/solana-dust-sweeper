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
    const { data: stats, error } = await supabase
      .from('sweep_stats')
      .select('*')
      .eq('wallet', wallet)
      .single()

    if (error || !stats) {
      return NextResponse.json({ success: false, error: 'Wallet not found' }, { status: 404 })
    }

    const { count } = await supabase
      .from('sweep_stats')
      .select('*', { count: 'exact', head: true })
      .gt('sol_recovered', stats.sol_recovered)

    const rank = (count ?? 0) + 1

    return NextResponse.json({
      success: true,
      data: {
        wallet,
        wallet_short: wallet.slice(0, 4) + '...' + wallet.slice(-4),
        total_sweeps: stats.total_sweeps ?? 0,
        tokens_cleaned: stats.tokens_cleaned ?? 0,
        sol_recovered: parseFloat((stats.sol_recovered ?? 0).toFixed(4)),
        sweep_tokens: stats.sweep_tokens ?? 0,
        leaderboard_rank: rank,
        last_sweep_date: stats.updated_at
          ? new Date(stats.updated_at).toLocaleDateString('id-ID')
          : 'Never'
      }
    })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
