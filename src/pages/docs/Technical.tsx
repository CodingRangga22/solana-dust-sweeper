const Technical = () => {
  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">Technical Reference</div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Technical Specifications</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">Architecture, on-chain program design, and transaction flow for Ars​weep.</p>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Tech Stack</h2>
      <div className="grid grid-cols-2 gap-3 mb-10">
        {[["Smart Contract","Anchor 0.30 (Rust 1.85)"],["Frontend","React + Vite + TypeScript"],["Styling","Tailwind CSS + shadcn/ui"],["Wallet","Solana Wallet Adapter"],["Price Oracle","Jupiter Price API v2"],["Liquidity Check","Jupiter Quote API"],["Network","Solana Devnet to Mainnet"],["RPC","api.devnet.solana.com"]].map(([layer,value])=>(
          <div key={layer} className="p-4 rounded-xl border bg-muted/20">
            <p className="text-xs text-muted-foreground mb-1">{layer}</p>
            <p className="text-sm font-medium font-mono">{value}</p>
          </div>
        ))}
      </div>
      <h2 className="text-2xl font-semibold mb-4">Rent-Exempt Mechanism</h2>
      <p className="text-muted-foreground leading-relaxed mb-4">Solana requires every account to maintain a minimum lamport balance proportional to its data size. For a standard SPL Token account (165 bytes), this is approximately <strong className="text-foreground">0.00203928 SOL</strong>.</p>
      <p className="text-muted-foreground leading-relaxed mb-6">When a token balance reaches zero, the account remains open on-chain holding the rent deposit. Ars​weep closes these accounts and returns the locked lamports to the wallet owner.</p>
      <h2 className="text-2xl font-semibold mb-4">Anchor Program</h2>
      <p className="text-muted-foreground leading-relaxed mb-4">Arsweep uses a custom Anchor program for on-chain fee validation. The program exposes one instruction: <code className="px-1.5 py-0.5 rounded bg-muted text-foreground text-sm font-mono">close_empty_account</code>.</p>
      <div className="bg-muted rounded-xl p-5 text-sm font-mono overflow-x-auto mb-6">
        <pre>{`pub fn close_empty_account(ctx: Context<CloseEmptyAccount>) -> Result<()> {
    let rent_lamports = ctx.accounts.token_account
        .to_account_info().lamports();
    token::close_account(CpiContext::new(...))?;
    let fee = rent_lamports
        .checked_mul(15)
        .and_then(|v| v.checked_div(1000))
        .ok_or(ArsweepError::MathOverflow)?;
    system_program::transfer(CpiContext::new(...), fee)?;
    emit!(SweepEvent { user, rent_recovered, fee_charged });
    Ok(())
}`}</pre>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Account Validation</h2>
      <div className="space-y-3 mb-10">
        {[
          {check:"token::authority = user",desc:"Verifies the signer owns the token account. Prevents unauthorized sweeps."},
          {check:"amount == 0",desc:"On-chain constraint rejects any account with non-zero token balance."},
          {check:"address = TREASURY_PUBKEY",desc:"Treasury address hardcoded in program. Cannot be spoofed by client."},
          {check:"Checked arithmetic",desc:"All fee calculations use checked_mul and checked_div to prevent overflow."},
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
          {step:"2",title:"Eligibility check",desc:"Each account scored against 4 criteria: zero balance, dust amount, no liquidity, low USD value."},
          {step:"3",title:"Instruction build",desc:"One closeEmptyAccount instruction built per selected account via Anchor SDK."},
          {step:"4",title:"Batch transaction",desc:"All instructions batched into a single transaction (max 5 per tx) for efficiency."},
          {step:"5",title:"On-chain execution",desc:"Anchor program validates, closes accounts, and distributes rent minus 1.5% fee."},
          {step:"6",title:"Confirmation",desc:"Frontend polls for confirmation. SOL arrives in wallet within seconds."},
        ].map(({step,title,desc})=>(
          <div key={step} className="flex gap-4 p-4 rounded-xl border bg-muted/20">
            <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">{step}</span>
            <div><p className="font-semibold text-sm mb-0.5">{title}</p><p className="text-sm text-muted-foreground">{desc}</p></div>
          </div>
        ))}
      </div>
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