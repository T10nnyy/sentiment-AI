"use client"

import { useState, useCallback } from "react"
import type { SentimentResult, BatchSentimentResult } from "@/types/sentiment"
import { useToast } from "@/hooks/use-toast"

export function useSentiment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const analyzeSentiment = useCallback(
    async (text: string): Promise<SentimentResult> => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/v1/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
          throw new Error(errorData.detail || `HTTP ${response.status}`)
        }

        const result = await response.json()
        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Analysis failed"
        setError(errorMessage)
        toast({
          title: "Analysis Failed",
          description: errorMessage,
          variant: "destructive",
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const analyzeBatch = useCallback(
    async (texts: string[]): Promise<SentimentResult[]> => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/v1/analyze/batch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ texts }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
          throw new Error(errorData.detail || `HTTP ${response.status}`)
        }

        const result: BatchSentimentResult = await response.json()
        return result.results
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Batch analysis failed"
        setError(errorMessage)
        toast({
          title: "Batch Analysis Failed",
          description: errorMessage,
          variant: "destructive",
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const analyzeFile = useCallback(
    async (file: File): Promise<SentimentResult[]> => {
      setLoading(true)
      setError(null)

      try {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/v1/analyze/file", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
          throw new Error(errorData.detail || `HTTP ${response.status}`)
        }

        const result = await response.json()
        return result.results
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "File analysis failed"
        setError(errorMessage)
        toast({
          title: "File Analysis Failed",
          description: errorMessage,
          variant: "destructive",
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  return {
    analyzeSentiment,
    analyzeBatch,
    analyzeFile,
    loading,
    error,
  }
}
