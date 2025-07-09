"use client"

/**
 * Enhanced sentiment analysis hooks with GraphQL and live typing support
 */

import { useState, useCallback, useRef, useEffect } from "react"
import { useQuery, useMutation } from "react-query"
import { apolloClient, PREDICT_SENTIMENT, BATCH_PREDICT_SENTIMENT, GET_MODEL_INFO } from "@/lib/apollo"
import { restApi } from "@/lib/api"
import { useSentimentStore } from "@/lib/store"
import { useDebouncedCallback } from "./useDebounce"
import { getDebounceDelay } from "@/lib/utils"
import type { SentimentResult, ModelInfo, ApiError } from "@/types/sentiment"
import toast from "react-hot-toast"

// Enhanced hook for single prediction with live typing support
export const useSentimentPrediction = () => {
  const { useGraphQL, enableLiveTyping, setCurrentResult, setLoading, setError, addToHistory, updateStats } =
    useSentimentStore()

  const [liveResult, setLiveResult] = useState<SentimentResult | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Main prediction mutation
  const prediction = useMutation<SentimentResult, ApiError, string>(
    async (text: string) => {
      const startTime = Date.now()

      try {
        let result: SentimentResult

        if (useGraphQL) {
          const response = await apolloClient.query({
            query: PREDICT_SENTIMENT,
            variables: { text },
            fetchPolicy: "no-cache",
          })
          result = response.data.predict
        } else {
          result = await restApi.predict({ text })
        }

        const responseTime = Date.now() - startTime
        updateStats(responseTime)

        return result
      } catch (error: any) {
        throw {
          detail: error.message || "Prediction failed",
          status: error.status,
        }
      }
    },
    {
      onSuccess: (result, text) => {
        setCurrentResult(result)
        addToHistory(text, result)
        setError(null)
        toast.success("Analysis completed!")
      },
      onError: (error) => {
        setError(error.detail)
        toast.error(`Prediction failed: ${error.detail}`)
      },
      onSettled: () => {
        setLoading(false)
      },
    },
  )

  // Live typing prediction with debounce
  const debouncedLivePredict = useDebouncedCallback(async (text: string) => {
    if (!text.trim() || !enableLiveTyping) {
      setLiveResult(null)
      return
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    try {
      let result: SentimentResult

      if (useGraphQL) {
        const response = await apolloClient.query({
          query: PREDICT_SENTIMENT,
          variables: { text },
          fetchPolicy: "no-cache",
          context: {
            fetchOptions: {
              signal: abortControllerRef.current.signal,
            },
          },
        })
        result = response.data.predict
      } else {
        result = await restApi.predict({ text })
      }

      setLiveResult(result)
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Live prediction error:", error)
      }
    }
  }, getDebounceDelay())

  const predict = useCallback(
    async (text: string) => {
      setLoading(true)
      setError(null)
      return prediction.mutateAsync(text)
    },
    [prediction, setLoading, setError],
  )

  const predictLive = useCallback(
    (text: string) => {
      debouncedLivePredict(text)
    },
    [debouncedLivePredict],
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    predict,
    predictLive,
    liveResult,
    isLoading: prediction.isLoading,
    error: prediction.error,
  }
}

// Enhanced batch prediction hook
export const useBatchPrediction = () => {
  const { useGraphQL, updateStats } = useSentimentStore()

  return useMutation<SentimentResult[], ApiError, string[]>(
    async (texts: string[]) => {
      const startTime = Date.now()

      try {
        let results: SentimentResult[]

        if (useGraphQL) {
          const response = await apolloClient.query({
            query: BATCH_PREDICT_SENTIMENT,
            variables: { texts },
            fetchPolicy: "no-cache",
          })
          results = response.data.batchPredict
        } else {
          const response = await restApi.predictBatch({ texts })
          results = response.results
        }

        const responseTime = Date.now() - startTime
        updateStats(responseTime)

        return results
      } catch (error: any) {
        throw {
          detail: error.message || "Batch prediction failed",
          status: error.status,
        }
      }
    },
    {
      onError: (error) => {
        toast.error(`Batch prediction failed: ${error.detail}`)
      },
    },
  )
}

// Enhanced model info hook with GraphQL support
export const useModelInfo = () => {
  const { useGraphQL } = useSentimentStore()

  return useQuery<ModelInfo, ApiError>(
    ["modelInfo", useGraphQL],
    async () => {
      if (useGraphQL) {
        const response = await apolloClient.query({
          query: GET_MODEL_INFO,
          fetchPolicy: "cache-first",
        })
        return response.data.modelInfo
      } else {
        return await restApi.getModelInfo()
      }
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      onError: (error) => {
        toast.error(`Failed to load model info: ${error.detail}`)
      },
    },
  )
}

// Hook for analysis history management
export const useAnalysisHistory = () => {
  const { history, clearHistory, removeFromHistory } = useSentimentStore()

  return {
    history,
    clearHistory,
    removeFromHistory,
  }
}

// Hook for health check with GraphQL fallback
export const useHealthCheck = () => {
  return useQuery("healthCheck", () => restApi.healthCheck(), {
    refetchInterval: 30000, // Check every 30 seconds
    retry: 3,
    staleTime: 10000, // 10 seconds
    onError: (error: any) => {
      console.error("Health check failed:", error)
    },
  })
}
