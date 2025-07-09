import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { SentimentResult, AnalysisHistoryItem, PerformanceStats } from "@/types/sentiment"

interface SentimentStore {
  // UI State
  useGraphQL: boolean
  enableLiveTyping: boolean
  currentResult: SentimentResult | null
  isLoading: boolean
  error: string | null

  // History
  history: AnalysisHistoryItem[]

  // Performance Stats
  stats: PerformanceStats

  // Actions
  toggleGraphQL: () => void
  toggleLiveTyping: () => void
  setCurrentResult: (result: SentimentResult | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addToHistory: (text: string, result: SentimentResult) => void
  clearHistory: () => void
  removeFromHistory: (id: string) => void
  updateStats: (responseTime: number) => void
}

export const useSentimentStore = create<SentimentStore>()(
  persist(
    (set, get) => ({
      // Initial state
      useGraphQL: false,
      enableLiveTyping: process.env.NEXT_PUBLIC_ENABLE_LIVE_TYPING === "true",
      currentResult: null,
      isLoading: false,
      error: null,
      history: [],
      stats: {
        totalPredictions: 0,
        averageResponseTime: null,
        responseTimes: [],
      },

      // Actions
      toggleGraphQL: () => set((state) => ({ useGraphQL: !state.useGraphQL })),

      toggleLiveTyping: () => set((state) => ({ enableLiveTyping: !state.enableLiveTyping })),

      setCurrentResult: (result) => set({ currentResult: result }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      addToHistory: (text, result) => {
        const historyItem: AnalysisHistoryItem = {
          id: Date.now().toString(),
          text,
          result,
          timestamp: new Date(),
        }
        set((state) => ({
          history: [historyItem, ...state.history.slice(0, 99)], // Keep last 100 items
        }))
      },

      clearHistory: () => set({ history: [] }),

      removeFromHistory: (id) =>
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        })),

      updateStats: (responseTime) => {
        set((state) => {
          const newResponseTimes = [...state.stats.responseTimes, responseTime].slice(-100) // Keep last 100
          const averageResponseTime = newResponseTimes.reduce((a, b) => a + b, 0) / newResponseTimes.length

          return {
            stats: {
              totalPredictions: state.stats.totalPredictions + 1,
              averageResponseTime,
              responseTimes: newResponseTimes,
            },
          }
        })
      },
    }),
    {
      name: "sentiment-store",
      partialize: (state) => ({
        useGraphQL: state.useGraphQL,
        enableLiveTyping: state.enableLiveTyping,
        history: state.history,
        stats: state.stats,
      }),
    },
  ),
)
