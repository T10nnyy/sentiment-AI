"use client"

/**
 * Model information component
 */

import type React from "react"
import { motion } from "framer-motion"
import { Zap, Database, Activity, CheckCircle, XCircle, Info } from "lucide-react"

import Card from "@/components/ui/Card"
import { useModelInfo, useHealthCheck } from "@/hooks/useSentiment"
import { useSentimentStore } from "@/lib/store"

const ModelInfo: React.FC = () => {
  const { useGraphQL } = useSentimentStore()
  const { data: modelInfo, isLoading: modelLoading, error: modelError } = useModelInfo()
  const { data: healthData, isLoading: healthLoading } = useHealthCheck()

  const getDeviceIcon = (device: string) => {
    if (device === "cuda") return "🚀"
    if (device === "mps") return "🍎"
    return "💻"
  }

  const getFrameworkColor = (framework: string) => {
    if (framework === "pytorch") return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30"
    if (framework === "tensorflow") return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
    return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center mb-4"
        >
          <Info className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Model Information</h1>
        </motion.div>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Current model configuration and system status information.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model Details */}
        <Card>
          <div className="flex items-center mb-4">
            <Database className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Model Details</h3>
          </div>

          {modelLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : modelError ? (
            <div className="text-red-600 dark:text-red-400 text-sm">Failed to load model information</div>
          ) : modelInfo ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Model Name:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{modelInfo.name}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Framework:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getFrameworkColor(modelInfo.framework)}`}
                >
                  {modelInfo.framework.charAt(0).toUpperCase() + modelInfo.framework.slice(1)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Device:</span>
                <div className="flex items-center">
                  <span className="mr-2">{getDeviceIcon(modelInfo.device)}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{modelInfo.device.toUpperCase()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Quantized:</span>
                <div className="flex items-center">
                  {modelInfo.quantized ? (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mr-1" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400 mr-1" />
                  )}
                  <span
                    className={`text-sm ${modelInfo.quantized ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}`}
                  >
                    {modelInfo.quantized ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">API Type:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    useGraphQL
                      ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30"
                      : "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30"
                  }`}
                >
                  {useGraphQL ? "GraphQL" : "REST"}
                </span>
              </div>
            </div>
          ) : null}
        </Card>

        {/* System Status */}
        <Card>
          <div className="flex items-center mb-4">
            <Activity className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">System Status</h3>
          </div>

          {healthLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : healthData ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Service Status:</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-green-600 dark:text-green-400 font-medium">Healthy</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Service Name:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{healthData.service}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Backend URL:</span>
                <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              <span className="text-red-600 dark:text-red-400">Service Unavailable</span>
            </div>
          )}
        </Card>
      </div>

      {/* Model Capabilities */}
      <Card className="max-w-4xl mx-auto">
        <div className="flex items-center mb-4">
          <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Model Capabilities</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🎯</span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">High Accuracy</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              RoBERTa-large model trained specifically for sentiment analysis
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">⚡</span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Fast Inference</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Optimized for quick response times with batch processing support
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🔄</span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Hot Reload</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Automatic model updates without service interruption
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ModelInfo
