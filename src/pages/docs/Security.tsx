export default function Security() {
  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">Security</div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Security</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">Arsweep is built with a non-custodial, trust-minimized architecture. Your assets and keys are always under your control.</p>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Security Guarantees</h2>
      <div className="space-y-3 mb-10">
        {[
          {icon:"🔑",title:"Private keys never leave your wallet",desc:"Ars​weep never requests, stores, or transmits your private keys. All signing happens inside your wallet using the Solana Wallet Adapter standard."},
          {icon:"✅",title:"On-chain authority validation",desc:"The Anchor program validates token authority on every account before closing. A malicious client cannot sweep accounts owned by other wallets."},
          {icon:"🏦",title:"Treasury address hardcoded on-chain",desc:"The treasury address is validated using an address constraint in the program. Even if the frontend is compromised, fees cannot be redirected."},
          {icon:"🔢",title:"Overflow-safe arithmetic",desc:"All fee calculations use Rust checked_mul and checked_div. Overflow causes the transaction to fail safely."},
          {icon:"📖",title:"Open source and auditable",desc:"Smart contract logic is fully on-chain and verifiable. Anyone can audit transactions via Solana Explorer."},
        ].map(({icon,title,desc})=>(
          <div key={title} className="flex gap-4 p-4 rounded-xl border bg-muted/20">
            <span className="text-2xl shrink-0">{icon}</span>
            <div><p className="font-semibold mb-1">{title}</p><p className="text-sm text-muted-foreground leading-relaxed">{desc}</p></div>
          </div>
        ))}
      </div>
      <h2 className="text-2xl font-semibold mb-4">What Ars​weep Cannot Do</h2>
      <div className="bg-muted/40 border rounded-xl p-5 mb-10">
        <ul className="space-y-2 text-sm text-muted-foreground">
          {["Access or move SOL from your main wallet balance","Close token accounts with non-zero token balances","Redirect fees to any address other than the hardcoded treasury","Sign transactions without your explicit wallet approval","Store or log your wallet address or transaction history"].map(item=>(
            <li key={item} className="flex items-start gap-2"><span className="text-green-500 mt-0.5 shrink-0">x</span><span>{item}</span></li>
          ))}
        </ul>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Threat Model</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold">Threat</th><th className="text-left py-2 font-semibold">Mitigation</th></tr></thead>
          <tbody className="text-muted-foreground">
            {[["Frontend compromise","Treasury hardcoded on-chain — fee destination cannot change"],["Fake treasury injection","address constraint in Anchor program rejects mismatched accounts"],["Unauthorized sweep","token authority check — only account owner can close"],["Non-empty account sweep","amount == 0 constraint enforced on-chain"],["Math overflow","checked arithmetic — tx fails safely on overflow"]].map(([threat,mit])=>(
              <tr key={threat} className="border-b last:border-0">
                <td className="py-2 pr-4 font-medium text-foreground">{threat}</td>
                <td className="py-2">{mit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}