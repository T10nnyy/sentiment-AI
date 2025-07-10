"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Cpu, HardDrive, Zap, RefreshCw, CheckCircle, AlertCircle, Info, Server, Clock, Database } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ModelInfo {
  name: string
  framework: string
  device: string
  load_time: number
  quantized: boolean
  parameters: number
  model_size_mb: number
}

export function ModelInfo() {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [reloading, setReloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchModelInfo = async () => {
    try {
      setError(null)
      const response = await fetch("/api/v1/model/info")

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setModelInfo(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch model info"
      setError(errorMessage)
      console.error("Failed to fetch model info:", err)
    } finally {
      setLoading(false)
    }
  }

  const reloadModel = async () => {
    setReloading(true)
    try {
      const response = await fetch("/api/v1/model/reload", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      toast({
        title: "Model Reloaded",
        description: "The sentiment analysis model has been successfully reloaded.",
      })

      // Refresh model info after reload
      await fetchModelInfo()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reload model"
      toast({
        title: "Reload Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setReloading(false)
    }
  }

  useEffect(() => {
    fetchModelInfo()
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
    return num.toString()
  }

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} GB`
    return `${bytes.toFixed(1)} MB`
  }

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "cuda":
        return <Zap className="h-4 w-4" />
      case "mps":
        return <Cpu className="h-4 w-4" />
      default:
        return <Server className="h-4 w-4" />
    }
  }

  const getDeviceColor = (device: string) => {
    switch (device.toLowerCase()) {
      case "cuda":
        return "bg-green-500"
      case "mps":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading model information...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <h3 className="font-medium text-red-600">Failed to Load Model Information</h3>
          </div>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={fetchModelInfo} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!modelInfo) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Model Information Available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">Unable to retrieve model information from the server.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Model Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Model Status
              </CardTitle>
              <CardDescription>Current model information and status</CardDescription>
            </div>
            <Button onClick={reloadModel} disabled={reloading} variant="outline">
              {reloading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Reloading...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Model
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Model Loaded
            </Badge>
            <Badge className={`${getDeviceColor(modelInfo.device)} text-white flex items-center gap-1`}>
              {getDeviceIcon(modelInfo.device)}
              {modelInfo.device.toUpperCase()}
            </Badge>
            {modelInfo.quantized && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <Zap className="h-3 w-3 mr-1" />
                Quantized
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Load Time:</span>
                <span className="font-medium">{modelInfo.load_time.toFixed(2)}s</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Framework:</span>
                <span className="font-medium capitalize">{modelInfo.framework}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Parameters:</span>
                <span className="font-medium">{formatNumber(modelInfo.parameters)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Model Size:</span>
                <span className="font-medium">{formatBytes(modelInfo.model_size_mb)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Model Details
          </CardTitle>
          <CardDescription>Detailed information about the sentiment analysis model</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Database className="h-4 w-4" />
              Model Information
            </h4>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Model Name:</span>
                <span className="font-mono text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                  {modelInfo.name}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Architecture:</span>
                <span className="font-medium">RoBERTa Large</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Task:</span>
                <span className="font-medium">Sentiment Classification</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Language:</span>
                <span className="font-medium">English</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Performance Metrics
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Model Size Efficiency</span>
                  <span>{((modelInfo.parameters / 1e6 / modelInfo.model_size_mb) * 100).toFixed(1)}%</span>
                </div>
                <Progress
                  value={Math.min((modelInfo.parameters / 1e6 / modelInfo.model_size_mb) * 100, 100)}
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Load Speed</span>
                  <span>{modelInfo.load_time < 10 ? "Fast" : modelInfo.load_time < 30 ? "Medium" : "Slow"}</span>
                </div>
                <Progress value={Math.max(0, 100 - modelInfo.load_time * 2)} className="h-2" />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Model Capabilities
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Sentiment Classes:</span>
                  <span className="font-medium">2 (Positive, Negative)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Max Input Length:</span>
                  <span className="font-medium">512 tokens</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Batch Processing:</span>
                  <span className="font-medium">✓ Supported</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Real-time Analysis:</span>
                  <span className="font-medium">✓ Supported</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
