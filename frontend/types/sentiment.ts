/**
 * TypeScript types for sentiment analysis
 */

export interface SentimentResult {
  label: "positive" | "negative"
  score: number
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
}

export interface ModelInfo {
  name: string
  framework: string
  quantized: boolean
  device: string
}

export interface AnalysisHistory {
  id: string
  text: string
  result: SentimentResult
  timestamp: Date
}

export interface ApiError {
  detail: string
  status?: number
}

// GraphQL Types
export interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{
    message: string
    locations?: Array<{
      line: number
      column: number
    }>
    path?: string[]
  }>
}

export interface GraphQLPredictResponse {
  predict: SentimentResult
}

export interface GraphQLBatchPredictResponse {
  batchPredict: SentimentResult[]
}

export interface GraphQLModelInfoResponse {
  modelInfo: ModelInfo
}
