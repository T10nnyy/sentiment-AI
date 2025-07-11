"use client"

import { useState, useCallback } from "react"
import { restApi, graphqlApi } from "@/lib/api"
import type { SentimentResult, BatchPredictResponse, ModelInfo, ApiError } from "@/types/sentiment"

// Single prediction hook
export function useSentimentPrediction() {
  const [result, setResult] = useState<SentimentResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const predict = useCallback(async (text: string, useGraphQL = false) => {
    if (!text.trim()) {
      setError("Text cannot be empty")
      return
    }

    setLoading(true)
    setError(null)

    try {
      let result: SentimentResult

      if (useGraphQL) {
        result = await graphqlApi.predict(text)
      } else {
        result = await restApi.predict({ text })
      }

      setResult(result)
      return result
    } catch (err) {
      const errorMessage = (err as ApiError).detail || "Failed to analyze sentiment"
      setError(errorMessage)
      console.error("Sentiment prediction error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    result,
    loading,
    error,
    predict,
    reset,
  }
}

// Batch prediction hook
export function useBatchPrediction() {
  const [results, setResults] = useState<BatchPredictResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const predictBatch = useCallback(async (texts: string[], useGraphQL = false) => {
    if (!texts.length) {
      setError("No texts provided")
      return
    }

    // Filter out empty texts
    const validTexts = texts.filter((text) => text.trim())
    if (!validTexts.length) {
      setError("No valid texts provided")
      return
    }

    setLoading(true)
    setError(null)

    try {
      let result: BatchPredictResponse

      if (useGraphQL) {
        const batchResults = await graphqlApi.predictBatch(validTexts)
        result = {
          results: batchResults,
          total_processing_time: 0,
          average_processing_time: 0,
        }
      } else {
        result = await restApi.predictBatch({ texts: validTexts })
      }

      setResults(result)
      return result
    } catch (err) {
      const errorMessage = (err as ApiError).detail || "Failed to analyze batch sentiment"
      setError(errorMessage)
      console.error("Batch prediction error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const analyzeFile = useCallback(async (file: File) => {
    setLoading(true)
    setError(null)

    try {
      const result = await restApi.analyzeFile(file)
      setResults(result)
      return result
    } catch (err) {
      const errorMessage = (err as ApiError).detail || "Failed to analyze file"
      setError(errorMessage)
      console.error("File analysis error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResults(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    results,
    loading,
    error,
    predictBatch,
    analyzeFile,
    reset,
  }
}

// Model info hook
export function useModelInfo() {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchModelInfo = useCallback(async (useGraphQL = false) => {
    setLoading(true)
    setError(null)

    try {
      let info: ModelInfo

      if (useGraphQL) {
        info = await graphqlApi.getModelInfo()
      } else {
        info = await restApi.getModelInfo()
      }

      setModelInfo(info)
      return info
    } catch (err) {
      const errorMessage = (err as ApiError).detail || "Failed to fetch model info"
      setError(errorMessage)
      console.error("Model info error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    modelInfo,
    loading,
    error,
    fetchModelInfo,
  }
}

// Health check hook
export function useHealthCheck() {
  const [health, setHealth] = useState<{ status: string; service: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkHealth = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await restApi.healthCheck()
      setHealth(result)
      return result
    } catch (err) {
      const errorMessage = (err as ApiError).detail || "Failed to check health"
      setError(errorMessage)
      console.error("Health check error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    health,
    loading,
    error,
    checkHealth,
  }
}

// Analysis history hook
export function useAnalysisHistory() {
  const [history, setHistory] = useState<SentimentResult[]>([])

  const addToHistory = useCallback((result: SentimentResult) => {
    setHistory((prev) => {
      const newHistory = [result, ...prev.slice(0, 99)] // Keep last 100 results
      // Save to localStorage
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("sentiment-analysis-history", JSON.stringify(newHistory))
        }
      } catch (error) {
        console.warn("Failed to save history to localStorage:", error)
      }
      return newHistory
    })
  }, [])

  const loadHistory = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("sentiment-analysis-history")
        if (saved) {
          setHistory(JSON.parse(saved))
        }
      }
    } catch (error) {
      console.warn("Failed to load history from localStorage:", error)
    }
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("sentiment-analysis-history")
      }
    } catch (error) {
      console.warn("Failed to clear history from localStorage:", error)
    }
  }, [])

  const removeFromHistory = useCallback((index: number) => {
    setHistory((prev) => {
      const newHistory = prev.filter((_, i) => i !== index)
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("sentiment-analysis-history", JSON.stringify(newHistory))
        }
      } catch (error) {
        console.warn("Failed to save history to localStorage:", error)
      }
      return newHistory
    })
  }, [])

  return {
    history,
    addToHistory,
    loadHistory,
    clearHistory,
    removeFromHistory,
  }
}

// Default export for backward compatibility
export default {
  useSentimentPrediction,
  useBatchPrediction,
  useModelInfo,
  useHealthCheck,
  useAnalysisHistory,
}
