/**
 * TypeScript type definitions for sentiment analysis
 */

export interface SentimentResult {
  text: string
  sentiment: string
  confidence: number
  scores?: {
    positive?: number
    negative?: number
    [key: string]: number | undefined
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
  framework: string
  device: string
  load_time: number
  quantized: boolean
  parameters: number
  model_size_mb: number
  description?: string
  labels?: string[]
  performance?: {
    accuracy: number
    f1_score: number
    inference_time: number
  }
  training_info?: {
    dataset: string
    languages: string[]
  }
  config?: {
    max_length: number
    batch_size: number
    hot_reload: boolean
  }
}

export interface ApiError {
  detail: string
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
  label: string
  score: number
  timestamp: number
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
  model_loaded: boolean
  model_info: ModelInfo
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
}

export interface BatchAnalysisResponse {
  results: SentimentResult[]
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
