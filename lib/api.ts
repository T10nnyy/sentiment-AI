import axios from "axios"
import type {
  SentimentResult,
  BatchPredictionRequest,
  BatchPredictionResponse,
  PredictionRequest,
  ModelInfo,
  HealthCheck,
} from "@/types/sentiment"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("auth_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("auth_token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

class RestApi {
  private async request<T>(endpoint: string, options?: any): Promise<T> {
    const response = await api.request<T>({
      url: endpoint,
      method: options?.method,
      data: options?.body,
      ...options,
    })

    if (!response.status) {
      const errorData = response.data || { detail: "Request failed" }
      throw {
        detail: errorData.detail || `HTTP ${response.status}`,
        status: response.status,
      }
    }

    return response.data
  }

  async predict(data: PredictionRequest): Promise<SentimentResult> {
    return this.request<SentimentResult>("/predict", {
      method: "POST",
      body: data,
    })
  }

  async predictBatch(data: BatchPredictionRequest): Promise<BatchPredictionResponse> {
    return this.request<BatchPredictionResponse>("/predict/batch", {
      method: "POST",
      body: data,
    })
  }

  async getModelInfo(): Promise<ModelInfo> {
    return this.request<ModelInfo>("/model/info")
  }

  async healthCheck(): Promise<HealthCheck> {
    return this.request<HealthCheck>("/health")
  }
}

// Exporting the instance of RestApi
export const restApi = new RestApi()
