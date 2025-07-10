"use client"

import { useState, useCallback } from "react"
import { api } from "@/lib/api"
import type { SentimentResult, BatchResult, AnalysisHistoryItem, ModelInfo } from "@/types/sentiment"

export function useSentiment() {
  const [loading, setLoading] = useState(false)

  const analyzeSentiment = useCallback(async (text: string): Promise<SentimentResult> => {
    setLoading(true)
    try {
      const response = await api.post("/analyze", { text })
      return response.data
    } finally {
      setLoading(false)
    }
  }, [])

  const analyzeBatch = useCallback(
    async (formData: FormData, onProgress?: (progress: number) => void): Promise<BatchResult> => {
      setLoading(true)
      try {
        const response = await api.post("/batch", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              onProgress(progress)
            }
          },
        })
        return response.data
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const getModelInfo = useCallback(async (): Promise<ModelInfo> => {
    const response = await api.get("/model/info")
    return response.data
  }, [])

  return {
    analyzeSentiment,
    analyzeBatch,
    getModelInfo,
    loading,
  }
}

export function useAnalysisHistory() {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([])
  const [loading, setLoading] = useState(false)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get("/history")
      setHistory(response.data)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearHistory = useCallback(async () => {
    await api.delete("/history")
    setHistory([])
  }, [])

  const deleteItem = useCallback(async (id: string) => {
    await api.delete(`/history/${id}`)
    setHistory((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const exportHistory = useCallback(async () => {
    const response = await api.get("/history/export", { responseType: "blob" })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "sentiment_history.csv")
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }, [])

  return {
    history,
    loading,
    fetchHistory,
    clearHistory,
    deleteItem,
    exportHistory,
  }
}
