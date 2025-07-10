const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface SentimentResult {
  text: string
  sentiment: {
    label: string
    score: number
  }
  confidence: number
  processing_time: number
  scores?: Record<string, number>
}

export interface BatchSentimentResult {
  results: SentimentResult[]
  total_processing_time: number
  average_processing_time: number
}

export interface ModelInfo {
  name: string
  framework: string
  device: string
  quantized: boolean
  version: string
}

export interface HealthStatus {
  status: string
  service: string
  model_loaded: boolean
  timestamp: string
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      console.log(`API Request: ${config.method || "GET"} ${url}`)

      const response = await fetch(url, config)

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`

        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.detail || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log(`API Response:`, data)
      return data
    } catch (error) {
      console.error(`API Error for ${url}:`, error)
      throw error
    }
  }

  async analyzeSentiment(text: string): Promise<SentimentResult> {
    return this.request<SentimentResult>("/api/predict", {
      method: "POST",
      body: JSON.stringify({ text }),
    })
  }

  async analyzeBatch(texts: string[]): Promise<BatchSentimentResult> {
    return this.request<BatchSentimentResult>("/api/predict/batch", {
      method: "POST",
      body: JSON.stringify({ texts }),
    })
  }

  async analyzeFile(file: File): Promise<BatchSentimentResult> {
    const formData = new FormData()
    formData.append("file", file)

    return this.request<BatchSentimentResult>("/api/analyze/file", {
      method: "POST",
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    })
  }

  async getModelInfo(): Promise<ModelInfo> {
    return this.request<ModelInfo>("/api/model/info")
  }

  async healthCheck(): Promise<HealthStatus> {
    return this.request<HealthStatus>("/api/health")
  }
}

export const api = new ApiClient(API_BASE_URL)
export default api
