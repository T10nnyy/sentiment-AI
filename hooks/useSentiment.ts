"use client"

import { useState, useCallback } from "react"
import { api } from "@/lib/api"

export interface SentimentResult {
  label: string
  score: number
  confidence: number
  processing_time: number
}

export interface BatchSentimentResult {
  results: SentimentResult[]
  total_processing_time: number
  average_processing_time: number
}

export interface ModelInfo {
  name: string
  framework: string
  device: string
  quantized: boolean
  version: string
}

export interface HealthStatus {
  status: string
  service: string
  model_loaded: boolean
  timestamp: string
}

export function useSentiment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeSentiment = useCallback(async (text: string): Promise<SentimentResult | null> => {
    if (!text.trim()) return null

    setLoading(true)
    setError(null)

    try {
      const result = await api.analyzeSentiment(text)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to analyze sentiment"
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const analyzeBatch = useCallback(async (texts: string[]): Promise<BatchSentimentResult | null> => {
    if (texts.length === 0) return null

    setLoading(true)
    setError(null)

    try {
      const result = await api.analyzeBatch(texts)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to analyze batch"
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const analyzeFile = useCallback(async (file: File): Promise<BatchSentimentResult | null> => {
    setLoading(true)
    setError(null)

    try {
      const result = await api.analyzeFile(file)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to analyze file"
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const getModelInfo = useCallback(async (): Promise<ModelInfo | null> => {
    setLoading(true)
    setError(null)

    try {
      const result = await api.getModelInfo()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get model info"
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const getHealth = useCallback(async (): Promise<HealthStatus | null> => {
    setLoading(true)
    setError(null)

    try {
      const result = await api.getHealth()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get health status"
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    analyzeSentiment,
    analyzeBatch,
    analyzeFile,
    getModelInfo,
    getHealth,
  }
}

export function useAnalysisHistory() {
  const [history, setHistory] = useState<
    Array<{
      id: string
      text: string
      result: SentimentResult
      timestamp: Date
    }>
  >([])

  const addToHistory = useCallback((text: string, result: SentimentResult) => {
    const entry = {
      id: Date.now().toString(),
      text,
      result,
      timestamp: new Date(),
    }
    setHistory((prev) => [entry, ...prev].slice(0, 100)) // Keep last 100 entries
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  return {
    history,
    addToHistory,
    clearHistory,
  }
}
