const faqs = [
  {q:"What tokens can I sweep (close)?",a:"Any SPL Token or Token-2022 account that Arsweep marks sweepable. Zero-balance always qualifies. If a token still has a tiny balance, Arsweep may burn it first — but only when it’s confirmed worthless (no liquidity route + $0 value)."},
  {q:"Is it safe?",a:"Yes. Non-custodial — keys never leave your wallet. You review and sign every transaction. Arsweep uses standard SPL Token instructions (burn/close) plus a separate fee transfer you can audit in Explorer."},
  {q:"When will I receive my SOL?",a:"Immediately after on-chain confirmation — typically 2-5 seconds. Rent is sent directly to your wallet in the same transaction."},
  {q:"Can I accidentally lose a valuable token?",a:"Arsweep will not burn tokens when liquidity or USD value is detected. Those tokens are swapped (when possible) or skipped for safety. Burn is only used for tokens that are confirmed worthless."},
  {q:"What is the 1.5% fee?",a:"A transparent service fee on rent recovered from closed accounts. It’s sent as a separate on-chain transfer to the Arsweep treasury and is visible in your wallet preview and on Solscan."},
  {q:"How many accounts per sweep?",a:"Close/burn operations are batched automatically to fit transaction limits (typically ~7 accounts per close batch). If you have many accounts, Arsweep sends multiple transactions that you approve in your wallet."},
  {q:"Why does my wallet say Not enough SOL?",a:"Your wallet needs a small amount of SOL to cover network gas. Keep at least 0.001 SOL in your wallet before sweeping."},
  {q:"Does Ars​weep work on Mainnet?",a:"Arsweep supports both devnet and mainnet depending on the app configuration (you’ll see a network banner in-app). Premium x402 payments settle on Solana mainnet in USDC."},
  {q:"Can I verify on-chain?",a:"Yes. Every sweep shows a Solscan link. Click View Transaction on Solscan to verify accounts closed, rent recovered, fee charged, and treasury destination."},
  {q:"Does Ars​weep store my wallet data?",a:"Sweeping and scanning run client-side. Some premium/agent features may call the Arsweep API when you request them, but Arsweep does not need your private keys to do so."},
  {q:"What wallets are supported?",a:"Any Solana Wallet Adapter wallet — Phantom, Solflare, Backpack, and others. Phantom recommended for best experience."},
  {q:"What is a dust token?",a:"A token with insignificant balance — zero, tiny raw amount, or no trading pool. Accumulates from airdrops, failed swaps, and DeFi interactions."},
  {q:"Is there an Arsweep token?",a:"Yes — $ASWP is the ecosystem SPL token (community incentives and roadmap utility; launched on Pump.fun). It is separate from sweep pricing: the 1.5% service fee on reclaimed rent is still charged in SOL, and you can use the core app without holding $ASWP. Details on the Token page and under Fee Model in Docs."},
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
        <p className="text-sm text-muted-foreground mb-4">Reach out on X or join our Telegram.</p>
        <div className="flex justify-center gap-3 flex-wrap">
          <a href="https://x.com/Arsweep_Agent" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition">@Arsweep_Agent on X</a>
          <a href="https://t.me/arsweepalert" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-muted transition">Telegram Support</a>
        </div>
      </div>
    </div>
  );
}