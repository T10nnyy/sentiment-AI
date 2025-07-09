/**
 * Utility functions and helpers
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Environment helpers that work on both client and server
export const isDevelopment = () => {
  if (typeof window !== "undefined") {
    // Client-side check
    return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  }
  // Server-side check
  return process.env.NODE_ENV === "development"
}

export const isProduction = () => {
  if (typeof window !== "undefined") {
    // Client-side check
    return window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
  }
  // Server-side check
  return process.env.NODE_ENV === "production"
}

// API URL helpers
export const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
}

export const getGraphQLUrl = () => {
  return process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8000/graphql"
}

// Feature flag helpers
export const isLiveTypingEnabled = () => {
  return process.env.NEXT_PUBLIC_ENABLE_LIVE_TYPING === "true"
}

export const getDebounceDelay = () => {
  return Number.parseInt(process.env.NEXT_PUBLIC_DEBOUNCE_DELAY || "500")
}

// Format helpers
export const formatTimestamp = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export const formatConfidence = (score: number) => {
  return `${(score * 100).toFixed(1)}%`
}

export const getConfidenceLevel = (score: number) => {
  if (score >= 0.8) return { level: "High", color: "text-green-600 dark:text-green-400" }
  if (score >= 0.6) return { level: "Medium", color: "text-yellow-600 dark:text-yellow-400" }
  return { level: "Low", color: "text-red-600 dark:text-red-400" }
}

// Sentiment helpers
export const getSentimentColor = (label: string) => {
  return label === "positive" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
}

export const getSentimentBg = (label: string) => {
  return label === "positive"
    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
}
