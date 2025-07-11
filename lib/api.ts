/**
 * API client for sentiment analysis backend - Vercel optimized
 */

import axios, { type AxiosResponse } from "axios"
import type {
  SentimentResult,
  PredictRequest,
  BatchPredictRequest,
  BatchPredictResponse,
  ModelInfo,
  ApiError,
  GraphQLResponse,
  GraphQLPredictResponse,
  GraphQLBatchPredictResponse,
  GraphQLModelInfoResponse,
} from "@/types/sentiment"

// Dynamic API base URL for Vercel deployment
const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Client-side
    return (
      process.env.NEXT_PUBLIC_API_URL ||
      (window.location.hostname.includes("vercel.app")
        ? `https://${window.location.hostname}`
        : "http://localhost:8000")
    )
  } else {
    // Server-side
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  }
}

const API_BASE_URL = getApiBaseUrl()

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const apiError: ApiError = {
      detail: error.response?.data?.detail || error.message || "An error occurred",
      status: error.response?.status,
    }
    return Promise.reject(apiError)
  },
)

// REST API Functions - Updated for Vercel deployment
export const restApi = {
  // Single prediction - supports both /predict and /api/predict
  predict: async (request: PredictRequest): Promise<SentimentResult> => {
    try {
      const response: AxiosResponse<SentimentResult> = await apiClient.post("/api/predict", request)
      return response.data
    } catch (error) {
      // Fallback to /predict route
      const response: AxiosResponse<SentimentResult> = await apiClient.post("/predict", request)
      return response.data
    }
  },

  // Batch prediction - supports both routes
  predictBatch: async (request: BatchPredictRequest): Promise<BatchPredictResponse> => {
    try {
      const response: AxiosResponse<BatchPredictResponse> = await apiClient.post("/api/predict/batch", request)
      return response.data
    } catch (error) {
      // Fallback to /predict/batch route
      const response: AxiosResponse<BatchPredictResponse> = await apiClient.post("/predict/batch", request)
      return response.data
    }
  },

  // File analysis - supports both routes
  analyzeFile: async (file: File): Promise<BatchPredictResponse> => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response: AxiosResponse<BatchPredictResponse> = await apiClient.post("/api/analyze/file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      // Fallback to /analyze/file route
      const response: AxiosResponse<BatchPredictResponse> = await apiClient.post("/analyze/file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    }
  },

  // Get model info - supports both routes
  getModelInfo: async (): Promise<ModelInfo> => {
    try {
      const response: AxiosResponse<ModelInfo> = await apiClient.get("/api/model/info")
      return response.data
    } catch (error) {
      // Fallback to /model/info route
      const response: AxiosResponse<ModelInfo> = await apiClient.get("/model/info")
      return response.data
    }
  },

  // Health check - supports both routes
  healthCheck: async (): Promise<{ status: string; service: string }> => {
    try {
      const response = await apiClient.get("/api/health")
      return response.data
    } catch (error) {
      // Fallback to /health route
      const response = await apiClient.get("/health")
      return response.data
    }
  },
}

// GraphQL API Functions - Updated for Vercel
export const graphqlApi = {
  // Single prediction
  predict: async (text: string): Promise<SentimentResult> => {
    const query = `
      query Predict($text: String!) {
        predict(text: $text) {
          label
          score
        }
      }
    `

    const response: AxiosResponse<GraphQLResponse<GraphQLPredictResponse>> = await apiClient.post("/graphql", {
      query,
      variables: { text },
    })

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message)
    }

    return {
      text,
      sentiment: response.data.data!.predict,
      confidence: response.data.data!.predict.score,
      processing_time: 0,
      scores: {
        [response.data.data!.predict.label.toLowerCase()]: response.data.data!.predict.score,
      },
    }
  },

  // Batch prediction
  predictBatch: async (texts: string[]): Promise<SentimentResult[]> => {
    const query = `
      query BatchPredict($texts: [String!]!) {
        batchPredict(texts: $texts) {
          label
          score
        }
      }
    `

    const response: AxiosResponse<GraphQLResponse<GraphQLBatchPredictResponse>> = await apiClient.post("/graphql", {
      query,
      variables: { texts },
    })

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message)
    }

    return response.data.data!.batchPredict.map((result, index) => ({
      text: texts[index],
      sentiment: result,
      confidence: result.score,
      processing_time: 0,
      scores: {
        [result.label.toLowerCase()]: result.score,
      },
    }))
  },

  // Get model info
  getModelInfo: async (): Promise<ModelInfo> => {
    const query = `
      query ModelInfo {
        modelInfo {
          name
          framework
          device
          quantized
          version
        }
      }
    `

    const response: AxiosResponse<GraphQLResponse<GraphQLModelInfoResponse>> = await apiClient.post("/graphql", {
      query,
    })

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message)
    }

    return response.data.data!.modelInfo
  },
}

// Default export uses REST API
export default restApi

// Named export for compatibility
