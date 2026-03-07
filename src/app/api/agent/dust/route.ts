import { NextRequest, NextResponse } from 'next/server'

const HELIUS_RPC = process.env.NEXT_PUBLIC_HELIUS_RPC_URL!

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet')
  if (!wallet) return NextResponse.json({ success: false, error: 'wallet required' }, { status: 400 })

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
          mint: info.mint,
          mint_short: info.mint.slice(0, 4) + '...' + info.mint.slice(-4),
          amount: info.tokenAmount.uiAmount,
          decimals: info.tokenAmount.decimals
        }
      })
      .slice(0, 10)

    const recoverableSol = (dustTokens.length * 0.002).toFixed(4)

    const tokenList = dustTokens
      .slice(0, 5)
      .map((t: any, i: number) => `  ${i + 1}. ${t.mint_short} — ${t.amount}`)
      .join('\n')

    return NextResponse.json({
      success: true,
      data: {
        wallet,
        wallet_short: wallet.slice(0, 4) + '...' + wallet.slice(-4),
        dust_count: dustTokens.length,
        recoverable_sol: recoverableSol,
        token_list: tokenList || '  (none found)',
        tokens: dustTokens
      }
    })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Dust scan failed' }, { status: 500 })
  }
}
