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
3. Dust accounts are filtered
4. createCloseAccountInstruction is generated
5. Instructions are batched
6. Transaction is signed by user
7. Rent is returned to user wallet
8. 1.5% service fee is transferred to treasury wallet

## Instructions Used

Only one SPL instruction is used:

createCloseAccountInstruction()

No custom on-chain program logic is required.

## Security Model

Arsweep does not:

- Store wallet addresses
- Store transaction data
- Proxy transactions
- Modify instructions beyond CloseAccount and fee transfer
