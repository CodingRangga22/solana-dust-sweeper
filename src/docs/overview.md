# Arsweep Overview

## Introduction

Arsweep is a non-custodial Solana wallet hygiene tool designed to help users reclaim SOL locked in empty SPL token accounts.

When SPL token accounts reach zero balance, they remain open and hold a rent-exempt deposit (~0.00203928 SOL). Arsweep enables users to safely close these accounts and recover the rent back to their wallet.

## Problem

On Solana, every SPL token account requires a rent-exempt deposit.  
Users who trade frequently or receive airdrops often accumulate dozens of empty token accounts.

Each unused account locks SOL permanently unless manually closed.

## Solution

Arsweep:

- Scans wallet for empty SPL token accounts
- Identifies reclaimable rent deposits
- Batches CloseAccount instructions
- Returns rent directly to the user wallet
- Deducts a transparent 1.5% service fee

All transactions are executed using standard SPL Token instructions.

## Core Principles

- Non-custodial
- No private key access
- No custom smart contract required
- Fully client-side execution
- Open source architecture
