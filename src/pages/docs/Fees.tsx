export default function Fees() {
  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6">Fee Model</h1>

      <h2 className="text-xl font-medium mt-8 mb-2">Service Fee</h2>
      <p className="text-muted-foreground leading-7 mb-4">
        A 1.5% service fee is deducted from the reclaimed rent. The remaining 98.5% is sent directly to your wallet.
      </p>

      <div className="rounded-lg border border-border p-4 bg-muted/40 mb-6">
        <p className="text-sm text-muted-foreground leading-7">
          Gross refund − 1.5% fee − network gas ≈ Net SOL you receive.
        </p>
      </div>

      <h2 className="text-xl font-medium mt-8 mb-2">What the Fee Covers</h2>
      <ul className="list-disc list-inside text-muted-foreground leading-7 space-y-2">
        <li>RPC costs for scanning and broadcasting</li>
        <li>Hosting and infrastructure</li>
        <li>Development and maintenance</li>
      </ul>
    </>
  );
}
