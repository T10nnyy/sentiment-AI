class ApiClient {
  private baseUrl: string

  constructor(baseUrl = "http://localhost:8000") {
    this.baseUrl = baseUrl
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`API Error for ${url}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API Error for ${url}:`, error)
      throw error
    }
  }

  async analyzeSentiment(text: string) {
    return this.request("/api/predict", {
      method: "POST",
      body: JSON.stringify({ text }),
    })
  }

  async analyzeBatch(texts: string[]) {
    return this.request("/api/predict/batch", {
      method: "POST",
      body: JSON.stringify({ texts }),
    })
  }

  async analyzeFile(file: File) {
    const formData = new FormData()
    formData.append("file", file)

    return this.request("/api/analyze/file", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    })
  }

  async getModelInfo() {
    return this.request("/api/model/info")
  }

  async getHealth() {
    return this.request("/api/health")
  }
}

export const api = new ApiClient()
