"use client"

/**
 * Analysis history component
 */

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { History, Trash2, TrendingUp, TrendingDown, Clock, FileText } from "lucide-react"

import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import { useAnalysisHistory } from "@/hooks/useSentiment"

const AnalysisHistory: React.FC = () => {
  const { history, clearHistory, removeFromHistory } = useAnalysisHistory()

  const getSentimentColor = (label: string) => {
    return label === "positive" ? "text-green-600" : "text-red-600"
  }

  const getSentimentIcon = (label: string) => {
    return label === "positive" ? TrendingUp : TrendingDown
  }

  const getSentimentBg = (label: string) => {
    return label === "positive" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  if (history.length === 0) {
    return (
      <Card className="max-w-4xl mx-auto text-center py-12">
        <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analysis History</h3>
        <p className="text-gray-600">Your analysis history will appear here after you analyze some text.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center">
          <History className="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analysis History</h1>
            <p className="text-gray-600">{history.length} analysis results</p>
          </div>
        </div>

        <Button variant="outline" onClick={clearHistory} icon={<Trash2 className="w-4 h-4 bg-transparent" />}>
          Clear All
        </Button>
      </div>

      {/* History List */}
      <Card padding="none" className="max-w-4xl mx-auto">
        <div className="divide-y divide-gray-200">
          <AnimatePresence>
            {history.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-4">
                    <div className="flex items-center mb-2">
                      <FileText className="w-4 h-4 text-gray-400 mr-2" />
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimestamp(item.timestamp)}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3 line-clamp-3">{item.text}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${getSentimentBg(item.result.label)}`}
                    >
                      {React.createElement(getSentimentIcon(item.result.label), {
                        className: `w-4 h-4 ${getSentimentColor(item.result.label)}`,
                      })}
                      <div className="text-right">
                        <div className={`font-medium text-sm ${getSentimentColor(item.result.label)}`}>
                          {item.result.label.charAt(0).toUpperCase() + item.result.label.slice(1)}
                        </div>
                        <div className="text-xs text-gray-600">{(item.result.score * 100).toFixed(1)}%</div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromHistory(item.id)}
                      icon={<Trash2 className="w-4 h-4" />}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  )
}

export default AnalysisHistory
