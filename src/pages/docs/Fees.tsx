import { Link } from "react-router-dom";

export default function Fees() {
  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">Fee Model</div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Fee Model</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">Arsweep charges a transparent 1.5% service fee per sweep, deducted on-chain and verifiable on Solscan.</p>
      </div>
      <div className="border border-primary/20 bg-primary/5 rounded-xl p-5 mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">$ASWP vs. this fee</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">$ASWP</strong> is the community ecosystem token (e.g. rewards and roadmap utility on the{" "}
          <Link to="/token" className="text-primary hover:underline">token page</Link>
          ). It does <strong className="text-foreground">not</strong> replace SOL rent refunds. The <strong className="text-foreground">1.5% platform fee is always settled in SOL</strong> as described below. You do not need to hold $ASWP to use the sweeper.
        </p>
      </div>
      <div className="bg-muted/50 border rounded-xl p-6 mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Calculation</p>
        <p className="font-mono text-sm leading-relaxed">
          Gross Refund = Rent recovered from closed accounts<br/>
          Service Fee = Gross Refund x 1.5%<br/>
          Network Gas = Solana transaction fee (~0.000005 SOL)<br/>
          <span className="text-primary font-bold">You Receive = Gross Refund - Service Fee - Network Gas</span>
        </p>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Example — 10 Accounts</h2>
      <div className="border rounded-xl overflow-hidden mb-10">
        <div className="p-4 bg-muted/30 border-b"><p className="text-sm font-medium">Sweeping 10 empty token accounts</p></div>
        <div className="divide-y text-sm">
          {[["Rent per account","0.00203928 SOL",false],["Gross refund (10x)","0.02039280 SOL",false],["Service fee (1.5%)","0.00030589 SOL",true],["Network gas","0.00000500 SOL",true]].map(([label,value,neg])=>(
            <div key={label as string} className={`flex justify-between px-4 py-3 ${neg?"text-muted-foreground":""}`}>
              <span>{label as string}</span>
              <span className={`font-mono ${neg?"text-red-400":""}`}>{value as string}</span>
            </div>
          ))}
          <div className="flex justify-between px-4 py-3 bg-primary/5 font-semibold">
            <span className="text-primary">You receive</span>
            <span className="font-mono text-primary">0.02008191 SOL</span>
          </div>
        </div>
      </div>
      <h2 className="text-2xl font-semibold mb-4">What the Fee Covers</h2>
      <div className="space-y-3 mb-10">
        {[
          {icon:"🌐",title:"RPC infrastructure",desc:"High-availability Solana RPC access for fast account scanning and transaction broadcasting."},
          {icon:"🔍",title:"Jupiter API integration",desc:"Token price lookups and liquidity checks via Jupiter Price API v2 to accurately identify eligible accounts."},
          {icon:"🛠️",title:"Development and maintenance",desc:"Ongoing program upgrades, security audits, and feature development."},
          {icon:"🖥️",title:"Frontend hosting",desc:"Reliable web hosting and CDN delivery for the Ars​weep app."},
        ].map(({icon,title,desc})=>(
          <div key={title} className="flex gap-4 p-4 rounded-xl border bg-muted/20">
            <span className="text-2xl shrink-0">{icon}</span>
            <div><p className="font-semibold mb-0.5">{title}</p><p className="text-sm text-muted-foreground">{desc}</p></div>
          </div>
        ))}
      </div>
      <h2 className="text-2xl font-semibold mb-4">On-Chain Verification</h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        The 1.5% fee is implemented as a separate{" "}
        <span className="font-mono text-foreground">SystemProgram.transfer</span> to the public treasury address below, plus a Memo for easy auditing.
        You can verify the exact lamports sent to treasury on any sweep signature.
      </p>
      <div className="bg-muted/50 border rounded-xl p-4 font-mono text-xs break-all mb-4">BfqfpTe6yv5TTTGrcNVRPVfQ3h6FwzhC78LGbGAN5NkT</div>
      <p className="text-sm text-muted-foreground">Verify any sweep on <a href="https://solscan.io/?cluster=devnet" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Solscan</a> to confirm exact fee and treasury destination.</p>
    </div>
  );
}