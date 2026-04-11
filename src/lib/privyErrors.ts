/** Surface Privy wallet errors + actionable hint for common misconfigurations. */
export function describePrivyWalletError(err: unknown): string {
  const base =
    err instanceof Error
      ? err.message
      : typeof err === "object" && err !== null && "message" in err
        ? String((err as { message: unknown }).message)
        : String(err);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  if (
    base.includes("generic_connect_wallet_error") ||
    /generic.?connect/i.test(base)
  ) {
    return `${base} — (1) Privy Dashboard: whitelist ${origin || "this origin"}. (2) Phantom: bukan “approve transaction”, biasanya popup Connect / Sign message (SIWS). (3) Matikan popup blocker; unlock extension.`;
  }
  return base;
}
