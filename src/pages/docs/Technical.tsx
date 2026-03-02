const Technical = () => {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8">Technical Specifications</h1>

      <h2 className="text-2xl font-semibold mb-4">Rent-Exempt Mechanism</h2>
      <p className="text-muted-foreground mb-6">
        Each SPL Token account on Solana requires a rent-exempt minimum balance
        (currently ~0.00203928 SOL). When the token balance becomes zero, the
        account remains open and continues holding the rent deposit.
      </p>

      <h2 className="text-2xl font-semibold mb-4">Instruction Used</h2>
      <p className="text-muted-foreground mb-4">
        Arsweep uses a single native SPL Token instruction:
      </p>

      <div className="bg-muted rounded-xl p-5 font-mono text-sm">
        createCloseAccountInstruction(
          tokenAccount,
          destinationWallet,
          ownerWallet
        );
      </div>

      <p className="text-muted-foreground mt-6">
        No custom on-chain programs are deployed. All transactions interact
        directly with the official SPL Token program.
      </p>
    </div>
  );
};

export default Technical;