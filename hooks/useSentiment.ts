"use client"

import { useState } from "react"
import { api, type SentimentResult, type BatchSentimentResult } from "@/lib/api"

export interface UseSentimentReturn {
  analyzeSentiment: (text: string) => Promise<SentimentResult>
  analyzeBatch: (texts: string[]) => Promise<BatchSentimentResult>
  analyzeFile: (file: File) => Promise<BatchSentimentResult>
  loading: boolean
  error: string | null
}

export function useSentiment(): UseSentimentReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeSentiment = async (text: string): Promise<SentimentResult> => {
    setLoading(true)
    setError(null)

    try {
      const result = await api.analyzeSentiment(text)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Analysis failed"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const analyzeBatch = async (texts: string[]): Promise<BatchSentimentResult> => {
    setLoading(true)
    setError(null)

    try {
      const result = await api.analyzeBatch(texts)
      return result
    } finally {
      setLoading(false)
    }
  }

  const analyzeFile = async (file: File): Promise<BatchSentimentResult> => {
    setLoading(true)
    setError(null)

    try {
      const result = await api.analyzeFile(file)
      return result
    } finally {
      setLoading(false)
    }
  }

  return {
    analyzeSentiment,
    analyzeBatch,
    analyzeFile,
    loading,
    error,
  }
}

export type { SentimentResult, BatchSentimentResult }
