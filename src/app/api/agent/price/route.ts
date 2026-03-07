import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/solana?localization=false&tickers=false&community_data=false&developer_data=false',
      { next: { revalidate: 60 } }
    )
    const data = await res.json()
    const market = data.market_data

    return NextResponse.json({
      success: true,
      data: {
        sol_price: market.current_price.usd.toFixed(2),
        change_24h: market.price_change_percentage_24h.toFixed(2),
        change_7d: market.price_change_percentage_7d.toFixed(2),
        market_cap: (market.market_cap.usd / 1e9).toFixed(2) + 'B',
        volume_24h: (market.total_volume.usd / 1e6).toFixed(0) + 'M',
        timestamp: new Date().toLocaleTimeString('id-ID')
      }
    })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Price fetch failed' }, { status: 500 })
  }
}
