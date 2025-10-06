# Hierarchical Deterministic (HD) Wallet Generator

Hierarchical Deterministic (HD) wallets are a type of wallet that can generate a tree of key pairs from a single seed. This allows for the generation of multiple addresses from a single root seed, providing convenience.

## 🔍 What this project does

1. **Mnemonic intake** – Users paste an existing 12–24 word BIP-39 mnemonic and can optionally supply a BIP-39 passphrase.
2. **Seed derivation** – The app runs the mnemonic through the PBKDF2 routine defined by BIP-39 to obtain the master seed entirely in the browser.
3. **Deterministic derivation** – Each wallet is derived via HMAC-SHA512 using the master seed plus an incrementing index, producing 32 bytes of entropy for an Ed25519 keypair.
4. **Key material presentation** – The generated Ed25519 public/private keypair can be revealed or copied per wallet. Ed25519 is the signature scheme used by Solana and several other modern chains, so the derived keys are directly compatible.

All cryptographic work happens client-side; nothing is sent to a server.

## 🧰 Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS with custom shadcn/ui primitives for the minimal dark interface
- `@scure/bip39`, `@noble/hashes`, and `tweetnacl` for standards-compliant key derivation

## 🚀 Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/dpokk/HD-wallet-generator.git
cd HD-wallet-generator
npm install
```

Run the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the wallet generator.

## ⚠️ Operational notes

- Generated keys are rendered in your browser and are **never persisted** by the app.
- Treat mnemonic phrases and derived keys as sensitive secrets—avoid using this demo for mainnet funds.
- This project was made for understanding how to work with cryptographic libraries hence it does not use actual sol/btc/eth libraries
