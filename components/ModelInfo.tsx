"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Info, RefreshCw, CheckCircle, XCircle, Cpu, Zap } from "lucide-react"
import { useModelInfo, useHealthCheck } from "@/hooks/useSentiment"

export default function ModelInfo() {
  const { modelInfo, loading: modelLoading, error: modelError, fetchModelInfo } = useModelInfo()
  const { health, loading: healthLoading, error: healthError, checkHealth } = useHealthCheck()

  useEffect(() => {
    fetchModelInfo()
    checkHealth()
  }, [fetchModelInfo, checkHealth])

  const handleRefresh = () => {
    fetchModelInfo()
    checkHealth()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Model Information
              </CardTitle>
              <CardDescription>Details about the sentiment analysis model and system status</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={modelLoading || healthLoading}>
              {modelLoading || healthLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Health Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Zap className="h-5 w-5" />
              System Health
            </h3>

            {healthLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking system health...
              </div>
            ) : healthError ? (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{healthError}</div>
            ) : health ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Service Status</label>
                  <div className="flex items-center gap-2">
                    {health.status === "healthy" ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <Badge variant={health.status === "healthy" ? "default" : "destructive"}>{health.status}</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Service Name</label>
                  <div className="text-sm font-medium">{health.service}</div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Model Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
              <Cpu className="h-5 w-5" />
              Model Details
            </h3>

            {modelLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading model information...
              </div>
            ) : modelError ? (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{modelError}</div>
            ) : modelInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Model Name</label>
                    <div className="text-sm font-medium">{modelInfo.name}</div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Framework</label>
                    <Badge variant="outline">{modelInfo.framework}</Badge>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Version</label>
                    <div className="text-sm font-medium">{modelInfo.version}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Device</label>
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4" />
                      <Badge variant={modelInfo.device === "cuda" ? "default" : "secondary"}>
                        {modelInfo.device.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Quantized</label>
                    <Badge variant={modelInfo.quantized ? "default" : "secondary"}>
                      {modelInfo.quantized ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Model Description */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">About This Model</h3>
            <div className="prose prose-sm max-w-none text-gray-600">
              <p>
                This sentiment analysis model is based on Cardiff NLP's Twitter RoBERTa model, specifically trained for
                sentiment classification. It's optimized for social media text and provides reliable sentiment
                predictions with confidence scores.
              </p>
              <ul className="mt-4 space-y-1">
                <li>• Trained on Twitter data for social media sentiment analysis</li>
                <li>• Supports three sentiment classes: Positive, Negative, and Neutral</li>
                <li>• Optimized for deployment on Vercel with reduced memory footprint</li>
                <li>• Provides confidence scores for all predictions</li>
                <li>• Supports both single text and batch processing</li>
              </ul>
            </div>
          </div>

          {/* Performance Notes */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Performance Notes</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">Vercel Deployment Optimizations:</p>
                  <ul className="space-y-1">
                    <li>• Model size reduced for faster cold starts</li>
                    <li>• Batch processing limited to 50 texts maximum</li>
                    <li>• CPU-only inference for consistent performance</li>
                    <li>• Automatic memory management for serverless functions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
