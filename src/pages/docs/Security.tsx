export default function Security() {
  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6">Security</h1>

      <h2 className="text-xl font-medium mt-8 mb-2">Security Protocol</h2>
      <p className="text-muted-foreground leading-7 mb-4">
        Arsweep is non-custodial and uses only standard SPL Token instructions.
        Your keys never leave your wallet.
      </p>

      <ul className="list-disc list-inside text-muted-foreground leading-7 space-y-2 mb-6">
        <li>Non-custodial: we never hold your private keys</li>
        <li>Limited permissions: only close empty token accounts</li>
        <li>Open source: audit the code on GitHub</li>
      </ul>

      <h2 className="text-xl font-medium mt-8 mb-2">Instructions Used</h2>
      <p className="text-muted-foreground leading-7 mb-4">
        A single Solana instruction is used: <code className="px-1.5 py-0.5 rounded bg-muted text-foreground text-sm font-mono">CloseAccount</code> from the SPL Token program.
      </p>
    </>
  );
}
