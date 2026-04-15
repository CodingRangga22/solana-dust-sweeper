import { Link } from "react-router-dom";

const Overview = () => {
  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">✦ Non-Custodial · On-Chain · Solana</div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">Arsweep Documentation</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">Arsweep is a non-custodial Solana utility that automatically identifies and closes empty SPL token accounts, reclaiming rent-exempt SOL locked inside them — returned directly to your wallet.</p>
      </div>
      <div className="bg-muted/50 border rounded-xl p-6 mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Quick Flow</p>
        <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
          {["Connect Wallet","Scan Accounts","Review Eligibility","Confirm Sweep","Receive SOL"].map((step,i,arr)=>(
            <span key={step} className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-background border text-foreground">{step}</span>
              {i<arr.length-1&&<span className="text-muted-foreground">→</span>}
            </span>
          ))}
        </div>
      </div>
      <h2 className="text-2xl font-semibold mt-10 mb-4">What is Ars​weep?</h2>
      <p className="text-muted-foreground leading-relaxed mb-4">Every SPL token account on Solana holds a small rent-exempt deposit (~0.00203928 SOL). When you receive airdropped tokens, participate in DeFi, or trade on DEXes, these accounts accumulate in your wallet.</p>
      <p className="text-muted-foreground leading-relaxed mb-4">Over time, wallets accumulate dozens of empty token accounts — each silently locking up SOL. Ars​weep scans your wallet, identifies accounts safe to close, and sweeps them in a single transaction.</p>
      <div className="grid grid-cols-3 gap-4 my-8">
        {[{value:"~0.002 SOL",label:"Per account recovered"},{value:"1.5%",label:"Platform fee"},{value:"<5s",label:"Average sweep time"}].map(({value,label})=>(
          <div key={label} className="bg-muted/40 border rounded-xl p-4 text-center">
            <p className="text-xl font-bold text-primary mb-1">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <h2 className="text-2xl font-semibold mt-10 mb-4">Core Function</h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Arsweep builds standard Solana instructions client-side: it closes token accounts using SPL Token{" "}
        <code className="px-1.5 py-0.5 mx-1 rounded bg-muted text-foreground text-sm font-mono">CloseAccount</code>. When an account still holds a dust balance, Arsweep may{" "}
        <strong className="text-foreground">burn</strong> first — but only when the token is confirmed worthless (no liquidity route and $0 value).
        Rent is returned to your wallet, and a transparent <strong className="text-foreground">1.5%</strong> service fee is transferred as a separate System Program transfer.
      </p>
      <h2 className="text-2xl font-semibold mt-10 mb-4">Design Principles</h2>
      <div className="space-y-3">
        {[
          {icon:"🔒",title:"Non-custodial",desc:"Your private keys never leave your wallet. Ars​weep only requests permission to close specific accounts you select."},
          {icon:"🧾",title:"Verifiable transactions",desc:"Every sweep is a normal Solana transaction you can review before signing (close/burn + a separate fee transfer + a memo for auditability)."},
          {icon:"🔍",title:"Transparent fee model",desc:"1.5% service fee deducted on-chain. Every transaction is verifiable on Solscan."},
          {icon:"🔍",title:"Verifiable",desc:"All transactions are on-chain and verifiable via Solana Explorer at any time."},
          {icon:"⚡",title:"Batch sweep",desc:"Close multiple accounts in a single transaction to minimize network fees."},
        ].map(({icon,title,desc})=>(
          <div key={title} className="flex gap-4 p-4 rounded-xl border bg-muted/20">
            <span className="text-2xl shrink-0">{icon}</span>
            <div><p className="font-semibold mb-1">{title}</p><p className="text-sm text-muted-foreground leading-relaxed">{desc}</p></div>
          </div>
        ))}
      </div>
      <h2 className="text-2xl font-semibold mt-10 mb-4">Program Deployment</h2>
      <div className="bg-muted/50 border rounded-xl p-5 font-mono text-sm space-y-2">
        {[["Treasury","BfqfpTe6yv5TTTGrcNVRPVfQ3h6FwzhC78LGbGAN5NkT"],["Network","Solana Devnet or Mainnet (configurable)"],["Token programs","SPL Token + Token-2022"],["Premium payments","USDC on Solana mainnet via x402"]].map(([k,v])=>(
          <div key={k} className="flex justify-between gap-4 flex-wrap">
            <span className="text-muted-foreground">{k}</span>
            <span className="text-foreground break-all">{v}</span>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold mt-10 mb-4">Premium Tools (x402)</h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Arsweep includes optional paid agent tools billed per request using the{" "}
        <a className="text-primary hover:underline" href="https://www.x402.org/" target="_blank" rel="noreferrer">x402</a>{" "}
        payment flow (USDC on Solana mainnet). Explore the live catalog at{" "}
        <Link className="text-primary hover:underline" to="/x402">/x402</Link>. The flow is the same pattern popularized by x402 resource catalogs (example:{" "}
        <a className="text-primary hover:underline" href="https://xona-agent.com/resources" target="_blank" rel="noreferrer">Xona x402 Resources</a>
        ).
      </p>
    </div>
  );
};
export default Overview;