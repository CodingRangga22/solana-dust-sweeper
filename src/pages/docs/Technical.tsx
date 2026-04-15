const Technical = () => {
  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">Technical Reference</div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Technical Specifications</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">Architecture and transaction flow for Ars​weep.</p>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Tech Stack</h2>
      <div className="grid grid-cols-2 gap-3 mb-10">
        {[["Frontend","React + Vite + TypeScript"],["Styling","Tailwind CSS + shadcn/ui"],["Wallet","Privy + Solana Wallet Adapter"],["Price Oracle","Dexscreener + Jupiter"],["Liquidity Check","Jupiter Quote API"],["Risk Intel","RugCheck"],["Network","Solana Mainnet/Devnet"],["RPC","Helius / custom RPC"]].map(([layer,value])=>(
          <div key={layer} className="p-4 rounded-xl border bg-muted/20">
            <p className="text-xs text-muted-foreground mb-1">{layer}</p>
            <p className="text-sm font-medium font-mono">{value}</p>
          </div>
        ))}
      </div>
      <h2 className="text-2xl font-semibold mb-4">Rent-Exempt Mechanism</h2>
      <p className="text-muted-foreground leading-relaxed mb-4">Solana requires every account to maintain a minimum lamport balance proportional to its data size. For a standard SPL Token account (165 bytes), this is approximately <strong className="text-foreground">0.00203928 SOL</strong>.</p>
      <p className="text-muted-foreground leading-relaxed mb-6">When a token balance reaches zero, the account remains open on-chain holding the rent deposit. Ars​weep closes these accounts and returns the locked lamports to the wallet owner.</p>
      <h2 className="text-2xl font-semibold mb-4">On-chain Operations</h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Arsweep executes sweeps using standard Solana programs (SPL Token + System Program). The client builds a transaction that:
        (1) optionally burns worthless balances, (2) closes token accounts to reclaim rent, and (3) transfers a 1.5% service fee to the treasury.
      </p>
      <div className="bg-muted rounded-xl p-5 text-sm font-mono overflow-x-auto mb-6">
        <pre>{`tx.add(
  // optional: spl_token::burn (only when value == 0 AND liquidity == 0)
  // spl_token::close_account (rent goes back to user)
  // memo: "Arsweep service fee: ... (1.5%)"
  // system_program::transfer (user -> treasury fee)
)`}</pre>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Account Validation</h2>
      <div className="space-y-3 mb-10">
        {[
          {check:"Signer owns token account",desc:"The wallet must be the owner/authority of the token account to close it."},
          {check:"Value & liquidity protection",desc:"Accounts with value/liquidity should be swapped first. Burn is only allowed when value == 0 AND liquidity == 0."},
          {check:"Treasury transfer is explicit",desc:"Service fee is a separate System Program transfer (verifiable on-chain) plus a Memo for easy auditing."},
          {check:"Simulation-first mindset",desc:"In production, you should simulate/preview before signing; the UI is designed to make outcomes visible."},
        ].map(({check,desc})=>(
          <div key={check} className="flex gap-4 p-4 rounded-xl border bg-muted/20">
            <code className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded shrink-0 h-fit">{check}</code>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
      <h2 className="text-2xl font-semibold mb-4">Transaction Flow</h2>
      <div className="space-y-2 mb-10">
        {[
          {step:"1",title:"Wallet scan",desc:"Frontend fetches all SPL token accounts via getParsedTokenAccountsByOwner."},
          {step:"2",title:"Eligibility + risk checks",desc:"Each account is evaluated (balance, USD value, liquidity routes, and RugCheck signals) before being marked sweepable."},
          {step:"3",title:"Instruction build",desc:"Client builds SPL Token burn/close instructions (when safe) and a System Program transfer for the service fee."},
          {step:"4",title:"Batch transaction",desc:"Accounts are processed in batches to avoid tx size / compute limits."},
          {step:"5",title:"On-chain execution",desc:"SPL Token closes accounts (rent → user). Then the fee transfer sends 1.5% to treasury with an audit Memo."},
          {step:"6",title:"Confirmation",desc:"UI waits for confirmation and shows the explorer link for every batch signature."},
        ].map(({step,title,desc})=>(
          <div key={step} className="flex gap-4 p-4 rounded-xl border bg-muted/20">
            <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">{step}</span>
            <div><p className="font-semibold text-sm mb-0.5">{title}</p><p className="text-sm text-muted-foreground">{desc}</p></div>
          </div>
        ))}
      </div>
      <h2 className="text-2xl font-semibold mb-4">Legacy Notes</h2>
      <p className="text-muted-foreground leading-relaxed mb-10">
        The repo includes an Anchor IDL/program reference, but the current default sweep flow is implemented client-side using SPL Token + System Program.
        In practice, what matters for users is the transaction you sign: burn/close instructions (when eligible) plus an explicit fee transfer to treasury.
      </p>
      <h2 className="text-2xl font-semibold mb-4">Eligibility Engine</h2>
      <p className="text-muted-foreground leading-relaxed mb-4">Accounts scored off-chain against 4 criteria. Must meet at least 2 to be sweepable — except zero balance which alone qualifies.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold">Criteria</th><th className="text-left py-2 pr-4 font-semibold">Threshold</th><th className="text-left py-2 font-semibold">Source</th></tr></thead>
          <tbody className="text-muted-foreground">
            {[["Zero balance","amount === 0","On-chain"],["Dust amount","amount 1000 raw units","On-chain"],["No liquidity pool","No Jupiter route found","Jupiter API"],["Low USD value","Less than $1.00","Jupiter Price API"]].map(([c,t,s])=>(
              <tr key={c} className="border-b last:border-0">
                <td className="py-2 pr-4 font-medium text-foreground">{c}</td>
                <td className="py-2 pr-4 font-mono text-xs">{t}</td>
                <td className="py-2">{s}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Technical;