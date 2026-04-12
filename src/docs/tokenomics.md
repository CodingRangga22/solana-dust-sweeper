# Tokenomics & Fee Model

## $ASWP (ecosystem token) vs. sweep fees (SOL)

**$ASWP** is the Solana SPL token for the Arsweep community — traded on [Pump.fun](https://pump.fun/coin/dTMaF2F97BWo6s416JqsDrpzdwa1uarKngSwf25pump) and used for ecosystem incentives, future utility, and governance-style features described on the [$ASWP page](/token). It is **not** the asset your rent refund is paid in when you sweep.

**Core product revenue** from the sweeper is unchanged: a transparent **1.5% service fee on reclaimed rent**, settled in **SOL** (see below). You do **not** need to hold $ASWP to scan wallets or close empty token accounts.

## Fee Structure (sweeper — SOL)

For each closed account:

Rent per account ≈ 0.00203928 SOL

Service fee: 1.5%  
User receives: 98.5% (before network gas)

## Example

10 accounts closed:

Total rent reclaimed: 0.0203928 SOL  
Service fee (1.5%): 0.000305892 SOL  
User receives ≈ 0.0200869 SOL (minus network fees)

## Treasury Usage

SOL service fees cover:

- RPC infrastructure
- Hosting
- Maintenance
- Ongoing development
