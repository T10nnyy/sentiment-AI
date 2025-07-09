/**
 * TypeScript type definitions for sentiment analysis
 */

export interface SentimentResult {
  label: string
  score: number
  processing_time?: number
  confidence?: number
  responseTime?: number
  timestamp?: string
  text?: string
  metadata?: {
    modelName?: string
    framework?: string
    device?: string
  }
}

export interface BatchSentimentRequest {
  texts: string[]
  model_name?: string
}

export interface BatchSentimentResponse {
  results: SentimentResult[]
  total_processing_time: number
  model_name: string
}

export interface SentimentRequest {
  text: string
  model_name?: string
}

export interface ModelInfo {
  model_name: string
  version: string
  framework: string
  labels: string[]
  max_length: number
  description?: string
  quantized: boolean
  device: string
  loadTime?: number
}

export interface ApiError {
  detail: string
  status?: number
}

export interface BatchAnalysisResult {
  id: string
  results: SentimentResult[]
  totalProcessed: number
  averageScore: number
  positiveCount: number
  negativeCount: number
  processingTime: number
  timestamp: string
}

export interface AnalysisHistoryItem {
  id: string
  text: string
  result: SentimentResult
  timestamp: Date
}

export interface SentimentStats {
  totalAnalyses: number
  averageResponseTime: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{ message: string }>
}

export interface GraphQLSentimentResponse {
  analyzeSentiment: SentimentResult
}

export interface GraphQLPredictResponse {
  predict: SentimentResult
}

export interface GraphQLBatchPredictResponse {
  batchPredict: SentimentResult[]
}

export interface GraphQLModelResponse {
  modelInfo: ModelInfo
}

export interface GraphQLModelInfoResponse {
  modelInfo: ModelInfo
}

export interface SentimentStore {
  // State
  currentText: string
  currentResult: SentimentResult | null
  isLoading: boolean
  error: string | null
  history: AnalysisHistoryItem[]
  stats: PerformanceStats

  // Settings
  useGraphQL: boolean
  enableLiveTyping: boolean
  theme: "light" | "dark"

  // Actions
  setCurrentText: (text: string) => void
  setCurrentResult: (result: SentimentResult | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addToHistory: (text: string, result: SentimentResult) => void
  clearHistory: () => void
  removeFromHistory: (id: string) => void
  updateStats: (responseTime: number) => void
  toggleGraphQL: () => void
  toggleLiveTyping: () => void
  setTheme: (theme: "light" | "dark") => void
  reset: () => void
}

export interface HealthStatus {
  status: string
  uptime: string
  memory_usage: string
  gpu_available: boolean
  model_loaded: boolean
}

export interface PredictRequest {
  text: string
  batch?: boolean
}

export interface BatchPredictRequest {
  texts: string[]
}

export interface BatchPredictResponse {
  results: SentimentResult[]
  processing_time: number
}

export interface BatchAnalysisRequest {
  texts: string[]
  useBatch?: boolean
}

export interface BatchAnalysisResponse {
  results: SentimentResult[]
  totalTime: number
  averageTime: number
}

export interface PerformanceStats {
  totalPredictions: number
  averageResponseTime: number | null
  responseTimes: number[]
}
