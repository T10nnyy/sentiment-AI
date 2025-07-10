"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Brain, Cpu, Zap, CheckCircle, AlertCircle, RefreshCw, Info, Server, Clock } from "lucide-react"
import { api } from "@/lib/api"
import type { ModelInfoType, HealthStatus } from "@/lib/api"

export default function ModelInfoComponent() {
  const [modelInfo, setModelInfo] = useState<ModelInfoType | null>(null)
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInfo = async () => {
    setLoading(true)
    setError(null)

    try {
      const [model, health] = await Promise.all([api.getModelInfo(), api.healthCheck()])
      setModelInfo(model)
      setHealthStatus(health)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch model information")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInfo()
  }, [])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Loading model information...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-4">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Failed to Load Model Information</span>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={fetchInfo} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Health Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                Service Status
              </CardTitle>
              <CardDescription>Current status of the sentiment analysis service</CardDescription>
            </div>
            <Button variant="outline" onClick={fetchInfo}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {healthStatus && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                <div
                  className={`w-3 h-3 rounded-full ${
                    healthStatus.status === "healthy" ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <div>
                  <p className="font-medium">Service Status</p>
                  <p className="text-sm text-muted-foreground capitalize">{healthStatus.status}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${healthStatus.model_loaded ? "bg-green-500" : "bg-red-500"}`} />
                <div>
                  <p className="font-medium">Model Status</p>
                  <p className="text-sm text-muted-foreground">{healthStatus.model_loaded ? "Loaded" : "Not Loaded"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                <Clock className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="font-medium">Last Check</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(healthStatus.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Model Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Model Information
          </CardTitle>
          <CardDescription>Details about the sentiment analysis model</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {modelInfo && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Model Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Name:</span>
                        <span className="text-sm font-medium">{modelInfo.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Framework:</span>
                        <Badge variant="secondary">{modelInfo.framework}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Version:</span>
                        <span className="text-sm font-medium">{modelInfo.version}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Device:</span>
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4" />
                          <span className="text-sm font-medium">{modelInfo.device}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Quantized:</span>
                        <div className="flex items-center gap-2">
                          {modelInfo.quantized ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="text-sm font-medium">{modelInfo.quantized ? "Yes" : "No"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Model Capabilities</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Zap className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Real-time Analysis</p>
                      <p className="text-sm text-muted-foreground">Instant sentiment detection</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium">Batch Processing</p>
                      <p className="text-sm text-muted-foreground">Multiple texts at once</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Brain className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="font-medium">High Accuracy</p>
                      <p className="text-sm text-muted-foreground">State-of-the-art RoBERTa model</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <Info className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="font-medium">Confidence Scores</p>
                      <p className="text-sm text-muted-foreground">Detailed prediction confidence</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Technical Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Specifications</CardTitle>
          <CardDescription>Detailed technical information about the model</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Model Architecture</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• RoBERTa (Robustly Optimized BERT Pretraining Approach)</li>
                  <li>• Large model variant with 355M parameters</li>
                  <li>• Fine-tuned specifically for English sentiment analysis</li>
                  <li>• Transformer-based architecture with attention mechanism</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-3">Performance Metrics</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• High accuracy on sentiment classification tasks</li>
                  <li>• Optimized for both positive and negative sentiment detection</li>
                  <li>• Fast inference with sub-second response times</li>
                  <li>• Supports batch processing for efficiency</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
