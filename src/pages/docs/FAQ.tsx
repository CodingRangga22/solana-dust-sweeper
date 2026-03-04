const faqs = [
  {q:"What tokens can I close?",a:"Any SPL token account with zero balance, dust amount, no active liquidity pool, or USD value under $1.00. Accounts meeting at least 2 of 4 criteria are sweepable. Zero-balance always qualifies."},
  {q:"Is it safe?",a:"Yes. Non-custodial — keys never leave your wallet. On-chain program validates authority, zero balance, and hardcoded treasury. Source code is publicly auditable."},
  {q:"When will I receive my SOL?",a:"Immediately after on-chain confirmation — typically 2-5 seconds. Rent is sent directly to your wallet in the same transaction."},
  {q:"Can I accidentally sweep a token I still want?",a:"No. Ars​weep only closes accounts with zero token balance. The account is an empty shell. You cannot lose tokens by sweeping."},
  {q:"What is the 1.5% fee?",a:"Enforced on-chain by the Anchor program — cannot be manipulated by the frontend. Covers RPC costs, Jupiter API, hosting, and development."},
  {q:"How many accounts per sweep?",a:"Up to 5 per transaction. More accounts are auto-batched into sequential transactions. You approve each batch in your wallet."},
  {q:"Why does my wallet say Not enough SOL?",a:"Your wallet needs a small amount of SOL to cover network gas. Keep at least 0.001 SOL in your wallet before sweeping."},
  {q:"Does Ars​weep work on Mainnet?",a:"Currently on Solana Devnet. Mainnet coming soon — follow @Arsweep_AI on X for updates."},
  {q:"Can I verify on-chain?",a:"Yes. Every sweep shows a Solscan link. Click View Transaction on Solscan to verify accounts closed, rent recovered, fee charged, and treasury destination."},
  {q:"Does Ars​weep store my wallet data?",a:"No. No backend. All scanning and transaction building is client-side. Your address is never stored or logged."},
  {q:"What wallets are supported?",a:"Any Solana Wallet Adapter wallet — Phantom, Solflare, Backpack, and others. Phantom recommended for best experience."},
  {q:"What is a dust token?",a:"A token with insignificant balance — zero, tiny raw amount, or no trading pool. Accumulates from airdrops, failed swaps, and DeFi interactions."},
];
export default function FAQ() {
  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">FAQ</div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">Everything you need to know about using Ars​weep safely and effectively.</p>
      </div>
      <div className="space-y-4">
        {faqs.map(({q,a})=>(
          <div key={q} className="border rounded-xl p-5 bg-muted/20">
            <p className="font-semibold mb-2">{q}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 p-6 rounded-xl border bg-primary/5 text-center">
        <p className="font-semibold mb-2">Still have questions?</p>
        <p className="text-sm text-muted-foreground mb-4">Reach out on X or open a GitHub issue.</p>
        <div className="flex justify-center gap-3 flex-wrap">
          <a href="https://x.com/Ars​weep_AI" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition">@Arsweep_AI on X</a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-muted transition">GitHub Issues</a>
        </div>
      </div>
    </div>
  );
}