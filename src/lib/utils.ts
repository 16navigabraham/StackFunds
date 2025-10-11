import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  try {
    const parsed = address;
    return `${parsed.substring(0, chars + 2)}...${parsed.substring(
      parsed.length - chars
    )}`;
  } catch (error) {
    return address;
  }
}
