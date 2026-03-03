const Overview = () => {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">Arsweep Documentation</h1>

      <p className="text-muted-foreground leading-relaxed mb-6">
        Arsweep is a non-custodial Solana utility that enables users to reclaim
        rent-exempt SOL locked in empty SPL token accounts.
      </p>

      <div className="bg-muted/50 border rounded-xl p-6 mb-10">
        <p className="text-sm">
          Quick Flow:
          <br />
          Connect Wallet → Scan Accounts → Select Empty Accounts → Confirm Close
        </p>
      </div>

      <h2 className="text-2xl font-semibold mt-10 mb-4">Core Function</h2>
      <p className="text-muted-foreground leading-relaxed">
        Arsweep identifies SPL token accounts with zero balance and executes
        the standard SPL Token Program <code>CloseAccount</code> instruction.
        The reclaimed rent is returned directly to the connected wallet,
        minus a transparent service fee.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">Design Principles</h2>
      <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
        <li>Non-custodial architecture</li>
        <li>Client-side transaction construction</li>
        <li>No private key access</li>
        <li>No backend wallet storage</li>
      </ul>
    </div>
  );
};

export default Overview;