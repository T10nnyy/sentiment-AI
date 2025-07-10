import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatConfidence(confidence: number): string {
  return `${(confidence * 100).toFixed(1)}%`
}

export function getSentimentColor(sentiment: string): string {
  switch (sentiment.toLowerCase()) {
    case "positive":
      return "text-green-600"
    case "negative":
      return "text-red-600"
    case "neutral":
      return "text-gray-600"
    default:
      return "text-blue-600"
  }
}

export function getSentimentBgColor(sentiment: string): string {
  switch (sentiment.toLowerCase()) {
    case "positive":
      return "bg-green-100 dark:bg-green-900/20"
    case "negative":
      return "bg-red-100 dark:bg-red-900/20"
    case "neutral":
      return "bg-gray-100 dark:bg-gray-900/20"
    default:
      return "bg-blue-100 dark:bg-blue-900/20"
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString()
}
