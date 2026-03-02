# Security

## Non-Custodial

Arsweep never has access to user private keys.

All transactions are signed locally by the user's wallet.

## Limited Permissions

Arsweep only requests permission to:

- Close empty SPL token accounts
- Transfer 1.5% of reclaimed rent as service fee

It does not transfer main SOL balance or tokens with value.

## Stateless Execution

No user data is stored server-side.

All logic runs inside the browser using:

- @solana/web3.js
- @solana/spl-token

## Transparent Codebase

Arsweep is open-source and auditable.

Users can verify:
- Instructions used
- Fee calculations
- RPC endpoints
- Treasury wallet
