# Architecture

## System Design

Arsweep operates using a stateless client-side architecture.

There is:

- No backend wallet storage
- No private key handling
- No custodial contract

All operations are executed directly between the user's wallet and the Solana network.

## Transaction Flow

1. Wallet connects via Wallet Adapter
2. getParsedTokenAccountsByOwner scans SPL accounts
3. Eligibility engine classifies accounts (zero-balance, dust amount, low USD value, no liquidity)
4. Optional swap flow (Jupiter) is used when liquidity/value exists
5. Optional burn is allowed **only** when value == 0 AND liquidity == 0
6. `createCloseAccountInstruction()` is generated (SPL Token or Token-2022)
7. Close instructions are batched to fit tx size / compute limits
8. Transaction is signed by the user
9. Rent is returned to the user's wallet
10. 1.5% service fee is transferred to treasury as a separate System Program transfer (+ Memo)

## Instructions Used

Common instructions:

- `spl_token::close_account` (rent → user)
- `spl_token::burn` (only for worthless dust balances)
- `system_program::transfer` (service fee → treasury)
- `memo` (audit label)

No custodial on-chain program is required for the core sweeper flow.

## Security Model

Arsweep does not:

- Store wallet addresses
- Store transaction data
- Proxy transactions
- Modify instructions beyond close/burn + an explicit fee transfer
