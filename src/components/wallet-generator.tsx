"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { mnemonicToSeedSync, validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { hmac } from "@noble/hashes/hmac";
import { sha512 } from "@noble/hashes/sha512";
import nacl from "tweetnacl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatPrivateKey, formatPublicKey, toHex } from "@/lib/utils";

type Wallet = {
  index: number;
  publicKey: string;
  privateKey: string;
};

const MNEMONIC_PLACEHOLDER = "connect climb produce kingdom walnut glove ...";

function normalizeMnemonic(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .join(" ");
}

function deriveWallet(masterSeed: Uint8Array, index: number): Wallet {
  const indexBuffer = new Uint8Array(8);
  const view = new DataView(indexBuffer.buffer);
  view.setBigUint64(0, BigInt(index), false);
  const derived = hmac(sha512, masterSeed, indexBuffer);
  const entropy = derived.slice(0, 32);
  const keyPair = nacl.sign.keyPair.fromSeed(entropy);

  return {
    index,
    publicKey: formatPublicKey(keyPair.publicKey),
    privateKey: formatPrivateKey(keyPair.secretKey),
  };
}

export function WalletGenerator() {
  const [mnemonic, setMnemonic] = useState("");
  const [seed, setSeed] = useState<Uint8Array | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [passphrase, setPassphrase] = useState("");
  const [copyNotice, setCopyNotice] = useState<string | null>(null);

  const seedPreview = useMemo(() => {
    if (!seed) return null;
    return toHex(seed.slice(0, 16));
  }, [seed]);

  useEffect(() => {
    if (!copyNotice) return;
    const timeout = window.setTimeout(() => setCopyNotice(null), 2000);
    return () => window.clearTimeout(timeout);
  }, [copyNotice]);

  const handleCreate = () => {
    const normalized = normalizeMnemonic(mnemonic);
    if (!normalized) {
      setError("Enter a BIP-39 mnemonic phrase (12-24 words).");
      return;
    }
    if (!validateMnemonic(normalized, wordlist)) {
      setError("That mnemonic isn't valid. Double-check spelling and word count.");
      return;
    }

    const nextSeed = mnemonicToSeedSync(normalized, passphrase.trim());
    const firstWallet = deriveWallet(nextSeed, 0);

    setSeed(nextSeed);
    setWallets([firstWallet]);
    setError(null);
  };

  const handleAddWallet = () => {
    if (!seed) {
      setError("Create the first wallet before deriving more.");
      return;
    }
    const nextIndex = wallets.length;
    const nextWallet = deriveWallet(seed, nextIndex);
    setWallets((prev: Wallet[]) => [...prev, nextWallet]);
  };

  const handleCopy = async (value: string, label: string) => {
    if (!("clipboard" in navigator)) {
      setCopyNotice("Clipboard not available in this browser.");
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      setCopyNotice(`${label} copied to clipboard.`);
    } catch {
      setCopyNotice("Copy failed. Check browser permissions.");
    }
  };

  const handleReset = () => {
    setSeed(null);
    setWallets([]);
    setError(null);
  };

  return (
    <div className="space-y-12">
      <section className="space-y-4 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-primary">Wallet Generator</h1>
        <p className="text-muted-foreground">
          Feed in an existing BIP-39 mnemonic to deterministically derive as many Ed25519 wallets as you need.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Seed Inputs</CardTitle>
            <CardDescription>
              Paste your mnemonic and (optionally) a passphrase to lock in your seed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="mnemonic">Mnemonic phrase</Label>
              <Textarea
                id="mnemonic"
                placeholder={MNEMONIC_PLACEHOLDER}
                value={mnemonic}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                  setMnemonic(event.target.value)
                }
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passphrase">Optional passphrase</Label>
              <Input
                id="passphrase"
                type="password"
                placeholder="Leave blank if none"
                value={passphrase}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setPassphrase(event.target.value)
                }
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : seedPreview ? (
              <p className="text-sm text-muted-foreground">
                Seed preview: <span className="font-mono">{seedPreview}…</span>
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleCreate}>Create wallet</Button>
              <Button
                onClick={handleAddWallet}
                variant="secondary"
                disabled={!seed}
              >
                Derive next wallet
              </Button>
              <Button onClick={handleReset} variant="ghost">
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn("bg-card", !seed && "opacity-60")}
          aria-disabled={!seed}
        >
          <CardHeader>
            <CardTitle>What&apos;s happening?</CardTitle>
            <CardDescription>
              Each wallet is deterministically derived from your seed using HMAC-SHA512 and Ed25519.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>The mnemonic is validated against the English BIP-39 wordlist.</p>
            <p>
              We compute the master seed (PBKDF2) and run it through HMAC-SHA512 with an incrementing index to carve out fresh 32-byte seeds for Ed25519 keypairs.
            </p>
            <p>
              Private keys shown here are truncated to the raw secret scalar. Handle them carefully—this demo doesn&apos;t store anything remotely.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Derived wallets</h2>
          <span className="text-sm text-muted-foreground">{wallets.length} total</span>
        </div>
        {wallets.length === 0 ? (
          <Card className="border-dashed border-border bg-card text-muted-foreground">
            <CardContent className="py-10 text-center">
              No wallets yet. Add your mnemonic above and create the first wallet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {wallets.map((wallet) => (
              <Card key={wallet.index} className="bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Wallet #{wallet.index + 1}
                    <span className="text-xs font-normal text-muted-foreground">
                      Path index {wallet.index}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="space-y-2">
                    <p className="text-muted-foreground">Public key</p>
                    <div className="flex items-center justify-between gap-3 rounded-md border border-border/70 bg-muted/30 p-3">
                      <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">••••••••••••••••••••••••••••</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleCopy(wallet.publicKey, `Public key for wallet ${wallet.index + 1}`)
                        }
                        aria-label={`Copy public key for wallet ${wallet.index + 1}`}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-muted-foreground">Private key (32-byte seed)</p>
                    <div className="flex items-center justify-between gap-3 rounded-md border border-border/70 bg-muted/30 p-3">
                      <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">••••••••••••••••••••••••••••</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleCopy(wallet.privateKey, `Private key for wallet ${wallet.index + 1}`)
                        }
                        aria-label={`Copy private key for wallet ${wallet.index + 1}`}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {!!copyNotice && (
          <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
            {copyNotice}
          </p>
        )}
      </section>
    </div>
  );
}
