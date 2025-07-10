"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useSentiment } from "@/hooks/useSentiment"
import { Brain, Server, Zap, RefreshCw, ExternalLink } from "lucide-react"
import type { ModelInfo as ModelInfoType } from "@/types/sentiment"

export default function ModelInfo() {
  const [modelInfo, setModelInfo] = useState<ModelInfoType | null>(null)
  const [loading, setLoading] = useState(true)
  const { getModelInfo } = useSentiment()

  const fetchModelInfo = async () => {
    setLoading(true)
    try {
      const info = await getModelInfo()
      setModelInfo(info)
    } catch (error) {
      console.error("Failed to fetch model info:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModelInfo()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading model information...</p>
        </div>
      </div>
    )
  }

  if (!modelInfo) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Server className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-muted-foreground mb-4">Failed to load model information</p>
          <Button onClick={fetchModelInfo}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Model Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Model Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-mono">{modelInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version:</span>
                  <span>{modelInfo.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline">{modelInfo.type}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language:</span>
                  <span>{modelInfo.language}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Performance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Accuracy:</span>
                  <span>{(modelInfo.accuracy * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">F1 Score:</span>
                  <span>{modelInfo.f1_score.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Parameters:</span>
                  <span>{modelInfo.parameters}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span>{modelInfo.size}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">{modelInfo.description}</p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">Model Ready</span>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href={`https://huggingface.co/${modelInfo.name}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Hugging Face
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{modelInfo.usage_stats?.total_requests || 0}</div>
              <div className="text-sm text-muted-foreground">Total Requests</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{modelInfo.usage_stats?.avg_response_time || 0}ms</div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {((modelInfo.usage_stats?.success_rate || 0) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>

          {modelInfo.usage_stats?.memory_usage && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm text-muted-foreground">{modelInfo.usage_stats.memory_usage}%</span>
              </div>
              <Progress value={modelInfo.usage_stats.memory_usage} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
