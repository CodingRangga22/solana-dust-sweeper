# Security

## Non-Custodial

Arsweep never has access to user private keys.

All transactions are signed locally by the user's wallet.

## Limited Permissions

Arsweep only requests permission to:

- Close token accounts to reclaim rent (SPL Token / Token-2022)
- Burn dust balances only when they are confirmed worthless (no liquidity route + $0 value)
- Transfer 1.5% of reclaimed rent as a service fee (separate System Program transfer)

It does not transfer main SOL balance or tokens with value.

## Stateless Execution

No user data is stored server-side.

All logic runs inside the browser using:

- @solana/web3.js
- @solana/spl-token

Premium/agent endpoints are requested explicitly by the user and may call the Arsweep API; they still never require your private keys.

## Transparent Codebase

Arsweep is open-source and auditable.

Users can verify:
- Instructions used
- Fee calculations
- RPC endpoints
- Treasury wallet
