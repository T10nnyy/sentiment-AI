"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Info, RefreshCw, CheckCircle, XCircle } from "lucide-react"
import { useSentiment } from "@/hooks/useSentiment"

export function ModelInfo() {
  const [modelInfo, setModelInfo] = useState<any>(null)
  const [healthStatus, setHealthStatus] = useState<any>(null)
  const { loading, getModelInfo, getHealth } = useSentiment()

  const fetchInfo = async () => {
    const [info, health] = await Promise.all([getModelInfo(), getHealth()])

    if (info) setModelInfo(info)
    if (health) setHealthStatus(health)
  }

  useEffect(() => {
    fetchInfo()
  }, [])

  const getStatusColor = (status: string) => {
    return status === "healthy"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200"
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Model Information
        </CardTitle>
        <CardDescription>Current model status and configuration details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <div className="flex items-center gap-2">
            {healthStatus && (
              <>
                <Badge className={getStatusColor(healthStatus.status)}>{healthStatus.status}</Badge>
                {healthStatus.model_loaded ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </>
            )}
          </div>
        </div>

        {modelInfo && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Model:</span>
              <span className="text-sm font-mono">{modelInfo.name}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Framework:</span>
              <span className="text-sm">{modelInfo.framework}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Device:</span>
              <Badge variant="outline">{modelInfo.device}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Quantized:</span>
              <Badge variant={modelInfo.quantized ? "default" : "secondary"}>
                {modelInfo.quantized ? "Yes" : "No"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Version:</span>
              <span className="text-sm font-mono">{modelInfo.version}</span>
            </div>
          </>
        )}

        {healthStatus && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Last Check:</span>
            <span className="text-xs text-gray-500">{new Date(healthStatus.timestamp).toLocaleString()}</span>
          </div>
        )}

        <Button onClick={fetchInfo} disabled={loading} variant="outline" className="w-full bg-transparent">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Status
        </Button>
      </CardContent>
    </Card>
  )
}
