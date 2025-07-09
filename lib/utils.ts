import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDebounceDelay(): number {
  return Number.parseInt(process.env.NEXT_PUBLIC_DEBOUNCE_DELAY || "300")
}

export function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function truncateText(text: string, maxLength = 100): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

export function calculateConfidenceLevel(score: number): "low" | "medium" | "high" {
  if (score < 0.6) return "low"
  if (score < 0.8) return "medium"
  return "high"
}
