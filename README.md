# Wallet Generator

A minimal dark-themed Next.js app styled with shadcn/ui that deterministically derives Ed25519 wallet keypairs from a BIP-39 mnemonic.

## Features

- 🌓 Dark-first UI built with Tailwind CSS and shadcn/ui primitives
- 🔐 Validates mnemonics against the official English BIP-39 wordlist
- ♾️ Deterministic generation of sequential Ed25519 keypairs using HMAC-SHA512
- 🧮 Optional passphrase support and inline seed preview
- 🪶 All cryptography happens locally in the browser

## Getting Started

```bash
npm install
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Useful Scripts

- `npm run dev` – start the development server
- `npm run lint` – run ESLint and type checks
- `npm run build` – create a production build
- `npm run start` – serve the production build

## Notes

This project is for demo purposes only. Generated keys are displayed in the browser and are not persisted anywhere — handle them responsibly and avoid using them for mainnet transactions.
