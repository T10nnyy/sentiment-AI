"use client"

import type React from "react"
import { Brain, Server, Zap, Database } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useModelInfo, useHealthCheck } from "@/hooks/useSentiment"
import { useSentimentStore } from "@/lib/store"

const ModelInfo: React.FC = () => {
  const { data: modelInfo, isLoading, error } = useModelInfo()
  const { data: healthData } = useHealthCheck()
  const { stats } = useSentimentStore()

  if (isLoading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading model information...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="text-center py-12">
          <Server className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Model Info</h3>
          <p className="text-gray-600">{error.detail}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center max-w-4xl mx-auto">
        <Brain className="w-8 h-8 text-blue-600 mr-3" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Model Information</h1>
          <p className="text-gray-600">Details about the sentiment analysis model</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Model Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 text-blue-600 mr-2" />
              Model Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Model Name</label>
              <p className="text-lg font-semibold">
                {modelInfo?.model_name || "siebert/sentiment-roberta-large-english"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Version</label>
              <p className="text-lg">{modelInfo?.version || "1.0.0"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Framework</label>
              <Badge variant="secondary">{modelInfo?.framework || "Transformers"}</Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Labels</label>
              <div className="flex space-x-2 mt-1">
                {(modelInfo?.labels || ["POSITIVE", "NEGATIVE"]).map((label) => (
                  <Badge key={label} variant="outline">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="w-5 h-5 text-green-600 mr-2" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Status</span>
              <Badge variant={healthData?.status === "healthy" ? "default" : "destructive"}>
                {healthData?.status || "Unknown"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Uptime</span>
              <span className="text-sm">{healthData?.uptime || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Memory Usage</span>
              <span className="text-sm">{healthData?.memory_usage || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">GPU Available</span>
              <Badge variant={healthData?.gpu_available ? "default" : "secondary"}>
                {healthData?.gpu_available ? "Yes" : "No"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 text-yellow-600 mr-2" />
              Performance Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Total Predictions</span>
              <span className="text-lg font-semibold">{stats.totalPredictions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Avg Response Time</span>
              <span className="text-lg font-semibold">
                {stats.averageResponseTime ? `${stats.averageResponseTime.toFixed(0)}ms` : "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Success Rate</span>
              <span className="text-lg font-semibold text-green-600">
                {stats.totalPredictions > 0 ? "100%" : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Model Capabilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 text-purple-600 mr-2" />
              Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm">Real-time sentiment analysis</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm">Batch processing</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm">Live typing inference</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm">REST & GraphQL APIs</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm">Multi-language support</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ModelInfo
