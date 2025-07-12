import { create } from 'zustand'
import type { SentimentResult, ApiError } from '@/types/sentiment'

interface SentimentState {
  useGraphQL: boolean
  enableLiveTyping: boolean
  currentResult: SentimentResult | null
  loading: boolean
  error: string | null
  history: Array<{ text: string; result: SentimentResult }>
  stats: { responseTime: number; count: number }
  setCurrentResult: (result: SentimentResult | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addToHistory: (text: string, result: SentimentResult) => void
  clearHistory: () => void
  removeFromHistory: (index: number) => void
  updateStats: (responseTime: number) => void
}

export const useSentimentStore = create<SentimentState>((set) => ({
  useGraphQL: false,
  enableLiveTyping: true,
  currentResult: null,
  loading: false,
  error: null,
  history: [],
  stats: { responseTime: 0, count: 0 },
  setCurrentResult: (result) => set({ currentResult: result }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  addToHistory: (text, result) =>
    set((state) => ({ history: [...state.history, { text, result }] })),
  clearHistory: () => set({ history: [] }),
  removeFromHistory: (index) =>
    set((state) => ({
      history: state.history.filter((_, i) => i !== index),
    })),
  updateStats: (responseTime) =>
    set((state) => ({
      stats: {
        responseTime: (state.stats.responseTime * state.stats.count + responseTime) / (state.stats.count + 1),
        count: state.stats.count + 1,
      },
    })),
}))