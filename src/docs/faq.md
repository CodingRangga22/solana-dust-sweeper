# FAQ

## Is Arsweep safe?

Yes. Arsweep uses standard Solana instructions (SPL Token burn/close + an explicit fee transfer). You review and sign every transaction in your wallet.

## Does Arsweep control my funds?

No. Arsweep is non-custodial.

## What accounts can be closed?

Zero-balance token accounts can always be closed. Accounts with a dust balance may be burned+closed only when the token is confirmed worthless (no liquidity route + $0 value).

## Can I reverse a closed account?

No. Once closed, the account is permanently removed.

## Is there a token?

Yes. **$ASWP** is the ecosystem token (SPL on Solana; [Pump.fun listing](https://pump.fun/coin/dTMaF2F97BWo6s416JqsDrpzdwa1uarKngSwf25pump)). It is separate from how the app charges for sweeps: the **1.5% service fee on reclaimed rent is still taken in SOL**, and you can use the core sweeper **without** holding $ASWP. See the [$ASWP page](/token) and [Fee model](/docs/fees) for details.
