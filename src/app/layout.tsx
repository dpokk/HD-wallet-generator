import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wallet Generator",
  description: "Generate deterministic crypto wallets from your mnemonic seed.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background text-foreground", inter.className)}>
        <div className="relative flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
