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
          {icon:"✅",title:"Only you can authorize spending",desc:"Closing/burning token accounts and fee transfers require your wallet signature. Without your approval, Arsweep cannot move funds."},
          {icon:"🧾",title:"Fee destination is visible before you sign",desc:"The 1.5% service fee is a separate System Program transfer to the public treasury address. You can verify the recipient in the wallet transaction preview and on Solscan."},
          {icon:"🧯",title:"Dust burn is gated by safety checks",desc:"Arsweep only burns tokens when they are confirmed worthless (no liquidity route and $0 value). Otherwise it swaps or skips for safety."},
          {icon:"📖",title:"Auditable client behavior",desc:"Transactions are standard Solana instructions (SPL Token + System transfer + Memo). You can audit each signature in Solana Explorer."},
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
          {[
            "Sign transactions without your explicit wallet approval",
            "Move funds from your wallet without showing you the exact instructions first",
            "Close token accounts you don’t own (SPL authority rules prevent it)",
            "Hide fees — the service fee is a separate transfer you can see and audit",
            "Store your wallet keys or seed phrase",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2"><span className="text-green-500 mt-0.5 shrink-0">x</span><span>{item}</span></li>
          ))}
        </ul>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Threat Model</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold">Threat</th><th className="text-left py-2 font-semibold">Mitigation</th></tr></thead>
          <tbody className="text-muted-foreground">
            {[
              ["Frontend compromise","Always review the recipient of the fee transfer in your wallet before signing; use the official domain/build."],
              ["Unauthorized sweep","SPL Token program enforces authority checks — only the token account owner can close/burn."],
              ["Accidental burn of valuable token","Arsweep blocks burning when liquidity/value is detected; swap route is preferred, otherwise the token is skipped."],
              ["Fee confusion","A Memo is included and the fee is a separate transfer so it’s easy to audit in Explorer."],
            ].map(([threat,mit])=>(
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