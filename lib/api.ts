import type {
  SentimentResult,
  BatchPredictionRequest,
  BatchPredictionResponse,
  PredictionRequest,
  ModelInfo,
  HealthCheck,
} from "@/types/sentiment"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

class RestApi {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Request failed" }))
      throw {
        detail: errorData.detail || `HTTP ${response.status}`,
        status: response.status,
      }
    }

    return response.json()
  }

  async predict(data: PredictionRequest): Promise<SentimentResult> {
    return this.request<SentimentResult>("/predict", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async predictBatch(data: BatchPredictionRequest): Promise<BatchPredictionResponse> {
    return this.request<BatchPredictionResponse>("/predict/batch", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getModelInfo(): Promise<ModelInfo> {
    return this.request<ModelInfo>("/model/info")
  }

  async healthCheck(): Promise<HealthCheck> {
    return this.request<HealthCheck>("/health")
  }
}

export const restApi = new RestApi()
