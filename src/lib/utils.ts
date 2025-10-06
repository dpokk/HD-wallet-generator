import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function formatPublicKey(publicKey: Uint8Array) {
  return toHex(publicKey);
}

export function formatPrivateKey(secretKey: Uint8Array) {
  return toHex(secretKey.subarray(0, 32));
}
