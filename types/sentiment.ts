/**
 * TypeScript type definitions for sentiment analysis
 */

export interface SentimentResult {
  sentiment: string
  confidence: number
  scores?: {
    positive: number
    negative: number
    neutral: number
  }
  processing_time?: number
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
  name: string
  version: string
  type: string
  language: string
  accuracy: number
  f1_score: number
  parameters: string
  size: string
  description: string
  usage_stats?: {
    total_requests: number
    avg_response_time: number
    success_rate: number
    memory_usage: number
  }
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
  sentiment: string
  confidence: number
  timestamp: string
  scores?: {
    positive: number
    negative: number
    neutral: number
  }
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
  liveTypingConfig: LiveTypingConfig
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

export interface BatchResult {
  results: SentimentResult[]
  summary: {
    positive: number
    negative: number
    neutral: number
    total: number
  }
  processing_time: number
}

export interface LiveTypingConfig {
  enabled: boolean
  debounce_ms: number
  min_length: number
}
