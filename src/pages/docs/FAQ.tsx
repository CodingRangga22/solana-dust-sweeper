export default function FAQ() {
  return (
    <>
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-6">FAQ</h1>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium mb-2">What tokens can I close?</h2>
          <p className="text-muted-foreground leading-7 text-sm">
            Only accounts with zero or negligible balance (dust). Arsweep filters these automatically.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-medium mb-2">Is it safe?</h2>
          <p className="text-muted-foreground leading-7 text-sm">
            Yes. Arsweep uses the standard SPL Token CloseAccount instruction. No custom programs.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-medium mb-2">When will I receive my SOL?</h2>
          <p className="text-muted-foreground leading-7 text-sm">
            Immediately after the transaction is confirmed on-chain. Usually within seconds.
          </p>
        </div>
      </div>
    </>
  );
}
