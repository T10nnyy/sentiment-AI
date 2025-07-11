import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility functions for sentiment analysis
export function formatSentimentLabel(label: string): string {
  const labelMap: Record<string, string> = {
    POSITIVE: "Positive",
    NEGATIVE: "Negative",
    NEUTRAL: "Neutral",
    LABEL_0: "Negative",
    LABEL_1: "Neutral",
    LABEL_2: "Positive",
  }
  return labelMap[label] || label
}

export function getSentimentColor(label: string): string {
  const normalizedLabel = formatSentimentLabel(label).toLowerCase()
  switch (normalizedLabel) {
    case "positive":
      return "text-green-600 bg-green-50"
    case "negative":
      return "text-red-600 bg-red-50"
    case "neutral":
      return "text-gray-600 bg-gray-50"
    default:
      return "text-gray-600 bg-gray-50"
  }
}

export function formatConfidence(score: number): string {
  return `${(score * 100).toFixed(1)}%`
}

export function formatProcessingTime(time: number): string {
  if (time < 1) {
    return `${(time * 1000).toFixed(0)}ms`
  }
  return `${time.toFixed(2)}s`
}

// Environment utilities for Vercel deployment
export function isLiveTypingEnabled(): boolean {
  if (typeof window === "undefined") return true
  return process.env.NEXT_PUBLIC_ENABLE_LIVE_TYPING !== "false"
}

export function getDebounceDelay(): number {
  const delay = process.env.NEXT_PUBLIC_DEBOUNCE_DELAY
  return delay ? Number.parseInt(delay, 10) : 500
}

export function getApiUrl(): string {
  if (typeof window !== "undefined") {
    // Client-side
    return (
      process.env.NEXT_PUBLIC_API_URL ||
      (window.location.hostname.includes("vercel.app")
        ? `https://${window.location.hostname}`
        : "http://localhost:8000")
    )
  } else {
    // Server-side
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  }
}

export function isProduction(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    (typeof window !== "undefined" && window.location.hostname.includes("vercel.app"))
  )
}

// File processing utilities
export function validateFileType(file: File): boolean {
  const allowedTypes = ["text/csv", "text/plain", "application/csv"]
  const allowedExtensions = [".csv", ".txt"]

  return allowedTypes.includes(file.type) || allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Data export utilities
export function exportToCSV(data: any[], filename = "sentiment-analysis.csv"): void {
  if (!data.length) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          // Escape commas and quotes in CSV
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        })
        .join(","),
    ),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Local storage utilities
export function saveToLocalStorage(key: string, data: any): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(data))
    }
  } catch (error) {
    console.warn("Failed to save to localStorage:", error)
  }
}

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window !== "undefined") {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    }
  } catch (error) {
    console.warn("Failed to load from localStorage:", error)
  }
  return defaultValue
}

export function removeFromLocalStorage(key: string): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key)
    }
  } catch (error) {
    console.warn("Failed to remove from localStorage:", error)
  }
}
