# Arsweep Overview

## Introduction

Arsweep is a non-custodial Solana wallet hygiene tool designed to help users reclaim SOL locked in empty SPL token accounts.

When SPL token accounts reach zero balance, they remain open and hold a rent-exempt deposit (~0.00203928 SOL). Arsweep enables users to safely close these accounts and recover the rent back to their wallet.

Arsweep supports both **SPL Token** and **Token-2022** accounts.

## Problem

On Solana, every SPL token account requires a rent-exempt deposit.  
Users who trade frequently or receive airdrops often accumulate dozens of empty token accounts.

Each unused account locks SOL permanently unless manually closed.

## Solution

Arsweep:

- Scans wallet for empty SPL token accounts
- Identifies reclaimable rent deposits
- Batches SPL Token `CloseAccount` instructions
- Optionally burns dust balances **only** when a token is confirmed worthless (no liquidity route + $0 value)
- Returns rent directly to the user wallet
- Deducts a transparent 1.5% service fee

All sweep transactions are executed using standard Solana instructions (SPL Token + System Program + Memo).

## Premium (x402)

Arsweep also exposes **paid agent endpoints** billed per request via the **x402** payment flow (USDC on Solana mainnet).  
When calling a paid endpoint, the server can respond with **HTTP 402 Payment Required**; the client settles payment on-chain and retries with a proof header. See `/x402` in-app.

## Core Principles

- Non-custodial
- No private key access
- Fully client-side execution
- Open source architecture
