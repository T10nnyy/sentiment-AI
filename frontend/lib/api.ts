/**
 * API client for sentiment analysis backend
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


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

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

// REST API Functions
export const restApi = {
  // Single prediction
  predict: async (request: PredictRequest): Promise<SentimentResult> => {
    const response: AxiosResponse<SentimentResult> = await apiClient.post("/api/predict", request)
    return response.data
  },

  // File analysis and model training
  analyzeFile: async (file: File): Promise<BatchPredictResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    
    // Create a new axios instance for file upload to avoid content-type issues
    const fileUploadClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 120000, // 2 minutes timeout for analysis
    })

    // Add request logging
    fileUploadClient.interceptors.request.use(
      (config) => {
        console.log(`File Upload Request: ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => Promise.reject(error)
    )

    // Add error handling
    fileUploadClient.interceptors.response.use(
      (response) => response,
      (error) => {
        const apiError: ApiError = {
          detail: error.response?.data?.detail || error.message || "File upload failed",
          status: error.response?.status,
        }
        return Promise.reject(apiError)
      }
    )
    
    const response: AxiosResponse<BatchPredictResponse> = await fileUploadClient.post("/api/analyze/file", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Batch prediction
  predictBatch: async (request: BatchPredictRequest): Promise<BatchPredictResponse> => {
    const response: AxiosResponse<BatchPredictResponse> = await apiClient.post("/api/predict/batch", request)
    return response.data
  },

  // Get model info
  getModelInfo: async (): Promise<ModelInfo> => {
    const response: AxiosResponse<ModelInfo> = await apiClient.get("/api/model/info")
    return response.data
  },

  // Health check
  healthCheck: async (): Promise<{ status: string; service: string }> => {
    const response = await apiClient.get("/api/health")
    return response.data
  },
}

// GraphQL API Functions
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

    return response.data.data!.predict
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

    return response.data.data!.batchPredict
  },

  // Get model info
  getModelInfo: async (): Promise<ModelInfo> => {
    const query = `
      query ModelInfo {
        modelInfo {
          name
          framework
          quantized
          device
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
