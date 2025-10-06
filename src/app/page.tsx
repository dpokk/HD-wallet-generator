import { WalletGenerator } from "@/components/wallet-generator";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col px-6 py-12 sm:px-10 lg:px-16">
      <WalletGenerator />
    </main>
  );
}
